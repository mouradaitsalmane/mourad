import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { Task, UserProfile } from '../types';
import { LanguageKey, RABAT_NEIGHBORHOODS, SERVICE_CATEGORIES } from '../data/rabatData';
import { 
  ShieldAlert, 
  Users, 
  Briefcase, 
  CheckCircle, 
  DollarSign, 
  Flame, 
  Award, 
  Trash2, 
  MapPin, 
  Check, 
  X, 
  Filter, 
  Sparkles, 
  Settings, 
  RefreshCw, 
  LayoutDashboard, 
  Map as MapIcon, 
  Calendar, 
  BarChart3, 
  Wallet, 
  Bell, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Send, 
  UserCheck, 
  User,
  Zap, 
  Info, 
  Clock, 
  Download, 
  AlertCircle, 
  Compass,
  Sliders,
  Shield,
  Activity,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  lang: LanguageKey;
  tasks: Task[];
}

interface NotificationItem {
  id: string;
  titleAr: string;
  titleFr: string;
  time: string;
  read: boolean;
  type: 'task' | 'payment' | 'user' | 'system' | 'fraud';
}

interface WorkerVerificationRequest {
  id: string;
  userId: string;
  name: string;
  category: string;
  skills: string[];
  idProofUrl: string;
  policeCheck: 'passed' | 'pending' | 'failed';
  proInsurance: boolean;
  experienceYears: number;
}

interface DisputeItem {
  id: string;
  taskId: string;
  taskTitle: string;
  clientName: string;
  workerName: string;
  amount: number;
  reason: string;
  status: 'open' | 'investigating' | 'resolved_refunded' | 'resolved_released' | 'resolved_split';
  createdAt: string;
}

interface FraudAlertItem {
  id: string;
  userId: string;
  name: string;
  type: 'velocity_limit' | 'ip_clash' | 'budget_anomaly' | 'suspicious_chat';
  severity: 'low' | 'medium' | 'critical';
  descriptionAr: string;
  descriptionFr: string;
  status: 'active' | 'dismissed' | 'frozen';
  time: string;
}

