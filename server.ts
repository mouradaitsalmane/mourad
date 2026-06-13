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
      ? `Verify Independent Tasker Badge (RabatTasker)` 
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
    console.log(`RabatTasker backend server listening on http://0.0.0.0:${PORT}`);
  });
}

mountViteMiddleware();
