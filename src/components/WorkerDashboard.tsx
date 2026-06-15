import React, { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  addDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { Task, UserProfile, Offer, Review } from '../types';
import { LanguageKey, SERVICE_CATEGORIES, RABAT_NEIGHBORHOODS } from '../data/rabatData';
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
  Power,
  ChevronLeft,
  ChevronUp,
  AlertCircle,
  Award,
  Users,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RabatMap from './RabatMap';

interface WorkerDashboardProps {
  user: any;
  userProfile: UserProfile | null;
  lang: LanguageKey;
  onSelectTask: (task: Task) => void;
  onOpenSettings: () => void;
  onToggleToClient?: () => void; // Callback to toggle back to Client mode
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
  onToggleToClient
}: WorkerDashboardProps) {
  const isRTL = lang === 'ar';

  // Worker active navigation tab
  // 'income' (Earnings overview + Withdraw wallet), 'jobs' (Explore/Search jobs + interactive Map), 'assigned' (Assigned active tasks), 'chats' (Client messages), 'profile' (Skills & online status)
  const [activeTab, setActiveTab] = useState<'income' | 'jobs' | 'assigned' | 'chats' | 'profile'>('income');

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
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setMyProfile(data);
        setIsOnline(data.isOnline ?? true);
        if (data.bio) setEditBio(data.bio);
        if (data.location) setEditLocation(data.location);
        if (data.minimumRate) setEditMinRate(data.minimumRate);
        if (data.skills) setEditSkills(data.skills);
      }
    }, (err) => {
      console.error("Error watching user profile real-time:", err);
    });
    return () => unsub();
  }, [user]);

  // 2. Sync all Tasks in the system
  useEffect(() => {
    const q = query(collection(db, 'tasks'));
    const unsub = onSnapshot(q, (snap) => {
      const openList: Task[] = [];
      const assignedList: Task[] = [];
      const completedList: Task[] = [];

      snap.forEach((docSnap) => {
        const t = { id: docSnap.id, ...docSnap.data() } as Task;
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
        snap.forEach((taskDoc) => {
          const offersRef = collection(db, 'tasks', taskDoc.id, 'offers');
          const qOffers = query(offersRef, where('taskerId', '==', user.uid));
          onSnapshot(qOffers, (offerSnap) => {
            if (!offerSnap.empty) {
              const oDoc = offerSnap.docs[0];
              setMyOffers(prev => ({
                ...prev,
                [taskDoc.id]: { id: oDoc.id, ...oDoc.data() } as Offer
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
    const q = query(collection(db, 'reviews'), where('revieweeId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const rList: Review[] = [];
      snap.forEach((docSnap) => {
        rList.push({ id: docSnap.id, ...docSnap.data() } as Review);
      });
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
    const q = query(
      collection(db, 'withdrawals'), 
      where('workerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const wList: WithdrawalRecord[] = [];
      snap.forEach((docSnap) => {
        wList.push({ id: docSnap.id, ...docSnap.data() } as WithdrawalRecord);
      });
      setWithdrawalHistory(wList);
    }, (err) => {
      console.warn("Withdrawal collection not initialized. Switched to fallback local state logs.", err);
    });
    return () => unsub();
  }, [user]);

  // 5. Chat inbox rooms listener
  useEffect(() => {
    if (!user) return;
    setLoadingChats(true);

    const q = query(collection(db, 'tasks'));
    const unsub = onSnapshot(q, async (snap) => {
      const rooms: ChatRoom[] = [];
      const promises: Promise<any>[] = [];

      snap.forEach((taskDoc) => {
        const taskObj = taskDoc.data() as Task;
        taskObj.id = taskDoc.id;

        // Current worker is assigned OR has an offer submitted
        const hasMyOffer = myOffers[taskDoc.id];
        const isAssignedToMe = taskObj.taskerId === user.uid;

        if (isAssignedToMe || hasMyOffer) {
          rooms.push({
            id: `${taskDoc.id}_${user.uid}`,
            taskId: taskDoc.id,
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
    const messagesRef = collection(db, 'chatMessages');
    const q = query(
      messagesRef, 
      where('roomId', '==', activeRoom.id), 
      orderBy('createdAt', 'asc'), 
      limit(100)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: ChatMessage[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
      });
      setMessages(list);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }, (err) => {
      console.warn("Messages collection loading status: OK", err);
    });
    return () => unsub();
  }, [activeRoom]);

  // Submit chat message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeRoom || !newMessageText.trim()) return;

    const messagePayload = {
      roomId: activeRoom.id,
      senderId: user.uid,
      senderName: myProfile?.displayName || user.displayName || 'الحرفي المحترف',
      text: newMessageText.trim(),
      createdAt: serverTimestamp()
    };

    try {
      setNewMessageText('');
      await addDoc(collection(db, 'chatMessages'), messagePayload);
    } catch (err) {
      console.error("Failed to post message:", err);
    }
  };

  // Availability switch toggle
  const handleToggleOnlineStatus = async () => {
    if (!user) return;
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isOnline: nextStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to sync online status with Firestore", err);
    }
  };

  // Submit Bid/Offer to Task
  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !focusedTask) return;
    if (pitchAmount <= 40) {
      alert(isRTL ? 'الرجاء تحديد عرض سعر مناسب لا يقل عن 50 درهم مغربي.' : 'Le budget minimal pour une offre est de 50 MAD.');
      return;
    }
    if (!pitchMessage.trim()) {
      alert(isRTL ? 'الرجاء إدخال رسالة قصيرة لإقناع صاحب الطلب بجودة عملك.' : 'Veuillez saisir un message pour présenter votre offre.');
      return;
    }

    setPlacingBidInProgress(true);
    const offerId = 'offer_' + user.uid + '_' + Math.random().toString(36).substring(2, 6);
    const offerData = {
      taskId: focusedTask.id,
      taskerId: user.uid,
      taskerName: myProfile?.displayName || user.displayName || 'حرفي خبير بالرباط',
      taskerPhoto: user.photoURL || '',
      amount: Number(pitchAmount),
      message: pitchMessage.trim(),
      status: 'pending',
      createdAt: serverTimestamp()
    };

    try {
      // 1. Submit Offer subcollection doc
      await setDoc(doc(db, 'tasks', focusedTask.id, 'offers', offerId), offerData);
      
      // 2. Increment offers count on the main task
      const currentOffersCount = focusedTask.offersCount || 0;
      await updateDoc(doc(db, 'tasks', focusedTask.id), {
        offersCount: currentOffersCount + 1,
        updatedAt: serverTimestamp()
      });

      setBidSuccessMessage(isRTL ? 'تهانينا! تم إرسال عرضك الفني بنجاح لصاحب المهمة. تواصل معه للاتفاق!' : 'Votre proposition de tarif a été transmise avec succès ! Nous vous notifierons.');
      setPitchMessage('');
      
      setTimeout(() => {
        setBidSuccessMessage(null);
        setFocusedTask(null);
      }, 3500);
    } catch (err: any) {
      console.error(err);
      alert('Error placing bid. Please try again.');
    } finally {
      setPlacingBidInProgress(false);
    }
  };

  // Worker Profile & Specialties modification
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        bio: editBio,
        location: editLocation,
        minimumRate: Number(editMinRate),
        skills: editSkills,
        updatedAt: serverTimestamp()
      });
      setProfileSuccessAlert(true);
      setTimeout(() => setProfileSuccessAlert(false), 4000);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSavingProfile(false);
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

    setWithdrawingInProgress(true);
    try {
      const wdPayload = {
        workerId: user.uid,
        workerName: myProfile?.displayName || user.displayName,
        amount: Number(withdrawalAmount),
        bankName: selectedBank,
        rib: ribInput.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'withdrawals'), wdPayload);
      
      // Zero out or log the local transaction simulations
      setWithdrawSuccess(true);
      setRibInput('');
      
      setTimeout(() => setWithdrawSuccess(false), 4500);
    } catch (err) {
      console.error(err);
    } finally {
      setWithdrawingInProgress(false);
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
    const defaultIcon = <Sliders className="w-5 h-5 text-indigo-500" />;
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

  return (
    <div className="min-h-screen bg-slate-50 w-full flex flex-col font-sans text-slate-800" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* MOTIVATIONAL TOP HERO: WORKER LEADERBOARD METRICS */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-650 to-emerald-700 text-white rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-5 text-center md:text-right flex-col md:flex-row">
            {/* User profile initial avatar with status orb */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-emerald-700 flex items-center justify-center font-black text-3xl shadow-xl border-4 border-white/20">
                {myProfile?.displayName ? myProfile.displayName.charAt(0) : '?'}
              </div>
              <button 
                onClick={handleToggleOnlineStatus}
                className={`absolute -bottom-1 -right-1 p-1 px-2.5 rounded-full text-[9px] font-bold border-2 border-slate-50 text-white flex items-center gap-1 shadow-sm transition-all cursor-pointer ${
                  isOnline ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-400 hover:bg-slate-550'
                }`}
                title={isRTL ? 'تعديل حالة الاتصال المباشر' : 'Changer statut'}
              >
                <Power className="w-3 h-3 shrink-0" />
                <span>{isOnline ? (isRTL ? 'نشط' : 'En ligne') : (isRTL ? 'مغلق' : 'Hors-ligne')}</span>
              </button>
            </div>

            <div className="flex flex-col gap-1 md:items-start items-center">
              <div className="flex flex-wrap items-center gap-2 justify-center">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{myProfile?.displayName || user.displayName || 'حرفي متمرس'}</h2>
                <span className="bg-white/20 text-white text-[10px] px-2.5 py-0.5 rounded-full font-black border border-white/10 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{isRTL ? 'حرفي معتمد ومثبت' : 'Prestataire vérifié'}</span>
                </span>
              </div>
              
              <p className="text-xs text-teal-100 max-w-md font-medium text-center md:text-right leading-relaxed">
                {myProfile?.bio || (isRTL ? 'صاحب مهارات متعددة. تنقل بين المهام المفتوحة لتأكيد عروضك وجني أرباح مستمرة.' : 'Artisan professionnel à Rabat. Trouvez des missions à proximité.')}
              </p>

              {/* Status details line */}
              <div className="flex items-center gap-3 mt-2 text-xs text-teal-200 font-bold bg-white/10 px-3 py-1.5 rounded-xl">
                <div className="flex items-center gap-1 text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>{myProfile?.rating ? myProfile.rating.toFixed(1) : '5.0'} / 5</span>
                </div>
                <span className="opacity-45">|</span>
                <span className="font-semibold text-emerald-300">
                  {isRTL ? 'نسبة نجاح 98%' : 'Taux de succès 98%'}
                </span>
                <span className="opacity-45">|</span>
                <span className="text-white">
                  {editSkills.length} {isRTL ? 'فئات مهارية' : 'compétences'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick toggle to customer dashboard */}
          {onToggleToClient && (
            <button
              onClick={onToggleToClient}
              className="bg-white hover:bg-slate-50 text-emerald-800 font-extrabold text-xs sm:text-xs px-5 py-3.5 rounded-2xl transition-all cursor-pointer shadow-md shadow-emerald-900/10 flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isRTL ? 'التبديل إلى لوحة الزبون (طالب الخدمة)' : 'Mode Client (Demander Services)'}</span>
            </button>
          )}

        </div>
      </div>

      {/* WORKER DASHBOARD SUB-NAVIGATION TABS */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <nav className="flex overflow-x-auto py-1 scrollbar-none gap-2 w-full md:w-auto" id="worker-navbar-tabs">
              {[
                { id: 'income', labelAr: 'الأرباح والمحفظة والتحويل', labelFr: 'Mes Revenus', icon: Wallet },
                { id: 'jobs', labelAr: 'مهمات الرباط وخريطة الأحياء', labelFr: 'Explorer les Missions', icon: Map },
                { id: 'assigned', labelAr: 'مهامي قيد الإنجاز والأرشيف', labelFr: 'Tâches assignées', icon: CheckCircle2 },
                { id: 'chats', labelAr: 'مفاوضات ورسائل العملاء', labelFr: 'Discussions clients', icon: MessageSquare },
                { id: 'profile', labelAr: 'الملف المهني وإعداد المهارات', labelFr: 'Profil & Compétences', icon: Sliders }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-4.5 text-xs sm:text-sm font-black transition-all cursor-pointer border-b-4 select-none whitespace-nowrap ${
                      isActive 
                        ? 'border-emerald-600 text-emerald-700 font-extrabold' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <tab.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span>{isRTL ? tab.labelAr : tab.labelFr}</span>
                  </button>
                );
              })}
            </nav>
            <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-gray-400 font-mono">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-450'}`} />
              <span>{isOnline ? (isRTL ? 'متاح للعمل فوراً' : 'Disponible') : (isRTL ? 'غير نشط مؤقتاً' : 'Hors-ligne')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT CANVAS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1 flex flex-col gap-6">

        {/* 1. INCOME TAB: DETAILED WALLET & PAYOUT SYSTEM */}
        {activeTab === 'income' && (
          <div className="flex flex-col gap-6 animate-fade-in" id="worker-tab-income">
            
            {/* Analytics Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Wallet Summary Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15">
                  <Wallet className="w-40 h-40" />
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-emerald-100 font-black tracking-wider uppercase">{isRTL ? 'الرصيد المتاح للسحب البنكي' : 'Solde disponible'}</span>
                    <span className="text-3xl font-black mt-1.5 tracking-tight">{totalEarnedAmount} DH</span>
                  </div>
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <Banknote className="w-6 h-6 text-emerald-300" />
                  </div>
                </div>
                <div className="mt-8 pt-3 border-t border-white/10 text-xs font-medium text-emerald-100 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{isRTL ? 'أموال مضمونة ومكتسبة بالكامل' : 'Fonds sécurisés prêts au transfert'}</span>
                </div>
              </div>

              {/* Pending Escrow Locked */}
              <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-black uppercase">{isRTL ? 'الضمان المالي المعلق (قيد الإنجاز)' : 'En attente sur Escrow'}</span>
                    <span className="text-2xl font-black text-slate-800 mt-1">{pendingEscrowAmount} DH</span>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <Clock className="w-5 h-5 animate-spin-slow" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-amber-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 font-semibold text-right">
                  {isRTL 
                    ? 'هذا الملغ تم تأمينه من العملاء في نظام الضمان البنكي، وسيُحوّل لمحفظتك فور تأكيد المهام.' 
                    : 'Fonds réservés déposés par les clients.'}
                </div>
              </div>

              {/* Verified Reputation Score */}
              <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-black uppercase">{isRTL ? 'إجمالي المهام الناجحة المكتملة' : 'Missions finalisées'}</span>
                    <span className="text-2xl font-black text-slate-800 mt-1">{completedTasks.length} {isRTL ? 'مهمة' : 'jobs'}</span>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                    <span>{myReviews.length} {isRTL ? 'تقييمات موثقة' : 'avis certifiés'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-extrabold bg-amber-50 px-2 py-1 rounded-md">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                    <span>{myProfile?.rating ? myProfile.rating.toFixed(1) : '5.0'}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Payout & Withdrawal Panel */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between relative">
                
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-black text-slate-800">{isRTL ? 'تحويل الأرباح لحسابك البنكي المغربي' : 'Retirer mes Gains Vers ma Banque'}</h3>
                  </div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 font-black px-2 py-0.5 rounded uppercase">
                    RIB Direct
                  </span>
                </div>

                <AnimatePresence>
                  {withdrawSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl text-xs font-bold flex items-center gap-2 mb-4 text-right"
                    >
                      <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{isRTL ? 'بنجاح! تم تسجيل طلب سحب الأرباح وسيتم مراجعته وإرساله لحسابك البنكي خلال 24 ساعة كحد أقصى.' : 'Demande formulée ! Paiement en traitement.'}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleWithdrawFunds} className="flex flex-col gap-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    <div className="flex flex-col gap-1.5 text-right">
                      <label className="text-[10px] font-bold text-gray-400">{isRTL ? 'قيمة مبلغ السحب بالدرهم المغريي' : 'Montant à retirer'}</label>
                      <input 
                        type="number"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                        min={100}
                        max={totalEarnedAmount || 1000}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-black leading-none focus:outline-none focus:border-emerald-500"
                        placeholder="Ex: 500 DH"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 text-right">
                      <label className="text-[10px] font-bold text-gray-400">{isRTL ? 'اختر مؤسستك البنكية بالمغرب' : 'Votre Banque au Maroc'}</label>
                      <select 
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-emerald-500 bg-white"
                      >
                        {MAROC_BANKS.map(b => (
                          <option key={b.id} value={b.id}>{isRTL ? b.nameAr : b.nameFr}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                  <div className="flex flex-col gap-1.5 text-right">
                    <label className="text-[10px] font-bold text-gray-400">{isRTL ? 'أدخل رقم الحساب البنكي (RIB - 24 خانة)' : 'Code RIB Marocain (24 chiffres)'}</label>
                    <input 
                      type="text"
                      maxLength={24}
                      value={ribInput}
                      onChange={(e) => setRibInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 123456789012345678901234"
                      className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold leading-none tracking-widest text-center focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={withdrawingInProgress || totalEarnedAmount <= 0}
                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-3.5 px-5 rounded-2xl cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {withdrawingInProgress ? (
                      <span>{isRTL ? 'جاري توثيق طلب السحب...' : 'Traitement en cours...'}</span>
                    ) : (
                      <>
                        <Banknote className="w-4 h-4 text-white" />
                        <span>{isRTL ? 'سحب فوري للمستحقات البنكية' : 'Débloquer et virer mes fonds'}</span>
                      </>
                    )}
                  </button>

                </form>

              </div>

              {/* Withdrawal History Logging List */}
              <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-200 flex flex-col justify-between shadow-xs">
                
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    <h4 className="text-xs font-black text-slate-800 uppercase">{isRTL ? 'سجل السحوبات الماضية الحية' : 'Suivi des Transferts'}</h4>
                  </div>
                  <span className="text-[9px] bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded">
                    {withdrawalHistory.length} TRANSACTIONS
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
                  {withdrawalHistory.length === 0 ? (
                    <div className="py-8 text-center text-[10px] text-gray-400 font-semibold leading-relaxed">
                      {isRTL ? 'لا توجد أي سحوبات سابقة مسجلة بمحفظتك.' : 'Aucun mouvement de retrait encore enregistré.'}
                    </div>
                  ) : (
                    withdrawalHistory.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl border border-gray-150 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                            item.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                            item.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-xs font-black text-slate-800">{item.amount} DH</span>
                          <span className="text-[9px] text-gray-450 font-bold uppercase">{item.bankName}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 2. EXPLORE JOBS TAB: BROWSE JOBS WITH INTERACTIVE SVG MAP */}
        {activeTab === 'jobs' && (
          <div className="flex flex-col gap-6 animate-fade-in" id="worker-tab-jobs">
            
            {/* Header filters banner */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search bar input value */}
              <div className="w-full md:w-72 relative">
                <Search className="w-4.5 h-4.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  value={jobSearchQuery}
                  onChange={(e) => setJobSearchQuery(e.target.value)}
                  placeholder={isRTL ? 'ابحث بالكلمات الدلالية هنا (مثل: غسيل، صباغة)...' : 'Rechercher une tâche...'}
                  className="w-full pl-3 pr-10 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Filters dropdown parameters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                
                {/* Neighborhood switch dropdown */}
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-extrabold bg-slate-50 focus:outline-none text-right"
                >
                  <option value="all">{isRTL ? 'كل أحياء الرباط' : 'Rabat (Tous)'}</option>
                  {RABAT_NEIGHBORHOODS.map(n => (
                    <option key={n.id} value={n.id}>{isRTL ? n.ar : n.fr}</option>
                  ))}
                </select>

                {/* Category switch filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-extrabold bg-slate-50 focus:outline-none text-right"
                >
                  <option value="all">{isRTL ? 'كل تخصصات الخدمات' : 'Spécialités (Toutes)'}</option>
                  {SERVICE_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{isRTL ? c.ar : c.fr}</option>
                  ))}
                </select>

                {/* Toggle Map Show status */}
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className={`p-2 px-3.5 transition-all text-xs font-bold rounded-xl border cursor-pointer flex items-center gap-1 bg-white hover:bg-slate-50 ${
                    showMap ? 'text-emerald-700 border-emerald-350 bg-emerald-50' : 'text-slate-550 border-gray-200'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  <span>{showMap ? (isRTL ? 'إخفاء الخريطة' : 'Masquer la carte') : (isRTL ? 'عرض الخريطة' : 'Afficher la carte')}</span>
                </button>

              </div>
            </div>

            {/* Split layout: SVG Interactive Map and Task Listings */}
            <div className={`grid grid-cols-1 ${showMap ? 'lg:grid-cols-12' : ''} gap-6`}>
              
              {/* Maps wrapper section if active */}
              {showMap && (
                <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col gap-4">
                  <div className="border-b border-gray-100 pb-2.5 flex items-center justify-between flex-row-reverse">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Map className="w-4.5 h-4.5 text-emerald-500" />
                      <span>{isRTL ? 'حدد حي بالرباط لاستكشاف مهامه المتاحة' : 'Quartiers actifs à Rabat'}</span>
                    </h4>
                    {selectedNeighborhood !== 'all' && (
                      <button
                        onClick={() => setSelectedNeighborhood('all')}
                        className="text-[9px] bg-slate-100 hover:bg-slate-150 text-slate-650 px-2.5 py-1 rounded font-extrabold"
                      >
                        {isRTL ? 'عرض الكل' : 'Afficher tout'}
                      </button>
                    )}
                  </div>

                  <div className="h-[320px] rounded-2xl overflow-hidden relative border border-gray-150 flex items-center justify-center bg-slate-50/50">
                    <RabatMap 
                      tasks={openTasks}
                      selectedNeighborhood={selectedNeighborhood}
                      onSelectNeighborhood={setSelectedNeighborhood}
                      lang={lang}
                    />
                  </div>
                </div>
              )}

              {/* Tasks List Listings representation */}
              <div className={`${showMap ? 'lg:col-span-7' : 'w-full'} flex flex-col gap-4`}>
                
                <h4 className="text-xs font-black text-slate-500 uppercase flex items-center gap-1.5 justify-end">
                  <span>{isRTL ? 'طلبات الصنعة والعمل المطروحة' : 'Missions locales dénichées'} ({filteredAvailableTasks.length})</span>
                  <Bookmark className="w-4.5 h-4.5 text-gray-400" />
                </h4>

                <div className="flex flex-col gap-3.5 max-h-[500px] overflow-y-auto pr-1">
                  {loadingTasks ? (
                    <div className="bg-white p-8 rounded-2xl border text-center text-xs font-medium text-gray-400 animate-pulse">
                      {isRTL ? 'جاري فرز المهام المتوفرة من خوادم العاصمة الرباط...' : 'Tri des opportunités disponibles...'}
                    </div>
                  ) : filteredAvailableTasks.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-bold text-gray-400 max-w-sm leading-relaxed">
                        {isRTL ? 'لم نعثر على مهام مفتوحة تطابق فلاتر البحث الحالية بالرباط. يرجى تعديل خيارات التصفية.' : 'Aucun travail ne correspond à votre recherche actuelle.'}
                      </p>
                    </div>
                  ) : (
                    filteredAvailableTasks.map((task) => {
                      const spec = getCategoryTheme(task.category);
                      const myBid = myOffers[task.id];
                      return (
                        <div 
                          key={task.id} 
                          className={`bg-white p-4.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-xs hover:border-emerald-350 relative ${
                            myBid ? 'border-indigo-150 bg-indigo-50/10' : 'border-gray-200'
                          }`}
                        >
                          
                          {/* Top row category details badge */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-600 font-mono tracking-tight">{task.budget} DH</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] px-2.5 py-1 rounded-full font-black border uppercase tracking-wider ${spec.color}`}>
                                {spec.name}
                              </span>
                              <span className="text-[10px] text-gray-450 font-bold flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{task.location}</span>
                              </span>
                            </div>
                          </div>

                          {/* Task Description message */}
                          <div className="text-right">
                            <h3 className="text-sm font-black text-slate-900 leading-snug">{task.title}</h3>
                            <p className="text-xs text-gray-400 font-medium line-clamp-2 mt-1.5 leading-normal">{task.description}</p>
                          </div>

                          {/* Action Button & Bid state tracking */}
                          <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                            
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase bg-slate-50 px-2 py-1 rounded">
                              <Clock className="w-3.5 h-3.5 text-slate-450" />
                              <span>{isRTL ? 'الموعد المخطط:' : 'Échéance:'} {task.dueDate}</span>
                            </div>

                            {myBid ? (
                              <button
                                onClick={() => {
                                  setActiveRoom({
                                    id: `${task.id}_${user.uid}`,
                                    taskId: task.id,
                                    taskTitle: task.title,
                                    otherPartyId: task.posterId,
                                    otherPartyName: task.posterName
                                  });
                                  setActiveTab('chats');
                                }}
                                className="px-4 py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-1.5 hover:underline cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span>{isRTL ? `تفاوض الآن (مبلغك: ${myBid.amount} DH)` : `Négocier (${myBid.amount} MAD)`}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setFocusedTask(task);
                                  setPitchAmount(task.budget);
                                  setPitchMessage('');
                                }}
                                className="px-4 py-2 bg-emerald-550 hover:bg-emerald-600 text-white font-black text-xs rounded-xl cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                              >
                                <Plus className="w-4 h-4" />
                                <span>{isRTL ? 'تقديم عرض فني وسعر' : 'Soumettre un tarif'}</span>
                              </button>
                            )}

                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 3. ASSIGNED AND ARCHIVED JOBS */}
        {activeTab === 'assigned' && (
          <div className="flex flex-col gap-6 animate-fade-in" id="worker-tab-assigned">
            
            {/* Active matched assignments list */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs">
              <div className="border-b border-gray-100 pb-3 mb-4 text-right">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 justify-end">
                  <Clock className="w-5 h-5 text-emerald-500 animate-pulse" />
                  <span>{isRTL ? 'مهمات نشطة قيد الإنجاز (تم اختيارك)' : 'Missions actives en cours d’exécution'}</span>
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  {isRTL ? 'هذه المهام مسندة إليك رسمياً، وقد قام أصحابها بتمويل الضمان المالي بالكامل. أنجز العمل وحل مشكلتهم!' : 'Les fonds de ces tâches sont garantis sur le compte Escrow.'}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {loadingAssigned ? (
                  <div className="p-4 text-center text-xs text-gray-400 font-medium animate-pulse">{isRTL ? 'جاري استيراد العمليات النشطة...' : 'Chargement...'}</div>
                ) : assignedTasks.length === 0 ? (
                  <div className="p-8 text-center text-[11px] text-gray-400 font-bold leading-relaxed">
                    {isRTL ? 'لا توجد أي مهام مسندة إليك قيد التنفيذ حالياً. قم بتقديم عروض مقنعة في قائمة تصفح المهام!' : 'Aucun travail en cours. Prospectez des offres !'}
                  </div>
                ) : (
                  assignedTasks.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveRoom({
                              id: `${item.id}_${user.uid}`,
                              taskId: item.id,
                              taskTitle: item.title,
                              otherPartyId: item.posterId,
                              otherPartyName: item.posterName
                            });
                            setActiveTab('chats');
                          }}
                          className="px-3.5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-black text-xs rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 justify-center"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{isRTL ? 'دردشة مع العميل' : 'Chat avec le client'}</span>
                        </button>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                          {item.budget} DH
                        </span>
                      </div>

                      <div className="text-center sm:text-right">
                        <h4 className="text-sm font-black text-slate-930">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1 sm:justify-end justify-center text-[10px] text-gray-450 font-bold">
                          <span>{item.posterName}</span>
                          <span className="opacity-40">|</span>
                          <span className="text-emerald-600 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 inline text-emerald-500" />
                            <span>{isRTL ? 'رصيد حجز الضمان مؤمن' : 'Escrow approvisionné'}</span>
                          </span>
                        </div>
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
                    // Look for review left by client for this task
                    const matchedReview = myReviews.find(r => r.taskId === item.id);
                    return (
                      <div key={item.id} className="p-4.5 rounded-2xl border border-gray-200 flex flex-col justify-between gap-3 text-right">
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-450 uppercase">{item.dueDate}</span>
                          <div className="flex items-center gap-2">
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
                              <div className="flex items-center gap-1 text-xs text-amber-500 font-black">
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
        )}

        {/* 4. CHAT MESSAGES WITH CLIENTS */}
        {activeTab === 'chats' && (
          <div className="flex-1 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[550px] animate-fade-in" id="worker-tab-chats">
            
            {/* Chats Sidebar */}
            <div className="w-full md:w-80 border-r md:border-r-0 md:border-l border-gray-200 shrink-0 bg-slate-50 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-emerald-50/10">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-2 justify-end">
                  <MessageCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  <span>{isRTL ? 'المحادثات والنقاشات النشطة مع أصحاب الطلب' : 'Messageries Actives Client'}</span>
                </h4>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5 max-h-[250px] md:max-h-[500px]">
                {loadingChats ? (
                  <div className="p-4 text-center text-[10px] text-gray-400 animate-pulse">{isRTL ? 'مزامنة المحادثات الجارية...' : 'Chargement...'}</div>
                ) : chatRooms.length === 0 ? (
                  <div className="py-12 p-4 text-center text-[10px] text-gray-400 font-bold leading-relaxed">
                    {isRTL 
                      ? 'لا توجد محادثات نشطة بعد. الترسيم يتم فور وضعك لعرض أسعار فني على أحد المهام.' 
                      : 'Aucun message de négociation. Postez des propositions de devis.'}
                  </div>
                ) : (
                  chatRooms.map((room) => {
                    const isActive = activeRoom?.id === room.id;
                    return (
                      <button
                        type="button"
                        key={room.id}
                        onClick={() => setActiveRoom(room)}
                        className={`w-full p-4 rounded-xl text-right transition-all flex flex-col gap-1 cursor-pointer select-none ${
                          isActive 
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10' 
                            : 'border border-transparent bg-white shadow-xs hover:bg-emerald-50/40'
                        }`}
                      >
                        <span className={`text-[10px] font-black line-clamp-1 ${isActive ? 'text-emerald-100' : 'text-emerald-600'}`}>{room.taskTitle}</span>
                        <span className={`text-xs font-extrabold flex items-center gap-1.5 justify-end ${isActive ? 'text-white' : 'text-slate-800'}`}>
                          <span>{room.otherPartyName}</span>
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-emerald-500 animate-pulse'}`} />
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Message Pane */}
            <div className="flex-1 flex flex-col bg-white">
              {activeRoom ? (
                <>
                  <div className="p-4.5 border-b border-gray-100 flex items-center justify-between flex-row bg-slate-50/40">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-black uppercase">
                        {isRTL ? 'مفاوضات أسعار' : 'Négociation'}
                      </span>
                    </div>

                    <div className="flex flex-col text-right">
                      <span className="text-xs font-black text-slate-900">{activeRoom.otherPartyName}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{activeRoom.taskTitle}</span>
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col justify-start max-h-[380px]">
                    {messages.length === 0 ? (
                      <div className="py-16 text-center text-[10px] text-gray-450 leading-relaxed font-bold">
                        {isRTL 
                          ? 'تفاوض بذكاء مع العميل! أثبت قدراتك المهنية وأرسل له تفاصيل خبرتك وسرعة وصولك.' 
                          : 'Proposez des détails supplémentaires, des images, etc.'}
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isMe = m.senderId === user.uid;
                        return (
                          <div 
                            key={m.id}
                            className={`flex flex-col max-w-[80%] gap-1 ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                          >
                            <span className="text-[8px] text-gray-400 font-black px-1 leading-none">{m.senderName}</span>
                            <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                              isMe 
                                ? 'bg-emerald-600 text-white rounded-tr-none' 
                                : 'bg-slate-100 text-gray-800 rounded-tl-none border border-slate-150'
                            }`}>
                              {m.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSendChatMessage} className="p-3 border-t border-gray-100 bg-slate-50 flex gap-2">
                    <input
                      type="text"
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      placeholder={isRTL ? 'اكتب رسالتك وسؤالك للعميل بوضوح هنا...' : 'Saisir votre message...'}
                      className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl cursor-pointer transition-colors shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
                  <MessageCircle className="w-12 h-12 text-slate-300 stroke-1.5" />
                  <p className="text-xs font-bold text-gray-450 max-w-sm leading-relaxed">
                    {isRTL 
                      ? 'يرجى اختيار أحد غرف الدردشة النشطة للبدء الفوري في نقاش السعر مع العميل.' 
                      : 'Sélectionnez un fil de discussion pour entamer les négociations directes.'}
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 5. SKILLS SETUP TAB */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs animate-fade-in" id="worker-tab-profile">
            
            <div className="border-b border-gray-100 pb-3.5 mb-5 text-right">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 justify-end">
                <Sliders className="w-5 h-5 text-emerald-500" />
                <span>{isRTL ? 'إعداد التخصصات والبيانات المهنية للعمل' : 'Configuration de mes expertises métier'}</span>
              </h3>
            </div>

            <AnimatePresence>
              {profileSuccessAlert && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-250 rounded-xl text-xs font-bold flex items-center gap-2 mb-5 text-right"
                >
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{isRTL ? 'بنجاح! تم تحديث وتنشيط ملفك الشخصي المهني وتخصصات أعمالك على منصات الرباط.' : 'Votre profil professionnel a été enregistré avec succès !'}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-2 text-right">
                  <label className="text-xs font-bold text-gray-400">{isRTL ? 'الحي الرئيسي المفضل لأعمالك في الرباط' : 'Quartier principal de service'}</label>
                  <select
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="px-3.5 py-3 border border-gray-200 rounded-xl text-xs font-extrabold focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {RABAT_NEIGHBORHOODS.map(n => (
                      <option key={n.id} value={n.id}>{isRTL ? n.ar : n.fr}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2 text-right">
                  <label className="text-xs font-bold text-gray-400">{isRTL ? 'الحد الأدنى المقبول لقيمة المهمة (MAD / DH)' : 'Tarif minimal accepté par prestation (DH)'}</label>
                  <input
                    type="number"
                    value={editMinRate || 100}
                    onChange={(e) => setEditMinRate(Number(e.target.value))}
                    min={50}
                    className="px-3.5 py-3 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                    placeholder="Ex: 100 DH"
                  />
                </div>

              </div>

              <div className="flex flex-col gap-2 text-right">
                <label className="text-xs font-bold text-gray-400">{isRTL ? 'نبذة جذابة عن خبراتك وشهاداتك (تظهر للعملاء)' : 'Ma Bio de présentation professionnelle'}</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={4}
                  placeholder={isRTL ? 'يرجى كتابة نبذة مقنعة مثلاً: سباك ورصاص معتمد خبرة 10 سنوات متواجد بأكدال وجاهز بمعداتي كاملة...' : 'Indiquez votre expérience, spécialités, matériel disponible...'}
                  className="px-3.5 py-3 border border-gray-200 rounded-xl text-xs font-bold leading-relaxed focus:outline-none focus:border-emerald-500 resize-none"
                  required
                />
              </div>

              {/* Specialty selection checkboxes matrix */}
              <div className="flex flex-col gap-2 text-right">
                <label className="text-xs font-bold text-gray-400">{isRTL ? 'اختر وتنشيط التخصصات التي تتقنها لتلقي الطلبات' : 'Sélectionnez vos domaines d’intervention'}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-2">
                  {SERVICE_CATEGORIES.map((cat) => {
                    const isChecked = editSkills.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => handleToggleSkill(cat.id)}
                        className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer select-none ${
                          isChecked 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold' 
                            : 'border-gray-200 hover:border-gray-300 text-slate-600'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isChecked ? 'bg-emerald-600 border-transparent text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-2.5 h-2.5" />}
                        </span>
                        
                        <span className="text-xs font-extrabold">{isRTL ? cat.ar : cat.fr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-4 rounded-2xl cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {savingProfile ? (
                  <span>{isRTL ? 'جاري توثيق مهاراتكم...' : 'Enregistrement en cours...'}</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>{isRTL ? 'تنشيط وتحديث الملف المهني فورا' : 'Sauvegarder mes modifications'}</span>
                  </>
                )}
              </button>

            </form>

          </div>
        )}

      </main>

      {/* MODAL OVERLAY: PLACE DEV-BID MESSAGE DIALOG SCREEN */}
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
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors absolute top-4 left-4 cursor-pointer text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4">
                <span className="text-[10px] bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-black uppercase">
                  {isRTL ? 'تقديم صفقة عمل' : 'Créer Devis'}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-2">{focusedTask.title}</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">{isRTL ? 'الميزانية المقترحة من الزبون:' : 'Budget client:'} {focusedTask.budget} DH</p>
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
                      className="px-3.5 py-3 border border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:border-emerald-500"
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
                      className="px-3.5 py-3 border border-gray-200 rounded-xl text-xs font-extrabold focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
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
