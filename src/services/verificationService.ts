import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { calculateProfileCompletion } from './profileCompletionEngine';

/**
 * Recalculates and updates the profileCompletion percentage on the user's root document.
 */
export async function syncProfileCompletionScore(userId: string): Promise<number> {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return 0;
  
  const profileData = snap.data();
  const evaluation = calculateProfileCompletion(profileData);
  
  await updateDoc(userRef, {
    profileCompletion: evaluation.completionPercentage,
    updatedAt: serverTimestamp()
  });
  
  return evaluation.completionPercentage;
}

/**
 * STEP 1: Upload and set Profile Photo
 */
export async function updateProfilePhotoService(userId: string, photoURL: string): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL,
      updatedAt: serverTimestamp()
    });
    await syncProfileCompletionScore(userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * STEP 2: Phone OTP Verification
 * Emulates Firebase OTP validation / updates phonVerified true
 */
export async function verifyPhoneService(userId: string, phoneNumber: string, otpCode: string): Promise<void> {
  const path = `users/${userId}`;
  try {
    // In production we verify the OTP, then save verified flag to public profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      phoneNumber,
      phoneVerified: true,
      updatedAt: serverTimestamp()
    });
    
    // Also store private contact detail
    await setDoc(doc(db, 'users', userId, 'private', 'info'), {
      phone: phoneNumber,
      phoneVerified: true,
      updatedAt: serverTimestamp()
    }, { merge: true });

    await syncProfileCompletionScore(userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * STEP 3: Personal Information (Date Of Birth, Gender)
 * We store details securely in users/{uid}/private/profile according to rules.
 */
export async function updatePersonalInformationService(userId: string, dob: string, gender?: string): Promise<void> {
  const path = `users/${userId}/private/profile`;
  try {
    const privateRef = doc(db, 'users', userId, 'private', 'profile');
    await setDoc(privateRef, {
      dob,
      gender: gender || 'unspecified',
      updatedAt: serverTimestamp()
    });

    // Sync a fast queryable flag back to the parent document for completion calculation & indexing
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      hasDob: true,
      dob, // Keep copy on parent for local layout (securely cleared if needed, but important for calculation)
      gender: gender || 'unspecified',
      updatedAt: serverTimestamp()
    });

    await syncProfileCompletionScore(userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * STEP 4: Address
 * Stores city, area, streetAddress. Sets roots location and hasAddress flag.
 */
export async function updateAddressService(userId: string, payload: {
  city: string;
  area: string;
  streetAddress: string;
}): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const locationString = `${payload.streetAddress}, ${payload.area}, ${payload.city}`;
    await updateDoc(userRef, {
      location: locationString,
      hasAddress: true,
      addressDetails: payload,
      updatedAt: serverTimestamp()
    });

    await syncProfileCompletionScore(userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * STEP 5: Skills
 * Updates multi-select list.
 */
export async function updateSkillsService(userId: string, skills: string[]): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      skills,
      updatedAt: serverTimestamp()
    });

    await syncProfileCompletionScore(userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * STEP 6: Bio
 * Headline and Bio details.
 */
export async function updateBioAndHeadlineService(userId: string, headline: string, bio: string): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      headline,
      bio,
      updatedAt: serverTimestamp()
    });

    await syncProfileCompletionScore(userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * STEP 7: Identity Verification
 * CIN Front, CIN Back, Selfie documents submission.
 * Triggers status change on the root to "pending" reviews.
 */
export async function submitIdentityVerificationService(userId: string, payload: {
  cinFront: string;
  cinBack: string;
  selfie: string;
}): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    
    // Save details inside private verification subcollection
    const verifRef = doc(db, 'users', userId, 'private', 'verification');
    await setDoc(verifRef, {
      cinFront: payload.cinFront,
      cinBack: payload.cinBack,
      selfie: payload.selfie,
      submittedAt: serverTimestamp(),
      status: 'pending'
    });

    // Update status on user's public profile
    await updateDoc(userRef, {
      verificationStatus: 'pending', // pending review
      identityVerified: false,
      updatedAt: serverTimestamp()
    });

    await syncProfileCompletionScore(userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * STEP 8: Bank Account
 * Bank Name, Account Holder, IBAN. Keep isolated in users/{userId}/private/banking
 */
export async function updateBankInformationService(userId: string, payload: {
  bankName: string;
  accountHolder: string;
  iban: string;
}): Promise<void> {
  const path = `users/${userId}/private/banking`;
  try {
    const bankingRef = doc(db, 'users', userId, 'private', 'banking');
    await setDoc(bankingRef, {
      bankName: payload.bankName,
      accountHolder: payload.accountHolder,
      iban: payload.iban,
      updatedAt: serverTimestamp()
    });

    // Notify public profile that banking info has been added (does not expose IBAN)
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      hasBanking: true,
      updatedAt: serverTimestamp()
    });

    await syncProfileCompletionScore(userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Admin Verification Page services: Approve / Reject verification documents
 */
export async function adminReviewVerificationService(payload: {
  userId: string;
  adminId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
}): Promise<void> {
  const apiRoute = '/api/admin/review-verification';
  const response = await fetch(apiRoute, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || 'Review verification action failed on server side.');
  }
}
