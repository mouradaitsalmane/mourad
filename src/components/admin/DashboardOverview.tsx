import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Wallet, 
  DollarSign, 
  Activity, 
  CheckCircle, 
  Send, 
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  X,
  FileCheck,
  ShieldCheck,
  TrendingUp,
  Inbox,
  Star,
  Layers,
  Bell,
  Sliders,
  Laptop,
  CheckCircle2,
  Database,
  Lock,
  MessageSquare,
  Globe,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  // Current dashboard view mode: 'visual' (exact mockup) vs 'cockpit' (interactive lists for payouts/arbitration)
  const [panelViewMode, setPanelViewMode] = useState<'visual' | 'cockpit'>('visual');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [controlTab, setControlTab] = useState<'payouts' | 'disputes' | 'kyc' | 'fraud'>('payouts');
  
  // High-fidelity details inspector (Level 3 Details state)
  const [activeInspectorItem, setActiveInspectorItem] = useState<{
    type: 'payout' | 'dispute' | 'kyc' | 'fraud';
    data: any;
  } | null>(null);

  // General asynchronous process indicator
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Chart interactivity states
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [hoveredDoughnutIndex, setHoveredDoughnutIndex] = useState<number | null>(null);

  // ================= DYNAMIC SYNCHRONIZATION WITH REAL FIRESTORE DATA =================
  // Users live stats
  const totalUsersInDatabase = users.length || 24;
  const activeProvidersCount = users.filter((u) => u.isTasker && !(u as any).isSuspended).length || 18;
  const customersCount = users.filter(u => !u.isTasker).length || 6;

  // Tasks live stats
  const totalTasksInDatabase = tasks.length || 15;
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const ongoingTasks = tasks.filter(t => t.status === 'open' || t.status === 'held');
  const pendingReviewTasks = tasks.filter(t => t.status === 'held');

  // Realistic revenue calculated dynamically from real completed tasks budgets, added to the mock base
  const totalCompletedValueReal = completedTasks.reduce((sum, t) => sum + (t.budget || 0), 0);
  const liveEscrowTotalValue = tasks.reduce((sum, t) => sum + (t.budget || 0), 0);
  
  // Stats counters combining mockup defaults and live Firebase records for an ultra-realistic, always-populated interface
  const totalEarningsVal = 245680 + totalCompletedValueReal;
  const totalOrdersCount = 1248 + tasks.length;
  const activeUsersCount = 842 + users.length;
  const completedTasksCount = 1102 + completedTasks.length;
  const ongoingTasksCount = 146 + ongoingTasks.length;
  const avgOrderValue = Math.round(totalEarningsVal / totalOrdersCount) || 205;


  // ----------------------------------------------------
  // Chart Data definitions
  // Line chart path points (Earnings vs Orders over dates)
  const chartPointsBase = [
    { label: '21 أبريل', earnings: 7000, orders: 12, dateFr: '21 Avr' },
    { label: '28 أبريل', earnings: 11000, orders: 18, dateFr: '28 Avr' },
    { label: '5 مايو', earnings: 9005, orders: 14, dateFr: '05 Mai' },
    { label: '12 مايو', earnings: 14200, orders: 25, dateFr: '12 Mai' },
    { label: '19 مايو', earnings: 11800, orders: 19, dateFr: '19 Mai' },
  ];

  // Doughnut statistics mapping
  const doughnutCategories = [
    { label: isRTL ? 'صيانة وسباكة' : 'Plomberie & Maison', percentage: 35, count: 436, color: 'bg-blue-500', strokeHex: '#3b82f6' },
    { label: isRTL ? 'تنظيف منزلي' : 'Ménage & Nettoyage', percentage: 25, count: 312, color: 'bg-emerald-500', strokeHex: '#10b981' },
    { label: isRTL ? 'نجارة وأثاث' : 'Menuiserie & Meubles', percentage: 15, count: 187, color: 'bg-amber-500', strokeHex: '#f59e0b' },
    { label: isRTL ? 'نقل وتوصيل' : 'Déménagement & Trans', percentage: 15, count: 187, color: 'bg-slate-400', strokeHex: '#94a3b8' },
    { label: isRTL ? 'حلول كهربائية' : 'Électricité & Panne', percentage: 10, count: 125, color: 'bg-indigo-500', strokeHex: '#6366f1' },
  ];

  // Real-time notification logger callback
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
      onAddLog(`Action processed successfully for ID: ${id}`);
      setActiveInspectorItem(null); // dismiss inspector
    } catch (err: any) {
      alert(`Action error: ${err.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="flex flex-col gap-6 font-sans">
      
      {/* ================= HEADER BRAND GREETINGS ROW ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150/50 pb-4 dark:border-slate-800">
        <div className="text-right">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{isRTL ? 'مرحباً بك، أحمد' : 'Bonjour, Ahmed'}</span>
            <span className="animate-pulse">👋</span>
          </h2>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            {isRTL ? 'إليك نظرة عامة شاملة على منصة Admin Tasker المغربية' : 'Voici un aperçu général complet de la plateforme Admin Tasker'}
          </p>
        </div>

        {/* Dynamic Dual Tab Switch representing modern visual control */}
        <div className="flex rounded-xl p-1 bg-slate-200/60 dark:bg-slate-900 border dark:border-slate-800">
          <button
            onClick={() => setPanelViewMode('visual')}
            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              panelViewMode === 'visual'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isRTL ? 'مؤشرات الأداء المصورة 📊' : 'Tableau Analytique 📊'}</span>
          </button>
          
          <button
            onClick={() => setPanelViewMode('cockpit')}
            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              panelViewMode === 'cockpit'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isRTL ? 'منطقة القرار والتحكم العاجل ⚡' : 'SecOps & Décisions ⚡'}</span>
          </button>
        </div>
      </div>

      {panelViewMode === 'visual' ? (
        <>
          {/* ================== VISUAL VIEW: EXACT PICTURE COMPLIANT ================== */}
          
          {/* 1. TOP 6 METRICS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            
            {/* KPI 1: Earning Ledger */}
            <div className={`p-4.5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-slate-900/55 border-slate-850' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10.5px] font-extrabold tracking-tight text-gray-400">
                  {isRTL ? 'إجمالي الإيرادات' : 'Total des Revenus'}
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[19px] font-black text-slate-900 dark:text-slate-100 font-mono">
                  {totalEarningsVal.toLocaleString()} <span className="text-xs font-bold text-slate-500">د.م.</span>
                </div>
                <span className="text-[9px] text-emerald-500 font-extrabold">
                  +15.3% {isRTL ? 'من الشهر الماضي' : 'vs mois dernier'}
                </span>
              </div>
            </div>

            {/* KPI 2: Total Orders */}
            <div className={`p-4.5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-slate-900/55 border-slate-850' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10.5px] font-extrabold tracking-tight text-gray-400">
                  {isRTL ? 'إجمالي الطلبات' : 'Total des Demandes'}
                </span>
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-450">
                  <Briefcase className="w-4 h-4" />
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[19px] font-black text-slate-900 dark:text-slate-100 font-mono">
                  {totalOrdersCount.toLocaleString()}
                </div>
                <span className="text-[9px] text-blue-500 font-extrabold">
                  +12.7% {isRTL ? 'من الشهر الماضي' : 'vs mois dernier'}
                </span>
              </div>
            </div>

            {/* KPI 3: Active Users */}
            <div className={`p-4.5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-slate-900/55 border-slate-850' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10.5px] font-extrabold tracking-tight text-gray-400">
                  {isRTL ? 'المستخدمون النشطون' : 'Utilisateurs Actifs'}
                </span>
                <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-450">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[19px] font-black text-slate-900 dark:text-slate-100 font-mono">
                  {activeUsersCount.toLocaleString()}
                </div>
                <span className="text-[9px] text-purple-500 font-extrabold">
                  +8.4% {isRTL ? 'من الشهر الماضي' : 'vs mois dernier'}
                </span>
              </div>
            </div>

            {/* KPI 4: Completed Tasks */}
            <div className={`p-4.5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-slate-900/55 border-slate-850' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10.5px] font-extrabold tracking-tight text-gray-400">
                  {isRTL ? 'المهام المكتملة' : 'Missions Clôturées'}
                </span>
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-450">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[19px] font-black text-slate-900 dark:text-slate-100 font-mono">
                  {completedTasksCount.toLocaleString()}
                </div>
                <span className="text-[9px] text-emerald-500 font-extrabold">
                  +10.1% {isRTL ? 'من الشهر الماضي' : 'vs mois dernier'}
                </span>
              </div>
            </div>

            {/* KPI 5: Ongoing Tasks */}
            <div className={`p-4.5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-slate-900/55 border-slate-850' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10.5px] font-extrabold tracking-tight text-gray-400">
                  {isRTL ? 'المهام قيد التنفيذ' : 'Missions en cours'}
                </span>
                <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[19px] font-black text-slate-900 dark:text-slate-100 font-mono">
                  {ongoingTasksCount.toLocaleString()}
                </div>
                <span className="text-[9px] text-rose-500 font-extrabold">
                  -3.2% {isRTL ? 'من الشهر الماضي' : 'vs mois dernier'}
                </span>
              </div>
            </div>

            {/* KPI 6: Average Order Value */}
            <div className={`p-4.5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-slate-900/55 border-slate-850' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10.5px] font-extrabold tracking-tight text-gray-400">
                  {isRTL ? 'متوسط قيمة الطلب' : 'Panier Moyen'}
                </span>
                <span className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-450">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[19px] font-black text-slate-900 dark:text-slate-100 font-mono">
                  {avgOrderValue.toLocaleString()} <span className="text-xs font-bold text-slate-500">د.م.</span>
                </div>
                <span className="text-[9px] text-emerald-500 font-extrabold">
                  +6.5% {isRTL ? 'من الشهر الماضي' : 'vs mois dernier'}
                </span>
              </div>
            </div>

          </div>

          {/* ================= 2. MID GRID LAYOUT (3 PLATES) ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* COLUMN 1 (4-Span): Recent Tasks */}
            <div className={`lg:col-span-4 p-5 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#111827]/50 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200">
                    {isRTL ? 'الطلبات الأخيرة' : 'Demandes Récentes'}
                  </h3>
                  <button className="text-xs font-bold text-blue-650 hover:underline cursor-pointer">
                    {isRTL ? 'عرض الكل' : 'Voir tout'}
                  </button>
                </div>

                {/* 5 Rows corresponding to the image with realistic prices */}
                <div className="flex flex-col gap-3.5">
                  {[
                    { title: isRTL ? 'إصلاح تسريب مياه الحمام وتحت الحوض' : 'Réparation fuite d\'eau de bain', cat: isRTL ? 'أعمال السباكة' : 'Plomberie', price: '350 د.م.', status: isRTL ? 'مكتملة' : 'Clôturée', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30', time: isRTL ? 'منذ 10 دقائق' : 'il y a 10m', avatar: 'https://images.unsplash.com/photo-1542013936693-8848e5742383?w=80&fit=crop&q=80' },
                    { title: isRTL ? 'تنظيف شامل لشقة في حي أكدال بالرباط' : 'Nettoyage complet appartement Agdal', cat: isRTL ? 'تنظيف منزلي' : 'Ménage', price: '450 د.م.', status: isRTL ? 'قيد التنفيذ' : 'En cours', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30', time: isRTL ? 'منذ 25 دقيقة' : 'il y a 25m', avatar: 'https://images.unsplash.com/photo-1581578731548-c64695cc6954?w=80&fit=crop&q=80' },
                    { title: isRTL ? 'تركيب مصابيح وثريات لصالون مغربي كبير' : 'Installation luminaires salon marocain', cat: isRTL ? 'حلول كهربائية' : 'Électricité', price: '600 د.م.', status: isRTL ? 'مكتملة' : 'Clôturée', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30', time: isRTL ? 'منذ ساعة' : 'il y a 1h', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&q=80' },
                    { title: isRTL ? 'نقل أثاث غرفة النوم من حي الرياض إلى السويسي' : 'Déménagement meubles Ryad vers Souissi', cat: isRTL ? 'نقل وتوصيل' : 'Déménagement', price: '1,200 د.م.', status: isRTL ? 'انتظار المراجعة' : 'En attente', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30', time: isRTL ? 'منذ ساعتين' : 'il y a 2h', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&q=80' },
                    { title: isRTL ? 'تجميع وتركيب خزانة ملابس ايكيا' : 'Montage d\'armoire dressing IKEA', cat: isRTL ? 'نجارة وأثاث' : 'Menuiserie', price: '250 د.م.', status: isRTL ? 'قيد التنفيذ' : 'En cours', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30', time: isRTL ? 'منذ 3 ساعات' : 'il y a 3h', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&fit=crop&q=80' },
                  ].map((row, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-center gap-3">
                        <img 
                          referrerPolicy="no-referrer"
                          src={row.avatar} 
                          alt="avatar" 
                          className="w-8 h-8 rounded-full object-cover border border-slate-100" 
                        />
                        <div className="flex flex-col text-right">
                          <span className="font-extrabold text-slate-850 dark:text-slate-100 line-clamp-1">{row.title}</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">{row.cat}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">{row.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] text-gray-400 font-semibold">{row.time}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${row.color}`}>
                            {row.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 2 (4-Span): Real Interactive Area Performance Chart */}
            <div className={`lg:col-span-4 p-5 rounded-2xl border flex flex-col justify-between relative overflow-hidden ${
              isDarkMode ? 'bg-[#111827]/50 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200">
                    {isRTL ? 'نظرة عامة على الأداء' : 'Graphique de Performance'}
                  </h3>
                  
                  <div className="flex gap-1">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded-lg border dark:border-slate-700 cursor-pointer text-slate-600 dark:text-slate-300">
                      {isRTL ? 'آخر 30 يوم' : '30 Derniers Jours'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-4 text-[10px] font-bold mb-3">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />{isRTL ? 'الإيرادات' : 'Revenus'}</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />{isRTL ? 'الطلبات' : 'Demandes'}</span>
                </div>

                {/* SVG Area Chart Container */}
                <div className="relative h-44 w-full mt-4 select-none">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradient-earnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"></stop>
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"></stop>
                      </linearGradient>
                      <linearGradient id="gradient-orders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"></stop>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"></stop>
                      </linearGradient>
                    </defs>

                    {/* Horizontal gridlines */}
                    <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" className="dark:stroke-slate-800"></line>
                    <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" className="dark:stroke-slate-800"></line>
                    <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" className="dark:stroke-slate-800"></line>

                    {/* Double Filled Area paths */}
                    {/* Earning Fill */}
                    <path d="M 0 160 L 125 100 L 250 120 L 375 60 L 500 80 L 500 200 L 0 200 Z" fill="url(#gradient-earnings)"></path>
                    {/* Orders Fill */}
                    <path d="M 0 180 L 125 150 L 250 140 L 375 100 L 500 130 L 500 200 L 0 200 Z" fill="url(#gradient-orders)"></path>

                    {/* Double Stroke Line paths */}
                    <path d="M 0 160 L 125 100 L 250 120 L 375 60 L 500 80" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M 0 180 L 125 150 L 250 140 L 375 100 L 500 130" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></path>

                    {/* Dynamic dots indicating interactive hover states */}
                    {[
                      { x: 0, y: 160, val: '7,000 د.م.', ords: '12 طلب' },
                      { x: 125, y: 100, val: '11,000 د.م.', ords: '18 طلب' },
                      { x: 250, y: 120, val: '9,005 د.م.', ords: '14 طلب' },
                      { x: 375, y: 60, val: '14,200 د.م.', ords: '25 طلب' },
                      { x: 500, y: 80, val: '11,800 د.م.', ords: '19 طلب' },
                    ].map((point, pIdx) => (
                      <g 
                        key={pIdx} 
                        className="cursor-pointer group"
                        onMouseEnter={() => setHoveredPointIndex(pIdx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      >
                        <circle cx={point.x} cy={point.y} r="5" fill="#10b981" className="transition-all duration-155 group-hover:r-7"></circle>
                        <circle cx={point.x} cy={point.y === 160 ? 180 : point.y === 100 ? 150 : point.y === 120 ? 140 : point.y === 60 ? 100 : 130} r="5" fill="#3b82f6" className="transition-all duration-155 group-hover:r-7"></circle>
                      </g>
                    ))}
                  </svg>
                  
                  {/* Interactive Floating Tooltip on Hover */}
                  {hoveredPointIndex !== null && (
                    <div 
                      className="absolute p-2.5 rounded-xl border bg-white/95 dark:bg-slate-900/95 shadow-xl text-[10.5px] font-extrabold flex flex-col gap-1 z-30"
                      style={{
                        left: `${(hoveredPointIndex * 24) + 4}%`,
                        top: '10px'
                      }}
                    >
                      <span className="text-gray-400 font-black">{isRTL ? chartPointsBase[hoveredPointIndex].label : chartPointsBase[hoveredPointIndex].dateFr}</span>
                      <span className="text-emerald-500 font-extrabold">💰 {chartPointsBase[hoveredPointIndex].earnings.toLocaleString()} د.م.</span>
                      <span className="text-blue-500 font-extrabold">📋 {chartPointsBase[hoveredPointIndex].orders} {isRTL ? 'طلب' : 'commandes'}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-[9px] font-bold text-gray-400 px-1 mt-2.5">
                  {chartPointsBase.map((tick, tIdx) => (
                    <span key={tIdx}>{isRTL ? tick.label : tick.dateFr}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 3 (4-Span): Categories Doughnut Radial Distribution */}
            <div className={`lg:col-span-4 p-5 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#111827]/50 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200">
                    {isRTL ? 'توزيع المهام حسب الفئة' : 'Répartition des Tâches'}
                  </h3>
                  
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-[10.5px] font-bold rounded-lg text-blue-600">
                    {isRTL ? 'هذا الشهر' : 'Ce mois'}
                  </span>
                </div>

                {/* Main chart representation with circular layout */}
                <div className="grid grid-cols-12 gap-2 items-center min-h-[170px]">
                  
                  {/* Circle Graphic with inner sum labels */}
                  <div className="col-span-6 relative flex justify-center items-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="48" fill="transparent" stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} strokeWidth="10"></circle>
                      
                      {/* Segment 1: Design 40% (Starts at 0, length 40%) */}
                      <circle cx="64" cy="64" r="48" fill="transparent" stroke="#3b82f6" strokeWidth="12" 
                        strokeDasharray={`${2 * Math.PI * 48 * 0.4} ${2 * Math.PI * 48}`} 
                        strokeDashoffset="0"
                        onMouseEnter={() => setHoveredDoughnutIndex(0)}
                        onMouseLeave={() => setHoveredDoughnutIndex(null)}
                        className="transition-all duration-300 cursor-pointer hover:stroke-width-15"
                      ></circle>
                      
                      {/* Segment 2: Code 25% */}
                      <circle cx="64" cy="64" r="48" fill="transparent" stroke="#10b981" strokeWidth="12" 
                        strokeDasharray={`${2 * Math.PI * 48 * 0.25} ${2 * Math.PI * 48}`} 
                        strokeDashoffset={`-${2 * Math.PI * 48 * 0.4}`}
                        onMouseEnter={() => setHoveredDoughnutIndex(1)}
                        onMouseLeave={() => setHoveredDoughnutIndex(null)}
                        className="transition-all duration-300 cursor-pointer hover:stroke-width-15"
                      ></circle>

                      {/* Segment 3: Writing 15% */}
                      <circle cx="64" cy="64" r="48" fill="transparent" stroke="#f59e0b" strokeWidth="12" 
                        strokeDasharray={`${2 * Math.PI * 48 * 0.15} ${2 * Math.PI * 48}`} 
                        strokeDashoffset={`-${2 * Math.PI * 48 * 0.65}`}
                        onMouseEnter={() => setHoveredDoughnutIndex(2)}
                        onMouseLeave={() => setHoveredDoughnutIndex(null)}
                        className="transition-all duration-300 cursor-pointer hover:stroke-width-15"
                      ></circle>

                      {/* Segment 4: Data Entry 10% */}
                      <circle cx="64" cy="64" r="48" fill="transparent" stroke="#94a3b8" strokeWidth="12" 
                        strokeDasharray={`${2 * Math.PI * 48 * 0.1} ${2 * Math.PI * 48}`} 
                        strokeDashoffset={`-${2 * Math.PI * 48 * 0.8}`}
                        onMouseEnter={() => setHoveredDoughnutIndex(3)}
                        onMouseLeave={() => setHoveredDoughnutIndex(null)}
                        className="transition-all duration-300 cursor-pointer hover:stroke-width-15"
                      ></circle>

                      {/* Segment 5: Marketing 10% */}
                      <circle cx="64" cy="64" r="48" fill="transparent" stroke="#6366f1" strokeWidth="12" 
                        strokeDasharray={`${2 * Math.PI * 48 * 0.1} ${2 * Math.PI * 48}`} 
                        strokeDashoffset={`-${2 * Math.PI * 48 * 0.9}`}
                        onMouseEnter={() => setHoveredDoughnutIndex(4)}
                        onMouseLeave={() => setHoveredDoughnutIndex(null)}
                        className="transition-all duration-300 cursor-pointer hover:stroke-width-15"
                      ></circle>
                    </svg>

                    {/* Central Absolute quantity */}
                    <div className="absolute text-center flex flex-col items-center">
                      <span className="text-[17px] font-black font-mono text-slate-800 dark:text-white">
                        {hoveredDoughnutIndex !== null ? doughnutCategories[hoveredDoughnutIndex].count : totalOrdersCount.toLocaleString()}
                      </span>
                      <span className="text-[9.5px] text-gray-400 font-extrabold max-w-[80px] leading-tight">
                        {hoveredDoughnutIndex !== null ? doughnutCategories[hoveredDoughnutIndex].label : (isRTL ? 'إجمالي المهام' : 'Total Tâches')}
                      </span>
                    </div>
                  </div>

                  {/* Legends List on right with correct values */}
                  <div className="col-span-6 flex flex-col gap-2 font-semibold">
                    {doughnutCategories.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between text-[11px] p-1 rounded-lg transition-all ${
                          hoveredDoughnutIndex === idx ? 'bg-slate-100 dark:bg-slate-800 scale-102' : ''
                        }`}
                        onMouseEnter={() => setHoveredDoughnutIndex(idx)}
                        onMouseLeave={() => setHoveredDoughnutIndex(null)}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                          <span className="text-gray-400 dark:text-gray-300 truncate">{item.label}</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-100 font-mono shrink-0">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* ================= 3. NEXT-TIER GRID LAYOUT (3 CUSTOM CARDS) ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* COLUMN 1 (5-Span): Best Performing Freelancers */}
            <div className={`lg:col-span-5 p-5 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#111827]/50 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200">
                    {isRTL ? 'أفضل المستقلين' : 'Meilleurs Prestataires'}
                  </h3>
                  
                  <button className="text-xs font-bold text-blue-650 hover:underline cursor-pointer">
                    {isRTL ? 'عرض الكل' : 'Voir tout'}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 pb-1.5 text-[10px] font-black uppercase">
                        <th className="pb-2 text-right">#</th>
                        <th className="pb-2 text-right">{isRTL ? 'المستقل' : 'Prestataire'}</th>
                        <th className="pb-2 text-center">{isRTL ? 'التقييم' : 'Note'}</th>
                        <th className="pb-2 text-center">{isRTL ? 'المهام' : 'Tâches'}</th>
                        <th className="pb-2 text-left">{isRTL ? 'الإيرادات' : 'Revenu'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50 dark:divide-slate-800/55">
                      {[
                        { name: 'سارة العتيبي', rate: '4.9', tasks: '128', rev: '25,680 د.م.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop&q=80' },
                        { name: 'محمد الكناني', rate: '4.9', tasks: '96', rev: '18,450 د.م.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&fit=crop&q=80' },
                        { name: 'فاطمة الزهراء', rate: '4.9', tasks: '88', rev: '16,200 د.م.', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&fit=crop&q=80' },
                        { name: 'يوسف بلقيه', rate: '4.8', tasks: '76', rev: '12,850 د.م.', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&fit=crop&q=80' },
                        { name: 'منال الإدريسي', rate: '4.8', tasks: '65', rev: '10,320 د.م.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&fit=crop&q=80' },
                      ].map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="py-2.5 font-bold text-gray-400">{idx + 1}</td>
                          <td className="py-2.5 font-extrabold text-slate-850 dark:text-slate-100">
                            <div className="flex items-center gap-2">
                              <img 
                                referrerPolicy="no-referrer"
                                src={p.avatar} 
                                alt={p.name} 
                                className="w-6 h-6 rounded-full object-cover" 
                              />
                              <span className="line-clamp-1">{p.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-center font-bold">
                            <span className="inline-flex items-center gap-1 text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                              <span>{p.rate}</span>
                            </span>
                          </td>
                          <td className="py-2.5 text-center font-bold text-slate-650 dark:text-gray-300 font-mono">{p.tasks}</td>
                          <td className="py-2.5 text-left font-black text-emerald-600 dark:text-emerald-450 font-mono">{p.rev}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* COLUMN 2 (4-Span): Orders by Status horizontal metrics */}
            <div className={`lg:col-span-4 p-5 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#111827]/50 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200">
                    {isRTL ? 'الطلبات حسب الحالة' : 'Demandes par Statut'}
                  </h3>
                  
                  <button className="text-xs font-bold text-blue-650 hover:underline cursor-pointer">
                    {isRTL ? 'عرض الكل' : 'Voir tout'}
                  </button>
                </div>

                <div className="flex flex-col gap-4 py-2 font-semibold">
                  {[
                    { label: isRTL ? 'مكتملة' : 'Clôturées', value: 602, percent: '48.2%', colorBg: 'bg-emerald-500', colorTrack: 'bg-emerald-100 dark:bg-emerald-950/30' },
                    { label: isRTL ? 'قيد التنفيذ' : 'En Cours', value: 312, percent: '25.0%', colorBg: 'bg-amber-500', colorTrack: 'bg-amber-100 dark:bg-amber-950/30' },
                    { label: isRTL ? 'انتظار المراجعة' : 'En Attente', value: 156, percent: '12.5%', colorBg: 'bg-blue-500', colorTrack: 'bg-blue-100 dark:bg-blue-950/30' },
                    { label: isRTL ? 'ملغاة' : 'Annulées', value: 98, percent: '7.8%', colorBg: 'bg-rose-500', colorTrack: 'bg-rose-100 dark:bg-rose-950/30' },
                    { label: isRTL ? 'مسودة' : 'Brouillons', value: 80, percent: '6.4%', colorBg: 'bg-slate-400', colorTrack: 'bg-slate-100 dark:bg-slate-800' },
                  ].map((statusRow, sIdx) => (
                    <div key={sIdx} className="flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{statusRow.label}</span>
                        <span className="text-gray-400 font-mono">
                          {statusRow.value} <span className="text-[10px]">({statusRow.percent})</span>
                        </span>
                      </div>
                      
                      {/* Horizontal custom line-track progress representation */}
                      <div className={`w-full h-2 rounded-full ${statusRow.colorTrack} overflow-hidden`}>
                        <div 
                          className={`h-full rounded-full ${statusRow.colorBg} transition-all duration-700`}
                          style={{ width: statusRow.percent }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 3 (3-Span): General users brief ledger with statistics */}
            <div className={`lg:col-span-3 p-5 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#111827]/50 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200">
                    {isRTL ? 'نظرة عامة على المستخدمين' : 'Aperçu Utilisateurs'}
                  </h3>
                  
                  <button className="text-xs font-bold text-blue-650 hover:underline cursor-pointer">
                    {isRTL ? 'عرض الكل' : 'Voir tout'}
                  </button>
                </div>

                <div className="flex flex-col gap-3 py-1 font-semibold">
                  {[
                    { label: isRTL ? 'إجمالي المستخدمين' : 'Total Comptes', value: '2,456', icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30' },
                    { label: isRTL ? 'المستخدمون النشطون' : 'Actifs à Rabat', value: '842', icon: Activity, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
                    { label: isRTL ? 'المستقلون المعتمدون' : 'Artisans KYC', value: '1,856', icon: FileCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
                    { label: isRTL ? 'العملاء المستهلكين' : 'Particuliers Clients', value: '600', icon: Wallet, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
                  ].map((usrCard, uIdx) => {
                    const CardIcon = usrCard.icon;
                    return (
                      <div key={uIdx} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-slate-800/50 bg-slate-500/5">
                        <div className="flex items-center gap-2.5 text-xs">
                          <span className={`p-1.5 rounded-lg ${usrCard.color}`}>
                            <CardIcon className="w-4 h-4 shrink-0" />
                          </span>
                          <span className="text-gray-400 dark:text-slate-300 font-bold">{usrCard.label}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{usrCard.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* ================= 4. BOTTOM-TIER GRID LAYOUT (4 DETAILED MODULES) ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            
            {/* PLATFORM GENERAL REVENUE SPECS */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#111827]/50 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div>
                <div className="border-b pb-2 mb-3 dark:border-slate-800">
                  <h4 className="text-[12.5px] font-black text-slate-900 dark:text-slate-100">{isRTL ? 'إحصائيات المنصة' : 'Statistiques Financières'}</h4>
                </div>
                <div className="flex flex-col gap-3 text-xs font-semibold">
                  <div className="flex justify-between items-center p-1.5 rounded border border-gray-100 dark:border-slate-800/80">
                    <span className="text-gray-400">{isRTL ? 'إجمالي المدفوعات' : 'Flux Payzone'}</span>
                    <span className="font-extrabold text-[#10b981] font-mono">196,540 د.م. <span className="text-[9.5px] bg-emerald-50 dark:bg-emerald-950 font-black px-1 rounded ml-1 text-emerald-600">+8.7%</span></span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 rounded border border-gray-100 dark:border-slate-800/80">
                    <span className="text-gray-400">{isRTL ? 'العمولات المحصلة' : 'Commissions Net'}</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-450 font-mono">24,568 د.م. <span className="text-[9.5px] bg-blue-50 dark:bg-blue-950 font-black px-1 rounded ml-1 text-blue-600">+12.5%</span></span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 rounded border border-gray-100 dark:border-slate-800/80">
                    <span className="text-gray-400">{isRTL ? 'المبالغ المسترجعة' : 'Remboursements CNC'}</span>
                    <span className="font-extrabold text-rose-500 font-mono">3,250 د.م. <span className="text-[9.5px] bg-rose-50 dark:bg-rose-950 font-black px-1 rounded ml-1 text-rose-600">-5.3%</span></span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 rounded border border-gray-100 dark:border-slate-800/80">
                    <span className="text-gray-400">{isRTL ? 'المبالغ المعلقة' : 'Séquestres Bloqués'}</span>
                    <span className="font-extrabold text-amber-500 font-mono">15,240 د.م. <span className="text-[9.5px] bg-amber-50 dark:bg-amber-950 font-black px-1 rounded ml-1 text-amber-600">-2.1%</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK LINKS ACTION GRID */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#111827]/50 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div>
                <div className="border-b pb-2 mb-3 dark:border-slate-800 flex justify-between items-center">
                  <h4 className="text-[12.5px] font-black text-slate-900 dark:text-slate-100">{isRTL ? 'روابط سريعة' : 'Administration Directe'}</h4>
                  <button className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">{isRTL ? 'عرض الكل' : 'Voir'}</button>
                </div>
                
                {/* 6 Large responsive colored navigation action cards */}
                <div className="grid grid-cols-2 gap-2 text-[10.5px] font-black">
                  {[
                    { label: isRTL ? 'إدارة المستخدمين' : 'Comptes', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700', icon: Users },
                    { label: isRTL ? 'إدارة المهام' : 'Missions', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700', icon: Sliders },
                    { label: isRTL ? 'التقارير' : 'Bilans BI', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700', icon: Layers },
                    { label: isRTL ? 'الإعدادات' : 'Réglages', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700', icon: Lock },
                    { label: isRTL ? 'الدعم الفني' : 'Arbitrage SLA', color: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700', icon: MessageSquare },
                    { label: isRTL ? 'الإشعارات' : 'Push mobile', color: 'bg-rose-50 hover:bg-rose-100 text-rose-700', icon: Bell },
                  ].map((actCard, aIdx) => {
                    const ActIcon = actCard.icon;
                    return (
                      <button 
                        key={aIdx}
                        onClick={() => {
                          onAddLog(`Super Admin shortcut click on item: "${actCard.label}"`);
                          alert(isRTL ? `جاري نقل كامل الصلاحيات لقسم: ${actCard.label}` : `Navigation forcée vers le module ${actCard.label}`);
                        }}
                        className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border border-transparent hover:border-slate-200 active:scale-98 ${actCard.color}`}
                      >
                        <ActIcon className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">{actCard.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AFFILIATE SYSTEM DETAIL OVERVIEW */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#111827]/50 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div>
                <div className="border-b pb-2 mb-3 dark:border-slate-800 flex justify-between items-center">
                  <h4 className="text-[12.5px] font-black text-slate-900 dark:text-slate-100">{isRTL ? 'نظام الأفلييت' : 'Affiliés Influence'}</h4>
                  <button className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">{isRTL ? 'عرض الكل' : 'Voir'}</button>
                </div>
                
                <div className="flex flex-col gap-3 text-xs font-semibold">
                  <div className="flex justify-between items-center p-1 px-1.5 rounded bg-slate-50 border border-slate-100 dark:bg-slate-900/60 dark:border-slate-800">
                    <span className="text-gray-400">{isRTL ? 'إجمالي المسوقين' : 'Porte-paroles'}</span>
                    <span className="font-extrabold text-slate-800 dark:text-white font-mono">156 <span className="text-[9.5px] text-emerald-500 ml-1">+8.3%</span></span>
                  </div>
                  <div className="flex justify-between items-center p-1 px-1.5 rounded bg-slate-50 border border-slate-100 dark:bg-slate-900/60 dark:border-slate-800">
                    <span className="text-gray-400">{isRTL ? 'إجمالي العمولات' : 'Commissions affl'}</span>
                    <span className="font-extrabold text-emerald-600 font-mono">8,450 د.م. <span className="text-[9.5px] text-emerald-500 ml-1">+12.7%</span></span>
                  </div>
                  <div className="flex justify-between items-center p-1 px-1.5 rounded bg-slate-50 border border-slate-100 dark:bg-slate-900/60 dark:border-slate-800">
                    <span className="text-gray-400">{isRTL ? 'الزيارات' : 'Vues d’entonnoirs'}</span>
                    <span className="font-extrabold text-slate-800 dark:text-white font-mono">4,256 <span className="text-[9.5px] text-emerald-500 ml-1">+15.4%</span></span>
                  </div>
                  <div className="flex justify-between items-center p-1 px-1.5 rounded bg-slate-50 border border-slate-100 dark:bg-slate-900/60 dark:border-slate-800">
                    <span className="text-gray-400">{isRTL ? 'التحويلات' : 'Conversions Clic'}</span>
                    <span className="font-extrabold text-slate-800 dark:text-white font-mono">342 <span className="text-[9.5px] text-emerald-500 ml-1">+10.1%</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* SAAS CLOUD SERVICES HEALTH STATUS CHECKS */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#111827]/50 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div>
                <div className="border-b pb-2 mb-3 dark:border-slate-800">
                  <h4 className="text-[12.5px] font-black text-slate-900 dark:text-slate-100">{isRTL ? 'حالة الخدمات والمزامنة' : 'Statut Global Cloud'}</h4>
                </div>
                
                <div className="flex flex-col gap-2.5 text-[11px] font-black">
                  {[
                    { service: isRTL ? 'الموقع الإلكتروني' : 'Site Web Principal', status: isRTL ? 'يعمل بشكل طبيعي' : 'Opérationnel' },
                    { service: 'Firebase Authentication', status: isRTL ? 'يعمل بشكل طبيعي' : 'Opérationnel' },
                    { service: 'Cloud Firestore Database', status: isRTL ? 'يعمل بشكل طبيعي' : 'Opérationnel' },
                    { service: 'Cloud Storage Assets', status: isRTL ? 'يعمل بشكل طبيعي' : 'Opérationnel' },
                    { service: 'Cloud Functions Hooks', status: isRTL ? 'يعمل بشكل طبيعي' : 'Opérationnel' },
                  ].map((svcCheck, sIdx) => (
                    <div key={sIdx} className="flex justify-between items-center p-1 border-b border-gray-100/50 dark:border-slate-800 text-right">
                      <span className="text-slate-750 dark:text-slate-300">{svcCheck.service}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-emerald-600 font-bold">{svcCheck.status}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </>
      ) : (
        <>
          {/* ================== COCKPIT VIEW: FULLY INTERACTIVE TRANSACTION & ADMIN DECISIONS QUEUE ================== */}
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Level 2 Sub-grid: Console with dynamic Tabs */}
            <div className={`lg:col-span-8 p-6 rounded-2xl border flex flex-col gap-5 ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              
              {/* Header row with unified styling */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100/10 dark:border-slate-800 pb-4">
                <div className="flex flex-col text-right w-full sm:w-auto">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-600">
                    {isRTL ? 'غرفة القرارات الإدارية والتسويات' : 'Bureau des Décisions & Retraits'}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1 select-none leading-normal">
                    {isRTL 
                      ? 'حدد صفاً من الطابور المعلق أدناه لتفعيل الفحص الإداري الشامل، تسييل الحوالات البنكية، فض النزاعات، أو توقيف الحسابات.' 
                      : 'Sélectionnez un dossier dans la file d’attente ci-dessous pour lancer l’inspecteur de sécurité.'}
                  </p>
                </div>
                
                {/* Control tab options */}
                <div className="flex gap-1.5 flex-wrap w-full sm:w-auto">
                  {[
                    { id: 'payouts', ar: 'الحوالات 💳', fr: 'Payouts' },
                    { id: 'disputes', ar: 'النزاعات ⚖️', fr: 'Disputes' },
                    { id: 'kyc', ar: 'الوثائق والاعتماد 📁', fr: 'KYC Queue' },
                    { id: 'fraud', ar: 'إنذارات Fraud 🚨', fr: 'Fraud SecOps' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setControlTab(tab.id as any);
                        setActiveInspectorItem(null); // clear detail view to avoid mismatch
                      }}
                      className={`px-3 py-1.5 text-[10.5px] font-extrabold rounded-lg cursor-pointer transition-all ${
                        controlTab === tab.id 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {isRTL ? tab.ar : tab.fr}
                    </button>
                  ))}
                </div>
              </div>

              {/* TAB DATA LAYER */}
              <div className="min-h-[220px]">
                
                {/* TAB: PAYOUTS */}
                {controlTab === 'payouts' && (
                  <div className="flex flex-col gap-2">
                    {payoutRequests.filter(p => p.status === 'pending').length === 0 ? (
                      <div className="text-center py-10 text-slate-400 select-none">
                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-bounce" />
                        <span className="text-xs font-bold">{isRTL ? 'جميع مستحقات الحرفيين البنكية تمت تسويتها بنجاح!' : 'All artisan payouts settled!'}</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="border-b border-gray-100/15 text-slate-400 dark:border-slate-800">
                              <th className="pb-2 text-right">{isRTL ? 'المستفيد' : 'Worker'}</th>
                              <th className="pb-2 text-right">{isRTL ? 'السيولة والمبلغ' : 'Amount'}</th>
                              <th className="pb-2 text-right">{isRTL ? 'حالة الطلب' : 'Status'}</th>
                              <th className="pb-2 text-center">{isRTL ? 'الإجراء الإداري' : 'Quick View'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-150/40 dark:divide-slate-800">
                            {payoutRequests.filter(p => p.status === 'pending').map((p) => (
                              <tr 
                                key={p.id} 
                                onClick={() => setActiveInspectorItem({ type: 'payout', data: p })}
                                className={`hover:bg-slate-100/40 dark:hover:bg-slate-850/30 cursor-pointer transition-colors ${
                                  activeInspectorItem?.data?.id === p.id ? (isDarkMode ? 'bg-slate-800/40' : 'bg-slate-100/60') : ''
                                }`}
                              >
                                <td className="py-2.5 font-bold">
                                  <span>{p.workerName}</span>
                                  <span className="text-[9.5px] block text-gray-400 font-normal">{p.bank}</span>
                                </td>
                                <td className="py-2.5 text-emerald-600 font-extrabold font-mono">{p.amount} MAD</td>
                                <td className="py-2.5">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-500/10">
                                    {isRTL ? 'معلق بالسير' : 'Pending Escrow'}
                                  </span>
                                </td>
                                <td className="py-2.5 text-center">
                                  <button 
                                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:text-blue-600 transition-all text-[10px] font-black rounded-lg cursor-pointer"
                                  >
                                    {isRTL ? 'فحص التفاصيل' : 'Audit'}
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

                {/* TAB: DISPUTES */}
                {controlTab === 'disputes' && (
                  <div className="flex flex-col gap-2">
                    {disputes.filter(d => d.status !== 'resolved').length === 0 ? (
                      <div className="text-center py-10 text-slate-400 select-none">
                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <span className="text-xs font-bold">{isRTL ? 'لا توجد نزاعات معلقة حالياً ✓' : 'All trade disputes settled ✓'}</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="border-b border-gray-100/15 text-slate-400 dark:border-slate-800">
                              <th className="pb-2 text-right">{isRTL ? 'موضوع النزاع والمعاملة' : 'Case title'}</th>
                              <th className="pb-2 text-right">{isRTL ? 'إجمالي الودائع' : 'Fund budget'}</th>
                              <th className="pb-2 text-right">{isRTL ? 'حالة الضمان' : 'Status'}</th>
                              <th className="pb-2 text-center">{isRTL ? 'التدخل وبث القرار' : 'Arbitrate'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-150/40 dark:divide-slate-800">
                            {disputes.filter(d => d.status !== 'resolved').map((d) => (
                              <tr 
                                key={d.id} 
                                onClick={() => setActiveInspectorItem({ type: 'dispute', data: d })}
                                className={`hover:bg-slate-100/40 dark:hover:bg-slate-850/30 cursor-pointer transition-colors ${
                                  activeInspectorItem?.data?.id === d.id ? (isDarkMode ? 'bg-slate-800/40' : 'bg-slate-100/60') : ''
                                }`}
                              >
                                <td className="py-2.5">
                                  <span className="font-extrabold text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">{d.title}</span>
                                  <span className="text-[9px] text-[#6366f1] font-mono">{d.id} • {d.category}</span>
                                </td>
                                <td className="py-2.5 font-bold font-mono text-indigo-505 dark:text-indigo-400">{d.amount} MAD</td>
                                <td className="py-2.5">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-405 border border-amber-500/10">
                                    {isRTL ? 'نزاع معلق ' : 'In Arbitration'}
                                  </span>
                                </td>
                                <td className="py-2.5 text-center">
                                  <button 
                                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:text-blue-600 transition-all text-[10px] font-black rounded-lg cursor-pointer"
                                  >
                                    {isRTL ? 'فصل النزاع' : 'Settle'}
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

                {/* TAB: KYC VERIFICATION QUEUE */}
                {controlTab === 'kyc' && (
                  <div className="flex flex-col gap-2">
                    {verificationRequests.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 select-none">
                        <FileCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-pulse" />
                        <span className="text-xs font-bold">{isRTL ? 'طابور فحص الوثائق الثبوتية فارغ تماما!' : 'Verification desk is all clean!'}</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="border-b border-gray-100/15 text-slate-400 dark:border-slate-800">
                              <th className="pb-2 text-right">{isRTL ? 'العضو المشرّع' : 'Artisan'}</th>
                              <th className="pb-2 text-right">{isRTL ? 'عدد سنوات الخبرة' : 'Expertise'}</th>
                              <th className="pb-2 text-right">{isRTL ? 'الحالة الحالية' : 'Verification Status'}</th>
                              <th className="pb-2 text-center">{isRTL ? 'مطابقة الوثائق' : 'Decide'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-150/40 dark:divide-slate-800">
                            {verificationRequests.map((k) => (
                              <tr 
                                key={k.id} 
                                onClick={() => setActiveInspectorItem({ type: 'kyc', data: k })}
                                className={`hover:bg-slate-100/40 dark:hover:bg-slate-850/30 cursor-pointer transition-colors ${
                                  activeInspectorItem?.data?.id === k.id ? (isDarkMode ? 'bg-slate-800/40' : 'bg-slate-100/60') : ''
                                }`}
                              >
                                <td className="py-2.5">
                                  <span className="font-extrabold text-slate-850 dark:text-slate-100 block">{k.name}</span>
                                  <span className="text-[9.5px] text-blue-500 block">{k.category}</span>
                                </td>
                                <td className="py-2.5 font-mono text-slate-600 dark:text-gray-300 font-bold">{k.experienceYears} {isRTL ? 'سنة خبرة' : 'Years exp'}</td>
                                <td className="py-2.5">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-sky-950/25 dark:text-sky-400 border border-blue-500/10">
                                    {isRTL ? 'يحتاج موافقة' : 'Submitted'}
                                  </span>
                                </td>
                                <td className="py-2.5 text-center">
                                  <button 
                                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:text-blue-600 transition-all text-[10px] font-black rounded-lg cursor-pointer"
                                  >
                                    {isRTL ? 'اعتماد' : 'Review'}
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

                {/* TAB: SECOPS ALARMS / FRAUD */}
                {controlTab === 'fraud' && (
                  <div className="flex flex-col gap-2">
                    {fraudAlerts.filter(a => a.status === 'active').length === 0 ? (
                      <div className="text-center py-10 text-slate-400 select-none">
                        <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <span className="text-xs font-bold">{isRTL ? 'سجل السلوك الجنائي فارغ وخالٍ من المريبين!' : 'No security fraud alerts.'}</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="border-b border-gray-100/15 text-slate-400 dark:border-slate-800">
                              <th className="pb-2 text-right">{isRTL ? 'منشئ الإنذار' : 'Suspect profile'}</th>
                              <th className="pb-2 text-right">{isRTL ? 'المستوى وخطورة' : 'Severity'}</th>
                              <th className="pb-2 text-right">{isRTL ? 'الحالة الحالية' : 'Signal Code'}</th>
                              <th className="pb-2 text-center">{isRTL ? 'تجميد فوري' : 'Action'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-150/40 dark:divide-slate-800">
                            {fraudAlerts.filter(a => a.status === 'active').map((alertItem) => (
                              <tr 
                                key={alertItem.id} 
                                onClick={() => setActiveInspectorItem({ type: 'fraud', data: alertItem })}
                                className={`hover:bg-slate-100/40 dark:hover:bg-slate-850/30 cursor-pointer transition-colors ${
                                  activeInspectorItem?.data?.id === alertItem.id ? (isDarkMode ? 'bg-slate-800/40' : 'bg-slate-100/60') : ''
                                }`}
                              >
                                <td className="py-2.5 font-bold">
                                  <span className="text-red-500">⚠ {alertItem.name}</span>
                                  <span className="text-[9px] text-[#6366f1] font-mono block">{alertItem.time}</span>
                                </td>
                                <td className="py-2.5">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                    alertItem.severity === 'critical' 
                                      ? 'bg-rose-50 text-rose-705 border border-rose-450/20' 
                                      : 'bg-amber-50 text-amber-705 border border-amber-450/20'
                                  }`}>
                                    {alertItem.severity}
                                  </span>
                                </td>
                                <td className="py-2.5 font-mono text-[9.5px] text-gray-500 uppercase">{alertItem.category}</td>
                                <td className="py-2.5 text-center">
                                  <button 
                                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-rose-550 hover:text-rose-600 transition-all text-[10px] font-extrabold rounded-lg cursor-pointer animate-pulse"
                                  >
                                    {isRTL ? 'توقيف' : 'Suspend'}
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

              </div>

            </div>

            {/* Right Column: Event-Broadcaster Tool and Live Telemetry Stream */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              
              {/* Broadcaster panel */}
              <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
                isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <div className="flex items-center gap-1.5 border-b pb-2 border-gray-100/10 dark:border-slate-800">
                  <Send className="w-4 h-4 text-sky-505" />
                  <h4 className="text-[10.5px] font-black uppercase text-slate-400 select-none tracking-widest">
                    {isRTL ? 'بث الإعلانات الفورية لكافة الهواتف' : 'SaaS Event Broadcaster Panel'}
                  </h4>
                </div>

                <p className="text-[10.5px] text-gray-400 leading-relaxed font-semibold">
                  {isRTL 
                    ? 'إرسال تحديث عاجل فوراً لجميع المستخدمين والشركاء المتصلين الآن. سيظهر كشريط علوي.' 
                    : 'Poussez un message instantané d’alerte crypté à tous les smartphones connectés.'}
                </p>

                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder={isRTL ? 'تحية عاجلة من الرقابة...' : 'Alerte maintenance...'}
                    className={`text-[11.5px] px-3 py-2 border rounded-xl focus:outline-none font-bold ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-gray-200'
                    }`}
                  />
                  <button
                    onClick={handleBroadcast}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black py-2 rounded-xl cursor-pointer transition-all uppercase tracking-wide"
                  >
                    {isRTL ? 'بث التنبيه الفوري' : 'Emit Event broadcast'}
                  </button>
                </div>
              </div>

              {/* Core System Live Stream Logs */}
              <div className={`p-5 rounded-2xl border flex flex-col gap-3 ${
                isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <div className="flex items-center gap-2 border-b pb-2 border-gray-100/10 dark:border-slate-800">
                  <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase text-slate-400 select-none tracking-widest">{isRTL ? 'سجلات السحابة الفورية' : 'Live Gateway Heartbeat Stream'}</span>
                </div>
                <div className="max-h-[140px] overflow-y-auto space-y-2.5 pr-1 font-mono text-[10px]">
                  {systemLogs.slice(0, 4).map((log, idx) => (
                    <div key={idx} className="flex gap-2 pb-2 border-b border-slate-100/5 select-none leading-relaxed text-right flex-row-reverse justify-end items-start font-semibold">
                      <span className="text-[8px] text-slate-400 shrink-0 bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded font-bold">
                        {new Date().toLocaleTimeString()}
                      </span>
                      <span className="text-slate-600 dark:text-slate-350 text-right leading-tight break-all font-semibold">{log}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </>
      )}

      {/* ================= LEVEL 3: DETAILED SIDE INSPECTOR / OVERLAY CONTAINER ================= */}
      <AnimatePresence>
        {activeInspectorItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-end bg-slate-950/70 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ opacity: 0, x: isRTL ? -120 : 120, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isRTL ? -120 : 120, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`h-full max-h-[90vh] w-full max-w-md rounded-3xl border shadow-2xl p-6 flex flex-col gap-6 justify-between text-right overflow-y-auto ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-gray-150 text-slate-800'
              }`}
            >
              
              {/* Drawer Top Header Area */}
              <div>
                <div className="flex justify-between items-center border-b pb-3.5 dark:border-slate-800">
                  <button 
                    onClick={() => setActiveInspectorItem(null)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-gray-200 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all"
                  >
                    ✕ {isRTL ? 'إغلاق' : 'Fermer'}
                  </button>
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-450 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    {activeInspectorItem.type} Audit Desk
                  </span>
                </div>

                {/* INSPECTOR DETAILS BY ACTIVE MODULE TYPE */}
                <div className="mt-5 space-y-4">
                  
                  {/* DETAIL VIEW: PAYOUT WIRES */}
                  {activeInspectorItem.type === 'payout' && (
                    <div className="space-y-4 font-sans font-semibold">
                      <div className="text-right">
                        <span className="block text-[9.5px] text-gray-400 uppercase font-black">{isRTL ? 'مصلحة المستلم' : 'Receiver Beneficiary'}</span>
                        <span className="text-slate-905 dark:text-white font-extrabold text-sm">{activeInspectorItem.data.workerName}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 bg-slate-500/5 p-3 rounded-2xl">
                        <div className="text-right">
                          <span className="block text-[9px] text-gray-400">{isRTL ? 'المبلغ المستحق' : 'Withdrawal amount'}</span>
                          <span className="text-emerald-500 font-extrabold font-mono text-sm">{activeInspectorItem.data.amount} MAD</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] text-gray-400">{isRTL ? 'الحساب البنكي' : 'RIB Account'}</span>
                          <span className="text-slate-700 dark:text-slate-250 font-mono text-[10px] break-all">{activeInspectorItem.data.account}</span>
                        </div>
                      </div>
                      <div className="bg-slate-500/5 p-3.5 rounded-2xl border border-slate-100/5 text-[11px] leading-relaxed text-right">
                        <span className="block text-[10px] text-gray-400 mb-1 font-bold">{isRTL ? 'الجهة البنكية والوجهة' : 'RIB bank detail'}</span>
                        <span>Bank Name: <span className="text-blue-500">{activeInspectorItem.data.bank}</span></span>
                        <p className="text-[10.5px] text-gray-400 mt-1 leading-normal">
                          {isRTL 
                            ? 'طلب حقيقي مرسل بالرمز التلقائي من حساب الحرفي بعد الإنجاز وعمولة ١٥٪ مقتطعة آلياً.' 
                            : 'Wire payment request dispatched from the worker wallet and queued after commission splits.'}
                        </p>
                      </div>

                      {/* Action System with Action Hierarchy */}
                      <div className="pt-4 border-t dark:border-slate-800 flex flex-col gap-2.5">
                        <span className="text-[9px] text-blue-500 font-black uppercase tracking-wider">{isRTL ? 'إجراءات السداد الآمنة' : 'Enforce decision'}</span>
                        
                        {/* Primary Action Button (Blue color) */}
                        <button
                          disabled={processingId === activeInspectorItem.data.id}
                          onClick={() => wrapAction(activeInspectorItem.data.id, () => onApprovePayout(activeInspectorItem.data.id, activeInspectorItem.data.workerName, activeInspectorItem.data.amount))}
                          className="w-full py-2.5 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg flex items-center justify-center gap-1 transition-all"
                        >
                          <Check className="w-4 h-4 shrink-0" />
                          <span>{isRTL ? 'تسييل وصرف الحوالة للبنك ✓' : 'Approve Wire Transfer ✓'}</span>
                        </button>
                        
                        {/* Secondary Action */}
                        <button
                          disabled={processingId === activeInspectorItem.data.id}
                          onClick={() => wrapAction(activeInspectorItem.data.id, () => onHoldPayout(activeInspectorItem.data.id, activeInspectorItem.data.workerName))}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-1 transition-all"
                        >
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>{isRTL ? 'تجميد إداري مؤقت للحوالة' : 'Release On-Hold'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DETAIL VIEW: ARBITRATION DISPUTES */}
                  {activeInspectorItem.type === 'dispute' && (
                    <div className="space-y-4 font-sans font-semibold">
                      <div className="text-right">
                        <span className="block text-[9.5px] text-gray-400 uppercase font-black">{isRTL ? 'تذكرة القضية والنزاع' : 'Dispute Incident title'}</span>
                        <span className="text-slate-905 dark:text-white font-extrabold text-sm leading-normal block">{activeInspectorItem.data.title}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 bg-rose-50/10 dark:bg-rose-950/15 p-3 rounded-2xl border border-rose-500/10 text-right">
                        <div>
                          <span className="block text-[9px] text-gray-400">{isRTL ? 'الحجم المالي المعلق' : 'Escrow budget'}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-extrabold font-mono text-sm">{activeInspectorItem.data.amount} MAD</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-gray-400">{isRTL ? 'فئة النزاع' : 'Category'}</span>
                          <span className="text-slate-700 dark:text-slate-250 block text-xs truncate font-black">{activeInspectorItem.data.category}</span>
                        </div>
                      </div>
                      
                      <div className="bg-slate-500/5 p-3 rounded-2xl leading-relaxed text-[11px] space-y-1 text-right">
                        <span className="block text-[9.5px] font-black text-slate-400">{isRTL ? 'الأطراف المتنازعة بالرباط' : 'Litigated Parties'}</span>
                        <div>👤 {isRTL ? 'العميل المستورد:' : 'Client:'} <span className="font-bold text-slate-900 dark:text-white">{activeInspectorItem.data.client}</span></div>
                        <div>🔧 {isRTL ? 'الشريك الحرفي المقترح:' : 'Artisan:'} <span className="font-bold text-slate-900 dark:text-white">{activeInspectorItem.data.worker}</span></div>
                      </div>

                      {/* Action System */}
                      <div className="pt-4 border-t dark:border-slate-800 flex flex-col gap-2">
                        <span className="text-[9.5px] text-blue-500 font-black uppercase tracking-wider">{isRTL ? 'أوامر فض النزاع الفيدرالية' : 'Arbitrate case'}</span>
                        
                        <button
                          disabled={processingId === activeInspectorItem.data.id}
                          onClick={() => wrapAction(activeInspectorItem.data.id, () => onResolveDispute(activeInspectorItem.data.id, 'release_to_tasker'))}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg flex items-center justify-center gap-1 transition-all"
                        >
                          <Check className="w-4 h-4 shrink-0" />
                          <span>{isRTL ? 'تحرير وصرف المكاسب للحرفي ✓' : 'Release funds to worker ✓'}</span>
                        </button>
                        
                        <button
                          disabled={processingId === activeInspectorItem.data.id}
                          onClick={() => wrapAction(activeInspectorItem.data.id, () => onResolveDispute(activeInspectorItem.data.id, 'refund_client'))}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md flex items-center justify-center gap-1 transition-all"
                        >
                          <X className="w-4 h-4 shrink-0" />
                          <span>{isRTL ? 'إقرار إرجاع المبلغ للعميل 🛑' : 'Enforce full Client refund 🛑'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DETAIL VIEW: KYC VERIFICATION PORTAL */}
                  {activeInspectorItem.type === 'kyc' && (
                    <div className="space-y-4 font-sans font-semibold text-right">
                      <div>
                        <span className="block text-[9.5px] text-gray-400 uppercase font-black">{isRTL ? 'عضوية مرشحة للتحقق' : 'Candidate identity'}</span>
                        <span className="text-slate-905 dark:text-white font-extrabold text-sm">{activeInspectorItem.data.name}</span>
                      </div>
                      <div className="bg-slate-500/5 p-3.5 rounded-2xl space-y-2 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[9.5px]">{isRTL ? 'رابط ملف الأوراق الثبوتية' : 'Passport/ID verification asset'}</span>
                          <a href="#" className="text-blue-500 font-mono underline block mt-0.5" onClick={(e) => e.preventDefault()}>
                            📎 {activeInspectorItem.data.idProofUrl || 'document_moroccan_cin.pdf'}
                          </a>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/10 flex-row-reverse">
                          <span>{isRTL ? 'التدبيج الأمني الجنائي:' : 'Police background check:'}</span>
                          <span className="bg-emerald-55 text-emerald-800 text-[10px] font-black rounded px-1.5 py-0.5 border border-emerald-500/10 uppercase">Passed</span>
                        </div>
                      </div>

                      {/* Action System */}
                      <div className="pt-4 border-t dark:border-slate-800 flex flex-col gap-2">
                        <span className="text-[9.5px] text-blue-500 font-black uppercase tracking-wider">{isRTL ? 'قرار هيئة مطابقة البيانات' : 'Register Decision'}</span>
                        
                        <button
                          disabled={processingId === activeInspectorItem.data.id}
                          onClick={() => wrapAction(activeInspectorItem.data.id, () => onUpdateKyc(activeInspectorItem.data.id, activeInspectorItem.data.userId, 'approved'))}
                          className="w-full py-2.5 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg flex items-center justify-center gap-1 transition-all"
                        >
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          <span>{isRTL ? 'موافق واعتماد الحرفي المالي ✓' : 'Approve profile ✓'}</span>
                        </button>
                        
                        <button
                          disabled={processingId === activeInspectorItem.data.id}
                          onClick={() => wrapAction(activeInspectorItem.data.id, () => onUpdateKyc(activeInspectorItem.data.id, activeInspectorItem.data.userId, 'rejected'))}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-1 transition-all"
                        >
                          <X className="w-4 h-4 shrink-0" />
                          <span>{isRTL ? 'رفض وثائق الاعتماد للأخطاء 🛑' : 'Decline and reject files 🛑'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DETAIL VIEW: FRAUD SECURE OPERATIONS */}
                  {activeInspectorItem.type === 'fraud' && (
                    <div className="space-y-4 font-sans font-semibold text-right">
                      <div>
                        <span className="block text-[9.5px] text-red-500 uppercase font-black">⚠ {isRTL ? 'سلوك مالي مشبوه وغسيل أموال' : 'SaaS suspicious alarm'}</span>
                        <span className="text-red-500 font-extrabold text-sm">{activeInspectorItem.data.name}</span>
                      </div>
                      <div className="bg-rose-950/15 border border-rose-500/15 p-3 rounded-2xl text-[11px] leading-relaxed text-right">
                        <span className="font-extrabold text-[#6366f1] block mb-1">Signal context description:</span>
                        {isRTL ? activeInspectorItem.data.descriptionAr : activeInspectorItem.data.descriptionFr}
                      </div>

                      {/* Action System */}
                      <div className="pt-4 border-t dark:border-slate-800 flex flex-col gap-2">
                        <span className="text-[9.5px] text-blue-500 font-black uppercase tracking-wider">{isRTL ? 'أوامر حظر SecOps الفورية' : 'Incident response action'}</span>
                        
                        <button
                          disabled={processingId === activeInspectorItem.data.id}
                          onClick={() => wrapAction(activeInspectorItem.data.id, () => {
                            onFreezeUser(activeInspectorItem.data.userId, activeInspectorItem.data.id);
                            return Promise.resolve();
                          })}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md flex items-center justify-center gap-1 transition-all"
                        >
                          <X className="w-4 h-4 shrink-0" />
                          <span>{isRTL ? 'تسجيل المخالفة وحظر العضو فوراً 🛑' : 'Enforce Immediate profile block 🛑'}</span>
                        </button>
                        
                        <button
                          disabled={processingId === activeInspectorItem.data.id}
                          onClick={() => wrapAction(activeInspectorItem.data.id, () => onResolveFraudAlert(activeInspectorItem.data.id, 'dismissed'))}
                          className="w-full py-2 bg-slate-100 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black cursor-pointer hover:bg-slate-200 flex items-center justify-center gap-1 transition-all"
                        >
                          <Check className="w-4 h-4 shrink-0" />
                          <span>{isRTL ? 'استبعاد وحفظ كإنذار خاطئ' : 'Dismiss warning as safe'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Drawer Bottom Close Section */}
              <div className="border-t dark:border-slate-800 pt-3.5 flex justify-end text-[10px] text-gray-500 font-mono">
                <span>Rabat Backoffice Escrow Security Protocol</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
