import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Settings, 
  ShieldAlert, 
  DollarSign, 
  Check, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { Task } from '../../types';

interface OrdersModuleProps {
  isRTL: boolean;
  isDarkMode: boolean;
  tasks: Task[];
  onAddLog: (log: string) => void;
  onOverrideStatus: (taskId: string, newStatus: Task['status']) => void;
}

export default function OrdersModule({
  isRTL,
  isDarkMode,
  tasks,
  onAddLog,
  onOverrideStatus
}: OrdersModuleProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'assigned' | 'completed' | 'cancelled' | 'held'>('all');
  
  // Custom interactive Chat Viewer Simulator
  const [showChatForTask, setShowChatForTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter((t) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      t.title.toLowerCase().includes(searchLower) ||
      t.id.toLowerCase().includes(searchLower) ||
      t.category.toLowerCase().includes(searchLower) ||
      t.posterName.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOverride = (taskId: string, status: Task['status']) => {
    onOverrideStatus(taskId, status);
    onAddLog(`Order Dispatch override on [${taskId.substring(0,6)}]: Force Status to ${status.toUpperCase()}`);
    alert(isRTL ? 'تم فرض الحالة الجديدة للتذكرة من لوحة الرقابة التلقائية!' : 'Le statut de la commande a été forcé par l\'Administrateur !');
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status } : null);
    }
  };

  // Simulate discussion threads between poster and tasker
  const getSimulatedChat = (task: Task) => {
    return [
      { sender: task.posterName, message: isRTL ? 'أهلاً بك، هل اطلعت على صور المشكلة بالكامل؟' : 'Bonjour, as-tu pris connaissance de la description ?', time: '10:05 AM' },
      { sender: task.taskerName || 'Hassan Plombier', message: isRTL ? 'نعم أخي، سأحضر معي كل الأنابيب والمعدات اللازمة للتصنيع.' : 'Oui, j\'ai le matériel et je serai disponible dès 14h chez toi.', time: '10:08 AM' },
      { sender: task.posterName, message: isRTL ? 'ممتاز، القيمة متوفرة حالياً بالضمان المالي وسيتم تسييلها بمجرد الإنجاز.' : 'Parfait, le budget est en séquestre escrow chez Payzone, à tout de suite.', time: '10:12 AM' }
    ];
  };

  return (
    <div className="flex flex-col gap-6" id="admin-module-orders">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
        <div className="flex flex-col text-right w-full md:w-auto">
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest leading-none dark:text-white">
            {isRTL ? 'رادار الصفقات ومتابعة سير المهام بالرباط' : 'Rabat Order Flow & Escrow Surveillance'}
          </h3>
          <span className="text-[10px] text-slate-500 font-semibold mt-1.5 leading-snug">
            {isRTL 
              ? 'تتبع المهام النشطة بالتفصيل في الوقت الفعلي، اطلع على سجلات المحادثات وافرض تغييرات إدارية طارئة.' 
              : 'Surveillez le déroulement des tâches en direct, lisez les fils de discussion et modérez les conflits d\'affectation.'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Orders Directory Table */}
        <div className={`p-5 rounded-3xl border lg:col-span-8 flex flex-col gap-4 ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
        }`}>
          {/* Subheader Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'بحث سريع بعنوان المهمة، رقم المعرف أو ناشر الخدمة...' : 'Rechercher par titre, ID ou donneur d\'ordres...'}
              className={`flex-1 text-xs px-3 py-2.5 rounded-xl border focus:outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-gray-200'
              }`}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`text-xs px-3 py-2 rounded-xl border font-bold ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-gray-200 text-slate-700'
              }`}
            >
              <option value="all">{isRTL ? 'جميع الحالات' : 'Tous les statuts'}</option>
              <option value="open">{isRTL ? 'مفتوحة للتقديم' : 'Ouvertes'}</option>
              <option value="assigned">{isRTL ? 'قيد العمل' : 'Assignées'}</option>
              <option value="completed">{isRTL ? 'مكتملة' : 'Complétées'}</option>
              <option value="cancelled">{isRTL ? 'ملغية' : 'Annulées'}</option>
              <option value="held">{isRTL ? 'معلقة إدارياً' : 'Bloquées'}</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/50 text-slate-400 border-b select-none dark:bg-slate-950/40 dark:border-slate-800">
                <tr>
                  <th className="p-2 text-right">{isRTL ? 'تفاصيل المهمة والمعرف' : 'Tâche & ID'}</th>
                  <th className="p-2 text-right">{isRTL ? 'الناشر والمنفذ' : 'Intervenants'}</th>
                  <th className="p-2 text-right">{isRTL ? 'الضمان المالي' : 'Escrow (MAD)'}</th>
                  <th className="p-2 text-right">{isRTL ? 'الحالة' : 'Statut'}</th>
                  <th className="p-2 text-center">{isRTL ? 'التحليلات ومحادثات' : 'SaaS Logs'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/10 font-medium">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400 font-bold select-none">
                      {isRTL ? 'لا توجد تذاكر عمل نشطة تطابق فلتر البحث.' : 'Aucune commande sous ce critère.'}
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => {
                    return (
                      <tr 
                        key={t.id} 
                        onClick={() => setSelectedTask(t)}
                        className={`hover:bg-slate-100/40 dark:hover:bg-slate-850/30 cursor-pointer border-b dark:border-slate-850 ${
                          selectedTask?.id === t.id ? (isDarkMode ? 'bg-slate-800/40' : 'bg-slate-50') : ''
                        }`}
                      >
                        <td className="p-2.5">
                          <div className="flex flex-col text-left">
                            <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[170px]">{t.title}</span>
                            <span className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest mt-0.5">{t.id.substring(0, 8)}</span>
                            <span className="text-[9px] text-slate-405 mt-0.5">{t.location} • {t.category}</span>
                          </div>
                        </td>

                        <td className="p-2.5">
                          <div className="flex flex-col text-right">
                            <span className="font-bold text-[10px]">{isRTL ? 'منشئ:' : 'Poster:'} {t.posterName}</span>
                            <span className="text-[9px] text-slate-400 mt-0.5">
                              {isRTL ? 'منفذ:' : 'Freelance:'} {t.taskerName || (isRTL ? 'غير معين' : 'Non assigné')}
                            </span>
                          </div>
                        </td>

                        <td className="p-2.5 font-bold font-mono text-indigo-650 dark:text-indigo-400">
                          {t.budget} MAD
                        </td>

                        <td className="p-2.5">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            t.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                            t.status === 'assigned' ? 'bg-sky-50 text-sky-700' :
                            t.status === 'held' ? 'bg-amber-50 text-amber-700' :
                            t.status === 'cancelled' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {t.status}
                          </span>
                        </td>

                        <td className="p-2.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(t);
                            }}
                            className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-805 text-sky-505 rounded-lg transition-all cursor-pointer"
                            title="Auditer Conversation Chat Log"
                          >
                            <MessageSquare className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Mini Details Launcher Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {selectedTask ? (
            <div className={`p-6 rounded-3xl border flex flex-col gap-4 text-right transition-all duration-300 ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div className="flex justify-between items-center border-b pb-2 flex-row-reverse">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  {isRTL ? 'معاينة تذكرة الصفقة' : 'Order Quick Inspector'}
                </h4>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Settings className="w-4 h-4" />
                </span>
              </div>

              <div className="flex flex-col text-right gap-1">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">{selectedTask.title}</span>
                <span className="text-[10px] text-indigo-405 font-mono select-all">{selectedTask.id}</span>
                <span className="text-[11px] font-bold text-emerald-600 mt-1">{selectedTask.budget} MAD en Séquestre</span>
              </div>

              <button
                onClick={() => setSelectedTask(selectedTask)}
                className="w-full mt-2.5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-indigo-600/10 transition-all text-center block"
              >
                {isRTL ? 'إطلاق رادار الرقابة الثلاثي (Bento) ⚡' : 'Open 3-Column Bento Inspector ⚡'}
              </button>
            </div>
          ) : (
            <div className={`p-12 rounded-3xl border text-center text-xs font-bold text-gray-400 ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <span>{isRTL ? 'اضغط على أي صفقة لفتح تتبع مسار الرقابة ثلاثي الأبعاد.' : 'Veuillez cliquer sur une commande pour afficher sa console de contrôle.'}</span>
            </div>
          )}
        </div>
      </div>

      {/* 🧩 SPECTACULAR 3-COLUMN BENTO DETAIL OVERLAY MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
          <div className={`w-full max-w-5xl rounded-3xl border text-right font-sans ${
            isDarkMode ? 'bg-[#0f172a] text-slate-100 border-slate-800' : 'bg-white text-slate-850 border-gray-150 shadow-2xl'
          } overflow-hidden max-h-[90vh] flex flex-col`}>
            
            {/* Header */}
            <div className={`p-5 border-b dark:border-slate-800 flex items-center justify-between ${
              isDarkMode ? 'bg-slate-950/30' : 'bg-slate-50/50'
            }`}>
              <button 
                onClick={() => setSelectedTask(null)}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-200 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all"
              >
                ✕ Close
              </button>
              <div className="flex items-center gap-2.5 flex-row-reverse text-right">
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-black tracking-widest text-[#6366f1] uppercase">
                  {isRTL ? 'قاعة التحكم الثلاثية بالصفقة والضمان المالي' : '3-COLUMN ESCROW LIFE LIFECYCLE BENTO DESK'}
                </span>
              </div>
            </div>

            {/* 3-Column stage */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5 text-right flex-1">
              
              {/* Column 1: TimelineStepper (Span 3) */}
              <div className={`md:col-span-3 p-4 rounded-2xl border flex flex-col gap-4 relative ${
                isDarkMode ? 'bg-slate-950/45 border-slate-800' : 'bg-slate-50/50 border-gray-150'
              }`}>
                <span className="text-[10px] font-black uppercase text-gray-400 block border-b pb-2 select-none">
                  {isRTL ? 'مسار تقدم الصفقة المتتابع' : 'Timeline Stepper'}
                </span>

                <div className="relative border-r border-[#6366f1]/20 mt-2 pr-4 space-y-5 text-xs font-semibold text-slate-500">
                  <div className="relative">
                    <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <p className="font-extrabold text-slate-800 dark:text-white">{isRTL ? 'نشر وتأكيد الإرسال' : '1. Open Needs'}</p>
                    <p className="text-[9.5px] text-gray-400 font-medium">{isRTL ? 'السيولة جاهزة بالضمان العاجل' : 'Funds loaded'}</p>
                  </div>
                  <div className="relative">
                    <span className={`absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full ${selectedTask.offersCount > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <p className="font-extrabold text-slate-800 dark:text-white">{isRTL ? 'تلقي ومطابقة عروض السعر' : '2. Candidate Placements'}</p>
                    <p className="text-[9.5px] text-gray-400 font-medium">{selectedTask.offersCount} {isRTL ? 'عروض' : 'bids'}</p>
                  </div>
                  <div className="relative">
                    <span className={`absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full ${selectedTask.status !== 'open' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <p className="font-extrabold text-slate-800 dark:text-white">{isRTL ? 'تلقيح الاتفاق وتعيين الشريك' : '3. Signed Assigned'}</p>
                    <p className="text-[9.5px] text-gray-400 font-medium truncate">
                      {selectedTask.taskerName ? `${selectedTask.taskerName}` : 'Attente prestaraire'}
                    </p>
                  </div>
                  <div className="relative">
                    <span className={`absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full ${selectedTask.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <p className="font-extrabold text-slate-800 dark:text-white">{isRTL ? 'بدء العمل والرقابة التشغيلية' : '4. In Progress Execution'}</p>
                    <p className="text-[9.5px] text-gray-400 font-medium">{isRTL ? 'مرحلة سير الأنشطة' : 'Implementation live'}</p>
                  </div>
                  <div className="relative pb-1">
                    <span className={`absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full ${selectedTask.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <p className="font-extrabold text-slate-800 dark:text-white">{isRTL ? 'تسوية الأموال ونقل الأرصدة' : '5. Escrow Release'}</p>
                    <p className="text-[9.5px] text-gray-405 font-medium">{isRTL ? 'تكتمل أو تذهب لنزاع' : 'Fonds débloqués ou bloqués'}</p>
                  </div>
                </div>
              </div>

              {/* Column 2: ChatPanel (Span 5) */}
              <div className={`md:col-span-5 p-4 rounded-2xl border flex flex-col gap-3 relative ${
                isDarkMode ? 'bg-[#0b0f19] border-slate-800' : 'bg-white border-gray-150'
              }`}>
                <span className="text-[10px] font-black uppercase text-gray-400 block border-b pb-2 select-none">
                  {isRTL ? 'مراقب المحادثات المشتركة للنزاعات' : 'SaaS Cloud Conversations Monitor'}
                </span>

                <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto p-1 leading-relaxed text-[11px] font-semibold text-right">
                  <p className="text-[9px] text-gray-400 text-center mb-1 bg-slate-500/5 p-1 rounded">
                    🔐 End-to-end encrypted chat log copy for admin arbitrations.
                  </p>
                  {getSimulatedChat(selectedTask).map((msg, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-500/5 border flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[9px] font-extrabold text-indigo-500">
                        <span>{msg.time}</span>
                        <span>{msg.sender}</span>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{msg.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: OrderInfo + Override Actions (Span 4) */}
              <div className={`md:col-span-4 p-4 rounded-2xl border flex flex-col gap-4 relative ${
                isDarkMode ? 'bg-slate-950/45 border-slate-800' : 'bg-slate-50/50 border-gray-150'
              }`}>
                <span className="text-[10px] font-black uppercase text-gray-400 block border-b pb-2 select-none">
                  {isRTL ? 'معلومات التذكرة والسيطرة الإدارية' : 'Order Info & Overrides'}
                </span>

                <div className="space-y-3.5 text-xs text-slate-650 dark:text-slate-350 font-semibold">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-extrabold">{isRTL ? 'عنوان تذكرة الصفقة' : 'Title:'}</span>
                    <span className="text-slate-900 dark:text-white font-extrabold text-[12.5px]">{selectedTask.title}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="block text-[9.5px] text-gray-400">{isRTL ? 'الميزانية / السعر' : 'Escrow:'}</span>
                      <span className="font-extrabold text-indigo-505 dark:text-indigo-400 font-mono text-[13px]">{selectedTask.budget} MAD</span>
                    </div>
                    <div>
                      <span className="block text-[9.5px] text-gray-400">{isRTL ? 'تاريخ التقديم' : 'Due Date:'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{selectedTask.dueDate || '2026-06-15'}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-150/50 dark:border-slate-800 pt-3">
                    <p className="text-[11px] text-slate-500 italic">
                      {isRTL ? 'الملاك الحالي للودائع محتجز بالكامل تحت إشراف Payzone.' : 'Current escrow loaded securely inside SaaS wallet balance.'}
                    </p>
                  </div>

                  {/* Overriding Console buttons */}
                  <div className="border-t border-gray-150/50 dark:border-slate-800 pt-4 flex flex-col gap-2 mt-2">
                    <span className="text-[9px] text-[#6366f1] font-black tracking-wider uppercase">{isRTL ? 'أوامر التسييل القسرية الفورية' : 'CRITICAL ACTIONS'}</span>
                    <button
                      onClick={() => handleOverride(selectedTask.id, 'completed')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm shadow-emerald-600/10"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isRTL ? 'إنهاء قسري وتسييل الرصيد 💰' : 'Force Complete & Disburse 💰'}</span>
                    </button>
                    <button
                      onClick={() => handleOverride(selectedTask.id, 'cancelled')}
                      className="w-full py-2 bg-rose-650 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>{isRTL ? 'إلغاء قسري وإرجاع الرصيد 🛑' : 'Force Cancel & Refund 🛑'}</span>
                    </button>
                    <button
                      onClick={() => handleOverride(selectedTask.id, 'held')}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>{isRTL ? 'تجميد وحظر الضمان المالي ❄' : 'Freeze & Hold Disputes ❄'}</span>
                    </button>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
