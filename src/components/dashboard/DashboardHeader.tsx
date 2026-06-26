import React from 'react';
import { Star, Shield, MapPin, UserCheck } from 'lucide-react';
import { UserProfile } from '../../types';

interface DashboardHeaderProps {
  lang: 'ar' | 'fr';
  profile: UserProfile | null;
  email: string | null;
}

const TEXTS = {
  ar: {
    welcome: 'مرحباً بعودتك،',
    verified: 'مستقل موثوق',
    notVerified: 'حساب غير موثق',
    reviews: 'تقييم',
    ratingLabel: 'التقييم العام',
    joined: 'انضم في'
  },
  fr: {
    welcome: 'Bon retour,',
    verified: 'Prestataire Vérifié',
    notVerified: 'Profil non vérifié',
    reviews: 'avis',
    ratingLabel: 'Note globale',
    joined: 'Rejoint en'
  }
};

export default function DashboardHeader({ lang, profile, email }: DashboardHeaderProps) {
  const t = TEXTS[lang];
  const isRTL = lang === 'ar';

  const formatJoinedDate = () => {
    if (!profile?.createdAt) return '';
    try {
      const date = profile.createdAt?.seconds 
        ? new Date(profile.createdAt.seconds * 1000) 
        : new Date(profile.createdAt);
      return date.toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-FR', {
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const initials = profile?.displayName
    ? profile.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div 
      id="dashboard-header-container"
      className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm transition-all duration-300"
    >
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        
        {/* Profile Details Area */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          
          {/* Avatar Area */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-sans text-3xl font-extrabold tracking-wide border-4 border-white shadow-md hover:scale-105 transition-all duration-300">
              {initials}
            </div>
            {profile?.isVerifiedTasker && (
              <div 
                id="header-verified-indicator"
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-md animate-bounce"
                title={t.verified}
              >
                <UserCheck size={16} />
              </div>
            )}
          </div>

          {/* Texts Info */}
          <div className="text-center sm:text-start space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <span className="text-sm font-medium text-slate-400 font-sans tracking-wide">
                {t.welcome}
              </span>
              <span className="bg-sky-50 text-sky-700 text-xs px-2.5 py-1 rounded-full font-medium font-sans">
                {profile?.isTasker ? (lang === 'ar' ? 'مقدم خدمة' : 'Prestataire') : (lang === 'ar' ? 'عميل' : 'Client')}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              {profile?.displayName || 'User RabatTasker'}
            </h1>

            {/* Location & Meta Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-slate-500 text-sm">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-sky-500" />
                <span>{profile?.location || (lang === 'ar' ? 'الرباط' : 'Rabat')}</span>
              </div>

              {profile?.createdAt && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs text-slate-400">
                    {t.joined} {formatJoinedDate()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Highlights Info */}
        <div className="flex items-center justify-center md:justify-end gap-4 border-t border-slate-50 md:border-none pt-4 md:pt-0">
          
          <div className="text-center bg-slate-50 px-5 py-4 rounded-2xl min-w-[110px] border border-slate-100/50">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
              <Star size={18} fill="currentColor" />
              <span className="font-bold text-lg text-slate-800 font-sans">
                {profile?.rating || '0.0'}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
              {t.ratingLabel}
            </p>
          </div>

          <div className="text-center bg-slate-50 px-5 py-4 rounded-2xl min-w-[110px] border border-slate-100/50">
            <span className="font-extrabold text-lg text-slate-800 font-sans block mb-0.5">
              {profile?.reviewsCount || 0}
            </span>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
              {t.reviews}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
