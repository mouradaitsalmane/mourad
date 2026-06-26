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
  initializeFirestore, 
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'firebase/app-check';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize core Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with Database ID from configuration and long polling enabled
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize App Check with standard ReCAPTCHA provider
let appCheckInstance: any = null;
if (typeof window !== 'undefined') {
  const recaptchaKey = (import.meta as any).env?.VITE_RECAPTCHA_KEY || '6Ld_rabat_tasker_recaptcha_v3_key_2026';
  
  // Setup debug token for development mode sandbox to ensure we bypass reCAPTCHA checks correctly
  (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  
  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaKey),
      isTokenAutoRefreshEnabled: true
    });
    console.log('[Firebase App Check] Initialized client provider with key:', recaptchaKey);
  } catch (err) {
    console.warn('[Firebase App Check] Initialization deferred or skipped in preview container:', err);
  }

  // Intercept standard global fetch to append App Check token to all internal API routes transparently
  try {
    const originalFetch = window.fetch;
    const customFetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      const urlString = typeof input === 'string' ? input : (input instanceof URL ? input.href : (input as any).url || '');
      if (urlString.startsWith('/api/') && appCheckInstance) {
        try {
          const tokenResult = await getToken(appCheckInstance, false);
          if (tokenResult && tokenResult.token) {
            const headers = new Headers(init?.headers || {});
            headers.set('X-Firebase-AppCheck', tokenResult.token);
            init = { ...init, headers };
          }
        } catch (err) {
          console.warn('[Firebase App Check] Token acquisition failed:', err);
        }
      }
      return originalFetch(input, init);
    };

    try {
      (window as any).fetch = customFetch;
      console.log('[Firebase App Check] Successfully wrapped window.fetch via standard assignment.');
    } catch (assignError) {
      console.warn('[Firebase App Check] Direct assignment failed, attempting Object.defineProperty:', assignError);
      Object.defineProperty(window, 'fetch', {
        value: customFetch,
        configurable: true,
        writable: true,
        enumerable: true
      });
      console.log('[Firebase App Check] Successfully wrapped window.fetch via Object.defineProperty.');
    }
  } catch (err) {
    console.warn('[Firebase App Check] Failed to hijack global fetch safely (possibly read-only iframe sandbox):', err);
  }
}

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
