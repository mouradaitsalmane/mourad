import React from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Send, 
  Star, 
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';

interface StatisticsCardProps {
  lang: 'ar' | 'fr';
  stats: {
    totalEarnings: number;
    completedTasksCount: number;
    activeTasksCount: number;
    openBidsCount: number;
    averageRating: number;
    reviewsCount: number;
  };
}

const TEXTS = {
  ar: {
    earnings: 'إجمالي الأرباح',
    completed: 'المهام المكتملة',
    active: 'المهام النشطة',
    bids: 'العروض النشطة',
    rating: 'معدل التقييم',
    reviews: 'المراجعات',
    currency: 'د.م',
    tasksSuffix: 'مهمة',
    bidsSuffix: 'عرض',
    reviewsSuffix: 'تقييم'
  },
  fr: {
    earnings: 'Gains totaux',
    completed: 'Tâches terminées',
    active: 'Tâches en cours',
    bids: 'Offres actives',
    rating: 'Note moyenne',
    reviews: 'Commentaires',
    currency: 'MAD',
    tasksSuffix: 'tâches',
    bidsSuffix: 'offres',
    reviewsSuffix: 'avis'
  }
};

export default function StatisticsCard({ lang, stats }: StatisticsCardProps) {
  const t = TEXTS[lang];
  const isRTL = lang === 'ar';

  const cardsData = [
    {
      id: 'stat-earnings',
      label: t.earnings,
      value: `${stats.totalEarnings} ${t.currency}`,
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100/50',
    },
    {
      id: 'stat-completed',
      label: t.completed,
      value: `${stats.completedTasksCount} ${t.tasksSuffix}`,
      icon: CheckCircle2,
      color: 'text-sky-600 bg-sky-50 border-sky-100/50',
    },
    {
      id: 'stat-active',
      label: t.active,
      value: `${stats.activeTasksCount} ${t.tasksSuffix}`,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-100/50',
    },
    {
      id: 'stat-bids',
      label: t.bids,
      value: `${stats.openBidsCount} ${t.bidsSuffix}`,
      icon: Send,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100/50',
    },
    {
      id: 'stat-rating',
      label: t.rating,
      value: `${stats.averageRating} / 5.0`,
      icon: Star,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-10 border-yellow-100/50',
    },
    {
      id: 'stat-reviews',
      label: t.reviews,
      value: `${stats.reviewsCount} ${t.reviewsSuffix}`,
      icon: MessageSquare,
      color: 'text-slate-600 bg-slate-100/80 border-slate-100',
    }
  ];

  return (
    <div 
      id="statistics-card-grid"
      className="grid grid-cols-2 md:grid-cols-3 gap-4"
    >
      {cardsData.map((card) => {
        const IconComponent = card.icon;
        return (
          <div 
            key={card.id}
            className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`p-2.5 rounded-xl border ${card.color}`}>
                <IconComponent size={18} />
              </div>
              <button 
                className="text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                aria-label="View Details"
              >
                <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {card.label}
              </span>
              <p className="text-lg md:text-xl font-extrabold text-slate-800 font-sans tracking-tight">
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
