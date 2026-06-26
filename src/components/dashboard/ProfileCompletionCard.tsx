import React from 'react';
import { CheckCircle2, Circle, Sparkles, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useProfileCompletionStore } from '../../store/profileCompletionStore';

interface ProfileCompletionCardProps {
  lang: 'ar' | 'fr';
  profile: any;
  completionPercentage: number;
}

const TEXTS = {
  ar: {
    title: 'تعبئة الملف الشخصي',
    desc: 'العثور على فرصة عمل أفضل يتطلب تعبئة معلومات حسابك بالكامل.',
    items: {
      photoURL: 'الصورة الشخصية للبروفايل',
      phoneVerified: 'رقم الهاتف المعتمد (OTP)',
      dob: 'تاريخ الميلاد (العمر القانوني)',
      location: 'تحديد عنوان التواجد والعمل بالرباط',
      skills: 'تحديد المهارات المهنية المقدمة',
      bio: 'العنوان المهني والنبذة الشخصية (Bio)',
      identityVerified: 'التحقق من بطاقة التعريف الوطنية CNIE',
      hasBanking: 'ربط بيانات الحساب البنكي للتلقي RIB'
    },
    outstanding: 'متبقي ليكتمل ملفك (انقر للإكمال)',
    completed: 'ملف كامل 105%! حسابك جاهز بالكامل لتقديم العروض بنشاط وموثوقية عالية.',
    cta: 'إكمال ملفي الآن'
  },
  fr: {
    title: 'Complétion du profil',
    desc: 'Un profil complet multiplie par 3 vos chances d\'être sélectionné pour des tâches.',
    items: {
      photoURL: 'Photo de profil',
      phoneVerified: 'Numéro de téléphone validé',
      dob: 'Date de naissance (+18 ans)',
      location: 'Adresse d’activité à Rabat',
      skills: 'Compétences et métiers configurés',
      bio: 'Accroche titre et biographie',
      identityVerified: 'Pièce d’identité officielle CNIE',
      hasBanking: 'Coordonnées Bancaires (RIB)'
    },
    outstanding: 'Étapes restantes (cliquez pour compléter)',
    completed: 'Excellent ! Votre profil est complet à 100%. Tout est prêt !',
    cta: 'Compléter mon profil'
  }
};

export default function ProfileCompletionCard({ lang, profile, completionPercentage }: ProfileCompletionCardProps) {
  const t = TEXTS[lang];
  const isRTL = lang === 'ar';
  const { openCompletionModal } = useProfileCompletionStore();

  const checklist = [
    { key: 'photoURL', step: 1, label: t.items.photoURL, isMet: !!profile?.photoURL },
    { key: 'phoneVerified', step: 2, label: t.items.phoneVerified, isMet: !!profile?.phoneVerified },
    { key: 'dob', step: 3, label: t.items.dob, isMet: !!profile?.hasDob || !!profile?.dob },
    { key: 'location', step: 4, label: t.items.location, isMet: !!profile?.hasAddress || !!profile?.location },
    { key: 'skills', step: 5, label: t.items.skills, isMet: !!profile?.skills && profile.skills.length > 0 },
    { key: 'bio', step: 6, label: t.items.bio, isMet: !!profile?.bio && !!profile?.headline },
    { key: 'identityVerified', step: 7, label: t.items.identityVerified, isMet: profile?.verificationStatus === 'approved' || !!profile?.identityVerified || !!profile?.isVerifiedTasker },
    { key: 'hasBanking', step: 8, label: t.items.hasBanking, isMet: !!profile?.hasBanking }
  ];

  return (
    <div 
      id="profile-completion-card"
      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Title Group */}
        <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sparkles size={18} />
          </div>
          <h3 className="font-extrabold text-sm text-slate-800 font-sans">{t.title}</h3>
        </div>

        <p className={`text-[11px] text-slate-400 font-medium leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
          {t.desc}
        </p>

        {/* Progress Bar with floating tag */}
        <div className="space-y-2 pt-1">
          <div className={`flex justify-between items-center text-xs font-semibold font-sans ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-slate-550 font-black">{completionPercentage}%</span>
            <span className="text-indigo-600 text-[10px] font-black bg-indigo-50/75 px-2 py-0.5 rounded-md">
              {completionPercentage === 100 ? (isRTL ? 'مكتمل بالكامل' : 'Fini') : (isRTL ? 'قيد الإكمال' : 'En cours')}
            </span>
          </div>
          
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              id="profile-completion-progress-bar"
              className="bg-gradient-to-r from-indigo-500 to-sky-500 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Checklist details */}
        <div className="pt-3 border-t border-slate-50 space-y-2.5">
          <span className={`block text-[10px] font-black text-slate-400 tracking-wider uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
            {completionPercentage === 100 ? t.completed : t.outstanding}
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {checklist.map((item) => (
              <button 
                key={item.key} 
                onClick={() => openCompletionModal(item.step)}
                className={`flex items-center gap-2.5 text-xs text-slate-600 transition-all hover:bg-slate-50 p-1.5 rounded-lg text-right w-full cursor-pointer ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {item.isMet ? (
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                ) : (
                  <Circle size={15} className="text-slate-300 shrink-0" />
                )}
                <span className={`flex-1 text-[11px] font-semibold font-sans ${isMetCheckStyle(item.isMet)}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {completionPercentage < 100 && (
        <button
          type="button"
          onClick={() => openCompletionModal(1)}
          className={`w-full mt-4 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm`}
        >
          <span>{t.cta}</span>
          {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
        </button>
      )}
    </div>
  );
}

function isMetCheckStyle(isMet: boolean) {
  return isMet 
    ? 'line-through text-slate-400 font-medium' 
    : 'text-slate-800 font-black hover:text-indigo-600';
}
