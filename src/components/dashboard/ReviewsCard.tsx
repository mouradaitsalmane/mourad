import React from 'react';
import { Star, MessageSquare, Quote, User } from 'lucide-react';
import { Review } from '../../types';

interface ReviewsCardProps {
  lang: 'ar' | 'fr';
  reviews: Review[];
  averageRating: number;
  reviewsCount: number;
}

const TEXTS = {
  ar: {
    title: 'مراجعات العمل والتقييمات',
    subtitle: 'آراء وتقييمات العملاء الذين وظفوك لتنفيذ مهامهم في الرباط',
    empty: 'لا توجد أي مراجعات حتى الآن. أكمل مهامك لبدء تجميع تقييمات العملاء!',
    latestFeedback: 'أحدث المراجعات والآراء',
    anonymous: 'عميل RabatTasker'
  },
  fr: {
    title: 'Avis & Évaluations',
    subtitle: 'Commentaires laissés par les clients après la clôture de vos contrats.',
    empty: 'Aucune évaluation disponible pour le moment. Réalisez des tâches pour bâtir votre notoriété !',
    latestFeedback: 'Commentaires de réputation récents',
    anonymous: 'Client RabatTasker'
  }
};

export default function ReviewsCard({ lang, reviews, averageRating, reviewsCount }: ReviewsCardProps) {
  const t = TEXTS[lang];
  const isRTL = lang === 'ar';

  const limitedReviews = reviews.slice(0, 3); // Display top 3 latest

  return (
    <div 
      id="reviews-display-card"
      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6"
    >
      {/* Title */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isRTL ? 'sm:flex-row-reverse text-right' : 'text-left'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1 justify-start">
            <div className="p-2 bg-yellow-50 text-yellow-500 rounded-xl">
              <Star size={20} fill="currentColor" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 font-sans">{t.title}</h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">{t.subtitle}</p>
        </div>
      </div>

      {limitedReviews.length === 0 ? (
        <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl text-center">
          <p className="text-sm text-slate-400 font-sans max-w-sm mx-auto leading-relaxed">
            {t.empty}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <span className={`block text-[11px] font-bold text-slate-400 tracking-wider uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
            {t.latestFeedback} ({reviewsCount})
          </span>

          <div className="space-y-3.5">
            {limitedReviews.map((review) => {
              // Stars rendering array
              const starsArray = Array.from({ length: 5 }, (_, i) => i + 1);

              return (
                <div 
                  key={review.id}
                  className={`p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col gap-2.5 relative ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <Quote size={28} className={`absolute text-slate-150/75 -top-1 pointer-events-none opacity-20 ${isRTL ? 'left-4' : 'right-4'}`} />
                  
                  {/* Top line with rating and user */}
                  <div className={`flex flex-wrap items-center justify-between gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500 text-xs">
                        <User size={14} />
                      </div>
                      <span className="font-bold text-xs text-slate-700">
                        {review.reviewerName || t.anonymous}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {starsArray.map((num) => (
                        <Star 
                          key={num}
                          size={12}
                          className={review.rating >= num ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment text */}
                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    {review.comment || '...'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
