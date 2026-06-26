import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

/**
 * Subscribe to messages in a specific chat room
 */
export function subscribeToRoomMessages(
  roomId: string,
  callback: (messages: any[]) => void,
  onError?: (err: any) => void
): () => void {
  const q = query(
    collection(db, 'chatMessages'),
    where('roomId', '==', roomId)
  );
  
  const unsub = onSnapshot(
    q,
    (snap) => {
      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      // Sort messages by createdAt
      list.sort((a, b) => {
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tA - tB;
      });
      callback(list);
    },
    (err) => {
      console.error(`subscribeToRoomMessages failed for room ${roomId}:`, err);
      if (onError) onError(err);
    }
  );
  return unsub;
}

/**
 * Send a message via server-side secure API proxy
 */
export async function sendMessageService(payload: {
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
}): Promise<any> {
  const response = await fetch('/api/chat/send-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to deliver chat message.');
  }
  return result;
}
