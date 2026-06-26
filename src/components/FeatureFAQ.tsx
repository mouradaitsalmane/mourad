import React, { useState, useEffect } from 'react';
import { fetchDynamicFAQs } from '../services/faqService';
import { HelpCircle, ChevronDown, ChevronUp, Loader } from 'lucide-react';

interface FAQItem {
  id?: string;
  featureId: string;
  question: string;
  answer: string;
  lang: string;
}

interface FeatureFAQProps {
  categoryId: string;
  lang: 'ar' | 'fr';
}

export default function FeatureFAQ({ categoryId, lang }: FeatureFAQProps) {
  const isRTL = lang === 'ar';
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadFAQs() {
      setLoading(true);
      try {
        const fetched = await fetchDynamicFAQs(categoryId, lang);
        if (fetched.length > 0) {
          setFaqs(fetched);
        } else {
          // If Firestore faqs are empty, fall back to high-quality curated static questions
          setFaqs(getDefaultFAQs(categoryId, lang));
        }
      } catch (error) {
        console.warn('Dynamic FAQs lookup yielded empty or not configured. Using localized premium defaults.');
        setFaqs(getDefaultFAQs(categoryId, lang));
      } finally {
        setLoading(false);
      }
    }

    loadFAQs();
  }, [categoryId, lang]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-150 rounded-[2rem] p-6 sm:p-8 shadow-xs text-center flex flex-col items-center justify-center py-12">
        <Loader className="w-6 h-6 text-sky-500 animate-spin mb-2" />
        <p className="text-xs text-slate-400 font-bold">
          {isRTL ? 'جاري تحميل الأسئلة الشائعة...' : 'Chargement de la FAQ...'}
        </p>
      </div>
    );
  }

  return (
    <section className="bg-white border border-slate-150 rounded-[2rem] p-6 sm:p-8 shadow-xs text-right">
      <div className="flex items-center gap-2 mb-4 justify-start flex-row-reverse">
        <HelpCircle className="w-5 h-5 text-sky-500 shrink-0" />
        <h2 className="text-lg font-black text-slate-900">
          {isRTL ? 'الأسئلة الشائعة والاستفسارات' : 'Foire Aux Questions (FAQ)'}
        </h2>
      </div>
      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 text-right">
        {isRTL 
          ? 'كل ما تود معرفته عن حجز وإنجاز هذه الخدمة بمدينة الرباط وسلا.'
          : 'Tout ce que vous devez savoir pour réserver cette prestation à Rabat et Salé.'}
      </p>

      <div className="space-y-3.5">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`border rounded-2xl transition-all duration-300 ${
                isOpen 
                  ? 'border-sky-300 bg-sky-50/20' 
                  : 'border-slate-150 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-5 py-4 flex items-center justify-between text-right gap-4 cursor-pointer focus:outline-none"
              >
                <span className="shrink-0 text-slate-400">
                  {isOpen ? <ChevronUp className="w-4 h-4 text-sky-500" /> : <ChevronDown className="w-4 h-4" />}
                </span>
                <span className="text-xs font-black text-slate-800 text-right flex-1 select-none">
                  {faq.question}
                </span>
              </button>
              
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-right text-slate-600 text-[11px] leading-relaxed font-medium border-t border-dashed border-slate-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function getDefaultFAQs(categoryId: string, lang: 'ar' | 'fr'): FAQItem[] {
  const isRTL = lang === 'ar';
  
  // Custom variations depending on the category ID groups
  if (['housekeeper', 'general_cleaning', 'commercial_cleaning', 'gutters_windows'].includes(categoryId)) {
    return [
      {
        featureId: categoryId,
        question: isRTL ? 'هل يجب علي توفير أدوات ومواد التنظيف؟' : 'Dois-je fournir le matériel et les produits de nettoyage ?',
        answer: isRTL 
          ? 'يمكنك الاتفاق مع عامل التنظيف مسبقاً. يقوم معظم المتخصصين بإحضار سوائل ومواد أساسية، بينما يطلب بعضهم توفير مكنسة أو سلم في عين المكان.'
          : 'Vous pouvez en convenir lors de la discussion. La plupart des agents apportent leurs consommables de base, mais le gros matériel (aspirateur, échelle) doit être disponible.',
        lang
      },
      {
        featureId: categoryId,
        question: isRTL ? 'كيف يتم تحديد السعر النهائي لخدمة التنظيف؟' : 'Comment est calculé le prix définitif du ménage ?',
        answer: isRTL 
          ? 'يعتمد السعر على مساحة المنزل أو عدد الغرف. السعر المعروض بالحاسبة تقديري ويمكنك الاتفاق مع الحرفي على سعر ثابت كلي للعمل.'
          : 'Le montant varie selon la superficie et l\'état de propreté initial. Le tarif de base est indicatif, vous fixez la validation finale par discussion ouverte.',
        lang
      },
      {
        featureId: categoryId,
        question: isRTL ? 'هل يمكنني حجز مهمة تنظيف دورية (أسبوعية)؟' : 'Est-il possible de planifier une prestation de ménage récurrente ?',
        answer: isRTL 
          ? 'نعم بالتأكيد! عند الاتفاق مع عامل تنظيف موثوق بالرباط، يمكنك تحديد جدول دوري للقيام بالعمل بشكل أسبوعي أو شهري بسهولة بنفس التكلفة.'
          : 'Tout à fait. Après une première mission réussie, vous pouvez organiser un planning régulier (hebdomadaire ou mensuel) en direct avec votre prestataire.',
        lang
      }
    ];
  }

  if (['beauty', 'tanning'].includes(categoryId)) {
    return [
      {
        featureId: categoryId,
        question: isRTL ? 'هل الخدمات تجميلية منزلية أم في الصالون؟' : 'Les soins de beauté se font-ils à domicile ou en salon ?',
        answer: isRTL 
          ? 'يقدم اختصاصيو التجميل عروضاً مخصصة للتنفيذ المنزلي المريح لتوفير عناء التنقل بالرباط، مجهزين بجميع حقائب التجميل الاحترافية.'
          : 'Nos esthéticiennes qualifiées se déplacent directement à votre domicile avec tout le matériel requis pour votre confort absolu.',
        lang
      },
      {
        featureId: categoryId,
        question: isRTL ? 'هل منتجات التجميل ومستحضرات العناية آمنة ومضمونة؟' : 'Les cosmétiques et produits de soin utilisés sont-ils certifiés ?',
        answer: isRTL 
          ? 'نعم بالكامل. يلتزم مقدمو الخدمات في قسم التجميل باستخدام مستحضرات مسجلة ومن العلامات التجارية الموثوقة لضمان سلامة البشرة والشعر.'
          : 'Absolument. Nos prestataires certifiés s\'engagent à utiliser uniquement des produits hypoallergéniques et des marques de confiance.',
        lang
      }
    ];
  }

  if (['carpenter', 'furniture_assembly', 'picture_framing', 'handicrafts'].includes(categoryId)) {
    return [
      {
        featureId: categoryId,
        question: isRTL ? 'هل يشمل السعر تكلفة توفير مسامير أو مقابض جديدة؟' : 'Les vis, chevilles ou poignées sont-elles incluses dans le devis ?',
        answer: isRTL 
          ? 'لا تشمل التكلفة المواد الخام الثمينة كالأخشاب والمقابض الفاخرة، ولكن يحمل النجار الأدوات التثبيتية ومستلزمات التركيب والمسامير مجاناً.'
          : 'Les petites fixations usuelles sont généralement offertes, mais l\'achat d\'accessoires haut de gamme ou de bois brut reste à votre charge.',
        lang
      },
      {
        featureId: categoryId,
        question: isRTL ? 'هل يقدم النجار ضمانة على جودة التركيب؟' : 'Le menuisier offre-t-il une quelconque garantie sur l\'assemblage ?',
        answer: isRTL 
          ? 'بالطبع. يحرص النجارون المعتمدون بالرباط على التأكد من سلامة توازن الأثاث وصلابته قبل المغادرة، وإصلاح أي خلل يظهر فوراً.'
          : 'Oui, une vérification méticuleuse est réalisée avant la livraison finale pour s\'assurer de la stabilité parfaite de l\'ouvrage.',
        lang
      }
    ];
  }

  if (['electrical_solutions', 'appliance_repair', 'ventilation', 'gas_installation'].includes(categoryId)) {
    return [
      {
        featureId: categoryId,
        question: isRTL ? 'ماذا أفعل في حالة حدوث ماس كهربائي طارئ؟' : 'Que faire en cas de court-circuit électrique urgent ?',
        answer: isRTL 
          ? 'قم فوراً بقطع التيار الكهربائي من القاطع الرئيسي للمنزل، ثم انشر طلباً عاجلاً واطلب فني كهرباء معتمد بالرباط لمعاينة العطل بأمان.'
          : 'Coupez immédiatement le disjoncteur général, puis publiez une demande urgente pour qu\'un électricien local intervienne en toute sécurité.',
        lang
      }
    ];
  }

  // General elegant fallback
  return [
    {
      featureId: categoryId,
      question: isRTL ? 'كيف أضمن جدية واحترافية مقدم الخدمة؟' : 'Comment s\'assurer du professionnalisme du prestataire ?',
      answer: isRTL 
        ? 'يمكنك الاطلاع على تقييمات العملاء السابقين في الرباط، وآراء سكان الحي، إلى جانب التأكد من وجود شارة التحقق الأخضر على حسابه الشخصي.'
        : 'Consultez les notes, avis clients et l\'historique des travaux directement sur le profil vérifié de l\'intervenant.',
      lang
    },
    {
      featureId: categoryId,
      question: isRTL ? 'كيف تتم عملية الدفع والاتفاق على التكلفة؟' : 'Quel est le mode de facturation et de paiement ?',
      answer: isRTL 
        ? 'يتم الاتفاق بحرية على التكلفة الإجمالية في الشات. ننصح بشدة بعدم تسليم أي دفعات مالية إلا بعد إنهاء العمل بالكامل وإظهار النتيجة المطلوبة.'
        : 'Le prix global est librement fixé lors de votre accord. Pour votre sécurité, ne libérez les fonds qu\'après achèvement et satisfaction complète.',
      lang
    },
    {
      featureId: categoryId,
      question: isRTL ? 'ما هي سرعة الاستجابة لحجزي أو طلبي؟' : 'Combien de temps faut-il pour recevoir des propositions ?',
      answer: isRTL 
        ? 'سكان الرباط يلقون تجاوباً فورياً! يرسل المهنيون المتاحون عروضهم وأسعارهم المناسبة في غضون ربع ساعة في المتوسط من النشر مجاناً.'
        : 'Sur Rabat, vous recevez vos premières propositions tarifaires compétitives dans un délai moyen de 15 minutes seulement.',
      lang
    }
  ];
}
