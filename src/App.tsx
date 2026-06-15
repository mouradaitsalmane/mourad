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
import HowItWorksPage from './components/HowItWorksPage';

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
  const [currentView, setCurrentView] = useState<'home' | 'explorer' | 'dashboard' | 'admin' | 'how-it-works'>('home');
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
  const [showAuthModal, setShowAuthModal] = useState<false | 'signin' | 'signup'>(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('all');
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

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
    const matchesStatus = !showOnlyOpen || task.status === 'open' || task.status === 'held';

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
            setShowAuthModal('signin');
          } else if (showProfileSetup) {
            setShowProfileSetup(true);
          } else {
            setShowCreateModal(true);
          }
        }}
        onOpenSettings={() => setShowSettingsModal(true)}
        onLoginClick={(mode) => setShowAuthModal(mode || 'signin')}
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
              setShowAuthModal('signin');
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
          onLoginClick={(mode) => setShowAuthModal(mode || 'signin')}
        />
      )}

      {currentView === 'explorer' && (
        <div className="animate-fade-in flex flex-col w-full">
          {/* 1. Header Centered Title & Integrated Search Bar */}
          <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-8 text-center" id="explorer-modern-search-header">
            <h1 className="text-2xl sm:text-3.5xl font-black text-gray-950 tracking-tight mb-5">
              {isRTL ? 'اعثر على المهام في الرباط' : 'Trouvez des tâches à Rabat'}
            </h1>
            
            {/* Airtasker styling Search box */}
            <div className="max-w-2.5xl mx-auto relative shadow-md rounded-2xl group border border-slate-200 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100 bg-white transition-all duration-300">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full text-xs font-bold bg-transparent pl-4 pr-4 py-4.5 focus:outline-none text-gray-900 ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
              />
              <button 
                className={`absolute top-2 bottom-2 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs px-5 rounded-xl cursor-pointer transition-colors shadow-xs ${
                  isRTL ? 'left-2' : 'right-2'
                }`}
                onClick={() => {}}
              >
                {isRTL ? 'بحث' : 'Rechercher'}
              </button>
            </div>
          </section>

          {/* 2. Structured modern 3-column Airtasker layout matching percentages */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full grid grid-cols-1 lg:grid-cols-[20%_45%_35%] gap-6 items-start" id="explorer-main-hub">
            
            {/* Column A: Filters (20%) */}
            <section className="flex flex-col gap-5 lg:col-span-1 order-2 lg:order-none">
              <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex flex-col gap-5">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider border-b border-gray-50 pb-3">
                  {isRTL ? 'الفئة والموقع' : 'Filtres de recherche'}
                </h3>

                {/* B. Category Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-gray-600">
                    {t.filterCategory}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl px-2.5 py-3 focus:outline-none focus:border-sky-500 bg-slate-50/50 font-bold text-gray-700 cursor-pointer"
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
                  <label className="text-[11px] font-black text-gray-600">
                    {t.filterNeighborhood}
                  </label>
                  <select
                    value={selectedNeighborhood}
                    onChange={(e) => setSelectedNeighborhood(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl px-2.5 py-3 focus:outline-none focus:border-sky-500 bg-slate-50/50 font-bold text-gray-700 cursor-pointer"
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
                  <span className="text-[11px] font-black text-gray-600">
                    {isRTL ? 'إظهار المفتوحة فقط' : 'Tâches ouvertes'}
                  </span>
                  <button
                    onClick={() => setShowOnlyOpen(!showOnlyOpen)}
                    className={`w-9 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                      showOnlyOpen ? 'bg-sky-600' : 'bg-gray-250'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-all ${
                      isRTL 
                        ? (showOnlyOpen ? 'right-0.5' : 'right-4') 
                        : (showOnlyOpen ? 'left-4' : 'left-0.5')
                    }`} />
                  </button>
                </div>

              </div>

              {/* Solid safety trust notice details */}
              <div className="bg-sky-50/50 border border-sky-100 rounded-3xl p-4.5 flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-sky-600 text-sm mt-0.5">ℹ️</span>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-black text-sky-950">{isRTL ? 'مركز حماية الزبائن' : 'Sécurité Tasker'}</span>
                    <p className="text-[10px] text-sky-700 mt-1 leading-relaxed font-bold">
                      {isRTL 
                        ? 'تتم جميع المعاملات بالدرهم المغربي مع حماية الضمان الحصري.' 
                        : 'Paiements protégés par le compte séquestre de confiance.'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Column B: Tasks Feed (45%) */}
            <section className="flex flex-col gap-5 lg:col-span-1 order-3 lg:order-none">
              {/* Folder Header Summary */}
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-black text-gray-900">
                  {t.homeTitle} ({filteredTasks.length})
                </h2>
                {selectedNeighborhood !== 'all' && (
                  <button 
                    onClick={() => setSelectedNeighborhood('all')} 
                    className="text-[10px] text-sky-600 font-extrabold hover:underline"
                  >
                    {isRTL ? 'عرض الكل ↺' : 'Tout afficher'}
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
                <div className="bg-white border border-gray-150 rounded-3xl py-14 px-6 text-center flex flex-col items-center justify-center gap-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-gray-400 text-lg font-black">
                    🍃
                  </div>
                  <h4 className="text-sm font-black text-slate-800">{t.emptyTasks}</h4>
                  <p className="text-xs text-slate-400 font-semibold max-w-sm">
                    {isRTL ? 'يرجى تغيير خيارات البحث أو تصفية الفئة للأحياء المجاورة.' : 'Essayez d’autres critères.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4.5" id="tasks-feed-container">
                  {filteredTasks.map((task) => (
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
                </div>
              )}
            </section>

            {/* Column C: Sticky Map Column (35%) */}
            <section 
              className="block lg:sticky bg-white border border-gray-150 shadow-sm overflow-hidden flex flex-col order-1 lg:order-none h-[380px] lg:h-[calc(100vh-120px)] lg:top-[90px]"
              style={{
                borderRadius: '24px'
              }}
              id="sticky-sidebar-map-parent"
            >
              {/* Header inside the Map sidebar */}
              <div className="bg-slate-900 border-b border-slate-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 font-black text-xs">
                  <span className="text-sm shrink-0">📍</span>
                  <span>{isRTL ? 'الرباط' : 'Rabat'}</span>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full text-[10.5px] font-black border border-white/10 text-amber-400">
                  {filteredTasks.length} {isRTL ? 'مهمة متاحة' : 'tâches disponibles'}
                </div>
              </div>

              {/* The Map view itself filling remaining height */}
              <div className="flex-1 w-full relative bg-slate-50 overflow-hidden">
                <div className="absolute inset-0 [&>div]:border-none [&>div]:shadow-none [&>div]:p-0 [&_svg]:max-w-none">
                  <RabatMap
                    tasks={tasks}
                    selectedNeighborhood={selectedNeighborhood}
                    onSelectNeighborhood={setSelectedNeighborhood}
                    lang={lang}
                    onSelectTask={(task) => setSelectedTask(task)}
                    sidebarMode={true}
                    hoveredTaskId={hoveredTaskId}
                  />
                </div>
              </div>
            </section>

          </main>
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
            setCurrentView('explorer');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLoginClick={(mode) => setShowAuthModal(mode || 'signin')}
        />
      )}

      {currentView === 'dashboard' && user && (
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
        onViewChange={setCurrentView}
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
          initialMode={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
          }}
        />
      )}

    </div>
  );
}
