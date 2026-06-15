import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Info,
  DollarSign,
  Smartphone,
  Sparkles,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { LanguageKey, TRANSLATIONS } from '../data/rabatData';
import { doc, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import FintechLogo from './FintechLogo';

interface PayzonePaymentProps {
  amount: number; // in MAD (Dirham)
  paymentType: 'escrow' | 'badge'; 
  taskId?: string; // If escrow funding
  userUid: string;
  userEmail: string;
  lang: LanguageKey;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
}

export default function PayzonePayment({
  amount,
  paymentType,
  taskId,
  userUid,
  userEmail,
  lang,
  onClose,
  onSuccess
}: PayzonePaymentProps) {
  const isRTL = lang === 'ar';
  const t = TRANSLATIONS[lang];

  // Steps
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Order Recap, 2: Card Entry, 3: 3DS OTP, 4: Success
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Payload loaded from Backend Secure Hashing Endpoint `/api/payzone/initiate`
  const [merchantId, setMerchantId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [signature, setSignature] = useState('');
  const [description, setDescription] = useState('');

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // OTP SMS code
  const [otp, setOtp] = useState('');

  // Fetch security parameters from server
  useEffect(() => {
    const fetchInitCredentials = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        const res = await fetch('/api/payzone/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            taskId: taskId || 'USER_BADGE',
            email: userEmail || 'guest@gmail.com',
            userUid,
            paymentType
          })
        });
        
        if (!res.ok) {
          throw new Error('Failed to communicate with Payzone secure gateway.');
        }

        const data = await res.json();
        if (data.success) {
          setMerchantId(data.merchantId);
          setTransactionId(data.transactionId);
          setSignature(data.signature);
          setDescription(data.description);
        } else {
          throw new Error(data.error || 'Initiate failed');
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg(isRTL ? 'فشل الاتصال بالخادم الذكي لتوليد توقيع تشفير Payzone.' : 'Échec de la connexion sécurisée.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitCredentials();
  }, [amount, taskId, userEmail, userUid, paymentType]);

  // Card Formatters
  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(cleaned);
    }
  };

  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (cleaned.length >= 2) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  // Submit Payment Information
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 16) {
      setErrorMsg(isRTL ? 'يرجى إدخال رقم بطاقة بنكية مغربية صحيح ومكون من 16 رقماُ.' : 'V2.0 Le numéro de carte est invalide.');
      return;
    }
    if (!cardHolder.trim()) {
      setErrorMsg(isRTL ? 'يرجى كتابة الاسم الكامل المطبوع على البطاقة.' : 'Nom requis.');
      return;
    }
    if (cardExpiry.length < 5) {
      setErrorMsg(isRTL ? 'الرجاء إدخال تاريخ انتهاء صلاحية صحيح (MM/YY).' : 'Date invalide.');
      return;
    }
    if (cardCvv.length < 3) {
      setErrorMsg(isRTL ? 'يرجى كتابة رمز التحقق CVV.' : 'CVV invalide.');
      return;
    }

    setLoading(true);
    // Simulate Gateway validation and jump to 3DS authentication (typical in Morocco)
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  // 3D Secure OTP verification
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setErrorMsg(isRTL ? 'الرجاء إدخال رمز التحقق المؤقت بشكل صحيح.' : 'Entrez le code OTP reçu.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      // Perform transaction updates on Firestore
      if (paymentType === 'badge') {
        const userRef = doc(db, 'users', userUid);
        await updateDoc(userRef, {
          isVerifiedTasker: true,
          isPremium: true,
          badgeUnlockedAt: serverTimestamp()
        });
      } else if (paymentType === 'escrow' && taskId) {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
          isEscrowFunded: true,
          escrowStatus: 'funded',
          depositTransactionId: transactionId,
          fundedAmount: amount,
          fundedAt: serverTimestamp()
        });
      }

      // Record transaction reference log
      const transId = transactionId || `TX_MOCK_PAYZONE_${Date.now()}`;
      await setDoc(doc(db, 'transactions', transId), {
        id: transId,
        userUid,
        userEmail,
        amount,
        paymentType,
        taskId: taskId || null,
        merchantId: merchantId || '881293',
        status: 'SUCCESS',
        gateway: 'PAYZONE_MOROCCO',
        currency: 'MAD',
        signature,
        createdAt: serverTimestamp()
      });

      setLoading(false);
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(isRTL ? 'فشل توثيق الدفع في قاعدة بيانات فيربيز.' : 'Erreur lors du traitement final.');
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onSuccess(transactionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-55 overflow-y-auto" id="payzone-portal-modal" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all sm:my-8 w-full max-w-md border border-slate-100 flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-500/5 to-amber-500/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FintechLogo size="sm" showText={false} className="shrink-0" id="fintech-header-icon" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black uppercase bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent tracking-wider">
                  {isRTL ? 'بوابة الدفع الآمن الممتازة' : 'CrediZone Escrow Secure'}
                </span>
                <h3 className="text-sm font-black text-gray-900 leading-none mt-1">
                  CrediZone Gateway
                </h3>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Payment Method Badges Row */}
            <div className="flex items-center justify-center gap-4 bg-slate-50 py-2.5 rounded-2xl border border-gray-150/50">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                alt="Mastercard"
                className="h-6 object-contain"
              />
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
                alt="Visa"
                className="h-4 object-contain"
              />
              <span className="text-[10px] bg-sky-100 font-extrabold text-sky-700 px-2.5 py-1 rounded-lg">
                CMI VERIFIED
              </span>
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: PAYMENT RECAP & CHECKSUM READY */}
            {step === 1 && (
              <div className="flex flex-col gap-4 text-center lg:text-right">
                <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-gray-500">{isRTL ? 'نوع المعاملة:' : 'Type de service:'}</span>
                    <span className="text-xs font-bold text-slate-800">
                      {paymentType === 'badge' 
                        ? (isRTL ? 'توثيق الحساب بالرباط وزيادة الرؤية' : 'Badge Vérification Rabat') 
                        : (isRTL ? 'تأمين ميزانية العمل بالضمان' : 'Dépôt de garantie client')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-gray-500">{isRTL ? 'معرف التاجر بالمنصة:' : 'ID Marchand Payzone:'}</span>
                    <span className="text-xs font-mono font-bold text-slate-700">{merchantId || '...'}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-gray-500">{isRTL ? 'معرف العملية (فريد):' : 'ID Transaction:'}</span>
                    <span className="text-xs font-mono font-bold text-sky-700">{transactionId || '...'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-black text-gray-800">{isRTL ? 'المبلغ الإجمالي للدفع:' : 'Total à régler :'}</span>
                    <span className="text-lg font-black text-emerald-600 font-mono">
                      {amount} {isRTL ? 'درهم مغربي' : 'MAD'}
                    </span>
                  </div>
                </div>

                {signature && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col text-right">
                      <span className="text-[11px] font-black text-emerald-950">{isRTL ? 'توقيع تشفير معتمد' : 'Signature SHA-512 Générée'}</span>
                      <span className="text-[9px] font-mono text-emerald-700 mt-1 line-clamp-1">{signature}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  disabled={loading || !signature}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{isRTL ? 'متابعة الدفع بالبطاقة البنكية' : 'Payer par carte bancaire'}</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}

            {/* STEP 2: BANK CARD ENTRY INPUTS */}
            {step === 2 && (
              <form onSubmit={handleCardSubmit} className="flex flex-col gap-4">
                
                {/* Cardholder Name */}
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-xs font-bold text-gray-700">
                    {isRTL ? 'اسم حامل البطاقة (باللاتينية)' : 'Nom complet sur la carte'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. DRISSI EL ALAMI"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Card Number */}
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-xs font-bold text-gray-700">
                    {isRTL ? 'رقم البطاقة (16 رقماً)' : 'Numéro de carte bancaire'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl px-4 py-3.5 pl-10 focus:outline-none focus:border-sky-500 text-left"
                    />
                    <CreditCard className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
                  </div>
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 text-right">
                    <label className="text-xs font-bold text-gray-700">
                      {isRTL ? 'تاريخ الانتهاء' : 'Date d’expiration'}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl px-4 py-3.5 text-center focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-right">
                    <label className="text-xs font-bold text-gray-700">
                      CVC / CVV
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs font-mono border border-gray-200 rounded-xl px-4 py-3.5 text-center focus:outline-none focus:border-sky-500"
                      />
                      <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Secure info tag */}
                <span className="text-[10px] text-gray-400 bg-slate-50 p-2 rounded-xl text-center flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  {isRTL 
                    ? 'اتصال مشفر آمن بدرجة عسكرية PCI-DSS. لا نقوم بتخزين تفاصيل بطاقتك.' 
                    : 'Paiement hautement sécurisé crypté de bout en bout.'}
                </span>

                {/* Back and submit row */}
                <div className="grid grid-cols-12 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="col-span-4 border border-gray-200 hover:bg-slate-50 hover:border-gray-300 text-gray-700 font-bold py-3 px-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    {isRTL ? 'تراجع' : 'Retour'}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="col-span-8 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md cursor-pointer text-center disabled:opacity-50"
                  >
                    {loading ? (isRTL ? 'جاري التحقق...' : 'Vérification...') : (isRTL ? 'أرسل الطلب الآمن' : 'Valider le paiement')}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: 3D SECURE OTP CODE POPUP (SIMULATOR FOR MOROCCAN WEB IN ACTION) */}
            {step === 3 && (
              <form onSubmit={handleOtpVerify} className="flex flex-col gap-4 text-center lg:text-right">
                <div className="p-3 bg-sky-50 text-sky-800 text-[11px] leading-relaxed font-bold rounded-xl flex items-start gap-2 border border-sky-100">
                  <Smartphone className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <p>
                    {isRTL 
                      ? 'تم إرسال رمز أمان مؤقت (OTP) إلى الهاتف المرتبط ببطاقتك لتأكيد المعاملة المالية عبر خادم Centre Monétique Interbancaire.' 
                      : 'Un SMS de sécurité CMI a été envoyé à votre mobile pour authentifier votre transaction.'}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 block text-center lg:text-right">
                    {isRTL ? 'أدخل رمز الأمان المؤقت (6 أرقام):' : 'Code de sécurité reçu :'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-widest font-mono text-sm font-black border border-gray-200 rounded-xl py-3.5 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  {loading ? (isRTL ? 'جاري تأكيد المعاملة...' : 'Authentification...') : (isRTL ? 'تأكيد ودفع ' : 'Confirmer le débit')}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-gray-400 font-bold hover:text-gray-600 underline cursor-pointer"
                >
                  {isRTL ? 'الخطوة السابقة' : 'Retour à la saisie de carte'}
                </button>
              </form>
            )}

            {/* STEP 4: SUCCESS WITH BEAUTIFUL CONGRATULATIONS AND SOUND SIMULATION */}
            {step === 4 && (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-black text-gray-900">
                    {isRTL ? 'تم تأكيد عملية الدفع بنجاح!' : 'Paiement validé avec succès !'}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-semibold px-4">
                    {paymentType === 'badge'
                      ? (isRTL ? 'تهانينا! تم تفعيل شارة التوثيق الاحترافي الأخضر لحسابك بنجاح بالرباط.' : 'Votre badge professionnel a été déverrouillé avec succès.')
                      : (isRTL ? 'تم إيداع مبلغ الضمان في صندوق الأمانات بنجاح، وستتحول المهمة للبدء فوراً.' : 'L’escrow pour la tâche a été crédité avec succès.')}
                  </p>
                </div>

                <div className="bg-slate-50 border border-gray-150-300 w-full rounded-2xl p-3.5 mt-2 text-xs font-semibold flex flex-col gap-1.5 text-right font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{isRTL ? 'المستلم:' : 'Marchand:'}</span>
                    <span className="text-slate-800 font-bold">Tasker Morocco</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{isRTL ? 'المرجع البنكي:' : 'Id Payzone:'}</span>
                    <span className="text-slate-850 font-bold text-[10px]">{transactionId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{isRTL ? 'المبلغ المقتطع:' : 'Montant:'}</span>
                    <span className="text-emerald-600 font-black">{amount} MAD</span>
                  </div>
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors shadow-md mt-2 cursor-pointer"
                >
                  {isRTL ? 'إنهاء وإغلاق البوابة' : 'Retourner à la plateforme'}
                </button>
              </div>
            )}

          </div>

          {/* Footer Security Badging */}
          <div className="px-6 py-4.5 border-t border-gray-100 bg-slate-50/50 flex items-center justify-between text-[10px] text-gray-400">
            <span className="flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
              {isRTL ? 'معاملة مالية مرخصة بالكامل للرباط' : 'Agrée CMI / Payzone'}
            </span>
            <span className="font-mono font-extrabold">SSL SECURE 256bit</span>
          </div>

        </div>
      </div>
    </div>
  );
}
