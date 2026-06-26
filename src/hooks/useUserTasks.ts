import { useState, useEffect } from 'react';
import { Task, Offer } from '../types';
import { subscribeToUserTasks, subscribeToTaskOffers } from '../services/taskService';

export function useUserTasks(user: any) {
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [offersMap, setOffersMap] = useState<{ [taskId: string]: Offer[] }>({});
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (!user) {
      setMyTasks([]);
      setLoadingTasks(false);
      return;
    }

    setLoadingTasks(true);
    const unsubTasks = subscribeToUserTasks(
      user.uid,
      (list) => {
        // Sort tasks by updated/created date
        list.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        setMyTasks(list);
        setLoadingTasks(false);

        // Setup nested offers listeners for each task
        const offerUnsubs = list.map((t) => {
          return subscribeToTaskOffers(t.id, (offersList) => {
            setOffersMap((prev) => ({
              ...prev,
              [t.id]: offersList,
            }));
          });
        });

        return () => {
          offerUnsubs.forEach((unsub) => unsub());
        };
      },
      (err) => {
        console.error("useUserTasks failed:", err);
        setLoadingTasks(false);
      }
    );

    return () => {
      unsubTasks();
    };
  }, [user]);

  return { myTasks, offersMap, loadingTasks };
}
