import React from 'react';
import { Briefcase, Calendar, PlusCircle, ArrowLeftRight, ExternalLink } from 'lucide-react';
import { Task } from '../../types';

interface RecentTasksCardProps {
  lang: 'ar' | 'fr';
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenCreate?: () => void;
}

const TEXTS = {
  ar: {
    title: 'المهام والطلبات المسندة إليك',
    subtitle: 'المهام التي تم قبولك فيها لتنفيذها ومتابعة صرف العهدة',
    empty: 'لم تقبل في أي مهمة بعد! تصفح الصفحة الرئيسية وقدم عروضك الآن.',
    budget: 'الميزانية:',
    currency: 'درهم',
    date: 'تاريخ الاستحقاق',
    status: 'الحالة',
    viewAll: 'تصفح جميع المهام',
    viewTask: 'عرض التفاصيل',
    postTaskTitle: 'نشر مهمة جديدة'
  },
  fr: {
    title: 'Tâches assignées',
    subtitle: 'Suivez le statut de vos contrats actifs et libérez vos fonds.',
    empty: 'Aucune tâche assignée pour le moment ! Proposez vos services sur l\'accueil.',
    budget: 'Budget :',
    currency: 'MAD',
    date: 'Date limite',
    status: 'Statut',
    viewAll: 'Voir toutes les tâches',
    viewTask: 'Consulter',
    postTaskTitle: 'Publier une tâche'
  }
};

const STATUS_BADGES = {
  open: 'bg-sky-50 text-sky-700 border-sky-150',
  held: 'bg-amber-50 text-amber-700 border-amber-200',
  assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-600 border-rose-200'
};

const STATUS_LABELS = {
  ar: {
    open: 'مفتوح',
    held: 'معلق بالضمان',
    assigned: 'قيد التنفيذ',
    completed: 'مكتملة',
    cancelled: 'ملغاة'
  },
  fr: {
    open: 'Ouverte',
    held: 'Garantie Sécurisée',
    assigned: 'En cours',
    completed: 'Complétée',
    cancelled: 'Annulée'
  }
};

export default function RecentTasksCard({ lang, tasks, onSelectTask, onOpenCreate }: RecentTasksCardProps) {
  const t = TEXTS[lang];
  const isRTL = lang === 'ar';
  
  const limitedTasks = tasks.slice(0, 5); // Display top 5

  return (
    <div 
      id="recent-assigned-tasks-card"
      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
    >
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isRTL ? 'sm:flex-row-reverse text-right' : 'text-left'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1 justify-start">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Briefcase size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 font-sans">{t.title}</h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">{t.subtitle}</p>
        </div>
      </div>

      {limitedTasks.length === 0 ? (
        <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl text-center space-y-4">
          <p className="text-sm text-slate-400 font-sans max-w-sm mx-auto leading-relaxed">
            {t.empty}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm text-left text-slate-500 whitespace-nowrap min-w-[500px]">
            <thead className={`text-xs text-slate-400 uppercase bg-slate-50 font-sans ${isRTL ? 'text-right' : 'text-left'}`}>
              <tr>
                <th scope="col" className="px-5 py-3.5 font-bold">{isRTL ? 'عنوان المهمة' : 'Titre de la tâche'}</th>
                <th scope="col" className="px-5 py-3.5 font-bold">{isRTL ? 'الميزانية المحجوزة' : 'Moyen de paiement / Budget'}</th>
                <th scope="col" className="px-5 py-3.5 font-bold">{t.status}</th>
                <th scope="col" className="px-5 py-3.5 font-bold">{t.date}</th>
                <th scope="col" className="px-5 py-3.5 font-bold text-center">{isRTL ? 'تحكم' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className={isRTL ? 'text-right' : 'text-left'}>
              {limitedTasks.map((task) => {
                const badgeClass = STATUS_BADGES[task.status] || 'bg-slate-50 text-slate-500';
                const statusText = STATUS_LABELS[lang][task.status] || task.status;

                return (
                  <tr 
                    key={task.id} 
                    className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Title */}
                    <td className="px-5 py-4 font-semibold text-slate-800 max-w-[200px] truncate">
                      {task.title}
                    </td>

                    {/* Budget */}
                    <td className="px-5 py-4 font-sans font-bold text-slate-700">
                      {task.budget} {t.currency}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${badgeClass}`}>
                        <span className="w-1.5 h-1.5 bg-current rounded-full mr-1.5 ml-1.5 inline-block shrink-0" />
                        {statusText}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="px-5 py-4 text-slate-400 text-xs font-sans">
                      <div className="flex items-center gap-1.5 justify-start">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{task.dueDate}</span>
                      </div>
                    </td>

                    {/* View CTA */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => onSelectTask(task)}
                        className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 font-semibold text-xs px-3 py-1.5 rounded-xl border border-slate-100 transition-all cursor-pointer"
                      >
                        <span>{t.viewTask}</span>
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
