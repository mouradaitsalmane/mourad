import React from 'react';
import { Task, ServiceCategory } from '../types';
import { SERVICE_CATEGORIES, TRANSLATIONS, LanguageKey } from '../data/rabatData';
import { 
  Sparkles, 
  Droplets, 
  Lightbulb, 
  Truck, 
  Hammer, 
  Flower, 
  Laptop, 
  Wrench,
  MapPin,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface TaskCardProps {
  key?: string;
  task: Task;
  lang: LanguageKey;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isHighlighted?: boolean;
}

export default function TaskCard({ 
  task, 
  lang, 
  onClick,
  onMouseEnter,
  onMouseLeave,
  isHighlighted = false
}: TaskCardProps) {
  const t = TRANSLATIONS[lang];
  
  // Find category localized details
  const categoryInfo = SERVICE_CATEGORIES.find(c => c.id === task.category);
  const localizedCategory = categoryInfo ? (lang === 'ar' ? categoryInfo.ar : categoryInfo.fr) : task.category;

  // Neighborhood localized translation
  const neighborhoodName = task.location; // We store localized name or ID, we display directly

  // Icon mapping helper
  const renderCategoryIcon = (iconName?: string) => {
    const defaultProps = { className: "w-5 h-5 text-sky-600" };
    switch (iconName) {
      case 'Sparkles': return <Sparkles {...defaultProps} />;
      case 'Droplets': return <Droplets {...defaultProps} />;
      case 'Lightbulb': return <Lightbulb {...defaultProps} />;
      case 'Truck': return <Truck {...defaultProps} />;
      case 'Hammer': return <Hammer {...defaultProps} />;
      case 'Flower': return <Flower {...defaultProps} />;
      case 'Laptop': return <Laptop {...defaultProps} />;
      default: return <Wrench {...defaultProps} />;
    }
  };

  // Status mapping colors & labels
  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'held':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            {lang === 'ar' ? 'ضمان مؤمن (Escrow)' : 'Garantie Sécurisée'}
          </span>
        );
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {t.statusOpen}
          </span>
        );
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <Clock className="w-3.5 h-3.5" />
            {t.statusAssigned}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <CheckCircle className="w-3.5 h-3.5" />
            {t.statusCompleted}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            <AlertCircle className="w-3.5 h-3.5" />
            {t.statusCancelled}
          </span>
        );
    }
  };

  // Time Ago formatting helper
  const getTimeAgo = (createdAt: any, isAr: boolean) => {
    if (!createdAt) return isAr ? 'منذ ساعتين' : 'Il y a 2 heures';
    
    let date: Date;
    if (createdAt.seconds) {
      date = new Date(createdAt.seconds * 1000);
    } else if (createdAt instanceof Date) {
      date = createdAt;
    } else if (typeof createdAt === 'object' && createdAt.toDate) {
      date = createdAt.toDate();
    } else {
      date = new Date(createdAt);
    }

    if (isNaN(date.getTime())) {
      return isAr ? 'منذ ساعتين' : 'Il y a 2 heures';
    }

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) {
      return isAr ? 'الآن' : "À l'instant";
    }
    if (diffInMins < 60) {
      return isAr ? `منذ ${diffInMins} دقيقة` : `Il y a ${diffInMins} min`;
    }
    if (diffInHours < 24) {
      if (diffInHours === 1) return isAr ? 'منذ ساعة' : 'Il y a 1 heure';
      if (diffInHours === 2) return isAr ? 'منذ ساعتين' : 'Il y a 2 heures';
      return isAr ? `منذ ${diffInHours} ساعات` : `Il y a ${diffInHours} heures`;
    }
    if (diffInDays === 1) return isAr ? 'أمس' : 'Hier';
    return isAr ? `منذ ${diffInDays} أيام` : `Il y a ${diffInDays} jours`;
  };

  const isAr = lang === 'ar';
  const displayLocation = isAr 
    ? `${neighborhoodName}، الرباط` 
    : `${neighborhoodName}, Rabat`;

  const displayBudget = isAr
    ? `${task.budget} درهم`
    : `${task.budget} DH`;

  const timeAgoString = getTimeAgo(task.createdAt, isAr);

  const displayBids = isAr
    ? `${task.offersCount} عروض`
    : `${task.offersCount} ${task.offersCount === 1 ? 'offre' : 'offres'}`;

  return (
    <div 
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      id={`task-card-${task.id}`}
      className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-all duration-350 cursor-pointer flex flex-col justify-between gap-5 group relative overflow-hidden ${
        isHighlighted 
          ? 'border-sky-600 ring-4 ring-sky-100 shadow-md scale-[1.015]' 
          : 'border-slate-100 hover:border-sky-300 shadow-2xs'
      }`}
    >
      {/* Decorative side bar for status */}
      <div className={`absolute top-0 bottom-0 ${isAr ? 'right-0' : 'left-0'} w-1.5 ${
        (task.status === 'open' || task.status === 'held') ? 'bg-emerald-500' :
        task.status === 'assigned' ? 'bg-blue-500' :
        task.status === 'completed' ? 'bg-gray-400' : 'bg-rose-400'
      }`} />

      <div className="flex flex-col gap-3">
        {/* Row 1: Category badge & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            {renderCategoryIcon(categoryInfo?.icon)}
            <span className="text-xs font-bold text-gray-600">
              {localizedCategory}
            </span>
          </div>
          {getStatusBadge(task.status)}
        </div>

        {/* Row 2: Title */}
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-sky-600 transition-colors leading-snug">
            {task.title}
          </h3>
        </div>

        {/* Short description preview */}
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {task.description || t.noDescription}
        </p>

        {/* Premium Meta list cards matching Airtasker high visual quality spec */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-gray-50 text-[11px] font-bold text-gray-600">
          <div className="flex items-center gap-1.5 bg-slate-50/50 hover:bg-slate-50 p-2.5 rounded-xl border border-slate-100 transition-colors">
            <span className="text-sm shrink-0">📍</span>
            <span className="truncate">{displayLocation}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50/50 hover:bg-slate-50 p-2.5 rounded-xl border border-slate-100 transition-colors">
            <span className="text-sm shrink-0">💰</span>
            <span className="text-sky-700">{displayBudget}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50/50 hover:bg-slate-50 p-2.5 rounded-xl border border-slate-100 transition-colors">
            <span className="text-sm shrink-0">⏱️</span>
            <span>{timeAgoString}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50/50 hover:bg-slate-50 p-2.5 rounded-xl border border-slate-100 transition-colors">
            <span className="text-sm shrink-0">💬</span>
            <span className="text-emerald-700">{displayBids}</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button 
          className="w-full bg-sky-600 hover:bg-sky-750 text-white text-xs font-black py-2.5 px-4 rounded-xl shadow-xs transition-colors group-hover:bg-sky-700 cursor-pointer flex items-center justify-center gap-1.5"
          id={`view-task-btn-${task.id}`}
        >
          <span>{isAr ? 'عرض المهمة' : 'Voir la tâche'}</span>
          <span className={`inline-block transition-transform duration-200 group-hover:translate-x-${isAr ? '-1' : '1'}`}>
            {isAr ? '←' : '→'}
          </span>
        </button>
      </div>
    </div>
  );
}
