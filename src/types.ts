export interface UserProfile {
  uid: string;
  displayName: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  isTasker: boolean;
  location: string;
  createdAt: any; // Firestore Timestamp or Date
  isVerifiedTasker?: boolean;
  isOnline?: boolean;
  minimumRate?: number;
  skills?: string[];
  photoURL?: string;
  phoneVerified?: boolean;
  dob?: string;
  hasDob?: boolean;
  hasAddress?: boolean;
  headline?: string;
  verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  identityVerified?: boolean;
  hasBanking?: boolean;
  profileCompletion?: number;
  role?: string;
  isSuperAdmin?: boolean;
  hasSetup?: boolean;
  profileCompleted?: boolean;
  status?: string;
  portfolio?: any[];
  paymentMethods?: any[];
  notifications?: any;
}

export interface UserPrivateInfo {
  email: string;
  phone: string;
  updatedAt: any;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  budget: number; // in MAD (Dirhams)
  category: string;
  location: string; // Rabat neighborhood
  dueDate: string;
  dueTime?: string;
  status: 'open' | 'held' | 'assigned' | 'completed' | 'cancelled';
  posterId: string;
  posterName: string;
  taskerId?: string;
  taskerName?: string;
  offersCount: number;
  urgency?: 'low' | 'medium' | 'urgent';
  contactPreference?: 'chat' | 'phone' | 'email' | 'any';
  images?: string[];
  createdAt: any;
  updatedAt: any;
}

export interface Offer {
  id: string;
  taskId: string;
  taskerId: string;
  taskerName: string;
  taskerPhoto?: string;
  amount: number; // Bid amount in MAD
  message: string; // Pitch Message
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
}

export interface Review {
  id: string;
  taskId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: any;
}

export interface RabatNeighborhood {
  id: string;
  ar: string;
  fr: string;
}

export interface ServiceCategory {
  id: string;
  ar: string;
  fr: string;
  icon: string;
}
