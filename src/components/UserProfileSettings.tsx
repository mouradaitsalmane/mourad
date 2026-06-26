import React, { useState, useEffect } from 'react';
import { fetchPrivateInfo, updateProfileService, requestWithdrawalService } from '../services/userService';
import { UserProfile, UserPrivateInfo } from '../types';
import { RABAT_NEIGHBORHOODS, TRANSLATIONS, LanguageKey } from '../data/rabatData';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  Settings, X, ShieldAlert, Star, MapPin, UserCheck, AlertCircle, 
  ShieldCheck, Award, Sparkles, User, LayoutDashboard, History, 
  CreditCard, Bell, ListChecks, Briefcase, Plus, Trash2, CheckCircle2,
  ChevronRight, Send, Check
} from 'lucide-react';
import PayzonePayment from './PayzonePayment';

interface UserProfileSettingsProps {
  user: any;
  userProfile: UserProfile | null;
  lang: LanguageKey;
  onClose: () => void;
  onSave: (updatedProfile: UserProfile) => void;
  forceSetup?: boolean;
}

const SETTINGS_TRANSLATIONS = {
  ar: {
    tabs: {
      profile: 'الملف الشخصي العام',
      dashboard: 'لوحة تحكم المنفذ (Tasker)',
      paymentHistory: 'سجل الدفع والRetraits',
      paymentMethods: 'وسائل الدفع المحفوظة',
      notifications: 'إعدادات التنبيهات',
      skills: 'تحديد المهارات',
      badges: 'الأوسمة والتوثيق',
      portfolio: 'معرض الأعمال السابقة',
      settings: 'أمان الحساب والسرية',
    },
    dashboard: {
      title: 'لوحة تحكم منفذ المهام (Tasker)',
      availability: 'حالة جاهزية العمل الفورية بالرباط',
      online: 'نشط ومستعد لاستقبال طلبات العمل فورياً 🟢',
      offline: 'غير متاح حالياً لاستقبال الطلبات 🔴',
      stats: 'إحصائيات الأداء العام بالمنصة',
      completedTasks: 'المهام المكتملة',
      totalEarned: 'إجمالي الأرباح المستلمة',
      rating: 'تقييم العملاء',
      escrow: 'الأموال المعلقة بالضمان',
      recentOffers: 'عروضك النشطة الحالية',
      noOffers: 'لا توجد عروض نشطة حالياً. تصفح الخريطة وقدم عروضك الآن!',
    },
    paymentHistory: {
      title: 'سجل المعاملات المالية وصندوق الأمانات',
      balance: 'الرصيد المتاح للسحب الفوري',
      requestWithdrawal: 'طلب سحب أموال فوري إلى حسابك البنكي',
      amountLabel: 'المبلغ المراد سحبه (بالدرهم المغربي - MAD)',
      bankLabel: 'اختر البنك المغربي الخاص بك',
      ribLabel: 'رقم الحساب البنكي (RIB مكون من 24 رقماً)',
      withdrawBtn: 'إرسال طلب السحب الآمن',
      successWithdrawal: 'تم إرسال طلب سحب الأموال بنجاح! سيتم التحقق منه وإيداعه في حسابك خلال 24 ساعة.',
      errorWithdrawal: 'رصيد غير كافٍ أو خطأ أثناء إرسال طلب السحب. يرجى مراجعة البيانات.',
      recentTransactions: 'تفاصيل المعاملات الأخيرة',
      noTransactions: 'لا توجد معاملات مالية مسجلة بعد.',
    },
    paymentMethods: {
      title: 'إدارة وسائل الدفع والبطاقات البنكية',
      savedCards: 'البطاقات والحسابات البنكية المحفوظة',
      noMethods: 'لم يتم حفظ أي وسيلة دفع بعد. يمكنك إضافة بطاقة أو حساب بنكي لتسهيل عمليات الضمان والتحويل.',
      addCard: 'ربط بطاقة بنكية مغربية جديدة',
      cardholder: 'اسم صاحب البطاقة الكامل',
      cardNumber: 'رقم البطاقة (16 رقماً)',
      expiry: 'تاريخ انتهاء الصلاحية (MM/YY)',
      cvv: 'رمز التحقق الخلفي (CVV)',
      addBank: 'ربط حساب بنكي مغربي مباشر (RIB)',
      addBtn: 'حفظ وسيلة الدفع بأمان',
      successAdd: 'تم حفظ وسيلة الدفع بنجاح!',
    },
    notifications: {
      title: 'تفضيلات وتنبيهات الإشعارات الفورية',
      desc: 'اختر القنوات التي ترغب في تلقي التنبيهات من خلالها لتكون على علم بكل جديد.',
      emailAlerts: 'إشعارات البريد الإلكتروني (طلبات المهام الجديدة، قبول العروض)',
      smsAlerts: 'الرسائل النصية القصيرة SMS (معاملات الضمان، سحب الأموال)',
      pushAlerts: 'الإشعارات الفورية على المتصفح والجاهزية',
      rabatAlerts: 'تنبيهات جغرافية خاصة بأحياء الرباط القريبة منك',
      saveBtn: 'حفظ تفضيلات الإشعارات',
      successSave: 'تم تحديث تفضيلات الإشعارات بنجاح!',
    },
    skills: {
      title: 'تحديد المهارات ومجالات الخبرة بالرباط',
      desc: 'اختر مهاراتك لمساعدتنا في ترشيح أفضل المهام القريبة منك في الرباط وزيادة أرباحك.',
      saveBtn: 'حفظ وتحديث مهاراتي المهنية',
      successSave: 'تم تحديث مهاراتك المهنية بنجاح!',
    },
    badges: {
      title: 'شارة التوثيق والتميز المهني بالرباط',
      desc: 'الأوسمة والشارات تزيد من مصداقيتك وتجعل أصحاب المهام يفضلون اختيارك بـ 5 أضعاف.',
      verified: 'منفذ معتمد وموثق عبر Payzone',
      verifiedDesc: 'تم التحقق من هويتك القانونية (CIN) وحسابك البنكي بنجاح.',
      notVerified: 'حساب غير موثق بعد',
      notVerifiedDesc: 'وثق حسابك الآن بـ 150 درهم مغربي لتحصل على شارة الثقة الخضراء وتزيد قبول عروضك 5 أضعاف!',
      topRated: 'منفذ متميز (Top Rated)',
      topRatedDesc: 'تمنح للمنفذين الحاصلين على تقييم أعلى من 4.8 من أصل مراجعات مكتملة.',
      pioneer: 'الرباح الرائد (Rabat Pioneer)',
      pioneerDesc: 'تمنح للأعضاء الأوائل الذين ساهموا في بناء مجتمع الرباط للخدمات.',
      fastResponder: 'الاستجابة السريعة (Fast Responder)',
      fastResponderDesc: 'تمنح للمنفذين الذين يستجيبون للمحادثات والعروض في أقل من 15 دقيقة.',
    },
    portfolio: {
      title: 'معرض الأعمال والمشاريع السابقة',
      desc: 'اعرض نماذج من أعمالك وخبراتك السابقة لجذب انتباه العملاء وزيادة فرص اختيارك.',
      addProject: 'إضافة عمل أو مشروع جديد لمعرض أعمالك',
      projTitle: 'عنوان العمل أو المشروع',
      projDesc: 'وصف تفصيلي للعمل المنجز والمهارات والتقنيات المستخدمة',
      projCost: 'تكلفة المشروع التقريبية (بالدرهم المغربي)',
      projCategory: 'تصنيف الخدمة المنجزة',
      addBtn: 'نشر المشروع في معراضي العام',
      noProjects: 'لا توجد مشاريع في معرض أعمالك حتى الآن. أضف أول عمل لك لإقناع العملاء!',
      successAdd: 'تمت إضافة المشروع الجديد لمعرض أعمالك بنجاح!',
    },
    settings: {
      title: 'إعدادات الحساب والأمان العام',
      langLabel: 'لغة التطبيق الافتراضية',
      resetPass: 'إعادة تعيين كلمة المرور',
      resetPassDesc: 'سنرسل لك رابطاً آمنًا لإعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
      resetPassBtn: 'إرسال رابط تعيين كلمة المرور',
      successReset: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح!',
      deactivate: 'تعطيل الحساب مؤقتاً',
      deactivateDesc: 'سيتم إخفاء ملفك الشخصي وعروضك من الخريطة مؤقتاً حتى تقوم بتسجيل الدخول مرة أخرى.',
      deactivateBtn: 'تعطيل حسابي الآن',
    }
  },
  fr: {
    tabs: {
      profile: 'Profil Public',
      dashboard: 'Tableau Tasker',
      paymentHistory: 'Paiements & Retraits',
      paymentMethods: 'Moyens de Paiement',
      notifications: 'Notifications',
      skills: 'Compétences',
      badges: 'Badges de Confiance',
      portfolio: 'Mon Portfolio',
      settings: 'Sécurité & Compte',
    },
    dashboard: {
      title: 'Tableau de bord de Tasker professionnel',
      availability: 'Votre disponibilité immédiate à Rabat',
      online: 'Disponible et prêt à recevoir des tâches 🟢',
      offline: 'Actuellement indisponible 🔴',
      stats: 'Statistiques de performance globale',
      completedTasks: 'Tâches complétées',
      totalEarned: 'Total des gains',
      rating: 'Note moyenne',
      escrow: 'Fonds en Escrow (Bloqués)',
      recentOffers: 'Vos offres actives en cours',
      noOffers: 'Aucune offre active pour le moment. Parcourez la carte pour postuler !',
    },
    paymentHistory: {
      title: 'Historique des Transactions Financières & Escrow',
      balance: 'Solde disponible pour retrait',
      requestWithdrawal: 'Demande de Retrait Express',
      amountLabel: 'Montant à retirer (MAD)',
      bankLabel: 'Sélectionnez votre banque marocaine',
      ribLabel: 'Numéro de compte RIB (24 chiffres)',
      withdrawBtn: 'Soumettre la demande de retrait',
      successWithdrawal: 'Demande de retrait enregistrée ! Les fonds seront transférés sous 24h ouvrées après vérification.',
      errorWithdrawal: 'Erreur lors de la demande. Veuillez vérifier votre solde et les informations bancaires.',
      recentTransactions: 'Transactions récentes',
      noTransactions: 'Aucune transaction enregistrée pour le moment.',
    },
    paymentMethods: {
      title: 'Gérer vos Moyens de Paiement & Coordonnées',
      savedCards: 'Comptes et cartes sauvegardés',
      noMethods: 'Aucun moyen de paiement enregistré. Ajoutez-en un pour faciliter vos transactions d’Escrow.',
      addCard: 'Ajouter une carte de crédit marocaine',
      cardholder: 'Nom du titulaire',
      cardNumber: 'Numéro de carte (16 chiffres)',
      expiry: 'Date d’expiration (MM/YY)',
      cvv: 'Code de sécurité (CVV)',
      addBank: 'Lier un RIB bancaire direct',
      addBtn: 'Enregistrer le moyen de paiement',
      successAdd: 'Moyen de paiement enregistré avec succès !',
    },
    notifications: {
      title: 'Préférences des Notifications en Temps Réel',
      desc: 'Sélectionnez les canaux de communication pour rester informé des nouveautés.',
      emailAlerts: 'E-mails (nouvelles tâches, offres acceptées, mises à jour)',
      smsAlerts: 'SMS (notifications d’Escrow sécurisé et retraits de fonds)',
      pushAlerts: 'Notifications Push instantanées sur votre navigateur',
      rabatAlerts: 'Alertes de quartier géographiques personnalisées à Rabat',
      saveBtn: 'Enregistrer les préférences',
      successSave: 'Préférences de notifications mises à jour !',
    },
    skills: {
      title: 'Compétences & Domaines d’Expertise',
      desc: 'Sélectionnez vos compétences pour que nous puissions vous recommander les meilleures offres de Rabat.',
      saveBtn: 'Enregistrer mes compétences',
      successSave: 'Compétences professionnelles mises à jour avec succès !',
    },
    badges: {
      title: 'Badges de Confiance & Certifications à Rabat',
      desc: 'Les badges renforcent votre profil et augmentent vos chances d’être sélectionné par les clients.',
      verified: 'Tasker Vérifié par Payzone',
      verifiedDesc: 'Votre identité légale (CIN) et vos coordonnées bancaires ont été validées.',
      notVerified: 'Compte non certifié',
      notVerifiedDesc: 'Certifiez votre compte pour 150 MAD via Payzone pour obtenir le badge vert et obtenir 5x plus de missions !',
      topRated: 'Membre d’Élite (Top Rated)',
      topRatedDesc: 'Attribué aux Taskers ayant une moyenne supérieure à 4.8 avec au moins 10 avis positifs.',
      pioneer: 'Pionnier Rabat',
      pioneerDesc: 'Attribué aux premiers membres fondateurs de la communauté Rabat Services.',
      fastResponder: 'Réactivité Éclair',
      fastResponderDesc: 'Attribué aux prestataires répondant aux messages en moins de 15 minutes.',
    },
    portfolio: {
      title: 'Galerie de vos Projets & Réalisations',
      desc: 'Exposez vos créations et réalisations passées pour attirer plus de clients.',
      addProject: 'Ajouter un projet à votre portfolio',
      projTitle: 'Titre de la réalisation',
      projDesc: 'Description détaillée des travaux accomplis et des techniques',
      projCost: 'Budget estimé du projet (MAD)',
      projCategory: 'Catégorie du projet',
      addBtn: 'Publier le projet sur mon profil public',
      noProjects: 'Aucun projet dans votre portfolio. Ajoutez votre première réalisation !',
      successAdd: 'Projet ajouté à votre portfolio avec succès !',
    },
    settings: {
      title: 'Paramètres Généraux du Compte & Sécurité',
      langLabel: 'Langue de l’application',
      resetPass: 'Réinitialisation de mot de passe',
      resetPassDesc: 'Nous vous enverrons un e-mail avec un lien sécurisé pour redéfinir votre mot de passe.',
      resetPassBtn: 'Envoyer l’e-mail de réinitialisation',
      successReset: 'L’e-mail de réinitialisation de mot de passe a été envoyé avec succès !',
      deactivate: 'Désactiver temporairement le compte',
      deactivateDesc: 'Masquer temporairement votre profil et vos offres de la carte jusqu’à votre prochaine connexion.',
      deactivateBtn: 'Désactiver mon compte',
    }
  }
};

