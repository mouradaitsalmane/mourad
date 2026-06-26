import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FAQItem {
  id?: string;
  featureId: string;
  question: string;
  answer: string;
  lang: string;
}

/**
 * Fetch dynamic FAQs matching featureId and lang
 */
export async function fetchDynamicFAQs(categoryId: string, lang: 'ar' | 'fr'): Promise<FAQItem[]> {
  const q = query(
    collection(db, 'faqs'),
    where('featureId', '==', categoryId),
    where('lang', '==', lang)
  );
  const snapshot = await getDocs(q);
  const fetched: FAQItem[] = [];
  snapshot.forEach((doc) => {
    fetched.push({ id: doc.id, ...doc.data() } as FAQItem);
  });
  return fetched;
}
