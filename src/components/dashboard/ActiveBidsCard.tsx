import React from 'react';
import { Send, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Offer } from '../../types';

interface ActiveBidsCardProps {
  lang: 'ar' | 'fr';
  bids: (Offer & { taskTitle: string; taskBudget: number })[];
}

const TEXTS = {
  ar: {
    title: 'عروض العمل الحالية',
    subtitle: 'العروض التي تقدمت بها للمهام المنتشرة في مدينة الرباط',
    empty: 'لم تتقدم عروض على مهام بعد! ابحث عن مهام وقدم مهاراتك.',
    budget: 'رسوم العرض الخاص بك:',
    taskBudget: 'ميزانية العميل:',
    currency: 'د.م',
    status: 'الوضعية',
    pending: 'قيد المراجعة',
    accepted: 'مقبول',
    declined: 'مرفوض'
  },
  fr: {
    title: 'Mes Offres / Bids',
    subtitle: 'Suivez le statut des offres de service que vous avez soumises.',
    empty: 'Vous n\'avez soumis aucune offre ! Parcourez les tâches pour postuler.',
    budget: 'Votre offre :',
    taskBudget: 'Budget client :',
    currency: 'MAD',
    status: 'Statut',
    pending: 'En attente',
    accepted: 'Acceptée',
    declined: 'Rejetée'
  }
};

const STATUS_BADGES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  declined: 'bg-rose-50 text-rose-600 border-rose-200'
};

const STATUS_LABELS = {
  ar: {
    pending: 'قيد المراجعة',
    accepted: 'مقبول',
    declined: 'مستبعد'
  },
  fr: {
    pending: 'En attente',
    accepted: 'Acceptée',
    declined: 'Déclinée'
  }
};

export default function ActiveBidsCard({ lang, bids }: ActiveBidsCardProps) {
  const t = TEXTS[lang];
  const isRTL = lang === 'ar';

  const limitedBids = bids.slice(0, 5); // display top 5

  return (
    <div 
      id="active-bids-analysis-card"
      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
    >
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isRTL ? 'sm:flex-row-reverse text-right' : 'text-left'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1 justify-start">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Send size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 font-sans">{t.title}</h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">{t.subtitle}</p>
        </div>
      </div>

      {limitedBids.length === 0 ? (
        <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl text-center">
          <p className="text-sm text-slate-400 font-sans max-w-sm mx-auto leading-relaxed">
            {t.empty}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {limitedBids.map((bid) => {
            const statusKey = bid.status || 'pending';
            const badgeClass = STATUS_BADGES[statusKey] || 'bg-slate-50 text-slate-500';
            const statusText = STATUS_LABELS[lang][statusKey] || statusKey;

            return (
              <div 
                key={bid.id}
                className={`p-4 rounded-2xl border border-slate-100 hover:border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isRTL ? 'text-right sm:flex-row-reverse' : 'text-left'}`}
              >
                {/* Task meta details */}
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-1">
                    {bid.taskTitle}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs">
                    <span>
                      {t.taskBudget} <strong className="text-slate-500 font-sans">{bid.taskBudget} {t.currency}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      {t.budget} <strong className="text-indigo-600 font-sans">{bid.amount} {t.currency}</strong>
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-start sm:justify-end gap-3.5">
                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${badgeClass}`}>
                    <span className="w-1.5 h-1.5 bg-current rounded-full mr-1.5 ml-1.5 inline-block shrink-0" />
                    {statusText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
