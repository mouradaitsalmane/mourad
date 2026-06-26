import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  auth, 
} from './lib/firebase';
import { getOrCreateUserProfileService, getUserRole } from './services/userService';
import { fetchTasksService, subscribeToTasks } from './services/taskService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Task, UserProfile } from './types';
import { useAuth } from './context/AuthContext';
import { 
  RABAT_NEIGHBORHOODS, 
  SERVICE_CATEGORIES, 
  TRANSLATIONS, 
  LanguageKey 
} from './data/rabatData';

// Component imports
import Navbar from './components/Navbar';
import TaskCard from './components/TaskCard';
import CreateTaskModal from './components/CreateTaskModal';
import TaskDetails from './components/TaskDetails';
import UserProfileSettings from './components/UserProfileSettings';
import RabatMap from './components/RabatMap';
import MapRabatMapTiler from './components/MapRabatMapTiler';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import HomePage from './components/HomePage';
import UserDashboard from './components/UserDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import AdminPanel from './components/AdminPanel';
import HowItWorksPage from './components/HowItWorksPage';
import GiftCardsPage from './components/GiftCardsPage';
import CategoryPage from './components/CategoryPage';
import BottomNavigation from './components/BottomNavigation';
import { DETAILED_CATEGORIES } from './data/categoriesData';

import { motion, AnimatePresence } from 'motion/react';

// Icon imports
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Layers, 
  Star, 
  ShieldCheck, 
  CheckCircle, 
  DollarSign, 
  Info,
  X
} from 'lucide-react';

