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
  updateDoc,
  serverTimestamp,
  orderBy,
  limit,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { Task, UserProfile, Offer, Review } from '../types';
import { LanguageKey, SERVICE_CATEGORIES, RABAT_NEIGHBORHOODS } from '../data/rabatData';
import { 
  Plus, 
  Sparkles, 
  Droplets, 
  Lightbulb, 
  Truck, 
  Hammer, 
  Laptop, 
  Wrench, 
  Search, 
  Heart, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Wallet, 
  Star, 
  Send, 
  X, 
  Check, 
  User, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  ChevronRight,
  Smile,
  AlertCircle,
  ThumbsUp,
  Settings,
  HelpCircle,
  MessageCircle,
  ArrowRight,
  Phone,
  FileText,
  Upload,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserDashboardProps {
  user: any;
  userProfile: UserProfile | null;
  lang: LanguageKey;
  onSelectTask: (task: Task) => void;
  onOpenSettings: () => void;
  onOpenCreateTask?: () => void;
  onToggleToWorker?: () => void;
}

interface ChatRoom {
  id: string; // taskId_taskerId
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

export default function UserDashboard({
  user,
  userProfile,
  lang,
  onSelectTask,
  onOpenSettings,
  onOpenCreateTask,
  onToggleToWorker
}: UserDashboardProps) {
  const isRTL = lang === 'ar';

  // Navigation state within Customer Dashboard
  // Tabs: 'overview' (Quick actions + status overview), 'tasks' (posted tasks & tracking + escrow), 'workers' (Browse + favorites), 'chat' (Inbox), 'history' (reviews & closed tasks)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'workers' | 'chat' | 'history' | 'files'>('overview');

  // Database lists
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [allWorkers, setAllWorkers] = useState<UserProfile[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  // User uploaded files state
  const [myFiles, setMyFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Offers nested lookup: stores lists of offers by taskId
  const [offersMap, setOffersMap] = useState<Record<string, Offer[]>>({});

  // Favorites (Local Storage backed)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('rabattasker_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Chat system state
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Quick Inline Post task state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickBudget, setQuickBudget] = useState<number>(200);
  const [quickCategory, setQuickCategory] = useState('cleaning');
  const [quickNeighborhood, setQuickNeighborhood] = useState('agdal');
  const [quickDueDate, setQuickDueDate] = useState('');
  const [postingQuickTask, setPostingQuickTask] = useState(false);
  const [postingSuccess, setPostingSuccess] = useState(false);

  // Browse workers filters
  const [workerSearch, setWorkerSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [onlyShowFavorites, setOnlyShowFavorites] = useState(false);

  // Inline rating / review states for completed tasks
  const [ratingInput, setRatingInput] = useState<Record<string, number>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [submittingReviewId, setSubmittingReviewId] = useState<string | null>(null);

  // Reviews given by user history
  const [myGivenReviews, setMyGivenReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Initialize: default date for inline quick-post (tomorrow)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setQuickDueDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Real-time User Files Listener
  useEffect(() => {
    if (!user) return;
    setLoadingFiles(true);
    const q = query(collection(db, 'files'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setMyFiles(list);
      setLoadingFiles(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'files');
      setLoadingFiles(false);
    });
    return () => unsub();
  }, [user]);

  // 1. Fetch current customer's posted tasks
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'tasks'), 
      where('posterId', '==', user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: Task[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Task);
      });
      // Sort tasks by updated/created date
      list.sort((a,b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setMyTasks(list);
      setLoadingTasks(false);

      // Setup nested offers listeners for each of these tasks
      list.forEach((t) => {
        const offersRef = collection(db, 'tasks', t.id, 'offers');
        onSnapshot(offersRef, (offerSnap) => {
          const offersList: Offer[] = [];
          offerSnap.forEach((oDoc) => {
            offersList.push({ id: oDoc.id, ...oDoc.data() } as Offer);
          });
          setOffersMap(prev => ({
            ...prev,
            [t.id]: offersList
          }));
        }, (err) => {
          console.error(`Failed to listen to offers for task ${t.id}`, err);
        });
      });

    }, (err) => {
      console.error("Failed to load posted tasks", err);
      setLoadingTasks(false);
    });
    return () => unsub();
  }, [user]);

  // 2. Fetch all workers in Rabat
  useEffect(() => {
    const q = query(collection(db, 'users'), where('isTasker', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        list.push({ uid: d.id, ...d.data() } as UserProfile);
      });
      setAllWorkers(list);
      setLoadingWorkers(false);
    }, (err) => {
      console.error("Browse workers fetch failed", err);
      setLoadingWorkers(false);
    });
    return () => unsub();
  }, []);

  // 3. Fetch reviews given by this user
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'reviews'), where('reviewerId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list: Review[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Review);
      });
      setMyGivenReviews(list);
      setLoadingReviews(false);
    }, (err) => {
      console.error(err);
      setLoadingReviews(false);
    });
    return () => unsub();
  }, [user]);

  // 4. Load Chat rooms
  useEffect(() => {
    if (!user) return;
    setLoadingRooms(true);

    const q = query(collection(db, 'tasks'));
    const unsub = onSnapshot(q, async (snap) => {
      const rooms: ChatRoom[] = [];
      const promises: Promise<any>[] = [];

      snap.forEach((taskDoc) => {
        const taskObj = taskDoc.data() as Task;
        taskObj.id = taskDoc.id;

        // I am the Employer/Poster
        if (taskObj.posterId === user.uid) {
          const offersRef = collection(db, 'tasks', taskDoc.id, 'offers');
          const p = getDocs(offersRef).then((offSnap) => {
            offSnap.forEach((offDoc) => {
              const offerObj = offDoc.data() as Offer;
              rooms.push({
                id: `${taskDoc.id}_${offerObj.taskerId}`,
                taskId: taskDoc.id,
                taskTitle: taskObj.title,
                otherPartyId: offerObj.taskerId,
                otherPartyName: offerObj.taskerName
              });
            });
          });
          promises.push(p);
        }
      });

      await Promise.all(promises);
      
      // Deduplicate rooms
      const seen = new Set<string>();
      const dedupedRooms = rooms.filter(room => {
        const key = room.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setChatRooms(dedupedRooms);
      setLoadingRooms(false);
    }, (err) => {
      console.error(err);
      setLoadingRooms(false);
    });

    return () => unsub();
  }, [user]);

  // 5. Chat messages retrieval
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
      const chatMsgs: ChatMessage[] = [];
      snap.forEach((d) => {
        chatMsgs.push({ id: d.id, ...d.data() } as ChatMessage);
      });
      setMessages(chatMsgs);
      
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }, (err) => {
      console.warn("Messages retrieval status: OK fallback", err);
    });

    return () => unsub();
  }, [activeRoom]);

  // File uploads processing helper
  const handleUploadFile = async (file: File) => {
    if (file.size > 2.5 * 1024 * 1024) {
      setFileError(isRTL ? 'حجم الملف يتجاوز الحد الأقصى المسموح به (٢.٥ ميجابايت)' : 'Le fichier dépasse la limite de 2.5 Mo.');
      return;
    }
    setFileError(null);
    setUploadingFile(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
          await setDoc(doc(db, 'files', fileId), {
            userId: user.uid,
            fileName: file.name,
            fileUrl: base64String,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size,
            createdAt: serverTimestamp()
          });
          setUploadingFile(false);
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, 'files/' + file.name);
          setUploadingFile(false);
        }
      };
      reader.onerror = () => {
        setFileError(isRTL ? 'حدث خطأ متوقع أثناء قراءة الملف.' : 'Erreur de lecture du fichier.');
        setUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setFileError(err.message || 'Error occurred');
      setUploadingFile(false);
    }
  };

  // Handle Send Chat message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeRoom || !newMessageText.trim()) return;

    const messagePayload = {
      roomId: activeRoom.id,
      senderId: user.uid,
      senderName: userProfile?.displayName || user.displayName || 'الزبون (طالب الخدمة)',
      text: newMessageText.trim(),
      createdAt: serverTimestamp()
    };

    try {
      setNewMessageText('');
      await addDoc(collection(db, 'chatMessages'), messagePayload);
    } catch (err) {
      console.error("Error writing message to Firestore", err);
    }
  };

  // Quick Action: Post new Task instantly
  const handleQuickPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!quickTitle.trim() || !quickDesc.trim() || quickBudget <= 0) {
      alert(isRTL ? 'الرجاء ملء حقول العنوان والوصف وقيمة الميزانية أولاً!' : 'Veuillez remplir le titre, la description et le budget !');
      return;
    }

    setPostingQuickTask(true);
    try {
      const taskPayload = {
        title: quickTitle,
        description: quickDesc,
        budget: Number(quickBudget),
        category: quickCategory,
        location: quickNeighborhood,
        dueDate: quickDueDate || new Date().toISOString().split('T')[0],
        status: 'open',
        posterId: user.uid,
        posterName: userProfile?.displayName || user.displayName || 'أحد سكان الرباط',
        offersCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'tasks'), taskPayload);
      
      // Clear inputs
      setQuickTitle('');
      setQuickDesc('');
      setQuickBudget(200);
      setPostingSuccess(true);
      setTimeout(() => setPostingSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to post quick task", err);
    } finally {
      setPostingQuickTask(false);
    }
  };

  // Toggle workers favorite
  const handleToggleFavorite = (workerId: string) => {
    const updated = favorites.includes(workerId)
      ? favorites.filter(id => id !== workerId)
      : [...favorites, workerId];
    setFavorites(updated);
    localStorage.setItem('rabattasker_favorites', JSON.stringify(updated));
  };

  // Start instant Chat with worker
  const handleInitiateChat = async (worker: UserProfile, preFilledTask?: Task) => {
    if (!user) return;
    
    // Check if we can map to an existing task to form a roomId (taskId_workerId)
    // If no specific task is selected or pre-filled, we locate or assign a temporary virtual roomId
    const targetTaskId = preFilledTask?.id || 'direct_hire_channel';
    const computedRoomId = `${targetTaskId}_${worker.uid}`;

    const newChatRoom: ChatRoom = {
      id: computedRoomId,
      taskId: targetTaskId,
      taskTitle: preFilledTask?.title || (isRTL ? 'طلب مخصص مباشر' : 'Discussion de direct-hire'),
      otherPartyId: worker.uid,
      otherPartyName: worker.displayName
    };

    // Add locally to list so it is highlighted, then activate tab
    setChatRooms(prev => {
      if (prev.some(r => r.id === computedRoomId)) return prev;
      return [newChatRoom, ...prev];
    });

    setActiveRoom(newChatRoom);
    setActiveTab('chat');
  };

  // Accept Offer System
  const handleAcceptOffer = async (task: Task, offer: Offer, siblingOffers: Offer[]) => {
    if (!user || task.posterId !== user.uid) return;

    const confirmText = isRTL 
      ? `هل تريد قبول عرض ${offer.taskerName} بقيمة ${offer.amount} درهم مغربي؟ سيتم حجز ميزانية المهمة في نظام الضمان المالي الآمن (Escrow) فوراً.`
      : `Voulez-vous accepter l'offre de ${offer.taskerName} pour ${offer.amount} MAD ? Les fonds seront sécurisés sur le compte Escrow immédiatement.`;

    if (!window.confirm(confirmText)) return;

    try {
      // 1. Update task to assigned and record tasker info
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        status: 'assigned',
        taskerId: offer.taskerId,
        taskerName: offer.taskerName,
        budget: offer.amount, // update task budget to the agreed accepted amount
        escrowFunded: true, // mark escrow as funded
        updatedAt: serverTimestamp()
      });

      // 2. Update status of the accepted offer
      const offerRef = doc(db, 'tasks', task.id, 'offers', offer.id);
      await updateDoc(offerRef, { status: 'accepted' });

      // 3. Mark sibling offers as declined
      for (const other of siblingOffers) {
        if (other.id !== offer.id) {
          const sisterRef = doc(db, 'tasks', task.id, 'offers', other.id);
          await updateDoc(sisterRef, { status: 'declined' });
        }
      }

      alert(isRTL ? 'تهانينا! تم تعيين الحرفي وتأمين الميزانية في نظام الضمان بنجاح 🔒.' : 'Succès! Prestataire désigné et dépôt Escrow sécurisé 🔒.');
    } catch (err) {
      console.error(err);
    }
  };

  // Change status of task to Completed & Prompt instant rating feedback
  const handleCompleteTask = async (task: Task) => {
    if (!user || task.posterId !== user.uid) return;

    const confirmText = isRTL 
      ? 'هل تود تأكيد اكتمال وإنجاز العمل؟ سيقوم النظام بتحرير وإفراج رصيد الضمان المالي (Escrow) للحرفي فور تلقيه موافقتك.'
      : 'Voulez-vous confirmer la réalisation de cette tâche ? L’Escrow sera débloqué et versé au prestataire.';

    if (!window.confirm(confirmText)) return;

    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        status: 'completed',
        escrowReleased: true, // paid out
        updatedAt: serverTimestamp()
      });
      alert(isRTL ? 'رائع! تم تحرير وإرسال المستحقات لحساب الحرفي بنجاح. يرجى كتابة تقييم قصير له.' : 'Fascinant ! Fonds d’Escrow libérés. Veuillez évaluer le prestataire.');
    } catch (err) {
      console.error(err);
    }
  };

  // Submitting review feedback for worker
  const handlePostReview = async (taskId: string, workerId: string, workerName: string) => {
    const stars = ratingInput[taskId] || 5;
    const comment = commentInput[taskId] || '';

    if (!comment.trim()) {
      alert(isRTL ? 'يرجى كتابة تعليق تقييمي بسيط أولاً لتوجيه سكان الرباط الآخرين.' : 'Veuillez écrire un petit commentaire sur le service.');
      return;
    }

    setSubmittingReviewId(taskId);
    try {
      const reviewPayload = {
        taskId,
        reviewerId: user.uid,
        reviewerName: userProfile?.displayName || user.displayName || 'أحد الزبائن بمهمات الرباط',
        revieweeId: workerId,
        rating: Number(stars),
        comment: comment.trim(),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'reviews'), reviewPayload);

      // Mark the task as fully reviewed
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        isReviewed: true,
        updatedAt: serverTimestamp()
      });

      // Clear review form fields
      setRatingInput(prev => ({ ...prev, [taskId]: 5 }));
      setCommentInput(prev => ({ ...prev, [taskId]: '' }));

      alert(isRTL ? 'شكراً لك على تقييم جودة الخدمة! تساهم رأيك في تحسين جودة وتكامل مجتمعتنا.' : 'Merci pour votre évaluation ! contribution enregistrée.');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReviewId(null);
    }
  };

  // Filter lists of workers
  const filteredWorkers = allWorkers.filter(w => {
    const matchesSearch = w.displayName?.toLowerCase().includes(workerSearch.toLowerCase()) || 
                          w.bio?.toLowerCase().includes(workerSearch.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || w.bio?.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
    const matchesFavorites = !onlyShowFavorites || favorites.includes(w.uid);
    // Exclude current client himself
    const isNotMe = w.uid !== user?.uid;

    return matchesSearch && matchesCategory && matchesFavorites && isNotMe;
  });

  // Category Icon Mapper
  const renderCategoryIcon = (catId: string, sizeClass = "w-5 h-5") => {
    switch (catId) {
      case 'cleaning': return <Sparkles className={`${sizeClass} text-blue-500`} />;
      case 'plumbing': return <Droplets className={`${sizeClass} text-cyan-500`} />;
      case 'electricity': return <Lightbulb className={`${sizeClass} text-amber-500`} />;
      case 'moving': return <Truck className={`${sizeClass} text-emerald-500`} />;
      case 'repairs': return <Hammer className={`${sizeClass} text-orange-500`} />;
      case 'gardening': return <Wrench className={`${sizeClass} text-teal-500`} />; // Fallback
      case 'it_support': return <Laptop className={`${sizeClass} text-purple-500`} />;
      default: return <Wrench className={`${sizeClass} text-blue-500`} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 w-full flex flex-col font-sans text-slate-800" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* HEADER: USER JUMBOTRON */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-650 to-indigo-700 text-white rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-5 text-center md:text-right flex-col md:flex-row">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-indigo-700 flex items-center justify-center font-black text-3xl shadow-xl border-4 border-white/20">
              {userProfile?.displayName ? userProfile.displayName.charAt(0) : '?'}
            </div>
            
            <div className="flex flex-col gap-1.5 md:items-start items-center">
              <div className="flex flex-wrap items-center gap-2 justify-center">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{userProfile?.displayName || user.displayName || 'مستخدم متميز'}</h2>
                <span className="bg-emerald-500 text-white text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-xs animate-pulse">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'حساب زبون مؤمن' : 'Client Sécurisé'}</span>
                </span>
              </div>
              <p className="text-xs text-blue-100 max-w-md font-medium">
                {userProfile?.bio || (isRTL ? 'أنت في الصفحة الخاصة بطالب الخدمة. انشر مهامك، وتواصل مع الحرفيين المعتمدين في الرباط.' : 'Espace de commande. Postez des missions et négociez en direct avec les experts.')}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-blue-200 font-semibold bg-white/10 px-3 py-1.5 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{userProfile?.location || (isRTL ? 'أكدال، الرباط' : 'Agdal, Rabat')}</span>
                <span className="opacity-40">|</span>
                <Heart className="w-3.5 h-3.5 text-rose-450 fill-rose-400 shrink-0" />
                <span>{favorites.length} {isRTL ? 'من الحرفيين المفضلين' : 'prestataires sauvegardés'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onToggleToWorker && (
              <button
                onClick={onToggleToWorker}
                className="bg-white hover:bg-slate-50 text-indigo-800 font-extrabold text-xs sm:text-xs px-5 py-3.5 rounded-2xl transition-all cursor-pointer shadow-md flex items-center gap-2 active:scale-95"
              >
                <Wrench className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{isRTL ? 'التبديل إلى لوحة المستقل (مقدم الخدمة)' : 'Mode Prestataire (Gagner de l’argent)'}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onOpenCreateTask) {
                  onOpenCreateTask();
                } else {
                  setActiveTab('overview');
                  setTimeout(() => {
                    document.getElementById('quick-post-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="bg-emerald-550 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all cursor-pointer shadow-md shadow-emerald-500/10 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-5 h-5 shrink-0" />
              <span>{isRTL ? 'انشر مهمة جديدة للبدء 🚀' : 'Poster une tâche 🚀'}</span>
            </button>
            
            <button
              onClick={onOpenSettings}
              className="bg-white/15 hover:bg-white/20 text-white font-bold text-xs p-3.5 rounded-2xl transition-all cursor-pointer border border-white/10"
              title={isRTL ? 'تعديل الإعدادات' : 'Paramètres'}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* DASHBOARD TAB NAVIGATION BAR */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <nav className="flex overflow-x-auto py-1 scrollbar-none gap-2 w-full md:w-auto" id="dashboard-navbar-list">
              {[
                { id: 'overview', labelAr: 'موجز السيطرة ولوحة التحكم', labelFr: 'Accueil & Post', icon: Sparkles },
                { id: 'tasks', labelAr: 'مهامي وتتبع العروض والمستحقات', labelFr: 'Tâches & Escrow', icon: Clock },
                { id: 'workers', labelAr: 'دليل الحرفيين والمفضلين', labelFr: 'Artisans & Favoris', icon: User },
                { id: 'chat', labelAr: 'الدرشة والرسائل النشطة', labelFr: 'Discussions', icon: MessageSquare },
                { id: 'history', labelAr: 'المهام المؤرشفة والتوصيات', labelFr: 'Historique', icon: CheckCircle },
                { id: 'files', labelAr: 'مستنداتي وملفاتي المرفوعة', labelFr: 'Mes documents', icon: FileText }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-4.5 text-xs sm:text-sm font-black transition-all cursor-pointer border-b-4 select-none whitespace-nowrap ${
                      isActive 
                        ? 'border-blue-600 text-blue-700 font-extrabold' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <tab.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span>{isRTL ? tab.labelAr : tab.labelFr}</span>
                  </button>
                );
              })}
            </nav>
            <div className="hidden md:flex items-center gap-2 text-xs font-mono font-bold text-gray-400">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" />
              <span>{isRTL ? 'جلسة مستخدم حية' : 'Live session active'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER PAGE CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1 flex flex-col gap-6">

        {/* 1. OVERVIEW TAB: WELCOME + QUICK ACTIONS + STATS */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6 animate-fade-in" id="customer-tab-overview">

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex items-center justify-between">
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">{isRTL ? 'إجمالي طلباتي المنشورة' : 'Missions publiées'}</span>
                  <span className="text-2xl font-black text-slate-900">{myTasks.length}</span>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <HelpCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex items-center justify-between">
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">{isRTL ? 'مهمات معلقة تبحث عن مستقلين' : 'Tâches en attente'}</span>
                  <span className="text-2xl font-black text-amber-600">{myTasks.filter(t => t.status === 'open').length}</span>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex items-center justify-between">
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">{isRTL ? 'مهمات نشطة قيد الإنجاز' : 'En exécution'}</span>
                  <span className="text-2xl font-black text-blue-600">{myTasks.filter(t => t.status === 'assigned').length}</span>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex items-center justify-between">
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">{isRTL ? 'إجمالي الميزانية في الضمان المالي' : 'Sécurisé sur Escrow'}</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {myTasks.reduce((sum, t) => sum + (t.status === 'assigned' ? t.budget : 0), 0)} DH
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Instant Quick-Post Form (Speeds up posting tasks significantly) */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 flex flex-col justify-between shadow-xs relative" id="quick-post-section">
                
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-black text-slate-800">{isRTL ? 'نشر مهمة سريعة فائقة السرعة ⚡' : 'Publication Rapide Directe ⚡'}</h3>
                  </div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 font-extrabold px-2 py-0.5 rounded uppercase">
                    Rabat Direct
                  </span>
                </div>

                <AnimatePresence>
                  {postingSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-emerald-50 text-emerald-800 border border-emerald-250 p-4 rounded-xl text-xs font-bold flex items-center gap-2 mb-4 text-right"
                    >
                      <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{isRTL ? 'تم نشر مهمتك السريعة بنجاح! سيصلك عروض من أفضل الحرفيين المعتمدين في الرباط خلال دقائق.' : 'Votre tâche rapide a été publiée ! Vous recevrez des offres très vite.'}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleQuickPost} className="flex flex-col gap-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    <div className="flex flex-col gap-1.5 text-right">
                      <label className="text-[10px] font-bold text-gray-400">{isRTL ? 'الميزانية المقترحة بالدرهم المغربي (MAD / DH)' : 'Budget (MAD)'}</label>
                      <input 
                        type="number"
                        value={quickBudget}
                        onChange={(e) => setQuickBudget(Number(e.target.value))}
                        min={50}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold leading-none focus:outline-none focus:border-blue-500"
                        placeholder="200 DH"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 text-right">
                      <label className="text-[10px] font-bold text-gray-400">{isRTL ? 'عنوان المهمة الفوري' : 'Titre de la tâche'}</label>
                      <input 
                        type="text"
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        placeholder={isRTL ? 'مثال: غسيل السجاد والستائر في حسان' : 'Ex: Nettoyage canapé à Hassan'}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold leading-none focus:outline-none focus:border-blue-500 text-right"
                        required
                      />
                    </div>

                  </div>

                  <div className="flex flex-col gap-1.5 text-right">
                    <label className="text-[10px] font-bold text-gray-400">{isRTL ? 'ما هي الأشياء التي تريد من الحرفي القيام بها بالظبط؟' : 'Description précise des travaux'}</label>
                    <textarea 
                      value={quickDesc}
                      onChange={(e) => setQuickDesc(e.target.value)}
                      rows={3}
                      placeholder={isRTL ? 'يرجى تقديم تفاصيل قصيرة مثل: جلب أدوات الغسيل، المساحة التقريبية للغرف...' : 'Indiquez les détails importants, le matériel...' }
                      className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold leading-normal focus:outline-none focus:border-blue-500 resize-none text-right"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    
                    <div className="flex flex-col gap-1.5 text-right">
                      <label className="text-[10px] font-bold text-gray-400">{isRTL ? 'فئة الخدمة المطلوبة' : 'Catégorie'}</label>
                      <select 
                        value={quickCategory}
                        onChange={(e) => setQuickCategory(e.target.value)}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-blue-500 bg-white"
                      >
                        {SERVICE_CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{isRTL ? c.ar : c.fr}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 text-right">
                      <label className="text-[10px] font-bold text-gray-400">{isRTL ? 'نطاق أو حي السكن بالرباط' : 'Quartier'}</label>
                      <select 
                        value={quickNeighborhood}
                        onChange={(e) => setQuickNeighborhood(e.target.value)}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-blue-500 bg-white"
                      >
                        {RABAT_NEIGHBORHOODS.map(n => (
                          <option key={n.id} value={n.id}>{isRTL ? n.ar : n.fr}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 text-right">
                      <label className="text-[10px] font-bold text-gray-400">{isRTL ? 'تاريخ التنفيذ المطلوب' : 'Date d’exécution'}</label>
                      <input 
                        type="date"
                        value={quickDueDate}
                        onChange={(e) => setQuickDueDate(e.target.value)}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                  </div>

                  <button
                    type="submit"
                    disabled={postingQuickTask}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3 px-5 rounded-2xl cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {postingQuickTask ? (
                      <span>{isRTL ? 'جاري النشر وتعميم الطلب...' : 'Publication en cours...'}</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-white" />
                        <span>{isRTL ? 'تأكيد ونشر المهمة فوراً للجميع 📢' : 'Publier ma tâche maintenant 📢'}</span>
                      </>
                    )}
                  </button>

                </form>

              </div>

              {/* Quick Side panels: Inbox Rooms & Saved Workers favorites list */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* 1. Inbox Room list */}
                <div className="bg-white p-5 rounded-3xl border border-gray-200 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      <h4 className="text-xs font-black text-slate-800 uppercase">{isRTL ? 'المحادثات النشطة الجارية ومكالماتك' : 'Messages Instantanés'}</h4>
                    </div>
                    <span className="text-[9px] bg-blue-50 text-blue-600 font-extrabold px-2 py-0.5 rounded">
                      {chatRooms.length} CHATS
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
                    {chatRooms.length === 0 ? (
                      <div className="py-8 text-center text-[10px] text-gray-400 font-semibold leading-relaxed">
                        {isRTL ? 'لم تبدأ أي دردشة بعد مع موظفين مهتمين بطلبك.' : 'Aucun chat actif. Négociez dès réception d’offres.'}
                      </div>
                    ) : (
                      chatRooms.slice(0, 3).map((room) => (
                        <button
                          key={room.id}
                          onClick={() => {
                            setActiveRoom(room);
                            setActiveTab('chat');
                          }}
                          className="p-3 rounded-xl border border-gray-150 text-right flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                            <span className="text-xs font-black text-slate-800">{room.otherPartyName}</span>
                          </div>
                          <span className="text-[10px] text-gray-450 truncate max-w-[140px] font-bold">{room.taskTitle}</span>
                        </button>
                      ))
                    )}
                  </div>
                  {chatRooms.length > 3 && (
                    <button 
                      onClick={() => setActiveTab('chat')}
                      className="mt-2 text-[10px] text-blue-600 font-extrabold flex items-center justify-center gap-1 hover:underline self-center"
                    >
                      <span>{isRTL ? 'عرض كافة المحادثات الجارية' : 'Voir tous les chats'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* 2. Top Favorited Workers widget */}
                <div className="bg-white p-5 rounded-3xl border border-gray-200 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                      <h4 className="text-xs font-black text-slate-800 uppercase">{isRTL ? 'المستقلين المفضلين لديك' : 'Prestataires Favoris'}</h4>
                    </div>
                    <span className="text-[9px] bg-rose-50 text-rose-600 font-extrabold px-2 py-0.5 rounded">
                      {favorites.length} SAVED
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
                    {favorites.length === 0 ? (
                      <div className="py-8 text-center text-[10px] text-gray-450 font-medium font-semibold leading-relaxed">
                        {isRTL ? 'لا يوجد حرفيين مفضلين بعد. قم بزيارة "دليل الحرفيين" لحفظ من يعجبك عملهم!' : 'Aucun prestataire en favoris. Parcourez l’onglet Artisans.'}
                      </div>
                    ) : (
                      allWorkers.filter(w => favorites.includes(w.uid)).slice(0, 3).map((w) => (
                        <div key={w.uid} className="p-3 rounded-xl border border-gray-150 flex items-center justify-between flex-row-reverse text-right">
                          <div className="flex items-center gap-2 flex-row-reverse">
                            <div className="w-7 h-7 bg-blue-100 text-blue-700 font-black rounded-full text-[10px] flex items-center justify-center">
                              {w.displayName?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900 leading-tight">{w.displayName}</span>
                              <span className="text-[9px] text-gray-450 font-bold flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" /> <span>{w.rating?.toFixed(1) || '5.0'}</span></span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleInitiateChat(w)}
                              className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-black text-[10px] rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{isRTL ? 'تواصل' : 'Contacter'}</span>
                            </button>
                            <button
                              onClick={() => handleToggleFavorite(w.uid)}
                              className="p-1 px-2 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors"
                            >
                              <Heart className="w-4 h-4 fill-rose-500" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {favorites.length > 3 && (
                    <button 
                      onClick={() => {
                        setOnlyShowFavorites(true);
                        setActiveTab('workers');
                      }}
                      className="mt-2 text-[10px] text-rose-600 font-extrabold flex items-center justify-center gap-1 hover:underline self-center"
                    >
                      <span>{isRTL ? 'تصفح كل المفضلين' : 'Parcourir tous mes favoris'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* 2. CHATS TAB: ACTIVE WORKERS DISCUSSIONS */}
        {activeTab === 'chat' && (
          <div className="flex-1 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[550px] animate-fade-in" id="customer-tab-chat">
            
            {/* Sidebar Active Chats */}
            <div className="w-full md:w-80 border-r md:border-r-0 md:border-l border-gray-200 shrink-0 bg-slate-50 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-blue-50/10">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-2 justify-end">
                  <MessageSquare className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                  <span>{isRTL ? 'غرف الدردشة والمفاوضات النشطة' : 'Messageries Actives'}</span>
                </h4>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5 max-h-[250px] md:max-h-[500px]">
                {loadingRooms ? (
                  <div className="p-4 text-center text-[10px] text-gray-400 animate-pulse">{isRTL ? 'جاري جلب الرسائل التفاهمية...' : 'Chargement...'}</div>
                ) : chatRooms.length === 0 ? (
                  <div className="py-12 p-4 text-center text-[10px] text-gray-400 font-bold leading-relaxed">
                    {isRTL 
                      ? 'لا توجد محادثات جارية حالياً. تفتح القنوات آلياً عند إرسال حرفي لعرض سعر على مهامك المعلقة.' 
                      : 'Aucun chat ouvert. Négociez en recevant des propositions de tarifs.'}
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
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                            : 'border border-transparent bg-white shadow-xs hover:bg-blue-50/40'
                        }`}
                      >
                        <span className={`text-[10px] font-black line-clamp-1 ${isActive ? 'text-blue-100' : 'text-blue-600'}`}>{room.taskTitle}</span>
                        <span className={`text-xs font-extrabold flex items-center gap-1.5 justify-end ${isActive ? 'text-white' : 'text-slate-800'}`}>
                          <span>{room.otherPartyName}</span>
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-green-550'}`} />
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live Message Body */}
            <div className="flex-1 flex flex-col bg-white">
              {activeRoom ? (
                <>
                  <div className="p-4.5 border-b border-gray-100 flex items-center justify-between flex-row bg-slate-50/40">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-black uppercase">
                        {isRTL ? 'مؤمن وحي' : 'Sécurisé'}
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
                          ? 'بوابة دردشة مفتوحة مباشرة. ناقش السعر، تاريخ الحضور أو اطلب صور وتفاصيل إضافية للمشكلة.' 
                          : 'Proposez des détails supplémentaires, du matériel, etc.'}
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
                                ? 'bg-blue-600 text-white rounded-tr-none' 
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
                      placeholder={isRTL ? 'اكتب تفاهمك مع الحرفي...' : 'Écrivez vos détails aux prestataires...'}
                      className="flex-1 text-xs border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-blue-500 font-bold"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl cursor-pointer active:scale-95 transition-all text-white"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3">
                  <div className="p-4 bg-sky-50 text-blue-600 rounded-3xl">
                    <MessageSquare className="w-10 h-10 ml-0" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">{isRTL ? 'اختر ممثلاً أو حرفياً لبدء المفاوضات والدردشة' : 'Sélectionnez un historique de discussion'}</span>
                  <p className="text-[10px] text-gray-400 max-w-sm leading-relaxed font-bold">
                    {isRTL ? 'لإبقاء المعاملات آمنة ومنع الاحتيال، تأكد من إبقاء المحادثات والاتفاقية مكتوبة دائماً داخل المنصة.' : 'Gardez vos communications sur la plateforme pour préserver vos garanties.'}
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 3. TASKS TAB: POSTED MISSIONS & ESCROW STATUS TRACKING */}
        {activeTab === 'tasks' && (
          <div className="flex flex-col gap-5 animate-fade-in" id="customer-tab-tasks">
            
            <div className="flex items-center justify-between border-b pb-3 border-gray-200/60 text-right">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-black text-slate-900">{isRTL ? 'إدارة وتتبع مهمات العمل النشطة وعروضها' : 'Suivi des missions & offres de prix'}</h3>
                <span className="text-[10px] text-gray-450 font-bold">{isRTL ? 'راقب تقدم عروض الحرفيين على مهامك، تحكم في تأمين مبالغ الضمان وسرعة الإسناد المالي.' : 'Espace d\'arbitrage et de paiement sécurisé'}</span>
              </div>
            </div>

            {loadingTasks ? (
              <div className="h-44 bg-white rounded-3xl border border-gray-150 animate-pulse w-full" />
            ) : myTasks.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-gray-150 flex flex-col items-center gap-3 justify-center">
                <Clock className="w-10 h-10 text-gray-300" />
                <span className="text-xs font-bold text-gray-700">{isRTL ? 'لم تقم بنشر أي مهمة جديدة تبحث عن منجز بالرباط بعد.' : 'Aucune tâche publiée.'}</span>
                <button
                  onClick={() => {
                    if (onOpenCreateTask) {
                      onOpenCreateTask();
                    } else {
                      setActiveTab('overview');
                      setTimeout(() => {
                        document.getElementById('quick-post-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-5 py-3 rounded-xl cursor-pointer"
                >
                  {isRTL ? 'انشر مهمتك الأولى الآن' : 'Créer une tâche'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {myTasks.map((task) => {
                  const taskOffers = offersMap[task.id] || [];
                  const isAssigned = task.status === 'assigned';
                  const isCompleted = task.status === 'completed';
                  const isCancelled = task.status === 'cancelled';
                  const isOpen = task.status === 'open';

                  return (
                    <div 
                      key={task.id}
                      className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs text-right flex flex-col gap-5 transition-all"
                    >
                      {/* Task info block */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                        
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                            {renderCategoryIcon(task.category, "w-6 h-6")}
                          </div>
                          <div className="flex flex-col">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span>{task.dueDate}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                                <span>{RABAT_NEIGHBORHOODS.find(n => n.id === task.location)?.ar || task.location}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status tracker */}
                        <div className="flex items-center gap-2.5 justify-end">
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                            isOpen ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                            isAssigned ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {isOpen && (isRTL ? 'مفتوح للتقديم' : 'Ouvert')}
                            {isAssigned && (isRTL ? 'مُسند قيد الإنجاز' : 'En cours')}
                            {isCompleted && (isRTL ? 'مكتمل ومغلق' : 'Complété')}
                            {isCancelled && (isRTL ? 'ملغى' : 'Annulé')}
                          </span>

                          <span className="text-sm font-black text-blue-600 bg-blue-50 px-3.5 py-1 rounded-xl">
                            {task.budget} DH
                          </span>
                        </div>

                      </div>

                      {/* Decription */}
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {task.description}
                      </p>

                      {/* CUSTOM PAYMENTS ESCROW SYSTEM GRAPHICS */}
                      <div className="bg-indigo-50/40 border border-indigo-100/75 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right">
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-xs">
                            <Wallet className="w-5 h-5 text-indigo-650" />
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-[10.5px] font-semibold text-slate-800 flex items-center gap-1">
                              {isOpen && (isRTL ? 'حالة الضمان: جاهز للإيداع الآمن (حماية الضمان بموجب عقد)' : 'Escrow : En attente d’attribution')}
                              {isAssigned && (isRTL ? 'حالة الضمان: تم حجز وتأمين الرصيد بسلامة' : 'Escrow : FONDS SÉCURISÉS')}
                              {isCompleted && (isRTL ? 'حالة الضمان: تم تحرير وإفراج الرصيد بنجاح' : 'Escrow : FONDS TRANSFÉRÉS')}
                              {isCancelled && (isRTL ? 'حالة الضمان: تم الإرجاع بالكامل' : 'Escrow : Remboursé')}
                            </span>
                            <span className="text-[9.5px] text-gray-400 font-bold mt-0.5">
                              {isOpen && (isRTL ? 'مبلغ الميزانية في وضع الانتظار لجذب أفضل المنجزين.' : 'Dépôt garanti à l’affectation.')}
                              {isAssigned && (isRTL ? 'الرصيد محجوز في حساب وسيط مغلق ولا نحرره أبداً إلا بموافقتك.' : 'Le montant est bloqué au prestataire jusqu’à la validation.')}
                              {isCompleted && (isRTL ? 'تم صرف وإيصال الرصيد للحرفي وتفويض دفعة Payzone Maroc.' : 'Le prestataire a reçu ses gains.')}
                            </span>
                          </div>
                        </div>

                        {isAssigned && (
                          <button
                            onClick={() => handleCompleteTask(task)}
                            className="bg-emerald-550 hover:bg-emerald-600 text-white text-xs font-black px-4.5 py-2.5 rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all text-center self-end sm:self-center flex items-center gap-1.5 justify-center"
                          >
                            <Check className="w-3.5 h-3.5 shrink-0 text-white" />
                            <span>{isRTL ? 'تأكيد وإفراج الرصيد للحرفي' : 'Valider & Libérer les fonds'}</span>
                          </button>
                        )}
                      </div>

                      {/* Task offers list */}
                      {isOpen && (
                        <div className="border-t border-gray-100 pt-4">
                          <div className="flex items-center justify-between flex-row-reverse mb-3">
                            <span className="text-xs font-black text-slate-800">{isRTL ? 'العروض السعرية وعروض التوظيف المستلمة' : 'Propositions reçues'}</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-2 py-0.5 rounded-lg">
                              {taskOffers.length} {isRTL ? 'عروض سعر' : 'offres'}
                            </span>
                          </div>

                          {taskOffers.length === 0 ? (
                            <div className="py-6 text-center text-[10px] text-gray-450 font-bold">
                              {isRTL ? 'لم يتم تقديم أي عرض سعر بعد من الفنيين. ابق عينك على لوحة التحكم!' : 'Aucune offre soumise pour l’instant.'}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {taskOffers.map((offer) => (
                                <div key={offer.id} className="bg-slate-50/50 hover:bg-slate-50 border border-gray-200/80 p-4 rounded-2xl flex flex-col justify-between text-right gap-3">
                                  
                                  <div className="flex items-center justify-between flex-row">
                                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-0.5 rounded-lg">
                                      {offer.amount} DH
                                    </span>
                                    <div className="flex items-center gap-1.5 flex-row-reverse">
                                      <div className="w-6.5 h-6.5 bg-blue-105 text-blue-700 font-black rounded-full text-[10px] flex items-center justify-center">
                                        {offer.taskerName?.charAt(0)}
                                      </div>
                                      <span className="text-xs font-black text-slate-900 leading-none">{offer.taskerName}</span>
                                    </div>
                                  </div>

                                  <p className="text-[10px] text-slate-600 italic leading-relaxed">
                                    "{offer.message}"
                                  </p>

                                  <div className="flex items-center gap-1.5 self-start pt-1.5">
                                    <button
                                      onClick={() => handleInitiateChat({ uid: offer.taskerId, displayName: offer.taskerName } as UserProfile, task)}
                                      className="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-slate-700 text-[10px] font-black rounded-xl cursor-pointer flex items-center gap-1"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                                      <span>{isRTL ? 'تفاوض ودردش' : 'Négocier'}</span>
                                    </button>

                                    <button
                                      onClick={() => handleAcceptOffer(task, offer, taskOffers)}
                                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-xl cursor-pointer"
                                    >
                                      {isRTL ? 'قبول وتعيين الحرفي' : 'Accepter & Attribuer'}
                                    </button>
                                  </div>

                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* If status is assigned / completed with worker display */}
                      {isAssigned && task.taskerName && (
                        <div className="bg-blue-50/30 p-3.5 rounded-2xl flex items-center justify-between flex-row-reverse text-right border border-blue-100">
                          <div className="flex items-center gap-2.5 flex-row-reverse">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                              {task.taskerName.charAt(0)}
                            </div>
                            <div className="flex flex-col text-right">
                              <span className="text-xs font-black text-slate-900">{task.taskerName}</span>
                              <span className="text-[9.5px] text-gray-400 font-bold">{isRTL ? 'الحرفي المعين للمهمة والمفوض بالعمل' : 'Prestataire désigné'}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleInitiateChat({ uid: task.taskerId, displayName: task.taskerName } as any, task)}
                            className="bg-white hover:bg-gray-150 border border-gray-200 text-slate-700 px-3.5 py-2 rounded-xl text-[10.5px] font-black cursor-pointer flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                            <span>{isRTL ? 'راسل الحرفي مباشرة' : 'Planifier / Discuter'}</span>
                          </button>
                        </div>
                      )}

                      {/* Ask Review input if task completed and not rated yet */}
                      {isCompleted && task.taskerId && !task.isReviewed && (
                        <div className="border-t border-gray-100 pt-4" id={`review-container-${task.id}`}>
                          <h5 className="text-xs font-black text-slate-900 mb-2">{isRTL ? 'شارك رأيك بخصوص جودة وأداء الحرفي' : 'Laisser un avis d’expérience'}</h5>
                          
                          <div className="flex flex-col gap-3 text-right">
                            <div className="flex items-center gap-1.5 flex-row-reverse">
                              <span className="text-[10px] text-gray-400 font-bold">{isRTL ? 'التقييم العام بالنجوم:' : 'Note globale :'}</span>
                              <div className="flex gap-1 flex-row-reverse">
                                {[1,2,3,4,5].map((starsNum) => {
                                  const currentRating = ratingInput[task.id] || 5;
                                  return (
                                    <button 
                                      type="button"
                                      key={starsNum}
                                      onClick={() => setRatingInput(prev => ({ ...prev, [task.id]: starsNum }))}
                                      className="p-1 cursor-pointer"
                                    >
                                      <Star className={`w-5 h-5 ${starsNum <= currentRating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <textarea
                              rows={2}
                              value={commentInput[task.id] || ''}
                              onChange={(e) => setCommentInput(prev => ({ ...prev, [task.id]: e.target.value }))}
                              placeholder={isRTL ? 'اكتب تقييم صريح لمساعدته وتحسين تكامل المنصة...' : 'Partagez votre avis...'}
                              className="w-full text-xs p-3 rounded-xl border border-gray-200 text-right focus:outline-none focus:border-blue-500"
                            />

                            <button
                              type="button"
                              onClick={() => handlePostReview(task.id, task.taskerId!, task.taskerName!)}
                              disabled={submittingReviewId === task.id}
                              className="self-end bg-blue-600 hover:bg-blue-700 text-white px-4.5 py-2 rounded-xl text-[10.5px] font-black cursor-pointer disabled:opacity-50 flex items-center gap-1.5 justify-center"
                            >
                              <Send className="w-3.5 h-3.5 shrink-0 text-white" />
                              <span>{isRTL ? 'إرسال التقييم النهائي' : 'Soumettre mon avis'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* If evaluated already */}
                      {isCompleted && task.isReviewed && (
                        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl text-[10px] font-bold text-center border border-emerald-100 flex items-center justify-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          <span>{isRTL ? 'لقد قمت بتقييم وإرسال التغذية الراجعة لهذا العمل بنجاح. شكراً لك.' : 'Vous avez évalué cette mission. Merci !'}</span>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* 4. WORKERS TAB: BROWSE WORKERS & SAVED FAVORITES */}
        {activeTab === 'workers' && (
          <div className="flex flex-col gap-6 animate-fade-in" id="customer-tab-workers">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div className="flex flex-col text-right">
                <h3 className="text-sm font-black text-slate-900 uppercase">{isRTL ? 'دليل الحرفيين والمنجزين المعتمدين بالرباط' : 'Annuaire & Radars des prestataires'}</h3>
                <span className="text-[10px] text-gray-450 font-bold">{isRTL ? 'تصفح كبار المنجزين، المفضلين لديك والمحترفين لمراسلتهم مباشرة.' : 'Découvrez et engagez directement les meilleurs experts locaux'}</span>
              </div>

              {/* Favorites toggle filter */}
              <button
                type="button"
                onClick={() => setOnlyShowFavorites(!onlyShowFavorites)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-2 ${
                  onlyShowFavorites 
                    ? 'bg-rose-50 border-rose-200 text-rose-700 font-extrabold shadow-sm' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${onlyShowFavorites ? 'fill-rose-500 text-rose-600' : 'text-gray-400'}`} />
                <span>{isRTL ? 'المستقلين المفضلين والمحفوظين' : 'Favoris uniquement'}</span>
              </button>
            </div>

            {/* Filters inputs bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="relative">
                <input
                  type="text"
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                  placeholder={isRTL ? 'بحث سريع باسم الحرفي أو الكلمات الدلالية...' : 'Rechercher par nom ou descriptif...'}
                  className="w-full text-xs px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 font-semibold"
                />
                <Search className={`absolute w-4 h-4 text-gray-400 top-3.5 ${isRTL ? 'left-3' : 'right-3'}`} />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="text-xs px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 font-bold"
              >
                <option value="all">{isRTL ? 'كل الفئات والمهن' : 'Toutes les catégories'}</option>
                {SERVICE_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{isRTL ? c.ar : c.fr}</option>
                ))}
              </select>

            </div>

            {/* Workers grid list */}
            {loadingWorkers ? (
              <div className="h-44 bg-white rounded-3xl border border-gray-150 animate-pulse w-full" />
            ) : filteredWorkers.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-gray-150 flex flex-col items-center gap-2.5 justify-center">
                <User className="w-10 h-10 text-gray-300" />
                <span className="text-xs font-bold text-gray-800">{isRTL ? 'لم يتم العثور على أي حرفي مستوفي للشروط.' : 'Aucun prestataire trouvé.'}</span>
                <p className="text-[10px] text-gray-405 font-medium leading-relaxed">
                  {isRTL ? 'تستطيع تعديل محددات البحث والفئة لاستكشاف المزيد من المنضمين لعائلتنا.' : 'Élargissez vos critères de recherche.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredWorkers.map((worker) => {
                  const isFav = favorites.includes(worker.uid);
                  return (
                    <div 
                      key={worker.uid}
                      className="bg-white border border-gray-150 rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-4 text-right hover:border-blue-300 transition-all group"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between flex-row">
                          
                          {/* Saved favorite heart */}
                          <button
                            type="button"
                            onClick={() => handleToggleFavorite(worker.uid)}
                            className="p-2 bg-slate-50 hover:bg-rose-50 rounded-xl text-gray-400 group-hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                          </button>

                          {/* Identity */}
                          <div className="flex items-center gap-2.5 flex-row-reverse text-right">
                            <div className="w-9 h-9 rounded-2xl bg-blue-105 text-blue-700 font-extrabold flex items-center justify-center text-xs">
                              {worker.displayName?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900 leading-none">{worker.displayName}</span>
                              <span className="text-[9.5px] text-gray-400 font-semibold mt-0.5">{worker.location || (isRTL ? 'أكدال، الرباط' : 'Rabat')}</span>
                            </div>
                          </div>

                        </div>

                        {/* Description bio */}
                        <p className="text-[10.5px] text-slate-600 line-clamp-3 font-semibold leading-relaxed">
                          {worker.bio || (isRTL ? 'لم يقم هذا المحترف بإضافة نبذة عن خبرته بعد.' : 'Pas de bio renseignée.')}
                        </p>
                      </div>

                      {/* Footer specs of worker */}
                      <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleInitiateChat(worker)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10.5px] px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{isRTL ? 'إبرام عقد ومراسلة' : 'Contacter'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 flex-row">
                          <span className="text-[9.5px] text-gray-450 font-bold">({worker.reviewsCount || 0} {isRTL ? 'موثق' : 'bids'})</span>
                          <span className="text-xs font-black text-amber-500 flex items-center gap-0.5">
                            <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500 shrink-0" />
                            <span>{(worker.rating || 5.0).toFixed(1)}</span>
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* 5. HISTORY TAB: EVALUATIONS AND CLOSED TASKS */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-6 animate-fade-in" id="customer-tab-history">
            
            {/* Reviews list that this user has left */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs text-right">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <span className="text-[10px] bg-sky-50 text-blue-600 px-2 py-0.5 rounded font-black">
                  {myGivenReviews.length} REVIEWS
                </span>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h4 className="text-xs font-black text-slate-800 uppercase">{isRTL ? 'سجل تقييماتك للمستقلين والشركاء' : 'Avis laissés aux prestataires'}</h4>
                </div>
              </div>

              {loadingReviews ? (
                <div className="h-20 bg-slate-50 animate-pulse rounded-xl w-full" />
              ) : myGivenReviews.length === 0 ? (
                <div className="py-8 text-center text-[10px] text-gray-440 font-bold">
                  {isRTL ? 'لم تقم بترك أو كتابة أي تقييم لأي فني أو منجز بعد.' : 'Vous n’avez laissé aucun avis encore.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myGivenReviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-2xl border border-gray-150 flex flex-col gap-2.5 justify-between">
                      <div className="flex items-center justify-between flex-row">
                        <div className="flex items-center gap-0.5 flex-row-reverse">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${
                                i < r.rating 
                                  ? 'text-amber-500 fill-amber-500' 
                                  : 'text-gray-200'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs font-black text-slate-850">{isRTL ? 'التقييم المرسل منك' : 'Note attribuée'}</span>
                      </div>

                      <p className="text-xs text-slate-650 leading-relaxed italic pr-2 border-r-2 border-emerald-400 font-medium">
                        "{r.comment}"
                      </p>

                      <div className="text-[8.5px] text-gray-400 font-extrabold mt-1 text-left select-none">
                        Ref: RabatTasker Escrow Resolution Desk
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past jobs / Cancelled archived jobs */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs text-right">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded font-black">
                  {myTasks.filter(t => t.status === 'completed' || t.status === 'cancelled').length} ARCHIVED
                </span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h4 className="text-xs font-black text-slate-800 uppercase">{isRTL ? 'أرشيف معاملا ك السابقة ومهماتك القديمة' : 'Historique des missions clôturées'}</h4>
                </div>
              </div>

              {myTasks.filter(t => t.status === 'completed' || t.status === 'cancelled').length === 0 ? (
                <div className="py-8 text-center text-[10px] text-gray-440 font-bold">
                  {isRTL ? 'أرشيفك خالي من المهمات المنجزة أو الملغاة حتى هذه اللحطة.' : 'Aucune tâche archivée pour le moment.'}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {myTasks.filter(t => t.status === 'completed' || t.status === 'cancelled').map((task) => (
                    <div key={task.id} className="p-3.5 rounded-2xl border border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <span className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        <span className="text-xs font-black text-slate-800">{task.title}</span>
                      </div>

                      <div className="flex items-center gap-3.5 justify-end">
                        <span className="text-xs text-gray-400 font-bold">{task.dueDate}</span>
                        <span className="text-xs font-black text-slate-700 bg-white border px-3 py-1 rounded-xl">
                          {task.budget} DH
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 6. FILES TAB: DOCUMENT MANAGER */}
        {activeTab === 'files' && (
          <div className="flex flex-col gap-6 animate-fade-in" id="customer-tab-files">
            <div className={`bg-white p-6 rounded-3xl border border-gray-200 shadow-xs text-${isRTL ? 'right' : 'left'}`}>
              <div className="border-b border-gray-100 pb-4 mb-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 flex-row-reverse">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase">
                      {isRTL ? 'مركز المستندات والملفات المرفوعة' : 'Mes Documents & Fichiers'}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1 font-semibold leading-relaxed">
                      {isRTL 
                        ? 'قم برفع وإدارة ملفاتك، صور الهوية، أو شهادات المهارات لتسهيل تأكيد الهوية من الرقابة وجلب المشروعات.' 
                        : 'Déposez et gérez vos documents justificatifs ou diplômes pour certification.'}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-black text-slate-700 bg-blue-50/50 border border-blue-150 px-3.5 py-1.5 rounded-2xl select-none flex items-center gap-1.5 flex-row-reverse">
                  <span>{myFiles.length} {isRTL ? 'ملفات مرفوعة' : 'fichiers uploadiés'}</span>
                </div>
              </div>

              {/* Upload Drag & Drop Sandbox Segment */}
              <div className="flex flex-col gap-2.5 mb-6">
                <label className="text-xs font-bold text-gray-800">
                  {isRTL ? 'رفع ملف جديد' : 'Uploader un nouveau document'}
                </label>
                
                <div
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    if (uploadingFile) return;
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                      await handleUploadFile(files[0]);
                    }
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '*';
                    input.onchange = async (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        await handleUploadFile(file);
                      }
                    };
                    input.click();
                  }}
                  className="border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50/50 hover:bg-slate-50/40 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 max-w-xl mx-auto w-full group"
                >
                  <Upload className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-extrabold text-slate-800 leading-none">
                    {uploadingFile ? (isRTL ? 'جاري التحميل والحفظ للأمن...' : 'Téléchargement sécurisé...') : (isRTL ? 'اسحب الملف هنا، أو انقر لبدء الرفع' : 'Glissez-déposez le document ici ou cliquez')}
                  </span>
                  <p className="text-[10px] text-gray-400 font-semibold leading-relaxed mt-1">
                    {isRTL 
                      ? 'يمكنك رفع الصور والمستندات بحد أقصى ٢.٥ ميجابايت' 
                      : 'Formats acceptés: PDF, PNG, JPG (Max 2.5 mo)'}
                  </p>
                </div>
                {fileError && (
                  <div className="text-xs text-rose-600 font-bold bg-rose-50/50 border border-rose-100 p-3 rounded-2xl flex items-center gap-2 max-w-xl mx-auto w-full animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>

              {/* Uploaded Documents List Section */}
              <h4 className="text-xs font-black text-slate-800 uppercase mb-3 text-right">
                {isRTL ? 'الملفات المرفوعة مسبقاً' : 'Liste des fichiers sauvegardés'}
              </h4>

              {loadingFiles ? (
                <div className="h-24 bg-slate-50 animate-pulse rounded-2xl w-full" />
              ) : myFiles.length === 0 ? (
                <div className="py-12 text-center text-[11px] text-gray-400 font-bold bg-slate-50/30 border border-dashed rounded-2xl flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-gray-300" />
                  <span>{isRTL ? 'لم تقم برفع أي ملف أو مستند إثبات بعد.' : 'Aucun fichier dans votre coffre fort pour l’instant.'}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  {myFiles.map((file) => {
                    const fileSizeKB = (file.fileSize / 1024).toFixed(1);
                    return (
                      <div key={file.id} className="p-4 rounded-2xl border border-gray-150 flex items-center justify-between gap-3 text-right bg-slate-50/30">
                        <button
                          onClick={async () => {
                            if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا الملف نهائياً؟' : 'Supprimer définitivement ce fichier ?')) {
                              try {
                                await deleteDoc(doc(db, 'files', file.id));
                              } catch (err) {
                                handleFirestoreError(err, OperationType.DELETE, `files/${file.id}`);
                              }
                            }
                          }}
                          className="text-gray-400 hover:text-rose-600 p-2 rounded-xl transition-all hover:bg-rose-50 cursor-pointer shrink-0"
                          title={isRTL ? 'حذف الملف المرفوع' : 'Supprimer'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-3 overflow-hidden flex-row-reverse select-none">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col text-right truncate">
                            <a 
                              href={file.fileUrl} 
                              download={file.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-extrabold text-blue-600 hover:text-blue-700 hover:underline truncate"
                            >
                              {file.fileName}
                            </a>
                            <span className="text-[9px] text-gray-400 font-bold mt-1">
                              {file.fileType} • {fileSizeKB} KB
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
