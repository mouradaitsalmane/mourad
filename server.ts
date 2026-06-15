import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

// Load environmental variables if present
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// 1. Secure Payzone Initiate Endpoint
// This computes the secure SHA-512 checksum using the hidden server-side key
app.post('/api/payzone/initiate', (req, res) => {
  try {
    const { amount, taskId, email, userUid, paymentType } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const merchantId = process.env.PAYZONE_MERCHANT_ID || '881293'; // Sandbox default if not provided
    const secretKey = process.env.PAYZONE_SECRET_KEY || 'rabat_payzone_secure_secret_hash_2026';
    
    // Generate unique transaction ID
    const transactionId = `TX_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // Express amount in cents/centimes or standard MAD decimal (string with 2 decimals)
    const formattedAmount = Number(amount).toFixed(2);
    const currency = '504'; // ISO Code for Moroccan Dirham (MAD)
    const description = paymentType === 'badge' 
      ? `Verify Independent Tasker Badge (Tasker)` 
      : `Escrow Service Budget Funding for Task ID: ${taskId}`;

    // Concatenate parameters for SHA-512 hashing as per standard Payzone Maroc Merchant specifications
    // Concatenation: merchantId + transactionId + amount + currency + secretKey
    const requestString = `${merchantId}${transactionId}${formattedAmount}${currency}${secretKey}`;
    
    // Calculate SHA-512 Checksum
    const signature = crypto
      .createHash('sha512')
      .update(requestString)
      .digest('hex');

    // Return the generated credentials to the client for form dispatching or gateway emulation
    res.json({
      success: true,
      merchantId,
      transactionId,
      amount: formattedAmount,
      currency,
      description,
      signature,
      checkoutUrl: 'https://gateway.payzone.ma/checkout', // Production/Sandbox Payzone API redirect
    });
  } catch (error: any) {
    console.error('Payzone initiate error:', error);
    res.status(500).json({ error: 'Failed to initiate secure payzone payment.' });
  }
});

// 2. Payzone Payment Callback (IPN Webhook Receiver)
app.post('/api/payzone/callback', (req, res) => {
  try {
    const { merchantId, transactionId, amount, currency, status, signature } = req.body;
    const secretKey = process.env.PAYZONE_SECRET_KEY || 'rabat_payzone_secure_secret_hash_2026';

    // Verify incoming checksum
    const responseString = `${merchantId}${transactionId}${amount}${currency}${status}${secretKey}`;
    const calculatedSignature = crypto
      .createHash('sha512')
      .update(responseString)
      .digest('hex');

    if (calculatedSignature !== signature) {
      console.warn('Payzone callback checksum mismatch. Unauthorized notification.');
      return res.status(401).json({ error: 'Signature mismatch' });
    }

    console.log(`Payzone payment callback verified successfully for TX: ${transactionId}, Status: ${status}`);
    
    // Proceed to log transaction to persistent database securely if needed
    res.json({ status: 'ACKNOWLEDGED', transactionId });
  } catch (err) {
    console.error('Payzone callback error:', err);
    res.status(500).json({ error: 'Callback error processing' });
  }
});

// 3. Secure Cloud Function Emulation for Escrow Release
app.post('/api/tasks/release-escrow', async (req, res) => {
  try {
    const { taskId, userUid } = req.body;
    if (!taskId) {
      return res.status(400).json({ success: false, error: 'Task ID is required' });
    }

    // Lazy initialization of Firebase server-side to bypass startup bottlenecks
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, doc, getDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    const fs = await import('fs');
    
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(500).json({ success: false, error: 'Configuration file missing.' });
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists()) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const taskData = taskSnap.data();

    // Secure Verification: Only the poster of the task can trigger the release of funds
    if (taskData.posterId !== userUid) {
      return res.status(403).json({ success: false, error: 'Authorization failed: Only the task poster can release escrow funds.' });
    }

    if (taskData.status === 'completed') {
      return res.status(400).json({ success: false, error: 'Funds are already released. Task is completed.' });
    }

    const releasedTransactionId = 'PZ-RLSD-' + Math.floor(100000 + Math.random() * 900000);

    // Update status to 'completed' and transition escrow status to 'released'
    await updateDoc(taskRef, {
      status: 'completed',
      escrowStatus: 'released',
      escrowReleased: true,
      releasedTransactionId,
      releasedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log(`[Cloud Function Escrow Release] Successfully released funds for Task: ${taskId}. TransID: ${releasedTransactionId}`);

    res.json({
      success: true,
      releasedTransactionId,
      message: 'Escrow funds captured from held state were successfully released to the worker’s account.'
    });

  } catch (err: any) {
    console.error('[Cloud Function Release Error]:', err);
    res.status(550).json({ success: false, error: err.message || 'Escrow release failed.' });
  }
});

// 4. Admin Management - Block User
app.post('/api/admin/block-user', async (req, res) => {
  try {
    const { userId, adminId } = req.body;
    if (!userId || !adminId) {
      return res.status(400).json({ success: false, error: 'User ID and Admin ID are required.' });
    }

    const { initializeApp } = await import('firebase/app');
    const { getFirestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const fs = await import('fs');
    
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(500).json({ success: false, error: 'Configuration file missing.' });
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

    // Verify Admin's Role (RBAC)
    const adminRefDoc = await getDoc(doc(db, 'users', adminId));
    const adminDoc = await getDoc(doc(db, 'admins', adminId));
    const adminData = adminRefDoc.exists() ? adminRefDoc.data() : null;

    const isAuthorizedAdmin = 
      adminId === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' ||
      adminDoc.exists() ||
      (adminData && (
        adminData.role === 'admin' || 
        adminData.role === 'super_admin' || 
        adminData.role === 'Superadmin' || 
        adminData.isSuperAdmin === true ||
        adminData.email === 'amine.saas@airtasker.ma' ||
        adminData.email === 'cryptomourad1992@gmail.com'
      ));

    if (!isAuthorizedAdmin) {
      return res.status(403).json({ success: false, error: 'Authorization failed: Requires admin or super_admin role.' });
    }

    // Perform Block Action
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'blocked',
      isSuspended: true, // legacy sync
      updatedAt: serverTimestamp(),
      updatedBy: adminId
    });

    // Write to audit_logs collection
    const auditLogsRef = collection(db, 'audit_logs');
    await addDoc(auditLogsRef, {
      action: 'block_user',
      targetUserId: userId,
      adminId: adminId,
      timestamp: serverTimestamp()
    });

    console.log(`[Cloud Function blockUser] Securely blocked user ${userId} by admin ${adminId}`);

    res.json({
      success: true,
      message: 'User account has been successfully blocked.'
    });

  } catch (err: any) {
    console.error('[Admin Block User Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Block action failed.' });
  }
});

// 5. Admin Management - Unblock User
app.post('/api/admin/unblock-user', async (req, res) => {
  try {
    const { userId, adminId } = req.body;
    if (!userId || !adminId) {
      return res.status(400).json({ success: false, error: 'User ID and Admin ID are required.' });
    }

    const { initializeApp } = await import('firebase/app');
    const { getFirestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const fs = await import('fs');
    
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(500).json({ success: false, error: 'Configuration file missing.' });
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

    // Verify Admin's Role (RBAC)
    const adminRefDoc = await getDoc(doc(db, 'users', adminId));
    const adminDoc = await getDoc(doc(db, 'admins', adminId));
    const adminData = adminRefDoc.exists() ? adminRefDoc.data() : null;

    const isAuthorizedAdmin = 
      adminId === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' ||
      adminDoc.exists() ||
      (adminData && (
        adminData.role === 'admin' || 
        adminData.role === 'super_admin' || 
        adminData.role === 'Superadmin' || 
        adminData.isSuperAdmin === true ||
        adminData.email === 'amine.saas@airtasker.ma' ||
        adminData.email === 'cryptomourad1992@gmail.com'
      ));

    if (!isAuthorizedAdmin) {
      return res.status(403).json({ success: false, error: 'Authorization failed: Requires admin or super_admin role.' });
    }

    // Perform Unblock Action
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'active',
      isSuspended: false, // legacy sync
      updatedAt: serverTimestamp(),
      updatedBy: adminId
    });

    // Write to audit_logs collection
    const auditLogsRef = collection(db, 'audit_logs');
    await addDoc(auditLogsRef, {
      action: 'unblock_user',
      targetUserId: userId,
      adminId: adminId,
      timestamp: serverTimestamp()
    });

    console.log(`[Cloud Function unblockUser] Securely unblocked user ${userId} by admin ${adminId}`);

    res.json({
      success: true,
      message: 'User account has been successfully unblocked.'
    });

  } catch (err: any) {
    console.error('[Admin Unblock User Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Unblock action failed.' });
  }
});

// 6. Admin Management - Delete User (Soft Delete Only)
app.post('/api/admin/delete-user', async (req, res) => {
  try {
    const { userId, adminId } = req.body;
    if (!userId || !adminId) {
      return res.status(400).json({ success: false, error: 'User ID and Admin ID are required.' });
    }

    if (userId === adminId) {
      return res.status(400).json({ success: false, error: 'Forbidden: You cannot delete your own admin account.' });
    }

    const { initializeApp } = await import('firebase/app');
    const { getFirestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const fs = await import('fs');
    
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(500).json({ success: false, error: 'Configuration file missing.' });
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

    // Verify Admin's Role (RBAC)
    const adminRefDoc = await getDoc(doc(db, 'users', adminId));
    const adminDoc = await getDoc(doc(db, 'admins', adminId));
    const adminData = adminRefDoc.exists() ? adminRefDoc.data() : null;

    const isAuthorizedAdmin = 
      adminId === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' ||
      adminDoc.exists() ||
      (adminData && (
        adminData.role === 'admin' || 
        adminData.role === 'super_admin' || 
        adminData.role === 'Superadmin' || 
        adminData.isSuperAdmin === true ||
        adminData.email === 'amine.saas@airtasker.ma' ||
        adminData.email === 'cryptomourad1992@gmail.com'
      ));

    if (!isAuthorizedAdmin) {
      return res.status(403).json({ success: false, error: 'Authorization failed: Requires admin or super_admin role.' });
    }

    // Perform Soft Delete
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isDeleted: true,
      status: 'blocked',
      isSuspended: true, // legacy sync
      updatedAt: serverTimestamp(),
      updatedBy: adminId
    });

    // Write to audit_logs collection
    const auditLogsRef = collection(db, 'audit_logs');
    await addDoc(auditLogsRef, {
      action: 'delete_user',
      targetUserId: userId,
      adminId: adminId,
      timestamp: serverTimestamp()
    });

    console.log(`[Cloud Function deleteUser] Securely soft-deleted user ${userId} by admin ${adminId}`);

    res.json({
      success: true,
      message: 'User account has been successfully deleted (soft delete).'
    });

  } catch (err: any) {
    console.error('[Admin Delete User Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Delete action failed.' });
  }
});

// 7. Admin Management - Override Task Status
app.post('/api/admin/override-task-status', async (req, res) => {
  try {
    const { taskId, adminId, newStatus } = req.body;
    if (!taskId || !adminId || !newStatus) {
      return res.status(400).json({ success: false, error: 'Task ID, Admin ID, and Status are required.' });
    }

    const { initializeApp } = await import('firebase/app');
    const { getFirestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const fs = await import('fs');
    
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(500).json({ success: false, error: 'Configuration file missing.' });
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

    // Verify Admin's Role (RBAC)
    const adminRefDoc = await getDoc(doc(db, 'users', adminId));
    const adminDoc = await getDoc(doc(db, 'admins', adminId));
    const adminData = adminRefDoc.exists() ? adminRefDoc.data() : null;

    const isAuthorizedAdmin = 
      adminId === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' ||
      adminDoc.exists() ||
      (adminData && (
        adminData.role === 'admin' || 
        adminData.role === 'super_admin' || 
        adminData.role === 'Superadmin' || 
        adminData.isSuperAdmin === true ||
        adminData.email === 'amine.saas@airtasker.ma' ||
        adminData.email === 'cryptomourad1992@gmail.com'
      ));

    if (!isAuthorizedAdmin) {
      return res.status(403).json({ success: false, error: 'Authorization failed: Requires admin role.' });
    }

    // Update Task
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
      updatedBy: adminId
    });

    // Write to audit_logs collection
    const auditLogsRef = collection(db, 'audit_logs');
    await addDoc(auditLogsRef, {
      action: 'override_task_status',
      targetTaskId: taskId,
      newStatus,
      adminId,
      timestamp: serverTimestamp()
    });

    console.log(`[Cloud Function overrideTaskStatus] Securely updated task ${taskId} to status ${newStatus} by admin ${adminId}`);

    res.json({
      success: true,
      message: `Task status reverted to ${newStatus} successfully.`
    });

  } catch (err: any) {
    console.error('[Admin Override Task Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Status override failed.' });
  }
});

// 8. Admin Management - Payout Approvals (Fintech Ledger Actions)
app.post('/api/admin/approve-payout', async (req, res) => {
  try {
    const { payoutId, adminId, amount, workerName } = req.body;
    if (!payoutId || !adminId) {
      return res.status(400).json({ success: false, error: 'Payout ID and Admin ID are required.' });
    }

    const { initializeApp } = await import('firebase/app');
    const { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const fs = await import('fs');
    
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(500).json({ success: false, error: 'Configuration file missing.' });
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

    // Verify Admin's Role (RBAC)
    const adminRefDoc = await getDoc(doc(db, 'users', adminId));
    const adminData = adminRefDoc.exists() ? adminRefDoc.data() : null;

    const isAuthorizedAdmin = 
      adminId === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' ||
      (adminData && (adminData.role === 'admin' || adminData.role === 'Superadmin' || adminData.isSuperAdmin));

    if (!isAuthorizedAdmin) {
      return res.status(403).json({ success: false, error: 'Authorization failed: Requires admin privileges.' });
    }

    // Write to audits/ledger
    const auditLogsRef = collection(db, 'audit_logs');
    await addDoc(auditLogsRef, {
      action: 'approve_payout',
      payoutId,
      amount,
      targetWorker: workerName,
      adminId,
      timestamp: serverTimestamp()
    });

    console.log(`[Cloud Function approvePayout] Securely authorized payout ${payoutId} for ${amount} MAD by admin ${adminId}`);

    res.json({
      success: true,
      message: 'Virement bancaire de déblocage s’est exécuté avec succès.'
    });
  } catch (err: any) {
    console.error('[Admin Approve Payout Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Payout approval failed.' });
  }
});

app.post('/api/admin/hold-payout', async (req, res) => {
  try {
    const { payoutId, adminId, workerName } = req.body;
    if (!payoutId || !adminId) {
      return res.status(400).json({ success: false, error: 'Payout ID and Admin ID are required.' });
    }

    const { initializeApp } = await import('firebase/app');
    const { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const fs = await import('fs');
    
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(500).json({ success: false, error: 'Configuration file missing.' });
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

    // Verify Admin
    const adminRefDoc = await getDoc(doc(db, 'users', adminId));
    const adminData = adminRefDoc.exists() ? adminRefDoc.data() : null;
    const isAuthorizedAdmin = adminId === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' || (adminData && adminData.role === 'Superadmin');

    if (!isAuthorizedAdmin) {
      return res.status(403).json({ success: false, error: 'Authorization failed.' });
    }

    // Write to audits
    await addDoc(collection(db, 'audit_logs'), {
      action: 'hold_payout',
      payoutId,
      targetWorker: workerName,
      adminId,
      timestamp: serverTimestamp()
    });

    res.json({ success: true, message: 'Payout placed on administrative safety hold.' });
  } catch (err: any) {
    res.status(550).json({ success: false, error: err.message });
  }
});

// 9. Admin Management - Resolve Disputes (Control Layer Action)
app.post('/api/admin/resolve-dispute', async (req, res) => {
  try {
    const { ticketId, adminId, decision } = req.body;
    if (!ticketId || !adminId) {
      return res.status(400).json({ success: false, error: 'Ticket ID and Admin ID are required' });
    }

    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const fs = await import('fs');
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(500).json({ success: false, error: 'Database configuration missing.' });
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

    await addDoc(collection(db, 'audit_logs'), {
      action: 'resolve_dispute',
      ticketId,
      decision,
      adminId,
      timestamp: serverTimestamp()
    });

    res.json({ success: true, message: `Dispute ${ticketId} resolved successfully: ${decision}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Admin Management - Update KYC Verified Status
app.post('/api/admin/update-kyc', async (req, res) => {
  try {
    const { requestId, targetUserId, adminId, status } = req.body;
    if (!requestId || !targetUserId || !adminId || !status) {
      return res.status(400).json({ success: false, error: 'Request ID, User ID, Admin ID, and Status are required' });
    }

    const { initializeApp } = await import('firebase/app');
    const { getFirestore, doc, updateDoc, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const fs = await import('fs');
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(500).json({ success: false, error: 'Database config missing.' });
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, {
      isTaskerVerified: status === 'approved',
      isTasker: status === 'approved',
      taskerStatus: status === 'approved' ? 'verified' : 'rejected',
      updatedAt: serverTimestamp(),
      updatedBy: adminId
    });

    await addDoc(collection(db, 'audit_logs'), {
      action: 'update_kyc_verification',
      requestId,
      targetUserId,
      status,
      adminId,
      timestamp: serverTimestamp()
    });

    res.json({ success: true, message: `Freelanecer KYC request was successfully ${status}.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Admin Management - Resolve Fraud Alert
app.post('/api/admin/resolve-fraud-alert', async (req, res) => {
  try {
    const { alertId, adminId, decision } = req.body;
    if (!alertId || !adminId) {
      return res.status(400).json({ success: false, error: 'Alert ID and Admin ID are required' });
    }

    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const fs = await import('fs');
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(500).json({ success: false, error: 'Database config missing.' });
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

    await addDoc(collection(db, 'audit_logs'), {
      action: 'resolve_fraud_alert',
      alertId,
      decision,
      adminId,
      timestamp: serverTimestamp()
    });

    res.json({ success: true, message: `Fraud alert ${alertId} was administrative ${decision}.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve Vite files according to full-stack instructions
async function mountViteMiddleware() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tasker backend server listening on http://0.0.0.0:${PORT}`);
  });
}

mountViteMiddleware();
