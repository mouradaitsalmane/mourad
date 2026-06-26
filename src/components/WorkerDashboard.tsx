import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Task, UserProfile, Offer, Review } from '../types';
import { LanguageKey, SERVICE_CATEGORIES, RABAT_NEIGHBORHOODS } from '../data/rabatData';
import { 
  subscribeToUserProfile, 
  subscribeToWithdrawals, 
  updateProfileService, 
  requestWithdrawalService 
} from '../services/userService';
import { 
  subscribeToTasks, 
  subscribeToTaskOffers, 
  createBidService 
} from '../services/taskService';
import { subscribeToReceivedReviews } from '../services/reviewService';
import { subscribeToRoomMessages, sendMessageService } from '../services/chatService';
import { 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Inbox, 
  Map, 
  Filter, 
  Bell, 
  Wallet, 
  Star, 
  Sparkles, 
  Plus, 
  Send, 
  X, 
  Check, 
  MapPin, 
  Search, 
  Menu, 
  Settings, 
  Activity, 
  CreditCard, 
  Banknote, 
  Calendar, 
  Landmark, 
  Clock, 
  MessageSquare, 
  MessageCircle, 
  Sliders, 
  HelpCircle, 
  Power,
  ChevronLeft,
  ChevronUp,
  AlertCircle,
  Award,
  Users,
  SlidersHorizontal,
  Bookmark,
  Trash2,
  Phone,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProfileCompletionStore } from '../store/profileCompletionStore';
import RabatMap from './RabatMap';
import TaskerDashboard from '../pages/dashboard/TaskerDashboard';
import WorkerDashboardIncomeTab from './dashboard/WorkerDashboardIncomeTab';
import WorkerDashboardProfileTab from './dashboard/WorkerDashboardProfileTab';
import WorkerDashboardChatsTab from './dashboard/WorkerDashboardChatsTab';
import WorkerDashboardJobsTab from './dashboard/WorkerDashboardJobsTab';
import WorkerDashboardAssignedTab from './dashboard/WorkerDashboardAssignedTab';

interface WorkerDashboardProps {
  user: any;
  userProfile: UserProfile | null;
  lang: LanguageKey;
  onSelectTask: (task: Task) => void;
  onOpenSettings: () => void;
  onToggleToClient?: () => void; // Callback to toggle back to Client mode
  onViewChange?: (view: string) => void;
}

