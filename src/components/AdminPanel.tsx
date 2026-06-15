import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { Task, UserProfile } from '../types';
import { LanguageKey } from '../data/rabatData';

// Subcomponents modular imports
import DashboardOverview from './admin/DashboardOverview';
import UsersModule from './admin/UsersModule';
import OrdersModule from './admin/OrdersModule';
import FinanceModule from './admin/FinanceModule';
import MarketingServices from './admin/MarketingServices';
import SupportReviews from './admin/SupportReviews';
import AIControlSecurity from './admin/AIControlSecurity';

// Lucide Icons
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Wallet, 
  Sliders, 
  MapPin, 
  Ticket, 
  Megaphone, 
  Star, 
  Percent, 
  Cpu, 
  TrendingUp, 
  Lock, 
  Settings, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  X, 
  FileText,
  Languages,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  lang: LanguageKey;
  tasks: Task[];
}

export default function AdminPanel({ lang, tasks }: AdminPanelProps) {
  const [adminLang, setAdminLang] = useState<LanguageKey>(lang);
  const isRTL = adminLang === 'ar';

  // State to toggle notification panel in header
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Core configuration states
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const tabLabelsAr: Record<string, string> = {
    dashboard: 'لوحة القيادة والموجز',
    users: 'إدارة شؤون الأعضاء',
    orders: 'متابعة الصفقات والمهام',
    finance: 'معاملات Payzone والمحاسبة',
    services: 'إعدادات الخدمات والعمولة',
    disputes: 'فض النزاعات والأحكام',
    support: 'دعم وشكاوى المشتركين',
    analytics: 'التقارير المالية والذكاء البيئي',
    settings: 'الإعدادات العامة للرباط',
    security: 'إدارة الأمان والتحكم بالـ RBAC'
  };
  
  // 10 Tabs Modular Admin Selector
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'orders' | 'finance' | 'services' | 
    'disputes' | 'support' | 'analytics' | 'settings' | 'security'
  >('dashboard');

  const [toggleUserSubtype, setToggleUserSubtype] = useState<'customers' | 'providers'>('customers');

  // Firestore synchronization
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Custom Toasts state list
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);
  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Button disabling / loading state
  const [processingUsers, setProcessingUsers] = useState<Record<string, boolean>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [selectedUserForFiles, setSelectedUserForFiles] = useState<UserProfile | null>(null);

  // System Logs local activities tracker
  const [systemLogs, setSystemLogs] = useState<string[]>([
    'Platform Administrator logged in successfully',
    'Real-time Firestore listeners synchronization ready',
    'Payzone Maroc secure gateway heartbeat check: STABLE'
  ]);

  // Payout withdrawal requests
  const [payoutRequests, setPayoutRequests] = useState([
    { id: 'PAY-88', workerName: 'Hassan Belkhayat', amount: 1540, bank: 'Attijariwafa Bank', account: '007120002144...', date: '2026-06-14', status: 'pending' },
    { id: 'PAY-89', workerName: 'Amina El Fassi', amount: 650, bank: 'CIH Bank', account: '011150005481...', date: '2026-06-15', status: 'pending' },
    { id: 'PAY-90', workerName: 'Bilal Sajid', amount: 2100, bank: 'BMCE Bank', account: '002140003215...', date: '2026-06-13', status: 'approved' }
  ]);

  // Disputes system
  const [disputes, setDisputes] = useState([
    { id: 'DSP-01', ticketId: 'TKT-701', title: 'Payment dispute over bathroom tile alignment', category: 'Plumbing', status: 'pending', amount: 450, client: 'Samir Rabat', worker: 'Hassan Belkhayat' },
    { id: 'DSP-02', ticketId: 'TKT-703', title: 'Tasker absent on garden pruning mission', category: 'Support', status: 'pending', amount: 600, client: 'Lalla Latifa', worker: 'Yassine M. El Mansouri' }
  ]);

  // AI-powered fraud alerts local simulation database
  const [fraudAlerts, setFraudAlerts] = useState([
    { id: 'al-1', userId: 'usr_bilal', name: 'Bilal Jardinier', category: 'money_laundering', severity: 'critical', descriptionAr: 'تم استشعار ميزانية مريبة تبلغ ١٢,٠٠٠ درهم لقص العشب في أكدال.', descriptionFr: 'Budget suspect de 12 000 MAD détecté pour une simple tonte de pelouse.', status: 'active', time: '12m ago' },
    { id: 'al-2', userId: 'usr_hassan', name: 'Hassan Belkhayat', category: 'sybil_attack', severity: 'medium', descriptionAr: 'تسجيل دخول متعدد بنفس كود متصفح الإنترنت من حي حسان.', descriptionFr: 'Fingeprinting de navigateur identique sur plusieurs comptes à Hassan.', status: 'active', time: '41m ago' }
  ]);

  // Provider KYC verification requests local mock synced
  const [verificationRequests, setVerificationRequests] = useState([
    { id: 'vr1', userId: 'user_yassine', name: 'Yassine M. El Mansouri', category: 'Plumbing & Repairs', skills: ['Pipe repair', 'Leak detection'], idProofUrl: 'ID_Verified_Morocco.pdf', policeCheck: 'passed' as const, proInsurance: true, experienceYears: 6 }
  ]);

  // Notifications bell counters
  const [notifications, setNotifications] = useState([
    { id: 'n1', titleAr: 'طلب سحب رصيد بقيمة ١,٥٤٠ درهم في الانتظار', titleFr: 'Demande de retrait de 1 540 MAD en attente', read: false },
    { id: 'n2', titleAr: 'تم تسجيل حساب حرفي جديد للتدقيق', titleFr: 'Nouvel artisan inscrit à valider', read: false }
  ]);

  // Real-time Firestore synchronizer
  useEffect(() => {
    const unsubUsers = onSnapshot(
      query(collection(db, 'users'), where('isDeleted', '!=', true)),
      (snap) => {
        const uList: UserProfile[] = [];
        snap.forEach((doc) => {
          uList.push({ uid: doc.id, ...doc.data() } as any);
        });
        setUsers(uList);
        setLoadingUsers(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'users');
        setLoadingUsers(false);
      }
    );

    const unsubFiles = onSnapshot(
      collection(db, 'files'),
      (snap) => {
        const fList: any[] = [];
        snap.forEach((doc) => {
          fList.push({ id: doc.id, ...doc.data() });
        });
        setAllFiles(fList);
        setLoadingFiles(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'files');
        setLoadingFiles(false);
      }
    );

    return () => {
      unsubUsers();
      unsubFiles();
    };
  }, []);

  // Admin writes/mutations proxy (BLOCK USER)
  const handleToggleBlockUser = async (userId: string, isCurrentlySuspended: boolean) => {
    const adminId = auth.currentUser?.uid || 'sDCii92rV7fKTvvDgWTQCLKxwJr1';
    
    if (userId === adminId) {
      showToast(isRTL ? 'خطأ: لا يمكنك حظر حسابك الإداري الخاص.' : 'Error: You cannot block your own admin account.', 'error');
      return;
    }

    setProcessingUsers(prev => ({ ...prev, [userId]: true }));
    const endpoint = isCurrentlySuspended ? '/api/admin/unblock-user' : '/api/admin/block-user';
    const actionLabel = isCurrentlySuspended ? 'unblock' : 'block';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, adminId }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || `Failed to ${actionLabel} user.`);
      }

      showToast(
        isRTL 
          ? `تمت العملية بنجاح! تم ${isCurrentlySuspended ? 'تنشيط' : 'حظر'} العضو.` 
          : `Success! User has been ${isCurrentlySuspended ? 'unblocked' : 'blocked'}.`, 
        'success'
      );
      setSystemLogs(prev => [`User [${userId}] ${isCurrentlySuspended ? 'Unblocked' : 'Blocked'} successfully by admin [${adminId}]`, ...prev]);
    } catch (err: any) {
      console.error(err);
      showToast(
        isRTL 
          ? `فشلت العملية: ${err.message || 'خطأ في خادم الغلاف'}` 
          : `Action failed: ${err.message || 'Server error'}`, 
        'error'
      );
    } finally {
      setProcessingUsers(prev => ({ ...prev, [userId]: false }));
    }
  };

  // SOFT DELETE USER
  const handleDeleteUser = async (userId: string) => {
    const adminId = auth.currentUser?.uid || 'sDCii92rV7fKTvvDgWTQCLKxwJr1';
    
    if (userId === adminId) {
      showToast(isRTL ? 'خطأ: لا يمكنك حذف حسابك الإداري الخاص.' : 'Error: You cannot delete your own admin account.', 'error');
      return;
    }

    setProcessingUsers(prev => ({ ...prev, [userId]: true }));

    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, adminId }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to delete user.');
      }

      showToast(
        isRTL 
          ? 'تم حذف العضو ناعماً بنجاح من قائمة العرض!' 
          : 'User has been successfully deleted (soft delete).', 
        'success'
      );
      setSystemLogs(prev => [`User [${userId}] soft deleted from front-office by admin [${adminId}]`, ...prev]);
    } catch (err: any) {
      console.error(err);
      showToast(
        isRTL 
          ? `فشلت عملية الحذف: ${err.message || 'خطأ في الخادم'}` 
          : `Delete action failed: ${err.message || 'Server error'}`, 
        'error'
      );
    } finally {
      setProcessingUsers(prev => ({ ...prev, [userId]: false }));
    }
  };

  // OVERRIDE TASK STATUS (Cloud Functions API)
  const handleOverrideStatus = async (taskId: string, newStatus: Task['status']) => {
    const adminId = auth.currentUser?.uid || 'sDCii92rV7fKTvvDgWTQCLKxwJr1';
    try {
      const response = await fetch('/api/admin/override-task-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, adminId, newStatus })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to override task status');
      }
      showToast(isRTL ? `تم تعديل حالة المهمة إلى ${newStatus} بنجاح!` : `Task status overriden to ${newStatus} successfully!`, 'success');
      setSystemLogs(prev => [`Forced Status Override on Tâche ${taskId} -> ${newStatus.toUpperCase()} by admin [${adminId}]`, ...prev]);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // KYC UPDATES
  const handleUpdateKyc = async (requestId: string, userId: string, status: 'approved' | 'rejected') => {
    const adminId = auth.currentUser?.uid || 'sDCii92rV7fKTvvDgWTQCLKxwJr1';
    try {
      const response = await fetch('/api/admin/update-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, targetUserId: userId, adminId, status })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to update KYC');
      }
      setVerificationRequests(prev => prev.filter(r => r.id !== requestId));
      showToast(isRTL ? 'تم تحديث حالة التحقق من الهوية بنجاح!' : 'KYC verified successfully!', 'success');
      setSystemLogs(prev => [`KYC request ${requestId} ${status} for user ${userId} by admin [${adminId}]`, ...prev]);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // FINTECH WIRE APPROVALS
  const handleApprovePayout = async (payoutId: string, name: string, amount: number) => {
    const adminId = auth.currentUser?.uid || 'sDCii92rV7fKTvvDgWTQCLKxwJr1';
    try {
      const response = await fetch('/api/admin/approve-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, adminId, amount, workerName: name })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to approve payout');
      }
      setPayoutRequests(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'approved' } : p));
      showToast(isRTL ? `تم تسييل الحوالة وصرف ${amount} درهم لـ ${name}!` : `Payout authorized dynamically! Released ${amount} MAD.`, 'success');
      setSystemLogs(prev => [`Payout [${payoutId}] of ${amount} MAD to ${name} approved by admin [${adminId}]`, ...prev]);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleHoldPayout = async (payoutId: string, name: string) => {
    const adminId = auth.currentUser?.uid || 'sDCii92rV7fKTvvDgWTQCLKxwJr1';
    try {
      const response = await fetch('/api/admin/hold-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, adminId, workerName: name })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to hold payout');
      }
      setPayoutRequests(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'held' } : p));
      showToast(isRTL ? 'تم وضع الحوالة تحت المراجعة الإدارية.' : 'Payout held successfully.', 'success');
      setSystemLogs(prev => [`Payout [${payoutId}] for ${name} held by admin [${adminId}]`, ...prev]);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // DISPUTES ACTIONS
  const handleResolveDispute = async (ticketId: string, decision: string) => {
    const adminId = auth.currentUser?.uid || 'sDCii92rV7fKTvvDgWTQCLKxwJr1';
    try {
      const response = await fetch('/api/admin/resolve-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, adminId, decision })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to resolve dispute');
      }
      setDisputes(prev => prev.map(d => d.id === ticketId || d.ticketId === ticketId ? { ...d, status: 'resolved', decision } : d));
      showToast(isRTL ? 'تم فصل النزاع وإطلاق الأمر المالي لمستحقيه!' : `Dispute resolved with decision: ${decision}`, 'success');
      setSystemLogs(prev => [`Dispute [${ticketId}] resolved with [${decision}] by admin [${adminId}]`, ...prev]);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // FRAUD ALERTS RESOLUTIONS
  const handleResolveFraudAlert = async (alertId: string, decision: 'dismissed' | 'suppressed') => {
    const adminId = auth.currentUser?.uid || 'sDCii92rV7fKTvvDgWTQCLKxwJr1';
    try {
      const response = await fetch('/api/admin/resolve-fraud-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, adminId, decision })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to update fraud alert state');
      }
      setFraudAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved', decision } : a));
      showToast(isRTL ? 'تم استبعاد وتصفية الإشعار الأمني بنجاح.' : 'Fraud alert dismissed successfully.', 'success');
      setSystemLogs(prev => [`Fraud alert [${alertId}] marked as resolved by admin [${adminId}]`, ...prev]);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDismissAlert = (id: string) => {
    handleResolveFraudAlert(id, 'dismissed');
  };

  const handleFreezeUserLocally = (userId: string, alertId: string) => {
    setFraudAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'frozen' } : a));
    handleToggleBlockUser(userId, false);
  };

  const wrapAction = async (id: string, action: () => Promise<void>) => {
    setProcessingId(id);
    try {
      await action();
    } catch (err: any) {
      showToast(err.message || String(err), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Helper mock to map user private records safely (fallback email matching)
  const userEmailsMock: Record<string, string> = {};
  users.forEach((u) => {
    userEmailsMock[u.uid] = `${u.displayName ? u.displayName.toLowerCase().replace(/\s+/g, '') : 'user'}@airtasker.ma`;
  });

  // Sidebar grouping schema
  const sidebarGroups = [
    {
      titleAr: 'العمليات والتحكم',
      titleFr: 'Cœur de Plateforme',
      items: [
        { id: 'dashboard' as const, ar: 'الموجز ولوحة القيادة', fr: 'Dashboard', icon: LayoutDashboard },
        { id: 'users' as const, ar: 'إدارة شؤون الأعضاء', fr: 'Users Directory', icon: Users },
        { id: 'orders' as const, ar: 'متابعة الصفقات والمهام', fr: 'Orders Ledger', icon: Briefcase }
      ]
    },
    {
      titleAr: 'المنظومة المالية والترخيص',
      titleFr: 'Desk Financier',
      items: [
        { id: 'finance' as const, ar: 'معاملات Payzone والمحاسبة', fr: 'SaaS Finance', icon: Wallet },
        { id: 'services' as const, ar: 'فئات ونسب وموديلات خدمات', fr: 'Services Catalog', icon: Sliders }
      ]
    },
    {
      titleAr: 'الضمان وحسن التشغيل',
      titleFr: 'Assistance & Arbitration',
      items: [
        { id: 'disputes' as const, ar: 'فض نزاعات الضمان المالي', fr: 'Disputes Arbitration', icon: Megaphone },
        { id: 'support' as const, ar: 'بطاقات دعم العملاء SLAs', fr: 'Ticket Support SLA', icon: Ticket }
      ]
    },
    {
      titleAr: 'الأمان والإعدادات التراكمية',
      titleFr: 'Intelligence & Config',
      items: [
        { id: 'analytics' as const, ar: 'إحصائيات المبيعات والنمو BI', fr: 'SaaS Analytics', icon: TrendingUp },
        { id: 'settings' as const, ar: 'الإعدادات العامة للرباط', fr: 'Platform Settings', icon: Settings },
        { id: 'security' as const, ar: 'صلاحيات المشرفين الـ RBAC', fr: 'SecOps Config', icon: Lock }
      ]
    }
  ];

  return (
    <div className={`min-h-screen flex transition-all duration-300 font-sans ${
      isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* SIDEBAR NAVIGATION MODULE */}
      <aside className={`border-r flex flex-col shrink-0 transition-all duration-300 ${
        isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-gray-200'
      } ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        
        {/* Header/Brand Section */}
        <div className="p-5 border-b dark:border-slate-800 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex flex-col text-right">
              <span className="text-xs font-black tracking-widest text-[#6366f1] select-none">
                RABAT TASKS SAAS
              </span>
              <span className="text-[10px] text-gray-400 font-bold select-none uppercase">
                {isRTL ? 'لوحة تسييل وتحكم المشرف' : 'Back-Office Admin Pro'}
              </span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Groups items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-right select-none">
          {sidebarGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-1.5">
              {!isSidebarCollapsed && (
                <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-extrabold px-2 mt-1">
                  {isRTL ? group.titleAr : group.titleFr}
                </span>
              )}
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'
                      } ${
                        isActive 
                          ? 'bg-indigo-650 text-white shadow-xl shadow-indigo-600/10' 
                          : isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-650 hover:bg-slate-100 hover:text-indigo-605'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isSidebarCollapsed && (
                        <span className="truncate">{isRTL ? item.ar : item.fr}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t dark:border-slate-800 flex flex-col gap-2.5 text-center text-[10px]">
          {!isSidebarCollapsed && (
            <span className="font-extrabold text-slate-400">
              API Version: v5.24 (PROD)
            </span>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA CONTAINER */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        {/* Top Header Bar */}
        <header className={`border-b px-6 py-3.5 flex items-center justify-between select-none transition-all ${
          isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'
        } ${
          isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-gray-200'
        }`}>
          {/* Breadcrumb / Title */}
          <div className={`flex items-center gap-2 text-xs font-bold ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-gray-400">
              {isRTL ? 'إعدادات المنصة' : 'SaaS Config'}
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-[#6366f1] capitalize bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
              {isRTL ? (tabLabelsAr[activeTab] || activeTab) : activeTab}
            </span>
          </div>

          {/* Quick Config widgets */}
          <div className={`flex items-center gap-3.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            
            {/* Live Gateway & Status Indicators */}
            <div className={`hidden md:flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black border tracking-wider transition-all hover:scale-[1.02] ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-gray-50 border-gray-150 text-slate-600 shadow-xs'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0 inline-block" />
                <span>{isRTL ? 'بوابة PAYZONE: نشطة' : 'PAYZONE: SECURE'}</span>
              </div>
              
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black border tracking-wider transition-all hover:scale-[1.02] ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-gray-50 border-gray-150 text-slate-600 shadow-xs'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0 inline-block" />
                <span>{isRTL ? 'مزامنة FIRESTORE: نشطة' : 'DB SYNC: LIVE'}</span>
              </div>
            </div>

            {/* Dynamic Admin Language Switcher Pill Button */}
            <div className={`flex items-center rounded-xl p-0.5 border ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-100 border-gray-200'
            }`}>
              <button
                onClick={() => setAdminLang('ar')}
                className={`px-2 py-1 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                  adminLang === 'ar' 
                    ? 'bg-indigo-650 text-white shadow-sm' 
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-650 hover:text-slate-900'
                }`}
                title="الواجهة بالعربية"
              >
                عربي
              </button>
              <button
                onClick={() => setAdminLang('fr')}
                className={`px-2 py-1 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                  adminLang === 'fr' 
                    ? 'bg-indigo-650 text-white shadow-sm' 
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-650 hover:text-slate-900'
                }`}
                title="Interface en Français"
              >
                FR
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-850 hover:text-amber-300' 
                  : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50 hover:text-indigo-600 shadow-xs'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Center Bell Button -> Toggle Interactive Popover */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all cursor-pointer relative ${
                  showNotificationDropdown
                    ? 'bg-indigo-650 text-white border-indigo-650'
                    : isDarkMode 
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                      : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50 shadow-xs'
                }`}
              >
                <Bell className="w-4 h-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-600 border border-white dark:border-slate-900 animate-bounce" />
                )}
              </button>

              {/* FLOATING NOTIFICATIONS POP-DOWN MENU */}
              <AnimatePresence>
                {showNotificationDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute z-50 top-11 ${
                      isRTL ? 'left-0' : 'right-0'
                    } w-80 rounded-2xl border p-4 shadow-2xl ${
                      isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-gray-150'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-2 mb-2 flex-row-reverse text-right">
                      <span className="text-xs font-black uppercase text-[#6366f1]">
                        {isRTL ? 'تنبيهات النظام الإداري' : 'SaaS Event Alerts'}
                      </span>
                      <button 
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({...n, read: true})));
                        }}
                        className="text-[9.5px] font-bold text-[#6366f1] hover:underline cursor-pointer"
                      >
                        {isRTL ? 'تعليم الكل كمقروء' : 'Mark all read'}
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-[10px] text-gray-450 text-center py-4">{isRTL ? 'لا توجد تنبيهات معلقة' : 'No pending system events.'}</p>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            className={`p-2.5 rounded-xl border text-right transition-all flex flex-col gap-1 ${
                              notif.read 
                                ? isDarkMode ? 'bg-slate-950/40 border-slate-850 text-slate-400' : 'bg-slate-50 border-gray-100 text-gray-400'
                                : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-indigo-50/50 border-indigo-100 text-indigo-950/90'
                            }`}
                          >
                            <span className="text-[10px] leading-relaxed font-bold">
                              {isRTL ? notif.titleAr : notif.titleFr}
                            </span>
                            <div className="flex justify-between items-center text-[8.5px] text-slate-400 mt-1 flex-row-reverse">
                              <span className="bg-[#6366f1]/10 px-1.5 py-0.5 rounded text-[#6366f1] font-bold uppercase">SaaS System</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifications(prev => prev.filter(n => n.id !== notif.id));
                                }}
                                className="hover:text-red-500 font-extrabold cursor-pointer"
                              >
                                {isRTL ? 'إقصاء كلي' : 'Clear'}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar identifier */}
            <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`hidden sm:flex flex-col ${isRTL ? 'text-left' : 'text-right'}`}>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">Super Admin</span>
                <span className="text-[9px] text-[#6366f1] font-bold">amine.saas@airtasker.ma</span>
              </div>
              <div className="w-8.5 h-8.5 rounded-xl bg-[#6366f1] text-white font-black flex items-center justify-center text-xs shadow-md shadow-indigo-600/15">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Display Stage Frame */}
        <div className="p-6 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {/* Render Active Tab */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {/* Tab 1: Dashboard Overview */}
              {activeTab === 'dashboard' && (
                <DashboardOverview
                  isRTL={isRTL}
                  isDarkMode={isDarkMode}
                  users={users}
                  tasks={tasks}
                  systemLogs={systemLogs}
                  fraudAlerts={fraudAlerts}
                  payoutRequests={payoutRequests}
                  verificationRequests={verificationRequests}
                  disputes={disputes}
                  onDismissAlert={handleDismissAlert}
                  onFreezeUser={handleFreezeUserLocally}
                  onAddLog={(log) => setSystemLogs(prev => [log, ...prev])}
                  onApprovePayout={handleApprovePayout}
                  onHoldPayout={handleHoldPayout}
                  onResolveDispute={handleResolveDispute}
                  onUpdateKyc={handleUpdateKyc}
                  onResolveFraudAlert={handleResolveFraudAlert}
                />
              )}

              {/* Tab 2: Master Users Management Module */}
              {activeTab === 'users' && (
                <div className="flex flex-col gap-4">
                  {/* Sleek toggle switcher at the top of Users */}
                  <div className="flex gap-2 mb-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-max self-end sm:self-auto">
                    <button
                      onClick={() => setToggleUserSubtype('customers')}
                      className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                        toggleUserSubtype === 'customers'
                          ? 'bg-[#6366f1] text-white shadow'
                          : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {isRTL ? 'دليل الأعضاء المستهلكين' : 'Directory Clients'}
                    </button>
                    <button
                      onClick={() => setToggleUserSubtype('providers')}
                      className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                        toggleUserSubtype === 'providers'
                          ? 'bg-[#6366f1] text-white shadow'
                          : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {isRTL ? 'الحرفيين والشركاء KYC' : 'Prestataires (KYC)'}
                    </button>
                  </div>

                  <UsersModule
                    isRTL={isRTL}
                    isDarkMode={isDarkMode}
                    users={users}
                    loadingUsers={loadingUsers}
                    userEmails={userEmailsMock}
                    allFiles={allFiles}
                    userType={toggleUserSubtype}
                    verificationRequests={verificationRequests}
                    tasks={tasks}
                    onToggleBlockUser={handleToggleBlockUser}
                    onDeleteUser={handleDeleteUser}
                    onSelectUserForFiles={(user) => setSelectedUserForFiles(user)}
                    onApproveFreelancer={(reqId, uId) => handleUpdateKyc(reqId, uId, 'approved')}
                    onRejectFreelancer={(reqId, name) => {
                      const req = verificationRequests.find(r => r.id === reqId);
                      if (req) {
                        handleUpdateKyc(reqId, req.userId, 'rejected');
                      }
                    }}
                    processingUsers={processingUsers}
                  />
                </div>
              )}

              {/* Tab 3: Orders & Escrow Surveillance */}
              {activeTab === 'orders' && (
                <OrdersModule
                  isRTL={isRTL}
                  isDarkMode={isDarkMode}
                  tasks={tasks}
                  onAddLog={(log) => setSystemLogs(prev => [log, ...prev])}
                  onOverrideStatus={handleOverrideStatus}
                />
              )}

              {/* Tab 4: Finance Ledger */}
              {activeTab === 'finance' && (
                <FinanceModule
                  isRTL={isRTL}
                  isDarkMode={isDarkMode}
                  tasks={tasks}
                  onAddLog={(log) => setSystemLogs(prev => [log, ...prev])}
                />
              )}

              {/* Tab 5: Services Categories configurations */}
              {activeTab === 'services' && (
                <MarketingServices
                  isRTL={isRTL}
                  isDarkMode={isDarkMode}
                  onAddLog={(log) => setSystemLogs(prev => [log, ...prev])}
                />
              )}

              {/* Tab 6: Disputes Resolution Center */}
              {activeTab === 'disputes' && (
                <div className="flex flex-col gap-6 animate-fade-in" id="admin-disputes-workspace-staging">
                  <div className="flex flex-col text-right border-b pb-4 dark:border-slate-800">
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest leading-none dark:text-white">
                      {isRTL ? 'إدارة النزاعات المعلقة وقسم التحكيم المالي' : 'Escrow Trade Disputes & Court Arbitration Workspace'}
                    </h3>
                    <p className="text-[10px] text-slate-505 font-semibold mt-1.5 leading-snug">
                      {isRTL 
                        ? 'فض النزاعات المالية في صفقات الرباط، استرجع السيولة للعميل المتضرر أو حرر الأجر للحرفي صيانةً للحقوق.' 
                        : 'Arbitrez les litiges fiduciaires. Tranchez pour le consommateur ou libérez les gains de l’artisan.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-4">
                      {disputes.length === 0 ? (
                        <div className="text-center py-10 bg-white dark:bg-slate-900 border rounded-2xl">
                          <span className="text-xs font-bold text-gray-400">{isRTL ? 'لا توجد نزاعات معلقة حالياً' : 'No disputed transactions found.'}</span>
                        </div>
                      ) : (
                        disputes.map((d) => (
                          <div key={d.id} className={`p-5 rounded-2xl border flex flex-col gap-4 text-right transition-all hover:border-indigo-200/50 ${
                            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
                          }`}>
                            <div className="flex justify-between items-center border-b pb-2.5 flex-row-reverse dark:border-slate-800">
                              <span className={`text-[9.5px] px-2 py-0.5 rounded font-black ${
                                d.status === 'resolved' 
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20' 
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 animate-pulse'
                              }`}>
                                {d.status === 'resolved' ? 'RESOLVED ✓' : 'ARBITRATION PENDING'}
                              </span>
                              <span className="text-xs font-mono font-black text-[#585af1]">{d.id}</span>
                            </div>

                            <div className="flex flex-col gap-1">
                              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">{d.title}</h4>
                              <p className="text-[11px] text-slate-500 mt-1">
                                {isRTL 
                                  ? `المبلغ قيد النزاع: ${d.amount} درهم • العميل: ${d.client} • الحرفي: ${d.worker}` 
                                  : `Escrow Fund Stake: ${d.amount} MAD • Demande par client: ${d.client} • Pour prestataire: ${d.worker}`}
                              </p>
                            </div>

                            {d.status === 'pending' ? (
                              <div className="flex justify-end gap-2.5 mt-2 pt-2 border-t border-gray-100/10">
                                <button
                                  disabled={processingId === d.id}
                                  onClick={() => wrapAction(d.id, () => handleResolveDispute(d.id, 'refund_client'))}
                                  className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm hover:bg-rose-700 flex items-center gap-1"
                                >
                                  <span>{isRTL ? 'إقرار إرجاع المبلغ للعميل' : 'Refund Client'}</span>
                                </button>
                                <button
                                  disabled={processingId === d.id}
                                  onClick={() => wrapAction(d.id, () => handleResolveDispute(d.id, 'release_to_tasker'))}
                                  className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm hover:bg-emerald-700 flex items-center gap-1"
                                >
                                  <span>{isRTL ? 'تحرير وصرف المكاسب للحرفي' : 'Release Worker'}</span>
                                </button>
                              </div>
                            ) : (
                              <div className="p-3 bg-slate-50 dark:bg-slate-950 font-mono text-[10px] text-emerald-500 uppercase rounded-xl">
                                {isRTL ? `تم فض النزاع بقرار إداري: ${d.decision}` : `Administrative Decision Confirmed: ${d.decision}`}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className={`p-5 rounded-2xl border flex flex-col gap-4 text-right h-max ${
                      isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 relative overflow-hidden'
                    }`}>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{isRTL ? 'قواعد الضمان الفيدرالي لرباط' : 'Federated Escrow Rules'}</h4>
                      <p className="text-[10.5px] text-gray-450 leading-relaxed">
                        {isRTL 
                          ? 'بموجب اتفاقية الاستخدام، يحتفظ المشرف بصلاحية مصادرة أموال الضمان من محفظة بوابة Payzone وإلغاء العملية في الحالات القهرية كعدم حضور مقدم الخدمة.' 
                          : 'Conformément aux conditions générales Rabat, l’argent déposé en séquestre ne peut être débloqué unilatéralement que par décision souveraine de l’arbitrage backoffice.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 7: Support Tickets logs */}
              {activeTab === 'support' && (
                <SupportReviews
                  isRTL={isRTL}
                  isDarkMode={isDarkMode}
                  onAddLog={(log) => setSystemLogs(prev => [log, ...prev])}
                />
              )}

              {/* Tab 8: Business Intelligence and analytics exports */}
              {activeTab === 'analytics' && (
                <AIControlSecurity
                  isRTL={isRTL}
                  isDarkMode={isDarkMode}
                  onAddLog={(log) => setSystemLogs(prev => [log, ...prev])}
                />
              )}

              {/* Tab 9: Superadmin Global Config */}
              {activeTab === 'settings' && (
                <div className={`p-8 rounded-3xl border text-right text-xs font-bold ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
                }`}>
                  <Settings className="w-8 h-8 text-[#6366f1] mx-auto mb-3 animate-spin duration-300" />
                  <h4 className="text-sm font-black mb-1">{isRTL ? 'إعدادات المنصة وبوابة التسييل الرقمي' : 'Paramètres Système Évolutifs'}</h4>
                  <p className="text-gray-405 font-medium leading-relaxed max-w-md mx-auto">
                    {isRTL 
                      ? 'قنوات دفع Payzone، مفاتيح تشفير SSL الموازية، وبطاقات الدعم الافتراضية نشطة بالكامل وتعمل في الخلفية.' 
                      : 'La clé Stripe, l\'intégration de l\'API Payzone et les paramètres globaux de l\'infrastructure Cloud sont stables.'}
                  </p>
                </div>
              )}

              {/* Tab 10: Superadmin RBAC role settings */}
              {activeTab === 'security' && (
                <AIControlSecurity
                  isRTL={isRTL}
                  isDarkMode={isDarkMode}
                  onAddLog={(log) => setSystemLogs(prev => [log, ...prev])}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* SELECTED USER FILES PORTFOLIO UNDERLAY DIALOG */}
      {selectedUserForFiles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none">
          <div className={`w-full max-w-xl rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-850 border-gray-150 shadow-xl'
          }`}>
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between flex-row-reverse">
              <span className="text-xs font-black uppercase text-gray-405">
                {isRTL ? `الملفات المرفوعة للعضو: ${selectedUserForFiles.displayName}` : `Fichiers de : ${selectedUserForFiles.displayName}`}
              </span>
              <button 
                onClick={() => setSelectedUserForFiles(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-right">
              {allFiles.filter(f => f.userId === selectedUserForFiles.uid).length === 0 ? (
                <div className="text-center p-8 text-gray-400 font-bold text-xs select-none">
                  {isRTL ? 'لا توجد مستندات مهنية أو تراخيص مرفوعة لهذا الحساب حالياً.' : 'Aucun fichier ni pièce d\'identité de Rabat pour ce compte.'}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {allFiles.filter(f => f.userId === selectedUserForFiles.uid).map((f) => (
                    <div key={f.id} className="p-3 border dark:border-slate-800 rounded-xl flex items-center gap-2.5 justify-between bg-slate-50/50 dark:bg-slate-950/30 text-xs text-slate-500 font-bold">
                      <span className="font-mono text-[9px] text-[#6366f1] shrink-0">{(f.fileSize / 1024).toFixed(1)} KB</span>
                      <div className="flex flex-col text-right truncate">
                        <span className="truncate text-slate-800 dark:text-slate-100 text-[11px] leading-tight">{f.fileName}</span>
                        <span className="text-[9px] font-medium mt-0.5">{f.fileType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3.5 border-t dark:border-slate-800 flex justify-end gap-1.5 text-xs font-bold">
              <button
                onClick={() => setSelectedUserForFiles(null)}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl cursor-pointer transition-all shrink-0"
              >
                {isRTL ? 'إغلاق المعاينة' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating administrative status toast system panel */}
      <div className="fixed bottom-5 right-5 z-55 flex flex-col gap-2.5 max-w-sm w-full font-sans select-none pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl shadow-xl text-xs font-bold text-white flex items-center justify-between pointer-events-auto border transition-all duration-300 ${
              t.type === 'success' 
                ? 'bg-emerald-600 border-emerald-500' 
                : 'bg-rose-600 border-rose-500'
            }`}
          >
            <span>{t.message}</span>
            <button 
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="ml-3 font-black text-white hover:text-gray-200 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
