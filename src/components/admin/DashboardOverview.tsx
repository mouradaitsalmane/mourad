import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Wallet, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity, 
  CheckCircle, 
  Send, 
  AlertTriangle,
  Play,
  TrendingUp,
  ShieldCheck,
  Percent,
  Clock,
  UserX,
  X,
  RotateCcw,
  Check,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { Task, UserProfile } from '../../types';

interface DashboardOverviewProps {
  isRTL: boolean;
  isDarkMode: boolean;
  users: UserProfile[];
  tasks: Task[];
  systemLogs: string[];
  fraudAlerts: any[];
  payoutRequests: any[];
  verificationRequests: any[];
  disputes: any[];
  onDismissAlert: (id: string) => void;
  onFreezeUser: (userId: string, alertId: string) => void;
  onAddLog: (log: string) => void;
  onApprovePayout: (payoutId: string, name: string, amount: number) => Promise<void>;
  onHoldPayout: (payoutId: string, name: string) => Promise<void>;
  onResolveDispute: (ticketId: string, decision: string) => Promise<void>;
  onUpdateKyc: (requestId: string, userId: string, status: 'approved' | 'rejected') => Promise<void>;
  onResolveFraudAlert: (alertId: string, decision: 'dismissed' | 'suppressed') => Promise<void>;
}

