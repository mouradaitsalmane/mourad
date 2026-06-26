import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

/**
 * Subscribe to all non-deleted profiles for admin user management
 */
export function subscribeToAdminUsers(
  callback: (users: UserProfile[]) => void,
  onError?: (err: any) => void
): () => void {
  const q = collection(db, 'users');
  const unsub = onSnapshot(
    q,
    (snap) => {
      const uList: UserProfile[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.isDeleted !== true) {
          uList.push({ uid: doc.id, ...data } as UserProfile);
        }
      });
      callback(uList);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Subscribe to all user verification/uploaded files for back-office audits
 */
export function subscribeToAdminFiles(
  callback: (files: any[]) => void,
  onError?: (err: any) => void
): () => void {
  const unsub = onSnapshot(
    collection(db, 'files'),
    (snap) => {
      const fList: any[] = [];
      snap.forEach((doc) => {
        fList.push({ id: doc.id, ...doc.data() });
      });
      callback(fList);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'files');
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Subscribe to automated safety system alerts
 */
export function subscribeToAdminFraud(
  callback: (alerts: any[]) => void,
  onError?: (err: any) => void
): () => void {
  const unsub = onSnapshot(
    collection(db, 'fraud_alerts'),
    (snap) => {
      const fAlertList: any[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        let formatedTime = 'Just now';
        if (d.createdAt) {
          const date = d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
          const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
          formatedTime = diffMin <= 1 ? 'Just now' : `${diffMin}m ago`;
        }
        fAlertList.push({ id: doc.id, ...d, time: formatedTime });
      });
      callback(fAlertList);
    },
    (err) => {
      console.error("Failed to listen to real-time fraud alerts in administration module:", err);
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Admin action block/unblock profile
 */
export async function adminBlockUserService(userId: string, adminId: string, suspend: boolean): Promise<any> {
  const endpoint = suspend ? '/api/admin/block-user' : '/api/admin/unblock-user';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, adminId })
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || `Failed to modify profile suspension state.`);
  }
  return resData;
}

/**
 * Admin action delete user profile record
 */
export async function adminDeleteUserService(userId: string, adminId: string): Promise<any> {
  const response = await fetch('/api/admin/delete-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, adminId })
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to delete user.');
  }
  return resData;
}

/**
 * Admin action override / force resolve task statuses
 */
export async function adminOverrideTaskStatusService(payload: {
  taskId: string;
  adminId: string;
  status: string;
}): Promise<any> {
  const response = await fetch('/api/admin/override-task-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to override task status.');
  }
  return resData;
}

/**
 * Admin action approve Kyc levels
 */
export async function adminUpdateKycService(payload: {
  userId: string;
  adminId: string;
  isVerified: boolean;
}): Promise<any> {
  const response = await fetch('/api/admin/update-kyc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to audit and update KYC status.');
  }
  return resData;
}

/**
 * Admin action approve payout
 */
export async function adminApprovePayoutService(payload: {
  payoutId: string;
  adminId: string;
  amount: number;
  workerName: string;
}): Promise<any> {
  const response = await fetch('/api/admin/approve-payout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to approve payout.');
  }
  return resData;
}

/**
 * Admin action hold payout under review
 */
export async function adminHoldPayoutService(payload: {
  payoutId: string;
  adminId: string;
  workerName: string;
}): Promise<any> {
  const response = await fetch('/api/admin/hold-payout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to hold payout.');
  }
  return resData;
}

/**
 * Admin action resolve mediator dispute
 */
export async function adminResolveDisputeService(payload: {
  taskId: string;
  adminId: string;
  outcome: 'refund' | 'pay_worker';
}): Promise<any> {
  const response = await fetch('/api/admin/resolve-dispute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to resolve mediator dispute.');
  }
  return resData;
}

/**
 * Admin action resolve security logs
 */
export async function adminResolveFraudAlertService(payload: {
  alertId: string;
  adminId: string;
}): Promise<any> {
  const response = await fetch('/api/admin/resolve-fraud-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to resolve fraud logs.');
  }
  return resData;
}

/**
 * Direct Admin action to update any user's profile elements (DB update)
 */
export async function adminUpdateUserProfileService(userId: string, updatedData: any): Promise<void> {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, updatedData);
}

/**
 * Direct Admin action to delete any task permanently
 */
export async function adminDeleteTaskService(taskId: string): Promise<void> {
  const docRef = doc(db, 'tasks', taskId);
  await deleteDoc(docRef);
}

