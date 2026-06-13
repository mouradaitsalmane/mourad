import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize core Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with Database ID from configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Authentication
export const auth = getAuth(app);

// Authentication provider setup
export const googleProvider = new GoogleAuthProvider();

// Standard Firebase Authentication wrappers
export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };

// Zero-Trust Firebase Error Response System
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Custom permissions error-hook matching the required FirestoreErrorInfo JSON structure.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Action Failed: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Dry-Run Firestore Connection Check
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection initialized successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase Sandbox warning: User client appears to be offline.");
    } else {
      console.log("Firebase initialized. Note: Empty 'test/connection' document lookup expected: ", error);
    }
  }
}

// Trigger initial verification lookup
testConnection();