export default function DashboardOverview({
  isRTL,
  isDarkMode,
  users,
  tasks,
  systemLogs,
  fraudAlerts,
  payoutRequests,
  verificationRequests,
  disputes,
  onDismissAlert,
  onFreezeUser,
  onAddLog,
  onApprovePayout,
  onHoldPayout,
  onResolveDispute,
  onUpdateKyc,
  onResolveFraudAlert
}: DashboardOverviewProps) {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [controlTab, setControlTab] = useState<'payouts' | 'disputes' | 'kyc' | 'fraud'>('payouts');
  
  // Async processing states for controls
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Stats Calculations
  const totalUsersCount = users.length || 24;
  const workersCount = users.filter((u) => u.isTasker).length || 10;
  
  const liveOrdersCount = tasks.filter((t) => t.status === 'open' || t.status === 'assigned').length;
  const activeProvidersCount = users.filter((u) => u.isTasker && !(u as any).isSuspended).length;
  const pendingDisputesCount = disputes.filter(d => d.status !== 'resolved').length || 2;
  const failedPaymentsCount = 1; // Simulation trigger

  // Finance Indicators
  const totalEscrowVolume = tasks.reduce((sum, t) => sum + (t.budget || 0), 0) || 12400;
  const gmv = totalEscrowVolume * 1.15; // standard volume projection
  const platformRevenueVal = Math.round(totalEscrowVolume * 0.15);
  const profitVal = Math.round(platformRevenueVal * 0.78); // Net operational profit
  const churnEst = '2.4%';
  const growthRate = '+18.6%';

  const handleBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    alert(isRTL ? 'تم بث الإعلان الآمن فوراً لجميع الهواتف النشطة!' : 'Annonce flash cryptée poussée de force à l’écosystème !');
    onAddLog(`System Broadcast: "${broadcastMessage.trim()}"`);
    setBroadcastMessage('');
  };

  const wrapAction = async (id: string, action: () => Promise<void>) => {
    setProcessingId(id);
    try {
      await action();
    } catch (err: any) {
      alert(`Action error: ${err.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8" id="admin-module-dashboard-overview-enterprise">
      
      {/* SECTION I: LIVE OPERATIONS LAYER */}
      <div>
        <div className="flex items-center gap-1.5 mb-4 flex-row-reverse justify-end">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            {isRTL ? 'مستوى العمليات التشغيلية الفورية' : 'Level A: Live Operations Surveillance'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Live Orders count */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden ${
            isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
          }`}>
            <div className="flex items-center justify-between flex-row-reverse border-b pb-2.5 dark:border-slate-800">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
              </span>
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {isRTL ? 'الصفقات قيد الإنجاز' : 'Live Orders Count'}
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{liveOrdersCount}</span>
              <span className="text-[10px] text-sky-500 font-extrabold">{isRTL ? 'نشط الآن' : 'Running active'}</span>
            </div>
          </div>

          {/* Active Providers count */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden ${
            isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
          }`}>
            <div className="flex items-center justify-between flex-row-reverse border-b pb-2.5 dark:border-slate-800">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {isRTL ? 'الحرفيين النشطين برباط' : 'Active Providers'}
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{activeProvidersCount}</span>
              <span className="text-[10px] text-emerald-500 font-extrabold">{isRTL ? 'متاح بالحي' : 'Approved online'}</span>
            </div>
          </div>

          {/* Disputes Pending */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden ${
            isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
          }`}>
            <div className="flex items-center justify-between flex-row-reverse border-b pb-2.5 dark:border-slate-800">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {isRTL ? 'النزاعات المعلقة ' : 'Disputes Pending'}
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{pendingDisputesCount}</span>
              <span className="text-[10px] text-amber-500 font-extrabold">{isRTL ? 'يحتاج قرار' : 'SLA Breaches'}</span>
            </div>
          </div>

          {/* Failed payment alerts */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden ${
            isDarkMode ? 'bg-slate-905/40 border-rose-950/50 ring-1 ring-rose-500/10' : 'bg-rose-50/20 border-rose-100 shadow-xs'
          }`}>
            <div className="flex items-center justify-between flex-row-reverse border-b pb-2.5 dark:border-slate-800">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">
                {isRTL ? 'فشل تحصيل الأرصدة' : 'Failed Payments Alert'}
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-3xl font-black text-rose-650 dark:text-rose-400">{failedPaymentsCount}</span>
              <span className="text-[10px] text-rose-500 font-extrabold">{isRTL ? 'بوابة Payzone' : 'Payzone API error'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION II: BUSINESS KPI LAYER */}
      <div>
        <div className="flex items-center gap-1.5 mb-4 flex-row-reverse justify-end">
          <TrendingUp className="w-4 h-4 text-indigo-505" />
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            {isRTL ? 'مستوى تحليل مؤشرات الأداء والنمو' : 'Level B: Business KPI Intelligence Matrix'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Revenue */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
          }`}>
            <span className="text-[9px] font-black text-slate-400 uppercase">{isRTL ? 'إجمالي الأرباح' : 'Revenue Profit'}</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-450 mt-3">{platformRevenueVal.toLocaleString()} MAD</span>
            <span className="text-[9.5px] text-emerald-500 font-bold mt-1">{growthRate} MoM</span>
          </div>

          {/* GMV */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
          }`}>
            <span className="text-[9px] font-black text-slate-400 uppercase">{isRTL ? 'حجم المعاملات الإجمالي gmv' : 'Gross Merchandise Volume'}</span>
            <span className="text-2xl font-black mt-3">{gmv.toLocaleString()} MAD</span>
            <span className="text-[9.5px] text-indigo-400 font-bold mt-1">+12.4% target</span>
          </div>

          {/* profit */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
          }`}>
            <span className="text-[9px] font-black text-slate-400 uppercase">{isRTL ? 'صافي العائد العملياتي' : 'Net Operational Profit'}</span>
            <span className="text-2xl font-black text-sky-600 mt-3">{profitVal.toLocaleString()} MAD</span>
            <span className="text-[9.5px] text-sky-400 font-bold mt-1">78% margin efficiency</span>
          </div>

          {/* Churn rate */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
          }`}>
            <span className="text-[9px] font-black text-slate-400 uppercase">{isRTL ? 'معدل الانسحاب والتسرب' : 'Churn Rate'}</span>
            <span className="text-2xl font-black text-indigo-505 mt-3">{churnEst}</span>
            <span className="text-[9.5px] text-emerald-500 font-bold mt-1">-0.4% improvement</span>
          </div>

          {/* Growth rate */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
          }`}>
            <span className="text-[9px] font-black text-slate-400 uppercase">{isRTL ? 'سرعة توسع المنصة' : 'Growth Rate Forecast'}</span>
            <span className="text-2xl font-black text-emerald-600 mt-3">{growthRate}</span>
            <span className="text-[9.5px] text-emerald-500 font-bold mt-1">High-Velocity scale</span>
          </div>
        </div>
      </div>

      {/* SECTION III: CONTROL LAYER (ACTIONS SYSTEM) */}
      <div>
        <div className="flex items-center gap-1.5 mb-4 flex-row-reverse justify-end">
          <ShieldCheck className="w-4 h-4 text-indigo-501" />
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            {isRTL ? 'منطقة التحكم المالي والقرارات الإدارية الحساسة' : 'Level C: Backoffice Control & Decision Cockpit'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Control Console with Tabs */}
          <div className={`lg:col-span-8 p-5 rounded-2xl border flex flex-col gap-4 text-right transition-all ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
          }`}>
            
            {/* Console switcher */}
            <div className="flex border-b border-gray-100/10 pb-2 sm:flex-row flex-col justify-between gap-3 items-center">
              
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'payouts', ar: 'الحوالات النقدية 💳', fr: 'Payouts Releases' },
                  { id: 'disputes', ar: 'فض النزاعات ⚖️', fr: 'Dispute Arbitration' },
                  { id: 'kyc', ar: 'تثبيت الوثائق 📁', fr: 'Verification Queue' },
                  { id: 'fraud', ar: 'سجلات Fraud 🚨', fr: 'SecOps Alarms' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setControlTab(tab.id as any)}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg cursor-pointer transition-all ${
                      controlTab === tab.id 
                        ? 'bg-[#6366f1] text-white' 
                        : 'text-slate-405 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isRTL ? tab.ar : tab.fr}
                  </button>
                ))}
              </div>

              <span className="text-[10px] font-bold text-indigo-505 select-none tracking-wider uppercase">
                {isRTL ? 'منفذ معالجات السحابة ' : 'Enforcing Secure Writes'}
              </span>
            </div>

            {/* TAB CONTENT: PAYOUTS */}
            {controlTab === 'payouts' && (
              <div className="flex flex-col gap-3">
                {payoutRequests.filter(p => p.status === 'pending').length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto mb-2 animate-bounce" />
                    <span className="text-xs font-bold leading-normal block">{isRTL ? 'جميع مستحقات الحرفيين البنكية تم تسويتها بالكامل!' : 'No pending payouts in queue.'}</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-[11px] font-sans font-bold">
                      <thead>
                        <tr className="border-b border-gray-100/10 text-slate-400 text-[10px]">
                          <th className="pb-2 text-right">{isRTL ? 'المستفيد' : 'Worker'}</th>
                          <th className="pb-2 text-right">{isRTL ? 'البنك والحساب' : 'RIB Destination'}</th>
                          <th className="pb-2 text-right">{isRTL ? 'القيمة' : 'Amount'}</th>
                          <th className="pb-2 text-center">{isRTL ? 'المصادقة والتحصيل' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100/10">
                        {payoutRequests.filter(p => p.status === 'pending').map((p) => (
                          <tr key={p.id} className="hover:bg-slate-100/20">
                            <td className="py-2">{p.workerName}</td>
                            <td className="py-2 text-[10px] text-indigo-400 font-mono">{p.bank} • {p.account}</td>
                            <td className="py-2 text-emerald-500">{p.amount} MAD</td>
                            <td className="py-2 text-center flex justify-center gap-1">
                              <button
                                disabled={processingId === p.id}
                                onClick={() => wrapAction(p.id, () => onHoldPayout(p.id, p.workerName))}
                                className="px-2 py-1 text-[9.5px] font-black border text-amber-500 border-amber-500/20 dark:hover:bg-amber-500/10 rounded cursor-pointer"
                              >
                                {isRTL ? 'تجميد' : 'Gel / Hold'}
                              </button>
                              <button
                                disabled={processingId === p.id}
                                onClick={() => wrapAction(p.id, () => onApprovePayout(p.id, p.workerName, p.amount))}
                                className="px-2.5 py-1 text-[9.5px] font-black bg-emerald-550 hover:bg-emerald-600 text-white rounded cursor-pointer flex items-center gap-0.5"
                              >
                                {processingId === p.id && <Clock className="w-3 h-3 animate-spin" />}
                                <span>{isRTL ? 'تسييل السداد' : 'Authorize Wire'}</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: DISPUTES */}
            {controlTab === 'disputes' && (
              <div className="flex flex-col gap-3">
                {disputes.filter(d => d.status !== 'resolved').length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <CheckCircle className="w-7 h-7 text-indigo-500 mx-auto mb-2" />
                    <span className="text-xs font-bold block">{isRTL ? 'لم يتم رصد أي نزاع في صفقات الرباط حالياً!' : 'All disputes resolved.'}</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 text-right">
                    {disputes.filter(d => d.status !== 'resolved').map((d) => (
                      <div key={d.id} className="p-3 border dark:border-slate-800 rounded-xl flex sm:flex-row flex-col justify-between items-center gap-2">
                        <div className="text-right flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{d.title || d.subject || 'Task Arbitration Required'}</span>
                          <span className="text-[10px] text-gray-400">ID: {d.id} • {isRTL ? 'الموضوع:' : 'Category:'} {d.category}</span>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            disabled={processingId === d.id}
                            onClick={() => wrapAction(d.id, () => onResolveDispute(d.id, 'refund_client'))}
                            className="px-2 py-1 bg-red-50 text-red-700 dark:bg-rose-500/10 dark:text-rose-400 rounded text-[9.5px] font-black cursor-pointer"
                          >
                            {isRTL ? 'إرجاع للعميل' : 'Refund Client'}
                          </button>
                          <button
                            disabled={processingId === d.id}
                            onClick={() => wrapAction(d.id, () => onResolveDispute(d.id, 'release_to_tasker'))}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 rounded text-[9.5px] font-black cursor-pointer"
                          >
                            {isRTL ? 'صرف للحرفي' : 'Release Worker'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: KYC VERIFICATIONS */}
            {controlTab === 'kyc' && (
              <div className="flex flex-col gap-3">
                {verificationRequests.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <FileCheck className="w-7 h-7 text-emerald-500 mx-auto mb-2 animate-pulse" />
                    <span className="text-xs font-bold block">{isRTL ? 'قائمة الفحص والتحقق من الهوية فارغة!' : 'Verification queue is clean.'}</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-[11px] font-sans font-bold">
                      <thead>
                        <tr className="border-b border-gray-100/10 text-slate-400 text-[10px]">
                          <th className="pb-2 text-right">{isRTL ? 'الاسم والمهنة' : 'Freelancer'}</th>
                          <th className="pb-2 text-right">{isRTL ? 'الأوراق الثبوتية' : 'Identity Assets'}</th>
                          <th className="pb-2 text-center">{isRTL ? 'التدقيق والاعتماد' : 'Decision'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100/10">
                        {verificationRequests.map((k) => (
                          <tr key={k.id} className="hover:bg-slate-100/20">
                            <td className="py-2.5">
                              <span className="block text-slate-800 dark:text-slate-100">{k.name}</span>
                              <span className="text-[9px] text-[#6366f1]">{k.category} • {k.experienceYears} Years</span>
                            </td>
                            <td className="py-2.5 font-mono text-[10px] text-gray-500">
                              <a href="#" className="underline hover:text-sky-400">{k.idProofUrl || 'identity_passport.pdf'}</a>
                            </td>
                            <td className="py-2.5 text-center flex justify-center gap-1.5">
                              <button
                                disabled={processingId === k.id}
                                onClick={() => wrapAction(k.id, () => onUpdateKyc(k.id, k.userId, 'rejected'))}
                                className="px-2 py-0.5 border text-rose-500 border-rose-500/10 hover:bg-rose-500/5 rounded text-[9.5px] font-bold cursor-pointer"
                              >
                                {isRTL ? 'رفض' : 'Reject'}
                              </button>
                              <button
                                disabled={processingId === k.id}
                                onClick={() => wrapAction(k.id, () => onUpdateKyc(k.id, k.userId, 'approved'))}
                                className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 rounded text-[9.5px] font-black cursor-pointer"
                              >
                                {isRTL ? 'اعتماد الهوية ✓' : 'Approve Profile ✓'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: SECOPS ALARMS */}
            {controlTab === 'fraud' && (
              <div className="flex flex-col gap-3 text-right">
                {fraudAlerts.filter(a => a.status === 'active').length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <ShieldCheck className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                    <span className="text-xs font-bold block">{isRTL ? 'لم يتم العثور على أي نشاط مريب!' : 'No fraudulent alerts flagged.'}</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {fraudAlerts.filter(a => a.status === 'active').map((alertItem) => (
                      <div 
                        key={alertItem.id} 
                        className={`p-3.5 rounded-xl border flex justify-between items-center gap-3 ${
                          alertItem.severity === 'critical' ? 'bg-rose-50/20 border-rose-100 dark:border-rose-900/40' : 'bg-amber-50/20 border-amber-100 dark:border-amber-900/40'
                        }`}
                      >
                        <div className="text-right flex flex-col gap-0.5">
                          <span className="text-xs font-extrabold text-red-500 select-none uppercase">[{alertItem.severity}] {alertItem.name}</span>
                          <p className="text-[10px] text-gray-550 mt-1">{isRTL ? alertItem.descriptionAr : alertItem.descriptionFr}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            disabled={processingId === alertItem.id}
                            onClick={() => wrapAction(alertItem.id, () => onResolveFraudAlert(alertItem.id, 'dismissed'))}
                            className="px-2 py-1 text-[9px] font-black border text-gray-400 rounded cursor-pointer"
                          >
                            {isRTL ? 'استبعاد' : 'Dismiss'}
                          </button>
                          <button
                            disabled={processingId === alertItem.id}
                            onClick={() => wrapAction(alertItem.id, () => {
                              onFreezeUser(alertItem.userId, alertItem.id);
                              return Promise.resolve();
                            })}
                            className="px-2 py-1 text-[9px] font-black bg-rose-600 text-white rounded cursor-pointer"
                          >
                            {isRTL ? 'حظر فورا 🛑' : 'Block 🛑'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Live Event-Broadcaster + Static Telemetry Desk */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Quick Broadcaster panel */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div className="flex items-center gap-1.5 mb-2 flex-row-reverse justify-end">
                <Send className="w-3.5 h-3.5 text-sky-505" />
                <h4 className="text-[10.5px] font-black uppercase text-gray-400">
                  {isRTL ? 'قناة البث الفوري المباشر للرباط' : 'SaaS Event-Broadcaster'}
                </h4>
              </div>

              <p className="text-[10.5px] text-gray-400 leading-relaxed mb-4 text-right">
                {isRTL 
                  ? 'بث توجيه أو تحديث عاجل للشبكة. سيظهر النص في أعلى شاشة كافة الفاعلين المتصلين فوراً.' 
                  : 'Poussez un message instantané crypté sur l’interface de tous les utilisateurs en ligne.'}
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder={isRTL ? 'اكتب الإعلان هنا...' : 'Message flash...'}
                  className={`flex-1 text-[11px] px-3 py-2 border rounded-xl focus:outline-none font-semibold ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-gray-200'
                  }`}
                />
                <button
                  onClick={handleBroadcast}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white text-[11px] font-black px-4 rounded-xl cursor-pointer"
                >
                  {isRTL ? 'بث الإعلان' : 'Pousser'}
                </button>
              </div>
            </div>

            {/* Static telemetry log */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div className="flex items-center gap-1 my-1 border-b pb-1.5 border-gray-100/10 flex-row-reverse justify-end">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[9px] font-black uppercase text-gray-400">{isRTL ? 'النشاط العملياتي المباشر' : 'Live backoffice status'}</span>
              </div>
              <div className="max-h-[160px] overflow-y-auto text-right font-mono text-[9.5px] space-y-2 pr-1.5 mt-2">
                {systemLogs.slice(0, 5).map((log, idx) => (
                  <div key={idx} className="flex gap-1 flex-row-reverse border-b border-gray-100/10 pb-1 pb-1">
                    <span className="text-[8.5px] text-slate-400 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-xs text-slate-600 dark:text-slate-350">{log}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
