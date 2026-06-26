import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Review } from '../../types';

export async function getReceivedReviews(userId: string): Promise<Review[]> {
  const snap = await getDocs(query(collection(db, 'reviews'), where('revieweeId', '==', userId)));
  const reviews: Review[] = [];
  snap.forEach(d => {
    reviews.push({ id: d.id, ...d.data() } as Review);
  });
  return reviews;
}
