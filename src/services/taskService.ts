import { collection, query, where, onSnapshot, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Task, Offer } from '../types';

/**
 * Subscribe to all tasks
 */
export function subscribeToTasks(
  callback: (tasks: Task[]) => void,
  onError?: (err: any) => void
): () => void {
  const q = query(collection(db, 'tasks'));
  const unsub = onSnapshot(
    q,
    (snap) => {
      const list: Task[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Task);
      });
      callback(list);
    },
    (err) => {
      console.error("subscribeToTasks failed:", err);
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Subscribe to tasks posted by a specific poster / client
 */
export function subscribeToUserTasks(
  userId: string,
  callback: (tasks: Task[]) => void,
  onError?: (err: any) => void
): () => void {
  const q = query(collection(db, 'tasks'), where('posterId', '==', userId));
  const unsub = onSnapshot(
    q,
    (snap) => {
      const list: Task[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Task);
      });
      callback(list);
    },
    (err) => {
      console.error("subscribeToUserTasks failed:", err);
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Subscribe to offers / bids for a specific task
 */
export function subscribeToTaskOffers(
  taskId: string,
  callback: (offers: Offer[]) => void,
  onError?: (err: any) => void
): () => void {
  const offersRef = collection(db, 'tasks', taskId, 'offers');
  const unsub = onSnapshot(
    offersRef,
    (snap) => {
      const list: Offer[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Offer);
      });
      callback(list);
    },
    (err) => {
      console.error(`subscribeToTaskOffers failed for task ${taskId}:`, err);
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Get offers for a specific task (one-time fetch)
 */
export async function getTaskOffersOnce(taskId: string): Promise<Offer[]> {
  const path = `tasks/${taskId}/offers`;
  try {
    const list: Offer[] = [];
    const snap = await getDocs(collection(db, 'tasks', taskId, 'offers'));
    snap.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Offer);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Submit / create a new task securely via the anti-spam API route
 */
export async function createTaskService(taskData: any, userUid: string): Promise<any> {
  const response = await fetch('/api/tasks/secure-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskData, userUid })
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'The security shield blocked task creation.');
  }
  return resData;
}

/**
 * Accept a bid / offer and fund the escrow securely
 */
export async function acceptOfferService(taskId: string, offerId: string, userUid: string): Promise<any> {
  const response = await fetch('/api/tasks/accept-offer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, offerId, userUid })
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Bid acceptance failed.');
  }
  return resData;
}

/**
 * Release escrow funds to the worker
 */
export async function releaseEscrowService(taskId: string, userUid: string): Promise<any> {
  const response = await fetch('/api/tasks/release-escrow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, userUid })
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Escrow release failed.');
  }
  return resData;
}

/**
 * Cancel a task securely on the backend
 */
export async function cancelTaskService(taskId: string, userUid: string): Promise<any> {
  const response = await fetch('/api/tasks/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, userUid })
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Task cancellation failed.');
  }
  return resData;
}

/**
 * Create a new bid / offer on a task
 */
export async function createBidService(bidData: any, userUid: string): Promise<any> {
  const response = await fetch('/api/bids/secure-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bidData, userUid })
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Formulating bid offer failed.');
  }
  return resData;
}

/**
 * Fetch all tasks once (promise-based)
 */
export async function fetchTasksService(): Promise<Task[]> {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const list: Task[] = [];
  snap.forEach((d) => {
    list.push({ id: d.id, ...d.data() } as Task);
  });
  return list;
}
