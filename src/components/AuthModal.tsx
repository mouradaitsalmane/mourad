import React, { useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup 
} from '../lib/firebase';
import { 
  sendPasswordResetEmail,
} from 'firebase/auth';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  ChevronRight 
} from 'lucide-react';
import { LanguageKey, TRANSLATIONS } from '../data/rabatData';
import { UserProfile, UserPrivateInfo } from '../types';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  lang: LanguageKey;
  onSuccess: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function AuthModal({ onClose, lang, onSuccess, initialMode }: AuthModalProps) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode || 'signin');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'client' | 'tasker' | null>(null);
  const [signupStep, setSignupStep] = useState<1 | 2>(1);

  // Toggle Modes
  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    if (newMode === 'signup') {
      setSignupStep(1);
      setSelectedRole(null);
    }
  };

  // Google Authentication Trigger
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(isRTL ? 'حدث خطأ أثناء الاتصال بـ Google. يرجى المحاولة لاحقاً.' : 'Échec de la connexion avec Google.');
    } finally {
      setLoading(false);
    }
  };

  // Apple Authentication Trigger (Mock / Alert)
  const handleAppleAuth = () => {
    setError(
      isRTL 
        ? 'تسجيل الدخول بواسطة Apple غير مدعوم في بيئة المعاينة الحالية، يرجى استخدام البريد الإلكتروني أو حساب Google.' 
        : "La connexion avec Apple n'est pas disponible pour le moment. Veuillez utiliser Google ou votre e-mail."
    );
  };

  // Form Validations & Submissions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Context A: Password Reset Flow
    if (mode === 'forgot') {
      if (!email.trim()) {
        setError(isRTL ? 'الرجاء إدخال البريد الإلكتروني بشكل صحيح.' : 'Veuillez saisir votre e-mail.');
        return;
      }
      try {
        setLoading(true);
        await sendPasswordResetEmail(auth, email.trim());
        setSuccessMsg(
          isRTL 
            ? 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح.' 
            : 'Un lien de réinitialisation vous a été envoyé par e-mail.'
        );
      } catch (err: any) {
        console.error(err);
        setError(
          err.code === 'auth/user-not-found' 
            ? (isRTL ? 'عذراً، هذا البريد الإلكتروني غير مسجل لدينا.' : 'Aucun utilisateur trouvé avec cet e-mail.')
            : (isRTL ? 'فشل إرسال رابط الاستعادة، يرجى التحقق من صحة البريد الإلكتروني.' : 'Erreur lors de l’envoi du lien de réinitialisation.')
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // Context B: Custom Email/Password Login
    if (mode === 'signin') {
      if (!email.trim() || !password) {
        setError(isRTL ? 'الرجاء ملء حقول البريد الإلكتروني وكلمة المرور.' : 'Veuillez remplir tous les champs requis.');
        return;
      }
      try {
        setLoading(true);
        await login(email.trim(), password);
        onSuccess();
        onClose();
      } catch (err: any) {
        console.error(err);
        let errorMsg = isRTL ? 'فشل تسجيل الدخول. يرجى التأكد من البريد الإلكتروني أو كلمة المرور.' : 'Identifiants incorrects.';
        if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          errorMsg = isRTL ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'E-mail ou mot de passe incorrect.';
        } else if (err.code === 'auth/invalid-email') {
          errorMsg = isRTL ? 'عنوان البريد الإلكتروني غير صالح.' : 'E-mail invalide.';
        } else if (err.code === 'auth/network-request-failed') {
          errorMsg = isRTL ? 'خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.' : 'Erreur de réseau. Veuillez vérifier votre connexion.';
        } else if (err.message?.includes('Profile document not found')) {
          errorMsg = isRTL ? 'لم يتم العثور على ملف تعريف المستخدم في قاعدة البيانات.' : 'Profil introuvable dans la base de données.';
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Context C: User Registration
    if (mode === 'signup') {
      if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
        setError(isRTL ? 'الرجاء ملء كافة البيانات المطلوبة.' : 'Veuillez remplir tous les champs.');
        return;
      }
      if (password.length < 10) {
        setError(isRTL ? 'يجب أن لا تقل كلمة المرور عن 10 أحرف تماشياً مع سياسة حماية الحسابات.' : 'Le mot de passe doit comporter au moins 10 caractères conformément aux exigences de sécurité.');
        return;
      }
      if (password !== confirmPassword) {
        setError(isRTL ? 'كلمتا المرور غير متطابقين.' : 'Les mots de passe ne correspondent pas.');
        return;
      }
      if (!agreeTerms) {
        setError(isRTL ? 'يجب عليك الموافقة على الشروط والأحكام للاستمرار.' : 'Veuillez accepter les conditions d’utilisation.');
        return;
      }

      try {
        setLoading(true);

        const userRole = (selectedRole === 'client' || selectedRole === 'tasker') ? selectedRole : 'client';
        const mappedRole = userRole === 'tasker' ? 'worker' : 'client';
        
        await signup(email.trim(), password, mappedRole, fullName.trim(), phone.trim());

        setSuccessMsg(isRTL ? 'تم إنشاء حسابك بنجاح وجاري توجيهك...' : 'Compte créé avec succès !');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);

      } catch (err: any) {
        console.error("General Signup catch block caught error:", err);
        let errorMsg = isRTL ? 'فشل إنشاء الحساب الشخصي.' : 'Erreur lors de la création du compte.';
        if (err.code === 'auth/email-already-in-use') {
          errorMsg = isRTL ? 'هذا البريد الإلكتروني مسجل بالفعل.' : 'Cet e-mail est déjà utilisé.';
        } else if (err.code === 'auth/invalid-email') {
          errorMsg = isRTL ? 'عنوان البريد الإلكتروني غير صالح.' : 'E-mail invalide.';
        } else if (err.code === 'auth/weak-password') {
          errorMsg = isRTL ? 'كلمة المرور ضعيفة جداً. يرجى اختيار كلمة مرور أقوى.' : 'Le mot de passe est trop faible.';
        } else if (err.code === 'auth/network-request-failed') {
          errorMsg = isRTL ? 'خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.' : 'Erreur de réseau. Veuillez vérifier votre connexion.';
        } else if (err.message) {
          try {
            const parsed = JSON.parse(err.message);
            if (parsed && parsed.error) {
              errorMsg = isRTL 
                ? `خطأ في قاعدة البيانات (${parsed.operationType} ${parsed.path}): ${parsed.error}`
                : `Erreur base de données (${parsed.operationType} ${parsed.path}) : ${parsed.error}`;
            }
          } catch {
            errorMsg = err.message;
          }
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-55 overflow-y-auto" id="authenticator-wizard" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all sm:my-8 w-full max-w-lg border border-gray-100 flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-sky-500/5 via-sky-50/10 to-indigo-500/5">
            <div className="flex items-center gap-2">
              <Logo size="sm" showText={false} />
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-sky-600">
                  {isRTL ? 'Tasker الآمن' : 'Tasker Sécurisé'}
                </span>
                <h3 className="text-sm font-black text-slate-900 leading-tight">
                  {mode === 'signin' && (isRTL ? 'تسجيل الدخول إلى حسابك' : 'Se connecter')}
                  {mode === 'signup' && (isRTL ? 'إنشاء حساب جديد للمستقلين' : 'Créer un compte')}
                  {mode === 'forgot' && (isRTL ? 'استعادة كلمة المرور' : 'Mot de passe oublié')}
                </h3>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            
            {/* Feedback messages */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200/40 rounded-xl text-rose-700 text-xs font-bold flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/40 rounded-xl text-emerald-700 text-xs font-bold flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* A. SIGN IN VIEW */}
            {mode === 'signin' && (
              <div className="flex flex-col gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    {isRTL ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-4 py-3.5 pl-10 focus:outline-none focus:border-sky-500"
                    />
                    <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700">
                      {isRTL ? 'كلمة المرور' : 'Mot de passe'}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot')}
                      className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                    >
                      {isRTL ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3.5 pl-10 focus:outline-none focus:border-sky-500"
                    />
                    <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors shadow-md hover:shadow-lg mt-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {loading ? (isRTL ? 'جاري التحقق...' : 'Connexion...') : (isRTL ? 'تسجيل الدخول' : 'Se connecter')}
                </button>

              </div>
            )}

            {/* B. SIGN UP VIEW */}
            {mode === 'signup' && (
              <div className="flex flex-col gap-4">
                {signupStep === 1 ? (
                  <div className="flex flex-col gap-4">
                    <div className="text-center mb-1">
                      <h4 className="text-sm font-bold text-gray-800">
                        {isRTL ? 'اختر نوع الحساب للبدء' : 'Sélectionnez le type de compte'}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {isRTL ? 'يرجى تحديد دورك الأساسي في مجتمع خدمات الرباط' : 'Veuillez définir votre rôle principal sur la plateforme'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {/* Brand Client */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole('client')}
                        className={`flex items-start gap-4 p-4 border rounded-2xl text-right transition-all cursor-pointer ${
                          selectedRole === 'client'
                            ? 'border-sky-500 bg-sky-50/40 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${selectedRole === 'client' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-gray-800">
                            {isRTL ? 'أنا طالب خدمة (عميل)' : 'Je suis Client (Poster)'}
                          </span>
                          <span className="text-[10px] text-gray-500 leading-normal">
                            {isRTL 
                              ? 'أريد نشر وتفويض المهام المنزلية، البحث عن حرفيين موثوقين، والدفع بأمان تام.' 
                              : 'Pour publier des tâches, poser des budgets, et embaucher des prestataires qualifiés.'}
                          </span>
                        </div>
                      </button>

                      {/* Brand Tasker */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole('tasker')}
                        className={`flex items-start gap-4 p-4 border rounded-2xl text-right transition-all cursor-pointer ${
                          selectedRole === 'tasker'
                            ? 'border-sky-500 bg-sky-50/40 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${selectedRole === 'tasker' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-gray-800">
                            {isRTL ? 'أنا منفذ خدمة (مُقدّم خدمة)' : 'Je suis Prestataire (Tasker)'}
                          </span>
                          <span className="text-[10px] text-gray-500 leading-normal">
                            {isRTL 
                              ? 'أريد العثور على مهام يومية، إرسال عروضي المهنية، وجني عوائد ومكاسب ممتازة.' 
                              : 'Pour postuler aux offres, proposer vos tarifs, et retirer vos gains réels.'}
                          </span>
                        </div>
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={!selectedRole}
                      onClick={() => setSignupStep(2)}
                      className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{isRTL ? 'المتابعة وإدخال التفاصيل' : 'Continuer l’inscription'}</span>
                      {isRTL ? <ChevronRight className="w-4 h-4 transform rotate-180" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5">
                    {/* Selected Role Tag indicator */}
                    <div className="flex items-center justify-between bg-sky-50/60 border border-sky-100/40 rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-sky-600" />
                        <span className="text-[11px] font-bold text-sky-800">
                          {isRTL ? 'الحساب المختار:' : 'Rôle sélectionné :'}
                        </span>
                        <span className="text-[11px] font-extrabold text-sky-900 bg-sky-100 rounded-lg px-2 py-0.5">
                          {selectedRole === 'client' 
                            ? (isRTL ? 'طالب خدمة (Client)' : 'Client') 
                            : (isRTL ? 'منفذ خدمة (Tasker)' : 'Prestataire')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSignupStep(1)}
                        className="text-[11px] font-bold text-sky-600 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {isRTL ? 'تغيير' : 'Changer'}
                      </button>
                    </div>

                    {/* Full name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700">
                        {isRTL ? 'الاسم الكامل واللقب الهوياتي' : 'Nom complet'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder={isRTL ? 'مثال: يوسف الإدريسي' : 'Youssef El Idrissi'}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-4 py-3.5 pl-10 focus:outline-none focus:border-sky-500 whitespace-nowrap overflow-ellipsis"
                        />
                        <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700">
                        {isRTL ? 'البريد الإلكتروني للتوثيق' : 'Adresse e-mail'}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="youssef@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-4 py-3.5 pl-10 focus:outline-none focus:border-sky-500"
                        />
                        <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700">
                        {isRTL ? 'رقم الهاتف للتواصل المباشر' : 'Numéro de téléphone'}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="0612345678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-4 py-3.5 pl-10 focus:outline-none focus:border-sky-500"
                        />
                        <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Passwords row layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">
                          {isRTL ? 'كلمة المرور' : 'Mot de passe'}
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3.5 pl-10 focus:outline-none focus:border-sky-500"
                          />
                          <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">
                          {isRTL ? 'تأكيد كلمة المرور' : 'Confirmer word'}
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3.5 pl-10 focus:outline-none focus:border-sky-500"
                          />
                          <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Terms agreement checkbox */}
                    <div className="flex items-start gap-2.5 mt-1.5">
                      <input
                        type="checkbox"
                        id="terms-signup-chk"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-600 border-gray-200 focus:ring-sky-500 pointer-events-auto cursor-pointer mt-0.5 shrink-0"
                      />
                      <label htmlFor="terms-signup-chk" className="text-[11px] text-gray-500 leading-relaxed font-semibold cursor-pointer">
                        {isRTL 
                          ? 'أوافق وألتزم بشروط الاستخدام وسياسة الخصوصية الخاصة بمنصة Tasker، وأتعهد بالتعامل الخلوق والنافع مع سكان المدينة.' 
                          : 'J’accepte les conditions d’utilisation de Tasker.'}
                      </label>
                    </div>

                    <div className="flex gap-3.5 mt-2">
                      <button
                        type="button"
                        onClick={() => setSignupStep(1)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {isRTL ? 'رجوع' : 'Retour'}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors shadow-md hover:shadow-lg cursor-pointer active:scale-98 disabled:opacity-50"
                      >
                        {loading ? (isRTL ? 'جاري إنشاء الحساب...' : 'Création en cours...') : (isRTL ? 'إنشاء حساب جديد والمتابعة' : 'Créer un compte')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* C. FORGOT PASSWORD VIEW */}
            {mode === 'forgot' && (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                  {isRTL 
                    ? 'أدخل عنوان بريدك الإلكتروني المسجل لدينا وسنقوم بإرسال رسالة بريدية مخصصة تحتوي على رابط إلكتروني فوري لإعادة تعيين كلمة المرور بكل أمان.' 
                    : 'Entrez votre adresse e-mail pour recevoir les instructions.'}
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    {isRTL ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-4 py-3.5 pl-10 focus:outline-none focus:border-sky-500"
                    />
                    <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors shadow-md hover:shadow-lg mt-1 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {loading ? (isRTL ? 'جاري إرسال الرابط...' : 'Envoi en cours...') : (isRTL ? 'إرسال رابط إعادة التعيين والتعيين' : 'Envoyer le lien')}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMode('signin')}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mt-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 ml-1 shrink-0" />
                  <span>{isRTL ? 'العودة لصفحة تسجيل الدخول' : 'Retour à la connexion'}</span>
                </button>

              </div>
            )}

            {/* Social Authentication Split lines */}
            {mode !== 'forgot' && (
              <div className="flex flex-col gap-4 mt-2">
                
                <div className="relative flex py-1.5 items-center">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {isRTL ? 'أو عبر الحسابات الرسمية الموثقة' : 'ou continuer avec'}
                  </span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                {/* Social Login Buttons row */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-gray-200 hover:bg-slate-50 hover:border-gray-300 transition-all cursor-pointer text-xs font-bold text-slate-700 active:scale-95"
                  >
                    <svg className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.23-.67-.34-1.37-.34-2.09z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* Apple */}
                  <button
                    type="button"
                    onClick={handleAppleAuth}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-gray-200 hover:bg-slate-50 hover:border-gray-300 transition-all cursor-pointer text-xs font-bold text-slate-700 active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5 opacity-85 shrink-0 fill-current text-slate-900" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.13.67-2.85 1.51-.62.72-1.16 1.86-1.01 2.97 1.1.09 2.15-.61 2.87-1.42z"/>
                    </svg>
                    <span>Apple</span>
                  </button>

                </div>

              </div>
            )}

            {/* Bottom footer toggle link */}
            <div className="border-t border-gray-100 pt-4 mt-2 text-center">
              {mode === 'signin' && (
                <span className="text-xs text-gray-500 font-semibold">
                  {isRTL ? 'ليس لديك حساب بعد؟' : 'Nouveau sur RabatTasker ?'}{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    className="text-sky-600 font-bold hover:underline cursor-pointer"
                  >
                    {isRTL ? 'إنشاء حساب جديد مجاناً' : 'Créer un compte'}
                  </button>
                </span>
              )}

              {mode === 'signup' && (
                <span className="text-xs text-gray-500 font-semibold">
                  {isRTL ? 'لديك حساب بالفعل زبوناً أو مستقلاً؟' : 'Déjà inscrit ?'}{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signin')}
                    className="text-sky-600 font-bold hover:underline cursor-pointer"
                  >
                    {isRTL ? 'سجل دخولك الآن' : 'Se connecter'}
                  </button>
                </span>
              )}
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
