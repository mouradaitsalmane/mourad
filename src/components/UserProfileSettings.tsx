import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, UserPrivateInfo } from '../types';
import { RABAT_NEIGHBORHOODS, TRANSLATIONS, LanguageKey } from '../data/rabatData';
import { Settings, X, ShieldAlert, Star, MapPin, UserCheck, AlertCircle, ShieldCheck, Award, Sparkles } from 'lucide-react';
import PayzonePayment from './PayzonePayment';

interface UserProfileSettingsProps {
  user: any;
  userProfile: UserProfile | null;
  lang: LanguageKey;
  onClose: () => void;
  onSave: (updatedProfile: UserProfile) => void;
  forceSetup?: boolean;
}

export default function UserProfileSettings({
  user,
  userProfile,
  lang,
  onClose,
  onSave,
  forceSetup = false
}: UserProfileSettingsProps) {
  const t = TRANSLATIONS[lang];

  // Core setup states
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isTasker, setIsTasker] = useState<boolean>(userProfile?.isTasker ?? true);
  const [location, setLocation] = useState(userProfile?.location || 'agdal');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom Payzone States
  const [isVerified, setIsVerified] = useState<boolean>((userProfile as any)?.isVerifiedTasker ?? false);
  const [showPayzone, setShowPayzone] = useState(false);

  // Load private phone information if editing existing
  useEffect(() => {
    if (user && !forceSetup) {
      const fetchPrivateInfo = async () => {
        try {
          const privateSnap = await getDoc(doc(db, 'users', user.uid, 'private', 'info'));
          if (privateSnap.exists()) {
            setPhoneNumber(privateSnap.data().phone || '');
          }
        } catch (err) {
          console.error("Private info bypass check (expected on rule restrictions context):", err);
        }
      };
      fetchPrivateInfo();
    }
  }, [user, forceSetup]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (displayName.trim().length < 2 || displayName.trim().length > 80) {
      setError(lang === 'ar' ? 'الاسم يجب أن يكون حرفين على الأقل.' : 'Le nom doit comporter au moins 2 caractères.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Find neighborhood translation values
      const matchedDistrict = RABAT_NEIGHBORHOODS.find(n => n.id === location);
      const chosenLocation = matchedDistrict ? (lang === 'ar' ? matchedDistrict.ar : matchedDistrict.fr) : location;

      // 1. Save Public User profile data
      const publicData: UserProfile = {
        uid: user.uid,
        displayName: displayName.trim(),
        bio: bio.trim(),
        rating: userProfile?.rating || 0,
        reviewsCount: userProfile?.reviewsCount || 0,
        isTasker: isTasker,
        location: chosenLocation,
        createdAt: userProfile?.createdAt || serverTimestamp(),
        isVerifiedTasker: isVerified
      };

      const publicPath = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), publicData);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, publicPath);
      }

      // 2. Save Private User profile data containing PII (Split Collection strategy!)
      const privateData: UserPrivateInfo = {
        email: user.email || '',
        phone: phoneNumber.trim(),
        updatedAt: serverTimestamp()
      };

      const privatePath = `users/${user.uid}/private/info`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'private', 'info'), privateData);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, privatePath);
      }

      onSave(publicData);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'خطأ أثناء حفظ وإعداد بيانات الحساب الشخصي.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="profile-settings-dialog">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={forceSetup ? undefined : onClose} />

      <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-right shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md flex flex-col border border-gray-100">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-sky-50/10">
            <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
              <Settings className="w-5 h-5 text-sky-600" />
              <span>{forceSetup ? t.setupProfileTitle : lang === 'ar' ? 'تعديل الحساب الشخصي' : 'Modifier le profil'}</span>
            </h3>
            {!forceSetup && (
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 flex flex-col gap-5 text-right">
            
            {forceSetup && (
              <p className="text-xs text-sky-700 bg-sky-50 p-3.5 rounded-xl border border-sky-200/40 leading-relaxed">
                {t.setupProfileDesc}
              </p>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200/50 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Display Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                {lang === 'ar' ? 'الاسم واللقب المطلوب' : 'Votre nom complet'}
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="مثال: يوسف الرباطي"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Neighborhood select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                {lang === 'ar' ? 'منطقتك أو حي إقامتك بالرباط' : 'Votre quartier à Rabat'}
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-sky-500 bg-white"
              >
                {RABAT_NEIGHBORHOODS.map(n => (
                  <option key={n.id} value={n.id}>
                    {lang === 'ar' ? n.ar : n.fr}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone (PII: Split Collection Write) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                {lang === 'ar' ? 'رقم الهاتف للتواصل (خاص وسري)' : 'Numéro de téléphone (Privé)'}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="مثال: 0612345678"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Choose user type (isTasker) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700">
                {t.chooseUserType}
              </label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setIsTasker(true)}
                  className={`px-3 py-3.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    isTasker 
                      ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-xs' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{t.yesTasker}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTasker(false)}
                  className={`px-3 py-3.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    !isTasker 
                      ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-xs' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span>{t.noPoster}</span>
                </button>
              </div>
            </div>

            {/* Profile Bio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                {lang === 'ar' ? 'نبذة قصيرة تصف مهاراتك وخبرتك للرباحين' : 'Votre description/Bio'}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t.bioPlaceholder}
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>

            {/* Payzone Moroccan Gateway Verification Option */}
            {isTasker && (
              <div className="p-4 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/40 flex flex-col gap-3 text-right">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-100 text-sky-700 shrink-0">
                    <Award className="w-5 h-5 text-sky-600 animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-sky-950 flex items-center gap-1">
                      {lang === 'ar' ? 'توثيق الحساب بالرباط وشعار المستقل المحترف' : 'Badge de confiance RabatTasker'}
                      {isVerified && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-md font-black flex items-center gap-0.5">
                          ✓ {lang === 'ar' ? 'موثق' : 'Vérifié'}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 font-semibold leading-relaxed">
                      {lang === 'ar' 
                        ? 'احصل على شارة مميز خضراء، وزد فرصة اختيار لخدماتك بـ 5 أضعاف فورياً عند الدفع عبر بوابة Payzone!'
                        : 'Augmentez la visibilité et gagnez de la crédibilité instantanément grâce à Payzone.'}
                    </span>
                  </div>
                </div>

                {isVerified ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 py-2 px-3 rounded-lg border border-emerald-200/50 justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'ar' ? 'حسابك موثق ونشط عبر بوابة Payzone المغربية' : 'Votre compte est certifié via Payzone.'}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPayzone(true)}
                    className="w-full bg-gradient-to-r from-sky-600 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5 h-11"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'توثيق الحساب الآن (150 درهم مغربي)' : 'S’enregistrer avec Payzone (150 MAD)'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Submit save */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all mt-2 cursor-pointer ${
                loading ? 'opacity-55 cursor-not-allowed animate-pulse' : ''
              }`}
              id="save-profile-btn"
            >
              {loading ? (lang === 'ar' ? 'جاري الحفظ...' : 'Sauvegarde...') : t.setupProfileBtn}
            </button>

            {/* Payzone Payment Modular Overlay */}
            {showPayzone && (
              <PayzonePayment
                amount={150} // 150 MAD for verified badge
                paymentType="badge"
                userUid={user.uid}
                userEmail={user.email}
                lang={lang}
                onClose={() => setShowPayzone(false)}
                onSuccess={() => {
                  setIsVerified(true);
                  setShowPayzone(false);
                }}
              />
            )}

          </form>
        </div>
      </div>
    </div>
  );
}