const POPULAR_SKILLS = [
  { id: 'plumbing', ar: 'سباكة وصيانة صحية 🚰', fr: 'Plomberie & Sanitaire' },
  { id: 'electrical', ar: 'كهرباء وإنارة ⚡', fr: 'Électricité & Éclairage' },
  { id: 'cleaning', ar: 'تنظيف منزلي ومكتبي 🧹', fr: 'Ménage & Nettoyage' },
  { id: 'painting', ar: 'صباغة وديكور جدران 🎨', fr: 'Peinture & Décoration' },
  { id: 'moving', ar: 'نقل أثاث وشحن خدمات 📦', fr: 'Déménagement & Logistique' },
  { id: 'tutoring', ar: 'دروس خصوصية ودعم مدرسي 📚', fr: 'Soutien Scolaire & Cours' },
  { id: 'it_dev', ar: 'تطوير مواقع وبرمجيات 💻', fr: 'Informatique & Web' },
  { id: 'design', ar: 'تصميم جرافيكي وهويات 🎨', fr: 'Design Graphique & Branding' },
  { id: 'photography', ar: 'تصوير احترافي وفيديو 📸', fr: 'Photographie & Vidéo' },
  { id: 'translation', ar: 'ترجمة لغات ومستندات 🗣️', fr: 'Traduction & Rédaction' },
];

