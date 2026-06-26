import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, Check, MapPin } from 'lucide-react';
import { UserProfile } from '../../types';

interface RabatNeighborhood {
  id: string;
  ar: string;
  fr: string;
}

interface ServiceCategory {
  id: string;
  ar: string;
  fr: string;
  icon: string;
}

interface WorkerDashboardProfileTabProps {
  lang: 'ar' | 'fr';
  isRTL: boolean;
  editBio: string;
  setEditBio: (bio: string) => void;
  editLocation: string;
  setEditLocation: (loc: string) => void;
  editMinRate: number;
  setEditMinRate: (rate: number) => void;
  editSkills: string[];
  handleToggleSkill: (skillId: string) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  profileSuccessAlert: boolean;
  savingProfile: boolean;
  rabatNeighborhoods: RabatNeighborhood[];
  serviceCategories: ServiceCategory[];
}

export default function WorkerDashboardProfileTab({
  lang,
  isRTL,
  editBio,
  setEditBio,
  editLocation,
  setEditLocation,
  editMinRate,
  setEditMinRate,
  editSkills,
  handleToggleSkill,
  handleUpdateProfile,
  profileSuccessAlert,
  savingProfile,
  rabatNeighborhoods,
  serviceCategories
}: WorkerDashboardProfileTabProps) {
  return (
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
            className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 mb-5 text-right"
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
              {rabatNeighborhoods.map(n => (
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
            {serviceCategories.map((cat) => {
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
  );
}
