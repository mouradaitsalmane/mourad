import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Task } from '../../types';

export async function getOpenTasks(): Promise<Task[]> {
  const snap = await getDocs(query(collection(db, 'tasks'), where('status', '==', 'open')));
  const tasks: Task[] = [];
  snap.forEach(d => {
    tasks.push({ id: d.id, ...d.data() } as Task);
  });
  return tasks;
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const snap = await getDoc(doc(db, 'tasks', taskId));
  return snap.exists() ? (snap.data() as Task) : null;
}