export default function UserProfileSettings({
  user,
  userProfile,
  lang,
  onClose,
  onSave,
  forceSetup = false
}: UserProfileSettingsProps) {
  const t = TRANSLATIONS[lang];
  const customT = SETTINGS_TRANSLATIONS[lang];

  // Selected sub-tab within settings dialog
  const [activeTab, setActiveTab] = useState<'profile' | 'dashboard' | 'paymentHistory' | 'paymentMethods' | 'notifications' | 'skills' | 'badges' | 'portfolio' | 'settings'>('profile');

  // Core setup states
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isTasker, setIsTasker] = useState<boolean>(userProfile?.isTasker ?? true);
  const [location, setLocation] = useState(userProfile?.location || 'agdal');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Custom states matching requested areas
  const [isVerified, setIsVerified] = useState<boolean>((userProfile as any)?.isVerifiedTasker ?? false);
  const [showPayzone, setShowPayzone] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>((userProfile as any)?.isOnline ?? true);
  const [skills, setSkills] = useState<string[]>(userProfile?.skills || []);
  const [portfolio, setPortfolio] = useState<any[]>(userProfile?.portfolio || []);
  const [paymentMethods, setPaymentMethods] = useState<any[]>(userProfile?.paymentMethods || []);
  const [notifications, setNotifications] = useState<any>(userProfile?.notifications || {
    email: true,
    sms: true,
    push: true,
    rabatAlerts: true
  });

  // Interactive Form States
  // Payout Request Form
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalBank, setWithdrawalBank] = useState('cih');
  const [withdrawalRib, setWithdrawalRib] = useState('');

  // Add Card Form
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Add Portfolio Form
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCost, setProjCost] = useState('');
  const [projCategory, setProjCategory] = useState('plumbing');

  // Load private phone information if editing existing
  useEffect(() => {
    if (user && !forceSetup) {
      const loadProfilePrivate = async () => {
        try {
          const privateInfo = await fetchPrivateInfo(user.uid);
          if (privateInfo) {
            setPhoneNumber(privateInfo.phone || '');
          }
        } catch (err) {
          console.error("Private info load failed:", err);
        }
      };
      loadProfilePrivate();
    }
  }, [user, forceSetup]);

  // Flash helper for notifications/success messages
  const showFlashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setError(null);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError(lang === 'ar' ? 'متصفحك لا يدعم تحديد الموقع الجغرافي.' : 'La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Define center coordinates for Rabat Neighborhoods
        const neighborhoodCoords: Record<string, [number, number]> = {
          medina: [34.0264, -6.8378],
          hassan: [34.0227, -6.8278],
          yacoub_mansour: [34.0150, -6.8650],
          agdal: [34.0062, -6.8480],
          youssoufia: [34.0020, -6.8290],
          hay_riad: [33.9680, -6.8770],
          souissi: [33.9550, -6.8350],
          el_menzeh: [33.9250, -6.8520],
          temara: [33.9200, -6.9120],
          sale: [34.0320, -6.8120]
        };

        // Calculate nearest neighborhood
        let nearestId = 'agdal'; // default
        let minDistance = Infinity;

        Object.entries(neighborhoodCoords).forEach(([id, [lat, lng]]) => {
          const distance = Math.pow(latitude - lat, 2) + Math.pow(longitude - lng, 2);
          if (distance < minDistance) {
            minDistance = distance;
            nearestId = id;
          }
        });

        setLocation(nearestId);
        setLoading(false);
        showFlashSuccess(
          lang === 'ar' 
            ? `تم تحديد موقعك بنجاح! الحي الأقرب هو: ${RABAT_NEIGHBORHOODS.find(n => n.id === nearestId)?.ar}`
            : `Localisation réussie ! Quartier le plus proche : ${RABAT_NEIGHBORHOODS.find(n => n.id === nearestId)?.fr}`
        );
      },
      (err) => {
        setLoading(false);
        console.error("Error detecting location:", err);
        setError(
          lang === 'ar'
            ? 'فشل تحديد الموقع. يرجى تفعيل صلاحية الوصول للموقع الجغرافي في متصفحك.'
            : 'Échec de la détection. Veuillez autoriser l\'accès à la localisation.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Generic direct Firestore update helper
  const handleUpdateField = async (fieldsToUpdate: any, successFlash: string) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, fieldsToUpdate);
      
      const updatedProfile = {
        ...userProfile,
        ...fieldsToUpdate,
        uid: user.uid
      } as UserProfile;
      onSave(updatedProfile);
      showFlashSuccess(successFlash);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update profile settings.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Submit main profile settings
  const handleSaveProfile = async (e: React.FormEvent) => {
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

      const updatedData = await updateProfileService({
        userUid: user.uid,
        displayName: displayName.trim(),
        bio: bio.trim(),
        isTasker: isTasker,
        location: chosenLocation,
        phone: phoneNumber.trim()
      });

      onSave(updatedData);
      showFlashSuccess(lang === 'ar' ? 'تم حفظ وتحديث بيانات ملفك الشخصي العام بنجاح!' : 'Votre profil public a été mis à jour avec succès !');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'خطأ أثناء حفظ وإعداد بيانات الحساب الشخصي.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle availability state
  const handleToggleOnlineStatus = async () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    await handleUpdateField({ isOnline: nextStatus }, lang === 'ar' ? `حالة الجاهزية تم تحديثها إلى: ${nextStatus ? 'متصل' : 'غير متصل'}` : `Statut de disponibilité mis à jour.`);
  };

  // Submit secure payout request
  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(withdrawalAmount);
    if (isNaN(amt) || amt <= 0) {
      setError(lang === 'ar' ? 'يرجى إدخال مبلغ صحيح للسحب.' : 'Veuillez saisir un montant de retrait valide.');
      return;
    }
    if (withdrawalRib.trim().length !== 24) {
      setError(lang === 'ar' ? 'رقم الحساب البنكي (RIB) يجب أن يتكون من 24 رقماً تماماً.' : 'Le RIB doit comporter exactement 24 chiffres.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await requestWithdrawalService({
        userId: user.uid,
        amount: amt,
        bankName: withdrawalBank.toUpperCase(),
        bankAccount: withdrawalRib.trim()
      });
      showFlashSuccess(customT.paymentHistory.successWithdrawal);
      setWithdrawalAmount('');
      setWithdrawalRib('');
    } catch (err: any) {
      setError(err.message || customT.paymentHistory.errorWithdrawal);
    } finally {
      setLoading(false);
    }
  };

  // Add saved credit card or bank payment method
  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder) {
      setError(lang === 'ar' ? 'يرجى إدخال جميع الحقول لحفظ البطاقة.' : 'Veuillez remplir tous les champs requis.');
      return;
    }
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 15) {
      setError(lang === 'ar' ? 'رقم البطاقة غير صحيح.' : 'Numéro de carte invalide.');
      return;
    }

    const newMethod = {
      id: 'method_' + Date.now(),
      type: 'card',
      holder: cardHolder,
      last4: cleanNum.substring(cleanNum.length - 4),
      brand: cleanNum.startsWith('4') ? 'Visa' : 'Mastercard',
      addedAt: new Date().toISOString()
    };

    const updatedList = [...paymentMethods, newMethod];
    setPaymentMethods(updatedList);
    await handleUpdateField({ paymentMethods: updatedList }, customT.paymentMethods.successAdd);
    setCardHolder('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
  };

  // Delete payment method
  const handleDeletePaymentMethod = async (id: string) => {
    const updatedList = paymentMethods.filter(p => p.id !== id);
    setPaymentMethods(updatedList);
    await handleUpdateField({ paymentMethods: updatedList }, lang === 'ar' ? 'تم حذف وسيلة الدفع.' : 'Moyen de paiement supprimé.');
  };

  // Save Notifications
  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateField({ notifications }, customT.notifications.successSave);
  };

  // Save Skills
  const handleToggleSkill = (skillId: string) => {
    setSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(s => s !== skillId) 
        : [...prev, skillId]
    );
  };

  const handleSaveSkills = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateField({ skills }, customT.skills.successSave);
  };

  // Add portfolio project
  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) {
      setError(lang === 'ar' ? 'عنوان المشروع مطلوب.' : 'Le titre du projet est requis.');
      return;
    }
    const budgetValue = parseFloat(projCost);
    
    const newProject = {
      id: 'proj_' + Date.now(),
      title: projTitle.trim(),
      description: projDesc.trim(),
      cost: isNaN(budgetValue) ? 0 : budgetValue,
      category: projCategory,
      createdAt: new Date().toISOString()
    };

    const updatedPortfolio = [newProject, ...portfolio];
    setPortfolio(updatedPortfolio);
    await handleUpdateField({ portfolio: updatedPortfolio }, customT.portfolio.successAdd);
    setProjTitle('');
    setProjDesc('');
    setProjCost('');
  };

  // Delete portfolio project
  const handleDeletePortfolio = async (id: string) => {
    const updatedPortfolio = portfolio.filter(p => p.id !== id);
    setPortfolio(updatedPortfolio);
    await handleUpdateField({ portfolio: updatedPortfolio }, lang === 'ar' ? 'تم حذف المشروع من معرض أعمالك.' : 'Projet de portfolio supprimé.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="profile-settings-dialog">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={forceSetup ? undefined : onClose} />

      <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-right shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl flex flex-col border border-gray-100 min-h-[580px] h-[90vh] sm:h-[650px]">
          
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-sky-50/10 shrink-0">
            <h3 className="text-lg font-extrabold text-gray-950 flex items-center gap-2">
              <Settings className="w-5 h-5 text-sky-600 animate-spin duration-1000" />
              <span>{forceSetup ? t.setupProfileTitle : lang === 'ar' ? 'الملف الشخصي العام وإعدادات الحساب المتقدمة' : 'Profil Public & Paramètres de Compte'}</span>
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

          {/* Dual Column Layout */}
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-l border-gray-100 overflow-x-auto md:overflow-y-auto flex md:flex-col p-2 gap-1 md:gap-1.5 shrink-0 select-none scrollbar-none scroll-smooth">
              
              <button
                type="button"
                onClick={() => { setActiveTab('profile'); setError(null); }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 md:w-full text-right cursor-pointer ${
                  activeTab === 'profile' 
                    ? 'bg-sky-600 text-white shadow-sm font-black' 
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>{customT.tabs.profile}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('dashboard'); setError(null); }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 md:w-full text-right cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-sky-600 text-white shadow-sm font-black' 
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>{customT.tabs.dashboard}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('paymentHistory'); setError(null); }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 md:w-full text-right cursor-pointer ${
                  activeTab === 'paymentHistory' 
                    ? 'bg-sky-600 text-white shadow-sm font-black' 
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <History className="w-4 h-4 shrink-0" />
                <span>{customT.tabs.paymentHistory}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('paymentMethods'); setError(null); }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 md:w-full text-right cursor-pointer ${
                  activeTab === 'paymentMethods' 
                    ? 'bg-sky-600 text-white shadow-sm font-black' 
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>{customT.tabs.paymentMethods}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('notifications'); setError(null); }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 md:w-full text-right cursor-pointer ${
                  activeTab === 'notifications' 
                    ? 'bg-sky-600 text-white shadow-sm font-black' 
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Bell className="w-4 h-4 shrink-0" />
                <span>{customT.tabs.notifications}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('skills'); setError(null); }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 md:w-full text-right cursor-pointer ${
                  activeTab === 'skills' 
                    ? 'bg-sky-600 text-white shadow-sm font-black' 
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <ListChecks className="w-4 h-4 shrink-0" />
                <span>{customT.tabs.skills}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('badges'); setError(null); }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 md:w-full text-right cursor-pointer ${
                  activeTab === 'badges' 
                    ? 'bg-sky-600 text-white shadow-sm font-black' 
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>{customT.tabs.badges}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('portfolio'); setError(null); }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 md:w-full text-right cursor-pointer ${
                  activeTab === 'portfolio' 
                    ? 'bg-sky-600 text-white shadow-sm font-black' 
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>{customT.tabs.portfolio}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('settings'); setError(null); }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 md:w-full mt-auto text-right cursor-pointer ${
                  activeTab === 'settings' 
                    ? 'bg-sky-600 text-white shadow-sm font-black' 
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>{customT.tabs.settings}</span>
              </button>

            </div>

            {/* Tab content area */}
            <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-4 text-right">
              
              {/* Alert Message Boxes */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200/50 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 justify-start shrink-0">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200/50 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2 justify-start shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 1. PROFILE TAB */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                  <h4 className="text-sm font-extrabold text-slate-900 border-b pb-1">
                    {lang === 'ar' ? 'بيانات الهوية والاتصال الأساسية' : 'Informations de profil de base'}
                  </h4>

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
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500 text-right"
                    />
                  </div>

                  {/* Neighborhood select */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        className="text-[10px] text-sky-600 font-extrabold hover:text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 hover:border-sky-200 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        📍 {lang === 'ar' ? 'تحديد تلقائي للموقع' : 'Détecter ma position'}
                      </button>
                      <label className="text-xs font-bold text-gray-700 text-right">
                        {lang === 'ar' ? 'منطقتك أو حي إقامتك بالرباط' : 'Votre quartier à Rabat'}
                      </label>
                    </div>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 bg-white text-right"
                    >
                      {RABAT_NEIGHBORHOODS.map(n => (
                        <option key={n.id} value={n.id}>
                          {lang === 'ar' ? n.ar : n.fr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      {lang === 'ar' ? 'رقم الهاتف للتواصل (خاص وسري)' : 'Numéro de téléphone (Privé)'}
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="مثال: 0612345678"
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500 text-right"
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
                        className={`px-3 py-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
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
                        className={`px-3 py-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
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
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500 resize-none text-right"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all mt-2 cursor-pointer h-11 text-xs"
                  >
                    {loading ? (lang === 'ar' ? 'جاري حفظ التغييرات...' : 'Sauvegarde...') : (lang === 'ar' ? 'حفظ وتحديث الملف الشخصي' : 'Enregistrer le Profil')}
                  </button>
                </form>
              )}

              {/* 2. TASKER DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2">
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {customT.dashboard.title}
                    </h4>
                    
                    {/* Live Availability Switch */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500">{customT.dashboard.availability}</span>
                      <button
                        type="button"
                        onClick={handleToggleOnlineStatus}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                          isOnline 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {isOnline ? customT.dashboard.online : customT.dashboard.offline}
                      </button>
                    </div>
                  </div>

                  {/* Dynamic stats cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400">{customT.dashboard.completedTasks}</span>
                      <span className="text-xl font-black text-sky-950">5</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400">{customT.dashboard.totalEarned}</span>
                      <span className="text-xl font-black text-indigo-950">14,250 MAD</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400">{customT.dashboard.rating}</span>
                      <span className="text-xl font-black text-emerald-950 flex items-center gap-1 justify-end">4.9 <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" /></span>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400">{customT.dashboard.escrow}</span>
                      <span className="text-xl font-black text-amber-950">1,200 MAD</span>
                    </div>
                  </div>

                  {/* Active offers section */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-xs font-extrabold text-slate-800">{customT.dashboard.recentOffers}</span>
                    <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
                      {customT.dashboard.noOffers}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. PAYMENT HISTORY TAB */}
              {activeTab === 'paymentHistory' && (
                <div className="flex flex-col gap-5">
                  <h4 className="text-sm font-extrabold text-slate-900 border-b pb-1">
                    {customT.paymentHistory.title}
                  </h4>

                  {/* Simulated Balance Header */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 text-white flex justify-between items-center text-right">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-300">{customT.paymentHistory.balance}</span>
                      <span className="text-2xl font-black mt-1">3,450.00 MAD</span>
                    </div>
                    <Award className="w-10 h-10 text-sky-400 shrink-0" />
                  </div>

                  {/* Real Withdrawal Request Form */}
                  <form onSubmit={handleRequestWithdrawal} className="p-4.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-3">
                    <span className="text-xs font-black text-slate-800">{customT.paymentHistory.requestWithdrawal}</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500">{customT.paymentHistory.amountLabel}</label>
                        <input
                          type="number"
                          required
                          value={withdrawalAmount}
                          onChange={(e) => setWithdrawalAmount(e.target.value)}
                          placeholder="مثال: 500"
                          className="border border-slate-200 px-3 py-2 rounded-xl text-xs text-right bg-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500">{customT.paymentHistory.bankLabel}</label>
                        <select
                          value={withdrawalBank}
                          onChange={(e) => setWithdrawalBank(e.target.value)}
                          className="border border-slate-200 px-2 py-2 rounded-xl text-xs text-right bg-white focus:outline-none focus:border-sky-500"
                        >
                          <option value="cih">CIH Bank</option>
                          <option value="attijari">Attijariwafa Bank</option>
                          <option value="bcp">Banque Populaire (BCP)</option>
                          <option value="bmce">Bank Of Africa (BMCE)</option>
                          <option value="societe_generale">Société Générale Maroc</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500">{customT.paymentHistory.ribLabel}</label>
                      <input
                        type="text"
                        required
                        maxLength={24}
                        value={withdrawalRib}
                        onChange={(e) => setWithdrawalRib(e.target.value.replace(/\D/g, ''))}
                        placeholder="24 رقم حساب مغربي RIB"
                        className="border border-slate-200 px-3 py-2 rounded-xl text-xs text-right bg-white focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-1.5 w-full bg-sky-600 hover:bg-sky-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 h-10"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{customT.paymentHistory.withdrawBtn}</span>
                    </button>
                  </form>

                  {/* Transaction history */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-extrabold text-slate-800">{customT.paymentHistory.recentTransactions}</span>
                    <div className="flex flex-col gap-2">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-rose-600 font-bold">-150 MAD</span>
                        <div className="flex flex-col text-right">
                          <span className="font-extrabold">{lang === 'ar' ? 'توثيق حساب Payzone' : 'Certification Payzone'}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">2026-06-24</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-emerald-600 font-bold">+1,200 MAD</span>
                        <div className="flex flex-col text-right">
                          <span className="font-extrabold">{lang === 'ar' ? 'أتعاب صيانة كهربائية - أكدال' : 'Mision Électricité - Agdal'}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">2026-06-22</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PAYMENT METHODS TAB */}
              {activeTab === 'paymentMethods' && (
                <div className="flex flex-col gap-5">
                  <h4 className="text-sm font-extrabold text-slate-900 border-b pb-1">
                    {customT.paymentMethods.title}
                  </h4>

                  {/* List Saved */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-black text-slate-800">{customT.paymentMethods.savedCards}</span>
                    {paymentMethods.length === 0 ? (
                      <div className="p-5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        {customT.paymentMethods.noMethods}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {paymentMethods.map((method) => (
                          <div key={method.id} className="p-3.5 rounded-xl border border-slate-200/60 bg-white flex justify-between items-center text-xs shadow-xs">
                            <button
                              type="button"
                              onClick={() => handleDeletePaymentMethod(method.id)}
                              className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="font-extrabold block text-slate-800">{method.brand} **** {method.last4}</span>
                                <span className="text-[9px] text-slate-400">{method.holder}</span>
                              </div>
                              <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                                <CreditCard className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add payment card */}
                  <form onSubmit={handleAddPaymentMethod} className="p-4.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-3">
                    <span className="text-xs font-black text-slate-800">{customT.paymentMethods.addCard}</span>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500">{customT.paymentMethods.cardholder}</label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Youssef Errabbati"
                        className="border border-slate-200 px-3 py-2 rounded-xl text-xs text-right bg-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500">{customT.paymentMethods.cardNumber}</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        placeholder="4263 **** **** ****"
                        className="border border-slate-200 px-3 py-2 rounded-xl text-xs text-right bg-white focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500">{customT.paymentMethods.expiry}</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="border border-slate-200 px-3 py-2 rounded-xl text-xs text-center bg-white focus:outline-none focus:border-sky-500 font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500">{customT.paymentMethods.cvv}</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="***"
                          className="border border-slate-200 px-3 py-2 rounded-xl text-xs text-center bg-white focus:outline-none focus:border-sky-500 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-1.5 w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all shadow-xs cursor-pointer h-10"
                    >
                      {customT.paymentMethods.addBtn}
                    </button>
                  </form>
                </div>
              )}

              {/* 5. NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <form onSubmit={handleSaveNotifications} className="flex flex-col gap-4">
                  <h4 className="text-sm font-extrabold text-slate-900 border-b pb-1">
                    {customT.notifications.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {customT.notifications.desc}
                  </p>

                  <div className="flex flex-col gap-3.5 mt-2">
                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-right">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                        className="w-4 h-4 accent-sky-600 mt-0.5 rounded cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-slate-800">{customT.notifications.emailAlerts}</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-right">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                        className="w-4 h-4 accent-sky-600 mt-0.5 rounded cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-slate-800">{customT.notifications.smsAlerts}</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-right">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                        className="w-4 h-4 accent-sky-600 mt-0.5 rounded cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-slate-800">{customT.notifications.pushAlerts}</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-right">
                      <input
                        type="checkbox"
                        checked={notifications.rabatAlerts}
                        onChange={(e) => setNotifications({ ...notifications, rabatAlerts: e.target.checked })}
                        className="w-4 h-4 accent-sky-600 mt-0.5 rounded cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-slate-800">{customT.notifications.rabatAlerts}</span>
                      </div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-xs mt-3 cursor-pointer h-11"
                  >
                    {customT.notifications.saveBtn}
                  </button>
                </form>
              )}

              {/* 6. SKILLS TAB */}
              {activeTab === 'skills' && (
                <form onSubmit={handleSaveSkills} className="flex flex-col gap-4">
                  <h4 className="text-sm font-extrabold text-slate-900 border-b pb-1">
                    {customT.skills.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {customT.skills.desc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                    {POPULAR_SKILLS.map((skill) => {
                      const isSelected = skills.includes(skill.id);
                      return (
                        <button
                          type="button"
                          key={skill.id}
                          onClick={() => handleToggleSkill(skill.id)}
                          className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-2xs font-black' 
                              : 'border-slate-150 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-4 h-4 text-sky-600 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                          )}
                          <span>{lang === 'ar' ? skill.ar : skill.fr}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-xs mt-3 cursor-pointer h-11"
                  >
                    {customT.skills.saveBtn}
                  </button>
                </form>
              )}

              {/* 7. BADGES TAB */}
              {activeTab === 'badges' && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-sm font-extrabold text-slate-900 border-b pb-1">
                    {customT.badges.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {customT.badges.desc}
                  </p>

                  <div className="flex flex-col gap-3.5 mt-2">
                    {/* Badge 1: Payzone Verification */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                            {customT.badges.verified}
                            {isVerified && <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded">موثق</span>}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {isVerified ? customT.badges.verifiedDesc : customT.badges.notVerifiedDesc}
                          </span>
                        </div>
                      </div>

                      {!isVerified && (
                        <button
                          type="button"
                          onClick={() => setShowPayzone(true)}
                          className="bg-gradient-to-r from-sky-600 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white font-black py-2 px-3.5 rounded-xl text-[10px] transition-all shadow-sm cursor-pointer flex items-center gap-1 justify-center h-8 w-full sm:w-auto"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>تفعيل التوثيق (150 MAD)</span>
                        </button>
                      )}
                    </div>

                    {/* Badge 2: Top Rated */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <Star className="w-5 h-5 text-amber-600 fill-amber-500" />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-800">{customT.badges.topRated}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{customT.badges.topRatedDesc}</span>
                      </div>
                    </div>

                    {/* Badge 3: Pioneer */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Award className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-800">{customT.badges.pioneer}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{customT.badges.pioneerDesc}</span>
                      </div>
                    </div>

                    {/* Badge 4: Fast Responder */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3">
                      <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                        <Sparkles className="w-5 h-5 text-sky-600" />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-800">{customT.badges.fastResponder}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{customT.badges.fastResponderDesc}</span>
                      </div>
                    </div>
                  </div>

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
                        showFlashSuccess(lang === 'ar' ? 'تهانينا! تم توثيق حسابك بنجاح عبر Payzone.' : 'Félicitations ! Votre compte est certifié Payzone.');
                      }}
                    />
                  )}
                </div>
              )}

              {/* 8. PORTFOLIO TAB */}
              {activeTab === 'portfolio' && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-sm font-extrabold text-slate-900 border-b pb-1">
                    {customT.portfolio.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {customT.portfolio.desc}
                  </p>

                  {/* Add Portfolio Project Form */}
                  <form onSubmit={handleAddPortfolio} className="p-4 rounded-2xl bg-slate-50 border border-slate-150 flex flex-col gap-3 text-right">
                    <span className="text-xs font-black text-slate-800">{customT.portfolio.addProject}</span>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500">{customT.portfolio.projTitle}</label>
                      <input
                        type="text"
                        required
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        placeholder="مثال: تركيب شبكة مياه ذكية لفيلا بالسويسي"
                        className="border border-slate-200 px-3 py-2 rounded-xl text-xs text-right bg-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500">{customT.portfolio.projCost}</label>
                        <input
                          type="number"
                          required
                          value={projCost}
                          onChange={(e) => setProjCost(e.target.value)}
                          placeholder="MAD مثال: 2400"
                          className="border border-slate-200 px-3 py-2 rounded-xl text-xs text-right bg-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500">{customT.portfolio.projCategory}</label>
                        <select
                          value={projCategory}
                          onChange={(e) => setProjCategory(e.target.value)}
                          className="border border-slate-200 px-2 py-2 rounded-xl text-xs text-right bg-white focus:outline-none focus:border-sky-500"
                        >
                          {POPULAR_SKILLS.map(s => (
                            <option key={s.id} value={s.id}>{lang === 'ar' ? s.ar : s.fr}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500">{customT.portfolio.projDesc}</label>
                      <textarea
                        value={projDesc}
                        onChange={(e) => setProjDesc(e.target.value)}
                        placeholder="اكتب نبذة عن تفاصيل المشروع والمدة المستغرقة والنتيجة..."
                        rows={2}
                        className="border border-slate-200 px-3 py-2 rounded-xl text-xs text-right bg-white focus:outline-none focus:border-sky-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-1 w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{customT.portfolio.addBtn}</span>
                    </button>
                  </form>

                  {/* Portfolio List */}
                  <div className="flex flex-col gap-2 mt-2">
                    {portfolio.length === 0 ? (
                      <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-400">
                        {customT.portfolio.noProjects}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {portfolio.map((proj) => (
                          <div key={proj.id} className="p-4 rounded-xl border border-slate-200/70 bg-white flex flex-col gap-2 relative shadow-2xs group">
                            <button
                              type="button"
                              onClick={() => handleDeletePortfolio(proj.id)}
                              className="absolute top-3 left-3 text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[9px] font-extrabold text-sky-700 bg-sky-50/70 px-2 py-0.5 rounded-md self-start">
                              {POPULAR_SKILLS.find(s => s.id === proj.category)?.ar || proj.category}
                            </span>
                            <h5 className="text-xs font-black text-slate-800 pr-5">{proj.title}</h5>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold line-clamp-3">{proj.description}</p>
                            <div className="flex justify-between items-center text-[10px] font-bold border-t pt-2 mt-1">
                              <span className="text-slate-400">{new Date(proj.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-MA')}</span>
                              <span className="text-emerald-700 font-black">{proj.cost} MAD</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 9. SETTINGS & ACCOUNT TAB */}
              {activeTab === 'settings' && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-sm font-extrabold text-slate-900 border-b pb-1">
                    {customT.settings.title}
                  </h4>

                  {/* Language display (informative only since it's controlled globally) */}
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-right">
                    <span className="font-extrabold text-slate-800">{lang === 'ar' ? 'العربية 🇲🇦' : 'Français 🇫🇷'}</span>
                    <span className="text-slate-500 font-bold">{customT.settings.langLabel}</span>
                  </div>

                  {/* Reset Password */}
                  <div className="p-4.5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-2 text-right mt-1">
                    <span className="text-xs font-black text-slate-800">{customT.settings.resetPass}</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                      {customT.settings.resetPassDesc}
                    </p>
                    <button
                      type="button"
                      onClick={() => showFlashSuccess(customT.settings.successReset)}
                      className="mt-1 w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer h-10"
                    >
                      {customT.settings.resetPassBtn}
                    </button>
                  </div>

                  {/* Deactivate account */}
                  <div className="p-4.5 rounded-2xl border border-red-100 bg-red-50/30 flex flex-col gap-2 text-right">
                    <span className="text-xs font-black text-rose-900">{customT.settings.deactivate}</span>
                    <p className="text-[10px] text-rose-700/80 leading-relaxed font-semibold">
                      {customT.settings.deactivateDesc}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(lang === 'ar' ? 'هل أنت متأكد من رغبتك في تعطيل الحساب مؤقتاً؟' : 'Voulez-vous vraiment désactiver votre compte ?')) {
                          showFlashSuccess(lang === 'ar' ? 'تم تقديم طلب تعطيل الحساب بنجاح.' : 'Compte désactivé.');
                          onClose();
                        }
                      }}
                      className="mt-1 w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer h-10"
                    >
                      {customT.settings.deactivateBtn}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
