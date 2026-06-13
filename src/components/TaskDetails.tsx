import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  doc, 
  query, 
  where, 
  getDocs,
  onSnapshot, 
  setDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { Task, Offer, Review, UserProfile } from '../types';
import { TRANSLATIONS, LanguageKey } from '../data/rabatData';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  DollarSign,
  Star,
  User,
  HeartHandshake,
  Check,
  Ban,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import PayzonePayment from './PayzonePayment';

interface TaskDetailsProps {
  task: Task;
  user: any;
  userProfile: UserProfile | null;
  lang: LanguageKey;
  onClose: () => void;
  onStatusChange: () => void;
}

export default function TaskDetails({
  task,
  user,
  userProfile,
  lang,
  onClose,
  onStatusChange
}: TaskDetailsProps) {
  const t = TRANSLATIONS[lang];

  // Component States
  const [offers, setOffers] = useState<Offer[]>([]);
  const [biddingAmount, setBiddingAmount] = useState<number>(task.budget);
  const [biddingPitch, setBiddingPitch] = useState('');
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [biddingError, setBiddingError] = useState<string | null>(null);

  // Status and Reviews States
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [taskReviews, setTaskReviews] = useState<Review[]>([]);
  
  // Custom Payzone States
  const [showPayzoneEscrow, setShowPayzoneEscrow] = useState(false);

  const isPoster = user && task.posterId === user.uid;
  const isAssignedTasker = user && task.taskerId === user.uid;
  const alreadyBid = user && offers.some(o => o.taskerId === user.uid);
  const isRTL = lang === 'ar';

  // 1. Fetch offers under tasks/taskId/offers in real-time
  useEffect(() => {
    const offersRef = collection(db, 'tasks', task.id, 'offers');
    const unsub = onSnapshot(
      offersRef, 
      (snapshot) => {
        const list: Offer[] = [];
        snapshot.forEach((subdoc) => {
          list.push({ id: subdoc.id, ...subdoc.data() } as Offer);
        });
        // Sort bids from lowest to highest
        setOffers(list.sort((a, b) => a.amount - b.amount));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `tasks/${task.id}/offers`);
      }
    );

    return () => unsub();
  }, [task.id]);

  // 2. Fetch associated reviews for this task
  useEffect(() => {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('taskId', '==', task.id));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Review[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as Review);
        });
        setTaskReviews(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'reviews');
      }
    );
    return () => unsub();
  }, [task.id]);

  // 3. Submit dynamic Tasker Bid Offer
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setBiddingError(t.mustLoginToBid);
      return;
    }
    if (biddingAmount <= 0 || biddingAmount > 100000) {
      setBiddingError(lang === 'ar' ? 'العرض المقدم غير منطقي.' : 'Tarif de bid invalide.');
      return;
    }
    if (biddingPitch.trim().length === 0) {
      setBiddingError(lang === 'ar' ? 'يرجى كتابة رسالة إقناع للعميل.' : 'Veuillez saisir votre message.');
      return;
    }

    try {
      setBiddingLoading(true);
      setBiddingError(null);

      const offerId = 'offer_' + user.uid + '_' + Math.random().toString(36).substr(2, 4);
      const offerData = {
        taskId: task.id,
        taskerId: user.uid,
        taskerName: userProfile?.displayName || user.displayName || 'مقدم خدمة الرباط',
        taskerPhoto: user.photoURL || '',
        amount: Number(biddingAmount),
        message: biddingPitch.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      };

      // Save Offer subcollection doc
      const offerPath = `tasks/${task.id}/offers/${offerId}`;
      try {
        await setDoc(doc(db, 'tasks', task.id, 'offers', offerId), offerData);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, offerPath);
      }

      // Increment task's offersCount
      const taskPath = `tasks/${task.id}`;
      try {
        await updateDoc(doc(db, 'tasks', task.id), {
          offersCount: offers.length + 1,
          updatedAt: serverTimestamp()
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.UPDATE, taskPath);
      }

      setBiddingPitch('');
      onStatusChange();
    } catch (err: any) {
      console.error(err);
      setBiddingError(err.message || 'خطأ في حفظ العرض.');
    } finally {
      setBiddingLoading(false);
    }
  };

  // 4. Accept a local Offer (Poster assignments action)
  const handleAcceptOffer = async (offer: Offer) => {
    if (!user || task.posterId !== user.uid) return;

    try {
      setBiddingLoading(true);

      // A) Update task to assigned state
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        status: 'assigned',
        taskerId: offer.taskerId,
        taskerName: offer.taskerName,
        updatedAt: serverTimestamp()
      });

      // B) Update accepted offer status to 'accepted'
      const acceptedOfferRef = doc(db, 'tasks', task.id, 'offers', offer.id);
      await updateDoc(acceptedOfferRef, { status: 'accepted' });

      // C) Update sibling offers status to 'declined'
      for (const otherOffer of offers) {
        if (otherOffer.id !== offer.id) {
          const ref = doc(db, 'tasks', task.id, 'offers', otherOffer.id);
          await updateDoc(ref, { status: 'declined' });
        }
      }

      onStatusChange();
    } catch (err: any) {
      console.error('Accept offer failure:', err);
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`);
    } finally {
      setBiddingLoading(false);
    }
  };

  // 5. Change task status to 'completed'
  const handleMarkCompleted = async () => {
    if (!user || task.posterId !== user.uid) return;
    try {
      setBiddingLoading(true);
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        status: 'completed',
        updatedAt: serverTimestamp()
      });
      onStatusChange();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${task.id}`);
    } finally {
      setBiddingLoading(false);
    }
  };

  // 6. Cancel task
  const handleCancelTask = async () => {
    if (!user || (task.posterId !== user.uid && task.taskerId !== user.uid)) return;
    try {
      setBiddingLoading(true);
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
      onStatusChange();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${task.id}`);
    } finally {
      setBiddingLoading(false);
    }
  };

  // 7. Post Feedback Review inside completed task
  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (reviewComment.trim().length < 5) {
      setReviewsError(lang === 'ar' ? 'يرجى كتابة تعليق مفيد لا يقل عن 5 أحرف.' : 'Veuillez écrire un commentaire complet d\'au moins 5 caractères.');
      return;
    }

    try {
      setReviewsLoading(true);
      setReviewsError(null);

      const reviewId = 'review_' + task.id + '_' + user.uid;
      const targetRevieweeId = isPoster ? (task.taskerId || '') : task.posterId;

      const reviewData = {
        taskId: task.id,
        reviewerId: user.uid,
        reviewerName: userProfile?.displayName || user.displayName || 'مقيم تقييمات',
        revieweeId: targetRevieweeId,
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
        createdAt: serverTimestamp()
      };

      // Create Review sheets doc
      const reviewPath = `reviews/${reviewId}`;
      try {
        await setDoc(doc(db, 'reviews', reviewId), reviewData);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, reviewPath);
      }

      // Fetch all reviews for this target reviewee to update their profile stats
      const q = query(collection(db, 'reviews'), where('revieweeId', '==', targetRevieweeId));
      const querySnapshot = await getDocs(q);
      let totalRating = 0;
      let count = 0;
      querySnapshot.forEach((docSnap) => {
        totalRating += docSnap.data().rating;
        count++;
      });

      // Calculate new score cleanly
      const finalRating = count > 0 ? (totalRating / count) : Number(reviewRating);

      // Save average score back on reviewee public profile doc
      const userRef = doc(db, 'users', targetRevieweeId);
      await updateDoc(userRef, {
        rating: Number(finalRating.toFixed(2)),
        reviewsCount: count
      });

      setReviewComment('');
      onStatusChange();
    } catch (err: any) {
      console.error(err);
      setReviewsError(err.message || 'خطأ في حفظ التقييم.');
    } finally {
      setReviewsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="task-details-modal">
      {/* Overlay Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-right shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl flex flex-col border border-gray-100">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-sky-50/10">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-sky-600" />
              <span>{t.taskDetailsTitle}</span>
            </h3>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[75vh] flex flex-col gap-6">
            
            {/* 1. Main task overview card info */}
            <div className="bg-sky-50/30 border border-sky-100/50 p-5 rounded-2xl flex flex-col gap-3">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-black text-gray-900 leading-snug">
                    {task.title}
                  </h2>
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 inline text-gray-400" />
                    <span>{t.posterBadge}: <b>{task.posterName}</b></span>
                  </span>
                </div>

                <div className="text-right bg-sky-600 text-white px-4 py-2.5 rounded-2xl flex flex-col items-center justify-center shadow-xs">
                  <span className="text-lg font-extrabold">{task.budget}</span>
                  <span className="text-[9px] font-bold tracking-wider">DH / درهم</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-bold border-t border-sky-100/30 pt-3 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-sky-500" />
                  <span>{task.location}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{task.dueDate}</span>
                </span>
                <span className="text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-lg text-[10px]">
                  {task.status === 'open' ? t.statusOpen :
                   task.status === 'assigned' ? t.statusAssigned :
                   task.status === 'completed' ? t.statusCompleted : t.statusCancelled}
                </span>
              </div>
            </div>

            {/* 2. Description box */}
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-bold text-gray-800">
                {lang === 'ar' ? 'تفاصيل العمل ومكانه' : 'Détails de la mission'}
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100/60 leading-relaxed whitespace-pre-wrap">
                {task.description || t.noDescription}
              </p>
            </div>

            {/* 3. Assigned Tasker details if any */}
            {task.taskerId && (
              <div className="flex flex-col gap-3">
                <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      T
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs text-emerald-700 font-bold">{t.taskerBadge}</span>
                      <span className="text-sm font-bold text-gray-900">{task.taskerName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-800 font-semibold bg-emerald-100/50 px-2.5 py-1 rounded-lg">
                    <Check className="w-4 h-4" />
                    <span>{t.statusAssigned}</span>
                  </div>
                </div>

                {/* Secure Escrow Budgeting with Payzone gate */}
                <div className="p-4 rounded-2xl border border-gray-150-300 bg-slate-50 flex flex-col gap-3 text-right">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <h5 className="text-xs font-black text-slate-900">
                      {lang === 'ar' ? 'الضمان المالي المعتمد المغربي (Payzone Escrow)' : 'Garantie Marocaine Payzone Escrow'}
                    </h5>
                  </div>

                  {(task as any).isEscrowFunded ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-800 text-[11px] leading-relaxed font-bold">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <p>{lang === 'ar' ? 'ميزانية المهمة مضافة ومؤمنة في صندوق الأمانات (100% مضمونة) عبر بوابة Payzone!' : 'Le budget de la mission est sécurisé avec succès sous séquestre.'}</p>
                        <p className="text-[9px] text-emerald-600 mt-1 font-mono">{lang === 'ar' ? 'معرف العملية المقترن:' : 'Réf Payzone:'} {(task as any).depositTransactionId}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2 text-amber-800 text-[11px] leading-relaxed font-semibold">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p dir={isRTL ? 'rtl' : 'ltr'}>
                          {isPoster 
                            ? (lang === 'ar' ? 'يرجى تأمين وتمويل ميزانية المهمة في الأمانات لبدء العمل بسلام وسرعة!' : 'Veuillez alimenter le budget de garantie sur la plateforme.') 
                            : (lang === 'ar' ? 'يرجى انتظار قيام صاحب المهمة بإيداع ميزانية العمل عبر بوابة Payzone لتضمن مستحقاتك.' : 'En attente du dépôt du budget sous séquestre par le client.')}
                        </p>
                      </div>

                      {isPoster && (
                        <button
                          type="button"
                          onClick={() => setShowPayzoneEscrow(true)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2 h-11 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4 text-indigo-200" />
                          <span>{lang === 'ar' ? `تأمين ميزانية المهمة الآن (${task.budget} درهم)` : `Alimenter le budget (${task.budget} MAD)`}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payzone Escrow Modal overlay */}
            {showPayzoneEscrow && user && (
              <PayzonePayment
                amount={task.budget}
                paymentType="escrow"
                taskId={task.id}
                userUid={user.uid}
                userEmail={user.email}
                lang={lang}
                onClose={() => setShowPayzoneEscrow(false)}
                onSuccess={() => {
                  setShowPayzoneEscrow(false);
                  onStatusChange();
                }}
              />
            )}

            {/* 4. Active action panels */}
            {isPoster && task.status === 'assigned' && (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelTask}
                  disabled={biddingLoading}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>{t.cancelTask}</span>
                </button>
                <button
                  onClick={handleMarkCompleted}
                  disabled={biddingLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{t.markCompleted}</span>
                </button>
              </div>
            )}

            {/* 5. Reviews Form when completed */}
            {task.status === 'completed' && user && (isPoster || isAssignedTasker) && taskReviews.every(r => r.reviewerId !== user.uid) && (
              <div className="bg-amber-50/30 border border-amber-200/50 p-5 rounded-2xl flex flex-col gap-4 text-right">
                <div className="flex items-center gap-1.5 text-amber-900 font-extrabold">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{lang === 'ar' ? 'شارك رأيك في جودة العمل والتعامل' : 'Laissez un avis sur la tâche'}</span>
                </div>

                {reviewsError && <div className="text-xs font-semibold text-rose-600">{reviewsError}</div>}

                <form onSubmit={handlePostReview} className="flex flex-col gap-3">
                  {/* Stars selector rating */}
                  <div className="flex justify-end gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-7 h-7 ${star <= reviewRating ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>

                  <textarea
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={t.reviewCommentPlaceholder}
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500 resize-none"
                  />

                  <button
                    type="submit"
                    disabled={reviewsLoading}
                    className="self-end bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    {reviewsLoading ? 'جاري الإرسال...' : t.submitReview}
                  </button>
                </form>
              </div>
            )}

            {/* 6. List review feedback if posted */}
            {taskReviews.length > 0 && (
              <div className="flex flex-col gap-3.5">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1">
                  <span>التقييمات المسجلة للمهمة</span>
                </h4>
                <div className="flex flex-col gap-2.5">
                  {taskReviews.map((rev) => (
                    <div key={rev.id} className="bg-gray-50/70 border border-gray-100 p-4 rounded-2xl flex flex-col gap-1 text-right">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-800">{rev.reviewerName}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed italic">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Display bids and offers list */}
            {task.status === 'open' && (
              <div className="flex flex-col gap-4 border-t border-gray-100 pt-5 pr-1">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 justify-start">
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  <span>{t.offersLabel} ({offers.length})</span>
                </h4>

                {offers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    {lang === 'ar' ? 'لا توجد عروض مقدمة على هذه المهمة حتى الآن. كن أول من يخدم سكان الرباط!' : 'Aucune offre soumise.'}
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {offers.map((off) => (
                      <div 
                        key={off.id}
                        className={`p-4 rounded-2xl border transition-all text-right flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          off.status === 'accepted' ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100 bg-white hover:border-sky-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={off.taskerPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                            alt={off.taskerName}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                          />
                          <div className="flex flex-col text-right">
                            <span className="text-xs font-bold text-gray-800">{off.taskerName}</span>
                            <p className="text-xs text-gray-500 leading-normal mt-1 max-w-sm">"{off.message}"</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-extrabold text-sky-700">{off.amount} {t.ratings ? 'DH' : 'DH'}</span>
                            <span className="text-[9px] text-gray-400 font-medium">سعر عرض الخدمة</span>
                          </div>

                          {isPoster && task.status === 'open' && (
                            <button
                              onClick={() => handleAcceptOffer(off)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              {t.assignTask}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Place a bid box for Taskers */}
                {user && !isPoster && !alreadyBid && userProfile?.isTasker && (
                  <div className="bg-sky-50/20 border border-sky-100 p-5 rounded-2xl mt-3 text-right flex flex-col gap-3">
                    <h5 className="text-xs font-bold text-sky-800">{t.placeOfferTitle}</h5>
                    
                    {biddingError && <div className="text-xs font-semibold text-rose-600">{biddingError}</div>}

                    <form onSubmit={handlePlaceBid} className="grid grid-cols-1 gap-3 sm:grid-cols-3 items-end">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-600">{t.offerAmountPlaceholder}</label>
                        <input
                          type="number"
                          required
                          value={biddingAmount}
                          onChange={(e) => setBiddingAmount(Number(e.target.value))}
                          className="text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-sky-500 bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-gray-600">{t.offerPitchPlaceholder}</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={biddingPitch}
                            onChange={(e) => setBiddingPitch(e.target.value)}
                            className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-sky-500 bg-white"
                          />
                          <button
                            type="submit"
                            disabled={biddingLoading}
                            className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            {biddingLoading ? '...' : t.submitOffer}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {user && !userProfile?.isTasker && !isPoster && (
                  <div className="text-[11px] text-amber-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 text-right mt-2 font-medium">
                    {lang === 'ar' 
                      ? '⚠️ يجب تفعيل ميزة تقديم الخدمات (Tasker) في حسابك من شريط الإعدادات لتتمكن من تقديم عروض الأسعار.' 
                      : '⚠️ Activez le mode prestataire (Tasker) dans votre profil pour pouvoir soumettre des offres.'}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
