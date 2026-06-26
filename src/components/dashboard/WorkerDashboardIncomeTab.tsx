import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Banknote, Clock, Award, Star, CreditCard, Check, Calendar } from 'lucide-react';
import { Task, Review, UserProfile } from '../../types';

interface WithdrawalRecord {
  id: string;
  amount: number;
  bankName: string;
  rib: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: any;
}

interface WorkerDashboardIncomeTabProps {
  lang: 'ar' | 'fr';
  isRTL: boolean;
  completedTasks: Task[];
  assignedTasks: Task[];
  myReviews: Review[];
  myProfile: UserProfile | null;
  withdrawalHistory: WithdrawalRecord[];
  withdrawalAmount: number;
  selectedBank: string;
  ribInput: string;
  withdrawSuccess: boolean;
  withdrawingInProgress: boolean;
  totalEarnedAmount: number;
  pendingEscrowAmount: number;
  setWithdrawalAmount: (amount: number) => void;
  setSelectedBank: (bank: string) => void;
  setRibInput: (rib: string) => void;
  handleWithdrawFunds: (e: React.FormEvent) => void;
}

const MAROC_BANKS = [
  { id: 'cih', nameAr: 'بنك البريد / CIH', nameFr: 'CIH Bank / Barid Bank' },
  { id: 'attijari', nameAr: 'التجاري وفا بنك', nameFr: 'Attijariwafa Bank' },
  { id: 'bmce', nameAr: 'البنك الإفريقي للشرق / BOA', nameFr: 'Bank of Africa BOA' },
  { id: 'populaire', nameAr: 'البنك الشعبي للمغرب', nameFr: 'Banque Populaire' },
  { id: 'credit_maroc', nameAr: 'مصرف المغرب', nameFr: 'Crédit du Maroc' },
  { id: 'bmci', nameAr: 'BMCI الفرنسية', nameFr: 'BMCI Bank' }
];

export default function WorkerDashboardIncomeTab({
  lang,
  isRTL,
  completedTasks,
  assignedTasks,
  myReviews,
  myProfile,
  withdrawalHistory,
  withdrawalAmount,
  selectedBank,
  ribInput,
  withdrawSuccess,
  withdrawingInProgress,
  totalEarnedAmount,
  pendingEscrowAmount,
  setWithdrawalAmount,
  setSelectedBank,
  setRibInput,
  handleWithdrawFunds
}: WorkerDashboardIncomeTabProps) {
  return (
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
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl animate-pulse">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-amber-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 font-semibold text-right">
            {isRTL 
              ? 'هذا المبلغ تم تأمينه من العملاء في نظام الضمان البنكي، وسيُحوّل لمحفظتك فور تأكيد المهام.' 
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
            <div className="flex items-center gap-1 text-xs text-amber-500 font-extrabold bg-amber-50 px-2 py-1 rounded-md mb-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
              <span>{myProfile?.rating ? myProfile.rating.toFixed(1) : '5.0'}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Payout & Withdrawal Panel */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between relative">
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4 flex-row-reverse">
            <div className="flex items-center gap-2 flex-row-reverse">
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
                  max={totalEarnedAmount || 100}
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
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3 flex-row-reverse">
            <div className="flex items-center gap-2 flex-row-reverse">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <h4 className="text-xs font-black text-slate-800 uppercase">{isRTL ? 'سجل السحوبات الماضية الحية' : 'Suivi des Transferts'}</h4>
            </div>
            <span className="text-[9px] bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded">
              {withdrawalHistory.length} TX
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
            {withdrawalHistory.length === 0 ? (
              <div className="py-8 text-center text-[10px] text-gray-400 font-semibold leading-relaxed">
                {isRTL ? 'لا توجد أي سحوبات سابقة مسجلة بمحفظتك.' : 'Aucun mouvement de retrait encore enregistré.'}
              </div>
            ) : (
              withdrawalHistory.map((item) => (
                <div key={item.id} className="p-3 rounded-xl border border-gray-150 flex items-center justify-between hover:bg-slate-50 transition-colors flex-row-reverse">
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
  );
}
