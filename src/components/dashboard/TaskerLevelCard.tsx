import React from 'react';
import { Award, Zap, Check, ChevronRight } from 'lucide-react';

interface TaskerLevelCardProps {
  lang: 'ar' | 'fr';
  currentLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  nextLevel: string;
  requirements: string[];
}

const TEXTS = {
  ar: {
    title: 'نظام مستويات مستقل',
    subtitle: 'المستويات المهنية بناءً على نشاطك ومعدل تقييماتك',
    badge: 'المستوى الحالي',
    nextLevelText: 'الترفيع التالي إلى:',
    reqHeader: 'متطلبات الترقية المطلوبة:',
    bronze: 'برونزي (مبتدئ)',
    silver: 'فضي (نشط)',
    gold: 'ذهبي (خبير)',
    platinum: 'بلاتيني (نخبة)'
  },
  fr: {
    title: 'Système de niveaux',
    subtitle: 'Niveaux de réputation calculés selon vos contrats résolus.',
    badge: 'Niveau actuel',
    nextLevelText: 'Prochaine promotion :',
    reqHeader: 'Objectifs de niveau requis :',
    bronze: 'Bronze (Débutant)',
    silver: 'Argent (Actif)',
    gold: 'Or (Expérimenté)',
    platinum: 'Platine (Élite)'
  }
};

const COLOR_TIERS = {
  Bronze: {
    badge: 'bg-amber-100 text-amber-800 border-amber-200/50',
    title: 'text-amber-700',
    iconColor: 'bg-amber-500',
    gradient: 'from-amber-600 to-yellow-600'
  },
  Silver: {
    badge: 'bg-slate-100 text-slate-800 border-slate-200/50',
    title: 'text-slate-700',
    iconColor: 'bg-slate-400',
    gradient: 'from-slate-500 to-slate-400'
  },
  Gold: {
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-250',
    title: 'text-yellow-700',
    iconColor: 'bg-yellow-500',
    gradient: 'from-yellow-500 to-amber-500'
  },
  Platinum: {
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200/50',
    title: 'text-indigo-700',
    iconColor: 'bg-indigo-600',
    gradient: 'from-indigo-600 to-sky-600'
  }
};

export default function TaskerLevelCard({ lang, currentLevel, nextLevel, requirements }: TaskerLevelCardProps) {
  const t = TEXTS[lang];
  const isRTL = lang === 'ar';

  const style = COLOR_TIERS[currentLevel] || COLOR_TIERS.Bronze;
  const levelLabel = t[currentLevel.toLowerCase() as 'bronze'|'silver'|'gold'|'platinum'] || currentLevel;

  return (
    <div 
      id="tasker-tier-level-card"
      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Title */}
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
            <Award size={20} />
          </div>
          <h3 className="font-bold text-lg text-slate-800 font-sans">{t.title}</h3>
        </div>

        <p className={`text-xs text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t.subtitle}
        </p>

        {/* Current Level display */}
        <div className={`p-4 rounded-2xl bg-gradient-to-tr ${style.gradient} text-white space-y-2 relative overflow-hidden`}>
          {/* Subtle icon reflection layout */}
          <Award size={90} className="absolute -right-3 -bottom-3 opacity-15 rotate-12" />
          
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold tracking-wider uppercase opacity-80 block">
              {t.badge}
            </span>
            <p className="text-xl font-extrabold tracking-tight">
              {levelLabel}
            </p>
          </div>
        </div>

        {/* Next Level requirements list */}
        <div className="space-y-2 pt-2 mr-0 ml-0 border-t border-slate-50">
          <div className={`flex items-center gap-1.5 text-xs font-bold text-slate-500 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Zap size={14} className="text-sky-500" />
            <span className="font-sans">
              {t.nextLevelText} <strong className="text-slate-700">{nextLevel}</strong>
            </span>
          </div>

          <div className="space-y-1.5 mr-0 ml-0 pt-1">
            {requirements.map((req, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2.5 items-start text-xs text-slate-600 font-sans ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
              >
                <div className="p-0.5 bg-sky-50 text-sky-600 rounded-md shrink-0 mt-0.5">
                  <Check size={10} />
                </div>
                <span className="leading-tight text-slate-600">{req}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