interface ChatRoom {
  id: string; // taskId_workerId
  taskTitle: string;
  taskId: string;
  otherPartyId: string;
  otherPartyName: string;
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

interface WithdrawalRecord {
  id: string;
  amount: number;
  bankName: string;
  rib: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: any;
}

export default function WorkerDashboard({
  user,
  userProfile,
  lang,
  onSelectTask,
  onOpenSettings,
  onToggleToClient,
  onViewChange
}: WorkerDashboardProps) {
  const isRTL = lang === 'ar';

  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL path
  let activeTab: 'dashboard' | 'income' | 'jobs' | 'assigned' | 'chats' | 'profile' | 'notifications' | 'help' = 'dashboard';
  if (location.pathname === '/tasker/earnings') {
    activeTab = 'income';
  } else if (location.pathname === '/tasker/requests') {
    activeTab = 'jobs';
  } else if (location.pathname === '/tasker/jobs') {
    activeTab = 'assigned';
  } else if (location.pathname.startsWith('/tasker/chats')) {
    activeTab = 'chats';
  } else if (location.pathname.startsWith('/tasker/profile')) {
    activeTab = 'profile';
  } else if (location.pathname.startsWith('/tasker/notifications')) {
    activeTab = 'notifications';
  } else if (location.pathname.startsWith('/tasker/help')) {
    activeTab = 'help';
  }

  const handleTabClick = (tabId: string) => {
    if (tabId === 'dashboard') {
      navigate('/tasker/dashboard');
    } else if (tabId === 'income') {
      navigate('/tasker/earnings');
    } else if (tabId === 'jobs') {
      navigate('/tasker/requests');
    } else if (tabId === 'assigned') {
      navigate('/tasker/jobs');
    } else if (tabId === 'chats') {
      navigate('/tasker/chats');
    } else if (tabId === 'profile') {
      navigate('/tasker/profile');
    } else if (tabId === 'notifications') {
      navigate('/tasker/notifications');
    } else if (tabId === 'help') {
      navigate('/tasker/help');
    }
  };

  const setActiveTab = (tabId: 'dashboard' | 'income' | 'jobs' | 'assigned' | 'chats' | 'profile' | 'notifications' | 'help') => {
    handleTabClick(tabId);
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real-time worker profile state loaded from firestore (syncs online status etc)
  const [myProfile, setMyProfile] = useState<UserProfile | null>(userProfile);
  const [isOnline, setIsOnline] = useState<boolean>(userProfile?.isOnline ?? true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Firestore collections states
  const [openTasks, setOpenTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [loadingAssigned, setLoadingAssigned] = useState(true);

  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loadingCompleted, setLoadingCompleted] = useState(true);

  // Offers submitted by this worker (by taskId as key)
  const [myOffers, setMyOffers] = useState<Record<string, Offer>>({});
  const [loadingOffers, setLoadingOffers] = useState(true);

  // Reviews earned by this worker
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Wallet and withdrawal history
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRecord[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(200);
  const [selectedBank, setSelectedBank] = useState<string>('cih');
  const [ribInput, setRibInput] = useState<string>('');
  const [withdrawingInProgress, setWithdrawingInProgress] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Job Exploration states
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [jobSearchQuery, setJobSearchQuery] = useState<string>('');
  const [showMap, setShowMap] = useState<boolean>(true);

  // Selected Task Detail modal within dashboard for quick pitches
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);
  const [pitchAmount, setPitchAmount] = useState<number>(200);
  const [pitchMessage, setPitchMessage] = useState<string>('');
  const [placingBidInProgress, setPlacingBidInProgress] = useState(false);
  const [bidSuccessMessage, setBidSuccessMessage] = useState<string | null>(null);

  // Chat Rooms & Instant messages sync
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [notificationsList, setNotificationsList] = useState<any[]>(() => {
    const defaultNotifs = [
      {
        id: 'wn1',
        titleAr: 'مرحباً بك كشريك حرفي في الرباط! 🛠️',
        titleFr: 'Bienvenue en tant que prestataire ! 🛠️',
        descAr: 'تصفح خريطة المهام الشاغرة الآن وقدم عروضك مباشرة للعملاء لبدء العمل والربح.',
        descFr: 'Consultez la carte des missions disponibles et envoyez des offres pour commencer à gagner.',
        timeAr: 'منذ دقيقة',
        timeFr: 'Il y a 1 min',
        read: false,
        type: 'welcome'
      },
      {
        id: 'wn2',
        titleAr: 'شروط الدفع الآمن ونظام الضمان (Escrow) 💳',
        titleFr: 'Règles de paiement sécurisé (Escrow) 💳',
        descAr: 'عند اختيار عرضك، يتم تأمين ميزانية المهمة في المنصة. ابدأ بالعمل فوراً بمجرد الحجز لضمان مستحقاتك.',
        descFr: 'Dès que votre offre est acceptée, le budget est bloqué. Travaillez l\'esprit tranquille !',
        timeAr: 'منذ ساعتين',
        timeFr: 'Il y a 2h',
        read: false,
        type: 'security'
      },
      {
        id: 'wn3',
        titleAr: 'الحصول على شارة التحقق PRO 🌟',
        titleFr: 'Comment obtenir le badge PRO ? 🌟',
        descAr: 'قم بملء ملفك المهني وأرفق مهاراتك الدقيقة في الإعدادات لمساعدتنا في ترقية حسابك لشريك PRO معتمد.',
        descFr: 'Complétez votre profil pour obtenir le badge PRO et doubler vos chances d\'être sélectionné.',
        timeAr: 'منذ يوم',
        timeFr: 'Hier',
        read: true,
        type: 'announcement'
      }
    ];
    const saved = localStorage.getItem('rabattasker_worker_notifications');
    return saved ? JSON.parse(saved) : defaultNotifs;
  });

  const saveNotifications = (list: any[]) => {
    setNotificationsList(list);
    localStorage.setItem('rabattasker_worker_notifications', JSON.stringify(list));
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notificationsList.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notificationsList.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const handleDeleteNotification = (id: string) => {
    const updated = notificationsList.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [supportCategory, setSupportCategory] = useState('general');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Guards to prevent double clicks and duplicate operations
  const withdrawalLockRef = useRef(false);
  const bidSubmitLockRef = useRef(false);
  const profileLockRef = useRef(false);

  // Editable profile information
  const [editBio, setEditBio] = useState<string>(userProfile?.bio || '');
  const [editLocation, setEditLocation] = useState<string>(userProfile?.location || 'agdal');
  const [editMinRate, setEditMinRate] = useState<number>(100);
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessAlert, setProfileSuccessAlert] = useState(false);

  // Rabat banks
  const MAROC_BANKS = [
    { id: 'cih', nameAr: 'بنك العقاري والسياحي (CIH Bank)', nameFr: 'CIH Bank' },
    { id: 'attijari', nameAr: 'التجاري وفا بنك (Attijariwafa Bank)', nameFr: 'Attijariwafa Bank' },
    { id: 'chaabi', nameAr: 'البنك الشعبي (Banque Populaire)', nameFr: 'Banque Populaire' },
    { id: 'bmce', nameAr: 'بنك إفريقيا (Bank of Africa)', nameFr: 'Bank of Africa / BMCE' },
    { id: 'bmci', nameAr: 'البنك المغربي للتجارة والصناعة (BMCI)', nameFr: 'BMCI' }
  ];

  // 1. Sync current worker profile metadata in real-time
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserProfile(user.uid, (data) => {
      setMyProfile(data);
      setIsOnline(data.isOnline ?? true);
      if (data.bio) setEditBio(data.bio);
      if (data.location) setEditLocation(data.location);
      if (data.minimumRate) setEditMinRate(data.minimumRate);
      if (data.skills) setEditSkills(data.skills);
    });
    return () => unsub();
  }, [user]);

  // 2. Sync all Tasks in the system
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTasks((tasksList) => {
      const openList: Task[] = [];
      const assignedList: Task[] = [];
      const completedList: Task[] = [];

      tasksList.forEach((t) => {
        if (t.status === 'open' || t.status === 'held') {
          openList.push(t);
        } else if (t.status === 'assigned' && t.taskerId === user?.uid) {
          assignedList.push(t);
        } else if (t.status === 'completed' && t.taskerId === user?.uid) {
          completedList.push(t);
        }
      });

      // Sort lists by descending creation time
      const sortByTime = (a: Task, b: Task) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      openList.sort(sortByTime);
      assignedList.sort(sortByTime);
      completedList.sort(sortByTime);

      setOpenTasks(openList);
      setAssignedTasks(assignedList);
      setCompletedTasks(completedList);

      setLoadingTasks(false);
      setLoadingAssigned(false);
      setLoadingCompleted(false);

      // Once tasks are loaded, set up real-time listener for worker's submitted offers
      if (user) {
        tasksList.forEach((t) => {
          subscribeToTaskOffers(t.id, (offersList) => {
            const myOfferForTask = offersList.find(o => o.taskerId === user.uid);
            if (myOfferForTask) {
              setMyOffers(prev => ({
                ...prev,
                [t.id]: myOfferForTask
              }));
            }
          });
        });
        setLoadingOffers(false);
      }
    }, (err) => {
      console.error("Failed to load tasks database", err);
      setLoadingTasks(false);
      setLoadingAssigned(false);
      setLoadingCompleted(false);
    });

    return () => unsub();
  }, [user]);

