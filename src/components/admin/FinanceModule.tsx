import React, { useState } from 'react';
import { 
  DollarSign, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Check, 
  X, 
  Sliders, 
  TrendingUp, 
  Activity, 
  RefreshCw 
} from 'lucide-react';

interface FinanceModuleProps {
  isRTL: boolean;
  isDarkMode: boolean;
  tasks: any[];
  onAddLog: (log: string) => void;
}

export default function FinanceModule({
  isRTL,
  isDarkMode,
  tasks,
  onAddLog
}: FinanceModuleProps) {
  // Payout queue state
  const [payoutRequests, setPayoutRequests] = useState([
    { id: 'PAY-88', workerName: 'Hassan Belkhayat', amount: 1540, bank: 'Attijariwafa Bank', account: '007120002144...', date: '2026-06-14', status: 'pending' },
    { id: 'PAY-89', workerName: 'Amina El Fassi', amount: 650, bank: 'CIH Bank', account: '011150005481...', date: '2026-06-15', status: 'pending' },
    { id: 'PAY-90', workerName: 'Bilal Sajid', amount: 2100, bank: 'BMCE Bank', account: '002140003215...', date: '2026-06-13', status: 'approved' }
  ]);

  // Moroccan transaction histories
  const [transactions, setTransactions] = useState([
    { id: 'TX-50912', client: 'Fatima Zahra', type: 'Deposit (Escrow Load)', amount: 450, gateway: 'Payzone Maroc', status: 'success', date: '2026-06-15 09:12' },
    { id: 'TX-50911', client: 'Nasser Rabat', type: 'Deposit (Escrow Load)', amount: 1200, gateway: 'Payzone Maroc', status: 'success', date: '2026-06-15 08:33' },
    { id: 'TX-50910', client: 'Tariq Alami', type: 'Provider Payout', amount: 800, gateway: 'Direct CIH Wire', status: 'success', date: '2026-06-14 17:40' },
    { id: 'TX-50909', client: 'Yasmine S.', type: 'Deposit (Escrow Load)', amount: 300, gateway: 'Payzone Maroc', status: 'failed', date: '2026-06-14 11:15' }
  ]);

  const [commissionRate, setCommissionRate] = useState(15); // Default 15%

  const handleApprovePayout = (payId: string, name: string, amount: number) => {
    setPayoutRequests(prev => prev.map(p => p.id === payId ? { ...p, status: 'approved' } : p));
    onAddLog(`Payout Approved: [${payId}] of ${amount} MAD representing reward release to ${name}`);
    alert(isRTL ? `تم إعطاء الأمر المصرفي وتسييل ${amount} درهم فوراً!` : `Ordre bancaire de ${amount} MAD débloqué avec succès !`);
  };

  const handleHoldPayout = (payId: string, name: string) => {
    setPayoutRequests(prev => prev.map(p => p.id === payId ? { ...p, status: 'held' } : p));
    onAddLog(`Payout Held: [${payId}] of ${name} frozen pending compliance checks`);
    alert(isRTL ? 'تم تعليق المعاملة مؤقتا لإعادة التدقيق في أوراق الثبوتية.' : 'Liquidation gelée par mesure de sécurité.');
  };

  const totalEscrowVolume = tasks.reduce((sum, t) => sum + (t.budget || 0), 0) || 12400;
  const platformRevenueVal = Math.round(totalEscrowVolume * (commissionRate / 100));

  return (
    <div className="flex flex-col gap-6" id="admin-module-finance">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
        <div className="flex flex-col text-right w-full md:w-auto">
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest leading-none dark:text-white">
            {isRTL ? 'إدارة المعاملات المالية المدمجة وعمولة المنصة' : 'Moroccan Fintech Ledger & Platform Fees System'}
          </h3>
          <span className="text-[10px] text-slate-500 font-semibold mt-1.5 leading-snug">
            {isRTL 
              ? 'دقق في تحويلات بوابة الدفع Payzone، وافق على عمليات التسييل والمكاسب، وتحكم بالقواعد الضريبية للمنصة.' 
              : 'Gérez la passerelle de paiement marocaine Payzone, validez les demandes de virements (CIH/BMCE) et modifiez la tarification SaaS.'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Payout Queues and Transaction Ledger */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Payout Withdrawal approvals */}
          <div className={`p-5 rounded-3xl border flex flex-col gap-4 text-right ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
          }`}>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              {isRTL ? 'طلبات سحب الرصيد من الحرفيين الكسبة (التحويل البنكي)' : 'Virements Bancaires en Attente d\'Approbation'}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50/50 text-slate-400 border-b select-none dark:bg-slate-950/40 dark:border-slate-800">
                  <tr>
                    <th className="p-2 text-right">{isRTL ? 'الحرفي المستفيد' : 'Bénéficiaire'}</th>
                    <th className="p-2 text-right">{isRTL ? 'المصرف والحساب البنكي' : 'RIB & Banque'}</th>
                    <th className="p-2 text-right">{isRTL ? 'المبلغ المطلوب' : 'Montant'}</th>
                    <th className="p-2 text-right">{isRTL ? 'تاريخ الطلب' : 'Date'}</th>
                    <th className="p-2 text-center">{isRTL ? 'إجراء الإعفاء والتحويل' : 'Décision'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/10 font-medium">
                  {payoutRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-100/30 transition-all border-b dark:border-slate-850">
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">{req.workerName}</td>
                      <td className="p-2.5">
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-[10.5px]">{req.bank}</span>
                          <span className="text-[9.5px] font-mono text-gray-400">{req.account}</span>
                        </div>
                      </td>
                      <td className="p-2.5 font-extrabold font-mono text-emerald-600">{req.amount} MAD</td>
                      <td className="p-2.5 text-gray-400">{req.date}</td>
                      <td className="p-2.5 text-center">
                        {req.status === 'pending' ? (
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleHoldPayout(req.id, req.workerName)}
                              className="p-1 px-2 pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 rounded-lg text-[9.5px] font-bold"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleApprovePayout(req.id, req.workerName, req.amount)}
                              className="p-1 px-3 pointer bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-[9.5px] font-extrabold flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isRTL ? 'صرف وتسييل' : 'Autoriser Virement'}</span>
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            req.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {req.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payzone transaction registers */}
          <div className={`p-5 rounded-3xl border flex flex-col gap-4 text-right ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
          }`}>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              {isRTL ? 'تاريخ الحركات المالية عبر بوابات السداد' : 'Rapports des Transactions Directes (Payzone Maroc)'}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50/50 text-slate-400 border-b select-none dark:bg-slate-950/40 dark:border-slate-800">
                  <tr>
                    <th className="p-2 text-right">{isRTL ? 'المرجع والعميل' : 'Référence & Client'}</th>
                    <th className="p-2 text-right">{isRTL ? 'النوع والوسيلة' : 'Opération'}</th>
                    <th className="p-2 text-right">{isRTL ? 'القيمة الإجمالية' : 'Montant'}</th>
                    <th className="p-2 text-right">{isRTL ? 'التاريخ' : 'Horodatage'}</th>
                    <th className="p-2 text-center">{isRTL ? 'صلاحية الدفع والشبكة' : 'Passerelle'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/10 font-medium font-sans">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-100/30 transition-all border-b dark:border-slate-850">
                      <td className="p-2.5">
                        <div className="flex flex-col text-left">
                          <span className="font-extrabold text-slate-800 dark:text-slate-100">{tx.client}</span>
                          <span className="text-[8.5px] font-mono text-indigo-400 select-all">{tx.id}</span>
                        </div>
                      </td>
                      <td className="p-2.5 font-bold text-gray-500">{tx.type}</td>
                      <td className="p-2.5 font-extrabold font-mono text-indigo-600 dark:text-indigo-400">{tx.amount} MAD</td>
                      <td className="p-2.5 text-gray-400">{tx.date}</td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9.5px] font-bold ${
                          tx.status === 'success' 
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' 
                            : 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                          {tx.gateway} • {tx.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Commissions custom calculator and rules */}
        <div className="lg:col-span-4 flex flex-col gap-6 text-right">
          <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
          }`}>
            <div className="flex justify-between items-center border-b pb-2 flex-row-reverse">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                {isRTL ? 'إعدادات تسعير عمولة الـ SaaS للمنصة' : 'SaaS Pricing Configurator'}
              </h4>
              <Sliders className="w-4 h-4 text-sky-505" />
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{isRTL ? 'عمولة المنصة الحالية بالـ %' : 'Frais Opérationnels Actuels (%)'}</span>
              <p className="text-[10px] text-gray-400">{isRTL ? 'تخصم هذه النسبة تلقائيا من محفظة المستقل عند تسييل أموال الضمان المالي.' : 'Retenu sur le versement consigné lors du déblocage.'}</p>
              
              <div className="flex gap-2 items-center mt-3 flex-row-reverse">
                <input 
                  type="number"
                  min="5"
                  max="30"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className={`w-20 text-xs text-center px-2 py-2 rounded-xl focus:outline-none border font-bold ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-gray-200'
                  }`}
                />
                <span className="text-xs font-bold text-slate-500">%</span>
                <button
                  onClick={() => {
                    onAddLog(`SaaS Commission Rate adjusted manually to ${commissionRate}%`);
                    alert(isRTL ? 'تم حفظ التعديل وتحديث شجرة الخصومات!' : 'Configuration globale ajustée avec succès !');
                  }}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white text-[10px] font-black px-4 py-2 rounded-xl cursor-pointer"
                >
                  {isRTL ? 'تحديث النسبة' : 'Appliquer'}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100/10 flex flex-col gap-2">
              <div className="flex items-center justify-between flex-row-reverse text-xs">
                <span className="text-gray-400">{isRTL ? 'قيمة الأموال المحتجزة بالضمان' : 'Volume Escrow Séquestré:'}</span>
                <span className="font-extrabold font-mono text-slate-800 dark:text-white">{totalEscrowVolume.toLocaleString()} MAD</span>
              </div>
              <div className="flex items-center justify-between flex-row-reverse text-xs mt-1">
                <span className="text-gray-400">{isRTL ? 'الأرباح التشغيلية المتوقعة' : 'Net Frais SaaS Anticipés:'}</span>
                <span className="font-extrabold font-mono text-emerald-600">{platformRevenueVal.toLocaleString()} MAD</span>
              </div>

              <div className="mt-3 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/30 text-[10px] flex gap-1 text-indigo-800 dark:text-indigo-400">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span>{isRTL ? 'تعديل النسبة ينطبق تلقائياً على الصفقات الجديدة الملغاة والمقيدة.' : 'S\'applique uniquement sur les futurs mandats de dépôt.'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
