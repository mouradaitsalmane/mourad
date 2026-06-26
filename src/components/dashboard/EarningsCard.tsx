import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

interface EarningsCardProps {
  lang: 'ar' | 'fr';
  analytics: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    allTime: number;
    chartData: { name: string; amount: number }[];
  };
}

const TEXTS = {
  ar: {
    title: 'تحليلات الأرباح',
    subtitle: 'أرباحك المحققة عبر منصة الرباط كاش',
    today: 'اليوم',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    allTime: 'إجمالي الأرباح',
    currency: 'درهم',
    chartHeader: 'مؤشر نمو الدخل',
    noData: 'سيبدأ الرسم البياني في الظهور بمجرد تسليم وفوترة مهامك الأولى.'
  },
  fr: {
    title: 'Analyses des gains',
    subtitle: 'Vos revenus générés via Rabat Cash',
    today: "Aujourd'hui",
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois',
    allTime: 'Gains cumulés',
    currency: 'MAD',
    chartHeader: 'Index de croissance des revenus',
    noData: 'Le graphique apparaitra dès la facturation de vos premières tâches.'
  }
};

export default function EarningsCard({ lang, analytics }: EarningsCardProps) {
  const t = TEXTS[lang];
  const isRTL = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'month' | 'week' | 'all'>('all');

  const maxAmount = Math.max(...analytics.chartData.map(d => d.amount), 100);

  return (
    <div 
      id="earnings-analysis-card"
      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm col-span-1 lg:col-span-2 space-y-6"
    >
      {/* Header section */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isRTL ? 'sm:flex-row-reverse text-right' : 'text-left'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1 justify-start">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 font-sans">{t.title}</h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">{t.subtitle}</p>
        </div>
        
        {/* Toggle period filter */}
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 font-sans text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('week')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${activeTab === 'week' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {isRTL ? 'إسبوعي' : 'Hebdo'}
          </button>
          <button 
            onClick={() => setActiveTab('month')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${activeTab === 'month' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {isRTL ? 'شهري' : 'Mensuel'}
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${activeTab === 'all' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {isRTL ? 'الكل' : 'Global'}
          </button>
        </div>
      </div>

      {/* Grid numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mr-0 ml-0">
        
        {/* Today */}
        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 text-center space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
            {t.today}
          </span>
          <p className="text-xl font-extrabold text-slate-800 font-sans">
            {analytics.today} <span className="text-xs font-medium text-slate-500">{t.currency}</span>
          </p>
        </div>

        {/* This week */}
        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 text-center space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
            {t.thisWeek}
          </span>
          <p className="text-xl font-extrabold text-slate-800 font-sans">
            {analytics.thisWeek} <span className="text-xs font-medium text-slate-500">{t.currency}</span>
          </p>
        </div>

        {/* This Month */}
        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 text-center space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
            {t.thisMonth}
          </span>
          <p className="text-xl font-extrabold text-slate-800 font-sans">
            {analytics.thisMonth} <span className="text-xs font-medium text-slate-500">{t.currency}</span>
          </p>
        </div>

        {/* All Time */}
        <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/20 text-center space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-emerald-600/75 tracking-wider">
            {t.allTime}
          </span>
          <p className="text-xl font-extrabold text-emerald-600 font-sans">
            {analytics.allTime} <span className="text-xs font-medium text-emerald-500">{t.currency}</span>
          </p>
        </div>

      </div>

      {/* SVG Modern styled Area Chart */}
      <div className="space-y-3 pt-2">
        <span className={`block text-[11px] font-bold text-slate-400 tracking-wider uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
          {t.chartHeader}
        </span>
        <div className="relative bg-slate-50 rounded-2xl p-4 md:p-6 border border-slate-100">
          {analytics.allTime === 0 ? (
            <div className="py-12 px-4 text-center">
              <p className="text-xs text-slate-400 font-medium font-sans max-w-sm mx-auto leading-relaxed">
                {t.noData}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end justify-between h-40 gap-3 md:gap-6 pt-5">
                {analytics.chartData.map((data, idx) => {
                  const barHeight = Math.round((data.amount / maxAmount) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                      
                      {/* Floating hover indicator */}
                      <div className="opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg absolute bottom-[140px] transition-all duration-200 pointer-events-none shadow-sm font-sans">
                        {data.amount} {t.currency}
                      </div>

                      {/* Bar fill with gradient */}
                      <div className="w-full bg-slate-200/50 rounded-lg h-full flex items-end overflow-hidden">
                        <div 
                          className="w-full bg-gradient-to-t from-emerald-500 to-sky-400 rounded-t-lg group-hover:brightness-105 transition-all duration-500"
                          style={{ height: `${barHeight || 4}%` }}
                        />
                      </div>

                      {/* X-axis label */}
                      <span className="text-[10px] font-semibold text-slate-400 font-sans uppercase">
                        {data.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
