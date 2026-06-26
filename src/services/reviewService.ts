import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Review } from '../types';

/**
 * Subscribe to reviews given by a specific reviewer
 */
export function subscribeToGivenReviews(
  reviewerId: string,
  callback: (reviews: Review[]) => void,
  onError?: (err: any) => void
): () => void {
  const q = query(collection(db, 'reviews'), where('reviewerId', '==', reviewerId));
  const unsub = onSnapshot(
    q,
    (snap) => {
      const list: Review[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Review);
      });
      callback(list);
    },
    (err) => {
      console.error(`subscribeToGivenReviews failed for reviewer ${reviewerId}:`, err);
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Subscribe to reviews left for a specific user
 */
export function subscribeToReceivedReviews(
  revieweeId: string,
  callback: (reviews: Review[]) => void,
  onError?: (err: any) => void
): () => void {
  const q = query(collection(db, 'reviews'), where('revieweeId', '==', revieweeId));
  const unsub = onSnapshot(
    q,
    (snap) => {
      const list: Review[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Review);
      });
      callback(list);
    },
    (err) => {
      console.error(`subscribeToReceivedReviews failed for reviewee ${revieweeId}:`, err);
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Submit check review on a completed task securely
 */
export async function createReviewService(payload: {
  taskId: string;
  rating: number;
  comment: string;
  userUid: string;
  reviewerName: string;
}): Promise<any> {
  const response = await fetch('/api/reviews/secure-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to submit review.');
  }
  return resData;
}

/**
 * Subscribe to reviews for a specific task
 */
export function subscribeToTaskReviews(
  taskId: string,
  callback: (reviews: Review[]) => void,
  onError?: (err: any) => void
): () => void {
  const q = query(collection(db, 'reviews'), where('taskId', '==', taskId));
  const unsub = onSnapshot(
    q,
    (snap) => {
      const list: Review[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Review);
      });
      callback(list);
    },
    (err) => {
      console.error(`subscribeToTaskReviews failed for task ${taskId}:`, err);
      if (onError) onError(err);
    }
  );
  return unsub;
}
