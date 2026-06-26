import React from 'react';
import { Briefcase, MapPin, Tag, ArrowRight, Star } from 'lucide-react';
import { Task } from '../../types';

interface RecommendedTasksCardProps {
  lang: 'ar' | 'fr';
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

const TEXTS = {
  ar: {
    title: 'مهام مقترحة لتخصصك',
    subtitle: 'بناءً على مهاراتك وحيك المفضل بالرباط',
    emptyMsg: 'لا توجد مهام مفتوحة مطابقة لتخصصاتك حالياً. يمكنك تعديل مهاراتك في تبويب الملف الشخصي لتلقي مقترحات جديدة.',
    budgetLabel: 'الميزانية:',
    applyFr: 'تقديم عرض',
    exploreBtn: 'عرض التفاصيل',
    skillsAlert: 'تناسب مهاراتك'
  },
  fr: {
    title: 'Missions recommandées',
    subtitle: 'Missions basées sur vos compétences et votre secteur de Rabat.',
    emptyMsg: 'Aucune mission ouverte ne correspond à vos compétences pour le moment. Enrichissez vos compétences dans l’onglet Profil.',
    budgetLabel: 'Budget :',
    applyFr: 'Faire une offre',
    exploreBtn: 'Détails',
    skillsAlert: 'Correspond à vos compétences'
  }
};

export default function RecommendedTasksCard({ lang, tasks, onSelectTask }: RecommendedTasksCardProps) {
  const t = TEXTS[lang];
  const isRTL = lang === 'ar';

  return (
    <div 
      id="recommended-tasks-dashboard-card"
      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Card Header title */}
        <div className={`flex items-center justify-between border-b border-slate-50 pb-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Briefcase size={20} />
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h3 className="font-extrabold text-base text-slate-800 font-sans">{t.title}</h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-wide mt-0.5">{t.subtitle}</p>
            </div>
          </div>
          <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full uppercase">
            {tasks.length} {isRTL ? 'متاحة' : 'dispo'}
          </span>
        </div>

        {/* Recomended list array mapping */}
        {tasks.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-medium">
              {t.emptyMsg}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`py-4 leading-relaxed first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:bg-slate-50/50 rounded-xl px-1 ${isRTL ? 'text-right sm:flex-row-reverse' : 'text-left'}`}
              >
                {/* Left Task Meta details */}
                <div className="space-y-1 sm:max-w-xs md:max-w-md">
                  <div className={`flex flex-wrap items-center gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                      {isRTL ? 'مهمة جديدة' : 'Nouveau'}
                    </span>
                    <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Star size={10} className="fill-amber-600 stroke-none" />
                      <span>{t.skillsAlert}</span>
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 tracking-tight leading-snug">
                    {task.title}
                  </h4>
                  <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-xs ${isRTL ? 'justify-end' : 'justify-start'}`}>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-sky-500 shrink-0" />
                      <span>{task.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag size={12} className="text-indigo-400 shrink-0" />
                      <span className="capitalize">{task.category}</span>
                    </span>
                  </div>
                </div>

                {/* Right budget trigger and Details button */}
                <div className={`flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={isRTL ? 'text-left' : 'text-right'}>
                    <span className="text-[10px] text-slate-400 font-bold block">{t.budgetLabel}</span>
                    <span className="text-base font-black text-slate-800 font-sans tracking-tight">
                      {task.budget} DH
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectTask(task)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold rounded-lg transition-transform hover:translate-x-0.5 cursor-pointer shadow-xs ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <span>{t.exploreBtn}</span>
                    <ArrowRight size={12} className={isRTL ? 'rotate-180' : ''} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
