import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, CheckCircle2, AlertTriangle, Clock, Camera, Phone, User, MapPin, 
  Wrench, FileText, ShieldCheck, Landmark, ArrowRight, ArrowLeft, Loader2, Sparkles
} from 'lucide-react';
import { useProfileCompletionStore } from '../../store/profileCompletionStore';
import { calculateProfileCompletion } from '../../services/profileCompletionEngine';
import { 
  updateProfilePhotoService, verifyPhoneService, updatePersonalInformationService,
  updateAddressService, updateSkillsService, updateBioAndHeadlineService,
  submitIdentityVerificationService, updateBankInformationService
} from '../../services/verificationService';
import { RABAT_NEIGHBORHOODS } from '../../data/rabatData';

interface ProfileCompletionModalProps {
  user: any;
  userProfile: any;
  lang: 'ar' | 'fr';
  onRefreshProfile?: () => void;
}

const STEP_METRIC_WEIGHTS = {
  1: 20, // Photo
  2: 20, // Phone
  3: 10, // DOB
  4: 10, // Address
  5: 10, // Skills
  6: 10, // Bio/Headline
  7: 10, // KYC Identity Docs
  8: 10, // Banking
};

const TEXTS = {
  ar: {
    completionTitle: 'إكمال موثوقية الحساب',
    completionSubtitle: 'يرجى ملء وتأكيد المعلومات التالية لبدء تقديم العروض وسحب الأرباح بأمان وبنسبة ثقة عالية.',
    remainingSteps: 'خطوات متبقية لبدء العمل:',
    circularLabel: 'مكتمل',
    saveBtn: 'حفظ ومتابعة',
    backBtn: 'السابق',
    submitVerification: 'إرسال وثائق التوثيق للهوية',
    submitting: 'جاري الحفظ والتحميل...',
    successStep: 'تم حفظ الخطوة بنجاح بنسبة مكتملة!',
    notSelected: 'لم يتم الاختيار بعد',
    unspecified: 'غير محدد',
    completedTag: 'مكتمل ✓',
    pendingTag: '⏳ قيد المراجعة',
    rejectedTag: '⚠ مرفوض - أعد المحاولة',
    requiredTag: '⚠ مطلوب',
    otpPlaceholder: 'أدخل رمز التحقق (4 أرقام)',
    sendOtp: 'إرسال الرمز',
    verifyOtp: 'تأكيد الرمز',
    invalidOtp: 'الرمز المدخل غير صحيح! استخدم 1234 للتجربة السريعة.',
    otpSent: 'تم إرسال رمز التحقق (1234) بنجاح إلى هاتفك.',
    photoTab: '1. الصورة الشخصية',
    phoneTab: '2. رقم الهاتف',
    personalTab: '3. تاريخ الميلاد',
    addressTab: '4. الرمز السكني',
    skillsTab: '5. مهاراتي',
    bioTab: '6. نبذة شخصية',
    idTab: '7. إثبات الهوية',
    bankTab: '8. الحساب البنكي',
    selectAvatar: 'أو اختر رمزاً تعبيرياً سريعاً للبروفايل:',
    phoneDesc: 'أدخل رقم الهوية الشخصية لتوثيق ملكية رقم الحساب لتلقي الاتصالات والعروض.',
    dobLabel: 'تاريخ الميلاد',
    genderLabel: 'الجنس (اختياري)',
    male: 'ذكـر',
    female: 'أنثى',
    preferNotToSay: 'أفضل عدم الإفصاح',
    cityLabel: 'المدينة',
    areaLabel: 'الحي في الرباط',
    streetLabel: 'العنوان البريدي الحالي (الشارع والباب)',
    skillsDesc: 'اختر المهارات التي تتقنها لعرض مهماتها المخصصة على جدول أعمالك:',
    skillsExamples: {
      Electrician: 'كهربائي',
      Plumber: 'سباك / رصاص',
      Painter: 'صباغ / صباغة',
      Cleaner: 'تنظيف وتدبير منزلي',
      Mover: 'نقل أثاث وشحن وتركيب',
      Carpenter: 'نجارة وخشب',
      ITSupport: 'معلوماتيات وتصليح حواسيب',
      Gardener: 'بستنة وواجهات حدائق'
    },
    headlineLabel: 'العنوان المهني الرئيسي (العرض التسويقي لخدمتك)',
    bioLabel: 'تفصيل الخبرات والمعدات والمؤهلات السابقة بالتفصيل',
    headlinePlaceholder: 'مثال: كهربائي منازل ذو خبرة 5 سنوات بأكدال',
    bioPlaceholder: 'اكتب هنا ما يسهل على العملاء اختيارك للعمل...',
    idDesc: 'قم بتحميل صور واضحة لبطاقة التعريف الوطنية (CNIE) مع سيلفي حديث لتفعيل شارة معتمد.',
    idFront: 'الوجه الأمامي للبطاقة الوطنية',
    idBack: 'الوجه الخلفي للبطاقة الوطنية',
    selfieLabel: 'صورة سيلفي واضحة لحاملي البطاقة بجانب الوجه',
    idWarning: 'الحد الأقصى للمستندات هو 5 ميجابايت كصور عادية.',
    bankDesc: 'بيانات الحساب البنكي لتلقي مبالغ المهام المنجزة مباشرة بعد اكتمالها (RIB مكوّن من 24 رقماً).',
    bankLabel: 'اسم المصرف البنكي',
    accountHolder: 'اسم صاحب الحساب (المستفيد الكامل)',
    ibanLabel: 'رقم الحساب البنكي الكامل RIB (24 رقماً)',
    rejectionTitle: 'ملاحظة الرفض من الإدارة:',
    noBidsUntil80: 'تنبيه: يجب إكمال نسبة 80٪ على الأقل من ملفك الشخصي لتتمكن من تقديم عروضك على المهام.',
    noWithdrUntilDocs: 'تنبيه: لن تتمكن من سحب أرباحك إلا بعد تفعيل رقم الهاتف، الهوية والبيانات البنكية بالكامل.'
  },
  fr: {
    completionTitle: 'Vérification & Profil de Confiance',
    completionSubtitle: 'Veuillez remplir ces sections pour pouvoir soumissionner sur les tâches et retirer vos revenus en toute sécurité.',
    remainingSteps: 'Étapes requises pour débuter :',
    circularLabel: 'Complété',
    saveBtn: 'Enregistrer & Continuer',
    backBtn: 'Précédent',
    submitVerification: 'Soumettre les documents d’identité',
    submitting: 'Enregistrement en cours...',
    successStep: 'Étape mise à jour avec succès !',
    notSelected: 'Non sélectionné',
    unspecified: 'Non spécifié',
    completedTag: 'Complété ✓',
    pendingTag: '⏳ En révision',
    rejectedTag: ' Rejeté - Essayer de nouveau',
    requiredTag: ' Requis',
    otpPlaceholder: 'Code OTP (4 chiffres)',
    sendOtp: 'Envoyer le Code',
    verifyOtp: 'Vérifier',
    invalidOtp: 'Code OTP incorrect ! Utilisez "1234" pour simuler la validation.',
    otpSent: 'Le code OTP de simulation (1234) a été envoyé avec succès.',
    photoTab: '1. Photo de profil',
    phoneTab: '2. Téléphone',
    personalTab: '3. Infos Personnelles',
    addressTab: '4. Adresse d’activité',
    skillsTab: '5. Mes Compétences',
    bioTab: '6. Description / Bio',
    idTab: '7. Pièce d’identité',
    bankTab: '8. Coordonnées Bancaires',
    selectAvatar: 'Ou choisissez un avatar illustratif rapide :',
    phoneDesc: 'Renseignez votre mobile de contact pour valider l’authentification et sécuriser vos accès.',
    dobLabel: 'Date de naissance',
    genderLabel: 'Genre (optionnel)',
    male: 'Homme',
    female: 'Femme',
    preferNotToSay: 'Préfère ne pas spécifier',
    cityLabel: 'Ville d’activité',
    areaLabel: 'Quartier principal à Rabat',
    streetLabel: 'Adresse postale complète (Rue, Appartement)',
    skillsDesc: 'Sélectionnez vos expertises pour recevoir des notifications ciblées sur vos compétences :',
    skillsExamples: {
      Electrician: 'Électricien',
      Plumber: 'Plombier',
      Painter: 'Peintre',
      Cleaner: 'Ménage & Nettoyage',
      Mover: 'Déménagement & Transport',
      Carpenter: 'Menuisier / Bois',
      ITSupport: 'Informatique & Dépannage',
      Gardener: 'Jardinier / Aménagement'
    },
    headlineLabel: 'Accroche professionnelle (votre atout titre)',
    bioLabel: 'Présentation de vos expériences, outillage et garanties professionnelles',
    headlinePlaceholder: 'Ex: Électricien certifié avec 5 ans d’expérience sur Agdal',
    bioPlaceholder: 'Décrivez pourquoi les clients devraient vous faire confiance pour réaliser leurs projets...',
    idDesc: 'Téléchargez une photo lisible recto/verso de votre CNIE ainsi qu’un selfie pour débloquer votre badge vérifié.',
    idFront: 'Recto de votre pièce d’identité',
    idBack: 'Verso de votre pièce d’identité',
    selfieLabel: 'Selfie net tenant votre pièce à côté du visage',
    idWarning: 'Taille maximale recommandée : 5 Mo.',
    bankDesc: 'Vos coordonnées bancaires d’artisan pour recevoir les virements de solde de vos commissions Rabat Fintech (RIB 24 chiffres).',
    bankLabel: 'Nom de la Banque émettrice',
    accountHolder: 'Titulaire complet du compte',
    ibanLabel: 'Code RIB Marocain (24 chiffres continus)',
    rejectionTitle: 'Raison administrative du rejet de dossier :',
    noBidsUntil80: 'Attention : Vous devez atteindre au moins 80% de complétion de profil pour soumettre des offres sur la plateforme.',
    noWithdrUntilDocs: 'Important : Les retraits de solde sont désactivés tant que le numéro de téléphone, l’identité et le RIB ne sont pas validés.'
  }
};

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=faces'
];

