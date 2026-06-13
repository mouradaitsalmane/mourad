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
}

export default function TaskCard({ task, lang, onClick }: TaskCardProps) {
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

  return (
    <div 
      onClick={onClick}
      id={`task-card-${task.id}`}
      className="bg-white border border-gray-100 hover:border-sky-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4 group relative overflow-hidden"
    >
      {/* Decorative left bar for status */}
      <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
        task.status === 'open' ? 'bg-emerald-500' :
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

        {/* Row 2: Title & Budget */}
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-sky-600 transition-colors leading-snug">
            {task.title}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-lg font-extrabold text-sky-700 leading-none">
              {task.budget}
            </span>
            <span className="text-[10px] text-gray-400 font-semibold mt-1">DH / درهم</span>
          </div>
        </div>

        {/* Short description preview */}
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {task.description || t.noDescription}
        </p>
      </div>

      {/* Row 3: Meta metadata - location, due date, offers */}
      <div className="pt-4 border-t border-gray-50 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400 font-medium">
        
        <div className="flex items-center gap-4 flex-wrap">
          {/* Location neighborhood */}
          <span className="flex items-center gap-1 bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-sky-500" />
            <span>{neighborhoodName}</span>
          </span>

          {/* Due date */}
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{task.dueDate}</span>
          </span>
        </div>

        {/* Bids Offer counter */}
        <div className="flex items-center gap-1.5 text-sky-600 bg-sky-50/70 border border-sky-100/50 px-2.5 py-1 rounded-lg font-bold">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{task.offersCount} {t.ratings ? (task.offersCount === 1 ? 'عروض' : 'عروض') : 'offres'}</span>
        </div>
      </div>
    </div>
  );
}