export default function App() {
  // Locale State
  const [lang, setLang] = useState<LanguageKey>('ar');
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  // Navigation View State via React Router Paths
  const location = useLocation();
  const navigate = useNavigate();

  // Derive currentView and dashboardMode from location.pathname
  let currentView: 'home' | 'explorer' | 'dashboard' | 'admin' | 'how-it-works' | 'gifts' | 'category-view' = 'home';
  let dashboardMode: 'client' | 'worker' = 'client';

  if (location.pathname.startsWith('/client')) {
    currentView = 'dashboard';
    dashboardMode = 'client';
  } else if (location.pathname.startsWith('/tasker')) {
    currentView = 'dashboard';
    dashboardMode = 'worker';
  } else if (location.pathname === '/explorer') {
    currentView = 'explorer';
  } else if (location.pathname === '/how-it-works') {
    currentView = 'how-it-works';
  } else if (location.pathname === '/gifts') {
    currentView = 'gifts';
  } else if (location.pathname === '/admin') {
    currentView = 'admin';
  } else if (location.pathname.startsWith('/category/')) {
    currentView = 'category-view';
  }

  // Redirect client/tasker root paths to their dashboards
  useEffect(() => {
    if (location.pathname === '/client' || location.pathname === '/client/') {
      navigate('/client/dashboard', { replace: true });
    } else if (location.pathname === '/tasker' || location.pathname === '/tasker/') {
      navigate('/tasker/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  const [currentCategory, setCurrentCategory] = useState<string>('');

  // Prefills for task creation from specific category page
  const [prefilledCategory, setPrefilledCategory] = useState<string | undefined>(undefined);
  const [prefilledTitle, setPrefilledTitle] = useState<string | undefined>(undefined);
  const [prefilledBudget, setPrefilledBudget] = useState<number | undefined>(undefined);

  // Auth & Profile State from AuthContext
  const { currentUser: user, userProfile: authProfile, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<false | 'signin' | 'signup'>(false);

  // Open Create Request Modal automatically on client create path
  useEffect(() => {
    if (location.pathname === '/client/create-request') {
      if (user) {
        setShowCreateModal(true);
      } else {
        setShowAuthModal('signin');
      }
    }
  }, [location.pathname, user]);

  // Notification states
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; body: string }>>([]);
  const previousTasksRef = React.useRef<Record<string, Task>>({});

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('all');
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Client-side pagination state for cached tasks
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;

  // Reset page when filtering or sorting parameters are changed
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedNeighborhood, showOnlyOpen, maxPrice, sortBy]);

  // 1. Verify admin claims when user logs in or session restores
  useEffect(() => {
    if (user) {
      const verifyClaims = async () => {
        try {
          const res = await fetch('/api/admin/verify-claims', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: user.uid, email: user.email })
          });
          if (res.ok) {
            const result = await res.json();
            if (result.success && result.admin) {
              console.log('[Auth Listener] User is admin, forcing ID token refresh to load custom claims...');
              await user.getIdToken(true);
            }
          }
        } catch (err) {
          console.error('[Auth Listener] Failed to verify admin claims:', err);
        }
      };
      verifyClaims();
    }
  }, [user]);

  // Real-time notifications and task updates observer
  useEffect(() => {
    if (!user?.uid) {
      setUnreadNotifications(0);
      return;
    }

    const addNotificationToast = (title: string, body: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, body }]);
      setUnreadNotifications((prev) => prev + 1);

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    // Subscribing to tasks in real-time
    const unmount = subscribeToTasks((liveTasks) => {
      const myTasks = liveTasks.filter(t => t.posterId === user.uid || t.taskerId === user.uid);
      let hasChange = false;
      const prevTasks = previousTasksRef.current;

      myTasks.forEach((task) => {
        const prevTask = prevTasks[task.id];

        if (prevTask) {
          // 1. Detect Status Change
          if (prevTask.status !== task.status) {
            const statusMapAr: Record<string, string> = {
              open: 'مفتوحة للتقديم',
              held: 'قيد الدفع الضماني',
              assigned: 'مخصصة للتنفيذ',
              completed: 'مكتملة',
              cancelled: 'ملغاة'
            };
            const statusMapFr: Record<string, string> = {
              open: 'Ouverte',
              held: 'En séquestre',
              assigned: 'Assignée',
              completed: 'Complétée',
              cancelled: 'Annulée'
            };

            const statusStr = lang === 'ar' ? (statusMapAr[task.status] || task.status) : (statusMapFr[task.status] || task.status);
            const title = lang === 'ar' ? '🔔 تحديث حالة مهمة' : '🔔 Statut de mission mis à jour';
            const body = lang === 'ar' 
              ? `تم تغيير حالة المهمة "${task.title}" بنجاح إلى "${statusStr}".`
              : `Le statut de la mission "${task.title}" a été changé en "${statusStr}".`;

            addNotificationToast(title, body);
            hasChange = true;
          }

          // 2. Detect New Offer (for task Poster only)
          if (task.posterId === user.uid && (task.offersCount || 0) > (prevTask.offersCount || 0)) {
            const title = lang === 'ar' ? '📩 عرض جديد مستلم' : '📩 Nouvelle offre reçue';
            const body = lang === 'ar'
              ? `لقد استلمت عرض خدمة جديد على مهمتك "${task.title}"!`
              : `Vous avez reçu une nouvelle offre pour votre mission "${task.title}" !`;

            addNotificationToast(title, body);
            hasChange = true;
          }
        }

        // Keep current state saved for reference
        prevTasks[task.id] = { ...task };
      });

      // Also persist generic task ids so we don't double trigger on first load
      liveTasks.forEach((task) => {
        if (!prevTasks[task.id]) {
          prevTasks[task.id] = { ...task };
        }
      });

      if (hasChange) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    });

    return () => {
      unmount();
    };
  }, [user?.uid, lang, queryClient]);

  // 2. User Profile Cache & Single-Fetch Strategy
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const { data: cachedProfile, isLoading: checkingProfile } = useQuery<UserProfile | null>({
    queryKey: ['userProfile', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      return getOrCreateUserProfileService(user.uid, {
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: user.phoneNumber || ''
      });
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Sync profile cache into user states
  useEffect(() => {
    if (user) {
      if (!checkingProfile) {
        if (cachedProfile) {
          setUserProfile(cachedProfile);
          setShowProfileSetup(false);
          const initialDashMode = cachedProfile.role 
            ? (cachedProfile.role === 'tasker' || cachedProfile.role === 'worker' ? 'worker' : 'client')
            : (cachedProfile.isTasker ? 'worker' : 'client');
          
          if (location.pathname === '/') {
            if (initialDashMode === 'worker') {
              navigate('/tasker/dashboard', { replace: true });
            } else {
              navigate('/client/dashboard', { replace: true });
            }
          }

          // Auto-redirect admin users directly to the administration portal
          const isAdminUser = user.uid === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' || 
                              user.email === 'cryptomourad1992@gmail.com' || 
                              cachedProfile?.role === 'admin' || 
                              cachedProfile?.isSuperAdmin;
          if (isAdminUser && location.pathname !== '/admin') {
            navigate('/admin');
          }
        } else {
          setUserProfile(null);
          setShowProfileSetup(false);
        }
      }
    } else {
      setUserProfile(null);
      setShowProfileSetup(false);
    }
  }, [user, cachedProfile, checkingProfile, location.pathname, navigate]);

  // 3. Cached Tasks List Query Strategy
  const { data: tasks = [], isLoading: loadingTasks } = useQuery<Task[]>({
    queryKey: ['tasks', user?.uid],
    queryFn: async () => {
      return fetchTasksService();
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (selectedTask && tasks.length > 0) {
      const freshSelected = tasks.find(t => t.id === selectedTask.id);
      if (freshSelected) {
        setSelectedTask(freshSelected);
      }
    }
  }, [tasks, selectedTask?.id]);

  // Handle saved profile callbacks
  const handleProfileSaved = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    setShowProfileSetup(false);
    queryClient.setQueryData(['userProfile', user?.uid], updatedProfile);
  };

  // 3. Local filtering and sorting of tasks
  const filteredTasks = tasks
    .filter((task) => {
      // Search match
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Category match
      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;

      // Location / neighborhood match
      const matchesNeighborhood = selectedNeighborhood === 'all' || (() => {
        const neighborhoodObj = RABAT_NEIGHBORHOODS.find(n => n.id === selectedNeighborhood);
        if (!neighborhoodObj) return true;
        // Match either Arabic or French names loaded
        return task.location === neighborhoodObj.ar || task.location === neighborhoodObj.fr;
      })();

      // Status filter - Open only OR all
      const matchesStatus = !showOnlyOpen || task.status === 'open' || task.status === 'held';

      // Max price filter
      const matchesPrice = !maxPrice || task.budget <= Number(maxPrice);

      return matchesSearch && matchesCategory && matchesNeighborhood && matchesStatus && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-desc') {
        return b.budget - a.budget;
      }
      if (sortBy === 'price-asc') {
        return a.budget - b.budget;
      }
      // Default: recent sorting on date
      const timeA = a.createdAt?.seconds 
        ? a.createdAt.seconds * 1000 
        : (a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime());
      const timeB = b.createdAt?.seconds 
        ? b.createdAt.seconds * 1000 
        : (b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime());
      
      const numA = isNaN(timeA) ? 0 : timeA;
      const numB = isNaN(timeB) ? 0 : timeB;
      return numB - numA;
    });

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage) || 1;
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  const handleViewChange = (view: typeof currentView) => {
    if (view === 'dashboard' || view === 'admin') {
      setUnreadNotifications(0);
    }
    
    if (view === 'home') {
      navigate('/');
    } else if (view === 'explorer') {
      navigate('/explorer');
    } else if (view === 'how-it-works') {
      navigate('/how-it-works');
    } else if (view === 'gifts') {
      navigate('/gifts');
    } else if (view === 'admin') {
      navigate('/admin');
    } else if (view === 'dashboard') {
      if (dashboardMode === 'worker') {
        navigate('/tasker/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4" id="app-restoration-loader">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600 animate-pulse" dir="rtl">
            جاري استعادة الجلسة وتأمين حسابك...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-50 text-gray-900 font-sans selection:bg-sky-500 selection:text-white pb-20 md:pb-12 flex flex-col"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Navbar with auth status */}
      <Navbar
        user={user}
        userProfile={userProfile}
        lang={lang}
        setLang={setLang}
        unreadNotifications={unreadNotifications}
        onPostClick={() => {
          if (!user) {
            setShowAuthModal('signin');
          } else if (showProfileSetup) {
            setShowProfileSetup(true);
          } else {
            // Reset prefilled values upon general Post request click
            setPrefilledCategory(undefined);
            setPrefilledTitle(undefined);
            setPrefilledBudget(undefined);
            setShowCreateModal(true);
          }
        }}
        onOpenSettings={() => setShowSettingsModal(true)}
        onLoginClick={(mode) => setShowAuthModal(mode || 'signin')}
        currentView={currentView}
        onViewChange={handleViewChange}
        onSelectCategory={setCurrentCategory}
        currentCategory={currentCategory}
      />

      <main className="flex-grow w-full relative z-10 flex flex-col justify-start">
        {currentView === 'home' && (
          <HomePage
          tasks={tasks}
          loadingTasks={loadingTasks}
          lang={lang}
          user={user}
          userProfile={userProfile}
          onPostTask={() => {
            if (!user) {
              setShowAuthModal('signin');
            } else if (showProfileSetup) {
              setShowProfileSetup(true);
            } else {
              setShowCreateModal(true);
            }
          }}
          onExploreClick={() => {
            navigate('/explorer');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onTaskSelect={(task) => setSelectedTask(task)}
          onSearchSubmit={(term) => {
            setSearchTerm(term);
            navigate('/explorer');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onCategorySelect={(catId) => {
            setSelectedCategory(catId);
            navigate('/explorer');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLoginClick={(mode) => setShowAuthModal(mode || 'signin')}
        />
      )}

      {currentView === 'explorer' && (
        <div className="animate-fade-in flex flex-col w-full bg-slate-50">
          
          {/* 1. Full-width horizontal filter bar (Airtasker style) */}
          <section className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8 w-full sticky top-[68px] lg:top-[74px] z-20 shadow-xs">
            <div className="max-w-8xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Left group of filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Bar Input */}
                <div className="relative w-full sm:w-60">
                  <span className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center text-gray-400 pointer-events-none`}>
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className={`w-full text-[11px] sm:text-xs font-bold border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:outline-none rounded-xl ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2.5 bg-slate-50/50 text-gray-950 transition-colors`}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className={`absolute inset-y-0 ${isRTL ? 'left-2.5' : 'right-2.5'} flex items-center text-[10px] text-gray-400 hover:text-gray-600 font-extrabold`}>
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Dropdown Selector */}
                <div className="shrink-0">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-[11px] sm:text-xs border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:outline-none rounded-xl px-2.5 py-2.5 bg-slate-50/50 font-bold text-gray-700 cursor-pointer transition-colors"
                  >
                    <option value="all">{isRTL ? '🔑 جميع الفئات' : '🔑 Toutes catégories'}</option>
                    {SERVICE_CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>
                        {isRTL ? category.ar : category.fr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Neighborhood Dropdown Locator */}
                <div className="shrink-0">
                  <select
                    value={selectedNeighborhood}
                    onChange={(e) => setSelectedNeighborhood(e.target.value)}
                    className="text-[11px] sm:text-xs border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:outline-none rounded-xl px-2.5 py-2.5 bg-slate-50/50 font-bold text-gray-700 cursor-pointer transition-colors"
                  >
                    <option value="all">{isRTL ? '📍 حي الرباط/سلا/تمارة' : '📍 Quartiers Rabat-Salé-Témara'}</option>
                    {RABAT_NEIGHBORHOODS.map(district => (
                      <option key={district.id} value={district.id}>
                        {isRTL ? district.ar : district.fr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Maximum Price input limit filter */}
                <div className="relative w-full sm:w-44 shrink-0">
                  <span className={`absolute inset-y-0 ${isRTL ? 'right-2.5' : 'left-2.5'} flex items-center text-[10px] font-black text-slate-400 pointer-events-none uppercase`}>
                    {isRTL ? 'الحد الأقصى:' : 'Max budget:'}
                  </span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder={isRTL ? 'أقصى ميزانية' : 'Budget max'}
                    className={`w-full text-[11px] sm:text-xs font-bold border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:outline-none rounded-xl ${isRTL ? 'pr-20 pl-4' : 'pl-20 pr-4'} py-2.5 bg-slate-50/50 text-gray-900 transition-colors`}
                  />
                  {maxPrice && (
                    <button onClick={() => setMaxPrice('')} className={`absolute inset-y-0 ${isRTL ? 'left-2' : 'right-2'} flex items-center text-[11px] text-gray-400 hover:text-gray-600 font-extrabold`}>
                      ✕
                    </button>
                  )}
                </div>

                {/* Sort Option Dropdown */}
                <div className="shrink-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-[11px] sm:text-xs border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:outline-none rounded-xl px-2.5 py-2.5 bg-slate-50/50 font-bold text-gray-750 cursor-pointer transition-colors"
                  >
                    <option value="recent">{isRTL ? '⏱️ الأحدث أولاً' : '⏱️ Plus récentes'}</option>
                    <option value="price-desc">{isRTL ? '💰 السعر: الأعلى أولاً' : '💰 Prix : élevé'}</option>
                    <option value="price-asc">{isRTL ? '🏷️ السعر: الأقل أولاً' : '💰 Prix : bas'}</option>
                  </select>
                </div>
              </div>

              {/* Right group: Status toggling and stats count */}
              <div className="flex items-center justify-between sm:justify-start gap-3.5 shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                {/* Active only state toggle */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-black text-gray-600">
                    {isRTL ? 'تطبيقات مفتوحة' : 'Missions ouvertes'}
                  </span>
                  <button
                    onClick={() => setShowOnlyOpen(!showOnlyOpen)}
                    className={`w-8 h-5 rounded-full transition-colors relative cursor-pointer ${
                      showOnlyOpen ? 'bg-sky-600' : 'bg-gray-255'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      isRTL 
                        ? (showOnlyOpen ? 'right-0.5' : 'right-3.5') 
                        : (showOnlyOpen ? 'left-3.5' : 'left-0.5')
                    }`} />
                  </button>
                </div>

                {/* Quick reset if any filter is active */}
                {(searchTerm || selectedCategory !== 'all' || selectedNeighborhood !== 'all' || maxPrice || !showOnlyOpen) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedNeighborhood('all');
                      setMaxPrice('');
                      setShowOnlyOpen(true);
                      setSortBy('recent');
                    }}
                    className="text-[10px] text-sky-600 hover:text-sky-700 font-extrabold underline cursor-pointer transition-colors"
                  >
                    {isRTL ? 'مسح التصفية ↺' : 'Effacer ↺'}
                  </button>
                )}
              </div>

            </div>
          </section>

          {/* 2. Main Dual-Panel Split Screen View */}
          <div className="flex-grow w-full flex flex-col lg:flex-row relative">
            
            {/* Left Column: Vertical Scrollable Task Feed Container (45%) */}
            <section className="w-full lg:w-[45%] flex flex-col p-4 sm:p-5 lg:p-6 overflow-y-auto lg:h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-slate-200" id="tasks-scroll-feed-panel">
              
              {/* Local summary task count */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-150/60 shrink-0">
                <div className="text-right">
                  <h2 className="text-xs sm:text-sm font-black text-slate-900">
                    {isRTL ? `المهمات المعروضة في جهة الرباط (${filteredTasks.length})` : `Missions disponibles à Rabat (${filteredTasks.length})`}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {isRTL ? 'اضغط على المهمة لعرض كامل التفاصيل والإيداع الآمن' : 'Sélectionnez une tâche pour afficher les offres'}
                  </p>
                </div>
                
                {selectedNeighborhood !== 'all' && (
                  <button 
                    onClick={() => setSelectedNeighborhood('all')} 
                    className="text-[10px] text-sky-600 font-black hover:underline"
                  >
                    {isRTL ? 'كل الأحياء ↺' : 'Toutes les zones'}
                  </button>
                )}
              </div>

              {loadingTasks ? (
                <div className="flex flex-col gap-4 animate-pulse">
                  {[1, 2, 3].map(idx => (
                    <div key={idx} className="bg-white border border-gray-100 h-44 rounded-2xl p-5" />
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="bg-white border border-gray-150 rounded-3xl py-14 px-6 text-center flex flex-col items-center justify-center gap-3 shadow-2xs my-auto">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-gray-400 text-lg font-black">
                    🍃
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-800">{t.emptyTasks}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold max-w-xs mx-auto">
                    {isRTL ? 'يرجى تغيير خيارات البحث أو تصفية الفئة للأحياء المجاورة.' : 'Essayez d’autres critères.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4" id="tasks-feed-container">
                  {paginatedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      lang={lang}
                      onClick={() => setSelectedTask(task)}
                      onMouseEnter={() => setHoveredTaskId(task.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                      isHighlighted={hoveredTaskId === task.id}
                    />
                  ))}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200/80">
                      <button
                        onClick={() => {
                          setCurrentPage(prev => Math.max(prev - 1, 1));
                          const feedEl = document.getElementById('tasks-scroll-feed-panel');
                          if (feedEl) feedEl.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === 1}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 transition-colors ${
                          currentPage === 1
                            ? 'bg-slate-100/50 text-slate-400 cursor-not-allowed border-slate-100'
                            : 'bg-white text-slate-700 hover:bg-slate-50 cursor-pointer hover:border-slate-300'
                        }`}
                      >
                        {isRTL ? 'السابق' : 'Précédent'}
                      </button>
                      
                      <span className="text-[11px] font-black text-slate-500">
                        {isRTL 
                          ? `الصفحة ${currentPage} من ${totalPages}` 
                          : `Page ${currentPage} sur ${totalPages}`}
                      </span>

                      <button
                        onClick={() => {
                          setCurrentPage(prev => Math.min(prev + 1, totalPages));
                          const feedEl = document.getElementById('tasks-scroll-feed-panel');
                          if (feedEl) feedEl.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 transition-colors ${
                          currentPage === totalPages
                            ? 'bg-slate-100/50 text-slate-400 cursor-not-allowed border-slate-100'
                            : 'bg-white text-slate-700 hover:bg-slate-50 cursor-pointer hover:border-slate-300'
                        }`}
                      >
                        {isRTL ? 'التالي' : 'Suivant'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Right Column: Full height interactive map sticky in place (55%) */}
            <section 
              className="w-full lg:w-[55%] border-t lg:border-t-0 lg:border-r border-slate-200/60 bg-slate-100 flex flex-col h-[380px] lg:h-[calc(100vh-140px)] sticky bottom-0 lg:top-[140px]" 
              id="sticky-map-split-panel"
            >
              <div className="flex-1 w-full h-full relative overflow-hidden">
                <div className="absolute inset-0 [&>div]:border-none [&>div]:shadow-none [&>div]:p-0 [&_svg]:max-w-none">
                  <MapRabatMapTiler
                    tasks={tasks}
                    selectedNeighborhood={selectedNeighborhood}
                    onSelectNeighborhood={setSelectedNeighborhood}
                    lang={lang}
                    onSelectTask={(task) => setSelectedTask(task)}
                    hoveredTaskId={hoveredTaskId}
                    height="100%"
                  />
                </div>
              </div>
            </section>

          </div>
        </div>
      )}

      {currentView === 'how-it-works' && (
        <HowItWorksPage
          lang={lang}
          onPostTask={() => {
            if (!user) {
              setShowAuthModal('signin');
            } else if (showProfileSetup) {
              setShowProfileSetup(true);
            } else {
              setShowCreateModal(true);
            }
          }}
          onExploreClick={() => {
            navigate('/explorer');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLoginClick={(mode) => setShowAuthModal(mode || 'signin')}
        />
      )}

      {currentView === 'gifts' && (
        <GiftCardsPage
          lang={lang}
          user={user}
          userProfile={userProfile}
          onPostTask={() => {
            if (!user) {
              setShowAuthModal('signin');
            } else if (showProfileSetup) {
              setShowProfileSetup(true);
            } else {
              setShowCreateModal(true);
            }
          }}
          onLoginClick={(mode) => setShowAuthModal(mode || 'signin')}
        />
      )}

      {currentView === 'category-view' && (
        <CategoryPage
          categoryId={currentCategory}
          lang={lang}
          user={user}
          userProfile={userProfile}
          tasks={tasks}
          onBackToExplorer={() => {
            navigate('/explorer');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onPostTaskWithCategory={(categoryNameAr, categoryNameFr, catId) => {
            if (!user) {
              setShowAuthModal('signin');
              return;
            }
            // Populate defaults custom tailored to this categories' context!
            setPrefilledCategory(catId);
            setPrefilledTitle(isRTL ? `طلب مساعدة في ${categoryNameAr}` : `Besoin de service: ${categoryNameFr}`);
            
            // Deduce suggested pricing for the user
            const catMeta = DETAILED_CATEGORIES.find(c => c.id === catId);
            if (catMeta) {
              setPrefilledBudget(catMeta.basePrice);
            } else {
              setPrefilledBudget(200);
            }
            
            setShowCreateModal(true);
          }}
          onSelectTask={(task) => setSelectedTask(task)}
        />
      )}

      {currentView === 'dashboard' && user && (
        dashboardMode === 'worker' ? (
          userProfile?.role === 'client' ? (
            <div className="p-8 text-center" id="client-role-lock">
              <h2 className="text-lg font-bold text-red-600 mb-1">Access Restricted / غير مسموح بالدخول</h2>
              <p className="text-xs text-gray-500">حسابك مسجل كطالب خدمة (Client) ولا يمكنه تصفح لوحة مزودي الخدمات.</p>
            </div>
          ) : (
            <WorkerDashboard
              user={user}
              userProfile={userProfile}
              lang={lang}
              onSelectTask={(task) => setSelectedTask(task)}
              onOpenSettings={() => setShowSettingsModal(true)}
              onToggleToClient={userProfile?.role === 'tasker' ? undefined : () => navigate('/client/dashboard')}
              onViewChange={handleViewChange}
            />
          )
        ) : (
          userProfile?.role === 'tasker' ? (
            <div className="p-8 text-center" id="tasker-role-lock">
              <h2 className="text-lg font-bold text-red-600 mb-1">Access Restricted / غير مسموح بالدخول</h2>
              <p className="text-xs text-gray-500">حسابك مسجل كمنفذ خدمة (Tasker) ولا يمكنه تصفح لوحة طالبي الخدمات.</p>
            </div>
          ) : (
            <UserDashboard
              user={user}
              userProfile={userProfile}
              lang={lang}
              onSelectTask={(task) => setSelectedTask(task)}
              onOpenSettings={() => setShowSettingsModal(true)}
              onOpenCreateTask={() => navigate('/client/create-request')}
              onToggleToWorker={userProfile?.role === 'client' ? undefined : () => navigate('/tasker/dashboard')}
              onViewChange={handleViewChange}
            />
          )
        )
      )}

      {currentView === 'admin' && user && (
        (user.uid === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' || 
         user.email === 'cryptomourad1992@gmail.com' || 
         userProfile?.role === 'admin' || 
         userProfile?.isSuperAdmin) ? (
          <AdminPanel
            lang={lang}
            tasks={tasks}
          />
        ) : (
          <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-3xl border border-gray-100 shadow-xl" id="admin-denied-view">
            <h2 className="text-lg font-black text-rose-600 mb-2">Access Denied / غير مسموح بالدخول</h2>
            <p className="text-xs text-gray-500 leading-relaxed">هذه الصفحة مخصصة للمشرفين والمسؤولين عن إدارة منصة الرباط فقط ولا يمكنك تصفحها بحسابك الحالي.</p>
          </div>
        )
      )}
      </main>

      {/* Dynamic & Premium Footer Component */}
      <Footer
        lang={lang}
        setLang={setLang}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedNeighborhood={selectedNeighborhood}
        setSelectedNeighborhood={setSelectedNeighborhood}
        onViewChange={handleViewChange}
      />

      {/* 4. Overlay Modals */}
      
      {/* A. Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          user={user}
          userProfile={userProfile}
          lang={lang}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            // Task creation success callback (snapshot updates live real-time)
            setShowCreateModal(false);
          }}
          initialCategory={prefilledCategory}
          initialTitle={prefilledTitle}
          initialBudget={prefilledBudget}
        />
      )}

      {/* B. Task Details & Bid Panel */}
      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          user={user}
          userProfile={userProfile}
          lang={lang}
          onClose={() => setSelectedTask(null)}
          onStatusChange={() => {
            // Callback when task state/offer state modifications take effect
          }}
        />
      )}

      {/* C. User onboarding / first-time force profile setup Wizard (Disabled temporarily per user request) */}
      {/*
      {showProfileSetup && user && (
        <UserProfileSettings
          user={user}
          userProfile={userProfile}
          lang={lang}
          onClose={() => setShowProfileSetup(false)}
          onSave={handleProfileSaved}
          forceSetup={true}
        />
      )}
      */}

      {/* D. Standard User Settings Modals (Disabled temporarily per user request) */}
      {showSettingsModal && user && (
        <UserProfileSettings
          user={user}
          userProfile={userProfile}
          lang={lang}
          onClose={() => setShowSettingsModal(false)}
          onSave={handleProfileSaved}
          forceSetup={false}
        />
      )}

      {/* E. Custom Premium Auth Modal (Sign In, Sign Up, Password recovery) */}
      {showAuthModal && (
        <AuthModal
          lang={lang}
          initialMode={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={async () => {
            setShowAuthModal(false);
            if (auth.currentUser) {
              const role = await getUserRole(auth.currentUser.uid);
              if (role === "tasker") {
                navigate("/tasker/dashboard");
              } else {
                navigate("/client/dashboard");
              }
            }
          }}
        />
      )}

      {/* F. Fixed Bottom Navigation Bar for Mobile Viewports */}
      <BottomNavigation
        user={user}
        userProfile={userProfile}
        lang={lang}
        setLang={setLang}
        unreadNotifications={unreadNotifications}
        onPostClick={() => {
          if (!user) {
            setShowAuthModal('signin');
          } else if (showProfileSetup) {
            setShowProfileSetup(true);
          } else {
            setPrefilledCategory(undefined);
            setPrefilledTitle(undefined);
            setPrefilledBudget(undefined);
            setShowCreateModal(true);
          }
        }}
        onOpenSettings={() => setShowSettingsModal(true)}
        onLoginClick={(mode) => setShowAuthModal(mode || 'signin')}
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {/* Real-time Notification Popups */}
      <div className="fixed bottom-20 md:bottom-6 left-6 z-50 flex flex-col gap-3 max-w-sm w-[calc(100vw-3rem)] pr-2" dir={isRTL ? 'rtl' : 'ltr'}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className="bg-white border border-gray-200/80 rounded-2xl shadow-xl p-4 flex items-start gap-3 backdrop-blur-md relative overflow-hidden"
            >
              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse text-sky-600" />
              </div>
              <div className="flex-1 flex flex-col gap-0.5 text-right pr-2">
                <span className="text-xs font-black text-slate-900">{toast.title}</span>
                <span className="text-[11px] text-gray-600 font-bold leading-normal">{toast.body}</span>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-gray-300 hover:text-gray-500 hover:bg-gray-50 p-1 rounded-lg shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
