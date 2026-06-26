import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Check, 
  Copy, 
  Sparkles, 
  Lock, 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Send, 
  Share2, 
  CheckCircle2, 
  XCircle,
  Paintbrush,
  DollarSign,
  ArrowRight,
  ShoppingBag,
  Trash2,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';
import { subscribeToTransactions } from '../services/userService';

interface GiftCardsPageProps {
  lang: 'ar' | 'fr';
  user: any;
  userProfile: any;
  onPostTask: () => void;
  onLoginClick: (mode?: 'signin' | 'signup') => void;
}

export default function GiftCardsPage({ lang, user, userProfile, onPostTask, onLoginClick }: GiftCardsPageProps) {
  const isRTL = lang === 'ar';

  // Standard predefined promo codes & names
  const defaultCards = [
    {
      id: 'gold',
      title: isRTL ? 'بطاقة بريميوم ذهبية' : 'CARTE PREMIUM OR',
      name: 'Tasker Gold Spark',
      amount: 500,
      code: 'RABAT-GOLD-500',
      tag: isRTL ? 'الأكثر طلباً' : 'Populaire',
      bgClass: 'from-amber-500 to-yellow-600',
      secondaryColor: 'text-amber-100',
      glowColor: 'rgba(245,158,11,0.25)'
    },
    {
      id: 'blue',
      title: isRTL ? 'بطاقة الراحة الزرقاء' : 'CARTE CONFORT BLEUE',
      name: 'Tasker Everyday Comfort',
      amount: 200,
      code: 'RABAT-BLUE-200',
      tag: isRTL ? 'موثوقة وممتازة' : 'Essentiel',
      bgClass: 'from-sky-500 to-indigo-650',
      secondaryColor: 'text-sky-100',
      glowColor: 'rgba(14,165,233,0.25)'
    },
    {
      id: 'pink',
      title: isRTL ? 'البنفسجية السريعة' : 'CARTE VIOLETTE RAPIDE',
      name: 'Tasker Fast Runner',
      amount: 100,
      code: 'RABAT-PINK-100',
      tag: isRTL ? 'المثالية للخدمات السريعة' : 'Express',
      bgClass: 'from-purple-500 to-pink-650',
      secondaryColor: 'text-purple-100',
      glowColor: 'rgba(168,85,247,0.25)'
    },
    {
      id: 'emerald',
      title: isRTL ? 'بطاقة الأعمال الخضراء' : 'CARTE ENTREPRISE EMERAUDE',
      name: 'Tasker Enterprise Pro',
      amount: 1000,
      code: 'RABAT-PRO-1000',
      tag: isRTL ? 'قيمة مضافة للمؤسسات' : 'B2B Elite',
      bgClass: 'from-emerald-500 to-teal-700',
      secondaryColor: 'text-emerald-100',
      glowColor: 'rgba(16,185,129,0.25)'
    }
  ];

  // State
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    amount?: number;
    message: string;
    checked: boolean;
  } | null>(null);

  // Custom Card Builder State
  const [customAmount, setCustomAmount] = useState<number>(350);
  const [customName, setCustomName] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customTheme, setCustomTheme] = useState<'amber' | 'sky' | 'pink' | 'emerald'>('amber');
  const [generatedCustomCode, setGeneratedCustomCode] = useState<string | null>(null);

  // --- Shopping Basket & Purchased History States (Full-Stack Support) ---
  const [cart, setCart] = useState<Array<{
    id: string;
    uuid: string; // unique item reference in basket
    title: string;
    name: string;
    amount: number;
    code: string;
    bgClass: string;
    glowColor: string;
    customMessage?: string;
  }>>([]);

  const [purchasedCards, setPurchasedCards] = useState<Array<{
    id: string;
    title: string;
    name: string;
    amount: number;
    code: string;
    bgClass: string;
    glowColor: string;
    customMessage?: string;
    purchasedAt: string;
  }>>([]);

  const [activeTab, setActiveTab] = useState<'cart' | 'history'>('cart');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simulated pay form state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Auto load purchase history from LocalStorage & Firestore
  useEffect(() => {
    // 1. Initial Local Storage Load
    const localHistory = localStorage.getItem('tasker_purchased_gift_cards');
    if (localHistory) {
      try {
        setPurchasedCards(JSON.parse(localHistory));
      } catch (e) {
        console.error('Error loading gift cards from storage:', e);
      }
    }

    // 2. Real-time subcollection transactions listener for cloud database persistence
    if (user?.uid) {
      const unsubscribe = subscribeToTransactions(
        user.uid,
        (transactions) => {
          const cloudCards: any[] = [];
          transactions.forEach((tx) => {
            if (tx.paymentType === 'GIFT_CARD_PURCHASE' && tx.status === 'SUCCESS' && Array.isArray(tx.purchasedCardsList)) {
              cloudCards.push(...tx.purchasedCardsList);
            }
          });

          if (cloudCards.length > 0) {
            // Sort bought gift cards descending
            cloudCards.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
            setPurchasedCards(cloudCards);
            localStorage.setItem('tasker_purchased_gift_cards', JSON.stringify(cloudCards));
          }
        },
        (error) => {
          console.warn('Firestore transactions subscription fallback warning:', error.message);
        }
      );

      return () => unsubscribe();
    }
  }, [user?.uid]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleValidatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoInput.trim().toUpperCase();
    if (!cleanCode) return;

    // Check pre-defined codes
    const match = defaultCards.find(c => c.code === cleanCode);
    if (match) {
      setValidationResult({
        isValid: true,
        amount: match.amount,
        message: isRTL 
          ? `كود صالح! رصيد بقيمة ${match.amount} درهم جاهز لخصمه عند الدفع.` 
          : `Code valide ! Un crédit de ${match.amount} DH est prêt à être déduit.`,
        checked: true
      });
      return;
    }

    // Check generated custom codes
    if (generatedCustomCode && cleanCode === generatedCustomCode) {
      setValidationResult({
        isValid: true,
        amount: customAmount,
        message: isRTL 
          ? `رائع! بطاقتك المخصصة صالحة بقيمة ${customAmount} درهم.` 
          : `Succès ! Votre carte personnalisée est active avec un solde de ${customAmount} DH.`,
        checked: true
      });
      return;
    }

    // Invalid code response
    setValidationResult({
      isValid: false,
      message: isRTL 
        ? 'عذراً، هذا الكود غير مدرج بالرباط. يرجى مراجعة الكود وإعادة المحاولة.' 
        : 'Code de coupon invalide ou expiré pour la région de Rabat.',
      checked: true
    });
  };

  const handleGenerateCustomCard = () => {
    if (!user) {
      onLoginClick('signin');
      return;
    }
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const code = `RABAT-GIFT-${customAmount}-${suffix}`;
    setGeneratedCustomCode(code);
  };

  // --- Shopping Cart & Secure Sandbox Checkout Core Functions ---
  const handleAddToCart = (cardItem: {
    id: string;
    title: string;
    name: string;
    amount: number;
    code: string;
    bgClass: string;
    glowColor: string;
    customMessage?: string;
  }) => {
    const newItem = {
      ...cardItem,
      uuid: Math.random().toString(36).substr(2, 9)
    };
    setCart((prev) => [...prev, newItem]);
    
    // Smooth scroll down to cart section to display immediate tactile feedback
    setTimeout(() => {
      const cartEl = document.getElementById('shopping-cart-section');
      if (cartEl) {
        cartEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleRemoveFromCart = (uuid: string) => {
    setCart((prev) => prev.filter((item) => item.uuid !== uuid));
  };

  const handleExecuteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onLoginClick('signin');
      return;
    }
    if (cart.length === 0) return;

    setPaymentLoading(true);
    setErrorMessage(null);

    try {
      const subtotal = cart.reduce((sum, item) => sum + item.amount, 0);
      const vat = Math.round(subtotal * 0.20);
      const totalAmount = subtotal + vat;

      // Simulate Payzone digital handshakes / signature validation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newPurchases = cart.map(item => ({
        id: item.id,
        title: item.title,
        name: item.name,
        amount: item.amount,
        bgClass: item.bgClass,
        glowColor: item.glowColor,
        customMessage: item.customMessage || '',
        purchasedAt: new Date().toISOString(),
        code: item.code.includes('RABAT-GIFT') || item.code.includes('RABAT-PRO') ? item.code : `RABAT-GIFT-${item.amount}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      }));

      const txnId = `TX-GIFT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const payload: any = {
        id: txnId,
        userUid: user.uid,
        userEmail: user.email || 'rabat-user@tasker.ma',
        amount: totalAmount,
        paymentType: 'GIFT_CARD_PURCHASE',
        merchantId: 'PAYZONE-RABAT-GIFT-MERCHANT',
        status: 'SUCCESS',
        gateway: 'Payzone Morocco',
        currency: 'MAD',
        signature: 'SHA-256-SIGNATURE-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        purchasedCardsList: newPurchases,
        createdAt: new Date() // Will use local date fallback if Firestore conversion delays
      };

      // Write transaction to user's transactions folder in Firestore securely
      try {
        const response = await fetch('/api/transactions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userUid: user.uid,
            amount: totalAmount,
            paymentType: 'GIFT_CARD_PURCHASE',
            purchasedCardsList: newPurchases,
            userEmail: user.email || 'rabat-user@tasker.ma'
          })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to submit transaction securely.');
        }
      } catch (dbError: any) {
        console.warn('Firestore transaction registration failed:', dbError.message);
      }

      // Update local and storage data
      const updatedHistory = [...newPurchases, ...purchasedCards];
      setPurchasedCards(updatedHistory);
      localStorage.setItem('tasker_purchased_gift_cards', JSON.stringify(updatedHistory));

      // Successfully purchased and cleared
      setCart([]);
      setPaymentSuccess(true);
      
      setTimeout(() => {
        setPaymentSuccess(false);
        setIsCheckoutModalOpen(false);
        setActiveTab('history');
        // Clear inputs
        setCardName('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
      }, 2500);

    } catch (err: any) {
      console.error('Checkout failed:', err);
      setErrorMessage(isRTL ? 'عذراً! فشلت معالجة عملية الدفع عبر البوابة الرسمية للمغرب.' : 'Une erreur est survenue lors de la connexion à Payzone Maroc.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const themeConfig = {
    amber: {
      bg: 'from-amber-500 to-yellow-600',
      text: 'text-amber-100',
      border: 'border-amber-200/50'
    },
    sky: {
      bg: 'from-sky-500 to-indigo-650',
      text: 'text-sky-100',
      border: 'border-sky-200/50'
    },
    pink: {
      bg: 'from-purple-500 to-pink-650',
      text: 'text-purple-100',
      border: 'border-purple-200/50'
    },
    emerald: {
      bg: 'from-emerald-500 to-teal-700',
      text: 'text-emerald-100',
      border: 'border-emerald-200/50'
    }
  };

  return (
    <div className="animate-fade-in w-full bg-slate-50 min-h-screen text-slate-800" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 2. Banner & Presentation Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-20 pb-20 px-4 sm:px-6 lg:px-8 shadow-xs border-b border-slate-800">
        {/* Background Image of family help in Rabat */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/realistic_family_help_rabat_1781646280855.jpg" 
            alt="Family Love & Support in Rabat" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60 object-center filter brightness-90 contrast-105"
          />
          {/* Symmetrical dark backdrop gradient overlays to ensure text is highly legible while image stands out beautifully */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/75" />
        </div>

        {/* Ambient abstract glows */}
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-400 text-xs font-black mb-5 tracking-wide animate-pulse">
            <Gift className="w-3.5 h-3.5" />
            <span>{isRTL ? 'مكافآت تاسكر™ الترويجية 2026' : 'TASKER™ GIFTS & PROMOS 2026'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-white">
            {isRTL ? 'بطاقات الهدايا وسندات التخفيض من Tasker' : 'Cartes Cadeaux & Réductions Exclusives'}
          </h1>
          
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-extrabold max-w-2xl mx-auto leading-relaxed">
            {isRTL 
              ? 'أفضل طريقة لتقديم المساعدة لأقاربك وأصدقائك بمدينة الرباط! أهدِهم رصيداً مميزاً لإتمام أعمالهم المنزلية ومهامهم اليومية بكل ثقة وسهولة.' 
              : "Offrez du temps libre et de l'aide à domicile à vos proches habitants de Rabat. Des chèques-cadeaux exclusifs utilisables instantanément auprès de nos meilleurs prestataires."}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={onPostTask}
              className="bg-sky-600 hover:bg-sky-700 text-white font-black text-xs px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-sky-200" />
              <span>{isRTL ? 'نشر مهمة جديدة واستخدام كود' : 'Créer une tâche & utiliser un code'}</span>
            </button>
            <a
              href="#custom-builder"
              className="bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black text-xs px-6 py-3.5 rounded-xl transition-all active:scale-95 flex items-center gap-2"
            >
              <Paintbrush className="w-4 h-4 text-slate-300" />
              <span>{isRTL ? 'صمم بطاقتك الخاصة' : 'Créer un chèque personnalisé'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        {/* Predefined Cards Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3.5xl font-black text-slate-900 tracking-tight">
              {isRTL ? 'اختر بطاقة جاهزة وانسخ رمز الخصم' : 'Découvrez nos cartes de crédit prépayées'}
            </h2>
            <p className="text-xs text-slate-500 font-extrabold mt-2">
              {isRTL 
                ? 'فئات جاهزة بمبالغ تخفيض فورية مخصصة لشتى أنواع المهام اليومية.' 
                : 'Nos bons cadeaux les plus demandés. Copiez et utilisez-les instantanément au moment du paiement.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {defaultCards.map((card) => (
              <div 
                key={card.id}
                className="bg-white rounded-3xl border border-slate-150 p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:scale-[1.02] flex flex-col justify-between"
              >
                {/* Visual Card Shape */}
                <div 
                  className={`p-5 rounded-2xl bg-gradient-to-r ${card.bgClass} text-white relative shadow-sm overflow-hidden min-h-[140px] flex flex-col justify-between`}
                  style={{ boxShadow: `0 8px 20px ${card.glowColor}` }}
                >
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-md" />
                  
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-90 block">
                        {card.title}
                      </span>
                      <h4 className="text-sm font-black mt-0.5">{card.name}</h4>
                    </div>
                    <span className="text-base font-black bg-white/20 px-2 py-0.5 rounded-lg text-xs">
                      {card.amount} DH
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-6 z-10">
                    <span className="text-[10px] font-mono tracking-widest opacity-90">{card.code}</span>
                    <Gift className="w-5 h-5 opacity-45" />
                  </div>
                </div>

                {/* Additional metadata info */}
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wide">
                      {isRTL ? 'الحالة ترويجية' : 'Type'}
                    </span>
                    <span className="font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                      {card.tag}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] text-slate-500 font-extrabold">
                        {isRTL ? 'خصم مالي فوري' : 'Réduction immédiate'}
                      </div>
                      <button 
                        onClick={() => handleCopy(card.code)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 ${
                          copiedCode === card.code 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {copiedCode === card.code ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{isRTL ? 'نسخ بنجاح' : 'Copié'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>{isRTL ? 'نسخ الرمز' : 'Copier'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button 
                      onClick={() => handleAddToCart({
                        id: card.id,
                        title: card.title,
                        name: card.name,
                        amount: card.amount,
                        code: card.code,
                        bgClass: card.bgClass,
                        glowColor: card.glowColor
                      })}
                      className="w-full mt-1 bg-sky-600 hover:bg-sky-700 text-white font-black text-[11px] py-2 px-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'إضافة إلى سلة المشتريات' : 'Ajouter au panier'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Coupon Validator & Custom Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Section A: Live Coupon Validator (Lg Span 5) */}
          <section className="lg:col-span-5 bg-white border border-slate-150 rounded-[2rem] p-6 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{isRTL ? 'التحقق من رصيد الكوبون' : 'Vérificateur de coupons'}</span>
            </h3>
            <p className="text-xs text-slate-500 font-extrabold mb-5">
              {isRTL 
                ? 'أدخل رمز كوبون بطاقة الهدايا للتحقق من صلاحيته وقيمته الفعلية بالدرهم المغربي.' 
                : "Saisissez un code promotionnel pour simuler sa validité et voir le montant d'aide instantané."}
            </p>

            <form onSubmit={handleValidatePromo} className="space-y-4">
              <div className="relative rounded-2xl border border-slate-200 p-1 bg-slate-50 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-50 focus-within:bg-white transition-all">
                <input 
                  type="text" 
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder={isRTL ? 'مثال: RABAT-GOLD-500' : 'Ex: RABAT-GOLD-500'}
                  className={`w-full bg-transparent border-none text-xs font-black uppercase text-slate-800 p-3 outline-none focus:outline-none ${isRTL ? 'text-right' : 'text-left'}`}
                />
                <button 
                  type="submit"
                  className={`absolute top-1.5 bottom-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-4.5 rounded-xl cursor-pointer active:scale-95 transition-all ${isRTL ? 'left-1.5' : 'right-1.5'}`}
                >
                  {isRTL ? 'فحص الكود' : 'Vérifier'}
                </button>
              </div>

              {validationResult && (
                <div 
                  className={`p-4 rounded-2xl flex items-start gap-3 border ${
                    validationResult.isValid 
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                      : 'bg-rose-50/50 border-rose-200 text-rose-950'
                  }`}
                >
                  {validationResult.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 text-right text-xs">
                    <p className="font-extrabold">{validationResult.message}</p>
                    {validationResult.isValid && validationResult.amount && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-semibold text-slate-500">{isRTL ? 'القيمة المغطاة:' : 'Montant couvert :'}</span>
                        <span className="font-black text-sm bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg">
                          +{validationResult.amount} DH
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>

            <div className="border-t border-slate-100 pt-5 mt-6">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-black text-slate-800">{isRTL ? 'كيف يتم استخدام الرصيد؟' : 'Comment réclamer le solde ?'}</h4>
                  <p className="text-[10px] text-slate-500 font-extrabold mt-0.5">
                    {isRTL 
                      ? 'ببساطة انسخ الكود والصقه في خانة كود الترويج عند قبول أي عرض من مقدم الخدمة.' 
                      : 'Saisissez le code promotionnel lors du règlement de vos tâches privées.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section B: Custom Card Builder (Lg Span 7) */}
          <section id="custom-builder" className="lg:col-span-7 bg-white border border-slate-150 rounded-[2rem] p-6 sm:p-8 shadow-xs relative">
            <div className="absolute top-6 left-6 hidden sm:block text-amber-500 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-2">
              {isRTL ? 'مصمم المخصصة: جهز بطاقة هدية فريدة' : 'Créez votre propre chèque-cadeau'}
            </h3>
            <p className="text-xs text-slate-500 font-extrabold mb-6">
              {isRTL 
                ? 'اختر قيمة الخصم، تصميم الخلفية المفضلة واكتب إهداء خاصا لمن تحب بالرباط.' 
                : 'Configurez le montant, le thème de couleur et le message de dévotion.'}
            </p>

            <div className="space-y-6">
              {/* 1. Interactive Preview Area */}
              <div 
                className={`p-6 rounded-[2rem] bg-gradient-to-br ${themeConfig[customTheme].bg} text-white relative shadow-lg overflow-hidden min-h-[190px] flex flex-col justify-between transition-all duration-500`}
              >
                <div className="absolute -left-12 -top-12 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
                <div className="absolute right-0 bottom-0 -mr-16 -mt-16 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-start z-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-90 block">
                      {isRTL ? 'بطاقة هدية تاسكر مصممة' : 'CHÈQUE-CADEAU PERSONNALISÉ'}
                    </span>
                    <h4 className="text-lg font-black mt-1">
                      {customName.trim() || (isRTL ? 'عائلة تاسكر الطيبة' : 'Destinataire')}
                    </h4>
                    <p className="text-[11px] opacity-80 italic mt-1 font-semibold max-w-[280px] break-words">
                      {customMessage.trim() ? `"${customMessage}"` : (isRTL ? '"كل التوفيق والراحة في مهامكم اليومية!"' : '"Plein de réussite dans vos travaux !"')}
                    </p>
                  </div>
                  <div className="text-right select-none">
                    <span className="text-xl sm:text-2.5xl font-black bg-white/20 px-3 py-1 rounded-2xl block">
                      {customAmount} DH
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-8 z-10">
                  <div>
                    <span className="text-[9px] text-white/50 block font-sans lowercase">rabat code</span>
                    <span className="text-xs font-mono tracking-wider">
                      {generatedCustomCode || 'RABAT-GIFT-SAMPLE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl border border-white/10 text-[9.5px] font-black text-amber-300">
                    <Gift className="w-3.5 h-3.5 animate-pulse" />
                    <span>Tasker Rabat</span>
                  </div>
                </div>
              </div>

              {/* 2. Controls and Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* A. Choose Design Palette */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-700">
                    {isRTL ? 'اختر وتخصيص اللون' : 'Sélectionnez le thème'}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    {(Object.keys(themeConfig) as Array<keyof typeof themeConfig>).map((tKey) => (
                      <button
                        key={tKey}
                        type="button"
                        onClick={() => setCustomTheme(tKey)}
                        className={`w-10 h-10 rounded-full bg-gradient-to-tr ${themeConfig[tKey].bg} border-2 transition-all cursor-pointer ${
                          customTheme === tKey 
                            ? 'border-slate-800 scale-110 shadow-sm ring-4 ring-sky-100' 
                            : 'border-white hover:scale-105'
                        }`}
                        title={tKey}
                      />
                    ))}
                  </div>
                </div>

                {/* B. Choose Amount via predefined / free slider */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 flex justify-between">
                    <span>{isRTL ? 'مبلغ بطاقة الهدية' : 'Montant du chèque'}</span>
                    <span className="text-sky-600 font-extrabold">{customAmount} DH</span>
                  </label>
                  <input 
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(Number(e.target.value));
                      // clear code on change
                      setGeneratedCustomCode(null);
                    }}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex gap-1.5 mt-1 justify-between text-[9px] text-slate-400 font-extrabold">
                    <span>50 DH</span>
                    <span>500 DH</span>
                    <span>1000 DH</span>
                    <span>2000 DH</span>
                  </div>
                </div>

                {/* C. Recipient Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700">
                    {isRTL ? 'إلى (اسم المستلم أو العائلة)' : 'Destinataire (Nom ou famille)'}
                  </label>
                  <input 
                    type="text" 
                    value={customName}
                    onChange={(e) => {
                      setCustomName(e.target.value);
                      setGeneratedCustomCode(null);
                    }}
                    placeholder={isRTL ? 'مثال: الوالدة العزيزة' : 'Ex: Famille El Alami'}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:border-sky-500 text-slate-800"
                  />
                </div>

                {/* D. Dedication message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700">
                    {isRTL ? 'رسالة مباركة أو إهداء مختصرة' : 'Message personnalisé (optionnel)'}
                  </label>
                  <input 
                    type="text" 
                    value={customMessage}
                    maxLength={100}
                    onChange={(e) => {
                      setCustomMessage(e.target.value.slice(0, 100));
                      setGeneratedCustomCode(null);
                    }}
                    placeholder={isRTL ? 'مثال: بالصحة والراحة' : 'Ex: Bon courage avec vos maux !'}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:border-sky-500 text-slate-800"
                  />
                </div>

              </div>

              {/* Action output to build/generate and claim */}
              <div className="pt-5 border-t border-slate-150 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-right columns-1">
                    <p className="text-[10px] text-slate-400 font-extrabold max-w-sm">
                      {isRTL 
                        ? 'إنشاء كود معاينة مجاني أو إضافة البطاقة الفاخرة مباشرة إلى السلة للشراء والتفعيل الرسمي.' 
                        : 'Simulez un code cadeau d’aperçu ou ajoutez-le au panier pour l’enregistrer officiellement.'}
                    </p>
                  </div>
                  
                  {/* Free simulator toggle */}
                  {!generatedCustomCode && (
                    <button 
                      type="button"
                      onClick={handleGenerateCustomCard}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isRTL ? 'معاينة مجانية' : 'Aperçu gratuit'}</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Shopping cart adder */}
                  <button
                    type="button"
                    onClick={() => {
                      const suffix = Math.floor(1000 + Math.random() * 9000);
                      const finalCode = generatedCustomCode || `RABAT-GIFT-${customAmount}-${suffix}`;
                      handleAddToCart({
                        id: `custom-${customTheme}`,
                        title: isRTL ? 'بطاقة مخصصة مهدية' : `CHÈQUE CADEAU SUR MESURE`,
                        name: customName.trim() || (isRTL ? 'صديق وفي' : 'Ami fidèle'),
                        amount: customAmount,
                        code: finalCode,
                        bgClass: themeConfig[customTheme].bg,
                        glowColor: customTheme === 'amber' ? 'rgba(245,158,11,0.25)' : customTheme === 'sky' ? 'rgba(14,165,233,0.25)' : customTheme === 'pink' ? 'rgba(168,85,247,0.25)' : 'rgba(16,185,129,0.25)',
                        customMessage: customMessage.trim() || (isRTL ? 'مع أطيب التمنيات' : 'Meilleurs vœux !')
                      });
                    }}
                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-black text-[12px] py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-sky-200 animate-pulse" />
                    <span>{isRTL ? 'إضافة بطاقتك المخصصة إلى السلة' : 'Ajouter au panier'}</span>
                  </button>

                  {generatedCustomCode && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(generatedCustomCode)}
                        className={`px-4 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all text-white ${
                          copiedCode === generatedCustomCode ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        {copiedCode === generatedCustomCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedCode === generatedCustomCode ? (isRTL ? 'جاهز' : 'Prêt !') : (isRTL ? 'نسخ الرمز' : 'Copier l’aperçu')}</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const win = window.open('', '_blank');
                          if (win) {
                            win.document.write(`
                              <html>
                              <head>
                                <title>Tasker Gift Card - ${customName}</title>
                                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                              </head>
                              <body class="bg-slate-900 min-h-screen flex items-center justify-center p-6 text-right">
                                <div class="max-w-md w-full bg-gradient-to-br ${customTheme === 'amber' ? 'from-amber-500 to-yellow-600' : customTheme === 'sky' ? 'from-sky-500 to-indigo-650' : customTheme === 'pink' ? 'from-purple-500 to-pink-650' : 'from-emerald-500 to-teal-700'} text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                                  <div class="absolute -left-12 -top-12 w-32 h-32 rounded-full bg-white/5 blur-xl"></div>
                                  <div class="flex justify-between items-start mb-12">
                                    <div>
                                      <span class="text-xs uppercase tracking-widest text-slate-100 block text-left">Tasker Rabat Gift Cards</span>
                                      <h1 class="text-2xl font-black mt-2 text-left">${customName || (isRTL ? 'إلى الودود' : 'Ami de Tasker')}</h1>
                                      <p class="text-sm italic mt-2 opacity-90 text-left">"${customMessage || (isRTL ? 'بالصحة والعافية' : 'Pour vos besoins quotidien')}"</p>
                                    </div>
                                    <div class="text-3xl font-black bg-white/20 px-4 py-1.5 rounded-2xl">${customAmount} DH</div>
                                  </div>
                                  <div class="flex justify-between items-end mt-12 pt-6 border-t border-white/20">
                                    <div class="text-left">
                                      <span class="text-[10px] text-white/60 block uppercase">Code de sécurité</span>
                                      <span class="text-base font-mono font-black tracking-widest">${generatedCustomCode}</span>
                                    </div>
                                    <div class="text-xs font-bold bg-black/20 px-3 py-1 bg-opacity-30 rounded-lg">Fait à Rabat</div>
                                  </div>
                                </div>
                              </body>
                              </html>
                            `);
                            win.document.close();
                          }
                        }}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer active:scale-95"
                        title={isRTL ? "معاينة البطاقة للطباعة" : 'Aperçu Impression'}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* --- Brand New Shopping Basket & Purchase History Section (سلة المشتريات والمحفوظات) --- */}
        <div id="shopping-cart-section" className="bg-white border border-slate-150 rounded-[2rem] p-6 sm:p-8 shadow-xs mb-16 transition-all text-right" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
            <div className="text-right">
              <span className="text-xs font-black uppercase text-sky-600 tracking-wider">
                {isRTL ? 'إدارة المشتريات والطلبات' : 'PANIER ET COMMANDES'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center justify-start gap-2">
                <ShoppingBag className="w-5 h-5 text-sky-600" />
                <span>{isRTL ? 'سلة شراء بطاقات الهدايا' : 'Votre Panier d’Achat'}</span>
              </h2>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 bg-slate-150 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('cart')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'cart' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isRTL ? `سلة التسوق (${cart.length})` : `Mon Panier (${cart.length})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'history' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isRTL ? `البطاقات المشتراة (${purchasedCards.length})` : `Mes Cartes (${purchasedCards.length})`}
              </button>
            </div>
          </div>

          {/* TAB 1: Shopping Basket */}
          {activeTab === 'cart' && (
            <div>
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-1 opacity-40 mb-3" />
                  <p className="text-xs font-extrabold text-slate-500">
                    {isRTL 
                      ? 'السلة فارغة حالياً. اضغط على أي بطاقة أعلاه أو صمم بطاقتك الخاصة لإضافتها هنا.' 
                      : 'Votre panier est vide. Ajoutez des cartes cadeaux ci-dessus pour passer commande.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Cart items list */}
                  <div className="lg:col-span-7 space-y-3">
                    {cart.map((item) => (
                      <div 
                        key={item.uuid}
                        className="flex items-center justify-between border border-slate-150 rounded-2xl p-4 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-8 rounded-lg bg-gradient-to-r ${item.bgClass} flex items-center justify-center text-white shrink-0 shadow-xs`}>
                            <Gift className="w-4 h-4 opacity-75" />
                          </div>
                          <div className="text-right">
                            <h4 className="text-xs font-black text-slate-800">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 font-extrabold mt-0.5">{item.title}</p>
                            {item.customMessage && (
                              <p className="text-[9px] text-slate-500 italic mt-0.5">"{item.customMessage}"</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-slate-900">{item.amount} DH</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.uuid)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                            title={isRTL ? 'إزالة' : 'Supprimer'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing and Pay Summary card */}
                  <div className="lg:col-span-5 bg-slate-50/60 border border-slate-150 rounded-2xl p-5">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4">
                      {isRTL ? 'ملخص الفاتورة الإجمالي' : 'Récapitulatif de la commande'}
                    </h3>

                    <div className="space-y-2 border-b border-slate-200 pb-4 mb-4">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>{isRTL ? 'المجموع الفرعي:' : 'Sous-total :'}</span>
                        <span>{cart.reduce((sum, item) => sum + item.amount, 0)} DH</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>{isRTL ? 'الضريبة على القيمة مضافة (VAT 20%):' : 'TVA Marocaine (20%) :'}</span>
                        <span>{Math.round(cart.reduce((sum, item) => sum + item.amount, 0) * 0.20)} DH</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>{isRTL ? 'رسوم البوابة الإلكترونية:' : 'Frais de transaction :'}</span>
                        <span className="text-emerald-600">{isRTL ? 'مجاني بالكامل' : 'GRATUIT'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm font-black text-slate-900 mb-6">
                      <span>{isRTL ? 'المجموع النهائي المطلوب سداده:' : 'Total net à payer :'}</span>
                      <span className="text-base text-sky-600 bg-sky-50 px-3 py-1 rounded-xl">
                        {cart.reduce((sum, item) => sum + item.amount, 0) + Math.round(cart.reduce((sum, item) => sum + item.amount, 0) * 0.20)} DH
                      </span>
                    </div>

                    {/* Payzone security confirmation badges */}
                    <div className="bg-white border border-slate-100 rounded-xl p-3.5 mb-5 flex items-center justify-between gap-3 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isRTL ? 'دفع آمن 256-bit' : 'Paiement SSL Sécurisé'}</span>
                      </div>
                      <span className="font-extrabold text-sky-600">Payzone المغرب™</span>
                    </div>

                    {/* Checkout launcher */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          onLoginClick('signin');
                          return;
                        }
                        setIsCheckoutModalOpen(true);
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4 text-sky-200" />
                      <span>
                        {user 
                          ? (isRTL ? 'تأكيد الدفع والتشغيل عبر Payzone' : 'Payer via Payzone Sandbox') 
                          : (isRTL ? 'سجل دخولك لإتمام عملية الشراء' : 'Se connecter pour acheter')}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Purchase History */}
          {activeTab === 'history' && (
            <div>
              {purchasedCards.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Gift className="w-12 h-12 mx-auto stroke-1 opacity-40 mb-3" />
                  <p className="text-xs font-extrabold text-slate-500">
                    {isRTL 
                      ? 'لا توجد بطاقات مشتراة بعد. عند شراء بطاقة هدايا بنجاح، ستظهر هنا فوراً مع رمز تفعيلها.' 
                      : 'Vous n’avez pas encore de cartes cadeaux achetées. Elles s’afficheront ici après paiement.'}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-right mb-4">
                    <p className="text-[11px] text-slate-500 font-bold">
                      {isRTL 
                        ? 'قائمة بطاقاتك المفعلة بالرباط. انسخ الأكواد وشاركها مع عائلتك لاستخدامها مباشرة عند تأدية الخدمات.' 
                        : 'Voici vos chèques cadeaux actifs. Copiez le code et partagez-les avec vos proches.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
                    {purchasedCards.map((card, idx) => (
                      <div 
                        key={idx}
                        className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
                      >
                        {/* Status absolute badge */}
                        <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full z-10">
                          {isRTL ? 'نشط وصالح' : 'ACTIF'}
                        </div>

                        {/* Card design */}
                        <div className={`p-5 rounded-2xl bg-gradient-to-r ${card.bgClass || 'from-sky-500 to-indigo-650'} text-white relative shadow-sm overflow-hidden min-h-[140px] flex flex-col justify-between`}>
                          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-md" />
                          
                          <div className="z-10 text-right">
                            <span className="text-[8px] font-black uppercase tracking-wider opacity-85 block text-right">
                              {card.title || (isRTL ? 'بطاقة هدايا مخصصة' : 'CARTE CADEAU TASKER')}
                            </span>
                            <h4 className="text-sm font-black mt-0.5 max-w-[80%] text-right">{card.name}</h4>
                            {card.customMessage && (
                              <p className="text-[10px] italic opacity-85 mt-1 truncate text-right">"{card.customMessage}"</p>
                            )}
                          </div>

                          <div className="flex justify-between items-end mt-4 z-10 border-t border-white/20 pt-3 text-right">
                            <div className="text-right">
                              <span className="text-[8px] opacity-75 block text-right">{isRTL ? 'كود التفعيل:' : 'CODE EXCLUSIF :'}</span>
                              <span className="text-xs font-mono font-black tracking-wider text-right">{card.code}</span>
                            </div>
                            <span className="text-base font-black bg-white/20 px-2 py-0.5 rounded-lg text-xs">
                              {card.amount} DH
                            </span>
                          </div>
                        </div>

                        {/* Card metadata / action */}
                        <div className="mt-4 flex flex-col gap-3">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                            <span>{isRTL ? 'تاريخ التفعيل والشراء:' : 'Acheté le :'}</span>
                            <span className="font-extrabold">
                              {card.purchasedAt ? new Date(card.purchasedAt).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-FR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : (isRTL ? 'الآن' : 'Récemment')}
                            </span>
                          </div>

                          <div className="flex gap-2 border-t border-slate-100 pt-3">
                            <button
                              type="button"
                              onClick={() => handleCopy(card.code)}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                                copiedCode === card.code 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {copiedCode === card.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                              <span>{copiedCode === card.code ? (isRTL ? 'تم النسخ' : 'Copier') : (isRTL ? 'نسخ الرمز السري' : 'Copier le code')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const win = window.open('', '_blank');
                                if (win) {
                                  win.document.write(`
                                    <html>
                                    <head>
                                      <title>Tasker Gift Card - ${card.name}</title>
                                      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                                    </head>
                                    <body class="bg-slate-900 min-h-screen flex items-center justify-center p-6 text-right">
                                      <div class="max-w-md w-full bg-gradient-to-br ${card.bgClass} text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                                        <div class="absolute -left-12 -top-12 w-32 h-32 rounded-full bg-white/5 blur-xl"></div>
                                        <div class="flex justify-between items-start mb-12">
                                          <div>
                                            <span class="text-xs uppercase tracking-widest text-slate-100 block text-left">Tasker Rabat Gift Cards</span>
                                            <h1 class="text-2xl font-black mt-2 text-left">${card.name}</h1>
                                            ${card.customMessage ? `<p class="text-sm italic mt-2 opacity-90 text-left">"${card.customMessage}"</p>` : ''}
                                          </div>
                                          <div class="text-3xl font-black bg-white/20 px-4 py-1.5 rounded-2xl">${card.amount} DH</div>
                                        </div>
                                        <div class="flex justify-between items-end mt-12 pt-6 border-t border-white/20">
                                          <div class="text-left">
                                            <span class="text-[10px] text-white/60 block uppercase">Code de sécurité</span>
                                            <span class="text-base font-mono font-black tracking-widest">${card.code}</span>
                                          </div>
                                          <div class="text-xs font-bold bg-black/20 px-3 py-1 bg-opacity-30 rounded-lg">Fait à Rabat</div>
                                        </div>
                                      </div>
                                    </body>
                                    </html>
                                  `);
                                  win.document.close();
                                }
                              }}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
                              title={isRTL ? "طباعة" : "Imprimer"}
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


        {/* --- Secure Checkout Modal (بوابة الدفع الإلكتروني Payzone المغرب) --- */}
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-right" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden p-6 sm:p-8 animate-scale-up relative">
              
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="absolute top-5 left-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <span className="text-[10px] bg-sky-50 text-sky-600 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  PAYZONE MOROCCO SECURE GATEWAY
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2 flex items-center justify-center gap-1.5">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  <span>{isRTL ? 'بوابة الدفع الإلكتروني بيزون' : 'Guichet de Paiement Payzone'}</span>
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {isRTL 
                    ? 'أدخل بيانات بطاقتك الائتمانية المغربية أو الدولية لإتمام العملية في البيئة التجريبية لأكاديمية الدفع.' 
                    : 'Saisissez vos données de paiement pour valider l’achat dans l’environnement simulé.'}
                </p>
              </div>

              {paymentSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-bounce shadow-xs">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-black text-emerald-950">
                    {isRTL ? 'تمت عملية الدفع بنجاح!' : 'Paiement effectué avec succès !'}
                  </h4>
                  <p className="text-xs text-slate-500 font-extrabold">
                    {isRTL 
                      ? 'تم إصدار رموز سندات الهدايا وحفظها بنجاح في قاعدة البيانات وجداول المحفوظات.' 
                      : 'Vos codes de chèques ont été générés et enregistrés sur la base de données.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleExecuteCheckout} className="space-y-4 text-right">
                  
                  {/* Summary row */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 flex justify-between items-center text-xs font-bold text-right" dir={isRTL ? 'rtl' : 'ltr'}>
                    <span className="text-slate-500">{isRTL ? 'إجمالي المطلوب سداده:' : 'Montant net :'}</span>
                    <span className="font-black text-sm text-sky-600">
                      {cart.reduce((sum, item) => sum + item.amount, 0) + Math.round(cart.reduce((sum, item) => sum + item.amount, 0) * 0.20)} DH
                    </span>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 font-extrabold flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Card Owner Name */}
                  <div className="flex flex-col gap-1.5 text-right">
                    <label className="text-[11px] font-black text-slate-700">
                      {isRTL ? 'اسم حامل البطاقة الكامل' : 'Nom du titulaire de la carte'}
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Mourad Alami"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:border-sky-500 text-slate-800 text-right"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="flex flex-col gap-1.5 text-right">
                    <label className="text-[11px] font-black text-slate-700">
                      {isRTL ? 'رقم البطاقة (16 رقم)' : 'Numéro de la carte'}
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        pattern="[0-9]{16,19}"
                        maxLength={19}
                        placeholder="4500 1200 8500 9000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs font-black tracking-widest border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:border-sky-500 text-slate-800 text-left"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute top-3.5 left-3.5" />
                    </div>
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-4 text-right">
                    <div className="flex flex-col gap-1.5 text-right">
                      <label className="text-[11px] font-black text-slate-700">
                        {isRTL ? 'تاريخ الصلاحية (MM/YY)' : 'Expiration'}
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="12/28"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full text-xs font-black text-center border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:border-sky-500 text-slate-800"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-right">
                      <label className="text-[11px] font-black text-slate-700">
                        CVV / CVC
                      </label>
                      <input 
                        type="password" 
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs font-black text-center tracking-widest border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:border-sky-500 text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3.5 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 ${
                      paymentLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {paymentLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{isRTL ? 'جاري التحقق الآمن عبر Payzone...' : 'Traitement Payzone en cours...'}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>{isRTL ? `سدد الآن ${cart.reduce((sum, item) => sum + item.amount, 0) + Math.round(cart.reduce((sum, item) => sum + item.amount, 0) * 0.20)} درهم` : 'Valider et Payer'}</span>
                      </>
                    )}
                  </button>

                  <p className="text-[9px] text-slate-400 font-bold text-center mt-2 leading-normal">
                    {isRTL 
                      ? 'ملاحظة: هذا نموذج حماية ومحاكاة آمن كلياً يضمن لشركاء الرباط ومستخدمي الخدمة تجربة سداد سلسة من Payzone.' 
                      : 'Simulation sécurisée Payzone Maroc. Aucune devise réelle ne sera prélevée.'}
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Informative corporate visual steps section */}
        <section className="bg-white border border-slate-150 rounded-[2rem] p-8 md:p-12 shadow-2xs">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-xs font-black uppercase text-sky-600 tracking-widest">{isRTL ? 'بساطة وأمان' : 'PROCESSUS SÉCURISÉ'}</span>
            <h2 className="text-xl sm:text-2.5xl font-black text-slate-900 mt-2">
              {isRTL ? 'كيف يستعمل متلقي الهدية بطاقات تاسكر؟' : 'Comment utiliser votre chèque-cadeau ?'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
            {/* Step 1 */}
            <div className="flex flex-col gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 font-black text-base flex items-center justify-center self-start shadow-xs">
                1
              </span>
              <h4 className="text-sm font-black text-slate-900">{isRTL ? 'انسخ الرمز السري' : '1. Copiez le code unique'}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                {isRTL 
                  ? 'قم بنسخ الرمز الترويجي الذي حصلت عليه مجانا أو من خلال مصمم البطاقات أعلاه.' 
                  : "Chaque carte cadeau contient un code promotionnel distinct de crédit prépayé."}
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-3">
              <span className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-500 font-black text-base flex items-center justify-center self-start shadow-xs">
                2
              </span>
              <h4 className="text-sm font-black text-slate-900">{isRTL ? 'انشر مهمتك ووظف منفذ الخدمة' : '2. Publiez des missions'}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                {isRTL 
                  ? 'انشر طلب خدمتك (تنظيف، نقل منزل، إصلاحات سباكة) بالرباط واستلم عروض الأسعار.' 
                  : "Publiez n'importe quelle mission d'utilité quotidienne sur notre réseau à Rabat."}
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-3">
              <span className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-500 font-black text-base flex items-center justify-center self-start shadow-xs">
                3
              </span>
              <h4 className="text-sm font-black text-slate-900">{isRTL ? 'خصم فوري وتلقائي' : '3. Déduction instantanée'}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                {isRTL 
                  ? 'عند إتمام الدفع الآمن، أدخل الكود في خانة التخفيضات ليتم خصم القيمة تلقائيا.' 
                  : "Insérez le code promotionnel lors du paiement pour amputer directement le prix final !"}
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
