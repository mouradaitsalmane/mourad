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
  AlertCircle,
  Trash2,
  ChevronDown,
  Activity,
  User,
  ExternalLink
} from 'lucide-react';
import { Task } from '../../types';

interface OrdersModuleProps {
  isRTL: boolean;
  isDarkMode: boolean;
  tasks: Task[];
  onAddLog: (log: string) => void;
  onOverrideStatus: (taskId: string, newStatus: Task['status']) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function OrdersModule({
  isRTL,
  isDarkMode,
  tasks,
  onAddLog,
  onOverrideStatus,
  onDeleteTask
}: OrdersModuleProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'assigned' | 'completed' | 'cancelled' | 'held'>('all');
  
  // Confirm Delete state
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  // Custom Action Grouping dropdown selection
  const [pendingActionOverride, setPendingActionOverride] = useState<Task['status'] | ''>('');

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

  const handleOverrideExecute = (taskId: string) => {
    if (!pendingActionOverride) return;
    onOverrideStatus(taskId, pendingActionOverride);
    onAddLog(`System Override: Task ID [${taskId.substring(0,8)}] force set to ${pendingActionOverride.toUpperCase()}`);
    alert(isRTL ? 'إقرار تحديث حالة الصفقة المالي بنجاح!' : 'Surveillance: statut de commande mis à jour avec privilège admin !');
    
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status: pendingActionOverride } : null);
    }
    setPendingActionOverride('');
  };

  const getSimulatedChat = (task: Task) => {
    return [
      { sender: task.posterName, message: isRTL ? 'أهلاً بك، هل اطلعت على صور المشكلة بالكامل؟' : 'Bonjour, as-tu pris connaissance de la description ?', time: '10:05 AM' },
      { sender: task.taskerName || 'Hassan Plombier', message: isRTL ? 'نعم أخي، سأحضر معي كل الأنابيب والمعدات اللازمة للتصنيع.' : 'Oui, j\'ai le matériel et je serai disponible dès 14h chez toi.', time: '10:08 AM' },
      { sender: task.posterName, message: isRTL ? 'ممتاز، القيمة متوفرة حالياً بالضمان المالي وسيتم تسييلها بمجرد الإنجاز.' : 'Parfait, le budget est en séquestre escrow chez Payzone, à tout de suite.', time: '10:12 AM' }
    ];
  };

  // Modern clean status chip mapping adhering to Simple Design style guide
  const renderStatusChip = (status: Task['status']) => {
    const rules = {
      open: {
        bg: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-550/15',
        label: isRTL ? 'متوفر 📥' : 'Open'
      },
      assigned: {
        bg: 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border-sky-550/15',
        label: isRTL ? 'قيد الإنجاز 🔧' : 'In Work'
      },
      completed: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-405 border-emerald-550/15',
        label: isRTL ? 'تم الإنجاز ✓' : 'Settled'
      },
      cancelled: {
        bg: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-550/15',
        label: isRTL ? 'ملغي' : 'Cancelled'
      },
      held: {
        bg: 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border-rose-550/15',
        label: isRTL ? 'مجمد وموقوف ❄' : 'Escrow Locked'
      }
    };

    const c = rules[status] || { bg: 'bg-gray-100 text-gray-700', label: status };
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${c.bg}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="flex flex-col gap-6 select-none font-sans" id="admin-module-orders">
      
      {/* Header section with description */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
        <div className="flex flex-col text-right w-full">
          <h3 className="text-xs font-black text-slate-805 dark:text-slate-205 uppercase tracking-widest">
            {isRTL ? 'مراقب صفقات ومهام الضمان المالي' : 'Escrow Order Flow Surveillance'}
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1.5 leading-relaxed">
            {isRTL 
              ? 'تتبع جميع الأنشطة النشطة في الرباط، عاين سجلات المحادثات، وافرض تعيينات أو تجميداً للسيولة عند الإخلال بالشروط.' 
              : 'Audit active work contracts, read direct communication chat logs, and enforce quick status adjustments.'}
          </p>
        </div>
      </div>

      {/* Grid Layout Level 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Orders Directory List */}
        <div className={`p-6 rounded-2xl border lg:col-span-8 flex flex-col gap-5 ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
        }`}>
          
          {/* Quick Filters Area */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'بحث سريع عن تذكرة، اسم المستخدم، الفئة...' : 'Filter by title, client name, index...'}
              className={`flex-1 text-xs px-3.5 py-2 rounded-xl border focus:outline-none font-bold ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-gray-200 text-slate-800'
              }`}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`text-xs px-3.5 py-2 rounded-xl border font-black focus:outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-gray-200 text-slate-700'
              }`}
            >
              <option value="all">{isRTL ? 'كل حالات الصفقات' : 'All status types'}</option>
              <option value="open">{isRTL ? 'مفتوحة للتقديم' : 'Open'}</option>
              <option value="assigned">{isRTL ? 'قيد العمل الفعلي' : 'In Work'}</option>
              <option value="completed">{isRTL ? 'مكتملة ومحررة' : 'Completed'}</option>
              <option value="cancelled">{isRTL ? 'ملغية ومسترجعة' : 'Cancelled'}</option>
              <option value="held">{isRTL ? 'معلقة إدارياً للنزاع' : 'Escrow Lock'}</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100/10 text-slate-400 border-b pb-2 select-none dark:border-slate-800 text-[10px]">
                  <th className="p-3 text-right">{isRTL ? 'تفاصيل الصفقة والمعرف' : 'Task title & ID'}</th>
                  <th className="p-3 text-right">{isRTL ? 'الأطراف الفاعلة' : 'Stakeholders'}</th>
                  <th className="p-3 text-right">{isRTL ? 'محجوز الضمان' : 'Escrow total'}</th>
                  <th className="p-3 text-right">{isRTL ? 'حالة التذكرة' : 'SaaS Status'}</th>
                  <th className="p-3 text-center">{isRTL ? 'مراقبة وحذف' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150/40 dark:divide-slate-800/80 font-semibold">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400 font-bold select-none">
                      {isRTL ? 'لا توجد تذاكر نشطة تطابق فلتر البحث المذكور.' : 'No tasks match criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr 
                      key={t.id} 
                      onClick={() => {
                        setSelectedTask(t);
                        setPendingActionOverride(''); // reset selection override
                      }}
                      className={`hover:bg-slate-100/40 dark:hover:bg-slate-850/30 cursor-pointer transition-colors border-b dark:border-slate-850 ${
                        selectedTask?.id === t.id ? (isDarkMode ? 'bg-slate-800/40' : 'bg-slate-100/60') : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex flex-col text-right">
                          <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[180px]">{t.title}</span>
                          <span className="text-[9px] font-mono text-indigo-405 uppercase tracking-widest mt-0.5">{t.id.substring(0, 8)}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col text-right text-[10.5px]">
                          <span>👤 {t.posterName}</span>
                          <span className="text-gray-400 mt-0.5 text-[9.5px]">🔧 {t.taskerName || (isRTL ? 'لم يعين شريك' : 'Not assigned')}</span>
                        </div>
                      </td>

                      <td className="p-3 font-extrabold font-mono text-indigo-650 dark:text-indigo-400">
                        {t.budget} MAD
                      </td>

                      <td className="p-3">
                        {renderStatusChip(t.status)}
                      </td>

                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedTask(t);
                              setPendingActionOverride('');
                            }}
                            className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-600 rounded-xl transition-all cursor-pointer"
                            title={isRTL ? 'معاينة رادار الرقابة' : 'Arbitration details'}
                          >
                            <ExternalLink className="w-3.5 h-3.5 mx-auto" />
                          </button>
                          <button
                            onClick={() => setTaskToDelete(t.id)}
                            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-xl transition-all cursor-pointer"
                            title={isRTL ? 'حذف من المنصة نهائياً' : 'Delete order'}
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Level 3 Inline Detailed Inspector Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {selectedTask ? (
            <div className={`p-6 rounded-2xl border flex flex-col gap-5 text-right transition-all duration-300 ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              
              <div className="flex justify-between items-center border-b pb-2.5 flex-row-reverse dark:border-slate-800">
                <h4 className="text-[10.5px] font-black uppercase text-gray-400 tracking-wider">
                  {isRTL ? 'رادار تتبع التدفق والقرار' : 'Order Quick Inspector'}
                </h4>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400">
                  <Settings className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-4 font-semibold text-xs text-slate-700 dark:text-slate-350">
                <div>
                  <span className="block text-[9.5px] text-gray-400 uppercase font-black">{isRTL ? 'عنوان الطلب المعاين' : 'Inspected task'}</span>
                  <span className="text-slate-950 dark:text-white font-black text-sm block mt-0.5 leading-tight">{selectedTask.title}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-500/5 p-3 rounded-xl">
                  <div>
                    <span className="block text-[8.5px] text-gray-400">{isRTL ? 'ميزانية الضمان' : 'Escrow budget'}</span>
                    <span className="font-extrabold text-indigo-505 dark:text-indigo-400 font-mono text-[12px]">{selectedTask.budget} MAD</span>
                  </div>
                  <div>
                    <span className="block text-[8.5px] text-gray-400">{isRTL ? 'تاريخ التقديم' : 'Deadline'}</span>
                    <span className="font-bold text-slate-850 dark:text-slate-100">{selectedTask.dueDate || '2026-06-25'}</span>
                  </div>
                </div>

                {/* Simulated conversations log trigger */}
                <button
                  onClick={() => setSelectedTask(selectedTask)}
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg shadow-indigo-600/10 transition-all text-center block"
                >
                  {isRTL ? 'إطلاق رادار الرقابة الثلاثي (Bento) ⚡' : 'Open Custom Bento Inspector ⚡'}
                </button>
              </div>

            </div>
          ) : (
            <div className={`p-10 rounded-2xl border text-center text-xs font-bold text-gray-400 ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2.5" />
              <span>{isRTL ? 'يرجى الضغط على أي صفقة لتشغيل رادار المراقبة التفصيلي.' : 'Click any trade row to boot up the decision overrides drawer.'}</span>
            </div>
          )}
        </div>

      </div>

      {/* ================= LEVEL 3: DETAILED THREE-COLUMN BENTO DECISION MODAL ================= */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
          <div className={`w-full max-w-5xl rounded-3xl border text-right font-sans ${
            isDarkMode ? 'bg-[#0f172a] text-slate-105 border-slate-800' : 'bg-white text-slate-850 border-gray-150 shadow-2xl'
          } overflow-hidden max-h-[88vh] flex flex-col`}>
            
            {/* Modal header with safe execution toggle */}
            <div className={`p-5 border-b dark:border-slate-800 flex items-center justify-between ${
              isDarkMode ? 'bg-slate-950/30' : 'bg-slate-50/50'
            }`}>
              <button 
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-gray-200 rounded-xl text-xs font-black shrink-0 cursor-pointer transition-all"
              >
                ✕ {isRTL ? 'إغلاق الرادار' : 'Close Console'}
              </button>
              <div className="flex items-center gap-2.5 flex-row-reverse text-right">
                <ShieldAlert className="w-4 h-4 text-indigo-505" />
                <span className="text-xs font-black tracking-widest text-[#6366f1] uppercase">
                  {isRTL ? 'بورتال الرقابة المشترك وفض النزاعات' : '3-Column Escrow Management Console'}
                </span>
              </div>
            </div>

            {/* Stage content */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5 text-right flex-1 items-stretch">
              
              {/* Stepper Timeline (Span 3) */}
              <div className={`md:col-span-3 p-4.5 rounded-2xl border flex flex-col justify-between ${
                isDarkMode ? 'bg-slate-955 border-slate-800' : 'bg-slate-50/60 border-gray-150'
              }`}>
                <div>
                  <span className="text-[9.5px] font-black uppercase text-gray-400 block border-b pb-2 select-none mb-4">
                    {isRTL ? 'مراحل ومسار الصفقة' : 'Contract Timeline'}
                  </span>

                  <div className="relative border-r border-[#6366f1]/25 pr-4.5 space-y-5 text-xs font-semibold text-slate-400">
                    <div className="relative">
                      <span className="absolute -right-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <p className="font-extrabold text-slate-850 dark:text-white">{isRTL ? 'نشر وإيداع المبلغ للضمان' : '1. Open & Fund Escrow'}</p>
                      <span className="text-[9.5px] text-gray-405 block mt-0.5">{selectedTask.budget} MAD Secured✓</span>
                    </div>
                    <div className="relative">
                      <span className={`absolute -right-[23px] top-1 w-2.5 h-2.5 rounded-full ${selectedTask.offersCount > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      <p className="font-extrabold text-slate-850 dark:text-white">{isRTL ? 'إرسال واستقبال عروض الأثمان' : '2. Bidding'}</p>
                      <span className="text-[9.5px] text-gray-405 block mt-0.5">{selectedTask.offersCount} Bids</span>
                    </div>
                    <div className="relative">
                      <span className={`absolute -right-[23px] top-1 w-2.5 h-2.5 rounded-full ${selectedTask.status !== 'open' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      <p className="font-extrabold text-slate-855 dark:text-white">{isRTL ? 'إبرام وتوقيع عقد العمل' : '3. Contract Assigned'}</p>
                      <span className="text-[9.5px] text-gray-405 block mt-0.5">{selectedTask.taskerName || 'Queue'}</span>
                    </div>
                    <div className="relative">
                      <span className={`absolute -right-[23px] top-1 w-2.5 h-2.5 rounded-full ${selectedTask.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      <p className="font-extrabold text-slate-855 dark:text-white">{isRTL ? 'سير الخدمة والمراقبة' : '4. Execution'}</p>
                      <span className="text-[9.5px] text-gray-405 block mt-0.5">{selectedTask.status}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-gray-450 italic leading-snug mt-4 pt-3 border-t border-gray-150/50">
                  Rabat escrow automated rules.
                </div>
              </div>

              {/* Chat Encrypted Logs (Span 5) */}
              <div className={`md:col-span-5 p-4.5 rounded-2xl border flex flex-col gap-3 ${
                isDarkMode ? 'bg-[#0b0f19] border-slate-800' : 'bg-white border-gray-150'
              }`}>
                <span className="text-[9.5px] font-black uppercase text-gray-400 block border-b pb-2 select-none">
                  {isRTL ? 'سجلات محادثات الشركاء لفض النزاع' : 'Direct Encrypted Chats Monitor'}
                </span>

                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto leading-relaxed text-[11px] font-semibold text-right">
                  <p className="text-[9px] text-gray-400 text-center mb-1 bg-slate-500/5 p-1.5 rounded">
                    🔐 Compliance Copy: SSL encrypted logs retrieved for legal arbitration.
                  </p>
                  {getSimulatedChat(selectedTask).map((msg, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-500/5 border flex flex-col gap-1 text-right">
                      <div className="flex justify-between items-center text-[9px] font-black text-indigo-550 flex-row-reverse">
                        <span>{msg.sender}</span>
                        <span className="text-slate-400">{msg.time}</span>
                      </div>
                      <span className="text-slate-700 dark:text-slate-200 font-medium text-right leading-relaxed">{msg.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Master Decision Group (Actions Hierarchy & Grouping) (Span 4) */}
              <div className={`md:col-span-4 p-4.5 rounded-2xl border flex flex-col justify-between ${
                isDarkMode ? 'bg-slate-955 border-slate-800' : 'bg-slate-50/60 border-gray-150'
              }`}>
                <div>
                  <span className="text-[9.5px] font-black uppercase text-gray-400 block border-b pb-2 select-none mb-3">
                    {isRTL ? 'لوحة تسييل القرارات الإدارية' : 'Governance & Overrides'}
                  </span>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="block text-[9.5px] text-gray-400 font-black">{isRTL ? 'الحجم المالي محجوز الضمان' : 'Amount locked escrow:'}</span>
                      <span className="font-black text-indigo-650 dark:text-indigo-400 font-mono text-sm">{selectedTask.budget} MAD</span>
                    </div>
                    <div>
                      <span className="block text-[9.5px] text-gray-400 font-black">{isRTL ? 'الحالة الحالية المنشورة' : 'Current status:'}</span>
                      {renderStatusChip(selectedTask.status)}
                    </div>
                  </div>
                </div>

                {/* ACTION GROUPING: Single streamlined selection and action button to prevent visual noise */}
                <div className="mt-4 pt-4 border-t border-gray-155/60 dark:border-slate-800 space-y-3 text-right">
                  <span className="block text-[9.5px] text-[#6366f1] font-black tracking-wider uppercase">
                    {isRTL ? 'إجراء تغيير الحالة الطارئ' : 'Action Grouping Overrides'}
                  </span>
                  
                  <div className="flex flex-col gap-2.5">
                    <div className="relative">
                      <select
                        value={pendingActionOverride}
                        onChange={(e) => setPendingActionOverride(e.target.value as Task['status'])}
                        className={`w-full text-xs px-3 py-2 border rounded-xl font-bold focus:outline-none appearance-none cursor-pointer ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-200 text-slate-800'
                        }`}
                      >
                        <option value="">{isRTL ? '-- حدد الإجراء البديل --' : '-- Choose status override --'}</option>
                        <option value="completed">{isRTL ? 'تسييل لصالح الحرفي (إكتمال) ✓' : 'Settle & Release'}</option>
                        <option value="cancelled">{isRTL ? 'إرجاع السيولة للعميل (إلغاء) 🛑' : 'Refund Client (Cancel)'}</option>
                        <option value="held">{isRTL ? 'تجميد الضمان بالكامل (نزاع) ❄' : 'Freeze & Hold Disputes'}</option>
                      </select>
                      <ChevronDown className="absolute left-3 top-2.5 w-4 h-4 text-gray-450 pointer-events-none" />
                    </div>

                    {/* Streamlined Primary Indigo execution button based on Action Hierarchy */}
                    <button
                      onClick={() => handleOverrideExecute(selectedTask.id)}
                      disabled={!pendingActionOverride}
                      className={`w-full py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        pendingActionOverride
                          ? 'bg-indigo-650 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/15'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{isRTL ? 'تنفيذ وتأكيد القرار الفوري' : 'Authorize Selected Action'}</span>
                    </button>
                  </div>
                  
                  <p className="text-[9.5px] text-gray-400 leading-normal leading-relaxed">
                    {isRTL 
                      ? 'بموجب النظم، يؤدي تحديث الحالة الإدارية المذكور لتدوين فوري على نظام Payzone وتغيير رصيد المحافظ.'
                      : 'Executing this administrative override forces ledger corrections and updates both client and provider wallets.'}
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Confirm Task Deletion Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none">
          <div className={`p-6 rounded-3xl border text-right max-w-sm w-full ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-150 text-slate-800 shadow-xl'}`}>
            <h3 className="text-sm font-black mb-2">{isRTL ? 'تأكيد الحذف النهائي للإعلان' : 'Confirm Task Deletion'}</h3>
            <p className="text-xs text-slate-400 mb-4 font-semibold leading-normal">
              {isRTL 
                ? 'هل أنت متأكد من رغبتك في حذف هذا الطلب/الإعلان نهائياً من العروض وقاعدة البيانات؟ لا يمكن استرجاعه بعد ذلك.' 
                : 'Are you sure you want to permanently delete this task advertisement from the platform? This cannot be undone.'}
            </p>
            <div className="flex justify-end gap-2 text-xs font-black">
              <button 
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-200"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button 
                onClick={() => {
                  onDeleteTask(taskToDelete);
                  if (selectedTask && selectedTask.id === taskToDelete) {
                    setSelectedTask(null);
                  }
                  setTaskToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer"
              >
                {isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