export default function ProfileCompletionModal({ user, userProfile, lang, onRefreshProfile }: ProfileCompletionModalProps) {
  const { isModalOpen, activeStep, closeCompletionModal, setActiveStep } = useProfileCompletionStore();
  const isRTL = lang === 'ar';
  const t = TEXTS[lang];

  // Engine metrics
  const completion = calculateProfileCompletion(userProfile);

  // Form step states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Avatar Link / local state
  const [avatarInput, setAvatarInput] = useState(userProfile?.photoURL || '');

  // Step 2: Phone Verifications
  const [phoneInput, setPhoneInput] = useState(userProfile?.phoneNumber || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // Step 3: DOB & Gender
  const [dob, setDob] = useState(userProfile?.dob || '');
  const [gender, setGender] = useState(userProfile?.gender || '');

  // Step 4: Address Details
  const [city, setCity] = useState(userProfile?.addressDetails?.city || 'Rabat');
  const [area, setArea] = useState(userProfile?.addressDetails?.area || 'Agdal');
  const [street, setStreet] = useState(userProfile?.addressDetails?.streetAddress || '');

  // Step 5: Skills Select
  const [mySkills, setMySkills] = useState<string[]>(userProfile?.skills || []);

  const CORE_SKILL_ID_LIST = ['Electrician', 'Plumber', 'Painter', 'Cleaner', 'Mover', 'Carpenter', 'ITSupport', 'Gardener'];

  // Step 6: Headline & Bio
  const [headline, setHeadline] = useState(userProfile?.headline || '');
  const [bio, setBio] = useState(userProfile?.bio || '');

  // Step 7: Identity Documents upload
  const [idFront, setIdFront] = useState(userProfile?.verificationDocuments?.cinFront || '');
  const [idBack, setIdBack] = useState(userProfile?.verificationDocuments?.cinBack || '');
  const [idSelfie, setIdSelfie] = useState(userProfile?.verificationDocuments?.selfie || '');

  // Step 8: Banking Information
  const [bankName, setBankName] = useState(userProfile?.bankingInfo?.bankName || 'CIH Bank');
  const [accountHolder, setAccountHolder] = useState(userProfile?.bankingInfo?.accountHolder || userProfile?.displayName || '');
  const [iban, setIban] = useState(userProfile?.bankingInfo?.iban || '');

  // Synchronize local states with refreshed profile updates (e.g. after save finishes)
  useEffect(() => {
    if (userProfile) {
      setAvatarInput(userProfile.photoURL || '');
      setPhoneInput(userProfile.phoneNumber || '');
      setDob(userProfile.dob || '');
      setGender(userProfile.gender || '');
      setCity(userProfile.addressDetails?.city || 'Rabat');
      setArea(userProfile.addressDetails?.area || 'Agdal');
      setStreet(userProfile.addressDetails?.streetAddress || '');
      setMySkills(userProfile.skills || []);
      setHeadline(userProfile.headline || '');
      setBio(userProfile.bio || '');
      setIdFront(userProfile.verificationDocuments?.cinFront || '');
      setIdBack(userProfile.verificationDocuments?.cinBack || '');
      setIdSelfie(userProfile.verificationDocuments?.selfie || '');
      setBankName(userProfile.bankingInfo?.bankName || 'CIH Bank');
      setAccountHolder(userProfile.bankingInfo?.accountHolder || userProfile.displayName || '');
      setIban(userProfile.bankingInfo?.iban || '');
    }
  }, [userProfile]);

  if (!isModalOpen) return null;

  // Circular progress angles
  const radius = 32;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (completion.completionPercentage / 100) * circumference;

  // Handle CTA transitions
  const handleNext = () => {
    if (activeStep < 8) {
      setActiveStep(activeStep + 1);
      setSuccessMsg('');
      setErrorMsg('');
    } else {
      closeCompletionModal();
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      setSuccessMsg('');
      setErrorMsg('');
    }
  };

  // Step saving controllers & triggers
  const saveStep = async (stepNumber: number) => {
    if (!user?.uid) return;
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      switch (stepNumber) {
        case 1: // Profile Photo
          if (!avatarInput.trim()) throw new Error(lang === 'ar' ? 'يرجى وضع رابط أو اختيار صورة شخصية' : 'Veuillez renseigner une photo');
          await updateProfilePhotoService(user.uid, avatarInput);
          break;

        case 2: // Phone SMS OTP Simulation (replaces custom bypass)
          if (!phoneInput || phoneInput.length < 9) throw new Error(lang === 'ar' ? 'أدخل رقم هاتف صحيح مكوّن من 9 أرقام على الأقل' : 'Numéro de téléphone invalide');
          if (!phoneInput.startsWith('+212') && !phoneInput.startsWith('06') && !phoneInput.startsWith('07')) {
            throw new Error(lang === 'ar' ? 'رقم الهاتف يجب أن يبدأ بـ 06 أو 07 أو بادئة المغرب +212' : 'Le numéro doit débuter par 06, 07 ou +212');
          }
          if (otpCode !== '1234') {
            setOtpError(t.invalidOtp);
            setLoading(false);
            return;
          }
          await verifyPhoneService(user.uid, phoneInput, otpCode);
          setOtpError('');
          break;

        case 3: // DOB Date of birth
          if (!dob) throw new Error(lang === 'ar' ? 'يرجى إدخال تاريخ ميلاد سليم' : 'Veuillez renseigner une date de naissance valide');
          // Age limit constraint check (e.g. at least 18 years years old)
          const bornDate = new Date(dob);
          const eighteenYearsAgo = new Date();
          eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
          if (bornDate > eighteenYearsAgo) {
            throw new Error(lang === 'ar' ? 'تنبيه: يجب أن تبلغ 18 سنة على الأقل لتقديم العروض بنشاط كعضو' : 'Vous devez avoir au moins 18 ans pour opérer.');
          }
          await updatePersonalInformationService(user.uid, dob, gender);
          break;

        case 4: // Address Information
          if (!street.trim()) throw new Error(lang === 'ar' ? 'يرجى ملء تفاصيل الشارع والمنزل بالكامل' : 'Adresse ou rue manquante');
          await updateAddressService(user.uid, { city, area, streetAddress: street });
          break;

        case 5: // Skills list
          if (mySkills.length === 0) throw new Error(lang === 'ar' ? 'اختر مهارة واحدة على الأقل قبل حفظ التبويب' : 'Veuillez sélectionner au moins une compétence');
          await updateSkillsService(user.uid, mySkills);
          break;

        case 6: // Title and Bio
          if (headline.trim().length < 10) throw new Error(lang === 'ar' ? 'يجب أن لا يقل العنوان المهني عن 10 أحرف' : 'L’accroche titre doit faire plus de 10 caractères');
          if (bio.trim().length < 25) throw new Error(lang === 'ar' ? 'يرجى صياغة نبذة مهنية تزيد عن 25 حرفًا' : 'La description doit faire plus de 25 caractères');
          await updateBioAndHeadlineService(user.uid, headline, bio);
          break;

        case 7: // Identity KYC images
          if (!idFront || !idBack || !idSelfie) {
            throw new Error(lang === 'ar' 
              ? 'الرجاء تحميل الوثيقة الأمامية والخلفية مع صورة السيلفي بالكامل' 
              : 'Veuillez joindre tous les fichiers requis (Recto, Verso, Selfie)'
            );
          }
          await submitIdentityVerificationService(user.uid, { cinFront: idFront, cinBack: idBack, selfie: idSelfie });
          break;

        case 8: // Bank RIB detail
          if (!iban || iban.trim().replace(/\s/g, '').length !== 24) {
            throw new Error(lang === 'ar' 
              ? 'تأكد من إدخال رقم الحساب RIB بالكامل والمكوّن من 24 رقماً متصلاً' 
              : 'La clé RIB marocaine saisie doit faire exactement 24 chiffres continus.'
            );
          }
          if (!accountHolder.trim()) throw new Error(lang === 'ar' ? 'يرجى ملء اسم المستفيد الكامل من التحويل' : 'Spécifiez le titulaire du compte');
          await updateBankInformationService(user.uid, { bankName, accountHolder, iban: iban.trim().replace(/\s/g, '') });
          break;
      }

      setSuccessMsg(t.successStep);
      setErrorMsg('');
      if (onRefreshProfile) onRefreshProfile();
      
      // Auto transition slightly afterwards to keep UX fluid
      setTimeout(() => {
        handleNext();
      }, 1000);

    } catch (err: any) {
      console.warn("Step Save Action failure:", err);
      setErrorMsg(err.message || 'Error occurred while saving your info.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-load default avatars click handler
  const handleSelectPredefinedAvatar = (url: string) => {
    setAvatarInput(url);
    setSuccessMsg('');
  };

  const handleSkillToggle = (skillId: string) => {
    if (mySkills.includes(skillId)) {
      setMySkills(mySkills.filter(s => s !== skillId));
    } else {
      setMySkills([...mySkills, skillId]);
    }
  };

  // Convert uploaded test file to Base64 instantly for offline testing
  const processImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Phone code send simulation
  const triggerOtpSendSim = () => {
    if (!phoneInput || phoneInput.length < 9) {
      setErrorMsg(lang === 'ar' ? 'أدخل رقم هاتف صحيح ملائم أولاً' : 'Veuillez saisir un numéro d’abord');
      return;
    }
    setOtpSent(true);
    setSuccessMsg(t.otpSent);
  };

  // Helper check status for indicator icons
  const getStepStatus = (step: number) => {
    switch (step) {
      case 1: return !!userProfile?.photoURL;
      case 2: return !!userProfile?.phoneVerified;
      case 3: return !!userProfile?.hasDob;
      case 4: return !!userProfile?.hasAddress;
      case 5: return !!userProfile?.skills && userProfile.skills.length > 0;
      case 6: return !!userProfile?.headline && !!userProfile?.bio;
      case 7: 
        if (userProfile?.verificationStatus === 'approved') return 'complete';
        if (userProfile?.verificationStatus === 'pending') return 'pending';
        if (userProfile?.verificationStatus === 'rejected') return 'rejected';
        return false;
      case 8: return !!userProfile?.hasBanking;
      default: return false;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-0 md:p-6 text-gray-900 overflow-hidden leading-relaxed"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="bg-white w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-3xl shadow-xl flex flex-col overflow-hidden relative border border-slate-100">
        
        {/* Header Widget */}
        <header className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            {/* Visual Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="24" cy="24" r={radius} 
                  className="text-slate-100 fill-none" 
                  strokeWidth={strokeWidth} 
                />
                <circle 
                  cx="24" cy="24" r={radius} 
                  className="text-indigo-600 fill-none transition-all duration-1000 ease-out" 
                  strokeWidth={strokeWidth} 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] sm:text-xs font-black text-indigo-700">
                {completion.completionPercentage}%
              </span>
            </div>

            <div>
              <h2 className="text-sm md:text-base font-black text-slate-900 font-sans flex items-center gap-1.5">
                <span>{t.completionTitle}</span>
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
              </h2>
              <p className="text-[10px] md:text-xs text-slate-400 font-semibold max-w-lg hidden sm:block">
                {t.completionSubtitle}
              </p>
            </div>
          </div>

          <button 
            onClick={closeCompletionModal}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Info alerts */}
        <div className="bg-amber-500/10 border-b border-amber-100/50 py-2.5 px-4 md:px-6 flex items-start gap-2 text-[10px] md:text-xs font-semibold text-slate-700">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-right flex-1">
            {completion.completionPercentage < 80 ? t.noBidsUntil80 : t.noWithdrUntilDocs}
          </p>
        </div>

        {/* Dual Column Layout body */}
        <div className="flex-1 flex overflow-hidden w-full">
          
          {/* Left Column Sidebar Tabs List (Desktop only, 28%) */}
          <aside className="w-[30%] border-r border-slate-150/40 bg-slate-50/50 p-4 shrink-0 overflow-y-auto hidden md:flex flex-col gap-2">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
              {t.remainingSteps}
            </h4>

            {[
              { id: 1, label: t.photoTab, icon: <Camera size={14} /> },
              { id: 2, label: t.phoneTab, icon: <Phone size={14} /> },
              { id: 3, label: t.personalTab, icon: <User size={14} /> },
              { id: 4, label: t.addressTab, icon: <MapPin size={14} /> },
              { id: 5, label: t.skillsTab, icon: <Wrench size={14} /> },
              { id: 6, label: t.bioTab, icon: <FileText size={14} /> },
              { id: 7, label: t.idTab, icon: <ShieldCheck size={14} /> },
              { id: 8, label: t.bankTab, icon: <Landmark size={14} /> },
            ].map((step) => {
              const status = getStepStatus(step.id);
              const isActive = activeStep === step.id;

              let iconTag = <AlertTriangle className="w-3.5 h-3.5 text-slate-300 ml-auto shrink-0" />;
              let textStyle = "text-slate-600 hover:bg-slate-100/60";

              if (status === 'complete' || status === true) {
                iconTag = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto shrink-0" />;
              } else if (status === 'pending') {
                iconTag = <Clock className="w-3.5 h-3.5 text-amber-500 ml-auto shrink-0" />;
              } else if (status === 'rejected') {
                iconTag = <AlertTriangle className="w-3.5 h-3.5 text-rose-500 ml-auto shrink-0" />;
              }

              if (isActive) {
                textStyle = "bg-indigo-50/75 text-indigo-700 font-extrabold border-r-4 border-indigo-600";
              }

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveStep(step.id);
                    setSuccessMsg('');
                    setErrorMsg('');
                  }}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold text-right flex items-center gap-2.5 transition-all text-gray-700 cursor-pointer ${textStyle}`}
                >
                  <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>{step.icon}</span>
                  <span className="truncate">{step.label}</span>
                  {iconTag}
                </button>
              );
            })}
          </aside>

          {/* Right Column Active Form Workspace Container (72%) */}
          <section className="flex-1 bg-white p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col justify-between">
            
            <div className="max-w-2xl mx-auto w-full space-y-6">
              
              {/* Header Title for Current Step */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black tracking-wider text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-md">
                  {lang === 'ar' ? `الخطوة ${activeStep} من 8` : `Étape ${activeStep} de 8`}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-sans">
                  {activeStep === 1 && t.photoTab}
                  {activeStep === 2 && t.phoneTab}
                  {activeStep === 3 && t.personalTab}
                  {activeStep === 4 && t.addressTab}
                  {activeStep === 5 && t.skillsTab}
                  {activeStep === 6 && t.bioTab}
                  {activeStep === 7 && t.idTab}
                  {activeStep === 8 && t.bankTab}
                </h3>
              </div>

              {/* Status messages info */}
              {userProfile?.rejectionReason && activeStep === 7 && (
                <div className="p-3 bg-red-50 border border-red-150 text-red-700 rounded-2xl text-[11px] font-black">
                  <span className="block mb-1">{t.rejectionTitle}</span>
                  <p>{userProfile.rejectionReason}</p>
                </div>
              )}

              {/* Form Content body switches */}
              <div className="pt-2">

                {/* STEP 1: PHOTO */}
                {activeStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="relative w-20 h-20 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                        {avatarInput ? (
                          <img src={avatarInput} alt="Preview Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-8 h-8 text-slate-300" />
                        )}
                      </div>

                      <div className="w-full max-w-sm">
                        <label className="block text-[11px] font-black text-slate-500 mb-1 leading-none uppercase">
                          {lang === 'ar' ? 'رابط ملف الصورة (URL):' : 'URL de la photo de profil :'}
                        </label>
                        <input
                          type="text"
                          value={avatarInput}
                          onChange={(e) => setAvatarInput(e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full text-xs border border-slate-200 focus:outline-none focus:border-indigo-500 px-3 py-2 rounded-xl bg-slate-50/50 text-gray-950 font-sans"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-50">
                      <span className="block text-[11px] font-bold text-slate-400 mb-3 text-center">{t.selectAvatar}</span>
                      <div className="flex flex-wrap justify-center gap-2">
                        {SAMPLE_AVATARS.map((url, i) => (
                          <button
                            key={url}
                            type="button"
                            onClick={() => handleSelectPredefinedAvatar(url)}
                            className={`w-12 h-12 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                              avatarInput === url ? 'border-indigo-600 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                            }`}
                          >
                            <img src={url} alt={`Avatar Preselected ${i}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: PHONE OTP VERIFICATIONS */}
                {activeStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 font-medium leading-normal">{t.phoneDesc}</p>
                    
                    <div className="space-y-3.5 max-w-sm">
                      <div className="relative">
                        <label className="block text-[10px] font-black text-slate-400 mb-1 leading-none uppercase">
                          {lang === 'ar' ? 'رقم الهاتف :' : 'Téléphone contact :'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="0612345678"
                            disabled={otpSent && !otpError}
                            className="flex-1 text-xs font-bold font-sans border border-slate-200 focus:outline-none focus:border-indigo-500 px-3 py-2 rounded-xl bg-slate-50/50 text-gray-950"
                          />
                          <button
                            type="button"
                            onClick={triggerOtpSendSim}
                            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl transition-colors shrink-0 cursor-pointer"
                          >
                            {t.sendOtp}
                          </button>
                        </div>
                      </div>

                      {otpSent && (
                        <div className="space-y-2 animate-fade-in pt-1.5 border-t border-slate-50">
                          <label className="block text-[10px] font-black text-slate-400 mb-1 leading-none uppercase">
                            {t.otpPlaceholder}
                          </label>
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="1234"
                            maxLength={4}
                            className="w-full text-xs font-black font-sans border border-slate-200 focus:outline-none focus:border-indigo-500 px-3 py-2 rounded-xl bg-slate-50/50 text-center tracking-widest text-gray-950"
                          />
                          {otpError && (
                            <span className="text-[10px] font-bold text-red-500 block">{otpError}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: PERSONAL INFORMATION */}
                {activeStep === 3 && (
                  <div className="space-y-4 max-w-sm">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-black text-slate-500 mb-1 leading-none uppercase">
                        {t.dobLabel}
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full text-xs font-bold font-sans border border-slate-200 focus:outline-none focus:border-indigo-500 px-3 py-2 rounded-xl bg-slate-50/50 text-gray-950"
                      />
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="block text-[11px] font-black text-slate-500 mb-1.5 leading-none uppercase">
                        {t.genderLabel}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'male', label: t.male },
                          { id: 'female', label: t.female },
                          { id: 'unspecified', label: t.preferNotToSay },
                        ].map((choice) => (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => setGender(choice.id)}
                            className={`p-2.5 border text-xs font-bold rounded-xl text-center cursor-pointer transition-all ${
                              gender === choice.id 
                                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700' 
                                : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                            }`}
                          >
                            {choice.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: ADDRESS */}
                {activeStep === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">
                          {t.cityLabel}
                        </label>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full text-xs font-bold border border-slate-200 focus:outline-none focus:border-indigo-500 px-3 py-2.5 rounded-xl bg-slate-50/50 text-gray-950 cursor-pointer"
                        >
                          <option value="Rabat">{isRTL ? 'الرباط' : 'Rabat'}</option>
                          <option value="Salé">{isRTL ? 'سلا' : 'Salé'}</option>
                          <option value="Témara">{isRTL ? 'تمارة' : 'Témara'}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">
                          {t.areaLabel}
                        </label>
                        <select
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full text-xs font-bold border border-slate-200 focus:outline-none focus:border-indigo-500 px-3 py-2.5 rounded-xl bg-slate-50/50 text-gray-950 cursor-pointer"
                        >
                          {RABAT_NEIGHBORHOODS.map(n => (
                            <option key={n.id} value={isRTL ? n.ar : n.fr}>
                              {isRTL ? n.ar : n.fr}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">
                        {t.streetLabel}
                      </label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder={isRTL ? 'زنقة طارق بن زياد، رقم 24، شقة 5' : 'Rue Tarik Ibn Ziad, N. 24'}
                        className="w-full text-xs font-bold border border-slate-200 focus:outline-none focus:border-indigo-500 px-3 py-2 rounded-xl bg-slate-50/50 text-gray-950"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: SKILLS */}
                {activeStep === 5 && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{t.skillsDesc}</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CORE_SKILL_ID_LIST.map((key) => {
                        const isSelected = mySkills.includes(key);
                        // Safe access examples translations map
                        const textLabel = (t.skillsExamples as any)[key] || key;

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleSkillToggle(key)}
                            className={`p-3 border text-xs font-extrabold rounded-2xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 hover:brightness-105 ${
                              isSelected 
                                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-3xs' 
                                : 'border-slate-150 bg-slate-50/50 text-slate-650 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-base">
                              {key === 'Electrician' && '⚡'}
                              {key === 'Plumber' && '🔧'}
                              {key === 'Painter' && '🎨'}
                              {key === 'Cleaner' && '🧹'}
                              {key === 'Mover' && '📦'}
                              {key === 'Carpenter' && '🪚'}
                              {key === 'ITSupport' && '💻'}
                              {key === 'Gardener' && '🏡'}
                            </span>
                            <span>{textLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 6: BIO */}
                {activeStep === 6 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">
                        {t.headlineLabel}
                      </label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder={t.headlinePlaceholder}
                        className="w-full text-xs font-bold border border-slate-200 focus:outline-none focus:border-indigo-500 px-3 py-2.5 rounded-xl bg-slate-50/50 text-gray-950"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">
                        {t.bioLabel}
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder={t.bioPlaceholder}
                        rows={4}
                        className="w-full text-xs font-bold border border-slate-200 focus:outline-none focus:border-indigo-500 p-3 rounded-2xl bg-slate-50/50 text-gray-950"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 7: IDENTITY DOCUMENTS */}
                {activeStep === 7 && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">{t.idDesc}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Document Front */}
                      <div className="space-y-1.5">
                        <span className="block text-[10px] font-black text-slate-500 uppercase leading-none">{t.idFront}</span>
                        <div className="border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 text-center flex flex-col items-center justify-center gap-2 relative h-36">
                          {idFront ? (
                            <div className="absolute inset-2 rounded-lg overflow-hidden">
                              <img src={idFront} alt="ID Front preview" className="w-full h-full object-cover" />
                              <button onClick={() => setIdFront('')} className="absolute top-1 right-1 p-1 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full text-[10px] font-sans">✕</button>
                            </div>
                          ) : (
                            <>
                              <Camera className="w-6 h-6 text-slate-400" />
                              <label className="text-[11px] font-black text-indigo-600 hover:underline cursor-pointer">
                                {lang === 'ar' ? 'اختر ملف الصورة' : 'Charger pièce'}
                                <input type="file" accept="image/*" onChange={(e) => processImageUpload(e, setIdFront)} className="hidden" />
                              </label>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Document Back */}
                      <div className="space-y-1.5">
                        <span className="block text-[10px] font-black text-slate-500 uppercase leading-none">{t.idBack}</span>
                        <div className="border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 text-center flex flex-col items-center justify-center gap-2 relative h-36">
                          {idBack ? (
                            <div className="absolute inset-2 rounded-lg overflow-hidden">
                              <img src={idBack} alt="ID Back preview" className="w-full h-full object-cover" />
                              <button onClick={() => setIdBack('')} className="absolute top-1 right-1 p-1 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full text-[10px] font-sans">✕</button>
                            </div>
                          ) : (
                            <>
                              <Camera className="w-6 h-6 text-slate-400" />
                              <label className="text-[11px] font-black text-indigo-600 hover:underline cursor-pointer">
                                {lang === 'ar' ? 'اختر ملف الصورة' : 'Charger pièce'}
                                <input type="file" accept="image/*" onChange={(e) => processImageUpload(e, setIdBack)} className="hidden" />
                              </label>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Selfie document hold */}
                      <div className="space-y-1.5">
                        <span className="block text-[10px] font-black text-slate-500 uppercase leading-none">{t.selfieLabel}</span>
                        <div className="border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 text-center flex flex-col items-center justify-center gap-2 relative h-36">
                          {idSelfie ? (
                            <div className="absolute inset-2 rounded-lg overflow-hidden">
                              <img src={idSelfie} alt="Selfie preview" className="w-full h-full object-cover" />
                              <button onClick={() => setIdSelfie('')} className="absolute top-1 right-1 p-1 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full text-[10px] font-sans">✕</button>
                            </div>
                          ) : (
                            <>
                              <Camera className="w-6 h-6 text-slate-400" />
                              <label className="text-[11px] font-black text-indigo-600 hover:underline cursor-pointer">
                                {lang === 'ar' ? 'التقاط سيلفي' : 'Prendre selfie'}
                                <input type="file" accept="image/*" onChange={(e) => processImageUpload(e, setIdSelfie)} className="hidden" />
                              </label>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 8: BANK DETAILS */}
                {activeStep === 8 && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{t.bankDesc}</p>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">{t.bankLabel}</label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full text-xs font-bold border border-slate-200 focus:outline-none focus:border-indigo-500 px-3 py-2.5 rounded-xl bg-slate-50/50 text-gray-950 cursor-pointer"
                      >
                        <option value="CIH Bank">CIH Bank</option>
                        <option value="Attijariwafa Bank">Attijariwafa Bank</option>
                        <option value="BMCE Bank of Africa">BMCE Bank of Africa</option>
                        <option value="Banque Populaire">Banque Populaire (BP)</option>
                        <option value="Société Générale Maroc">Société Générale Maroc</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-500 uppercase">{t.accountHolder}</label>
                        <input
                          type="text"
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                          placeholder="Mohamed El Alami"
                          className="w-full text-xs font-bold border border-slate-200 focus:outline-none focus:border-indigo-500 px-3 py-2 rounded-xl bg-slate-50/50 text-gray-950"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-500 uppercase">{t.ibanLabel}</label>
                        <input
                          type="text"
                          value={iban}
                          onChange={(e) => setIban(e.target.value)}
                          placeholder="230123456789012345678945"
                          maxLength={24}
                          className="w-full text-xs font-black font-mono border border-slate-200 focus:outline-none focus:border-indigo-500 px-3 py-2 rounded-xl bg-slate-50/50 text-gray-950"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Status Indicator Alerts inside Form */}
              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-250 text-emerald-700 rounded-2xl text-[11px] font-bold text-center">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-150 text-rose-700 rounded-2xl text-[11px] font-bold text-center">
                  {errorMsg}
                </div>
              )}

            </div>

            {/* Bottom Actions Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6 shrink-0">
              <button
                type="button"
                onClick={handleBack}
                disabled={activeStep === 1 || loading}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 disabled:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:bg-transparent"
              >
                {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{t.backBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => saveStep(activeStep)}
                disabled={loading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.submitting}</span>
                  </>
                ) : (
                  <>
                    <span>{activeStep === 8 ? (isRTL ? 'إنهاء وحفظ الحساب' : 'Finaliser & Fermer') : t.saveBtn}</span>
                    {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </>
                )}
              </button>
            </div>

          </section>

        </div>

      </div>
    </div>
  );
}
