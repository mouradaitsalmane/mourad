import React from 'react';
import { Percent, CheckCircle2, ShieldAlert, HeartHandshake, Eye } from 'lucide-react';

interface PerformanceCardProps {
  lang: 'ar' | 'fr';
  performance: {
    completionRate: number;
    acceptanceRate: number;
    responseRate: number;
  };
}

const TEXTS = {
  ar: {
    title: 'مؤشرات الأداء المهني',
    subtitle: 'مؤشرات كفاءتك وسرعة تجاوبك مع طلبات العملاء بالرباط',
    completionTitle: 'معدل إكمال المهام',
    acceptanceTitle: 'معدل قبول العروض',
    responseTitle: 'سرعة تجاوب الدردشة',
    excellent: 'ممتاز',
    good: 'جيد جداً',
    average: 'مقبول',
    low: 'ضعيف'
  },
  fr: {
    title: 'Performance & Qualité',
    subtitle: 'Analyses de fiabilité et rapidité d\'interaction sur Rabat.',
    completionTitle: 'Taux de complétion',
    acceptanceTitle: 'Taux d\'acceptation',
    responseTitle: 'Taux de réponse',
    excellent: 'Excellent',
    good: 'Très bon',
    average: 'Correct',
    low: 'Faible'
  }
};

export default function PerformanceCard({ lang, performance }: PerformanceCardProps) {
  const t = TEXTS[lang];
  const isRTL = lang === 'ar';

  const getPerformanceLabel = (val: number) => {
    if (val >= 95) return t.excellent;
    if (val >= 80) return t.good;
    if (val >= 50) return t.average;
    return t.low;
  };

  const getMetricColor = (val: number) => {
    if (val >= 90) return 'text-emerald-500 bg-emerald-50';
    if (val >= 70) return 'text-sky-500 bg-sky-50';
    if (val >= 50) return 'text-amber-500 bg-amber-50';
    return 'text-rose-500 bg-rose-50';
  };

  const items = [
    {
      id: 'perf-completion',
      title: t.completionTitle,
      value: performance.completionRate,
      icon: CheckCircle2,
      desc: getPerformanceLabel(performance.completionRate)
    },
    {
      id: 'perf-acceptance',
      title: t.acceptanceTitle,
      value: performance.acceptanceRate,
      icon: HeartHandshake,
      desc: getPerformanceLabel(performance.acceptanceRate)
    },
    {
      id: 'perf-response',
      title: t.responseTitle,
      value: performance.responseRate,
      icon: Eye,
      desc: getPerformanceLabel(performance.responseRate)
    }
  ];

  return (
    <div 
      id="worker-performance-metrics-card"
      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Title */}
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="p-2 bg-pink-50 text-pink-500 rounded-xl">
            <Percent size={20} />
          </div>
          <h3 className="font-bold text-lg text-slate-800 font-sans">{t.title}</h3>
        </div>

        <p className={`text-xs text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t.subtitle}
        </p>

        {/* List of performance indicators */}
        <div className="space-y-4 pt-2">
          {items.map((item) => {
            const IconComp = item.icon;
            const colorClass = getMetricColor(item.value);

            return (
              <div 
                key={item.id} 
                className={`space-y-1.5 ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <div className={`flex justify-between items-center text-xs font-bold ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <IconComp size={14} className="text-slate-400" />
                    <span className="text-slate-700">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md ${colorClass}`}>
                      {item.desc}
                    </span>
                    <span className="text-slate-800 font-sans font-extrabold">{item.value}%</span>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${item.value}%`,
                      backgroundImage: 'linear-gradient(to right, #0ea5e9, #6366f1)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