  // 3. Load reviews left for this worker
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToReceivedReviews(user.uid, (rList) => {
      setMyReviews(rList);
      setLoadingReviews(false);
    }, (err) => {
      console.error("Failed to fetch reviews", err);
      setLoadingReviews(false);
    });
    return () => unsub();
  }, [user]);

  // 4. Withdrawal transaction history listener
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToWithdrawals(user.uid, (wList) => {
      setWithdrawalHistory(wList);
    });
    return () => unsub();
  }, [user]);

  // 5. Chat inbox rooms listener
  useEffect(() => {
    if (!user) return;
    setLoadingChats(true);

    const unsub = subscribeToTasks((tasksList) => {
      const rooms: ChatRoom[] = [];

      tasksList.forEach((taskObj) => {
        // Current worker is assigned OR has an offer submitted
        const hasMyOffer = myOffers[taskObj.id];
        const isAssignedToMe = taskObj.taskerId === user.uid;

        if (isAssignedToMe || hasMyOffer) {
          rooms.push({
            id: `${taskObj.id}_${user.uid}`,
            taskId: taskObj.id,
            taskTitle: taskObj.title,
            otherPartyId: taskObj.posterId,
            otherPartyName: taskObj.posterName
          });
        }
      });

      // Deduplicate rooms list
      const seen = new Set<string>();
      const deduped = rooms.filter(r => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });

      setChatRooms(deduped);
      setLoadingChats(false);
    }, (err) => {
      console.error("Chats fetch failed", err);
      setLoadingChats(false);
    });

    return () => unsub();
  }, [user, myOffers]);

  // 6. Live Chat messages subscriber
  useEffect(() => {
    if (!activeRoom) return;
    const unsub = subscribeToRoomMessages(activeRoom.id, (list) => {
      setMessages(list);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });
    return () => unsub();
  }, [activeRoom]);

  // Submit chat message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeRoom || !newMessageText.trim()) return;

    const currentText = newMessageText.trim();
    try {
      setNewMessageText('');
      await sendMessageService({
        roomId: activeRoom.id,
        senderId: user.uid,
        senderName: myProfile?.displayName || user.displayName || 'الحرفي المحترف',
        text: currentText
      });
    } catch (err: any) {
      console.error("Failed to post message securely:", err);
      alert(err.message || 'Error occurred sending message.');
    }
  };

  // Availability switch toggle
  const handleToggleOnlineStatus = async () => {
    if (!user) return;
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    try {
      await updateProfileService({ userUid: user.uid, isOnline: nextStatus } as any);
    } catch (err) {
      console.error("Failed to sync online status with Firestore", err);
    }
  };

  // Submit Bid/Offer to Task
  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bidSubmitLockRef.current || placingBidInProgress) return;
    if (!user || !focusedTask) return;

    // 1. Bid protection: Block bids if profile completion < 80%
    let score = myProfile?.profileCompletion ?? 0;
    if (!score) {
      let calculated = 0;
      if (myProfile?.photoURL && myProfile?.photoURL.trim() !== '') calculated += 20;
      if (myProfile?.phoneVerified === true) calculated += 20;
      if (myProfile?.dob || myProfile?.hasDob === true) calculated += 10;
      if (myProfile?.location || myProfile?.hasAddress === true) calculated += 10;
      if (myProfile?.skills && myProfile.skills.length > 0) calculated += 10;
      if (myProfile?.bio && myProfile?.headline) calculated += 10;
      if (myProfile?.verificationStatus === 'approved' || myProfile?.identityVerified === true || myProfile?.isVerifiedTasker === true) calculated += 10;
      if (myProfile?.hasBanking === true) calculated += 10;
      score = Math.min(calculated, 100);
    }

    if (score < 80) {
      const msgAr = `عذراً! لا يمكنك تقديم العروض حتى تكتمل نسبة توثيق وتعبئة ملفك الشخصي إلى 80٪ على الأقل (نسبتك الحالية: ${score}٪). يرجى إتمام الخطوات المتبقية الآن.`;
      const msgFr = `Action requise! Vous ne pouvez pas soumettre d'offres tant que votre profil n'est pas complété à au moins 80% (votre niveau actuel: ${score}%). Veuillez compléter vos étapes maintenant.`;
      alert(isRTL ? msgAr : msgFr);
      
      // Open the onboarding modal at step 1
      useProfileCompletionStore.getState().openCompletionModal(1);
      return;
    }

    if (pitchAmount <= 40) {
      alert(isRTL ? 'الرجاء تحديد عرض سعر مناسب لا يقل عن 50 درهم مغربي.' : 'Le budget minimal pour une offre est de 50 MAD.');
      return;
    }
    if (!pitchMessage.trim()) {
      alert(isRTL ? 'الرجاء إدخال رسالة قصيرة لإقناع صاحب الطلب بجودة عملك.' : 'Veuillez saisir un message pour présenter votre offre.');
      return;
    }

    try {
      bidSubmitLockRef.current = true;
      setPlacingBidInProgress(true);
      const secureBidData = {
        taskId: focusedTask.id,
        taskerId: user.uid,
        workerName: myProfile?.displayName || user.displayName || 'حرفي خبير بالرباط',
        taskerName: myProfile?.displayName || user.displayName || 'حرفي خبير بالرباط',
        taskerPhoto: user.photoURL || '',
        amount: Number(pitchAmount),
        message: pitchMessage.trim(),
        status: 'pending'
      };

      await createBidService(secureBidData, user.uid);

      setBidSuccessMessage(isRTL ? 'تهانينا! تم إرسال عرضك الفني بنجاح لصاحب المهمة. تواصل معه للاتفاق!' : 'Votre proposition de tarif a été transmise avec succès ! Nous vous notifierons.');
      setPitchMessage('');
      
      setTimeout(() => {
        setBidSuccessMessage(null);
        setFocusedTask(null);
      }, 3550);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error placing bid. Please try again.');
    } finally {
      setPlacingBidInProgress(false);
      bidSubmitLockRef.current = false;
    }
  };

  // Worker Profile & Specialties modification
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileLockRef.current || savingProfile) return;
    if (!user) return;

    try {
      profileLockRef.current = true;
      setSavingProfile(true);
      await updateProfileService({
        userUid: user.uid,
        bio: editBio,
        location: editLocation,
        minimumRate: Number(editMinRate),
        skills: editSkills
      } as any);
      setProfileSuccessAlert(true);
      setTimeout(() => setProfileSuccessAlert(false), 4000);
    } catch (err: any) {
      console.error("Failed to save profile", err);
      alert(err.message || 'Error occurred saving profile.');
    } finally {
      setSavingProfile(false);
      profileLockRef.current = false;
    }
  };

  // Skills checkbox toggling helper
  const handleToggleSkill = (skillId: string) => {
    const updated = editSkills.includes(skillId)
      ? editSkills.filter(s => s !== skillId)
      : [...editSkills, skillId];
    setEditSkills(updated);
  };

  // Withdraw Earnings from wallet
  const handleWithdrawFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawalLockRef.current || withdrawingInProgress) return;
    if (!user) return;

    const availableBalance = completedTasks.reduce((sum, t) => sum + t.budget, 0);
    if (withdrawalAmount <= 100) {
      alert(isRTL ? 'الحد الأدنى لطلب السحب هو 100 درهم مغربي.' : 'Le montant minimum de retrait est de 100 MAD.');
      return;
    }
    if (withdrawalAmount > availableBalance) {
      alert(isRTL ? 'الرصيد المتاح في محفظتك غير كافٍ لإتمام عملية السحب المطلوبة!' : 'Le solde de votre portefeuille est insuffisant !');
      return;
    }
    if (ribInput.trim().length < 16) {
      alert(isRTL ? 'يرجى إدخال رقم الحساب البنكي المكون من 16 أو 24 رقماً (RIB) بشكل صحيح.' : 'Veuillez saisir un RIB marocain valide.');
      return;
    }

    try {
      withdrawalLockRef.current = true;
      setWithdrawingInProgress(true);
      await requestWithdrawalService({
        userId: user.uid,
        amount: Number(withdrawalAmount),
        bankName: selectedBank,
        bankAccount: ribInput.trim(),
        workerName: myProfile?.displayName || user.displayName
      } as any);

      setWithdrawSuccess(true);
      setRibInput('');
      
      setTimeout(() => setWithdrawSuccess(false), 4500);
    } catch (err: any) {
      console.error(err);
      alert(isRTL ? `فشل طلب السحب: ${err.message}` : `Échec de virement: ${err.message}`);
    } finally {
      setWithdrawingInProgress(false);
      withdrawalLockRef.current = false;
    }
  };

  // Filter tasks based on Explorer Search inputs
  const filteredAvailableTasks = openTasks.filter(task => {
    // Search keyword
    const matchesSearch = task.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(jobSearchQuery.toLowerCase());
    
    // Category match
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;

    // Rabat sector match
    const matchesNeighborhood = selectedNeighborhood === 'all' || (() => {
      const sectorObj = RABAT_NEIGHBORHOODS.find(n => n.id === selectedNeighborhood);
      if (!sectorObj) return true;
      return task.location === sectorObj.ar || task.location === sectorObj.fr;
    })();

    return matchesSearch && matchesCategory && matchesNeighborhood;
  });

  // Calculate detailed financial KPIs for the earnings tab
  const totalEarnedAmount = completedTasks.reduce((sum, t) => sum + t.budget, 0);
  const pendingEscrowAmount = assignedTasks.reduce((sum, t) => sum + t.budget, 0);

  // Quick Action category renderer helper
  const getCategoryTheme = (catId: string) => {
    const defaultIcon = <Sliders className="w-5 h-5 text-indigo-505" />;
    const found = SERVICE_CATEGORIES.find(c => c.id === catId);
    if (!found) return { name: catId, icon: defaultIcon, color: 'bg-indigo-50 text-indigo-700' };

    switch (catId) {
      case 'cleaning': return { name: isRTL ? found.ar : found.fr, icon: <Sparkles className="w-5 h-5 text-blue-500" />, color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'plumbing': return { name: isRTL ? found.ar : found.fr, icon: <Activity className="w-5 h-5 text-teal-500" />, color: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'electricity': return { name: isRTL ? found.ar : found.fr, icon: <Power className="w-5 h-5 text-amber-500" />, color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'moving': return { name: isRTL ? found.ar : found.fr, icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'repairs': return { name: isRTL ? found.ar : found.fr, icon: <Sliders className="w-5 h-5 text-orange-500" />, color: 'bg-orange-50 text-orange-700 border-orange-200' };
      default: return { name: isRTL ? found.ar : found.fr, icon: defaultIcon, color: 'bg-indigo-50 text-indigo-750 border-indigo-200' };
    }
  };

  const sidebarItems = [
    { id: 'dashboard', labelAr: 'لوحة القيادة والمؤشرات', labelFr: 'Tableau de bord', icon: LayoutGrid },
    { id: 'jobs', labelAr: 'خريطة المهام الشاغرة', labelFr: 'Trouver des Missions', icon: Map },
    { id: 'assigned', labelAr: 'مهامي المكلف بها', labelFr: 'Prestations en cours', icon: CheckCircle2 },
    { id: 'chats', labelAr: 'الرسائل والمحادثات', labelFr: 'Messages', icon: MessageSquare },
    { id: 'notifications', labelAr: 'التنبيهات والإشعارات', labelFr: 'Notifications', icon: Bell },
    { id: 'help', labelAr: 'مركز المساعدة والدعم', labelFr: 'Help & Support', icon: HelpCircle },
    { id: 'income', labelAr: 'المحفظة وسحب الأرباح', labelFr: 'Gains & Versements', icon: Wallet },
    { id: 'profile', labelAr: 'الملف المهني وإعداد المهارات', labelFr: 'Profil & Compétences', icon: Sliders }
  ];

  const activeSidebarItem = sidebarItems.find(item => item.id === activeTab);
  const isVerified = !!myProfile?.isVerifiedTasker;
  const roomsListLength = chatRooms.length;

  return (
    <div className="min-h-screen bg-slate-50 w-full flex font-sans text-slate-800 transition-colors" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* 1. DESKTOP SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 border-r border-slate-800 z-30 shrink-0 hidden md:flex">
        {/* Profile Card Header */}
        <div className="p-6 border-b border-slate-800 space-y-4">
          <div className="flex items-center gap-3.5 flex-row-reverse">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-lg border border-slate-750 select-none uppercase">
              {(myProfile?.displayName || user?.displayName || user?.email || 'T').charAt(0)}
            </div>
            <div className="flex-1 min-w-0 text-right">
              <h3 className="font-extrabold text-sm text-slate-200 truncate leading-snug">
                {myProfile?.displayName || user?.displayName || 'Tasker'}
              </h3>
              <div className="flex items-center gap-1 mt-0.5 justify-end">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="text-xs text-slate-400 font-extrabold">
                  {myProfile?.rating ? myProfile.rating.toFixed(1) : '5.0'}
                </span>
                {isVerified && (
                  <span className="text-[10px] bg-sky-500/25 text-sky-400 font-bold px-2 py-0.5 rounded ml-1.5 flex items-center gap-0.5">
                    <ShieldCheck size={10} />
                    <span>PRO</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-colors cursor-pointer select-none text-right flex-row-reverse ${
                  isActive 
                    ? 'bg-slate-850 text-sky-400 border border-slate-800 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-sky-400' : 'text-slate-450'} />
                <span className="flex-1 truncate">{isRTL ? item.labelAr : item.labelFr}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex-row-reverse">
            <span className="text-[10px] text-slate-400 font-black">{isRTL ? 'متاح لتلقي العروض' : 'Disponible'}</span>
            <button
              onClick={handleToggleOnlineStatus}
              className={`p-1 px-3 rounded-md text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Power className="w-3 h-3" />
              <span>{isOnline ? (isRTL ? 'نشط' : 'Oui') : (isRTL ? 'مغلق' : 'Non')}</span>
            </button>
          </div>

          {onToggleToClient && (
            <button
              onClick={onToggleToClient}
              className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-800 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-sky-404 shrink-0" />
              <span>{isRTL ? 'التبديل إلى لوحة الزبون' : 'Espace Client'}</span>
            </button>
          )}
        </div>
      </aside>

      {/* 2. MOBILE OVERLAY DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 w-72 bg-slate-900 text-slate-105 z-50 flex flex-col md:hidden border-r border-slate-800"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between flex-row-reverse animate-fade-in">
                <span className="font-sans font-black text-sm text-slate-200">Morocco Tasker</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 px-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-md cursor-pointer"><X size={16} /></button>
              </div>

              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {sidebarItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-colors cursor-pointer select-none text-right flex-row-reverse ${
                        isActive 
                          ? 'bg-slate-850 text-sky-404 border border-slate-650/40 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-sky-404' : 'text-slate-400'} />
                      <span className="flex-1 truncate">{isRTL ? item.labelAr : item.labelFr}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-800 space-y-4">
                {onToggleToClient && (
                  <button
                    onClick={onToggleToClient}
                    className="w-full py-3 bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4 text-sky-405 shrink-0" />
                    <span>{isRTL ? 'التبديل لوحة الزبون' : 'Espace Client'}</span>
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. MAIN WORKSPACE VIEW FRAME */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto bg-slate-50">
        
        {/* TOP BAR HEADER */}
        <header className="bg-white border-b border-gray-150 h-16 px-6 sticky top-0 z-20 flex items-center justify-between shadow-xs">
          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="md:hidden p-2 text-slate-505 hover:text-slate-800 hover:bg-slate-55 rounded-xl cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-800 rounded-full font-bold text-xs animate-fade-in">
              <MapPin size={12} className="text-sky-600" />
              <span>Rabat, {editLocation || (isRTL ? 'أكدال' : 'Agdal')}</span>
            </div>
          </div>

          {/* Center tab title display */}
          <div className="hidden md:flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-800 font-sans tracking-tight">
              {isRTL ? activeSidebarItem?.labelAr : activeSidebarItem?.labelFr}
            </span>
          </div>

          {/* Right Actions Block */}
          <div className="flex items-center gap-3">
            {user && (user.uid === 'sDCii92rV7fKTvvDgWTQCLKxwJr1' || user.email === 'cryptomourad1992@gmail.com' || myProfile?.role === 'admin' || myProfile?.isSuperAdmin || userProfile?.role === 'admin') && (
              <button
                onClick={() => onViewChange?.('admin')}
                className="bg-purple-650 hover:bg-purple-750 text-white text-[11px] px-3.5 py-2 rounded-xl font-black flex items-center gap-1.5 shadow-md cursor-pointer animate-pulse shrink-0 border border-purple-500 hover:scale-102 active:scale-95 transition-all"
              >
                👑 <span>{isRTL ? 'بوابة الإشراف الإدارية ⚡' : 'Portal Admin General ⚡'}</span>
              </button>
            )}

            {onToggleToClient && (
              <button 
                onClick={onToggleToClient} 
                className="hidden lg:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>{isRTL ? 'نشر مهمة جديدة' : 'Créer une tâche'}</span>
              </button>
            )}

            <button 
              onClick={() => setActiveTab('chats')} 
              className="p-2 text-slate-400 hover:text-slate-655 bg-slate-50 hover:bg-slate-100 rounded-xl relative cursor-pointer"
            >
              <MessageCircle size={18} />
              {roomsListLength > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {roomsListLength}
                </span>
              )}
            </button>

            <button 
              onClick={onOpenSettings} 
              className="p-1 rounded-full border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
              aria-label="Settings"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-gray-200 text-slate-700 font-black text-xs flex items-center justify-center uppercase">
                {(myProfile?.displayName || user?.displayName || user?.email || 'T').charAt(0)}
              </div>
            </button>
          </div>
        </header>

        {/* MAIN BODY CANVAS CONTENT */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">

          {/* A. PREMIUM DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in" id="worker-tab-dashboard">
              <TaskerDashboard 
                user={user}
                userProfile={myProfile}
                lang={lang}
                onSelectTask={onSelectTask}
                onOpenSettings={onOpenSettings}
                onToggleToClient={onToggleToClient}
              />
            </div>
          )}

          {/* B. INCOME TAB: WALLET & TRANSFERS */}
          {activeTab === 'income' && (
            <WorkerDashboardIncomeTab 
              lang={lang}
              isRTL={isRTL}
              completedTasks={completedTasks}
              assignedTasks={assignedTasks}
              myReviews={myReviews}
              myProfile={myProfile}
              withdrawalHistory={withdrawalHistory}
              withdrawalAmount={withdrawalAmount}
              selectedBank={selectedBank}
              ribInput={ribInput}
              withdrawSuccess={withdrawSuccess}
              withdrawingInProgress={withdrawingInProgress}
              totalEarnedAmount={totalEarnedAmount}
              pendingEscrowAmount={pendingEscrowAmount}
              setWithdrawalAmount={setWithdrawalAmount}
              setSelectedBank={setSelectedBank}
              setRibInput={setRibInput}
              handleWithdrawFunds={handleWithdrawFunds}
            />
          )}

          {/* C. EXPLORE MAP JOBS TAB */}
          {activeTab === 'jobs' && (
            <WorkerDashboardJobsTab 
              lang={lang}
              isRTL={isRTL}
              jobSearchQuery={jobSearchQuery}
              setJobSearchQuery={setJobSearchQuery}
              selectedNeighborhood={selectedNeighborhood}
              setSelectedNeighborhood={setSelectedNeighborhood}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              showMap={showMap}
              setShowMap={setShowMap}
              filteredAvailableTasks={filteredAvailableTasks}
              onSelectTask={onSelectTask}
              getCategoryTheme={getCategoryTheme}
              rabatNeighborhoods={RABAT_NEIGHBORHOODS}
              serviceCategories={SERVICE_CATEGORIES}
            />
          )}

          {/* D. ASSIGNED PRESTATIONS TAB */}
          {activeTab === 'assigned' && (
            <WorkerDashboardAssignedTab 
              lang={lang}
              isRTL={isRTL}
              loadingAssigned={loadingAssigned}
              loadingCompleted={loadingCompleted}
              assignedTasks={assignedTasks}
              completedTasks={completedTasks}
              myReviews={myReviews}
              onSelectTask={onSelectTask}
            />
          )}

          {/* E. CHAT DISCUSSIONS TAB */}
          {activeTab === 'chats' && (
            <WorkerDashboardChatsTab 
              lang={lang}
              isRTL={isRTL}
              chatRooms={chatRooms}
              loadingChats={loadingChats}
              activeRoom={activeRoom}
              setActiveRoom={setActiveRoom}
              messages={messages}
              newMessageText={newMessageText}
              setNewMessageText={setNewMessageText}
              handleSendChatMessage={handleSendChatMessage}
              user={user}
              chatEndRef={chatEndRef}
            />
          )}

          {/* F. PROFILE EDIT & SKILLS MATRIX TAB */}
          {activeTab === 'profile' && (
            <WorkerDashboardProfileTab 
              lang={lang}
              isRTL={isRTL}
              editBio={editBio}
              setEditBio={setEditBio}
              editLocation={editLocation}
              setEditLocation={setEditLocation}
              editMinRate={editMinRate}
              setEditMinRate={setEditMinRate}
              editSkills={editSkills}
              handleToggleSkill={handleToggleSkill}
              handleUpdateProfile={handleUpdateProfile}
              profileSuccessAlert={profileSuccessAlert}
              savingProfile={savingProfile}
              rabatNeighborhoods={RABAT_NEIGHBORHOODS}
              serviceCategories={SERVICE_CATEGORIES}
            />
          )}

          {/* G. NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="flex flex-col gap-6 animate-fade-in" id="worker-tab-notifications">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 border-gray-200/60 text-right gap-4">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-black text-slate-900">{isRTL ? 'مركز التنبيهات والإشعارات للحرفي' : 'Notifications du Prestataire'}</h3>
                  <span className="text-[10px] text-gray-450 font-bold">
                    {isRTL ? 'تابع العروض المقبولة، رسائل العملاء الجديدة والفرص المناسبة لمهاراتك.' : 'Suivez l\'activité de vos offres de prix, messages et alertes de sécurité.'}
                  </span>
                </div>
                {notificationsList.some(n => !n.read) && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer self-start sm:self-center"
                  >
                    {isRTL ? 'تعيين الكل كمقروء' : 'Tout marquer comme lu'}
                  </button>
                )}
              </div>

              {notificationsList.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-gray-150 flex flex-col items-center gap-3 justify-center">
                  <div className="p-4 bg-gray-50 text-gray-300 rounded-2xl">
                    <Bell className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-black text-slate-850">{isRTL ? 'لا توجد تنبيهات جديدة' : 'Aucune notification'}</span>
                  <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed font-bold">
                    {isRTL ? 'كل شيء محدث! سنقوم بإشعارك عند نشر أي مهمة جديدة تتوافق مع مهاراتك.' : 'Tout est à jour ! Vous recevrez une alerte en cas de nouvelle activité professionnelle.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {notificationsList.map((notif) => {
                    return (
                      <div
                        key={notif.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 text-right ${
                          notif.read
                            ? 'bg-white border-gray-150/80 shadow-xs'
                            : 'bg-blue-50/40 border-blue-100 shadow-sm'
                        }`}
                      >
                        {/* Left dot badge */}
                        <div className="flex items-center shrink-0 pt-1">
                          {!notif.read && (
                            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
                          )}
                        </div>

                        {/* Icon */}
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          notif.type === 'welcome' ? 'bg-indigo-50 text-indigo-650' :
                          notif.type === 'security' ? 'bg-emerald-50 text-emerald-650' :
                          'bg-amber-50 text-amber-650'
                        }`}>
                          {notif.type === 'welcome' && <Sparkles className="w-4 h-4" />}
                          {notif.type === 'security' && <ShieldCheck className="w-4 h-4" />}
                          {notif.type === 'announcement' && <AlertCircle className="w-4 h-4" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                              {isRTL ? notif.titleAr : notif.titleFr}
                            </h4>
                            <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
                              {isRTL ? notif.timeAr : notif.timeFr}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-500 font-medium leading-relaxed">
                            {isRTL ? notif.descAr : notif.descFr}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-center">
                          {!notif.read && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="p-1.5 hover:bg-white text-gray-400 hover:text-blue-600 rounded-lg border border-transparent hover:border-gray-100 transition-all cursor-pointer"
                              title={isRTL ? 'تحديد كمقروء' : 'Marquer comme lu'}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notif.id)}
                            className="p-1.5 hover:bg-white text-gray-400 hover:text-rose-600 rounded-lg border border-transparent hover:border-gray-100 transition-all cursor-pointer"
                            title={isRTL ? 'حذف الإشعار' : 'Supprimer'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* H. HELP & SUPPORT TAB */}
          {activeTab === 'help' && (
            <div className="flex flex-col gap-6 animate-fade-in" id="worker-tab-help">
              <div className="flex items-center justify-between border-b pb-3 border-gray-200/60 text-right">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-black text-slate-900">{isRTL ? 'مركز الدعم الفني ومساعدة الحرفيين' : 'Aide & Support Partenaire'}</h3>
                  <span className="text-[10px] text-gray-455 font-bold">
                    {isRTL ? 'نحن هنا لضمان تجربة عمل ممتازة وضمان حقوقك المالية. تصفح الإرشادات أو أرسل استفسارك لفريق الدعم.' : 'Nous vous aidons à développer votre activité et sécuriser vos revenus.'}
                  </span>
                </div>
              </div>

              {/* Support Bento Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 columns: FAQ toggles */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 justify-end">
                    <span>{isRTL ? 'الأسئلة الشائعة وإرشادات العمل بالرباط' : 'Guide de Réussite & FAQ'}</span>
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                  </h4>

                  <div className="flex flex-col gap-2.5">
                    {[
                      {
                        qAr: 'كيف يمكنني تقديم عرض سعر مقنع للعميل؟',
                        qFr: 'Comment faire une offre convaincante pour le client ?',
                        aAr: 'عند التقديم على مهمة، اكتب رسالة احترافية تبرز خبرتك السابقة وقدرتك على تلبية الطلب بدقة، وقدم سعراً عادلاً (بالدرهم) يشمل تكلفة المواد أو خدماتك فقط لتشجيع العميل على اختيارك.',
                        aFr: 'Lorsque vous postulez, écrivez un message poli expliquant vos compétences. Proposez un tarif juste en DH qui reflète votre travail et gagnez la confiance du client.'
                      },
                      {
                        qAr: 'متى وكيف يتم دفع مستحقاتي عن العمل؟',
                        qFr: 'Quand et comment suis-je payé pour ma prestation ?',
                        aAr: 'يتم حجز ميزانية المهمة في نظام الضمان الآمن بالمنصة بمجرد قبول العميل لعرضك. بمجرد الانتهاء من العمل وتأكيد العميل على لوحة التحكم، يتم تحويل المبلغ فوراً إلى محفظتك بالمنصة لتتمكن من سحبه لحسابك البنكي.',
                        aFr: 'Dès que le client accepte votre offre, l\'argent est bloqué par la plateforme. Une fois la tâche achevée, le client valide la fin de mission, libérant immédiatement les fonds dans votre portefeuille.'
                      },
                      {
                        qAr: 'كيف يمكنني سحب الأرباح من محفظتي بالمنصة؟',
                        qFr: 'Comment transférer mes gains vers mon compte bancaire ?',
                        aAr: 'توجه إلى علامة تبويب "المحفظة وسحب الأرباح"، وحدد المبلغ المراد سحبه، ثم أدخل رقم الحساب البنكي (RIB) المكون من 24 رقماً الخاص بك. تتم معالجة التحويلات البنكية المحلية خلال 24 إلى 48 ساعة عمل.',
                        aFr: 'Allez dans l\'onglet "Gains & Versements", entrez le montant et configurez votre code RIB (24 chiffres). Les virements bancaires vers les banques marocaines prennent généralement entre 24h et 48h.'
                      },
                      {
                        qAr: 'كيف أتعامل مع إلغاء المهمة أو النزاعات؟',
                        qFr: 'Que faire en cas d\'annulation de mission ou de litige ?',
                        aAr: 'في حال حدوث سوء تفاهم مع العميل أو طلب إلغاء غير مبرر، لا تتردد في استخدام نموذج الدعم الفني بالأسفل. سيقوم فريق الإشراف لدينا بمراجعة رسائل الدردشة والصور والتحقق لإعطاء كل ذي حق حقه بالعدل.',
                        aFr: 'En cas de désaccord avec un client ou d\'annulation injuste, contactez-nous via le formulaire ci-dessous. Un conseiller analysera la situation et l\'historique des chats pour résoudre le problème.'
                      }
                    ].map((faq, index) => {
                      const isOpen = activeFaqIndex === index;
                      return (
                        <div
                          key={index}
                          className="bg-white border border-gray-150 rounded-2xl overflow-hidden transition-all duration-300"
                        >
                          <button
                            onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                            className="w-full p-4.5 flex items-center justify-between text-right cursor-pointer hover:bg-slate-50 transition-colors"
                          >
                            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
                            <span className="text-xs sm:text-sm font-black text-slate-800">
                              {isRTL ? faq.qAr : faq.qFr}
                            </span>
                          </button>
                          {isOpen && (
                            <div className="px-4.5 pb-4.5 pt-1 text-[10px] sm:text-xs text-gray-500 font-bold leading-relaxed border-t border-gray-100 bg-slate-50/50">
                              {isRTL ? faq.aAr : faq.aFr}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right column: Interactive Support Form */}
                <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs flex flex-col gap-4 text-right">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 justify-end">
                    <span>{isRTL ? 'تذكرة دعم فني جديدة' : 'Ouvrir un ticket support'}</span>
                    <Phone className="w-4 h-4 text-blue-600" />
                  </h4>

                  {supportSuccess ? (
                    <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center gap-3 text-center my-4 animate-fade-in">
                      <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-full">
                        <Check className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-slate-850">
                        {isRTL ? 'تم الإرسال بنجاح' : 'Envoyé avec succès'}
                      </span>
                      <p className="text-[10px] text-gray-550 leading-relaxed font-bold">
                        {isRTL 
                          ? 'شكراً لك! تم تسليم استفسارك لفريق دعم الحرفيين بنجاح. سنقوم بالرد عليك هاتفياً أو عبر البريد الإلكتروني لحل مشكلتك بأسرع وقت.' 
                          : 'Merci ! Notre équipe a bien reçu votre demande et vous répondra sous 24 heures.'}
                      </p>
                      <button
                        onClick={() => {
                          setSupportSuccess(false);
                          setSupportMessage('');
                        }}
                        className="mt-2 text-[10px] bg-white hover:bg-gray-55 text-gray-650 border border-gray-200 font-black px-4.5 py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        {isRTL ? 'إرسال تذكرة أخرى' : 'Envoyer un autre message'}
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!supportMessage.trim()) return;
                        setSupportSuccess(true);
                      }}
                      className="flex flex-col gap-3.5"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 font-black">
                          {isRTL ? 'نوع المشكلة / فئة الدعم' : 'Catégorie d\'assistance'}
                        </label>
                        <select
                          value={supportCategory}
                          onChange={(e) => setSupportCategory(e.target.value)}
                          className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:border-blue-500 font-bold"
                        >
                          <option value="general">{isRTL ? 'استفسار عام / مساعدة' : 'Assistance générale'}</option>
                          <option value="billing">{isRTL ? 'مشاكل سحب الأرباح أو الضمان' : 'Gains & Versements'}</option>
                          <option value="report">{isRTL ? 'الإبلاغ عن نزاع مع زبون' : 'Litige avec un client'}</option>
                          <option value="suggestion">{isRTL ? 'اقتراحات تطوير المنصة' : 'Suggestion d\'amélioration'}</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 font-black">
                          {isRTL ? 'تفاصيل الرسالة أو المشكلة' : 'Description de votre problème'}
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          placeholder={isRTL ? 'اكتب تفاصيل استفسارك أو مشكلتك بوضوح لمساعدتك...' : 'Décrivez votre problème en détails...'}
                          className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:border-blue-500 font-bold resize-none leading-relaxed"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!supportMessage.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span>{isRTL ? 'إرسال تذكرة الدعم' : 'Envoyer le ticket'}</span>
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* PLACE BID / PITCH FORM DIALOG MODAL */}
      <AnimatePresence>
        {focusedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg border border-gray-150 shadow-2xl relative text-right"
            >
              
              <button
                onClick={() => setFocusedTask(null)}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors absolute top-4 left-4 cursor-pointer text-slate-505"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4">
                <span className="text-[10px] bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-black uppercase">
                  {isRTL ? 'تقديم صفقة عمل' : 'Créer Devis'}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-2">{focusedTask.title}</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">
                  {isRTL ? 'الميزانية المقترحة من الزبون:' : 'Budget client:'} {focusedTask.budget} DH
                </p>
              </div>

              {bidSuccessMessage ? (
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-4 rounded-xl border border-emerald-200 my-4 text-center">
                  {bidSuccessMessage}
                </div>
              ) : (
                <form onSubmit={handleSubmitOffer} className="flex flex-col gap-4">
                  
                  <div className="flex flex-col gap-1 text-right">
                    <label className="text-[10px] font-bold text-gray-400">{isRTL ? 'قيمة عرضك المقترح بالدرهم المغربي (MAD / DH)' : 'Votre offre tarifaire (MAD)'}</label>
                    <input 
                      type="number"
                      value={pitchAmount}
                      onChange={(e) => setPitchAmount(Number(e.target.value))}
                      min={50}
                      className="px-3.5 py-3 border border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:border-emerald-500 bg-white"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-right">
                    <label className="text-[10px] font-bold text-gray-400">{isRTL ? 'رسالة العرض الفني (أقنع صاحب الطلب بمهارتك)' : 'Votre message d’accompagnement'}</label>
                    <textarea 
                      value={pitchMessage}
                      onChange={(e) => setPitchMessage(e.target.value)}
                      rows={5}
                      placeholder={isRTL ? 'مثال: السلام عليكم، أنا مهتم بمهمتك وجاهز للحضور فوراً ومحمل بجميع أدوات الصيانة اللازمة تواصل معي لمناقشة التفاصيل...' : 'Décrivez votre démarche, vos outils, vos garanties...'}
                      className="px-3.5 py-3 border border-gray-200 rounded-xl text-xs font-extrabold focus:outline-none focus:border-emerald-555 resize-none leading-relaxed"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={placingBidInProgress}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-xs py-3.5 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {placingBidInProgress ? (
                      <span>{isRTL ? 'جاري إرسال العرض للعميل...' : 'Envoi en cours...'}</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-white" />
                        <span>{isRTL ? 'إرسال عرضي المالي فوراً للزبون' : 'Soumettre ma candidature maintenant'}</span>
                      </>
                    )}
                  </button>

                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
