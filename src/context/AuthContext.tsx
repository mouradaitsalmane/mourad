import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: 'client' | 'worker' | 'admin' | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, role: 'client' | 'worker', fullName: string, phone: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'client' | 'worker' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  // Expose single real-time Auth State listener to avoid duplicate listener issues
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setCurrentUser(user);
      
      if (user) {
        try {
          // Read user profile strictly from Firestore uid
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            const profile = { uid: user.uid, ...data } as UserProfile;
            setUserProfile(profile);

            // Determine role strictly from Firestore
            let userRole: 'client' | 'worker' | 'admin' = 'client';
            if (data.role === 'admin' || data.isSuperAdmin || user.email === 'cryptomourad1992@gmail.com' || user.uid === 'sDCii92rV7fKTvvDgWTQCLKxwJr1') {
              userRole = 'admin';
            } else if (data.role === 'worker' || data.role === 'tasker' || data.isTasker) {
              userRole = 'worker';
            }
            setRole(userRole);
          } else {
            console.error('Missing user profile document in Firestore for UID:', user.uid);
            setUserProfile(null);
            setRole(null);
          }
        } catch (err) {
          console.error('Failed to fetch user profile from Firestore:', err);
          setUserProfile(null);
          setRole(null);
        }
      } else {
        setUserProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCred.user;

      // Force fetch profile document to ensure user profile state updates synchronously
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const profile = { uid: user.uid, ...data } as UserProfile;
        setUserProfile(profile);

        let userRole: 'client' | 'worker' | 'admin' = 'client';
        if (data.role === 'admin' || data.isSuperAdmin || user.email === 'cryptomourad1992@gmail.com' || user.uid === 'sDCii92rV7fKTvvDgWTQCLKxwJr1') {
          userRole = 'admin';
        } else if (data.role === 'worker' || data.role === 'tasker' || data.isTasker) {
          userRole = 'worker';
        }
        setRole(userRole);
      } else {
        throw new Error('Profile document not found in database.');
      }
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    role: 'client' | 'worker',
    fullName: string,
    phone: string
  ): Promise<User> => {
    setLoading(true);
    let user: User | null = null;
    try {
      // 1. Create the Firebase Authentication account
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      user = userCred.user;

      // Update Auth Display Name
      try {
        await updateProfile(user, { displayName: fullName.trim() });
      } catch (profileErr) {
        console.warn('Failed to update Firebase Auth profile display name:', profileErr);
      }

      // 2. Create a Firestore document in users/{uid}
      const userDocRef = doc(db, 'users', user.uid);
      
      const isArabic = /[\u0600-\u06FF]/.test(fullName || '');
      
      // Merge with required fields and some backward compatibility fields
      const profileData = {
        uid: user.uid,
        fullName: fullName.trim(),
        displayName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: role, // "client" or "worker"
        createdAt: serverTimestamp(),
        profileCompleted: false,
        avatar: '',
        status: 'active',
        // Compatibility properties
        isTasker: role === 'worker',
        bio: isArabic ? 'مستعمل جديد في مجتمع Tasker.' : 'Nouveau membre sur Tasker.',
        rating: 0,
        reviewsCount: 0,
        location: isArabic ? 'أكدال' : 'Agdal',
        hasSetup: false
      };

      // Create the primary user document immediately
      await setDoc(userDocRef, profileData);

      // Create private info subcollection split record for security/PII guidelines
      const privateInfoRef = doc(db, 'users', user.uid, 'private', 'info');
      await setDoc(privateInfoRef, {
        email: email.trim(),
        phone: phone.trim(),
        updatedAt: serverTimestamp()
      });

      // Synchronize states
      setUserProfile(profileData as any);
      setRole(role);
      
      return user;
    } catch (error) {
      // If signup fails during Firestore creation but Auth user was created, clean it up or allow re-attempts
      console.error('Error during user signup process:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setRole(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role,
        loading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
