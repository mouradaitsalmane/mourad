import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { subscribeToAdminUsers, subscribeToAdminFiles, subscribeToAdminFraud } from '../services/adminService';

export function useAdminData(active: boolean) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!active) return;

    const unsubUsers = subscribeToAdminUsers(
      (list) => {
        setUsers(list);
        setLoadingUsers(false);
      },
      (err) => {
        console.error("useAdminData subscription to users failed:", err);
        setLoadingUsers(false);
      }
    );

    const unsubFiles = subscribeToAdminFiles(
      (list) => {
        setAllFiles(list);
        setLoadingFiles(true); // wait, let's set loadingFiles false when done loading
        setLoadingFiles(false);
      },
      (err) => {
        console.error("useAdminData subscription to files failed:", err);
        setLoadingFiles(false);
      }
    );

    const unsubFraud = subscribeToAdminFraud(
      (list) => {
        setFraudAlerts(list);
      },
      (err) => {
        console.error("useAdminData subscription to fraud alerts failed:", err);
      }
    );

    return () => {
      unsubUsers();
      unsubFiles();
      unsubFraud();
    };
  }, [active]);

  return {
    users,
    loadingUsers,
    allFiles,
    loadingFiles,
    fraudAlerts,
  };
}
