import React from 'react';
import { ShieldCheck, UserCheck, ShieldAlert, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useProfileCompletionStore } from '../../store/profileCompletionStore';

interface VerificationCardProps {
  lang: 'ar' | 'fr';
  verificationStatus: {
    isVerified: boolean;
    identityVerified: boolean;
    phoneVerified: boolean;
  };
  onVerify: () => void;
  isVerifying: boolean;
}

const TEXTS = {
  ar: {
    title: 'مركز الأمان والتوثيق',
    subtitle: 'شارات المصداقية والتوثيق الأمني لحسابك المهني بالرباط',
    verifiedBadge: 'توثيق شارة مقدم الخدمة',
    idVerify: 'التحقق من الهوية الوطنية (CNIE)',
    phoneVerify: 'التحقق من رقم الهاتف المحمول',
    badgeDesc: 'الحصول على Badge يرفع ثقة المستخدمين بنسبة 90%',
    verified: 'موثق ومعتمد ✓',
    pending: '⏳ قيد المراجعة',
    rejected: '⚠ تطلب مراجعة',
    unverified: 'غير موثق ⚠',
    ctaVerify: 'توثيق الحساب بالوثائق الآن',
    checking: 'جاري التحقق...'
  },
  fr: {
    title: 'Vérification et Sécurité',
    subtitle: 'Badges de confiance et statuts de vérification de sécurité.',
    verifiedBadge: 'Badge de confiance officiel',
    idVerify: 'Vérification d\'identité (CNIE)',
    phoneVerify: 'Vérification du numéro mobile',
    badgeDesc: 'Un badge de confiance déverrouille plus de tâches premiums.',
    verified: 'Vérifié ✓',
    pending: '⏳ En révision',
    rejected: ' Action requise',
    unverified: 'Non vérifié ⚠',
    ctaVerify: 'Vérifier mon compte par CNIE',
    checking: 'Vérification...'
  }
};

export default function VerificationCard({ lang, verificationStatus, onVerify, isVerifying }: VerificationCardProps) {
  const t = TEXTS[lang];
  const isRTL = lang === 'ar';
  const { openCompletionModal } = useProfileCompletionStore();

  return (
    <div 
      id="verification-card-status"
      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Title */}
        <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`p-2 rounded-xl bg-indigo-50 text-indigo-600`}>
            <ShieldCheck size={18} />
          </div>
          <h3 className="font-extrabold text-sm text-slate-800 font-sans">{t.title}</h3>
        </div>

        <p className={`text-[11px] text-slate-400 font-medium leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
          {t.subtitle}
        </p>

        {/* Detailed Verification Checkmarks */}
        <div className="space-y-3 pt-2">
          
          {/* 1. Trust badge */}
          <div className={`flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <UserCheck size={16} className={verificationStatus.isVerified ? 'text-emerald-500' : 'text-slate-400'} />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <span className="text-xs font-bold text-slate-700 block">{t.verifiedBadge}</span>
                <span className="text-[10px] text-slate-400 font-medium font-sans">{t.badgeDesc}</span>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${verificationStatus.isVerified ? 'bg-emerald-55/10 text-emerald-750' : 'bg-slate-100 text-slate-500'}`}>
              {verificationStatus.isVerified ? t.verified : t.unverified}
            </span>
          </div>

          {/* 2. Identity Verification */}
          <div className={`flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <ShieldCheck size={16} className={verificationStatus.identityVerified ? 'text-emerald-500' : 'text-slate-400'} />
              <span className="text-xs font-bold text-slate-700 block font-sans">{t.idVerify}</span>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${verificationStatus.identityVerified ? 'bg-emerald-55/10 text-emerald-750' : 'bg-slate-100 text-slate-500'}`}>
              {verificationStatus.identityVerified ? t.verified : t.unverified}
            </span>
          </div>

          {/* 3. Phone Verification */}
          <div className={`flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <CheckCircle2 size={16} className={verificationStatus.phoneVerified ? 'text-emerald-500' : 'text-slate-400'} />
              <span className="text-xs font-bold text-slate-700 block font-sans">{t.phoneVerify}</span>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${verificationStatus.phoneVerified ? 'bg-emerald-55/10 text-emerald-750' : 'bg-slate-100 text-slate-500'}`}>
              {verificationStatus.phoneVerified ? t.verified : t.unverified}
            </span>
          </div>

        </div>
      </div>

      {/* Button CTA */}
      {!verificationStatus.isVerified && (
        <div className="pt-4 mt-4 border-t border-slate-100/60">
          <button
            onClick={() => openCompletionModal(7)}
            id="verify-account-button"
            disabled={isVerifying}
            className={`w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 disabled:brightness-95 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <span>{isVerifying ? t.checking : t.ctaVerify}</span>
            {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}