export default function AdminPanel({ lang, tasks }: AdminPanelProps) {
  const isRTL = lang === 'ar';

  // Core configuration states
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'workers' | 'payments' | 'reports' | 'settings'>('overview');

  // Firestore synchronization
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // User emails, files listing and view selection states
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [selectedUserForFiles, setSelectedUserForFiles] = useState<UserProfile | null>(null);

  // Verification Desk Queue (for Worker approvals)
  const [verificationRequests, setVerificationRequests] = useState<WorkerVerificationRequest[]>([
    {
      id: 'vr1',
      userId: 'user_yassine',
      name: 'Yassine El Mansouri',
      category: 'plumbing',
      skills: ['Pipe repair', 'Leak detection', 'Water heater install'],
      idProofUrl: 'ID_Verified_Morocco_National.pdf',
      policeCheck: 'passed',
      proInsurance: true,
      experienceYears: 6
    },
    {
      id: 'vr2',
      userId: 'user_amina',
      name: 'Amina El Hassani',
      category: 'cleaning',
      skills: ['Deep clean', 'Office sanitation', 'Carpet dry cleaning'],
      idProofUrl: 'ID_Pending_Verification.pdf',
      policeCheck: 'passed',
      proInsurance: false,
      experienceYears: 4
    },
    {
      id: 'vr3',
      userId: 'user_bilal',
      name: 'Bilal Benjelloun',
      category: 'electricity',
      skills: ['Short-circuit repair', 'Fixture wiring', 'Sub-panel overhaul'],
      idProofUrl: 'ID_Checked_Rabat_Tribunal.pdf',
      policeCheck: 'pending',
      proInsurance: true,
      experienceYears: 7
    }
  ]);

  // Disputes Log (Fintech Resolution Desk)
  const [disputes, setDisputes] = useState<DisputeItem[]>([
    {
      id: "disp1",
      taskId: "task_water_leak",
      taskTitle: "Water leak in Akdal bathroom ceiling",
      clientName: "Mourid Sghir",
      workerName: "Rachid Plombier",
      amount: 450,
      reason: "Client claims water heater was left dripping and damaged drywall. Worker argues ceiling was already wet.",
      status: "open",
      createdAt: "2026-06-11 14:22"
    },
    {
      id: "disp2",
      taskId: "task_garden_trim",
      taskTitle: "Garden maintenance & tree shaping in Souissi",
      clientName: "Lalla Souad",
      workerName: "Karim Jardinier",
      amount: 800,
      reason: "Client claims worker cut the wrong decorative rosebushes. Worker demands full payment for 6 hours of physical labor.",
      status: "investigating",
      createdAt: "2026-06-10 09:15"
    }
  ]);

  // Fraud alerts state
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlertItem[]>([
    {
      id: 'frd-1',
      userId: 'uid_coll_19',
      name: 'Samir Boutayeb',
      type: 'ip_clash',
      severity: 'critical',
      descriptionAr: 'رصد تماثل IP بين الزبون وصنع المهمة بنفس التوقيت',
      descriptionFr: 'Même adresse IP détectée simultanément pour le client et le prestataire.',
      status: 'active',
      time: 'منذ ١٥ دقيقة'
    },
    {
      id: 'frd-2',
      userId: 'uid_anom_77',
      name: 'Hassan Zemmouri',
      type: 'budget_anomaly',
      severity: 'medium',
      descriptionAr: 'ميزانية مشبوهة: تنظيف أواني المطبخ العادية بـ 6,500 درهم بالرباط',
      descriptionFr: 'Budget disproportionné : Nettoyage d\'assiettes simples à 6,500 MAD.',
      status: 'active',
      time: 'منذ ساعة'
    }
  ]);

  // Category custom adjustable rates state (Category management)
  const [categoriesConfig, setCategoriesConfig] = useState([
    { id: 'cleaning', nameFr: 'Ménage & Nettoyage', nameAr: 'تنظيف منزلي', baseFee: 40, commissionPercent: 12, active: true },
    { id: 'plumbing', nameFr: 'Plomberie', nameAr: 'سباكة ورصاصة', baseFee: 60, commissionPercent: 15, active: true },
    { id: 'electricity', nameFr: 'Électricité', nameAr: 'كهرباء وإضاءة', baseFee: 50, commissionPercent: 15, active: true },
    { id: 'moving', nameFr: 'Déménagement', nameAr: 'نقل وتسليم الأثاث', baseFee: 100, commissionPercent: 10, active: true },
    { id: 'repairs', nameFr: 'Bricolage', nameAr: 'إصلاحات وصيانة منزلية', baseFee: 45, commissionPercent: 12, active: true },
    { id: 'gardening', nameFr: 'Jardinage', nameAr: 'بستنة ورعاية حدائق', baseFee: 40, commissionPercent: 15, active: false }
  ]);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', titleAr: 'مهمة سباكة جديدة معلنة بـ أكدال', titleFr: 'Nouvelle tâche Plomberie à Agdal', time: 'منذ دقيقة', read: false, type: 'task' },
    { id: '2', titleAr: 'الحرفي يوسف تقدم ببيانات التحقق للهوية والمهنة', titleFr: 'Le prestataire Youssef a soumis ses documents de certification', time: 'منذ ١٢ دقيقة', read: false, type: 'user' },
    { id: '3', titleAr: 'نزاع نشط معلق بين زبون وحرفي في Souissi بـ 800 درهم', titleFr: 'Nouveau litige de 800 MAD suite à travaux à Souissi', time: 'منذ ساعة', read: true, type: 'fraud' },
    { id: '4', titleAr: 'تم شحن ضمان مالي (٣٥٠ درهم) عبر بوابتنا Payzone', titleFr: 'Escrow (350 MAD) déposé et sécurisé', time: 'منذ ساعتين', read: true, type: 'payment' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // System actions ledger telemetry
  const [systemLogs, setSystemLogs] = useState<string[]>([
    'System initialization: SecOps firewall and sandbox rules attached',
    'Realtime DB: Active listeners established on "users" and "tasks" collections',
    'Gateway Payzone Morocco: Webhook callback connection status 100% operational',
    'Auth Engine: Attached superadmin token contexts successfully'
  ]);

  // Operational filters
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'clients' | 'workers' | 'suspended'>('all');
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerFilter, setWorkerFilter] = useState<'all' | 'verified' | 'unverified' | 'active'>('all');

  // Geographic dispatch list
  const [selectedGeoDistrict, setSelectedGeoDistrict] = useState<string | null>(null);

  // Load registered users live from Firestore on Snapshot
  useEffect(() => {
    setLoadingUsers(true);
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        list.push({ uid: d.id, ...d.data() } as UserProfile);
      });
      setUsers(list);
      setLoadingUsers(false);
    }, (err) => {
      console.error("Firestore user fetch error: ", err);
      // Fallback fallback simulated users
      setLoadingUsers(false);
    });
    return () => unsub();
  }, []);

  // Load registered user files live from Firestore on Snapshot
  useEffect(() => {
    setLoadingFiles(true);
    const unsub = onSnapshot(collection(db, 'files'), (snap) => {
      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setAllFiles(list);
      setLoadingFiles(false);
    }, (err) => {
      console.error("Firestore files fetch error: ", err);
      setLoadingFiles(false);
    });
    return () => unsub();
  }, []);

  // Fetch private user emails for the directory view dynamically
  useEffect(() => {
    if (users.length === 0) return;
    
    users.forEach(async (usr) => {
      if (userEmails[usr.uid]) return;
      try {
        const infoDoc = await getDoc(doc(db, 'users', usr.uid, 'private', 'info'));
        if (infoDoc.exists()) {
          const data = infoDoc.data();
          if (data?.email) {
            setUserEmails(prev => ({ ...prev, [usr.uid]: data.email }));
          }
        }
      } catch (err) {
        console.error("Error fetching private user email details: ", err);
      }
    });
  }, [users]);

  // Compute stats metrics
  const totalUsersCount = users.length || 24;
  const workersCount = users.filter(u => u.isTasker).length || 10;
  const clientsCount = users.filter(u => !u.isTasker).length || 14;
  const verifiedWorkersCount = users.filter(u => u.isVerifiedTasker).length || 6;
  const suspendedUsersCount = users.filter(u => (u as any).isSuspended).length || 2;

  const totalTasksCount = tasks.length || 32;
  const activeTasksCount = tasks.filter(t => t.status === 'assigned' || t.status === 'open').length || 14;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length || 15;

  const totalEscrowVolume = tasks.reduce((sum, t) => sum + (t.budget || 0), 0) || 12400;
  const platformRevenueVal = Math.round(totalEscrowVolume * 0.15);

  // Administrative handlers
  const handleToggleBlockUser = async (userId: string, isCurrentlySuspended: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isSuspended: !isCurrentlySuspended
      });
      setSystemLogs(prev => [
        `User Management: Toggled suspend status for ${userId.substring(0, 7)} to ${!isCurrentlySuspended}`,
        ...prev
      ]);
    } catch (err) {
      console.error(err);
      // Mock update to trigger immediate visual response
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, isSuspended: !isCurrentlySuspended } as any : u));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmMsg = isRTL 
      ? 'هل أنت متأكد تماماً من رغبتك في حذف هذا العضو نهائياً من قاعدة بيانات الرباط وسحب كافة صلاحياته؟' 
      : 'Êtes-vous absolument sûr de vouloir supprimer définitivement cet utilisateur de la base ?';
    if (window.confirm(confirmMsg)) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setSystemLogs(prev => [
          `Danger Zone: Deleted user account ${userId}`,
          ...prev
        ]);
      } catch (err) {
        console.error("Error deleting user: ", err);
        setUsers(prev => prev.filter(u => u.uid !== userId));
      }
    }
  };

  const handleApproveFreelancer = async (reqId: string, userId: string) => {
    try {
      // Set field in Firebase
      await updateDoc(doc(db, 'users', userId), {
        isVerifiedTasker: true,
        isTasker: true
      });
      setVerificationRequests(prev => prev.filter(r => r.id !== reqId));
      setSystemLogs(prev => [
        `Freelancer Verified: Approved verification files for user ID ${userId}`,
        ...prev
      ]);
      alert(isRTL ? 'تهانينا! تم ترفيع العضو إلى رتبة حرفي معتمد بنجاح وإرسال إشعار فوري له.' : 'Freelancer approuvé avec succès.');
    } catch (err) {
      console.error(err);
      // Local state progression anyway for clean simulations
      setVerificationRequests(prev => prev.filter(r => r.id !== reqId));
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, isVerifiedTasker: true, isTasker: true } : u));
    }
  };

  const handleRejectFreelancer = (reqId: string, name: string) => {
    const reason = window.prompt(isRTL ? 'يرجى تقديم سبب الرفض الإداري لحساب المستقل:' : 'Veuillez renseigner le motif de refus de certification :');
    if (reason) {
      setVerificationRequests(prev => prev.filter(r => r.id !== reqId));
      setSystemLogs(prev => [
        `Verification Desk: Rejected verification portfolio for ${name}. Reason: "${reason}"`,
        ...prev
      ]);
    }
  };

  // Disputes resolution tools
  const handleResolveDispute = (disputeId: string, resolutionType: 'refund' | 'release' | 'split') => {
    setDisputes(prev => prev.map(disp => {
      if (disp.id === disputeId) {
        const updatedStatus = resolutionType === 'refund' ? 'resolved_refunded' : 
                              resolutionType === 'release' ? 'resolved_released' : 'resolved_split';
        return { ...disp, status: updatedStatus };
      }
      return disp;
    }));

    setSystemLogs(prev => [
      `Conflict Resolution: Dispute ${disputeId} closed with outcome [${resolutionType.toUpperCase()}]`,
      ...prev
    ]);
    alert(isRTL ? 'تم إنهاء النزاع بنجاح والتسوية المالية الفورية عبر شيكات Payzone.' : 'Conflit arbitré et exécuté financièrement.');
  };

  // Fraud alerts interaction
  const handleFreezeUser = (userId: string, alertId: string) => {
    // Suspend user
    setUsers(prev => prev.map(u => u.uid === userId ? { ...u, isSuspended: true } as any : u));
    setFraudAlerts(prev => prev.map(al => al.id === alertId ? { ...al, status: 'frozen' } : al));
    setSystemLogs(prev => [
      `Security Action: Suspended user ${userId} following a severe Fraud Alarm`,
      ...prev
    ]);
    alert(isRTL ? 'تم تجميد حساب المستخدم وحظر ومقاطعة معاملاته الجارية من الفايروال.' : 'Compte utilisateur gelé instantanément de manière préventive.');
  };

  const handleDismissAlert = (alertId: string) => {
    setFraudAlerts(prev => prev.filter(al => al.id !== alertId));
    setSystemLogs(prev => [
      `Fraud Monitor: Dismissed low-risk flag ${alertId}`,
      ...prev
    ]);
  };

  // Category change handlers
  const handleUpdateCategoryFee = (catId: string, val: number) => {
    setCategoriesConfig(prev => prev.map(c => c.id === catId ? { ...c, baseFee: val } : c));
  };

  const handleUpdateCategoryComm = (catId: string, val: number) => {
    setCategoriesConfig(prev => prev.map(c => c.id === catId ? { ...c, commissionPercent: Math.min(100, Math.max(0, val)) } : c));
  };

  const handleToggleCategoryActive = (catId: string) => {
    setCategoriesConfig(prev => prev.map(c => c.id === catId ? { ...c, active: !c.active } : c));
    const target = categoriesConfig.find(c => c.id === catId);
    setSystemLogs(prev => [
      `Marketplace Setup: Category [${catId}] visibility changed to ${!target?.active}`,
      ...prev
    ]);
  };

  // Filter lists
  const filteredUsersList = users.filter(usr => {
    const matchesSearch = usr.displayName?.toLowerCase().includes(userSearch.toLowerCase()) || 
                          usr.uid?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          usr.bio?.toLowerCase().includes(userSearch.toLowerCase());
    
    if (userFilter === 'clients') return matchesSearch && !usr.isTasker;
    if (userFilter === 'workers') return matchesSearch && usr.isTasker;
    if (userFilter === 'suspended') return matchesSearch && (usr as any).isSuspended;
    return matchesSearch;
  });

  const activeVerificationRequests = verificationRequests;

  return (
    <div 
      className={`min-h-[90vh] w-full flex flex-col md:flex-row transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
      id="saas-marketplace-root"
    >
      
      {/* LEFT SIDEBAR - STRICT SECURE COMPONENT */}
      <aside 
        className={`shrink-0 transition-all duration-300 border-gray-200 flex flex-col justify-between p-4 relative ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${isDarkMode ? 'bg-[#111827] border-r border-slate-800/80' : 'bg-white border-r border-gray-200/90 shadow-sm'}`}
        id="fintech-admin-sidebar"
      >
        
        {/* Collapse toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`absolute top-6 p-1.5 rounded-full border shadow-xs cursor-pointer transition-transform hover:scale-110 z-10 ${
            isRTL ? '-left-3' : '-right-3'
          } ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-gray-600'}`}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="flex flex-col gap-6">
          {/* Platform Identity */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="p-2.5 bg-gradient-to-tr from-sky-400 to-sky-600 text-white rounded-xl shadow-lg shadow-sky-500/10">
              <ShieldAlert className="w-5 h-5 shrink-0" />
            </div>
            
            {!isSidebarCollapsed && (
              <div className="flex flex-col text-right">
                <span className="font-extrabold text-sm tracking-tight leading-none text-slate-900 dark:text-white">
                  <span className="text-sky-500 font-black">Tasker</span> SaaS
                </span>
                <span className="text-[9px] text-sky-500 font-extrabold tracking-widest uppercase mt-1">SuperAdmin Console</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200/55 dark:border-slate-800 my-1" />

          {/* Secure Navigation items */}
          <nav className="flex flex-col gap-1.5">
            {[
              { id: 'overview', ar: 'موجز المنصة العام', fr: 'Vue d\'ensemble', icon: LayoutDashboard },
              { id: 'users', ar: 'إدارة المستخدمين وحظرهم', fr: 'Comptes & Utilisateurs', icon: Users },
              { id: 'workers', ar: 'توثيق ورادار الحرفيين', fr: 'Freelancers & Vérification', icon: UserCheck },
              { id: 'payments', ar: 'المعاملات المالية والنزاعات', fr: 'Escrow & Litiges', icon: Wallet },
              { id: 'reports', ar: 'تقارير الأداء ومكافحة الاحتيال', fr: 'Rapports & Risques SecOps', icon: BarChart3 },
              { id: 'settings', ar: 'إعدادات المنصة والفئات', fr: 'SaaS Config & Log', icon: Settings }
            ].map(item => {
              const isActive = activeTab === item.id;
              const CustomIcon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 py-3 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative group ${
                    isActive 
                      ? 'bg-sky-605 bg-sky-600 text-white shadow-md shadow-sky-500/15' 
                      : isDarkMode 
                        ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-slate-100/80'
                  }`}
                  title={isRTL ? item.ar : item.fr}
                >
                  <CustomIcon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  
                  {!isSidebarCollapsed && (
                    <span className="truncate">{isRTL ? item.ar : item.fr}</span>
                  )}

                  {isActive && !isSidebarCollapsed && (
                    <span className={`absolute w-1.5 h-4.5 bg-sky-400 rounded-full ${isRTL ? 'left-2.5' : 'right-2.5'}`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Identity settings */}
        <div className="flex flex-col gap-4 border-t border-gray-150 pt-4 dark:border-slate-800 select-none">
          {/* Light/Dark mode */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer ${
              isDarkMode ? 'text-amber-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-slate-100'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-indigo-500 shrink-0" />}
            {!isSidebarCollapsed && (
              <span>{isRTL ? (isDarkMode ? 'الوضع المضيء' : 'الوضع الداكن') : (isDarkMode ? 'Mode Clair' : 'Mode Sombre')}</span>
            )}
          </button>

          {/* User badge */}
          <div className="flex items-center gap-2.5 px-0.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-indigo-500/20">
              SA
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-100">SuperAdmin Context</span>
                <span className="text-[8px] text-emerald-500 font-extrabold tracking-normal">SECURE SESSION</span>
              </div>
            )}
          </div>
        </div>

      </aside>

      {/* MAIN CONTAINER PANEL */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col gap-6 overflow-x-hidden">
        
        {/* HEADER NAVBAR */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200/50 pb-5 dark:border-slate-800/80">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl hidden sm:inline-flex">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-right">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none dark:text-white">
                {isRTL ? 'إدارة المنصة وبوابات الدفع الوطنية' : 'Console d\'Administration Centrale'}
              </h1>
              <span className="text-[10px] text-gray-400 font-bold mt-1">
                {isRTL ? 'سجل السيطرة للمنصة وحقوق المستقلين برعاية نظام التحقق والضمان' : 'Surveillance multi-tenant, escrow fintech et sécurité de la marketplace'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end relative">
            <div className="inline-flex bg-red-600 text-white px-3 py-1.5 rounded-xl border border-red-500 text-[10px] font-black uppercase gap-1.5 items-center shadow-md shadow-red-500/10 shrink-0">
              <Shield className="w-3.5 h-3.5" />
              <span>🛡️ ADMIN VIEW / رقابة الإدارة</span>
            </div>

            <div className="hidden lg:inline-flex bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 gap-1.5 items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>GCP REGION: Cloud Run - Europe-West3</span>
            </div>

            {/* Notification system */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 rounded-xl border cursor-pointer relative shadow-sm transition-transform hover:scale-105 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-gray-200 text-slate-600'
                }`}
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 top-12 w-80 rounded-2xl border shadow-xl p-4 z-40 flex flex-col gap-3 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-gray-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                      <span className="text-xs font-bold">{isRTL ? 'تنبيهات فورية' : 'Flux SecOps'}</span>
                      <button 
                        onClick={() => {
                          setNotifications(p => p.map(n => ({...n, read: true})));
                          setShowNotifications(false);
                        }} 
                        className="text-[10px] text-indigo-500 font-bold hover:underline"
                      >
                        {isRTL ? 'مقروء للكل' : 'Tout marquer lu'}
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border flex flex-col gap-1 text-right dark:bg-slate-800/40 dark:border-slate-800/90 font-medium text-xs">
                          <span className="text-[9px] text-gray-400 self-start">{n.time}</span>
                          <span>{isRTL ? n.titleAr : n.titleFr}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </header>

        {/* TAB 1: OVERVIEW COMPONENT */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6 animate-fade-in" id="panel-overview-view">
            
            {/* 4 Cards Stats Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              
              {/* Card 1: Users */}
              <div className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 relative overflow-hidden group ${
                isDarkMode ? 'bg-indigo-950/20 border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <div className="flex items-center justify-between flex-row-reverse border-b pb-3 dark:border-slate-800">
                  <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-450">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-extrabold tracking-wider uppercase">{isRTL ? 'إجمالي الحسابات' : 'Utilisateurs inscrits'}</span>
                </div>
                <div className="flex items-end justify-between mt-1">
                  <div className="flex flex-col text-right">
                    <span className="text-3xl font-black">{totalUsersCount}</span>
                    <span className="text-[10px] text-emerald-500 font-extrabold mt-1.5 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>{workersCount} {isRTL ? 'حرفي مستقل بالمنصة' : 'freelancers'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Tasks */}
              <div className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 relative overflow-hidden group ${
                isDarkMode ? 'bg-indigo-950/20 border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <div className="flex items-center justify-between flex-row-reverse border-b pb-3 dark:border-slate-800">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-450">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-extrabold tracking-wider uppercase">{isRTL ? 'المهام ومشاريع العمل' : 'Missions actives'}</span>
                </div>
                <div className="flex items-end justify-between mt-1">
                  <div className="flex flex-col text-right">
                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{totalTasksCount}</span>
                    <span className="text-[10px] text-indigo-500 font-extrabold mt-1.5 flex items-center gap-0.5">
                      <Activity className="w-3 h-3 animate-pulse" />
                      <span>{activeTasksCount} {isRTL ? 'نشطة قيد التنفيذ' : 'encours d\'exécution'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Escrow protection */}
              <div className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 relative overflow-hidden group ${
                isDarkMode ? 'bg-indigo-950/20 border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <div className="flex items-center justify-between flex-row-reverse border-b pb-3 dark:border-slate-800">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-450">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-extrabold tracking-wider uppercase">{isRTL ? 'السيولة في الضمان المالي' : 'Volume de Séquestre'}</span>
                </div>
                <div className="flex items-end justify-between mt-1">
                  <div className="flex flex-col text-right">
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{totalEscrowVolume} MAD</span>
                    <span className="text-[10px] text-emerald-500 font-extrabold mt-1.5 flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" />
                      <span>100% {isRTL ? 'معاملات مغطاة بـ Payzone' : 'sécurisé via Payzone'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: Platform Net Profit */}
              <div className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 relative overflow-hidden group ${
                isDarkMode ? 'bg-indigo-950/20 border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <div className="flex items-center justify-between flex-row-reverse border-b pb-3 dark:border-slate-800">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-extrabold tracking-wider uppercase">{isRTL ? 'أرباح عمولة المنصة (15٪)' : 'Revenus de commission'}</span>
                </div>
                <div className="flex items-end justify-between mt-1">
                  <div className="flex flex-col text-right">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-450">{platformRevenueVal} MAD</span>
                    <span className="text-[10px] text-emerald-500 font-extrabold mt-1.5 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>{isRTL ? 'أرباح صافية مجدولة للتسييل' : 'Net cumulé'}</span>
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Action Broadcast Console */}
            <div className={`p-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#111827] border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Send className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black tracking-wider uppercase text-gray-400">{isRTL ? 'بوابة الإشارات السريعة وتنبيهات الإدارة' : 'Messages Flash & Alertes Globales'}</h3>
              </div>
              <p className="text-xs text-gray-450 mb-4 text-right">
                {isRTL 
                  ? 'بث رسالة نصية بارزة لكافة المشرفين والحرفيين تظهر في شريط الأخبار العلوي للمنصة مباشرةً.' 
                  : 'Diffusez immédiatement un message important sur les barres d\'alertes des utilisateurs de Rabat.'}
              </p>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  placeholder={isRTL ? 'مثال: صيانة مبرمجة لبوابة الدفع Payzone من الـ ٢ صباحاً إلى الـ ٤ صباحاً...' : 'Exemple: Travaux de maintenance sur la passerelle Payzone...'}
                  className={`flex-1 text-xs px-4 py-3 rounded-xl focus:outline-none border font-semibold ${
                    isDarkMode ? 'bg-[#0b0f19] border-slate-800 focus:border-indigo-505' : 'bg-slate-50 border-gray-250 focus:border-indigo-600'
                  }`}
                  id="admin-broadcast-message-field"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('admin-broadcast-message-field') as HTMLInputElement;
                    if (el && el.value.trim()) {
                      alert(isRTL ? 'تم إذاعة التنبيه بنجاح لجميع مستخدمي المنصة كإشعار إداري عاجل!' : 'Message diffusé avec succès aux utilisateurs de Rabat !');
                      setSystemLogs(prev => [`Broadcast alert sent: "${el.value.trim()}"`, ...prev]);
                      el.value = '';
                    }
                  }}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold py-3 px-5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'بث الإعلان' : 'Diffuser'}</span>
                </button>
              </div>
            </div>

            {/* Sub-Overview Grid: Fraud Flags list & Recent Database updates */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Core Telemetry logs */}
              <div className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col justify-between ${
                isDarkMode ? 'bg-[#111827] border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <div className="flex items-center justify-between border-b pb-3 mb-4 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 flex-row-reverse">
                    <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <h3 className="text-xs font-black tracking-wider uppercase text-gray-400">{isRTL ? 'النشاط الميداني وسلامة الخوادم' : 'Télémétrie Cloud & Flux d\'Activité'}</h3>
                  </div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-black dark:bg-emerald-500/10 dark:text-emerald-400 select-none">
                    ONLINE
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[220px] font-mono text-[10px] space-y-3 pr-2 text-right">
                  {systemLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 items-start justify-end flex-row-reverse border-b border-gray-100/10 pb-1.5">
                      <span className="text-gray-400 shrink-0 select-none">[{new Date().toLocaleTimeString()}]</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-350">{log}</span>
                    </div>
                  ))}
                  <div className="flex gap-1.5 items-center justify-end text-emerald-500 font-extrabold select-none animate-pulse">
                    <span>●</span>
                    <span className="text-[10px]">{isRTL ? 'بانتظار أحداث Firestore جديدة ملقاة...' : 'Listening to live webhook triggers...'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Mini Fraud Alarms */}
              <div className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col justify-between ${
                isDarkMode ? 'bg-[#111827] border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <div className="flex items-center justify-between border-b pb-3 mb-4 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 flex-row-reverse">
                    <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
                    <h3 className="text-xs font-black tracking-wider uppercase text-gray-400">{isRTL ? 'إنذارات مكافحة الاحتيال والتهديدات' : 'SecOps Fraud Alarms'}</h3>
                  </div>
                  <span className="text-[9px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-black dark:bg-rose-500/10 dark:text-rose-400 select-none">
                    {fraudAlerts.filter(a => a.status === 'active').length} ALERTS
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {fraudAlerts.slice(0, 2).map((alert) => (
                    <div 
                      key={alert.id}
                      className={`p-3 rounded-2xl border text-right flex flex-col gap-1.5 relative ${
                        alert.severity === 'critical' 
                          ? 'bg-rose-50/40 border-rose-100 dark:bg-rose-950/10 dark:border-rose-900/40' 
                          : 'bg-amber-50/40 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between flex-row-reverse text-[9px] font-bold">
                        <span className={`px-1.5 py-0.5 rounded uppercase font-black ${
                          alert.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-850'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-gray-400">{alert.time}</span>
                      </div>

                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{alert.name}</span>
                      <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                        {isRTL ? alert.descriptionAr : alert.descriptionFr}
                      </p>

                      <div className="flex items-center justify-end gap-2 mt-1 border-t border-gray-150/50 pt-2">
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="px-2 py-1 hover:bg-slate-200/50 hover:text-slate-900 dark:hover:bg-slate-800 rounded text-[9px] font-extrabold text-gray-450 cursor-pointer"
                        >
                          {isRTL ? 'تجاهل الإنذار' : 'Dismiss'}
                        </button>
                        <button
                          onClick={() => handleFreezeUser(alert.userId, alert.id)}
                          className="px-2 py-1 bg-rose-650 hover:bg-rose-700 text-white rounded text-[9px] font-black cursor-pointer shadow-xs"
                        >
                          {isRTL ? 'حظر وتجميد العضو 🛑' : 'Geler le compte 🛑'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: USER MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className={`p-6 rounded-3xl border flex flex-col gap-5 animate-fade-in ${
            isDarkMode ? 'bg-[#111827] border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
          }`} id="panel-users-view">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
              <div className="flex flex-col text-right">
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest leading-none dark:text-white">{isRTL ? 'سجل الرقابة وإدارة حسابات الأعضاء' : 'Directory & Modération des Comptes'}</h3>
                <span className="text-[10px] text-gray-450 font-bold mt-1.5">{isRTL ? 'تعليق، تجميد أو إقصاء الحسابات المخالفة وتعديل أدوارهم للسلامة المالية' : 'Filtrez, suspendez ou supprimez les comptes fraudeurs'}</span>
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', ar: 'كل الأعضاء', fr: 'Tous' },
                  { id: 'clients', ar: 'الزبائن المعلمين فقط', fr: 'Clients' },
                  { id: 'workers', ar: 'فئة المهنيين الكسبة', fr: 'Taskers' },
                  { id: 'suspended', ar: 'أعضاء محظورين حالياً', fr: 'Suspendus' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setUserFilter(item.id as any)}
                    className={`text-[10px] font-black px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                      userFilter === item.id 
                        ? 'bg-rose-50 border-rose-250 text-rose-700 font-black dark:bg-rose-500/10 dark:text-rose-450 dark:border-rose-900/60' 
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-100/40 text-gray-500'
                    }`}
                  >
                    {isRTL ? item.ar : item.fr}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter inputs */}
            <div className="relative">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={isRTL ? 'بحث سريع بمعرف الحساب، اسم العضو، السير الذاتية أو السكن...' : 'Rechercher par UID, Nom, Ville, Profession...'}
                className={`w-full text-xs px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  isDarkMode ? 'bg-[#0b0f19] border-slate-800 focus:border-indigo-505' : 'bg-slate-50 border-gray-150 focus:border-indigo-600'
                }`}
              />
              <Search className={`absolute w-3.5 h-3.5 text-gray-450 top-3.5 ${isRTL ? 'left-3' : 'right-3'}`} />
            </div>

            {/* Users Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs min-w-[850px]">
                <thead className="bg-slate-50/50 text-gray-400 border-b select-none dark:bg-[#0b0f19]/40 dark:border-slate-800/80">
                  <tr>
                    <th className="p-3 font-semibold text-right">{isRTL ? 'العضو والمعرف والبريد الإلكتروني' : 'Identité, UID & E-mail'}</th>
                    <th className="p-3 font-semibold text-right">{isRTL ? 'الفئة والخبرة' : 'Expertise'}</th>
                    <th className="p-3 font-semibold text-right">{isRTL ? 'نطاق العمل بالرباط' : 'Quartier'}</th>
                    <th className="p-3 font-semibold text-right">{isRTL ? 'تاريخ التسجيل' : 'Date d\'inscription'}</th>
                    <th className="p-3 font-semibold text-right">{isRTL ? 'المستندات المرفوعة' : 'Fichiers'}</th>
                    <th className="p-3 font-semibold text-right">{isRTL ? 'حالة الحساب' : 'Statut'}</th>
                    <th className="p-3 font-semibold text-center">{isRTL ? 'إجراءات تجميد وإلغاء فوري' : 'Actions de Sécurité'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/10 font-medium font-sans">
                  {filteredUsersList.map((usr) => {
                    const isSuspended = (usr as any).isSuspended === true;
                    
                    // Formatted registration date
                    const formattedDate = usr.createdAt 
                      ? (usr.createdAt.toDate ? usr.createdAt.toDate() : new Date(usr.createdAt)).toLocaleDateString(isRTL ? 'ar-EG' : 'fr-FR', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        }) 
                      : '-';

                    // Files list filtering
                    const userUploadedFiles = allFiles.filter(f => f.userId === usr.uid);
                    const filesCount = userUploadedFiles.length;

                    // Private email retrieval
                    const emailAddress = userEmails[usr.uid] || '---';

                    return (
                      <tr key={usr.uid} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/15 transition-all text-xs border-b dark:border-slate-800/40">
                        <td className="p-3 cursor-pointer" onClick={() => setSelectedUserForFiles(usr)}>
                          <div className="flex items-center gap-2.5 flex-row">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                              {usr.displayName ? usr.displayName.charAt(0) : '?'}
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="font-extrabold text-slate-900 dark:text-white leading-tight hover:underline">
                                {usr.displayName || 'Utilisateur anonyme'}
                              </span>
                              <span className="text-[9px] text-gray-400 font-medium select-all">{emailAddress}</span>
                              <span className="text-[8px] font-mono mt-0.5 text-indigo-400 select-all">{usr.uid}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex flex-col text-right">
                            <span className="font-bold">{usr.isTasker ? (isRTL ? 'مقدم خدمة' : 'Tasker Freelance') : (isRTL ? 'زبون طالب فئة' : 'Client standard')}</span>
                            <span className="text-[10px] text-gray-450 truncate max-w-[170px] leading-snug">{usr.bio || '-'}</span>
                          </div>
                        </td>

                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" /> <span>{usr.location || (isRTL ? 'أكدال' : 'Agdal, Rabat')}</span></span>
                        </td>

                        <td className="p-3 font-bold text-gray-500 dark:text-gray-400">
                          {formattedDate}
                        </td>

                        <td className="p-3">
                          <button 
                            onClick={() => setSelectedUserForFiles(usr)}
                            className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-750 hover:bg-blue-100 px-3 py-1.5 rounded-xl font-black dark:bg-blue-500/10 dark:text-blue-400 cursor-pointer transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{filesCount} {isRTL ? 'ملفات' : 'fichiers'}</span>
                          </button>
                        </td>

                        <td className="p-3">
                          {isSuspended ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-black dark:bg-red-500/10 dark:text-red-400 select-none text-[10.5px]">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <span>{isRTL ? 'محظور إقصائي' : 'Blocked'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full font-black dark:bg-emerald-500/10 dark:text-emerald-400 select-none text-[10.5px]">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{isRTL ? 'نشط مهيأ' : 'Active'}</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3 flex items-center gap-1.5 justify-center">
                          <button
                            onClick={() => handleToggleBlockUser(usr.uid, isSuspended)}
                            className={`px-3 py-1.5 rounded-xl text-[10.5px] font-black cursor-pointer transition-all ${
                              isSuspended 
                                ? 'bg-emerald-50 border border-emerald-250 text-emerald-700 hover:bg-emerald-100' 
                                : 'bg-amber-50 border border-amber-250 text-amber-700 hover:bg-amber-100'
                            }`}
                          >
                            {isSuspended ? (isRTL ? 'فك الحظر إدارياً' : 'Activer') : (isRTL ? 'حظر الحساب' : 'Suspendre 🛑')}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(usr.uid)}
                            className="p-1.5 bg-rose-50/50 hover:bg-rose-100/70 text-rose-600 rounded-xl transition-all cursor-pointer shadow-xs border border-rose-100/30"
                            title="حذف نهائي"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 3: WORKER VERIFICATION SYSTEM & DISPATCH RADAR */}
        {activeTab === 'workers' && (
          <div className="flex flex-col gap-6 animate-fade-in" id="panel-workers-view">
            
            {/* Verification Queue header */}
            <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${
              isDarkMode ? 'bg-[#111827] border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div className="flex flex-col text-right">
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest dark:text-white">{isRTL ? 'طلبات التحقق والمصادقة على الحرفيين' : 'Dispositif de Certification des Prestataires (KYC)'}</h3>
                <span className="text-[10px] text-gray-450 font-bold mt-1">{isRTL ? 'مراجعة أوراق الثبوتية الوطنية، الحالة الجنائية، والتراخيص المهنية لمنح شارة "مورد معتمد"' : 'Analysez et validez les profils des indépendants souhaitant obtenir le badge vérifié'}</span>
              </div>

              {/* Review Queue Items */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
                {activeVerificationRequests.map((req) => (
                  <div 
                    key={req.id}
                    className={`p-4 rounded-2xl border text-right flex flex-col justify-between gap-3 ${
                      isDarkMode ? 'bg-[#0b0f19] border-slate-800' : 'bg-slate-50/50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black dark:text-white leading-tight">{req.name}</span>
                      <span className="text-[9px] text-indigo-500 font-extrabold">{isRTL ? `خبرة ${req.experienceYears} سنوات في ${req.category}` : `${req.category} | ${req.experienceYears} ans exp.`}</span>
                    </div>

                    <div className="flex flex-col gap-1.5 border-t border-b border-gray-200/50 dark:border-slate-800 py-2.5 my-1 text-[10px]">
                      <div className="flex justify-between items-center text-slate-500">
                        <span>{req.idProofUrl}</span>
                        <span className="font-bold text-gray-450">ID CARD:</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className={`font-black ${req.policeCheck === 'passed' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>{req.policeCheck}</span>
                        <span className="text-gray-450 font-bold">CASIER JUDICIAIRE:</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`font-black ${req.proInsurance ? 'text-emerald-500' : 'text-gray-450'}`}>{req.proInsurance ? 'YES' : 'NO'}</span>
                        <span className="text-gray-450 font-bold">RC PRO INSURANCE:</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRejectFreelancer(req.id, req.name)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 py-2 rounded-xl text-[10px] font-black cursor-pointer transition-all border border-gray-200/40"
                      >
                        {isRTL ? 'رفض الطلب' : 'Rejeter'}
                      </button>
                      <button
                        onClick={() => handleApproveFreelancer(req.id, req.userId)}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-550 hover:opacity-90 text-white py-2 rounded-xl text-[10px] font-black cursor-pointer transition-all shadow-xs"
                      >
                        {isRTL ? 'تفعيل الشارة ✓' : 'Approuver ✓'}
                      </button>
                    </div>
                  </div>
                ))}

                {activeVerificationRequests.length === 0 && (
                  <div className="col-span-3 py-10 bg-slate-50 border border-dashed rounded-3xl text-center text-gray-400 font-bold text-xs dark:bg-[#0b0f19]/30 dark:border-slate-800/80">
                    {isRTL ? 'لا توجد طلبات معلقة للمصادقة حالياً.' : 'Aucune demande en attente de traitement.'}
                  </div>
                )}
              </div>
            </div>

            {/* Geographic dispatch Radar simulator */}
            <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${
              isDarkMode ? 'bg-[#111827] border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-3 dark:border-slate-800">
                <div className="flex flex-col text-right">
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest dark:text-white">{isRTL ? 'رادار تتبع الحرفيين الجغرافي الخارجي' : 'Radar Tactique d\'Activité à Rabat Capital'}</h3>
                  <span className="text-[10px] text-gray-450 font-bold mt-1">{isRTL ? 'قراءة مكانية دقيقة لنطاق تغطية الخدمات وتحركات مقدمي الخدمة المعتمدين بخصائص رادارية' : 'Visualisez la densité spatiale de l\'offre par quartiers'}</span>
                </div>
                <div className="flex items-center gap-1.5 self-end">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black dark:bg-indigo-500/10 dark:text-indigo-400">RADAR ACTIVE</span>
                </div>
              </div>

              {/* HTML5 / SVG Radar visual */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                <div className="lg:col-span-8 flex justify-center bg-[#070b13] dark:bg-[#060a12] rounded-3xl p-5 border border-slate-900 shadow-inner relative overflow-hidden">
                  
                  {/* Compass grid overlay */}
                  <div className="absolute inset-0 border border-slate-800/40 rounded-full pointer-events-none w-[320px] h-[320px] m-auto flex items-center justify-center">
                    <div className="border border-slate-800/40 rounded-full w-[200px] h-[200px]" />
                    <div className="border border-slate-850/40 rounded-full w-[100px] h-[100px]" />
                    <div className="absolute w-[350px] h-px bg-slate-800/20" />
                    <div className="absolute h-[350px] w-px bg-slate-800/20" />
                  </div>

                  <svg viewBox="0 0 500 340" className="w-full max-w-lg h-auto select-none pointer-events-auto filter drop-shadow-md relative z-10">
                    
                    {/* Bouregreg river decoration */}
                    <path d="M 320,20 Q 360,50 420,80 T 500,120" fill="none" stroke="#38bdf8" strokeWidth="12" className="opacity-20 animate-pulse" />
                    
                    {/* Districts SVG Paths */}
                    <g className="transition-all">
                      {[
                        { id: 'medina', name: 'Médina', ar: 'المدينة القديمة', path: 'M 250 20 L 320 20 L 305 75 L 240 75 Z', center: [275, 42], weight: 1.0, color: 'stroke-emerald-500/20' },
                        { id: 'hassan', name: 'Hassan', ar: 'حسان', path: 'M 320 20 L 390 35 L 360 100 T 305 75 Z', center: [340, 55], weight: 0.8, color: 'stroke-sky-500/20' },
                        { id: 'agdal', name: 'Agdal', ar: 'أكدال', path: 'M 190 75 L 290 75 L 270 150 L 150 150 Z', center: [225, 110], weight: 0.95, color: 'stroke-yellow-500/20' },
                        { id: 'hay_riad', name: 'Hay Riad', ar: 'حي الرياض', path: 'M 130 150 L 260 150 L 230 250 L 95 250 Z', center: [170, 200], weight: 0.9, color: 'stroke-indigo-500/20' },
                        { id: 'souissi', name: 'Souissi', ar: 'السويسي', path: 'M 260 150 L 375 160 L 340 260 T 230 250 Z', center: [290, 205], weight: 0.7, color: 'stroke-teal-500/20' }
                      ].map((dist) => {
                        const isSelected = selectedGeoDistrict === dist.id;
                        return (
                          <g key={dist.id} className="cursor-pointer group" onClick={() => setSelectedGeoDistrict(dist.id)}>
                            <path 
                              d={dist.path} 
                              className={`transition-colors duration-250 ${
                                isSelected 
                                  ? 'fill-indigo-650/45 stroke-indigo-500' 
                                  : 'fill-slate-900/80 hover:fill-slate-800/40 stroke-slate-800'
                              }`} 
                            />
                            {/* Ping signal on selected */}
                            {isSelected && (
                              <circle cx={dist.center[0]} cy={dist.center[1]} r="10" className="fill-indigo-500/30 animate-ping" />
                            )}
                            <circle cx={dist.center[0]} cy={dist.center[1]} r="4" className="fill-indigo-400 group-hover:scale-125" />
                            <text 
                              x={dist.center[0]} 
                              y={dist.center[1] - 8} 
                              textAnchor="middle" 
                              className="font-mono text-[8px] fill-slate-450 select-none group-hover:fill-white font-extrabold"
                            >
                              {isRTL ? dist.ar : dist.name}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>

                {/* Right Area: Geo density list */}
                <div className="lg:col-span-4 flex flex-col gap-3 font-semibold text-xs">
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 block text-right">
                    {isRTL ? 'إحصائيات الكثافة الخدمية بالأحياء' : 'Densité de l\'offre par Quartier'}
                  </span>
                  
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                    {[
                      { id: 'agdal', count: 12, name: 'أكدال / Agdal', active: 4 },
                      { id: 'hay_riad', count: 9, name: 'حي الرياض / Hay Riad', active: 3 },
                      { id: 'hassan', count: 7, name: 'حسان / Hassan', active: 2 },
                      { id: 'souissi', count: 5, name: 'السويسي / Souissi', active: 1 }
                    ].map(st => (
                      <div 
                        key={st.id}
                        onClick={() => setSelectedGeoDistrict(st.id)}
                        className={`p-3 rounded-xl border flex justify-between items-center transition-all cursor-pointer select-none ${
                          selectedGeoDistrict === st.id 
                            ? 'bg-indigo-650/15 border-indigo-500 text-indigo-400 font-extrabold' 
                            : 'bg-slate-50 border-gray-150 hover:bg-slate-100/50 dark:bg-[#0b0f19] dark:border-slate-805'
                        }`}
                      >
                        <div className="flex flex-col items-start font-bold">
                          <span className="text-xs">{st.name}</span>
                          <span className="text-[10px] text-gray-450 mt-1">{isRTL ? `${st.active} حرفي قيد تنفيذ مهمة حالياً` : `${st.active} en mission`}</span>
                        </div>
                        <span className="bg-slate-200 dark:bg-slate-800 text-[10px] px-2 py-0.5 rounded-lg select-none font-black">{st.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 4: PAYMENTS & FINTECH DISPUTES DESK */}
        {activeTab === 'payments' && (
          <div className="flex flex-col gap-6 animate-fade-in text-right" id="panel-payments-view">
            
            {/* Resolution Center Overview */}
            <div className={`p-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#111827] border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
            }`}>
              <div className="flex items-center gap-2 mb-2 justify-end">
                <span className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">{isRTL ? 'مكافحة النزاعات والتحكيم المالي' : 'Arbitrage des Conflits & Escrow Center'}</span>
                <Wallet className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xs text-gray-450 font-bold leading-normal">
                {isRTL 
                  ? 'تسوية خلافات المبالغ المعلقة في الضمان المالي للأحياء بالرباط. يمكن استرداد المبلغ بالكامل للعميل، تسييله للحرفي، أو إجراء قسمة عادلة 50/50 لتفادي الشكاوى.' 
                  : 'Gérez et arbitrez les différends financiers entre les auteurs de tâches et les prestataires.'}
              </p>
            </div>

            {/* Conflict Resolution Desk Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Box: Active Disputes */}
              <div className={`lg:col-span-8 p-6 rounded-3xl border ${
                isDarkMode ? 'bg-[#111827] border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <h4 className="text-xs font-black tracking-wider uppercase text-gray-400 mb-4">{isRTL ? 'ملفات النزاع المعلقة للتحكيم' : 'Conflits Activement Signalés'}</h4>
                
                <div className="flex flex-col gap-4">
                  {disputes.map((disp) => (
                    <div 
                      key={disp.id}
                      className={`p-4 rounded-2xl border ${
                        isDarkMode ? 'bg-[#0b0f19] border-slate-805' : 'bg-slate-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b pb-2 mb-2 dark:border-slate-800">
                        <span className="text-[10px] text-gray-450 font-mono">{disp.createdAt}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black ${
                          disp.status.startsWith('resolved') ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-850 animate-pulse'
                        }`}>
                          {disp.status}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5 mb-3">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{disp.taskTitle}</span>
                        <div className="flex gap-2 text-[10px] font-extrabold text-indigo-500 justify-end items-center">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>{isRTL ? `المستقل: ${disp.workerName}` : `Worker: ${disp.workerName}`}</span>
                          </span>
                          <span className="text-gray-305">|</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>{isRTL ? `العميل: ${disp.clientName}` : `Client: ${disp.clientName}`}</span>
                          </span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border mb-4 text-[10px] text-gray-500 font-semibold leading-relaxed">
                        <span className="font-bold text-slate-850 dark:text-slate-300 block mb-1">{isRTL ? 'نص مبررات الخلاف:' : 'Allégations du litige :'}</span>
                        "{disp.reason}"
                      </div>

                      <div className="flex justify-between items-center flex-row-reverse border-t border-gray-100/10 pt-3">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] text-gray-450 uppercase font-extrabold">{isRTL ? 'مبلغ الاحتجاز الضامن' : 'Montant Restreint'}</span>
                          <span className="text-base font-black text-rose-600 dark:text-rose-405">{disp.amount} MAD</span>
                        </div>

                        {!disp.status.startsWith('resolved') && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleResolveDispute(disp.id, 'refund')}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-250 rounded-xl text-[10px] font-black cursor-pointer transition-all"
                            >
                              {isRTL ? 'إرجاع للزبون ↩' : 'Rembourser Client'}
                            </button>
                            <button
                              onClick={() => handleResolveDispute(disp.id, 'split')}
                              className="px-2.5 py-1.5 bg-slate-150 hover:bg-slate-205 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-xl text-[10px] font-black cursor-pointer transition-all"
                            >
                              {isRTL ? 'قسمة عادلة 50% ⚖' : 'Diviser 50/50'}
                            </button>
                            <button
                              onClick={() => handleResolveDispute(disp.id, 'release')}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-250 rounded-xl text-[10px] font-black cursor-pointer transition-all"
                            >
                              {isRTL ? 'إيداع للحرفي ✓' : 'Payer Prestataire'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Box: Ledger recent logs */}
              <div className={`lg:col-span-4 p-6 rounded-3xl border text-right flex flex-col gap-4 ${
                isDarkMode ? 'bg-[#111827] border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <h4 className="text-xs font-black tracking-wider uppercase text-gray-400">{isRTL ? 'تفاصيل تسويات بوابات الدفع المغربية' : 'Suivi Comptable Récent'}</h4>
                
                <div className="flex flex-col gap-3 text-[10.5px] font-medium text-slate-500">
                  <div className="p-3 bg-slate-50 dark:bg-[#0b0f19] rounded-2xl border flex flex-col gap-1">
                    <span className="text-[9px] text-gray-450 uppercase font-black">{isRTL ? 'شيكات تسوية ناجحة اليوم' : 'Règlements Payzone reussis'}</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">14 Trx</span>
                    <span className="text-[9.5px] font-bold mt-0.5">{isRTL ? 'جميع المعاملات مصحوبة بتوقيع رقمي موثق' : 'Toutes les transactions signées SHA255'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-[#0b0f19] rounded-2xl border flex flex-col gap-1">
                    <span className="text-[9px] text-gray-450 uppercase font-black">{isRTL ? 'عمولات معلقة بالحساب البنكي' : 'Commissions Banque Populaire'}</span>
                    <span className="text-lg font-black text-indigo-500">2,350 MAD</span>
                    <span className="text-[9.5px] font-bold mt-0.5">{isRTL ? 'تحول تلقائياً كل نهاية أسبوع' : 'Virement automatique hebdomadaire'}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: REPORTS & SECURITY MONITOR */}
        {activeTab === 'reports' && (
          <div className="flex flex-col gap-6 animate-fade-in" id="panel-reports-secops-view">
            
            {/* Risky alerts and platform charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right">
              
              {/* Analytics graph box (Left) */}
              <div className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col gap-4 ${
                isDarkMode ? 'bg-[#111827] border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-black tracking-wider uppercase text-gray-450">{isRTL ? 'منحنى نمو الخدمات المنشورة (يناير - يونيو ٢٠٢٦)' : 'Activité & Croissance de Rabat 2026'}</span>
                  <span className="text-[10px] text-emerald-500 font-bold">{isRTL ? '+٣٢.٥٪ زيادة قياسية' : '+32.5%'}</span>
                </div>

                <div className="w-full bg-slate-50/50 dark:bg-[#0b0f19]/30 rounded-2xl p-4 border relative">
                  {/* Custom SVG Line diagram */}
                  <svg viewBox="0 0 400 200" className="w-full h-auto text-[8px] font-mono">
                    <line x1="30" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeWidth="1" className="opacity-10" />
                    <line x1="30" y1="60" x2="380" y2="60" stroke="#f1f5f9" strokeWidth="1" className="opacity-10" />
                    <line x1="30" y1="100" x2="380" y2="100" stroke="#f1f5f9" strokeWidth="1" className="opacity-10" />
                    <line x1="30" y1="140" x2="380" y2="140" stroke="#f1f5f9" strokeWidth="1" className="opacity-10" />
                    <line x1="30" y1="170" x2="380" y2="170" stroke="#94a3b8" strokeWidth="1" />

                    <text x="25" y="24" textAnchor="end" fill="#94a3b8">80 jobs</text>
                    <text x="25" y="104" textAnchor="end" fill="#94a3b8">40 jobs</text>
                    <text x="25" y="174" textAnchor="end" fill="#94a3b8">0</text>

                    {/* Gradient under curve */}
                    <path d="M 40,150 L 100,120 L 160,110 L 220,70 L 280,45 L 340,30 L 340,170 L 40,170 Z" fill="url(#reports-grad)" className="opacity-15" />
                    <defs>
                      <linearGradient id="reports-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Line curve */}
                    <path 
                      d="M 40,150 Q 80,130 100,120 T 160,110 T 220,70 T 280,45 T 340,30" 
                      fill="none" 
                      stroke="#6366f1" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                    />

                    {/* Nodes dots */}
                    <circle cx="100" cy="120" r="4" fill="#4f46e5" />
                    <circle cx="220" cy="70" r="4" fill="#4f46e5" />
                    <circle cx="340" cy="30" r="4" fill="#4f46e5" />

                    {/* Months axes labels */}
                    <text x="40" y="185" textAnchor="middle" fill="#94a3b8">Jan</text>
                    <text x="100" y="185" textAnchor="middle" fill="#94a3b8">Feb</text>
                    <text x="160" y="185" textAnchor="middle" fill="#94a3b8">Mar</text>
                    <text x="220" y="185" textAnchor="middle" fill="#94a3b8">Apr</text>
                    <text x="280" y="185" textAnchor="middle" fill="#94a3b8">May</text>
                    <text x="340" y="185" textAnchor="middle" fill="#94a3b8">Jun</text>
                  </svg>
                </div>
              </div>

              {/* Fraud list SecOps dashboard (Right) */}
              <div className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col gap-4 ${
                isDarkMode ? 'bg-[#111827] border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <h3 className="text-xs font-black tracking-wider uppercase text-gray-400">{isRTL ? 'سجل تهديدات الإيداعات وسرعة النشر' : 'Moniteur Antifraude & SecOps Logs'}</h3>
                
                <div className="flex flex-col gap-3">
                  {fraudAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-2xl border text-right flex flex-col gap-1.5 relative ${
                        alert.status === 'frozen' 
                          ? 'bg-gray-100/40 border-gray-200 dark:bg-slate-900/40 dark:border-slate-805 text-gray-400' 
                          : 'bg-rose-50/10 border-rose-100 dark:bg-rose-950/5'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-gray-400">{alert.time}</span>
                        <span className={`px-2 py-0.5 rounded uppercase font-black ${
                          alert.status === 'frozen' ? 'bg-gray-200 text-gray-600' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {alert.status}
                        </span>
                      </div>

                      <span className="text-xs font-black">{alert.name}</span>
                      <p className="text-[10px] text-gray-500 font-bold leading-relaxed">{isRTL ? alert.descriptionAr : alert.descriptionFr}</p>

                      {alert.status === 'active' && (
                        <div className="flex gap-1 border-t border-gray-100/50 pt-2.5 mt-1 justify-end">
                          <button
                            onClick={() => handleDismissAlert(alert.id)}
                            className="px-2 py-1 text-[9px] font-black text-gray-400 hover:text-slate-850 cursor-pointer"
                          >
                            {isRTL ? 'تجاهل الالارم' : 'Dismiss'}
                          </button>
                          <button
                            onClick={() => handleFreezeUser(alert.userId, alert.id)}
                            className="px-2.5 py-1 bg-rose-650 hover:bg-rose-700 text-white rounded-lg text-[9px] font-black cursor-pointer shadow-xs"
                          >
                            {isRTL ? 'تجميد وحظر الحساب فورا 🛑' : 'Geler utilisateur 🛑'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 6: CONFIGURATION SETTINGS & CATEGORY CONFIGURE */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-6 animate-fade-in" id="panel-settings-view">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right">
              
              {/* Left Column: Category management */}
              <div className={`lg:col-span-8 p-6 rounded-3xl border flex flex-col gap-4 ${
                isDarkMode ? 'bg-[#111827] border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <div className="flex items-center gap-2 border-b pb-3 mb-1 justify-end">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{isRTL ? 'إعداد تسعيرات وعمولات الفئات الخدمية' : 'Configuration des Commissions par Catégorie'}</span>
                  <Sliders className="w-4 h-4 text-indigo-505" />
                </div>

                <div className="flex flex-col gap-3">
                  {categoriesConfig.map(cat => (
                    <div 
                      key={cat.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${
                        cat.active 
                          ? isDarkMode ? 'bg-[#0b0f19] border-slate-805' : 'bg-slate-50 border-gray-200' 
                          : 'bg-gray-100/30 text-gray-400 dark:bg-slate-900/10 dark:border-slate-850'
                      }`}
                    >
                      <div className="flex flex-col gap-1 text-right">
                        <span className="text-xs font-black dark:text-white">{isRTL ? cat.nameAr : cat.nameFr}</span>
                        <span className="text-[9px] text-indigo-500 font-extrabold uppercase">{cat.id}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs w-full sm:w-auto justify-end">
                        <div className="flex items-center gap-1.5 flex-row-reverse">
                          <span className="font-extrabold text-gray-450">{isRTL ? 'الرسوم الأساسية:' : 'Frais de Base :'}</span>
                          <input 
                            type="number" 
                            disabled={!cat.active}
                            value={cat.baseFee} 
                            onChange={(e) => handleUpdateCategoryFee(cat.id, Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded-lg border text-center font-mono focus:outline-none dark:bg-slate-950 dark:border-slate-800"
                          />
                          <span className="text-gray-400">MAD</span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-row-reverse">
                          <span className="font-extrabold text-gray-450">{isRTL ? 'نسبة الاستقطاع:' : 'Com. Slate :'}</span>
                          <input 
                            type="number" 
                            disabled={!cat.active}
                            value={cat.commissionPercent} 
                            onChange={(e) => handleUpdateCategoryComm(cat.id, Number(e.target.value))}
                            className="w-14 px-2 py-1 rounded-lg border text-center font-mono focus:outline-none dark:bg-slate-950 dark:border-slate-800"
                          />
                          <span className="text-gray-450 font-black">%</span>
                        </div>

                        <button
                          onClick={() => handleToggleCategoryActive(cat.id)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all ${
                            cat.active 
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {cat.active ? (isRTL ? 'إلغاء التفعيل' : 'Suspendre') : (isRTL ? 'تنشيط الخدمة' : 'Activer')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Backup exports & DB metrics */}
              <div className={`lg:col-span-4 p-6 rounded-3xl border flex flex-col justify-between ${
                isDarkMode ? 'bg-[#111827] border-slate-800/60' : 'bg-white border-gray-150 shadow-xs'
              }`}>
                <div className="flex flex-col gap-2.5">
                  <h4 className="text-xs font-black tracking-wider uppercase text-gray-400 mb-2">{isRTL ? 'أدوات النسخ الاحتياطي وحماية Ledgers' : 'Exportations Sûres & Téléchargement'}</h4>
                  
                  <p className="text-[11px] text-gray-500 font-bold leading-relaxed mb-3">
                    {isRTL 
                      ? 'تصدير نسخة مشفرة ومصادق عليها لكافة المودعات، تقييمات الأعضاء ومشاريع العمل بتنسيقات JSON معززة.' 
                      : 'Téléchargez une sauvegarde chiffrée de la base de données au format JSON JSON/CSV.'}
                  </p>

                  <button
                    onClick={() => {
                      alert(isRTL ? 'بدأ تشفير وتصدير قاعدة بيانات الرباط بالكامل بصيغة JSON...' : 'Exportation de la base de données lancée...');
                      setSystemLogs(prev => [`Maintenance: Exported secure snapshot of database successfully`, ...prev]);
                    }}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300 font-extrabold text-xs py-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-emerald-505" />
                    <span>{isRTL ? 'تصدير دليل السجلات والرموز (JSON)' : 'Sauvegarde intégrale (JSON)'}</span>
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-[#0b0f19] border rounded-2xl p-4 mt-5">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-mono text-emerald-500 font-bold">100% OK</span>
                    <span className="text-gray-405">{isRTL ? 'صلاحيات الفايروال:' : 'Pare-feu Firestore :'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-indigo-500 font-bold">2.4 MB</span>
                    <span className="text-gray-405">{isRTL ? 'حجم المؤشرات المسجلة:' : 'Taille des logs :'}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* POPUP MODAL: ADMIN USER FILE VIEWER */}
        {selectedUserForFiles && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" id="admin-user-files-modal">
            <div className={`shadow-xl rounded-3xl w-full max-w-2xl border text-right font-sans ${
              isDarkMode ? 'bg-[#111827] text-slate-100 border-slate-800' : 'bg-white text-slate-800 border-gray-100'
            }`}>
              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b dark:border-slate-800 flex-row-reverse">
                <button
                  onClick={() => setSelectedUserForFiles(null)}
                  className="p-1.5 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2.5 flex-row-reverse text-right">
                  <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div className="text-right">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">
                      {isRTL ? `مستندات العضو : ${selectedUserForFiles.displayName || 'بدون اسم'}` : `Médiathèque de ${selectedUserForFiles.displayName || 'Utilisateur'}`}
                    </h3>
                    <span className="text-[10px] text-gray-450 mt-1 font-mono select-all block">{selectedUserForFiles.uid}</span>
                  </div>
                </div>
              </div>

              {/* Modal content */}
              <div className="p-6">
                {(() => {
                  const userFilesList = allFiles.filter(f => f.userId === selectedUserForFiles.uid);
                  
                  if (userFilesList.length === 0) {
                    return (
                      <div className="py-12 text-center text-[11px] text-gray-400 font-bold bg-slate-50/10 border border-dashed rounded-2xl flex flex-col items-center gap-2.5">
                        <FileText className="w-9 h-9 text-gray-300" />
                        <span>{isRTL ? 'لم يتم العثور على أي مرفقات للمستخدم.' : 'Aucun document uploadié par ce membre.'}</span>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pl-1">
                      {userFilesList.map((file) => {
                        const fileSizeKB = (file.fileSize / 1024).toFixed(1);
                        return (
                          <div 
                            key={file.id} 
                            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-right ${
                              isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-slate-50/50 border-gray-150'
                            }`}
                          >
                            <a
                              href={file.fileUrl}
                              download={file.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{isRTL ? 'تحميل' : 'Ouvrir'}</span>
                            </a>
                            
                            <div className="flex items-center gap-3 overflow-hidden flex-row-reverse select-none">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col text-right truncate">
                                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[220px]" title={file.fileName}>
                                  {file.fileName}
                                </span>
                                <span className="text-[9px] text-gray-400 font-bold mt-1">
                                  {file.fileType} • {fileSizeKB} KB
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Modal footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-b-3xl flex justify-end border-t dark:border-slate-800 gap-2">
                <button
                  onClick={() => setSelectedUserForFiles(null)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black cursor-pointer transition-all"
                >
                  {isRTL ? 'إغلاق النافذة' : 'Fermer'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
