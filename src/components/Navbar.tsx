import React, { useState } from 'react';
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
  Settings,
  Gift,
  Copy,
  Check,
  X
} from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  user: any;
  userProfile: UserProfile | null;
  lang: LanguageKey;
  setLang: (lang: LanguageKey) => void;
  onPostClick: () => void;
  onOpenSettings: () => void;
  onLoginClick: (mode?: 'signin' | 'signup') => void;
  currentView: 'home' | 'explorer' | 'dashboard' | 'admin' | 'how-it-works';
  onViewChange: (view: 'home' | 'explorer' | 'dashboard' | 'admin' | 'how-it-works') => void;
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
  
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-150/80 shadow-sm transition-all duration-300" dir="ltr">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Clickable Logo to return Home */}
        <div 
          className="flex items-center gap-2 cursor-pointer select-none group"
          onClick={() => onViewChange('home')}
        >
          <Logo size="xl" className="transition-transform group-hover:scale-105 duration-200" />
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

          {user && (
            <>
              <button
                onClick={() => onViewChange('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-white text-slate-900 shadow-sm scale-102 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isRTL ? 'لوحة التحكم' : 'Tableau de bord'}
              </button>

              {user.uid === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' && (
                <button
                  onClick={() => onViewChange('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                    currentView === 'admin'
                      ? 'bg-sky-500 text-white shadow-sm scale-102 font-extrabold'
                      : 'text-sky-600 hover:text-sky-800'
                  }`}
                >
                  <Settings className={`w-3.5 h-3.5 ${currentView === 'admin' ? 'text-white' : 'text-sky-600'}`} />
                  <span>{isRTL ? 'بوابة الإدارة' : 'Administration'}</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Global actions: Language, Login & New Task */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
          
          {/* Language toggle selector */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
            className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-extrabold text-slate-700 transition-all cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
            id="lang-toggle-btn"
            title={lang === 'ar' ? 'Interface en Français' : 'الواجهة بالعربية'}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
            <span>{lang === 'ar' ? 'FR' : 'عربي'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
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

              {/* User Avatar with Profile Settings action */}
              <div className="relative group shrink-0">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 opacity-20 group-hover:opacity-80 transition duration-300 blur-xs" />
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="relative w-9 h-9 rounded-full border border-gray-100 object-cover cursor-pointer hover:scale-105 active:scale-95 transition-all"
                  onClick={onOpenSettings}
                  title={lang === 'ar' ? 'تعديل الحساب الشخصي والنبذة' : 'Modifier votre profil'}
                />
              </div>

              {/* Gift Card Button (Authenticated) */}
              <button
                onClick={() => setShowGiftModal(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
                title={isRTL ? "تصفح وتفعيل بطاقات هدايا تاسكر" : "Cartes Cadeaux Tasker"}
              >
                <Gift className="w-4 h-4 text-amber-600 animate-bounce shrink-0" />
                <span className="hidden lg:inline">{isRTL ? 'بطاقات الهدايا' : 'Cadeaux'}</span>
              </button>

              {/* Create Task button */}
              <button
                onClick={onPostClick}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-black px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                id="navbar-post-task-btn"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-200 animate-pulse shrink-0" />
                <span className="hidden sm:inline">{isRTL ? 'نشر مهمة' : 'Publier'}</span>
              </button>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all cursor-pointer active:scale-95 shrink-0"
                title={t.logout}
                id="logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Gift Card Button (Requires Registration) */}
              <button
                onClick={() => {
                  alert(isRTL 
                    ? 'يرجى إنشاء حساب أولاً أو تسجيل الدخول للاستفادة من بطاقات الهدايا الرائعة هذه!' 
                    : 'Veuillez d\'abord créer un compte ou vous connecter pour profiter de ces magnifiques cartes cadeaux !');
                  handleLogin('signup');
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
                title={isRTL ? "يرجى تسجيل الدخول للاستفادة من بطاقات هدايا تاسكر" : "Créez un compte pour les Cartes Cadeaux Tasker"}
              >
                <Gift className="w-4 h-4 text-amber-600 animate-bounce shrink-0" />
                <span>{isRTL ? 'بطاقات الهدايا' : 'Cartes cadeaux'}</span>
              </button>

              {/* Sign In Button */}
              <button
                onClick={() => handleLogin('signin')}
                className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black transition-all cursor-pointer active:scale-95 shrink-0"
                id="header-signin-btn"
              >
                {isRTL ? 'تسجيل الدخول' : 'Se connecter'}
              </button>

              {/* Sign Up Button */}
              <button
                onClick={() => handleLogin('signup')}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-black px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                id="header-signup-btn"
              >
                <span>{isRTL ? 'إنشاء حساب' : "S'inscrire"}</span>
              </button>
            </div>
          )}

        </div>
      </div>

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
            <div className="space-y-4">
              
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
