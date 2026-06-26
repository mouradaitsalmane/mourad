import { doc, getDoc, setDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserPrivateInfo } from '../types';

/**
 * Signup user with specific email, password, role, and name
 */
export const signupUser = async (email: string, password: string, role: 'client' | 'tasker', name: string) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    name,
    role: role, // "client" or "tasker"
    createdAt: Date.now()
  });

  return user;
};

/**
 * Get user role by uid
 */
export const getUserRole = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data().role;
};

/**
 * Fetch a user's public profile from firestore
 */
export async function fetchUserProfilePublic(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return { uid: snap.id, ...snap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Fetch a user's private info (email, phone)
 */
export async function fetchPrivateInfo(userId: string): Promise<UserPrivateInfo | null> {
  const path = `users/${userId}/private/info`;
  try {
    const privateSnap = await getDoc(doc(db, 'users', userId, 'private', 'info'));
    if (privateSnap.exists()) {
      return privateSnap.data() as UserPrivateInfo;
    }
    return null;
  } catch (error) {
    // Graceful check fallback
    console.warn("Private info getDoc failed:", error);
    return null;
  }
}

/**
 * Subscribe to all workers (users with isTasker == true)
 */
export function subscribeToWorkers(
  callback: (workers: UserProfile[]) => void,
  onError?: (err: any) => void
): () => void {
  const q = query(collection(db, 'users'), where('isTasker', '==', true));
  const unsub = onSnapshot(
    q,
    (snap) => {
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        list.push({ uid: d.id, ...d.data() } as UserProfile);
      });
      callback(list);
    },
    (err) => {
      console.error("subscribeToWorkers failed:", err);
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Update user profile via server-side secure endpoint
 */
export async function updateProfileService(payload: {
  userUid: string;
  displayName: string;
  bio: string;
  isTasker: boolean;
  location: string;
  phone: string;
  minimumRate?: number;
  skills?: string[];
}): Promise<any> {
  const response = await fetch('/api/profile/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to update user profile.');
  }
  return result.data;
}

/**
 * Subscribe to current user profile
 */
export function subscribeToUserProfile(
  userId: string,
  callback: (profile: UserProfile) => void,
  onError?: (err: any) => void
): () => void {
  const unsub = onSnapshot(
    doc(db, 'users', userId),
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
      }
    },
    (err) => {
      console.error(`subscribeToUserProfile failed for user ${userId}:`, err);
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Subscribe to worker's withdrawal record list
 */
export function subscribeToWithdrawals(
  userId: string,
  callback: (withdrawals: any[]) => void,
  onError?: (err: any) => void
): () => void {
  const q = query(collection(db, 'withdrawals'), where('workerId', '==', userId));
  const unsub = onSnapshot(
    q,
    (snap) => {
      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      // Sort client-side by date descending
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      callback(list);
    },
    (err) => {
      console.warn("subscribeToWithdrawals list not ready yet:", err);
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Request money payout withdrawal securely
 */
export async function requestWithdrawalService(payload: {
  userId: string;
  amount: number;
  bankName: string;
  bankAccount: string;
}): Promise<any> {
  const response = await fetch('/api/payouts/request-withdrawal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to submit withdrawal request.');
  }
  return resData;
}

/**
 * Subscribe to user transactions
 */
export function subscribeToTransactions(
  userId: string,
  callback: (transactions: any[]) => void,
  onError?: (err: any) => void
): () => void {
  const q = query(
    collection(db, 'transactions'),
    where('userUid', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const unsub = onSnapshot(
    q,
    (snap) => {
      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      callback(list);
    },
    (err) => {
      console.warn("subscribeToTransactions failed:", err);
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Fetch or securely create a user profile on the server side
 */
export async function getOrCreateUserProfileService(
  uid: string,
  data: { displayName: string; email: string; phone: string }
): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    let snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) {
      console.log('[Cloud Function Auto Init] Constructing profile for user (attempting direct write first):', uid);
      
      try {
        const { setDoc } = await import('firebase/firestore');
        const isArabic = /[\u0600-\u06FF]/.test(data.displayName || '');
        const profileData: UserProfile = {
          uid,
          displayName: data.displayName.trim() || 'User',
          role: 'client',
          isTasker: false,
          profileCompleted: false,
          status: 'active',
          createdAt: new Date(),
          bio: isArabic ? 'مستعمل جديد في مجتمع Tasker.' : 'Nouveau membre sur Tasker.',
          rating: 0,
          reviewsCount: 0,
          location: isArabic ? 'أكدال' : 'Agdal',
          hasSetup: false
        };
        await setDoc(doc(db, 'users', uid), profileData);
        await setDoc(doc(db, 'users', uid, 'private', 'info'), {
          email: data.email.trim() || '',
          phone: data.phone.trim() || '',
          updatedAt: new Date()
        });
        snap = await getDoc(doc(db, 'users', uid));
      } catch (directWriteErr) {
        console.warn('[Direct Write Fallback] Direct profile write failed, calling cloud API backup:', directWriteErr);
        const cloudResponse = await fetch('/api/functions/create-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid,
            displayName: data.displayName,
            email: data.email,
            phone: data.phone
          })
        });
        if (cloudResponse.ok) {
          snap = await getDoc(doc(db, 'users', uid));
        }
      }
    }

    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
