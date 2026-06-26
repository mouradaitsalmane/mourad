import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboardData } from '../services/dashboard/dashboard.service';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function useDashboard(userId: string | undefined) {
  const queryClient = useQueryClient();

  // Load complete user dashboard data with 3 minutes staleTime for premium performance
  const { 
    data: dashboardData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['taskerDashboard', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return getDashboardData(userId);
    },
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes cache
    gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
    retry: 2
  });

  // Level Mutation in case of manually triggers
  const triggerVerifyMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const userRef = doc(db, 'users', userId);
      // Simulates verifying tasker badge in firestore securely
      await updateDoc(userRef, {
        isVerifiedTasker: true,
        updatedAt: new Date()
      });
    },
    onSuccess: () => {
      // Invalidate query to trigger visual updates
      queryClient.invalidateQueries({ queryKey: ['taskerDashboard', userId] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    }
  });

  return {
    dashboardData,
    isLoading: isLoading || !dashboardData,
    isError,
    error,
    refetch,
    verifyAccount: () => triggerVerifyMutation.mutate(),
    isVerifying: triggerVerifyMutation.isPending
  };
}

export function useDashboardStats(userId: string | undefined) {
  const { dashboardData, isLoading, isError, error, refetch } = useDashboard(userId);
  return {
    stats: dashboardData ? {
      profileCompletion: dashboardData.profileCompletion,
      totalEarnings: dashboardData.totalEarnings,
      completedTasksCount: dashboardData.completedTasksCount,
      activeTasksCount: dashboardData.activeTasksCount,
      openBidsCount: dashboardData.openBidsCount,
      averageRating: dashboardData.averageRating,
      reviewsCount: dashboardData.reviewsCount,
      currentLevel: dashboardData.currentLevel,
      nextLevel: dashboardData.nextLevel,
      requirements: dashboardData.nextLevelRequirements,
      completionRate: dashboardData.completionRate,
      acceptanceRate: dashboardData.acceptanceRate,
      responseRate: dashboardData.responseRate
    } : null,
    isLoading,
    isError,
    error,
    refetch
  };
}

export function useMyTasks(userId: string | undefined) {
  const { dashboardData, isLoading, refetch } = useDashboard(userId);
  return {
    tasks: dashboardData?.activeTasksList || [],
    isLoading,
    refetch
  };
}

export function useMyOffers(userId: string | undefined) {
  const { dashboardData, isLoading, refetch } = useDashboard(userId);
  return {
    offers: dashboardData?.activeBidsList || [],
    isLoading,
    refetch
  };
}

export function useReviews(userId: string | undefined) {
  const { dashboardData, isLoading, refetch } = useDashboard(userId);
  return {
    reviews: dashboardData?.recentReviewsList || [],
    averageRating: dashboardData?.averageRating || 0,
    reviewsCount: dashboardData?.reviewsCount || 0,
    isLoading,
    refetch
  };
}

export function useWallet(userId: string | undefined) {
  const { dashboardData, isLoading, refetch } = useDashboard(userId);
  return {
    wallet: dashboardData ? {
      availableBalance: dashboardData.totalEarnings,
      pendingBalance: dashboardData.activeBidsList.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0),
      analytics: dashboardData.earningsAnalytics
    } : null,
    isLoading,
    refetch
  };
}
