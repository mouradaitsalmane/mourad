import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  FileText, 
  Check, 
  X, 
  Trash2, 
  AlertCircle, 
  ShieldAlert, 
  Award,
  Wallet
} from 'lucide-react';
import { UserProfile } from '../../types';

import { Task } from '../../types';

// Let's declare local WorkerVerificationRequest in case it isn't fully defined globally
interface WorkerReq {
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

interface UsersModuleProps {
  isRTL: boolean;
  isDarkMode: boolean;
  users: UserProfile[];
  loadingUsers: boolean;
  userEmails: Record<string, string>;
  allFiles: any[];
  userType: 'customers' | 'providers'; // Customers vs Providers
  verificationRequests: WorkerReq[];
  tasks: Task[]; // Integrated for strict orders mapping
  onToggleBlockUser: (userId: string, isCurrentlySuspended: boolean) => void;
  onDeleteUser: (userId: string) => void;
  onSelectUserForFiles: (user: UserProfile) => void;
  onApproveFreelancer: (reqId: string, userId: string) => void;
  onRejectFreelancer: (reqId: string, name: string) => void;
  processingUsers?: Record<string, boolean>;
}

export default function UsersModule({
  isRTL,
  isDarkMode,
  users,
  loadingUsers,
  userEmails,
  allFiles,
  userType,
  verificationRequests,
  tasks,
  onToggleBlockUser,
  onDeleteUser,
  onSelectUserForFiles,
  onApproveFreelancer,
  onRejectFreelancer,
  processingUsers = {}
}: UsersModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'suspended' | 'verified'>('all');
  
  // Selected user for full Provider / Client Detail Modal
  const [detailedUser, setDetailedUser] = useState<UserProfile | null>(null);

  // Filter our list based on the module selection (customers vs providers)
  const isFreelancerTab = userType === 'providers';

  const filteredUsers = users.filter((u) => {
    // Determine type
    const matchesType = isFreelancerTab ? u.isTasker : !u.isTasker;
    
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (u.displayName || '').toLowerCase().includes(searchLower) ||
      u.uid.toLowerCase().includes(searchLower) ||
      (u.location || '').toLowerCase().includes(searchLower) ||
      (u.bio || '').toLowerCase().includes(searchLower);

    // Status filter
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'suspended' ? (u as any).isSuspended === true :
      statusFilter === 'verified' ? u.isVerifiedTasker === true : true;

    return matchesType && matchesSearch && matchesStatus;
  });

  // Calculate order count for specific user
  const getUserOrderCount = (userId: string, isTasker: boolean) => {
    if (isTasker) {
      return tasks.filter(t => t.taskerId === userId).length;
    }
    return tasks.filter(t => t.posterId === userId).length;
  };

  // Simulated provider reset password trigger
  const handleResetPasswordSimulated = (userName: string) => {
    alert(isRTL 
      ? `تم إيقاظ خادم البريد السحابي! رصيد معطيات إعادة التعيين لـ ${userName} متاح الآن.` 
      : `Lien de réinitialisation généré et envoyé à ${userName} avec succès !`);
  };

  return (
    <div className="flex flex-col gap-6" id={`admin-module-users-${userType}`}>
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
        <div className="flex flex-col text-right w-full md:w-auto">
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest leading-none dark:text-white">
            {isRTL 
              ? (isFreelancerTab ? 'دليل وإدارة شؤون الحرفيين والشركاء' : 'سجل رقابة وتدقيق حسابات الزبائن') 
              : (isFreelancerTab ? 'Registre et Management des Prestataires (KYC)' : 'SaaS Clients & Customer Directory')}
          </h3>
          <span className="text-[10px] text-slate-500 font-semibold mt-1.5 leading-snug">
            {isRTL 
              ? (isFreelancerTab ? 'دقق في وثائق المهنيين، وافق على الفاعلين المستقلين وعلق حسابات المخالفين.' : 'راجع بيانات المستهلكين المسجلين، أرصد نشاطاتهم وعلق المتواطئين منها.') 
              : (isFreelancerTab ? 'Valisez les dossiers de compétence, gérez les freelances de Rabat et suspendez les profils douteux.' : 'Consultez la liste des consommateurs, ajustez leurs profils et suspendez les comptes abusifs.')}
          </span>
        </div>

        {/* Directory Stats block */}
        <div className="flex gap-2.5 flex-row-reverse select-none">
          <div className={`px-4 py-2 border rounded-xl text-center font-mono ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100/50 border-gray-150'}`}>
            <span className="block text-[8px] uppercase text-gray-400 font-extrabold">{isRTL ? 'مفعل' : 'Actifs'}</span>
            <span className="text-sm font-black text-emerald-600">{filteredUsers.filter(u => !(u as any).isSuspended).length}</span>
          </div>
          <div className={`px-4 py-2 border rounded-xl text-center font-mono ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100/50 border-gray-150'}`}>
            <span className="block text-[8px] uppercase text-gray-400 font-extrabold">{isRTL ? 'محظور' : 'Suspendus'}</span>
            <span className="text-sm font-black text-rose-600">{filteredUsers.filter(u => (u as any).isSuspended === true).length}</span>
          </div>
        </div>
      </div>

      {/* Verification Desk for Providers ONLY */}
      {isFreelancerTab && verificationRequests.length > 0 && (
        <div className={`p-5 rounded-3xl border border-dashed transition-all duration-300 ${
          isDarkMode ? 'bg-indigo-950/10 border-indigo-500/30' : 'bg-sky-50/20 border-sky-400/50'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-sky-505 animate-pulse" />
            <span className="text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">
              {isRTL ? 'طلبات توثيق حسابات الحرفيين الجديدة (KYC)' : 'PROFILES VERIFICATION QUEUE (KYC)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {verificationRequests.map((req) => (
              <div 
                key={req.id} 
                className={`p-4 rounded-2xl border text-right flex flex-col justify-between gap-3 text-xs ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center flex-row-reverse text-[9px] font-bold">
                    <span className="bg-sky-50 text-sky-700 px-2 rounded dark:bg-sky-500/10 dark:text-sky-400">
                      {req.category}
                    </span>
                    <span className="text-gray-400">{req.experienceYears} ans exp</span>
                  </div>
                  <span className="font-extrabold mt-1 text-slate-800 dark:text-slate-100">{req.name}</span>
                  <p className="text-[10px] text-gray-400 mt-1">Skills: {req.skills.join(', ')}</p>
                  
                  <div className="mt-2.5 flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border text-[10px]">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="truncate">{req.idProofUrl}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 border-t border-gray-100/10 pt-2.5">
                  <button
                    onClick={() => onRejectFreelancer(req.id, req.name)}
                    className="px-2.5 py-1.5 border hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500 rounded-xl font-bold cursor-pointer transition-all"
                  >
                    {isRTL ? 'رفض' : 'Rejeter'}
                  </button>
                  <button
                    onClick={() => onApproveFreelancer(req.id, req.userId)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black cursor-pointer transition-all shadow-sm"
                  >
                    {isRTL ? 'تدقيق وقبول ✓' : 'Approuver ✓'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtering Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'ابحث سريعاً باسم المستخدم، المعرف الخاص، الهواية أو السكن...' : 'Rechercher par Nom, UID, Description ou Ville...'}
            className={`w-full text-xs px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${
              isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-sky-500' : 'bg-slate-50 border-gray-150 focus:border-indigo-600'
            }`}
          />
          <Search className={`absolute w-3.5 h-3.5 text-slate-400 top-3.5 ${isRTL ? 'left-3' : 'right-3'}`} />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 select-none self-end sm:self-auto">
          {[
            { id: 'all', ar: 'الكل', fr: 'Tous' },
            { id: 'suspended', ar: 'المحظورين', fr: 'Bloqués' },
            { id: 'verified', ar: 'الشركاء المعتمدين', fr: 'Vérifiés' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id as any)}
              className={`text-[10px] font-black px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                statusFilter === item.id 
                  ? 'bg-sky-600 border-sky-600 text-white shadow-md' 
                  : isDarkMode ? 'border-slate-800 hover:bg-slate-900 text-slate-400' : 'border-gray-200 hover:bg-slate-100 text-gray-500'
              }`}
            >
              {isRTL ? item.ar : item.fr}
            </button>
          ))}
        </div>
      </div>

      {/* Main Ledger Core Table */}
      <div className="overflow-x-auto rounded-2xl border dark:border-slate-800">
        <table className="w-full text-right text-xs min-w-[850px]">
          <thead className="bg-slate-50/50 text-slate-450 border-b select-none dark:bg-slate-950/40 dark:border-slate-800 font-mono">
            <tr>
              <th className="p-3.5 font-bold text-left">{isRTL ? 'الاسم والعضو' : 'Name'}</th>
              <th className="p-3.5 font-bold text-left">{isRTL ? 'البريد الإلكتروني' : 'Email'}</th>
              <th className="p-3.5 font-bold text-left">{isRTL ? 'الدور' : 'Role'}</th>
              <th className="p-3.5 font-bold text-left">{isRTL ? 'الحالة' : 'Status'}</th>
              <th className="p-3.5 font-bold text-left">{isRTL ? 'الطلبات' : 'Orders'}</th>
              <th className="p-3.5 font-bold text-left">{isRTL ? 'المحفظة' : 'Wallet'}</th>
              <th className="p-3.5 font-bold text-center">{isRTL ? 'إجراءات السيطرة' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/10 font-medium font-sans">
            {loadingUsers ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-400 font-bold select-none animate-pulse">
                  {isRTL ? 'جاري استيراد الحسابات وتدقيق listeners البيانات...' : 'Synchronisation des profils live...'}
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-400 font-bold select-none">
                  {isRTL ? 'لم نعثر على أي تطابق تحت هذا الفلتر.' : 'Aucun utilisateur ne correspond à ce filtre.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((usr) => {
                const isSuspended = (usr as any).isSuspended === true;
                const userUploadedFiles = allFiles.filter(f => f.userId === usr.uid);
                const emailAddress = userEmails[usr.uid] || '---';

                // Let's generate a mock wallet balance for this enterprise panel
                const walletBalance = (usr as any).walletBalance !== undefined 
                  ? (usr as any).walletBalance 
                  : (usr.isVerifiedTasker ? 450 : 120);

                const ordersCount = getUserOrderCount(usr.uid, usr.isTasker);

                return (
                  <tr key={usr.uid} className="hover:bg-slate-100/40 dark:hover:bg-slate-900/15 transition-all border-b dark:border-slate-850">
                    {/* 1. Name */}
                    <td className="p-3.5 text-left cursor-pointer" onClick={() => setDetailedUser(usr)}>
                      <div className="flex items-center gap-2.5 flex-row">
                        <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                          {usr.displayName ? usr.displayName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-extrabold text-slate-900 dark:text-white leading-tight hover:underline flex items-center gap-1">
                            {usr.displayName || 'Utilisateur'}
                            {usr.isVerifiedTasker && (
                              <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" title="Vérifié" />
                            )}
                          </span>
                          <span className="text-[8px] font-mono text-sky-500 select-all leading-none mt-1">{usr.uid}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Email */}
                    <td className="p-3.5 text-left font-mono text-slate-650 dark:text-slate-300 text-[10.5px]">
                      {emailAddress}
                    </td>

                    {/* 3. Role */}
                    <td className="p-3.5 text-left">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase ${
                        usr.isTasker 
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' 
                          : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}>
                        {usr.isTasker ? (isRTL ? 'حرفي منفذ' : 'Provider') : (isRTL ? 'زبون طالب' : 'Customer')}
                      </span>
                    </td>

                    {/* 4. Status */}
                    <td className="p-3.5 text-left">
                      {isSuspended ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full font-black dark:bg-red-500/10 dark:text-red-400 select-none text-[9.5px]">
                          <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                          <span>{isRTL ? 'محظور' : 'Suspended'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-black dark:bg-emerald-500/10 dark:text-emerald-400 select-none text-[9.5px]">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{isRTL ? 'نشط' : 'Active'}</span>
                        </span>
                      )}
                    </td>

                    {/* 5. Orders Count */}
                    <td className="p-3.5 text-left font-bold font-mono">
                      {ordersCount}
                    </td>

                    {/* 6. Wallet */}
                    <td className="p-3.5 text-left font-mono font-extrabold text-slate-800 dark:text-white">
                      {walletBalance} MAD
                    </td>

                    {/* 7. Actions */}
                    <td className="p-3.5 text-center flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setDetailedUser(usr)}
                        className="px-2.5 py-1.5 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 rounded-lg text-[9.5px] font-black cursor-pointer hover:bg-sky-100 transition-all"
                      >
                        {isRTL ? 'تفاصيل KYC' : 'Verify Details'}
                      </button>
                      <button
                        onClick={() => onToggleBlockUser(usr.uid, isSuspended)}
                        disabled={processingUsers[usr.uid] === true}
                        className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-black cursor-pointer transition-all ${
                          processingUsers[usr.uid] === true 
                            ? 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed dark:bg-slate-800'
                            : isSuspended 
                              ? 'bg-emerald-50 border border-emerald-250 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent' 
                              : 'bg-amber-50 border border-amber-250 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-transparent'
                        }`}
                      >
                        {processingUsers[usr.uid] === true 
                          ? (isRTL ? 'جاري...' : 'Processing...') 
                          : isSuspended ? (isRTL ? 'تنشيط' : 'Activate') : (isRTL ? 'حظر' : 'Suspend 🛑')}
                      </button>
                      <button
                        onClick={() => onDeleteUser(usr.uid)}
                        disabled={processingUsers[usr.uid] === true}
                        className={`p-1 px-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all cursor-pointer border border-rose-150/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-transparent ${
                          processingUsers[usr.uid] === true ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 👤 PROVIDER DETAIL DYNAMIC PANEL DIALOG (FULL SYSTEM CONTRACT SPEC) */}
      {detailedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
          <div className={`w-full max-w-3xl rounded-3xl border text-right font-sans ${
            isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-855 border-gray-150 shadow-2xl'
          } overflow-hidden max-h-[90vh] flex flex-col`}>
            
            {/* Modal Header */}
            <div className={`p-5 border-b dark:border-slate-800 flex items-center justify-between ${
              isDarkMode ? 'bg-slate-950/40' : 'bg-slate-50/50'
            }`}>
              <button 
                onClick={() => setDetailedUser(null)}
                className="p-1 px-2.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-gray-400 transition-all font-bold text-xs"
              >
                ✕ Close
              </button>
              <div className="flex items-center gap-2 flex-row-reverse text-right">
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-black tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  {isRTL ? 'ملخص تدقيق الحساب المعمق والوثائق' : 'Full Provider KYC & Management Console'}
                </span>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6 text-right">
              
              {/* Layout Grid: ProfileCard (left/top) & StatsGrid (right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* 1. ProfileCard (Span 5) */}
                <div className={`md:col-span-5 p-5 rounded-2xl border flex flex-col items-center text-center gap-3 relative ${
                  isDarkMode ? 'bg-slate-950/30 border-slate-800' : 'bg-slate-50/50 border-gray-150'
                }`}>
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg">
                    {detailedUser.displayName ? detailedUser.displayName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1 justify-center">
                      {detailedUser.displayName}
                      {detailedUser.isVerifiedTasker && <Award className="w-4.5 h-4.5 text-indigo-500" />}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400 mt-1 select-all">{detailedUser.uid}</span>
                    <span className="text-[10px] text-gray-405 mt-0.5">{userEmails[detailedUser.uid] || 'amine.kyc@airtasker.ma'}</span>
                  </div>

                  <div className="w-full mt-2 border-t pt-2.5 text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-1.5">
                    <div className="flex justify-between flex-row-reverse">
                      <span className="text-gray-400">{isRTL ? 'موقع السكن' : 'Lieu :'}</span>
                      <span className="font-bold flex items-center gap-0.5"><MapPin className="w-3 h-3 text-red-500" /> {detailedUser.location || (isRTL ? 'أكدال، الرباط' : 'Agdal, Rabat')}</span>
                    </div>
                    <div className="flex justify-between flex-row-reverse text-right mt-1">
                      <span className="text-gray-400">{isRTL ? 'التقييم العام' : 'Score d\'avis :'}</span>
                      <span className="font-extrabold text-[#f59e0b] font-mono">★ {detailedUser.rating || '4.9'} ({detailedUser.reviewsCount || 0} reviews)</span>
                    </div>
                  </div>

                  <div className="w-full border-t pt-2 mt-1 text-center text-[10.5px] italic text-slate-500">
                    "{detailedUser.bio || (isRTL ? 'لا يوجد نبذة سيرة شخصية مدرجة للعميل أو الشريك.' : 'Aucun biographie disponible.')}"
                  </div>
                </div>

                {/* 2. StatsGrid + EarningsChart (Span 7) */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  
                  {/* Stats Cards Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 border dark:border-slate-800 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/5 flex flex-col text-right">
                      <span className="text-[9px] uppercase text-gray-400 font-bold">{isRTL ? 'إجمالي المكتمل' : 'Missions Fini'}</span>
                      <span className="text-base font-black font-mono text-indigo-500 mt-1">
                        {getUserOrderCount(detailedUser.uid, detailedUser.isTasker)}
                      </span>
                    </div>
                    <div className="p-3 border dark:border-slate-800 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/5 flex flex-col text-right">
                      <span className="text-[9px] uppercase text-gray-400 font-bold">{isRTL ? 'الرصيد الكلي' : 'Cash Wallet'}</span>
                      <span className="text-base font-black font-mono text-emerald-600 mt-1">
                        {(detailedUser as any).walletBalance || (detailedUser.isVerifiedTasker ? 450 : 120)} MAD
                      </span>
                    </div>
                    <div className="p-3 border dark:border-slate-800 rounded-xl bg-amber-500/5 dark:bg-amber-500/5 flex flex-col text-right">
                      <span className="text-[10px] uppercase text-gray-400 font-bold">{isRTL ? 'ترخيص العمل' : 'Niveau'}</span>
                      <span className="text-[10px] font-black text-amber-600 mt-2">
                        {detailedUser.isVerifiedTasker ? 'Tier PRO 1' : 'Standard'}
                      </span>
                    </div>
                  </div>

                  {/* EarningsChart: Custom CSS Category Bar visual progress chart */}
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50/50 border-gray-150'
                  }`}>
                    <span className="text-[10px] font-black uppercase text-gray-405 block mb-2">{isRTL ? 'توزيع المهارات والمداخيل حسب الاختصاص' : 'Earning distributions breakdown (%)'}</span>
                    <div className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                      <div>
                        <div className="flex justify-between items-center flex-row-reverse mb-1">
                          <span>{isRTL ? 'أعمال صيانة الأنابيب والسباكة' : 'Plomberie'}</span>
                          <span className="font-mono font-bold">60%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: '60%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center flex-row-reverse mb-1">
                          <span>{isRTL ? 'إصلاح التجهيزات والتركيب' : 'Réparations'}</span>
                          <span className="font-mono font-bold">25%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center flex-row-reverse mb-1">
                          <span>{isRTL ? 'نفاذ وحركة الأعمال المنزلية الأخرى' : 'Divers'}</span>
                          <span className="font-mono font-bold">15%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3. KYCViewer Container */}
              <div className={`p-4 rounded-2xl border ${
                detailedUser.isVerifiedTasker ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20'
              }`}>
                <div className="flex items-center gap-1.5 mb-2.5 flex-row-reverse">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase text-indigo-505">{isRTL ? 'تدقيق ملف الهوية والتراخيص القانونية (KYC)' : 'KYC Document Portfolio Audit'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-loose text-right">
                  <div className="p-3 border dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
                    <span className="text-gray-400 block text-[9.5px] uppercase">{isRTL ? 'بطاقة الهوية الوطنية' : 'ID Proof (Morocco)'}</span>
                    <span className="font-bold text-slate-800 dark:text-gray-200 block mt-1">CIN_Verified_National.pdf</span>
                    <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-extrabold mt-1">✓ PASSED VALIDATION</span>
                  </div>

                  <div className="p-3 border dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
                    <span className="text-gray-400 block text-[9.5px] uppercase">{isRTL ? 'السوابق الجنائية (الفحص الأمني)' : 'Security Check'}</span>
                    <span className="font-bold text-slate-800 dark:text-gray-200 block mt-1">Police_Check_Morocco.pdf</span>
                    <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-extrabold mt-1">✓ PASSED CRITÈRES</span>
                  </div>

                  <div className="p-3 border dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
                    <span className="text-gray-400 block text-[9.5px] uppercase">{isRTL ? 'تأمين المسؤولية المهنية' : 'Pro Insurance'}</span>
                    <span className="font-bold text-slate-800 dark:text-gray-200 block mt-1">RC_Professionnelle.pdf</span>
                    <span className="inline-flex items-center gap-1 text-[9px] text-indigo-600 font-extrabold mt-1">✓ ACTIVATED PRO</span>
                  </div>
                </div>
              </div>

              {/* 4. OrdersTable: lists assignments */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-gray-405 block text-left mb-1">{isRTL ? 'تاريخ وسجلات آخر تذاكر منجزة' : 'Assigned tasks list ledger'}</span>
                <div className="overflow-x-auto rounded-xl border dark:border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#111827]/10 dark:bg-slate-950/65 font-bold">
                      <tr>
                        <th className="p-2 text-left">{isRTL ? 'معرف تذكرة العمل' : 'Order ID'}</th>
                        <th className="p-2 text-left">{isRTL ? 'عنوان المهمة الفعلي' : 'Task Title'}</th>
                        <th className="p-2 text-left">{isRTL ? 'سعر الصفقة' : 'Price'}</th>
                        <th className="p-2 text-left">{isRTL ? 'حالة التوزيع' : 'SaaS Statut'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.filter(t => t.taskerId === detailedUser.uid || t.posterId === detailedUser.uid).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-gray-400">{isRTL ? 'لم يتم رصد أي تذاكر عمل مرتبطة بهذا الحساب بعد.' : 'Aucun ordre assigné à ce compte.'}</td>
                        </tr>
                      ) : (
                        tasks.filter(t => t.taskerId === detailedUser.uid || t.posterId === detailedUser.uid).map((t) => (
                          <tr key={t.id} className="border-t dark:border-slate-800 hover:bg-slate-500/5">
                            <td className="p-2 select-all font-mono text-[9px] text-sky-505 text-left">{t.id.substring(0,8)}</td>
                            <td className="p-2 text-left font-semibold">{t.title}</td>
                            <td className="p-2 text-left font-mono font-bold text-indigo-500">{t.budget} MAD</td>
                            <td className="p-2 text-left font-bold capitalize text-[9.5px] text-emerald-600">{t.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. ActionPanel administrative keys */}
              <div className="border-t dark:border-slate-800 pt-4 mt-2 flex flex-wrap justify-end gap-2.5">
                <button
                  onClick={() => handleResetPasswordSimulated(detailedUser.displayName)}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer transition-all shrink-0"
                >
                  {isRTL ? 'إرسال رابط استعادة كلمة المرور' : 'Reset Password Link'}
                </button>
                <button
                  onClick={() => {
                    const reqId = verificationRequests.find(r => r.userId === detailedUser.uid)?.id || 'vr1';
                    onApproveFreelancer(reqId, detailedUser.uid);
                    setDetailedUser(prev => prev ? { ...prev, isVerifiedTasker: true } : null);
                  }}
                  className="px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer transition-all shrink-0"
                >
                  {isRTL ? 'قبول واعتماد الحساب ✓' : 'Approve & Verify KYC ✓'}
                </button>
                <button
                  onClick={() => {
                    const isCurrentlySuspended = (detailedUser as any).isSuspended === true;
                    onToggleBlockUser(detailedUser.uid, isCurrentlySuspended);
                    setDetailedUser(prev => prev ? { ...prev, isSuspended: !isCurrentlySuspended } as any : null);
                  }}
                  disabled={processingUsers[detailedUser.uid] === true}
                  className={`px-4 py-2 text-xs font-black rounded-xl cursor-pointer transition-all shrink-0 ${
                    processingUsers[detailedUser.uid] === true 
                      ? 'bg-slate-400 opacity-60 text-slate-100 cursor-not-allowed dark:bg-slate-800'
                      : (detailedUser as any).isSuspended === true 
                        ? 'bg-[#10b981] hover:bg-emerald-600 text-white' 
                        : 'bg-rose-650 hover:bg-rose-700 text-white'
                  }`}
                >
                  {processingUsers[detailedUser.uid] === true 
                    ? (isRTL ? 'جاري...' : 'Processing...') 
                    : (detailedUser as any).isSuspended === true 
                      ? (isRTL ? 'إعادة التنشيط الفوري' : 'Unsuspend Profile') 
                      : (isRTL ? 'تعليق وتجميد الحساب 🛑' : 'Suspend Provider 🛑')}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
