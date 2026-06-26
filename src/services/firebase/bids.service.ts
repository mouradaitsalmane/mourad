import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Offer } from '../../types';

export async function getBidsForTask(taskId: string): Promise<Offer[]> {
  const snap = await getDocs(collection(db, 'tasks', taskId, 'offers'));
  const offers: Offer[] = [];
  snap.forEach(d => {
    offers.push({ id: d.id, ...d.data() } as Offer);
  });
  return offers;
}

export async function getUserBids(userId: string): Promise<Offer[]> {
  const tasksSnap = await getDocs(collection(db, 'tasks'));
  const bids: Offer[] = [];
  
  for (const tDoc of tasksSnap.docs) {
    const offersSnap = await getDocs(collection(db, 'tasks', tDoc.id, 'offers'));
    offersSnap.forEach(oDoc => {
      const o = oDoc.data() as Offer;
      if (o.taskerId === userId) {
        bids.push({ ...o, id: oDoc.id });
      }
    });
  }
  return bids;
}
