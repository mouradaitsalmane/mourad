import React, { useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut 
} from '../lib/firebase';
import { UserProfile } from '../types';
import { TRANSLATIONS, LanguageKey } from '../data/rabatData';
import { DETAILED_CATEGORIES } from '../data/categoriesData';
import { 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  Star,
  MapPin,
  Settings,
  Gift,
  Copy,
  Check,
  X,
  Lock,
  Search,
  ChevronDown,
  Wrench,
  Grid,
  Menu
} from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
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
  onSelectCategory: (id: string) => void;
  currentCategory: string;
}

export default function Navbar({
  user,
  userProfile,
  lang,
  setLang,
  unreadNotifications = 0,
  onPostClick,
  onOpenSettings,
  onLoginClick,
  currentView,
  onViewChange,
  onSelectCategory,
  currentCategory
}: NavbarProps) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';
  
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Category Mega-Menu state
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');

  const handleLogin = (mode?: 'signin' | 'signup') => {
    onLoginClick(mode);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onViewChange('home');
    } catch (error) {
      console.error('Logout action failed:', error);
    }
  };

  const isAdmin = user && (
    user.uid === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' || 
    user.email === 'cryptomourad1992@gmail.com' || 
    userProfile?.role === 'admin' || 
    userProfile?.isSuperAdmin
  );

  const hidePostButton = user && (isAdmin || userProfile?.isTasker === true);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-150/80 shadow-sm transition-all duration-300" dir="ltr">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        
        {/* Brand & Clickable Logo to return Home with prominent "Post Task" button */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div 
            className="flex items-center gap-2 cursor-pointer select-none group focus:outline-none"
            onClick={() => onViewChange('home')}
          >
            <Logo size="xl" className="transition-transform group-hover:scale-105 duration-200" />
          </div>

          {/* Premium "Post a Task" Action Button - next to the logo, hidden for admin/tasker */}
          {!hidePostButton && (
            <button
              onClick={onPostClick}
              className="flex bg-sky-500 hover:bg-sky-600 hover:scale-105 text-white text-[9px] sm:text-xs font-black px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 shrink-0 border border-sky-450"
              id="navbar-surgical-post-btn"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-100 animate-pulse shrink-0" />
              <span>{isRTL ? 'انشر مهمة مجاناً ✨' : 'Publier une tâche ✨'}</span>
            </button>
          )}
        </div>

        {/* View Toggle Tabs - Home vs Browse Tasks vs Dashboard vs Admin */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => onViewChange('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              currentView === 'home'
                ? 'bg-white text-slate-900 shadow-sm scale-102 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {isRTL ? 'الرئيسية' : 'Accueil'}
          </button>

          <button
            onClick={() => onViewChange('how-it-works')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              currentView === 'how-it-works'
                ? 'bg-white text-slate-900 shadow-sm scale-102 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {isRTL ? 'كيف يعمل ؟' : 'Comment ça marche'}
          </button>
          
          <button
            onClick={() => onViewChange('explorer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              currentView === 'explorer'
                ? 'bg-white text-slate-900 shadow-sm scale-102 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="browse-tasks-navbar-tab"
          >
            {isRTL ? 'تصفح المهمات' : 'Missions'}
          </button>

          {/* Tasker Categories Search & Select Group Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                currentView === 'category-view' || isCategoriesOpen
                  ? 'bg-white text-sky-600 shadow-xs border border-sky-100 font-extrabold scale-102'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="categories-dropdown-trigger"
            >
              <span>{isRTL ? 'الفئات' : 'Catégories'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoriesOpen ? 'rotate-180 text-sky-500' : 'text-slate-400'}`} />
            </button>

            {isCategoriesOpen && (
              <>
                {/* Backdrop to close overlay easily */}
                <div className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px]" onClick={() => setIsCategoriesOpen(false)} />
                <div 
                  className="fixed lg:absolute top-20 lg:top-12 z-50 w-[740px] max-w-[95vw] bg-white border border-slate-150 rounded-3xl p-5 sm:p-6 shadow-2xl text-right animate-scale-up"
                  style={{
                    [isRTL ? 'right' : 'left']: isRTL ? '-320px' : '-160px',
                  }}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase text-sky-600 tracking-wider">
                        {isRTL ? 'تصفح الاختصاصات والمهن' : 'EXPLOREZ NOS METIERS'}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-0.5">
                        {isRTL ? 'Tasker الرباط: فئة متكاملة' : 'Tasker Rabat : catégories actives'}
                      </h4>
                    </div>
                    {/* Clear Search helper */}
                    {catSearch && (
                      <button 
                        onClick={() => setCatSearch('')}
                        className="text-[10px] font-bold text-sky-600 hover:underline cursor-pointer"
                      >
                        {isRTL ? 'إعادة تعيين ↺' : 'Réinitialiser'}
                      </button>
                    )}
                  </div>

                  {/* Search box within mega-dropdown */}
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={catSearch}
                      onChange={(e) => setCatSearch(e.target.value)}
                      placeholder={isRTL ? 'ابحث عبر فئات الخدمة بالرباط (مثال: نجار، تجميل، بناء...)' : 'Rechercher parmi les métiers à Rabat...'}
                      className="w-full text-xs font-bold border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 transition-all pl-10 text-right"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute top-3.5 left-4.5" />
                  </div>

                  {/* Search Mode active listing */}
                  {catSearch.trim() !== '' ? (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {DETAILED_CATEGORIES.filter(cat => {
                          const q = catSearch.toLowerCase();
                          return cat.ar.toLowerCase().includes(q) || cat.fr.toLowerCase().includes(q);
                        }).map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              onSelectCategory(cat.id);
                              onViewChange('category-view');
                              setIsCategoriesOpen(false);
                              setCatSearch('');
                            }}
                            className="text-xs font-extrabold text-slate-700 hover:text-sky-600 hover:bg-sky-50 p-2.5 rounded-xl border border-slate-100 hover:border-sky-100 text-right transition-all cursor-pointer truncate flex items-center justify-between"
                          >
                            <span>{isRTL ? cat.ar : cat.fr}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{cat.basePrice} DH</span>
                          </button>
                        ))}
                      </div>
                      {DETAILED_CATEGORIES.filter(cat => {
                        const q = catSearch.toLowerCase();
                        return cat.ar.toLowerCase().includes(q) || cat.fr.toLowerCase().includes(q);
                      }).length === 0 && (
                        <div className="text-center py-8 text-slate-400 font-extrabold text-xs">
                          {isRTL ? 'لم يتم العثور على فئة تطابق بحثك بالرباط' : 'Aucune catégorie correspondante'}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Grouped category listing when search is empty */
                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                      {[
                        { id: 'home', ar: '🏡 خدمات الصيانة والمنزل', fr: '🏡 Maison & Bricolage' },
                        { id: 'professional', ar: '💼 الخدمات والاستشارات المهنية', fr: '💼 Services Professionnels' },
                        { id: 'tech', ar: '💻 التكنولوجيا والبرمجة والدعم', fr: '💻 Tech, Digital & Informatique' },
                        { id: 'events', ar: '🎈 المناسبات والحفلات والتنظيم', fr: '🎈 Événements & Créativité' },
                        { id: 'other', ar: '🚗 النقل والتوصيل وخدمات أخرى', fr: '🚗 Transport & Divers' }
                      ].map(grp => {
                        const grpCategories = DETAILED_CATEGORIES.filter(c => c.group === grp.id);
                        return (
                          <div key={grp.id} className="border-b border-slate-100 pb-3 last:border-none">
                            <h5 className="text-[11px] font-black uppercase text-sky-600 mb-2 mt-1 flex items-center justify-start gap-1">
                              <span>{isRTL ? grp.ar : grp.fr}</span>
                              <span className="text-[9px] bg-sky-5 px-1.5 py-0.5 rounded-md text-sky-700">({grpCategories.length})</span>
                            </h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                              {grpCategories.map(cat => (
                                <button
                                  key={cat.id}
                                  onClick={() => {
                                    onSelectCategory(cat.id);
                                    onViewChange('category-view');
                                    setIsCategoriesOpen(false);
                                    setCatSearch('');
                                  }}
                                  className={`text-[10.5px] font-bold px-2 py-1.5 rounded-lg text-right transition-all cursor-pointer truncate ${
                                    currentCategory === cat.id 
                                      ? 'bg-sky-50 text-sky-700 font-extrabold' 
                                      : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {isRTL ? cat.ar : cat.fr}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Bottom reassurance caption */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 mt-4 text-[9px] text-slate-400 font-bold text-center">
                    {isRTL 
                      ? 'جميع أسعار الساعات تقديرية ويمكن التفاوض عليها مباشرة مع مقدم الخدمة بالرباط.' 
                      : 'Les tarifs horaires sont indicatifs et se négocient librement de gré à gré sur Rabat.'}
                  </div>
                </div>
              </>
            )}
          </div>

          {user && (
            <>
              {!isAdmin && (
                <button
                  onClick={() => onViewChange('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer relative ${
                    currentView === 'dashboard'
                      ? 'bg-white text-slate-900 shadow-sm scale-102 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{isRTL ? 'لوحة التحكم' : 'Tableau de bord'}</span>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                  )}
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => onViewChange('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 relative ${
                    currentView === 'admin'
                      ? 'bg-sky-500 text-white shadow-sm scale-102 font-extrabold'
                      : 'text-sky-600 hover:text-sky-800'
                  }`}
                >
                  <Settings className={`w-3.5 h-3.5 ${currentView === 'admin' ? 'text-white' : 'text-sky-600'}`} />
                  <span>{isRTL ? 'بوابة الإدارة' : 'Administration'}</span>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Global actions: Language, Login & New Task */}
        <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 shrink-0">
          
          {/* Language toggle selector */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
            className="px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-gray-200 bg-slate-50 hover:bg-slate-100 text-[10px] sm:text-[11px] font-extrabold text-slate-700 transition-all cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
            id="lang-toggle-btn"
            title={lang === 'ar' ? 'Interface en Français' : 'الواجهة بالعربية'}
          >
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-sky-500 shrink-0" />
            <span>{lang === 'ar' ? 'FR' : 'عربي'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
              {/* Profile card metadata */}
              <div className="hidden xl:flex flex-col text-right items-end justify-center shrink-0">
                <span className="text-xs font-black text-gray-950 flex items-center gap-1">
                  {userProfile?.displayName || user.displayName}
                  {userProfile?.isTasker && (
                    <span className="bg-emerald-50 text-emerald-700 text-[8px] px-1.5 py-0.5 rounded-md font-extrabold border border-emerald-200/50 shrink-0">
                      {t.taskerBadge}
                    </span>
                  )}
                </span>
                
                <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-extrabold mt-0.5">
                  {userProfile?.rating && userProfile.rating > 0 ? (
                    <span className="flex items-center gap-0.5 text-amber-500 shrink-0">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 inline shrink-0" />
                      {userProfile.rating.toFixed(1)}
                    </span>
                  ) : null}
                  {userProfile?.location && (
                    <span className="flex items-center gap-0.5 text-slate-400 truncate max-w-[80px]" title={userProfile.location}>
                      <MapPin className="w-2.5 h-2.5 text-sky-500 shrink-0" />
                      {userProfile.location}
                    </span>
                  )}
                </div>
              </div>

              {/* User Avatar with Profile Settings action removed per user request */}

              {/* Create Task button */}
              {!hidePostButton && (
                <button
                  onClick={onPostClick}
                  className="hidden md:flex bg-sky-600 hover:bg-sky-700 text-white text-[10px] sm:text-xs font-black px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  id="navbar-post-task-btn"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-200 animate-pulse shrink-0" />
                  <span>{isRTL ? 'نشر مهمة' : 'Publier'}</span>
                </button>
              )}

              {/* Logout button - Desktop only */}
              <button
                onClick={handleLogout}
                className="hidden md:block p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all cursor-pointer active:scale-95 shrink-0"
                title={t.logout}
                id="logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Sign In Button */}
              <button
                onClick={() => handleLogin('signin')}
                className="px-2 py-1.5 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] sm:text-xs font-black transition-all cursor-pointer active:scale-95 shrink-0"
                id="header-signin-btn"
              >
                {isRTL ? 'تسجيل الدخول' : 'Se connecter'}
              </button>

              {/* Sign Up Button - hidden on extra small viewports */}
              <button
                onClick={() => handleLogin('signup')}
                className="hidden sm:flex bg-sky-600 hover:bg-sky-700 text-white text-xs font-black px-3.5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                id="header-signup-btn"
              >
                <span>{isRTL ? 'إنشاء حساب' : "S'inscrire"}</span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer active:scale-95 shrink-0"
            aria-label="Toggle mobile menu"
            id="mobile-menu-toggle-btn"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-sky-600" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* 📱 Mobile Dropdown Menu Drawer (Optimized Layout System) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-150 shadow-lg divide-y divide-slate-100 animate-fade-in relative z-50 transition-all" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="px-4 py-3 flex flex-col gap-1.5">
            <button
              onClick={() => {
                onViewChange('home');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs font-black transition-all ${
                currentView === 'home' ? 'bg-sky-50 text-sky-600 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isRTL ? 'الرئيسية' : 'Accueil'}
            </button>
            
            <button
              onClick={() => {
                onViewChange('how-it-works');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs font-black transition-all ${
                currentView === 'how-it-works' ? 'bg-sky-50 text-sky-600 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isRTL ? 'كيف يعمل ؟' : 'Comment ça marche'}
            </button>

            <button
              onClick={() => {
                onViewChange('explorer');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs font-black transition-all ${
                currentView === 'explorer' ? 'bg-sky-50 text-sky-600 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isRTL ? 'تصفح المهمات' : 'Missions'}
            </button>

            <button
              onClick={() => {
                setIsCategoriesOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all`}
            >
              {isRTL ? 'تصفح فئات الخدمات ' : 'Catégories / Métiers '}
            </button>
          </div>

          <div className="px-4 py-3 sm:py-4 flex flex-col gap-2.5 bg-slate-50/50">
            {/* Show gift cards panel in menu */}
            <button
              onClick={() => {
                onViewChange('gifts');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-xl text-xs font-black text-amber-800 bg-amber-50 hover:bg-amber-100 flex items-center justify-between col-span-2 ${
                isRTL ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              <Gift className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>{isRTL ? 'حصرياً: بطاقات هدايا تاسكر الرباط 💝' : 'Cartes cadeaux Rabat 💝'}</span>
            </button>

            {/* User auth layout */}
            {!user ? (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => {
                    handleLogin('signin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 border border-slate-200 bg-white rounded-xl text-xs font-black text-slate-700 hover:bg-slate-150"
                >
                  {isRTL ? 'تسجيل الدخول' : 'Se connecter'}
                </button>
                <button
                  onClick={() => {
                    handleLogin('signup');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 bg-sky-600 text-white rounded-xl text-xs font-black hover:bg-sky-700"
                >
                  {isRTL ? 'إنشاء حساب جديد' : "S'inscrire"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 pt-1">
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isRTL ? 'تسجيل الخروج' : 'Se déconnecter'}</span>
                  </button>

                  <div className="flex items-center gap-2 cursor-pointer text-right" onClick={() => { onOpenSettings(); setIsMobileMenuOpen(false); }}>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900 leading-tight">
                        {userProfile?.displayName || user.displayName}
                      </span>
                      <span className="text-[10px] text-sky-600 font-extrabold hover:underline">
                        {isRTL ? 'تعديل الملف الشخصي' : 'Modifier le profil'}
                      </span>
                    </div>
                    <img
                      src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt="User Profile"
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💝 INTERACTIVE TASKER GIFT CARD MODAL (Keeping "b9a lhadiya" beautifully alive) */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in text-slate-900 leading-normal" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-100 max-w-md w-full p-6 sm:p-8 overflow-hidden transform scale-100 transition-all text-right">
            
            {/* Close button */}
            <button 
              onClick={() => {
                setShowGiftModal(false);
                setCopiedCode(null);
              }}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sparkle background element */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
            
            {/* Modal Title Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Gift className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {isRTL ? 'بطاقات الهدايا من Tasker' : 'Cartes cadeaux Tasker'}
              </h3>
              <p className="text-xs text-gray-400 font-extrabold mt-1">
                {isRTL 
                  ? 'أفضل هدية لأصدقائك وعائلتك بالرباط! أهدِهم رصيداً مميزاً لإنجاز مهامهم اليومية.' 
                  : 'Faites plaisir à vos proches en leur offrant du crédit de services de confiance.'}
              </p>
            </div>

            {/* 3 Premium Visual Card options */}
            <div className="space-y-4 relative min-h-[300px]">
              {!user && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[5px] rounded-3xl z-30 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 shadow-xs">
                    <Lock className="w-5 h-5 animate-bounce" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-1">
                    {isRTL ? 'ميزة حصرية للمستخدمين المسجلين' : 'Réservé aux membres'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-extrabold mb-4 max-w-[240px]">
                    {isRTL 
                      ? 'يرجى تسجيل الدخول أو إنشاء حساب مجاني لعرض بطاقات الهدايا الترويجية لـ Tasker ونسخ الأكواد الخاصة بك!' 
                      : 'Veuillez vous connecter ou créer un compte gratuit pour utiliser les cartes cadeaux Tasker !'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowGiftModal(false);
                        handleLogin('signin');
                      }}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 text-slate-700 text-[10px] font-black hover:bg-slate-50 transition-all cursor-pointer active:scale-95"
                    >
                      {isRTL ? 'تسجيل الدخول' : 'Se connecter'}
                    </button>
                    <button
                      onClick={() => {
                        setShowGiftModal(false);
                        handleLogin('signup');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black transition-all cursor-pointer active:scale-95"
                    >
                      {isRTL ? 'إنشاء حساب' : "S'inscrire"}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Gold Card */}
              <div className="p-4 rounded-2.5xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white relative shadow-md overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-md group-hover:scale-110 transition-transform" />
                <div className="flex justify-between items-start z-10 relative">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-100">
                      {isRTL ? 'بطاقة بريميوم ذهبية' : 'CARTE PREMIUM OR'}
                    </span>
                    <h4 className="text-base font-black mt-0.5">Tasker Gold Spark</h4>
                  </div>
                  <span className="text-xl font-black">500 DH</span>
                </div>
                <div className="flex justify-between items-center mt-6 z-10 relative">
                  <span className="text-[10px] font-mono tracking-widest opacity-90">RABAT-GOLD-500</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('RABAT-GOLD-500');
                      setCopiedCode('RABAT-GOLD-500');
                      setTimeout(() => setCopiedCode(null), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] font-black tracking-wide flex items-center gap-1 cursor-pointer transition-all active:scale-95 text-white border border-white/15"
                  >
                    {copiedCode === 'RABAT-GOLD-500' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-amber-100" />
                        <span>{isRTL ? 'تم النسخ' : 'Copié'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'نسخ الكود' : 'Copier'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Blue Card */}
              <div className="p-4 rounded-2.5xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white relative shadow-md overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-md group-hover:scale-110 transition-transform" />
                <div className="flex justify-between items-start z-10 relative">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-100">
                      {isRTL ? 'بطاقة الراحة الزرقاء' : 'CARTE CONFORT BLEUE'}
                    </span>
                    <h4 className="text-base font-black mt-0.5">Tasker Everyday Comfort</h4>
                  </div>
                  <span className="text-xl font-black">200 DH</span>
                </div>
                <div className="flex justify-between items-center mt-6 z-10 relative">
                  <span className="text-[10px] font-mono tracking-widest opacity-90">RABAT-BLUE-200</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('RABAT-BLUE-200');
                      setCopiedCode('RABAT-BLUE-200');
                      setTimeout(() => setCopiedCode(null), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] font-black tracking-wide flex items-center gap-1 cursor-pointer transition-all active:scale-95 text-white border border-white/15"
                  >
                    {copiedCode === 'RABAT-BLUE-200' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-sky-100" />
                        <span>{isRTL ? 'تم النسخ' : 'Copié'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'نسخ الكود' : 'Copier'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Purple Card */}
              <div className="p-4 rounded-2.5xl bg-gradient-to-r from-purple-500 to-pink-600 text-white relative shadow-md overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-md group-hover:scale-110 transition-transform" />
                <div className="flex justify-between items-start z-10 relative">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-100">
                      {isRTL ? 'بطاقة الخدمة السريعة البنفسجية' : 'CARTE SERVICE RAPIDE VIOLETTE'}
                    </span>
                    <h4 className="text-base font-black mt-0.5">Tasker Fast Runner</h4>
                  </div>
                  <span className="text-xl font-black">100 DH</span>
                </div>
                <div className="flex justify-between items-center mt-6 z-10 relative">
                  <span className="text-[10px] font-mono tracking-widest opacity-90">RABAT-PINK-100</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('RABAT-PINK-100');
                      setCopiedCode('RABAT-PINK-100');
                      setTimeout(() => setCopiedCode(null), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] font-black tracking-wide flex items-center gap-1 cursor-pointer transition-all active:scale-95 text-white border border-white/15"
                  >
                    {copiedCode === 'RABAT-PINK-100' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-purple-100" />
                        <span>{isRTL ? 'تم النسخ' : 'Copié'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'نسخ الكود' : 'Copier'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Note */}
            <div className="mt-6 text-center text-[10px] text-gray-400 font-extrabold leading-relaxed">
              {isRTL 
                ? 'ملاحظة: يمكنك إدخال هذه الأكواد التجريبية الترويجية للحصول على غطاء رصيدي تلقائي عند الدفع للطلبات.' 
                : 'Note : Saisissez ces codes promotionnels premium pour déduire directement le montant lors du paiement.'}
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
