import React from 'react';
import { CheckCircle2, Clock, Star, Landmark } from 'lucide-react';
import { Task, Review } from '../../types';

interface WorkerDashboardAssignedTabProps {
  lang: 'ar' | 'fr';
  isRTL: boolean;
  loadingAssigned: boolean;
  loadingCompleted: boolean;
  assignedTasks: Task[];
  completedTasks: Task[];
  myReviews: Review[];
  onSelectTask: (task: Task) => void;
}

export default function WorkerDashboardAssignedTab({
  lang,
  isRTL,
  loadingAssigned,
  loadingCompleted,
  assignedTasks,
  completedTasks,
  myReviews,
  onSelectTask
}: WorkerDashboardAssignedTabProps) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="worker-tab-assigned">
      
      {/* List of currently assigned active tasks to work on */}
      <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs">
        <div className="border-b border-gray-100 pb-3 mb-4 text-right flex justify-end flex-row-reverse">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 justify-end">
            <Clock className="w-5 h-5 text-amber-500 animate-spin-slow shrink-0" />
            <span>{isRTL ? 'مهامي المكلف بها قيد الإنجاز حالياً' : 'Mes missions actives en cours'}</span>
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {loadingAssigned ? (
            <div className="p-4 text-center text-xs text-gray-400 font-medium animate-pulse">Loading...</div>
          ) : assignedTasks.length === 0 ? (
            <div className="p-8 text-center text-[11px] text-gray-400 font-bold leading-relaxed">
              {isRTL ? 'لا توجد أي مهام مكلف بإنجازها حالياً. تصفح خريطة المهام وقدم عروضك!' : 'Aucun contrat actif pour le moment.'}
            </div>
          ) : (
            assignedTasks.map((item) => (
              <div key={item.id} className="p-4.5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right sm:flex-row-reverse">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 justify-end flex-row-reverse">
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-black">
                      {isRTL ? 'قيد العمل' : 'En cours'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-extrabold">{item.dueDate}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{item.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold">{isRTL ? 'صاحب الخدمة:' : 'Publié par:'} {item.posterName}</p>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 shrink-0 border-t sm:border-t-0 border-slate-50 flex-row-reverse">
                  <span className="text-base font-black text-slate-900 leading-none">{item.budget} DH</span>
                  <button
                    onClick={() => onSelectTask(item)}
                    className="p-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold leading-none cursor-pointer"
                  >
                    {isRTL ? 'مفاتحة العميل / الدردشة' : 'Gérer'}
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Past completed jobs history */}
      <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs">
        <div className="border-b border-gray-100 pb-3 mb-4 text-right">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 justify-end">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>{isRTL ? 'قائمة وتاريخ المهام المكتملة السابقة' : 'Mon Historique des tâches clôturées'}</span>
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {loadingCompleted ? (
            <div className="p-4 text-center text-xs text-gray-400 font-medium animate-pulse">Loading...</div>
          ) : completedTasks.length === 0 ? (
            <div className="p-8 text-center text-[11px] text-gray-400 font-bold leading-relaxed">
              {isRTL ? 'لا توجد مهام منتهية مغلقة في أرشيفك حتى الآن.' : 'Aucun travail archivé.'}
            </div>
          ) : (
            completedTasks.map((item) => {
              const matchedReview = myReviews.find(r => r.taskId === item.id);
              return (
                <div key={item.id} className="p-4.5 rounded-2xl border border-gray-200 flex flex-col justify-between gap-3 text-right">
                  
                  <div className="flex items-center justify-between flex-row-reverse">
                    <span className="text-xs font-black text-slate-450 uppercase">{item.dueDate}</span>
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <span className="text-xs font-black text-slate-900">{item.budget} DH</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-black">
                        {isRTL ? 'مسلم ومحرر' : 'Payé'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-bold">{isRTL ? 'صاحب الخدمة:' : 'Payé par:'} {item.posterName}</p>
                  </div>

                  {/* Customer feedback display if available */}
                  {matchedReview ? (
                    <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 mt-1">
                      <div className="flex items-center justify-between flex-row-reverse">
                        <span className="text-[9px] text-gray-450 font-bold">{matchedReview.reviewerName}</span>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-black flex-row-reverse">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                          <span>{matchedReview.rating}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-650 font-semibold mt-1.5 leading-relaxed">"{matchedReview.comment}"</p>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-400 font-bold mt-1">
                      {isRTL ? 'بانتظار تقييم العميل...' : 'Évaluation client en attente.'}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
