import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { Task } from '../../types';
import { 
  ArrowLeft, 
  Settings, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  Rocket,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

// Import sub-components
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import ProfileCompletionCard from '../../components/dashboard/ProfileCompletionCard';
import EarningsCard from '../../components/dashboard/EarningsCard';
import StatisticsCard from '../../components/dashboard/StatisticsCard';
import RecentTasksCard from '../../components/dashboard/RecentTasksCard';
import ActiveBidsCard from '../../components/dashboard/ActiveBidsCard';
import ReviewsCard from '../../components/dashboard/ReviewsCard';
import VerificationCard from '../../components/dashboard/VerificationCard';
import TaskerLevelCard from '../../components/dashboard/TaskerLevelCard';
import PerformanceCard from '../../components/dashboard/PerformanceCard';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import RecommendedTasksCard from '../../components/dashboard/RecommendedTasksCard';
import ProfileCompletionModal from '../../components/dashboard/ProfileCompletionModal';

interface TaskerDashboardProps {
  user: any; // Firebase Auth User
  userProfile?: any;
  lang: 'ar' | 'fr';
  onSelectTask: (task: Task) => void;
  onOpenSettings?: () => void;
  onToggleToClient?: () => void;
}

const TEXTS = {
  ar: {
    backBtn: 'لوحة العميل',
    settingsBtn: 'إعدادات الحساب',
    errorTitle: 'عذراً، حدث خطأ أثناء تحميل البيانات',
    errorDesc: 'لم نتمكن من جلب إحصائيات لوحة التحكم الخاصة بك حالياً. يرجى التحقق من اتصال الشبكة وإعادة المحاولة.',
    retryBtn: 'إعادة المحاولة',
    quickOverview: 'لوحة التحكم والتحليلات للشركاء',
    subOverview: 'المساعد الذكي لمتابعة وإدارة أعمالك المهنية بالرباط',
    levelTitle: 'المستوى الحالي',
    levelNext: 'المستوى التالي',
    levelPoints: 'نقطة',
    boostTitle: 'ضاعف من أرباحك وتواجدك',
    boostDesc: 'ارفع ترتيب ظهورك في نتائج البحث لتلقي عروض مباشرة من العملاء باليوم',
    boostBtn: 'تنشيط الظهور الموثوق',
    welcomeSub: 'إليك نظرة سريعة على جميع أنشطتك المهنية وأعمالك اليوم',
    welcomeBack: 'مرحباً،',
  },
  fr: {
    backBtn: 'Espace Client',
    settingsBtn: 'Paramètres',
    errorTitle: 'Une erreur est survenue lors du chargement',
    errorDesc: 'Nous n\'avons pas pu charger les données de votre tableau de bord. Veuillez vérifier votre connexion.',
    retryBtn: 'Réessayer',
    quickOverview: 'Centre de contrôle & Activités',
    subOverview: 'Gérez vos prestations, suivez vos gains et développez votre réputation à Rabat.',
    levelTitle: 'Niveau actuel',
    levelNext: 'Prochain niveau',
    levelPoints: 'pts',
    boostTitle: 'Boostez votre visibilité',
    boostDesc: 'Augmentez vos chances d’obtenir des tâches de haute mâture en activant le boost premium.',
    boostBtn: 'Booster mon profil',
    welcomeSub: 'Voici un aperçu de votre activité sur RabatTasker.',
    welcomeBack: 'Bienvenue de retour,',
  }
};

export default function TaskerDashboard({ 
  user, 
  userProfile,
  lang, 
  onSelectTask, 
  onOpenSettings,
  onToggleToClient 
}: TaskerDashboardProps) {
  
  const t = TEXTS[lang];
  const isRTL = lang === 'ar';
  
  // Custom hook wrapping react-query logic for dashboard statistics
  const { 
    dashboardData, 
    isLoading, 
    isError, 
    error,
    refetch, 
    verifyAccount, 
    isVerifying 
  } = useDashboard(user?.uid);

  // If loading, display the beautiful mirroring skeleton cards
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Graceful Error Boundary resolution card
  if (isError || !dashboardData) {
    return (
      <div className="w-full max-w-lg mx-auto py-24 px-4 text-center space-y-6">
        <div className="p-4 bg-rose-50 text-rose-500 rounded-full inline-block">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">{t.errorTitle}</h2>
          <p className="text-sm text-slate-500 font-sans leading-relaxed">
            {error instanceof Error ? error.message : t.errorDesc}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>{t.retryBtn}</span>
        </button>
      </div>
    );
  }

  // Points tracking simulation for level progress
  const completedTaskCount = dashboardData.completedTasksCount;
  const simulatedPoints = completedTaskCount * 50; 
  const nextLevelPoints = 500;
  const progressRatio = Math.min(Math.round((simulatedPoints / nextLevelPoints) * 100), 100);

  return (
    <div 
      id="production-tasker-dashboard-flow"
      className="w-full max-w-7xl mx-auto py-2 pr-0 pl-0 space-y-6 md:space-y-8 font-sans"
    >
      {/* 1. Header Banner containing Welcome Greeting and Gold Level Badge block side by side */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        {/* Welcome Text info */}
        <div className={`space-y-1.5 ${isRTL ? 'text-right md:order-2' : 'text-left md:order-1'}`}>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center justify-start gap-1.5 flex-wrap">
            <span>{t.welcomeBack} {user?.displayName || 'Tasker' }!</span>
            <span>👋</span>
          </h2>
          <p className="text-xs text-slate-400 font-bold leading-relaxed">{t.welcomeSub}</p>
        </div>

        {/* Level Ribbon Badge progress meter */}
        <div className={`flex-1 max-w-md bg-gradient-to-r from-slate-900 to-slate-850 text-white p-4.5 rounded-2xl flex items-center justify-between gap-5 relative overflow-hidden ${isRTL ? 'md:order-1 flex-row-reverse' : 'md:order-2 flex-row'}`}>
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-3 opacity-10">
            <Sparkles size={110} />
          </div>

          <div className="space-y-2 flex-1">
            <div className={`flex items-center justify-between text-[11px] font-black ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex items-center gap-1.5">
                <span className="p-1 bg-amber-500/20 text-amber-400 rounded-md">🏆</span>
                <span>{t.levelTitle}: <strong className="text-amber-400 font-extrabold capitalize">{dashboardData.currentLevel}</strong></span>
              </div>
              <span className="text-slate-300 font-bold">{simulatedPoints} / {nextLevelPoints} {t.levelPoints}</span>
            </div>

            {/* Gauge progress line */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500" 
                style={{ width: `${progressRatio}%` }}
              />
            </div>

            <div className={`flex items-center justify-between text-[10px] text-slate-400 font-bold ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <span>{progressRatio}% {isRTL ? 'مكتمل' : 'complété'}</span>
              <span>{t.levelNext}: <strong className="text-slate-300 capitalize">{dashboardData.nextLevel}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Full Row of 6 Analytics/Statistics Counters */}
      <div className="w-full">
        <StatisticsCard 
          lang={lang} 
          stats={{
            totalEarnings: dashboardData.totalEarnings,
            completedTasksCount: dashboardData.completedTasksCount,
            activeTasksCount: dashboardData.activeTasksCount,
            openBidsCount: dashboardData.openBidsCount,
            averageRating: dashboardData.averageRating,
            reviewsCount: dashboardData.reviewsCount
          }} 
        />
      </div>

      {/* 3. Main Dashboard Bento Layout Grid split into Left Column (detailed indicators) and Right Column (Summary checks) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Columns 1 & 2): Core graphs, tables and recommendations lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* A. Earnings analytics Line Graph */}
          <EarningsCard 
            lang={lang}
            analytics={dashboardData.earningsAnalytics}
          />

          {/* B. Performances progres lines */}
          <PerformanceCard 
            lang={lang}
            performance={{
              completionRate: dashboardData.completionRate,
              acceptanceRate: dashboardData.acceptanceRate,
              responseRate: dashboardData.responseRate
            }}
          />

          {/* C. Tasks Assigned table list (Tâches en cours) */}
          <RecentTasksCard 
            lang={lang}
            tasks={dashboardData.activeTasksList}
            onSelectTask={onSelectTask}
          />

          {/* D. Submitted Offers (Bids) list */}
          <ActiveBidsCard 
            lang={lang}
            bids={dashboardData.activeBidsList}
          />

          {/* E. Recommended Tasks tailored for this specific worker */}
          <RecommendedTasksCard 
            lang={lang}
            tasks={dashboardData.recommendedTasksList}
            onSelectTask={onSelectTask}
          />

          {/* F. Review list commentary wall */}
          <ReviewsCard 
            lang={lang}
            reviews={dashboardData.recentReviewsList}
            averageRating={dashboardData.averageRating}
            reviewsCount={dashboardData.reviewsCount}
          />

        </div>

        {/* Right Column (Column 3): Checklist cards and status updates */}
        <div className="space-y-6">
          
          {/* A. Profile completion percentage circular card */}
          <ProfileCompletionCard 
            lang={lang}
            profile={{
              uid: user.uid,
              displayName: user.displayName || '',
              bio: dashboardData.recentReviewsList[0]?.comment || '',
              rating: dashboardData.averageRating,
              reviewsCount: dashboardData.reviewsCount,
              isTasker: true,
              location: user.location || 'Rabat',
              createdAt: null,
              skills: user?.skills || []
            }}
            completionPercentage={dashboardData.profileCompletion}
          />

          {/* B. Verification checkmarks list card */}
          <VerificationCard 
            lang={lang}
            verificationStatus={dashboardData.verificationStatus}
            onVerify={verifyAccount}
            isVerifying={isVerifying}
          />

          {/* C. Boost Visibility marketing widget */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
              <Rocket size={140} className="rotate-45" />
            </div>

            <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <Rocket size={20} className="text-sky-400" />
                </div>
                <h4 className="font-extrabold text-sm font-sans tracking-tight">{t.boostTitle}</h4>
              </div>

              <p className="text-xs text-slate-350 leading-relaxed font-sans">
                {t.boostDesc}
              </p>

              <button
                type="button"
                className="w-full py-3 bg-gradient-to-r from-sky-450 to-indigo-550 hover:from-sky-500 hover:to-indigo-600 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-indigo-950/45 cursor-pointer flex items-center justify-center gap-1.5"
                onClick={() => alert(isRTL ? "تم تفعيل خاصية مضاعفة الظهور المهني والترتيب الممتاز لملفك الشخصي بنجاح!" : "Le boost de visibilité premium a été activé avec succès sur Rabat !")}
              >
                <span>{t.boostBtn}</span>
                <ChevronRight size={14} className={isRTL ? 'rotate-180 shrink-0' : 'shrink-0'} />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Profile Onboarding & Verification Modal wizard overlay */}
      <ProfileCompletionModal
        user={user}
        userProfile={userProfile}
        lang={lang}
        onRefreshProfile={() => refetch()}
      />

    </div>
  );
}
