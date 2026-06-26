import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

/**
 * Subscribe to files owned by a specific user
 */
export function subscribeToUserFiles(
  userId: string,
  callback: (files: any[]) => void,
  onError?: (err: any) => void
): () => void {
  const q = query(collection(db, 'files'), where('userId', '==', userId));
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
      console.error(`subscribeToUserFiles failed for user ${userId}:`, err);
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Upload a file securely via server upload controller
 */
export async function uploadFileService(payload: {
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}): Promise<any> {
  const fileResponse = await fetch('/api/files/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const resData = await fileResponse.json();
  if (!fileResponse.ok || !resData.success) {
    throw new Error(resData.error || 'Failed to upload file safely.');
  }
  return resData;
}

/**
 * Remove/delete a file document from the storage collection
 */
export async function deleteFileService(fileId: string): Promise<void> {
  const path = `files/${fileId}`;
  try {
    await deleteDoc(doc(db, 'files', fileId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
