/**
 * Profile Completion Engine for the Tasker Marketplace
 * Weighs core items as specified in business rules:
 * - Profile Photo: 20%
 * - Phone Verification: 20%
 * - Date of Birth: 10%
 * - Address: 10%
 * - Skills: 10%
 * - Bio: 10%
 * - Identity Verification: 10%
 * - Bank Information: 10%
 * Total = 100%
 */

export interface ProfileCompletionResult {
  completionPercentage: number;
  completedItems: string[];
  remainingItems: string[];
  missingSections: string[];
}

export function calculateProfileCompletion(profile: any): ProfileCompletionResult {
  let percentage = 0;
  const completedItems: string[] = [];
  const remainingItems: string[] = [];
  const missingSections: string[] = [];

  // Step 1: Profile Photo (20%)
  if (profile?.photoURL && typeof profile.photoURL === 'string' && profile.photoURL.trim() !== '') {
    percentage += 20;
    completedItems.push('photoURL');
  } else {
    remainingItems.push('photoURL');
    missingSections.push('profilePhoto');
  }

  // Step 2: Phone Verification (20%)
  if (profile?.phoneVerified === true) {
    percentage += 20;
    completedItems.push('phoneVerified');
  } else {
    remainingItems.push('phoneVerified');
    missingSections.push('phoneVerification');
  }

  // Step 3: Date of Birth (10%)
  if (profile?.dob || profile?.hasDob === true) {
    percentage += 10;
    completedItems.push('dob');
  } else {
    remainingItems.push('dob');
    missingSections.push('dob');
  }

  // Step 4: Address (10%)
  // Address is completed if they have verified hasAddress or filled in location
  if (profile?.location || profile?.hasAddress === true) {
    percentage += 10;
    completedItems.push('location');
  } else {
    remainingItems.push('location');
    missingSections.push('address');
  }

  // Step 5: Skills (10%)
  if (profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
    percentage += 10;
    completedItems.push('skills');
  } else {
    remainingItems.push('skills');
    missingSections.push('skills');
  }

  // Step 6: Bio (10%)
  if (
    profile?.bio && typeof profile.bio === 'string' && profile.bio.trim() !== '' &&
    profile?.headline && typeof profile.headline === 'string' && profile.headline.trim() !== ''
  ) {
    percentage += 10;
    completedItems.push('bio');
  } else {
    remainingItems.push('bio');
    missingSections.push('bio');
  }

  // Step 7: Identity Verification (10%)
  if (profile?.verificationStatus === 'approved' || profile?.identityVerified === true) {
    percentage += 10;
    completedItems.push('identityVerified');
  } else {
    remainingItems.push('identityVerified');
    missingSections.push('identityVerification');
  }

  // Step 8: Bank Information (10%)
  if (profile?.hasBanking === true) {
    percentage += 10;
    completedItems.push('hasBanking');
  } else {
    remainingItems.push('hasBanking');
    missingSections.push('banking');
  }

  return {
    completionPercentage: Math.min(percentage, 100),
    completedItems,
    remainingItems,
    missingSections
  };
}
