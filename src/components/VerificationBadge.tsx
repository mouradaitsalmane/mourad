import React from 'react';
import { ShieldCheck, Clock, ShieldAlert, FileWarning } from 'lucide-react';

export type BadgeState = 'verified' | 'pending' | 'rejected' | 'incomplete';

interface VerificationBadgeProps {
  status?: BadgeState | string;
  lang: 'ar' | 'fr';
  className?: string;
  showIcon?: boolean;
}

const TEXTS = {
  ar: {
    verified: '✓ معتمد وموثق',
    pending: '⏳ قيد المراجعة',
    rejected: '⚠ مرفوض - يرجى التعديل',
    incomplete: '⚠ غير مكتمل',
  },
  fr: {
    verified: '✓ Vérifié',
    pending: '⏳ En attente de revue',
    rejected: '⚠ Rejeté - Action requise',
    incomplete: '⚠ Incomplet',
  }
};

export default function VerificationBadge({ status = 'incomplete', lang, className = '', showIcon = true }: VerificationBadgeProps) {
  const isRTL = lang === 'ar';
  const t = TEXTS[lang];

  // Map any other string representations to valid states
  let normalizedStatus: BadgeState = 'incomplete';
  const checkStatus = String(status).toLowerCase();
  
  if (checkStatus === 'approved' || checkStatus === 'verified' || checkStatus === 'true') {
    normalizedStatus = 'verified';
  } else if (checkStatus === 'pending') {
    normalizedStatus = 'pending';
  } else if (checkStatus === 'rejected') {
    normalizedStatus = 'rejected';
  } else {
    normalizedStatus = 'incomplete';
  }

  // Define styling classes depending on state
  let config = {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-800 dark:text-emerald-400',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    label: t.verified
  };

  if (normalizedStatus === 'pending') {
    config = {
      bg: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/10 dark:border-amber-800 dark:text-amber-400',
      icon: <Clock className="w-3.5 h-3.5" />,
      label: t.pending
    };
  } else if (normalizedStatus === 'rejected') {
    config = {
      bg: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/10 dark:border-rose-800 dark:text-rose-400',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      label: t.rejected
    };
  } else if (normalizedStatus === 'incomplete') {
    config = {
      bg: 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400',
      icon: <FileWarning className="w-3.5 h-3.5" />,
      label: t.incomplete
    };
  }

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg border shadow-3xs transition-all ${config.bg} ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {showIcon && <span className="shrink-0">{config.icon}</span>}
      <span className="font-sans leading-none">{config.label}</span>
    </div>
  );
}
