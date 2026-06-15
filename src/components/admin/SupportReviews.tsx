import React, { useState } from 'react';
import { 
  Ticket, 
  Trash2, 
  Star, 
  Megaphone, 
  Send, 
  HelpCircle, 
  AlertCircle, 
  Filter, 
  Check, 
  ThumbsUp, 
  ThumbsDown 
} from 'lucide-react';

interface SupportReviewsProps {
  isRTL: boolean;
  isDarkMode: boolean;
  onAddLog: (log: string) => void;
}

export default function SupportReviews({
  isRTL,
  isDarkMode,
  onAddLog
}: SupportReviewsProps) {
  // Support tickets register
  const [tickets, setTickets] = useState([
    { id: 'TKT-701', user: 'Samir Boutayeb', title: 'Payment validation delay with Payzone', category: 'Finance', status: 'open', priority: 'high', operator: 'Agent Amina', date: '21m ago' },
    { id: 'TKT-702', user: 'Azeddine K.', title: 'Verification ID documents keeps rejecting', category: 'KYC', status: 'investigating', priority: 'medium', operator: 'Agent Bilal', date: '1h ago' },
    { id: 'TKT-703', user: 'Lalla Latifa', title: 'Tasker did not arrive on scheduled plumbing repair', category: 'Support', status: 'resolved', priority: 'high', operator: 'Superadmin', date: '1d ago' }
  ]);

  // Customer experience reviews analysis
  const [reviews, setReviews] = useState([
    { id: 'rev-1', task: 'Kitchen faucet leakage', reviewer: 'Zouhair Rabat', rating: 5, comment: 'Excellent travail rapide et très poli ! Je recommande vivement.', sentiment: 'positive', spamScore: 2 },
    { id: 'rev-2', task: 'Garden cleaning', reviewer: 'Farid Souissi', rating: 2, comment: 'Un peu cher pour le résultat final, la pelouse n\'a pas été tondue intégralement.', sentiment: 'negative', spamScore: 10 },
    { id: 'rev-3', task: 'Living room painting', reviewer: 'Ranya Hay Riad', rating: 5, comment: 'Wow formidable service ! Parfait !', sentiment: 'positive', spamScore: 92 } // Suspected spam repetition
  ]);

  // Notification campaign log
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignAudience, setCampaignAudience] = useState<'all' | 'clients' | 'providers'>('all');
  const [scheduledCampaigns, setScheduledCampaigns] = useState([
    { id: 'cmp-1', title: 'Weekend Promo Clean - 15% discount', audience: 'clients', count: 1400, status: 'sent' }
  ]);

  const [ratingFilter, setRatingFilter] = useState<'all' | 'positive' | 'negative' | 'spam'>('all');

  const handleResolveTicket = (tId: string, title: string) => {
    setTickets(prev => prev.map(t => t.id === tId ? { ...t, status: 'resolved' } : t));
    onAddLog(`Support desk: Resolved issue [${tId}] - ${title}`);
    alert(isRTL ? 'تم قفل التذكرة وتغذية العميل بحالة الإجابة!' : 'Ticket d\'assistance marqué résolu !');
  };

  const handlePublishCampaign = () => {
    if (!campaignTitle.trim()) return;
    const item = {
      id: `cmp-${Date.now()}`,
      title: campaignTitle.trim(),
      audience: campaignAudience,
      count: campaignAudience === 'all' ? 2400 : 1200,
      status: 'sent'
    };
    setScheduledCampaigns(prev => [item, ...prev]);
    onAddLog(`Campaign triggered: "${campaignTitle}" targetting ${campaignAudience}`);
    setCampaignTitle('');
    alert(isRTL ? 'تم إرسال الحملة الإعلانية وإيقاظ الهواتف بنجاح!' : 'Campagne e-marketing expédiée !');
  };

  const handleDeleteReview = (rId: string, reviewer: string) => {
    setReviews(prev => prev.filter(r => r.id !== rId));
    onAddLog(`Reviews: Removed/censored review from ${reviewer}`);
    alert(isRTL ? 'تم حجب المراجعة وإلغاء تقييماتها الفاسدة!' : 'Commentaire supprimé du flux public.');
  };

  const filteredReviews = reviews.filter(r => {
    if (ratingFilter === 'all') return true;
    if (ratingFilter === 'positive') return r.sentiment === 'positive';
    if (ratingFilter === 'negative') return r.sentiment === 'negative';
    if (ratingFilter === 'spam') return r.spamScore > 80;
    return true;
  });

  return (
    <div className="flex flex-col gap-8" id="admin-module-support-reviews">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Support Tickets Console */}
        <div className={`p-5 rounded-3xl border lg:col-span-8 flex flex-col gap-4 text-right ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
        }`}>
          <div className="flex justify-between items-center border-b pb-2 flex-row-reverse">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              {isRTL ? 'تذاكر الدعم الفني وشكاوى المستهلكين' : 'Système de Tickets de Support & Réclamation'}
            </h4>
            <Ticket className="w-4 h-4 text-sky-505" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/50 text-slate-400 border-b select-none dark:bg-slate-950/40 dark:border-slate-800">
                <tr>
                  <th className="p-2 text-right">{isRTL ? 'رقم التذكرة والعميل' : 'Ticket'}</th>
                  <th className="p-2 text-right">{isRTL ? 'العنوان والمشكلة' : 'Sujet'}</th>
                  <th className="p-2 text-right">{isRTL ? 'الأولوية والمسؤول' : 'SLA & Assigné'}</th>
                  <th className="p-2 text-center">{isRTL ? 'الإجراء الإداري' : 'Décision'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/10 font-bold text-[11px]">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-100/30 transition-all border-b dark:border-slate-850">
                    <td className="p-2.5">
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{t.user}</span>
                        <span className="text-[8.5px] font-mono text-indigo-400">{t.id}</span>
                      </div>
                    </td>
                    <td className="p-2.5">
                      <div className="flex flex-col text-right">
                        <span className="truncate max-w-[210px]">{t.title}</span>
                        <span className="text-[9.5px] text-gray-450 font-semibold">{t.category} • {t.date}</span>
                      </div>
                    </td>
                    <td className="p-2.5">
                      <div className="flex flex-col text-right">
                        <span className={`inline-flex px-1.5 py-0.2 rounded w-max text-[8.5px] uppercase ${
                          t.priority === 'high' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>{t.priority}</span>
                        <span className="text-[9.5px] text-gray-400 mt-1 select-none">{t.operator}</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-center">
                      {t.status !== 'resolved' ? (
                        <button
                          onClick={() => handleResolveTicket(t.id, t.title)}
                          className="px-2.5 py-1 text-[10.5px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg cursor-pointer font-black"
                        >
                          {isRTL ? 'حل التذكرة' : 'Marquer Résolu'}
                        </button>
                      ) : (
                        <span className="text-[9.5px] font-black text-gray-400 select-none uppercase">CLOSED ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Push Notification Manager */}
        <div className={`p-5 rounded-3xl border lg:col-span-4 flex flex-col gap-3 text-right ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
        }`}>
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
            {isRTL ? 'إطلاق حملات الترويج والإشعار الصاحب' : 'Notifications Push Groupées'}
          </h4>

          <div className="flex flex-col gap-3.5 mt-1.5 text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-500 text-[10px]">{isRTL ? 'عنوان الرسالة أو الحملة الإعلانية' : 'Message Push'}</label>
              <textarea
                placeholder="Ex. 🏷️ Offre Ramadan ! Profitez de -10% sur les plombiers certifiés ce weekend !"
                rows={2}
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className={`px-3 py-2 border rounded-xl focus:outline-none font-semibold ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-gray-200'
                }`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-500 text-[10px]">{isRTL ? 'الفئة المستهدفة بالرباط' : 'Audience cible'}</label>
              <select
                value={campaignAudience}
                onChange={(e) => setCampaignAudience(e.target.value as any)}
                className={`px-3 py-2 border rounded-xl focus:outline-none font-bold ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-gray-200'
                }`}
              >
                <option value="all">{isRTL ? 'كافة المستخدمين المقيدين' : 'Tous les membres'}</option>
                <option value="clients">{isRTL ? 'الزبائن المعلمين فقط' : 'Clients uniquement'}</option>
                <option value="providers">{isRTL ? 'الحرفيين المستقلين الكسبة' : 'Prestataires uniquement'}</option>
              </select>
            </div>

            <button
              onClick={handlePublishCampaign}
              className="bg-indigo-650 hover:bg-indigo-700 text-white py-2 rounded-xl cursor-pointer font-black flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Megaphone className="w-4 h-4" />
              <span>{isRTL ? 'إرسال الحملة الترويجية' : 'Pousser la Campagne'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis and reviews censoring */}
      <div className={`p-5 rounded-3xl border flex flex-col gap-4 text-right ${
        isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-3 dark:border-slate-800">
          <div className="flex flex-col text-right w-full sm:w-auto">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              {isRTL ? 'رقابة التقييمات العامة والفرز من خلال الذكاء الاصطناعي' : 'Audit des Évaluations & Filtrage Sentimental (AI)'}
            </h4>
            <span className="text-[10px] italic text-gray-400">{isRTL ? 'يقوم المحلل الآلي باستشعار المراجعات المكررة (السبام).' : 'L\'algorithme AI détecte automatiquement les commentaires spam répétitifs.'}</span>
          </div>

          {/* Rating filter */}
          <div className="flex gap-1.5">
            {[
              { id: 'all', ar: 'الكل', fr: 'Tous' },
              { id: 'positive', ar: 'إيجابي', fr: 'Positifs' },
              { id: 'negative', ar: 'سلبي', fr: 'Négatifs' },
              { id: 'spam', ar: 'مرصود سبام !', fr: 'Douteux / Spam' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setRatingFilter(f.id as any)}
                className={`px-3 py-1.5 border text-[10px] font-black rounded-lg cursor-pointer ${
                  ratingFilter === f.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                }`}
              >
                {isRTL ? f.ar : f.fr}
              </button>
            ))}
          </div>
        </div>

        {/* Review list cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {filteredReviews.map((rev) => {
            const isSpam = rev.spamScore > 80;

            return (
              <div 
                key={rev.id} 
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 text-xs text-right relative overflow-hidden ${
                  isSpam ? 'border-dashed border-red-400 bg-red-50/20' : isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50/50 border-gray-150'
                }`}
              >
                {isSpam && (
                  <span className="absolute -top-1 -left-1 px-2 py-0.5 bg-red-600 text-white uppercase font-black text-[7px] rotate-12 select-none tracking-widest">
                    AI SPAM BLOCK
                  </span>
                )}

                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center justify-between flex-row-reverse text-[9px] font-extrabold text-indigo-505 dark:text-indigo-405">
                    <span>{rev.reviewer}</span>
                    <span className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-2.5 h-2.5 ${i < rev.rating ? 'fill-current' : 'opacity-20'}`} />
                      ))}
                    </span>
                  </div>

                  <span className="text-[10.5px] font-bold text-gray-400 dark:text-gray-500">{rev.task}</span>
                  <p className="text-[11px] text-slate-700 dark:text-slate-350 italic leading-snug mt-1 font-medium">{rev.comment}</p>
                </div>

                <div className="flex justify-between items-center border-t border-gray-100/10 pt-2.5 mt-2.5">
                  <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase ${
                    rev.sentiment === 'positive' ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {rev.sentiment === 'positive' ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                    <span>{rev.sentiment}</span>
                  </span>

                  <button
                    onClick={() => handleDeleteReview(rev.id, rev.reviewer)}
                    className="p-1 px-1.5 rounded-lg border hover:bg-rose-50 hover:text-rose-600 text-slate-400 cursor-pointer"
                    title="Censurer Évaluation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
