import React from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut 
} from '../lib/firebase';
import { UserProfile } from '../types';
import { TRANSLATIONS, LanguageKey } from '../data/rabatData';
import { 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  Star,
  MapPin,
  Settings
} from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  user: any;
  userProfile: UserProfile | null;
  lang: LanguageKey;
  setLang: (lang: LanguageKey) => void;
  onPostClick: () => void;
  onOpenSettings: () => void;
  onLoginClick: () => void;
  currentView: 'home' | 'explorer' | 'dashboard' | 'admin';
  onViewChange: (view: 'home' | 'explorer' | 'dashboard' | 'admin') => void;
}

export default function Navbar({
  user,
  userProfile,
  lang,
  setLang,
  onPostClick,
  onOpenSettings,
  onLoginClick,
  currentView,
  onViewChange
}: NavbarProps) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  const handleLogin = () => {
    onLoginClick();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onViewChange('home');
    } catch (error) {
      console.error('Logout action failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-150/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Clickable Logo to return Home */}
        <div 
          className="flex items-center gap-2 cursor-pointer select-none group"
          onClick={() => onViewChange('home')}
        >
          <Logo size="md" showText={true} />
          <span className="text-[10px] text-slate-400 font-bold tracking-wider px-2 py-1 bg-slate-50 border border-slate-150 rounded-lg hidden lg:inline-block mt-0.5">
            {lang === 'ar' ? 'مباشر 🟢' : 'Live 🟢'}
          </span>
        </div>

        {/* View Toggle Tabs - Home vs Browse Tasks vs Dashboard vs Admin */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => onViewChange('home')}
            className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
              currentView === 'home'
                ? 'bg-white text-slate-900 shadow-xs scale-102 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {isRTL ? 'الصفحة الرئيسية' : 'Accueil'}
          </button>
          
          <button
            onClick={() => onViewChange('explorer')}
            className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
              currentView === 'explorer'
                ? 'bg-white text-slate-900 shadow-xs scale-102 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="browse-tasks-navbar-tab"
          >
            {isRTL ? 'خريطة تصفح المهمات' : 'Tâches'}
          </button>

          {user && (
            <>
              <button
                onClick={() => onViewChange('dashboard')}
                className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-white text-slate-900 shadow-xs scale-102 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isRTL ? 'لوحة تحكم المستخدم' : 'Tableau de bord'}
              </button>

              {user.uid === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' && (
                <button
                  onClick={() => onViewChange('admin')}
                  className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentView === 'admin'
                      ? 'bg-sky-500 text-white shadow-xs scale-102 font-extrabold'
                      : 'text-sky-600 hover:text-sky-800'
                  }`}
                >
                  <Settings className={`w-3.5 h-3.5 ${currentView === 'admin' ? 'text-white' : 'text-sky-600'}`} />
                  <span>{isRTL ? 'لوحة إدارة الموقع' : 'Administration'}</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Global actions: Language, Login & New Task */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Language toggle selector */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
            className="px-3.5 py-2 rounded-xl border border-gray-200/80 text-xs font-bold text-gray-700 hover:bg-slate-50 hover:border-gray-300 transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95"
            id="lang-toggle-btn"
          >
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>{lang === 'ar' ? 'Français' : 'العربية'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Profile card metadata */}
              <div className="hidden md:flex flex-col text-right items-end justify-center">
                <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  {userProfile?.displayName || user.displayName}
                  {userProfile?.isTasker && (
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold border border-emerald-200/50">
                      {t.taskerBadge}
                    </span>
                  )}
                </span>
                
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold mt-0.5">
                  {userProfile?.rating && userProfile.rating > 0 ? (
                    <span className="flex items-center gap-0.5 text-amber-500">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500 inline" />
                      {userProfile.rating.toFixed(1)}
                    </span>
                  ) : null}
                  {userProfile?.location && (
                    <span className="flex items-center gap-0.5 text-slate-400">
                      <MapPin className="w-3 h-3 text-sky-500" />
                      {userProfile.location}
                    </span>
                  )}
                </div>
              </div>

              {/* User Avatar with Profile Settings action */}
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 opacity-20 group-hover:opacity-80 transition duration-300 blur-xs" />
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="relative w-10 h-10 rounded-full border border-gray-100 object-cover cursor-pointer hover:scale-105 active:scale-95 transition-all"
                  onClick={onOpenSettings}
                  title={lang === 'ar' ? 'تعديل الحساب الشخصي والنبذة' : 'Modifier votre profil'}
                />
              </div>

              {/* Create Task button */}
              <button
                onClick={onPostClick}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95"
                id="navbar-post-task-btn"
              >
                <Sparkles className="w-4 h-4 text-sky-200 animate-pulse" />
                <span>{t.postTaskBtn}</span>
              </button>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all cursor-pointer active:scale-95"
                title={t.logout}
                id="logout-btn"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
              id="google-login-btn"
            >
              <svg className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.23-.67-.34-1.37-.34-2.09z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{t.loginWithGoogle}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
