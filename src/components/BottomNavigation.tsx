import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Search, 
  Plus, 
  LayoutDashboard, 
  MoreHorizontal,
  Languages,
  Gift,
  HelpCircle,
  LogOut,
  LogIn,
  User,
  X
} from 'lucide-react';
import { LanguageKey, TRANSLATIONS } from '../data/rabatData';
import { UserProfile } from '../types';
import { auth, signOut } from '../lib/firebase';

interface BottomNavigationProps {
  user: any;
  userProfile: UserProfile | null;
  lang: LanguageKey;
  setLang: (lang: LanguageKey) => void;
  unreadNotifications?: number;
  onPostClick: () => void;
  onOpenSettings: () => void;
  onLoginClick: (mode?: 'signin' | 'signup') => void;
  currentView: 'home' | 'explorer' | 'dashboard' | 'admin' | 'how-it-works' | 'gifts' | 'category-view';
  onViewChange: (view: 'home' | 'explorer' | 'dashboard' | 'admin' | 'how-it-works' | 'gifts' | 'category-view') => void;
}

export default function BottomNavigation({
  user,
  userProfile,
  lang,
  setLang,
  unreadNotifications = 0,
  onPostClick,
  onOpenSettings,
  onLoginClick,
  currentView,
  onViewChange
}: BottomNavigationProps) {
  const isRTL = lang === 'ar';
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isAdmin = user && (
    user.uid === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' || 
    user.email === 'cryptomourad1992@gmail.com' || 
    userProfile?.role === 'admin' || 
    userProfile?.isSuperAdmin
  );

  // Translations object for Bottom Nav controls
  const UI_LABELS = {
    ar: {
      home: 'الرئيسية',
      missions: 'المهمات',
      publish: 'انشر مهمة',
      dashboard: 'لوحتي',
      more: 'المزيد',
      howItWorks: 'كيف يعمل؟',
      giftCards: 'بطاقات الهدايا',
      language: 'تغيير لغة التطبيق',
      logout: 'تسجيل الخروج',
      login: 'تسجيل الدخول',
      settings: 'إعدادات حسابي',
      close: 'إغلاق',
      menuTitle: 'خيارات Rabat Tasker السريعة'
    },
    fr: {
      home: 'Accueil',
      missions: 'Missions',
      publish: 'Publier',
      dashboard: 'Mon Espace',
      more: 'Plus',
      howItWorks: 'Comment ça marche',
      giftCards: 'Cadeaux',
      language: "Changer de langue",
      logout: 'Se déconnecter',
      login: 'Se connecter',
      settings: 'Mon Profil & Paramètres',
      close: 'Fermer',
      menuTitle: 'Menu Rabat Tasker'
    }
  };

  const labels = UI_LABELS[lang];

  const handleTabClick = (view: typeof currentView) => {
    setShowMoreMenu(false);
    onViewChange(view);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleTabClick('home');
    } catch (e) {
      console.error('Logout error inside bottom nav:', e);
    }
  };

  // Determine if a view is active
  const isTabActive = (tab: 'home' | 'explorer' | 'dashboard' | 'admin') => {
    if (tab === 'home' && currentView === 'home') return true;
    if (tab === 'explorer' && (currentView === 'explorer' || currentView === 'category-view')) return true;
    if (tab === 'dashboard' && currentView === 'dashboard') return true;
    if (tab === 'admin' && currentView === 'admin') return true;
    return false;
  };

  return (
    <>
      {/* BOTTOM NAVIGATION CONTAINER (MD:HIDDEN FOR MOBILE WORKFLOWS) */}
      <nav 
        id="app-bottom-navigation-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-45 bg-white/95 backdrop-blur-md border-t border-gray-150/80 shadow-[0_-5px_20px_rgba(0,0,0,0.06)] pb-safe-bottom"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto relative">
          
          {/* TAB 1: HOME */}
          <button
            id="bottom-nav-home-btn"
            onClick={() => handleTabClick('home')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all relative ${
              isTabActive('home') ? 'text-sky-600 font-black' : 'text-slate-400 hover:text-slate-600 font-bold'
            }`}
          >
            <Home className="w-5 h-5 transition-transform duration-200 active:scale-90" />
            <span className="text-[10px] mt-1 select-none tracking-tight">{labels.home}</span>
            {isTabActive('home') && (
              <motion.div 
                layoutId="activeTabIndicator" 
                className="absolute top-0 w-8 h-1 bg-sky-500 rounded-b-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          {/* TAB 2: EXPLORER / MISSIONS */}
          <button
            id="bottom-nav-explorer-btn"
            onClick={() => handleTabClick('explorer')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all relative ${
              isTabActive('explorer') ? 'text-sky-600 font-black' : 'text-slate-400 hover:text-slate-600 font-bold'
            }`}
          >
            <Search className="w-5 h-5 transition-transform duration-200 active:scale-90" />
            <span className="text-[10px] mt-1 select-none tracking-tight">{labels.missions}</span>
            {isTabActive('explorer') && (
              <motion.div 
                layoutId="activeTabIndicator" 
                className="absolute top-0 w-8 h-1 bg-sky-500 rounded-b-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          {/* TAB 3: CENTER ACCENTED ACTION BUTTON (POST A TASK) */}
          <div className="flex-1 flex justify-center -mt-6">
            <button
              id="bottom-nav-publish-task-btn"
              onClick={() => {
                setShowMoreMenu(false);
                onPostClick();
              }}
              className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg shadow-sky-500/30 border-4 border-white transition-all transform duration-200"
              title={labels.publish}
            >
              <Plus className="w-6 h-6 text-white stroke-[3px]" />
            </button>
          </div>

          {/* TAB 4: CLIENT FEEDBACK & DASHBOARD */}
          <button
            id="bottom-nav-dashboard-btn"
            onClick={() => {
              if (user) {
                handleTabClick(isAdmin ? 'admin' : 'dashboard');
              } else {
                onLoginClick('signin');
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all relative ${
              isTabActive(isAdmin ? 'admin' : 'dashboard') ? 'text-sky-600 font-black' : 'text-slate-400 hover:text-slate-600 font-bold'
            }`}
          >
            <div className="relative">
              <LayoutDashboard className="w-5 h-5 transition-transform duration-200 active:scale-90" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-455 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 select-none tracking-tight">
              {isAdmin ? (isRTL ? 'بوابة الإدارة' : 'Administration') : labels.dashboard}
            </span>
            {isTabActive(isAdmin ? 'admin' : 'dashboard') && (
              <motion.div 
                layoutId="activeTabIndicator" 
                className="absolute top-0 w-8 h-1 bg-sky-500 rounded-b-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          {/* TAB 5: MORE MENU EXPANDER */}
          <button
            id="bottom-nav-more-trigger"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all relative ${
              showMoreMenu ? 'text-sky-600 font-black' : 'text-slate-400 hover:text-slate-600 font-bold'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 transition-transform duration-200 ${showMoreMenu ? 'rotate-90' : ''}`} />
            <span className="text-[10px] mt-1 select-none tracking-tight">{labels.more}</span>
          </button>

        </div>
      </nav>

      {/* MORE MENU SLIDE-UP BOTTOM SHEET (MD:HIDDEN) */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            {/* Backdrop layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950 z-40 md:hidden"
              onClick={() => setShowMoreMenu(false)}
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-45 bg-white rounded-t-[2.5rem] border-t border-gray-150/80 shadow-[0_-15px_40px_rgba(0,0,0,0.15)] pb- safe-bottom max-h-[85vh] overflow-y-auto font-sans md:hidden"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Decorative drag handle line */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3" onClick={() => setShowMoreMenu(false)} />

              <div className="px-6 py-4">
                
                {/* Header section with closing option */}
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <div className="text-right">
                    <h3 className="text-sm font-black text-slate-900">{labels.menuTitle}</h3>
                    {user && (
                      <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                        {userProfile?.displayName || user.displayName}
                        {(user.uid === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' || user.email === 'cryptomourad1992@gmail.com' || userProfile?.role === 'admin' || userProfile?.isSuperAdmin) ? (
                          <span className="bg-purple-50 text-purple-700 text-[9px] px-1.5 py-0.5 rounded-md font-black mr-1.5 inline-block border border-purple-100">
                            {lang === 'ar' ? 'المشرف العام 👑' : 'Super Admin 👑'}
                          </span>
                        ) : userProfile?.isTasker && (
                          <span className="bg-emerald-50 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-md font-bold mr-1.5 inline-block">
                            {lang === 'ar' ? 'مهني مستقل 🌟' : 'Mandataire 🌟'}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowMoreMenu(false)}
                    className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer text-slate-500 text-xs font-bold"
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    {labels.close}
                  </button>
                </div>

                {/* Main Link Grid */}
                <div className="grid grid-cols-1 gap-2.5">
                  
                  {/* Option: How it works */}
                  <button
                    onClick={() => {
                      handleTabClick('how-it-works');
                    }}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border transition-all text-right w-full font-bold text-xs cursor-pointer ${
                      currentView === 'how-it-works' 
                        ? 'bg-sky-50 text-sky-600 border-sky-200 shadow-xs' 
                        : 'bg-slate-50/50 hover:bg-slate-50 border-gray-150 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4.5 h-4.5" />
                    </div>
                    <span className="flex-grow">{labels.howItWorks}</span>
                  </button>

                  {/* Option: Gift cards */}
                  <button
                    onClick={() => {
                      handleTabClick('gifts');
                    }}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border transition-all text-right w-full font-bold text-xs cursor-pointer ${
                      currentView === 'gifts' 
                        ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs' 
                        : 'bg-slate-50/50 hover:bg-slate-50 border-gray-150 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Gift className="w-4.5 h-4.5" />
                    </div>
                    <span className="flex-grow">{labels.giftCards}</span>
                  </button>

                  {/* Option: User profile settings (if logged in) */}
                  {user && (
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        onOpenSettings();
                      }}
                      className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border bg-slate-50/50 hover:bg-slate-50 border-gray-150 text-slate-700 transition-all text-right w-full font-bold text-xs cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                        <User className="w-4.5 h-4.5" />
                      </div>
                      <span className="flex-grow">{labels.settings}</span>
                    </button>
                  )}

                  {/* Option: Admin Panel (if admin) */}
                  {user && (user.uid === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' || user.email === 'cryptomourad1992@gmail.com' || userProfile?.role === 'admin' || userProfile?.isSuperAdmin) && (
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        onViewChange('admin');
                      }}
                      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border transition-all text-right w-full font-bold text-xs cursor-pointer ${
                        currentView === 'admin'
                          ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                          : 'bg-slate-50/50 hover:bg-slate-100 border-gray-150 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <LayoutDashboard className="w-4.5 h-4.5" />
                      </div>
                      <span className="flex-grow">{isRTL ? 'لوحة التحكم الإدارية' : 'Administration Admin'}</span>
                    </button>
                  )}

                  {/* Option: Change Language */}
                  <button
                    onClick={() => {
                      setLang(lang === 'ar' ? 'fr' : 'ar');
                    }}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border bg-slate-50/50 hover:bg-slate-50 border-gray-150 text-slate-700 transition-all text-right w-full font-bold text-xs cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Languages className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-grow flex items-center justify-between">
                      <span>{labels.language}</span>
                      <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md leading-none uppercase">
                        {lang === 'ar' ? 'Français' : 'العربية'}
                      </span>
                    </div>
                  </button>

                </div>

                {/* Footer action button: Logout or Login */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  {user ? (
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-700 text-xs font-black transition-all cursor-pointer"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      <span>{labels.logout}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        onLoginClick('signin');
                      }}
                      className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black rounded-2xl shadow-md transition-all cursor-pointer"
                    >
                      <LogIn className="w-4.5 h-4.5" />
                      <span>{labels.login}</span>
                    </button>
                  )}
                </div>

                <div className="mt-6 mb-16 text-center text-[10px] text-slate-400 font-bold">
                  Rabat Tasker Morocco • 2026
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
