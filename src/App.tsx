import React, { useState, useEffect } from 'react';
import { 
  db, 
  auth, 
  onAuthStateChanged, 
  handleFirestoreError, 
  OperationType 
} from './lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { Task, UserProfile } from './types';
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
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import HomePage from './components/HomePage';
import UserDashboard from './components/UserDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import AdminPanel from './components/AdminPanel';

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
  Info 
} from 'lucide-react';

export default function App() {
  // Locale State
  const [lang, setLang] = useState<LanguageKey>('ar');
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  // Navigation View State
  const [currentView, setCurrentView] = useState<'home' | 'explorer' | 'dashboard' | 'admin'>('home');
  const [dashboardMode, setDashboardMode] = useState<'client' | 'worker'>('client');

  // Auth & Profile State
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // App Layout States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('all');
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);

  // 1. Auth Change Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          setCheckingProfile(true);
          // Check if user has an existing public profile in Firestore
          const profileDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (profileDoc.exists()) {
            const prof = profileDoc.data() as UserProfile;
            setUserProfile(prof);
            setShowProfileSetup(false);
            setDashboardMode(prof.isTasker ? 'worker' : 'client');
          } else {
            // Force Profile Setup Wizard for new Google users
            setUserProfile(null);
            setShowProfileSetup(true);
          }
        } catch (error) {
          console.error('Error fetching user profile metadata:', error);
        } finally {
          setCheckingProfile(false);
        }
      } else {
        setUserProfile(null);
        setShowProfileSetup(false);
      }
    });

    return () => unsub();
  }, []);

  // 2. Real-time Tasks Listener (ordered by newest tasks)
  useEffect(() => {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    
    setLoadingTasks(true);
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Task[] = [];
        snapshot.forEach((snapshotDoc) => {
          list.push({ id: snapshotDoc.id, ...snapshotDoc.data() } as Task);
        });
        setTasks(list);
        setLoadingTasks(false);

        // Update selected task reference if any status changed
        if (selectedTask) {
          const freshSelected = list.find(t => t.id === selectedTask.id);
          if (freshSelected) {
            setSelectedTask(freshSelected);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tasks');
        setLoadingTasks(false);
      }
    );

    return () => unsub();
  }, [selectedTask?.id]);

  // Handle saved profile callbacks
  const handleProfileSaved = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    setShowProfileSetup(false);
  };

  // 3. Local filtering of tasks
  const filteredTasks = tasks.filter((task) => {
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
    const matchesStatus = !showOnlyOpen || task.status === 'open';

    return matchesSearch && matchesCategory && matchesNeighborhood && matchesStatus;
  });

  return (
    <div 
      className="min-h-screen bg-slate-50 text-gray-900 font-sans selection:bg-sky-500 selection:text-white pb-12 flex flex-col"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Navbar with auth status */}
      <Navbar
        user={user}
        userProfile={userProfile}
        lang={lang}
        setLang={setLang}
        onPostClick={() => {
          if (!user) {
            setShowAuthModal(true);
          } else if (showProfileSetup) {
            setShowProfileSetup(true);
          } else {
            setShowCreateModal(true);
          }
        }}
        onOpenSettings={() => setShowSettingsModal(true)}
        onLoginClick={() => setShowAuthModal(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {currentView === 'home' && (
        <HomePage
          tasks={tasks}
          loadingTasks={loadingTasks}
          lang={lang}
          user={user}
          userProfile={userProfile}
          onPostTask={() => {
            if (!user) {
              setShowAuthModal(true);
            } else if (showProfileSetup) {
              setShowProfileSetup(true);
            } else {
              setShowCreateModal(true);
            }
          }}
          onExploreClick={() => {
            setCurrentView('explorer');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onTaskSelect={(task) => setSelectedTask(task)}
          onSearchSubmit={(term) => {
            setSearchTerm(term);
            setCurrentView('explorer');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onCategorySelect={(catId) => {
            setSelectedCategory(catId);
            setCurrentView('explorer');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLoginClick={() => setShowAuthModal(true)}
        />
      )}

      {currentView === 'explorer' && (
        <>
          {/* Hero Banner Area */}
          <section className="relative overflow-hidden bg-white border-b border-gray-100 py-12 sm:py-16 animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 via-white to-indigo-500/5 opacity-70 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 flex-row-reverse">
              
              <div className={`flex flex-col max-w-2xl ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100 w-fit mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'مرحباً بجمهور عاصمة الأنوار الرباط' : 'Bienvenue à la capitale de Rabat'}</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 leading-tight">
                  {isRTL ? (
                    <>
                      أنجز خدماتك المنزلية في <span className="text-sky-600 underline decoration-sky-300 decoration-wavy underline-offset-6">الرباط</span> بكل أمان
                    </>
                  ) : (
                    <>
                      Faites réaliser vos tâches à <span className="text-sky-600 underline">Rabat</span> en toute confiance
                    </>
                  )}
                </h1>
                
                <p className="text-sm sm:text-base text-gray-500 mt-4 leading-relaxed font-medium">
                  {t.tagline}
                </p>

                {/* Quick platform trust claims */}
                <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-gray-600 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isRTL ? 'توثيق فيربيز الآمن' : 'Sécurisé par Firebase'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{isRTL ? 'شيكات وأحياء حقيقية بالرباط' : 'Vrais quartiers de Rabat'}</span>
                  </span>
                </div>
              </div>

              {/* Quick task stats card */}
              <div className="w-full md:w-80 bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/20 rounded-full blur-2xl" />
                
                <div className="flex flex-col text-right col-reverse">
                  <span className="text-xs text-sky-400 font-bold">{isRTL ? 'إجمالي طلبات العمل المتاحة' : 'Total des offres en cours'}</span>
                  <span className="text-3xl font-black tracking-tight mt-1">{tasks.length} {isRTL ? 'مهمة في الرباط' : 'tâches'}</span>
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      setShowAuthModal(true);
                    } else {
                      setShowCreateModal(true);
                    }
                  }}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  {t.postTaskBtn}
                </button>
              </div>

            </div>
          </section>

          {/* Interactive Rabat Map Dashboard */}
          <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 animate-fade-in" id="rabat-map-dashboard-section">
            <RabatMap
              tasks={tasks}
              selectedNeighborhood={selectedNeighborhood}
              onSelectNeighborhood={setSelectedNeighborhood}
              lang={lang}
            />
          </section>

          {/* Main tasks explorer grid and filters */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Side: Filter Rail Panel */}
            <section className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex flex-col gap-5">
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3">
                  {isRTL ? 'خيارات التصفية والبحث' : 'Filtres de recherche'}
                </h3>

                {/* A. Search Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    {isRTL ? 'ابحث بكلمة دلالية' : 'Recherche par nom'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full text-xs border border-gray-200 rounded-xl pl-3 pr-9 py-2.5 focus:outline-none focus:border-sky-500"
                    />
                    <Search className={`absolute w-4 h-4 text-gray-400 top-3 ${isRTL ? 'right-3' : 'left-3'}`} />
                  </div>
                </div>

                {/* B. Category Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    {t.filterCategory}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl px-2 py-2.5 focus:outline-none focus:border-sky-500 bg-white"
                  >
                    <option value="all">{t.allCategories}</option>
                    {SERVICE_CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>
                        {isRTL ? category.ar : category.fr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* C. Neighborhood Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    {t.filterNeighborhood}
                  </label>
                  <select
                    value={selectedNeighborhood}
                    onChange={(e) => setSelectedNeighborhood(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl px-2 py-2.5 focus:outline-none focus:border-sky-500 bg-white"
                  >
                    <option value="all">{t.allNeighborhoods}</option>
                    {RABAT_NEIGHBORHOODS.map(district => (
                      <option key={district.id} value={district.id}>
                        {isRTL ? district.ar : district.fr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* D. Status Toggle */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                  <span className="text-xs font-bold text-gray-700">
                    {isRTL ? 'إظهار المهمات المفتوحة فقط' : 'Afficher seulement les tâches ouvertes'}
                  </span>
                  <button
                    onClick={() => setShowOnlyOpen(!showOnlyOpen)}
                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                      showOnlyOpen ? 'bg-sky-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      isRTL 
                        ? (showOnlyOpen ? 'left-1' : 'left-5') 
                        : (showOnlyOpen ? 'left-5' : 'left-1')
                    }`} />
                  </button>
                </div>

              </div>

              {/* Localized Safety Info cards */}
              <div className="bg-sky-50/50 border border-sky-100 rounded-3xl p-5 flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-sky-950">نظام الرباط الموثوق للخدمات</span>
                    <p className="text-[10px] text-sky-700 mt-1.5 leading-relaxed font-semibold">
                      جميع الخدمات مخصصة لسكان العاصمة الرباط. يتم تنسيق استلام وتسليم الأموال بين الزبون ومقدم الخدمة باتفاق متبادل.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Right Side: Bento Tasks Directory Grid */}
            <section className="lg:col-span-3">
              <div className="flex flex-col gap-6">
                
                {/* Folder Header Summary */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-gray-900">
                    {t.homeTitle} ({filteredTasks.length})
                  </h2>
                  <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                    {isRTL ? 'قم بالنقر على المهمة لعرض التفاصيل الكاملة والتقديم' : 'Cliquez sur la carte pour soumettre un tarif.'}
                  </span>
                </div>

                {loadingTasks ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map(idx => (
                      <div key={idx} className="bg-white border border-gray-100 h-44 rounded-2xl p-5" />
                    ))}
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="bg-white border border-gray-100 rounded-3xl py-12 px-6 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 text-lg font-semibold">
                      !
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">{t.emptyTasks}</h4>
                    <p className="text-xs text-gray-400 max-w-sm mt-1">
                      {isRTL ? 'يمكنك تغيير فلاتر التصفية أو الفئات لاستكشاف عروض أخرى مضافة في أحياء العاصمة.' : 'Changez de critères.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="tasks-bento-grid">
                    {filteredTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        lang={lang}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                  </div>
                )}

              </div>
            </section>

          </main>
        </>
      )}

      {currentView === 'dashboard' && user && (
        user.uid === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' ? (
          <AdminPanel
            lang={lang}
            tasks={tasks}
          />
        ) : (
          dashboardMode === 'worker' ? (
            <WorkerDashboard
              user={user}
              userProfile={userProfile}
              lang={lang}
              onSelectTask={(task) => setSelectedTask(task)}
              onOpenSettings={() => setShowSettingsModal(true)}
              onToggleToClient={() => setDashboardMode('client')}
            />
          ) : (
            <UserDashboard
              user={user}
              userProfile={userProfile}
              lang={lang}
              onSelectTask={(task) => setSelectedTask(task)}
              onOpenSettings={() => setShowSettingsModal(true)}
              onOpenCreateTask={() => setShowCreateModal(true)}
              onToggleToWorker={() => setDashboardMode('worker')}
            />
          )
        )
      )}

      {currentView === 'admin' && user && (
        <AdminPanel
          lang={lang}
          tasks={tasks}
        />
      )}

      {/* Dynamic & Premium Footer Component */}
      <Footer
        lang={lang}
        setLang={setLang}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedNeighborhood={selectedNeighborhood}
        setSelectedNeighborhood={setSelectedNeighborhood}
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

      {/* C. User onboarding / first-time force profile setup Wizard */}
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

      {/* D. Standard User Settings Modals (optional edits) */}
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
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
          }}
        />
      )}

    </div>
  );
}
