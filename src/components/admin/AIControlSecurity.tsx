import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldAlert, 
  Lock, 
  Activity, 
  Compass, 
  TrendingUp, 
  FileText, 
  Download, 
  HelpCircle,
  EyeOff
} from 'lucide-react';

interface AIControlSecurityProps {
  isRTL: boolean;
  isDarkMode: boolean;
  onAddLog: (log: string) => void;
}

export default function AIControlSecurity({
  isRTL,
  isDarkMode,
  onAddLog
}: AIControlSecurityProps) {
  // AI anomaly sensory logs state
  const [anomalyLogs, setAnomalyLogs] = useState([
    { id: 'AN-501', user: 'Simohammed Y.', action: 'Velocity limit trigger', confidence: '94%', category: 'Sybil Account Clash', status: 'flagged' },
    { id: 'AN-502', user: 'Karim S.', action: 'Unusual pricing: 12,000 MAD for pipe fixing', confidence: '88%', category: 'Money-Laundering Shield', status: 'flagged' },
    { id: 'AN-503', user: 'Rachid M.', action: 'Multiple accounts used from same browser fingerprint', confidence: '71%', category: 'Fraud Ring Sensor', status: 'handled' }
  ]);

  // Backoffice RBAC operator privileges matrix list
  const [admins, setAdmins] = useState([
    { id: 'A-1', email: 'amine.saas@airtasker.ma', role: 'Superadmin', lastAction: 'Revoked worker KYC #91', status: 'active' },
    { id: 'A-2', email: 'amina.support@airtasker.ma', role: 'Support Agent', lastAction: 'Resolved ticket TKT-702', status: 'active' },
    { id: 'A-3', email: 'bilal.ops@airtasker.ma', role: 'Moderation Agent', lastAction: 'Flagged suspicious billing card', status: 'active' }
  ]);

  // Recent logins audit trail
  const [sessions, setSessions] = useState([
    { id: 'S-77', email: 'amine.saas@airtasker.ma', ip: '105.158.42.11', location: 'Rabat, Morocco', device: 'Chrome on macOS', time: 'Active now' },
    { id: 'S-76', email: 'amina.support@airtasker.ma', ip: '196.200.12.54', location: 'Salé, Morocco', device: 'Safari on iPhone', time: '14m ago' }
  ]);

  const handleResolveAnomaly = (anId: string, name: string) => {
    setAnomalyLogs(prev => prev.map(a => a.id === anId ? { ...a, status: 'handled' } : a));
    onAddLog(`AI Sensor: Cleared anomaly trigger [${anId}] of user ${name}`);
    alert(isRTL ? 'تم تدقيق التنبيه الآلي وتثبيت سلامة المعاملة!' : 'Alerte d\'anomalie résorbe.');
  };

  const handleAddLogMessage = () => {
    onAddLog('SecOps: Downloaded system database audit logs (.csv)');
    alert(isRTL ? 'تهانينا! تم تحميل الأرشيف المحاسبي لإنذارات الأمان بنجاح!' : 'Fichier d\'audit de sécurité téléchargé avec succès !');
  };

  return (
    <div className="flex flex-col gap-8" id="admin-module-ai-control-security">
      {/* 1. AI Center Anomalies and matching parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Anomaly triggers logs */}
        <div className={`p-5 rounded-3xl border lg:col-span-8 flex flex-col gap-4 text-right ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 mb-1 flex-row-reverse">
            <Cpu className="w-4 h-4 text-sky-505 shrink-0" />
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              {isRTL ? 'مرصد الأمان والتحكم الآلي بالذكاء الاصطناعي (SecOps AI)' : 'Détection d\'Anomalies & Sécurité Comportementale'}
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/50 text-slate-400 border-b select-none dark:bg-slate-950/40 dark:border-slate-800">
                <tr>
                  <th className="p-2 text-right">{isRTL ? 'الإنذار والفئة' : 'Profil & ID'}</th>
                  <th className="p-2 text-right">{isRTL ? 'السلوك المريب المستشعر' : 'Comportement suspect'}</th>
                  <th className="p-2 text-right">{isRTL ? 'نسبة الثقة' : 'Score'}</th>
                  <th className="p-2 text-center">{isRTL ? 'إجراء الرقابة' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/10 font-bold text-[11px]">
                {anomalyLogs.map((an) => (
                  <tr key={an.id} className="hover:bg-slate-100/30 transition-all border-b dark:border-slate-850">
                    <td className="p-2.5">
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{an.user}</span>
                        <span className="text-[8.5px] font-mono text-indigo-400 select-all">{an.category}</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-gray-500">{an.action}</td>
                    <td className="p-2.5 font-mono text-red-600">{an.confidence}</td>
                    <td className="p-2.5 text-center">
                      {an.status === 'flagged' ? (
                        <button
                          onClick={() => handleResolveAnomaly(an.id, an.user)}
                          className="px-2.5 py-1 text-[10px] bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 rounded-lg cursor-pointer"
                        >
                          {isRTL ? 'تسوية المشكلة' : 'Valider/Traiter'}
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase font-black text-emerald-500 select-none">RESOLVED ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Analytics charts and downloads */}
        <div className={`p-5 rounded-3xl border lg:col-span-4 flex flex-col justify-between gap-4 text-right ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
        }`}>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              {isRTL ? 'تصدير التقارير الإحصائية والمحاسبية' : 'SaaS BI Reports & Auditing'}
            </h4>
            <p className="text-[10.5px] text-gray-400 leading-relaxed mt-1.5">
              {isRTL ? 'احصل على ملفات محاسبية متكاملة بصيغة CSV لتدقيق أداء الحركات والعمولة الإجمالية.' : 'Téléchargez la table comptable complète pour vos déclarations de commission.'}
            </p>
          </div>

          <div className="space-y-2 mt-2 font-bold text-xs">
            <div className="p-3 border dark:border-slate-800 rounded-2xl flex items-center justify-between text-slate-500">
              <span className="font-mono">1.10 GB</span>
              <span>database_backup_rabat.sql</span>
            </div>
          </div>

          <button
            onClick={handleAddLogMessage}
            className="w-full mt-3 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black py-3 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{isRTL ? 'تحميل الأرشيف الأمني (.csv)' : 'Exporter les audits de Sécurité'}</span>
          </button>
        </div>
      </div>

      {/* 2. Security (RBAC configurations and Admin Accounts) */}
      <div className={`p-5 rounded-3xl border flex flex-col gap-4 text-right ${
        isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
      }`}>
        <div className="flex justify-between items-center border-b pb-2 flex-row-reverse">
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
            {isRTL ? 'إدارة أدوار المشرفين وصلاحيات الـ (RBAC)' : 'Contrôle d\'Accès des Opérateurs (RBAC)'}
          </h4>
          <Lock className="w-4 h-4 text-sky-505" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/50 text-slate-400 border-b select-none dark:bg-slate-950/40 dark:border-slate-800">
              <tr>
                <th className="p-2 text-right">{isRTL ? 'حساب المشرف والبريد' : 'Opérateur'}</th>
                <th className="p-2 text-right">{isRTL ? 'المجموعة (صلاحية الدخول)' : 'Groupe Sécurisé'}</th>
                <th className="p-2 text-right">{isRTL ? 'آخر نشاط إداري وميداني' : 'Dernière action'}</th>
                <th className="p-2 text-center">{isRTL ? 'الحالة والنشاط' : 'Statut'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/10 font-bold text-[11px]">
              {admins.map((adm) => (
                <tr key={adm.id} className="hover:bg-slate-100/30 transition-all border-b dark:border-slate-850">
                  <td className="p-2.5">
                    <div className="flex flex-col text-left">
                      <span className="font-extrabold text-slate-800 dark:text-slate-100">{adm.email}</span>
                      <span className="text-[8.5px] font-mono text-indigo-400">{adm.id}</span>
                    </div>
                  </td>
                  <td className="p-2.5 text-indigo-650 dark:text-indigo-400 uppercase text-[10.5px] font-black">{adm.role}</td>
                  <td className="p-2.5 text-gray-500">{adm.lastAction}</td>
                  <td className="p-2.5 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded text-[9.5px] font-black bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10">
                      {adm.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
