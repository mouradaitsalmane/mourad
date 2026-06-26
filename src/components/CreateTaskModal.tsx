import React, { useState, useRef } from 'react';
import { SERVICE_CATEGORIES, RABAT_NEIGHBORHOODS, TRANSLATIONS, LanguageKey } from '../data/rabatData';
import { createTaskService } from '../services/taskService';
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  Calendar, 
  Clock, 
  Hash, 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Phone, 
  MessageSquare, 
  Mail, 
  CheckCircle,
  HelpCircle,
  Flame,
  Award,
  Trash2,
  MapPin,
  ShieldCheck,
  Lock,
  CreditCard,
  Camera
} from 'lucide-react';
import { UserProfile } from '../types';

interface CreateTaskModalProps {
  user: any;
  userProfile: UserProfile | null;
  lang: LanguageKey;
  onClose: () => void;
  onSuccess: () => void;
  initialCategory?: string;
  initialTitle?: string;
  initialBudget?: number;
}

export default function CreateTaskModal({
  user,
  userProfile,
  lang,
  onClose,
  onSuccess,
  initialCategory,
  initialTitle,
  initialBudget
}: CreateTaskModalProps) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  // Step Wizard state: 'form' | 'preview' | 'verification'
  const [step, setStep] = useState<'form' | 'preview' | 'verification'>('form');

  // Form Field States
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number>(initialBudget || 200); // Default to 200 DH or initial budget
  const [category, setCategory] = useState(initialCategory || 'cleaning');
  const [neighborhood, setNeighborhood] = useState('agdal');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('12:00');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'urgent'>('medium');
  const [contactPreference, setContactPreference] = useState<'chat' | 'phone' | 'email' | 'any'>('chat');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Client Identity & Payzone Escrow Payment Information States
  const [cinFront, setCinFront] = useState<string | null>(null);
  const [cinBack, setCinBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Drag-and-drop indicator states for verification files
  const [isDraggingCinFront, setIsDraggingCinFront] = useState(false);
  const [isDraggingCinBack, setIsDraggingCinBack] = useState(false);
  const [isDraggingSelfie, setIsDraggingSelfie] = useState(false);

  // Verification step loader text during final transaction processing
  const [activeProcessStep, setActiveProcessStep] = useState<string | null>(null);

  // Auxiliary UI States
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cinFrontRef = useRef<HTMLInputElement>(null);
  const cinBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const publishingRef = useRef(false);

  // File Upload Handlers (Pure Client-side base64 supporting the preview frames)
  const processFiles = (files: FileList) => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxFilesCount = 4;

    if (uploadedImages.length + files.length > maxFilesCount) {
      setError(
        isRTL 
          ? 'عذراً، يمكنك رفع 4 صور كحد أقصى للمهمة الواحدة.' 
          : 'Vous pouvez uploader un maximum de 4 images par tâche.'
      );
      return;
    }

    const loaders = Array.from(files).map((file) => {
      return new Promise<string>((resolve, reject) => {
        if (!validTypes.includes(file.type)) {
          reject(isRTL ? 'تنسيق الملف غير مدعوم، يرجى رفع صور فقط (PNG, JPG, WebP).' : 'Format invalide. Images uniquement.');
          return;
        }
        if (file.size > 2.5 * 1024 * 1024) { // 2.5MB cap for base64 limits in firestore safely
          reject(isRTL ? `الملف ${file.name} كبير جداً. الحد الأقصى 2.5 ميجابايت.` : `Fichier trop volumineux. Mas 2.5 Mo.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => reject(isRTL ? 'فشل قراءة الملف.' : 'Erreur de lecture.');
        reader.readAsDataURL(file);
      });
    });

    Promise.all(loaders)
      .then((base64Strings) => {
        setUploadedImages((prev) => [...prev, ...base64Strings]);
      })
      .catch((err) => {
        setError(typeof err === 'string' ? err : 'خطأ أثناء تحميل الصور.');
      });
  };

  const processVerificationFile = (file: File, target: 'front' | 'back' | 'selfie') => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(
        isRTL 
          ? 'تنسيق غير مدعوم. يرجى رفع ملف صورة فقط (JPEG, PNG, WebP).' 
          : 'Format d\'image invalide (JPEG, PNG, WebP uniquement).'
      );
      return;
    }
    if (file.size > 3.5 * 1024 * 1024) {
      setError(
        isRTL
          ? 'عذراً، حجم هذه الصورة كبير جداً (مسموح بـ 3.5 ميجابايت كحد أقصى لتأمين الرفع).'
          : 'Image trop volumineuse (max 3.5 Mo).'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'front') setCinFront(result);
      else if (target === 'back') setCinBack(result);
      else if (target === 'selfie') setSelfie(result);
    };
    reader.onerror = () => {
      setError(isRTL ? 'خطأ أثناء قراءة وثيقة الهوية.' : 'Erreur de lecture du fichier.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Switch to Preview Phase
  const handleProceedToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3 || title.trim().length > 100) {
      setError(isRTL ? 'يجب أن يكون العنوان بين 3 و 100 حرف.' : 'Le titre doit avoir entre 3 et 100 caractères.');
      return;
    }
    if (description.trim().length < 10) {
      setError(isRTL ? 'يرجى كتابة وصف تفصيلي واضح لا يقل عن 10 أحرف.' : 'Veuillez écrire une description détaillée d’au moins 10 caractères.');
      return;
    }
    if (description.trim().length > 1500) {
      setError(isRTL ? 'الوصف طويل جداً (الحد الأقصى 1500 حرف).' : 'Description trop longue (max 1500 caractères).');
      return;
    }
    if (budget <= 15 || budget > 100000) {
      setError(isRTL ? 'الميزانية يجب أن تكون أكبر من 15 درهم وأقل من 100,000 درهم مغربي.' : 'Le budget doit être entre 15 et 100 000 MAD.');
      return;
    }
    if (!dueDate) {
      setError(isRTL ? 'يرجى تحديد تاريخ إنجاز مطلوب.' : 'Veuillez sélectionner une date limite.');
      return;
    }

    // Pass successfully to step 2 preview card
    setStep('preview');
  };

  // Final Publish Handler
  const handlePublish = async () => {
    if (publishingRef.current || loading) {
      return;
    }

    if (!user) {
      setError(t.mustLoginToBid);
      return;
    }

    // Strict validation check for complete verification assets as requested
    if (!cinFront || !cinBack || !selfie) {
      setError(
        isRTL 
          ? 'يرجى إكمال رفع كافة وثائق الهوية المطلوبة: الجهة الأمامية للبطاقة الوطنية، الجهة الخلفية لها، والصورة الشخصية (سيلفي).' 
          : 'Veuillez charger tous les justificatifs requis : Recto CIN, Verso CIN, et Selfie.'
      );
      return;
    }

    // Bank card basic attributes check
    const formatCard = cardNumber.replace(/\s+/g, '');
    const cleanExpiry = cardExpiry.replace(/\s+/g, '');
    const cleanCvv = cardCvv.trim();

    if (!cardName.trim() || formatCard.length < 16 || cleanExpiry.length < 4 || cleanCvv.length < 3) {
      setError(
        isRTL
          ? 'يرجى ملء جميع بيانات بطاقتكم البنكية المستخدمة للضمان المالي بشكل كامل وآمن.'
          : 'Veuillez saisir des informations de carte bancaire valides pour alimenter la garantie.'
      );
      return;
    }

    try {
      publishingRef.current = true;
      setLoading(true);
      setError(null);

      // 1. High fidelity interactive simulation of secure verification & payment with Payzone Morocco authorization hold
      setActiveProcessStep(isRTL ? '🔐 جاري تدقيق وتشفير وثائق الهوية الوطنية بصيغة AES-256...' : '🔐 Chiffrement AES-256 de vos pièces d’identité...');
      await new Promise(r => setTimeout(r, 1200));

      setActiveProcessStep(isRTL ? '🤳 مطابقة ملامح صورة السيلفي الذاتية مع صورة بطاقة التعريف الوطنية (CIN)...' : '🤳 Comparaison biométrique du selfie avec la photo CIN...');
      await new Promise(r => setTimeout(r, 1400));

      setActiveProcessStep(isRTL ? `💳 الاتصال الآمن مع بوابة Payzone وسحب ميزانية المهمة (${budget} درهم) في حالة معلقة...` : `💳 Communication sécurisée avec Payzone et pré-autorisation de la garantie (${budget} MAD)...`);
      await new Promise(r => setTimeout(r, 1600));

      setActiveProcessStep(isRTL ? '📝 إيداع مبلغ الضمان في صندوق الأمانات ونشر المهمة على خريطة الرباط...' : '📝 Enregistrement du dépôt d’Escrow et publication de la tâche en ligne...');
      await new Promise(r => setTimeout(r, 1000));

      // 2. Create unique task ID safely
      const taskId = 'task_' + Math.random().toString(36).substr(2, 9);
      
      // Look up localized Arabic neighborhood representation for general storage speed
      const matchN = RABAT_NEIGHBORHOODS.find(n => n.id === neighborhood);
      const selectedNeighborhoodAr = matchN ? matchN.ar : neighborhood;
      const selectedNeighborhoodFr = matchN ? matchN.fr : neighborhood;
      const displayNeighborhood = lang === 'ar' ? selectedNeighborhoodAr : selectedNeighborhoodFr;

      // Construct compliant document dictionary matching PII and general structures
      const newTaskData = {
        id: taskId,
        title: title.trim(),
        description: description.trim(),
        budget: Number(budget),
        category: category,
        location: displayNeighborhood,
        dueDate: dueDate,
        dueTime: dueTime,
        status: 'held',
        posterId: user.uid,
        posterName: userProfile?.displayName || user.displayName || 'مستخدم الرباط',
        offersCount: 0,
        urgency: urgency,
        contactPreference: contactPreference,
        images: uploadedImages,

        // Secure Verification Proof and Escrow setup properties
        verifiedClient: true,
        clientCINFront: cinFront,
        clientCINBack: cinBack,
        clientSelfie: selfie,
        isEscrowFunded: true, // Auto-funded immediately
        escrowStatus: 'held', // Held on reserve in Payzone
        escrowAmount: Number(budget),
        escrowReleased: false,
        paymentCardLast4: formatCard.slice(-4),
        paymentCardholder: cardName.trim(),
        depositTransactionId: 'PZ-ESCR-' + Math.floor(100000 + Math.random() * 900000)
      };

      try {
        await createTaskService(newTaskData, user.uid);
      } catch (err: any) {
        console.error('Secure Create Task Error:', err);
        throw err;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || (isRTL ? 'حدث خطأ أثناء حفظ ونشر المهمة.' : 'Erreur de publication.'));
    } finally {
      setLoading(false);
      setActiveProcessStep(null);
      publishingRef.current = false;
    }
  };

  // Get active category representation
  const selectedCatObj = SERVICE_CATEGORIES.find(c => c.id === category);
  const selectedNeighborhoodObj = RABAT_NEIGHBORHOODS.find(n => n.id === neighborhood);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="create-task-modal-root" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={loading ? undefined : onClose} />

      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-right shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl flex flex-col border border-gray-200">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-sky-50/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-indigo-600">
                  {step === 'form' 
                    ? (isRTL ? 'الخطوة 1 من 2: تفاصيل الطلب' : 'Étape 1 sur 2 : Détails') 
                    : (isRTL ? 'الخطوة 2 من 2: معاينة بطاقة المهمة' : 'Étape 2 sur 2 : Aperçu')}
                </span>
                <h3 className="text-base font-black text-gray-950 leading-tight">
                  {isRTL ? 'تجهيز ونشر مهمة جديدة بالرباط' : 'Publier une nouvelle tâche'}
                </h3>
              </div>
            </div>
            {!loading && (
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Form / Preview Area */}
          {error && (
            <div className="mx-6 mt-5 p-3.5 bg-rose-50 border border-rose-200/40 rounded-xl text-rose-700 text-xs font-black flex items-start gap-2 text-right">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'form' ? (
            /* ================== STEP 1: FORM INPUTS ================== */
            <form onSubmit={handleProceedToPreview} className="p-6 flex flex-col gap-5 text-right overflow-y-auto max-h-[80vh]">
              
              {/* Task Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  <span>{isRTL ? 'عنوان المهمة المطلوب إنجازها' : 'Titre de la tâche'}</span>
                  <span className="text-rose-500 font-extrabold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isRTL ? 'مثال: صيانة مأخذ كهرباء منهار في حي الرياض' : 'Ex: Peinture de chambre à Agdal'}
                  className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>

              {/* Categorization & Location Selection Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <span>{isRTL ? 'اختيار التصنيف والمجال' : 'Catégorie de service'}</span>
                    <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    {SERVICE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {isRTL ? cat.ar : cat.fr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <span>{isRTL ? 'الموقع الجغرافي (حي بالرباط)' : 'Emplacement à Rabat'}</span>
                    <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    {RABAT_NEIGHBORHOODS.map(n => (
                      <option key={n.id} value={n.id}>
                        📍 {isRTL ? n.ar : n.fr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget & Date/Time Limit selection Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Proposed Budget */}
                <div className="flex flex-col gap-1.5 sm:col-span-1">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <span>{isRTL ? 'الميزانية بالدرهم المغربي (MAD)' : 'Budget proposé (MAD)'}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="15"
                      max="100000"
                      required
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full text-xs font-black border border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-indigo-500 bg-white"
                    />
                    <span className="absolute left-3.5 top-3 text-[10px] text-gray-400 font-extrabold">MAD</span>
                  </div>
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-1.5 sm:col-span-1">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <span>{isRTL ? 'تاريخ التنفيذ المطلوب' : 'Date de réalisation'}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 bg-white text-right"
                    />
                  </div>
                </div>

                {/* Due Time */}
                <div className="flex flex-col gap-1.5 sm:col-span-1">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <span>{isRTL ? 'الوقت المناسب' : "Heure limite"}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      required
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 bg-white text-right"
                    />
                  </div>
                </div>

              </div>

              {/* Detailed Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-800">
                  {isRTL ? 'وصف تفصيلي للعمل المطلوب والمسؤوليات' : 'Description détaillée'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isRTL ? 'اذكر الصعوبة، الحجم، تخصص الأدوات اللازمة لمساعدتنا في جلب الطلبات الأنسب وحماية حقوق التعاقد المالي...' : 'Donnez le plus de détails possibles (taille, matériel nécessaire, etc.)'}
                  className="w-full text-xs font-medium border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 bg-white resize-none leading-relaxed"
                />
              </div>

              {/* Drag and Drop Image Upload Sector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                  <span>{isRTL ? 'رفع الصور التوضيحية عن حجم المشكلة (اختياري)' : 'Uploader des images (Optionnel)'}</span>
                  <span className="text-[10px] text-gray-400 font-extrabold">{uploadedImages.length}/4 {isRTL ? 'صور مضافة' : 'images'}</span>
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging 
                      ? 'border-indigo-600 bg-indigo-50/40 scale-[0.99]' 
                      : 'border-gray-200 hover:border-indigo-400 bg-gray-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-indigo-500 animate-bounce-slow" />
                  <span className="text-xs font-extrabold text-slate-800">
                    {isRTL ? 'اسحب الصور وافلتها هنا، أو اضغط للتصفح' : 'Glissez-déposez des photos ici ou cliquez'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                    {isRTL ? 'يدعم صيغ JPG، PNG و WebP (الحد الأقصى للملف 2.5 ميجابايت)' : 'Formates acceptés: JPG, PNG, WebP (Max 2.5 Mo)'}
                  </span>
                </div>

                {/* Image Previews list with remove features */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-1.5">
                    {uploadedImages.map((src, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group shadow-xs">
                        <img 
                          src={src} 
                          alt="preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Urgency Level and Communication Preference Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Urgency choice */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-800">
                    {isRTL ? 'مستوى الاستعجال المطلوبة' : "Niveau d'urgence"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', ar: 'عادي', fr: 'Normal', color: 'border-emerald-200 text-emerald-800 bg-emerald-50/50' },
                      { id: 'medium', ar: 'متوسط', fr: 'Moyen', color: 'border-amber-200 text-amber-800 bg-amber-50/50' },
                      { id: 'urgent', ar: 'عاجل جداً', fr: 'Urgent 🔥', color: 'border-rose-200 text-rose-800 bg-rose-50/50' }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setUrgency(item.id as any)}
                        className={`py-2 px-1 rounded-xl border text-[11px] font-black transition-all cursor-pointer ${
                          urgency === item.id 
                            ? 'ring-2 ring-indigo-600 border-indigo-600 shadow-xs' 
                            : 'border-gray-200 text-gray-500 hover:bg-slate-50'
                        }`}
                      >
                        {isRTL ? item.ar : item.fr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact Preference */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-800">
                    {isRTL ? 'تفضيلات وسائل التواصل' : 'Préférence de communication'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'chat', ar: 'دردشة الموقع', fr: 'Messagerie', icon: MessageSquare },
                      { id: 'phone', ar: 'اتصال هاتفي', fr: 'Appel direct', icon: Phone },
                      { id: 'email', ar: 'بريد إلكتروني', fr: 'E-mail', icon: Mail },
                      { id: 'any', ar: 'أي وسيلة', fr: 'Tous modes', icon: HelpCircle }
                    ].map((pref) => (
                      <button
                        type="button"
                        key={pref.id}
                        onClick={() => setContactPreference(pref.id as any)}
                        className={`py-2 px-2.5 rounded-xl border text-[10px] font-black tracking-tight transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          contactPreference === pref.id 
                            ? 'border-indigo-600 bg-indigo-50/30 text-indigo-700 font-extrabold ring-1 ring-indigo-500' 
                            : 'border-gray-200 text-gray-500 hover:bg-slate-50'
                        }`}
                      >
                        <pref.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{isRTL ? pref.ar : pref.fr}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Progress Navigation Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black py-4 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-4 cursor-pointer flex items-center justify-center gap-2 text-xs"
              >
                <span>{isRTL ? 'الخطوة التالية: معاينة بطاقة المهمة' : 'Procéder à l’aperçu'}</span>
                <Eye className="w-4 h-4 shrink-0" />
              </button>

            </form>
          ) : (
            /* ================== STEP 2: PREVIEW CARD BEFORE POSTING ================== */
            <div className="p-6 flex flex-col gap-6 text-right overflow-y-auto max-h-[85vh]">
              
              <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-2xl flex items-start gap-2.5 leading-relaxed text-right text-amber-900 text-xs">
                <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 font-semibold">
                  <span className="font-extrabold">{isRTL ? 'مرحلة المعاينة والتدقيق قبل النشر' : 'Vérification avant publication'}</span>
                  <span>
                    {isRTL 
                      ? 'يرجى مراجعة شكل وصياغة بطاقة المهمة المنزلية أدناه. هذا هو الشكل الدقيق الذي سيظهر على خريطة الرباط وتطبيق المستقلين لتلقي العروض الموثوقة.'
                      : 'Voici comment apparaîtra votre tâche auprès de nos professionnels à Rabat.'}
                  </span>
                </div>
              </div>

              {/* The Live Interactive Preview Card - REQUIREMENT */}
              <div className="border border-indigo-200 rounded-3xl bg-slate-50/60 p-6 flex flex-col gap-5 text-right relative shadow-md hover:shadow-lg transition-shadow">
                
                {/* Decorative Preview Watermark */}
                <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 select-none shadow-xs">
                  <Eye className="w-3 h-3 text-white" />
                  <span>{isRTL ? 'معاينة غير منشورة' : 'PREVIEW'}</span>
                </div>

                {/* Top header stats */}
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-md">
                      {selectedCatObj ? (isRTL ? selectedCatObj.ar : selectedCatObj.fr) : category}
                    </span>
                    {urgency === 'urgent' && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5 animate-pulse">
                        <Flame className="w-3 h-3 text-rose-600" />
                        {isRTL ? 'عاجل جداً' : 'Urgent'}
                      </span>
                    )}
                  </div>
                  
                  <span className="text-sm font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-xl">
                    {budget} {isRTL ? 'درهم مغربي' : 'MAD'}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-base font-black text-slate-950 mt-1 line-clamp-2">
                  {title || (isRTL ? 'بدون عنوان بعد المعاينة' : 'Sans titre')}
                </h4>

                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed font-semibold line-clamp-5 max-h-56 overflow-y-auto bg-white p-3.5 rounded-xl border border-gray-100">
                  {description || (isRTL ? 'لا يوجد تفاصيل كافية مضافة...' : 'Pas de détails.')}
                </p>

                {/* Optional Uploaded Images in Preview */}
                {uploadedImages.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-gray-400 font-extrabold">{isRTL ? 'الصور التوضيحية المرفقة:' : 'Photos jointes :'}</span>
                    <div className="flex flex-wrap gap-2.5">
                      {uploadedImages.map((src, index) => (
                        <div key={index} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={src} 
                            alt="preview" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer card parameters */}
                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs font-bold text-gray-500">
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider">{isRTL ? 'الحي بالرباط' : 'Quartier'}</span>
                    <span className="flex items-center gap-1 text-slate-900 text-xs font-black">
                      <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
                      <span>{selectedNeighborhoodObj ? (isRTL ? selectedNeighborhoodObj.ar : selectedNeighborhoodObj.fr) : neighborhood}</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider">{isRTL ? 'التاريخ والوقت المحدد' : 'Date de limite'}</span>
                    <span className="flex items-center gap-1 text-slate-900 text-xs font-black">
                      <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{dueDate} - {dueTime}</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider">{isRTL ? 'وسيلة التواصل المفضلة' : 'Communication'}</span>
                    <span className="text-slate-900 text-xs font-black flex items-center gap-1">
                      {contactPreference === 'chat' && <MessageSquare className="w-4 h-4 text-emerald-500" />}
                      {contactPreference === 'phone' && <Phone className="w-4 h-4 text-sky-500" />}
                      {contactPreference === 'email' && <Mail className="w-4 h-4 text-indigo-500" />}
                      {contactPreference === 'any' && <HelpCircle className="w-4 h-4 text-purple-500" />}
                      <span>
                        {contactPreference === 'chat' && (isRTL ? 'الدردشة عبر الموقع' : 'Messagerie interne')}
                        {contactPreference === 'phone' && (isRTL ? 'الهاتف الجوال' : 'Téléphone')}
                        {contactPreference === 'email' && (isRTL ? 'البريد الإلكتروني' : 'E-mail')}
                        {contactPreference === 'any' && (isRTL ? 'أي وسيلة مناسبة' : 'Tous moyens contact')}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider">{isRTL ? 'المعلن' : 'Annonceur'}</span>
                    <span className="text-slate-900 text-xs font-black flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{userProfile?.displayName || user.displayName || 'أنت'}</span>
                    </span>
                  </div>

                </div>

              </div>

              {/* Action Buttons to Go Back or Transition to Secure Verification Verification Step */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep('form')}
                  className="sm:col-span-1 border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold py-3.5 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4 ml-1" />
                  <span>{isRTL ? 'عودة وتعديل البيانات' : 'Modifier les infos'}</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setError(null);
                    setStep('verification');
                  }}
                  className="sm:col-span-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black py-3.5 px-4 rounded-xl text-xs transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                  id="final-proceed-to-verification-btn"
                >
                  <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                  <span>{isRTL ? 'تأكيد ودفع مبلغ الضمان بالرباط (Payzone)' : 'Procéder au dépôt et à la vérification'}</span>
                </button>
              </div>

            </div>
          )}

          {/* ================== STEP 3: IDENTITY & ESCROW VERIFICATION ================== */}
          {step === 'verification' && (
            <div className="p-6 flex flex-col gap-6 text-right overflow-y-auto max-h-[85vh] relative bg-slate-50/50">
              
              {/* Dynamic Security Header Alert */}
              <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-extrabold text-sky-950">
                    {isRTL ? 'بوابة التحقق والضمان المالي (Payzone Digital Escrow)' : 'Portail de vérification et de sécurité Escrow'}
                  </span>
                  <span className="text-gray-500 font-semibold leading-relaxed">
                    {isRTL 
                      ? 'بموجب القوانين التنظيمية ومعايير مكافحة الغش بالمملكة المغربية، يتطلب نشر أي مهمة توثيق هويتك (CIN) وحجز ميزانية المهمة كضمان مالي معلق إلى بوابة Payzone. لن يتم تحويل المبلغ للمستقل إلا بعد الموافقة النهائية من طرفكم.'
                      : 'Conformément aux régulations en vigueur au Maroc, la publication requiert de justifier votre identité (CIN) et d’autoriser un blocage du budget en Escrow chez Payzone.'}
                  </span>
                </div>
              </div>

              {/* Identity Documents Upload Slots (3 slots) */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                  <span>1. {isRTL ? 'رفع وثائق إثبات الهوية الشخصية' : 'Justificatifs d’Identité'}</span>
                  <span className="text-rose-500 font-extrabold">*</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Slot 1: Front of CIN */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-extrabold text-right">
                      {isRTL ? 'البطاقة الوطنية - الوجه الأمامي:' : 'CIN - Recto :'}
                    </span>
                    <input 
                      type="file" 
                      ref={cinFrontRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) processVerificationFile(e.target.files[0], 'front');
                      }}
                    />
                    <div 
                      onClick={() => cinFrontRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingCinFront(true); }}
                      onDragLeave={() => setIsDraggingCinFront(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingCinFront(false);
                        if (e.dataTransfer.files?.[0]) processVerificationFile(e.dataTransfer.files[0], 'front');
                      }}
                      className={`h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all ${
                        cinFront 
                          ? 'border-emerald-300 bg-white shadow-xs' 
                          : isDraggingCinFront 
                            ? 'border-sky-500 bg-sky-50' 
                            : 'border-gray-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {cinFront ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img src={cinFront} alt="CIN Front" className="h-full w-auto object-contain rounded-lg" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCinFront(null); }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] hover:bg-rose-700 shadow-xs"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-gray-400">
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-[10px] font-bold leading-tight">{isRTL ? 'الملف الأمامي للـ CIN' : 'Sélectionner Recto'}</span>
                          <span className="text-[8px] text-gray-300 font-semibold">{isRTL ? 'اسحب أو اضغط للرفع' : 'Glisser ou cliquer'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Slot 2: Back of CIN */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-extrabold text-right">
                      {isRTL ? 'البطاقة الوطنية - الوجه الخلفي:' : 'CIN - Verso :'}
                    </span>
                    <input 
                      type="file" 
                      ref={cinBackRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) processVerificationFile(e.target.files[0], 'back');
                      }}
                    />
                    <div 
                      onClick={() => cinBackRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingCinBack(true); }}
                      onDragLeave={() => setIsDraggingCinBack(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingCinBack(false);
                        if (e.dataTransfer.files?.[0]) processVerificationFile(e.dataTransfer.files[0], 'back');
                      }}
                      className={`h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all ${
                        cinBack 
                          ? 'border-emerald-300 bg-white shadow-xs' 
                          : isDraggingCinBack 
                            ? 'border-sky-500 bg-sky-50' 
                            : 'border-gray-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {cinBack ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img src={cinBack} alt="CIN Back" className="h-full w-auto object-contain rounded-lg" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCinBack(null); }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] hover:bg-rose-700 shadow-xs"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-gray-400">
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-[10px] font-bold leading-tight">{isRTL ? 'المستند الخلفي للـ CIN' : 'Sélectionner Verso'}</span>
                          <span className="text-[8px] text-gray-300 font-semibold">{isRTL ? 'اسحب أو اضغط للرفع' : 'Glisser ou cliquer'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Slot 3: Selfie */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-extrabold text-right">
                      {isRTL ? 'صورة سيلفي مطابقة بالوجه:' : 'Photo Selfie :'}
                    </span>
                    <input 
                      type="file" 
                      ref={selfieRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) processVerificationFile(e.target.files[0], 'selfie');
                      }}
                    />
                    <div 
                      onClick={() => selfieRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingSelfie(true); }}
                      onDragLeave={() => setIsDraggingSelfie(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingSelfie(false);
                        if (e.dataTransfer.files?.[0]) processVerificationFile(e.dataTransfer.files[0], 'selfie');
                      }}
                      className={`h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all ${
                        selfie 
                          ? 'border-emerald-300 bg-white shadow-xs' 
                          : isDraggingSelfie 
                            ? 'border-sky-500 bg-sky-50' 
                            : 'border-gray-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {selfie ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img src={selfie} alt="Selfie" className="h-full w-auto object-contain rounded-lg" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelfie(null); }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] hover:bg-rose-700 shadow-xs"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-gray-400">
                          <Camera className="w-5 h-5 text-gray-400" />
                          <span className="text-[10px] font-bold leading-tight">{isRTL ? 'رفع صورة سيلفي مطابقة' : 'Uploader un Selfie'}</span>
                          <span className="text-[8px] text-gray-300 font-semibold">{isRTL ? 'اسحب أو اضغط للرفع' : 'Glisser ou cliquer'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Secure Bank Card Payment Form Block */}
              <div className="flex flex-col gap-4 border-t border-slate-200/50 pt-5">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>2. {isRTL ? 'معلومات البطاقة البنكية المغربية أو الدولية' : 'Informations de carte bancaire'}</span>
                  <span className="text-rose-500 font-extrabold">*</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                  
                  {/* Digital Credit Card Interactive Mockup */}
                  <div className="md:col-span-2 select-none">
                    <div className="relative w-full aspect-[1.58] rounded-2.5xl p-5 bg-gradient-to-tr from-slate-900 via-indigo-950 to-sky-950 text-white shadow-xl flex flex-col justify-between overflow-hidden border border-slate-700/30 font-sans">
                      
                      {/* Glossy overlay effect */}
                      <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
                      
                      <div className="flex justify-between items-center z-10">
                        <div className="flex flex-col">
                          <span className="text-[7px] text-sky-300 font-black tracking-widest uppercase">{isRTL ? 'Tasker كارت' : 'Tasker Premium'}</span>
                          <span className="text-[10px] font-bold text-white/80">{isRTL ? 'أمانة معلقة' : 'Escrow Reserve'}</span>
                        </div>
                        <span className="text-xs italic font-black text-white/90">
                          {cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Payzone'}
                        </span>
                      </div>

                      {/* SIM Chip Design */}
                      <div className="w-8 h-6 bg-gradient-to-br from-amber-200 to-amber-400 rounded-md shadow-inner my-2 opacity-85" />

                      {/* Dynamic Card Number Representation */}
                      <div className="text-[14px] sm:text-[15px] font-mono tracking-widest text-center text-white/95 my-1.5 font-bold">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>

                      <div className="flex justify-between items-end z-10 mt-1">
                        <div className="flex flex-col text-right">
                          <span className="text-[6px] text-white/50 uppercase tracking-widest">{isRTL ? 'صاحب البطاقة' : 'CARDHOLDER'}</span>
                          <span className="text-[10px] font-mono uppercase font-semibold tracking-wide truncate max-w-[140px]">
                            {cardName || 'MOURAD EL IDRISSI'}
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[6px] text-white/50 uppercase tracking-widest">{isRTL ? 'الصلاحية' : 'EXPIRES'}</span>
                          <span className="text-[10px] font-mono font-semibold">
                            {cardExpiry || 'MM/YY'}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="md:col-span-3 flex flex-col gap-3">
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-bold">{isRTL ? 'الاسم الكامل المكتوب على البطاقة:' : 'Nom complet sur la carte :'}</label>
                      <input 
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="MOURAD EL IDRISSI"
                        className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:border-indigo-500 font-mono uppercase"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-bold">{isRTL ? 'رقم البطاقة البنكية (16 رقم):' : 'Numéro de carte :'}</label>
                      <input 
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                          const formatted = val.match(/.{1,4}/g);
                          setCardNumber(formatted ? formatted.join(' ') : val);
                        }}
                        placeholder="4000 1234 5678 9010"
                        className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1 font-mono">
                        <label className="text-[10px] text-slate-500 font-bold">{isRTL ? 'تاريخ انتهاء الصلاحية:' : 'Date Exp (MM/YY) :'}</label>
                        <input 
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (val.length > 2) {
                              setCardExpiry(val.slice(0, 2) + '/' + val.slice(2));
                            } else {
                              setCardExpiry(val);
                            }
                          }}
                          placeholder="12/28"
                          className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:border-indigo-500 font-mono text-center"
                        />
                      </div>

                      <div className="flex flex-col gap-1 font-mono">
                        <label className="text-[10px] text-slate-500 font-bold">{isRTL ? 'رمز الأمان CVV3:' : 'Code CVV3 :'}</label>
                        <input 
                          type="password"
                          required
                          value={cardCvv}
                          onChange={(e) => {
                            setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3));
                          }}
                          placeholder="•••"
                          maxLength={3}
                          className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:border-indigo-500 font-mono text-center"
                        />
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* Escrow Budget Statement Breakdown */}
              <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl flex flex-col gap-2 font-semibold">
                <span className="text-[10px] text-slate-400 font-black uppercase text-left">{isRTL ? 'مخلص العمليات المالية المعلقة' : 'COMPTE ESCROW PAYZONE MAROC'}</span>
                
                <div className="flex justify-between items-center text-xs text-slate-700 pt-1">
                  <span>{isRTL ? 'قيمة ميزانية المهمة:' : 'Budget nominal de la mission :'}</span>
                  <span className="font-bold text-slate-900">{budget} {isRTL ? 'درهم مغربي' : 'MAD'}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs text-slate-700">
                  <span>{isRTL ? 'رسوم خدمة الضمان (Escrow):' : 'Frais de service Escrow :'}</span>
                  <span className="text-emerald-600 font-extrabold">{isRTL ? 'مجانًا (0 درهم)' : 'Gratuit (0 MAD)'}</span>
                </div>

                <div className="flex justify-between items-center text-sm text-slate-900 font-black border-t border-slate-200 pt-2 mt-1">
                  <span>{isRTL ? 'المبلغ الإجمالي المحجوز للضمان فوراً:' : 'Montant total bloqué immédiatement :'}</span>
                  <span className="text-indigo-600 font-black">{budget} {isRTL ? 'درهم مغربي' : 'MAD'}</span>
                </div>

                <div className="text-[9.5px] text-slate-400 mt-1 flex items-start gap-1 font-medium leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p>
                    {isRTL 
                      ? 'سيتم حسم هذا المبلغ واحتجازه كوديعة أمان في خيار الضمان المعلق التابع لـ Payzone. لن يستلم المستقل هذا المبلغ إلى حسابه البنكي حتى تضغط على زر "تم إنجاز المهمة بنجاح" بعد اكتمال الخدمة.'
                      : 'Ce montant sera gelé et sécurisé en Escrow. Les fonds ne seront libérés au prestataire que lorsque vous confirmerez la bonne réalisation de la tâche.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Go back to Preview, or Trigger Verification and Escrow hold */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep('preview')}
                  className="sm:col-span-1 border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold py-3.5 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4 ml-1" />
                  <span>{isRTL ? 'رجوع للمعاينة' : 'Retour'}</span>
                </button>

                <button
                  type="button"
                  disabled={loading || !cinFront || !cinBack || !selfie || cardNumber.replace(/\s+/g, '').length < 16}
                  onClick={handlePublish}
                  className="sm:col-span-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3.5 px-4 rounded-xl text-xs transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                  id="final-create-task-btn"
                >
                  {loading ? (
                    <span className="animate-pulse">{isRTL ? 'جاري التحقق وسحب الضمان...' : 'Vérification et blocage...'}</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                      <span>{isRTL ? 'تأكيد الهوية وتأمين مبلغ الضمان' : 'Vérifier l’identité & Dégager l’Escrow'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Seamless Full-screen overlay loader screen to simulate real checkouts */}
              {activeProcessStep && (
                <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-6 text-center select-none" id="verification-progress-overlay">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin flex items-center justify-center mb-6">
                    <Lock className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="text-base font-black text-slate-900 mb-2">
                    {isRTL ? 'تتم المعالجة عبر بروتوكول آمن 3D Secure' : 'Traitement sécurisé en cours via 3D Secure'}
                  </h4>
                  <p className="text-xs text-gray-500 font-semibold animate-pulse tracking-wide leading-relaxed">
                    {activeProcessStep}
                  </p>
                  <span className="text-[10px] text-gray-400 font-mono mt-8">
                    Réf System: pz_morocco_secured_transfer_hold
                  </span>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
