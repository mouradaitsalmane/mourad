import React from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  ThumbsUp, 
  ShieldCheck, 
  Star, 
  MessageSquare, 
  Zap, 
  Trash2, 
  Paintbrush, 
  Code, 
  Truck, 
  Camera, 
  Wrench, 
  Home, 
  Briefcase,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface HowItWorksPageProps {
  lang: 'ar' | 'fr';
  onPostTask: () => void;
  onExploreClick: () => void;
  onLoginClick: (mode?: 'signin' | 'signup') => void;
}

export default function HowItWorksPage({
  lang,
  onPostTask,
  onExploreClick,
  onLoginClick
}: HowItWorksPageProps) {
  const isRTL = lang === 'ar';

  // Categories list with custom background glows and modern lucide icons
  const categoriesList = [
    {
      id: 'cleaning',
      ar: 'تنظيف',
      fr: 'Ménage',
      icon: Home,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      descAr: 'ترتيب المنازل وإزالة الأوساخ بفاعلية',
      descFr: 'Nettoyage professionnel de vos locaux'
    },
    {
      id: 'design',
      ar: 'تصميم',
      fr: 'Design',
      icon: Paintbrush,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      descAr: 'تصميم شعارات، هويات بصرية وتعديل الصور',
      descFr: 'Logos, maquettes et graphisme pro'
    },
    {
      id: 'programming',
      ar: 'برمجة',
      fr: 'Développement',
      icon: Code,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      descAr: 'برمجة مواقع وتطبيقات وحل مشاكل تقنية',
      descFr: 'Sites web, applis et assistance technique'
    },
    {
      id: 'moving',
      ar: 'نقل',
      fr: 'Déménagement',
      icon: Truck,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      descAr: 'فك، تركيب ونقل الأثاث بأمان تام',
      descFr: 'Transport de meubles et colis sécurisé'
    },
    {
      id: 'photography',
      ar: 'تصوير',
      fr: 'Photographie',
      icon: Camera,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      descAr: 'تغطية احترافية للمناسبات وجلسات تصوير',
      descFr: 'Prises de vues, vidéos et montages'
    },
    {
      id: 'maintenance',
      ar: 'صيانة',
      fr: 'Bricolage',
      icon: Wrench,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
      descAr: 'كهرباء، سباكة، وإصلاحات منزلية سريعة',
      descFr: 'Plomberie, électricité et réparations'
    },
    {
      id: 'home_chores',
      ar: 'أعمال منزلية',
      fr: 'Aide à domicile',
      icon: Home,
      color: 'bg-violet-50 text-violet-600 border-violet-100',
      descAr: 'الطهي، رعاية النباتات والحيوانات الأليفة',
      descFr: 'Assistance quotidienne et services'
    },
    {
      id: 'freelance',
      ar: 'أعمال حرة',
      fr: 'Freelancing',
      icon: Briefcase,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
      descAr: 'ترجمة، كتابة محتوى، ومحاسبة وتدقيق لغوي',
      descFr: 'Traduction, rédaction et secrétariat'
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden" dir="rtl" id="tasker-how-it-works-page">
      
      {/* 1. HERO SECTION (Split setup with rich soft blue gradients) */}
      <section className="relative bg-white py-16 lg:py-24 border-b border-gray-150 overflow-hidden">
        {/* Soft background layout glows */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/45 via-white to-sky-50/30 opacity-90 pointer-events-none" />
        <div className="absolute top-0 left-12 w-[35rem] h-[35rem] bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-[20rem] h-[20rem] bg-sky-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Content Segment */}
            <div className="lg:col-span-7 text-right flex flex-col items-start justify-center">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-600 border border-blue-100 mb-6 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                <span>كيف يعمل منصتنا الجديدة بالكامل</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.18] tracking-tight"
              >
                انشر مهمة. <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-sky-500 font-extrabold">احصل على عروض.</span> أنجزها!
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-6 text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-xl"
              >
                Tasker هي منصة تربط بين الأشخاص الذين يحتاجون إنجاز مهام وبين مقدمي الخدمات المستعدين للعمل فوراً بالرباط والمغرب.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-8 flex flex-row items-center gap-4 w-full sm:w-auto"
              >
                <button
                  onClick={onPostTask}
                  className="bg-blue-600 hover:bg-blue-750 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-lg border border-blue-500 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <span>ابدأ مجاناً</span>
                  <PlusCircle className="w-4 h-4 ml-1" />
                </button>
                
                <button 
                  onClick={onExploreClick}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-black text-sm px-6 py-4 rounded-2xl border border-gray-200 transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                >
                  <span>تصفح المهمات المتاحة</span>
                </button>
              </motion.div>
            </div>

            {/* Illustration/Cards Preview Segment */}
            <div className="lg:col-span-5 flex justify-center items-center relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative w-full max-w-[24rem] h-[19rem] sm:h-[22rem] bg-radial-gradient/5 rounded-3xl p-4 flex flex-col justify-center"
              >
                {/* Floating Mock Task Cards */}
                <div 
                  className="absolute top-4 right-2 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 max-w-[17rem] transition-all hover:scale-103 duration-300 z-10"
                  style={{ transform: 'rotate(2deg)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] uppercase tracking-widest font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">مفتوح للعروض</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800">تنظيف عميق للمنزل بصبايا</h4>
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-50">
                    <span className="text-[10px] text-gray-400 font-bold">الحي الرياض، الرباط</span>
                    <span className="text-xs font-black text-blue-600">450 DH</span>
                  </div>
                </div>

                <div 
                  className="absolute bottom-4 left-2 bg-gradient-to-l from-blue-600 to-indigo-700 rounded-2xl p-4 shadow-xl border border-blue-500 max-w-[17rem] transition-all hover:scale-103 duration-300 z-20 text-white"
                  style={{ transform: 'rotate(-3deg)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      <span className="text-[10px] font-black">تقييم 5/5</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-black bg-white/20 px-2 py-0.5 rounded-md text-white">منفذ مؤهل</span>
                  </div>
                  <p className="text-[11px] font-bold leading-relaxed opacity-95">"الحمد لله تم تنظيف الفيلا بالكامل بأقصى درجات الإتقان وبوقت قياسي!"</p>
                  <div className="mt-3 pt-2 text-[9px] font-black uppercase text-blue-200 text-left border-t border-white/10">
                    - مراد ب. (مقدم خدمة)
                  </div>
                </div>

                {/* Grid backdrop accents */}
                <div className="absolute inset-10 border border-dashed border-sky-200/50 rounded-full animate-spin-slow pointer-events-none" />
                <div className="absolute inset-16 border border-line-gray/30 rounded-full pointer-events-none" />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (3 STEPS SECTION) */}
      <section className="py-20 bg-white border-b border-gray-150">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">أنجز مهامك بثلاث خطوات سهلة</h2>
            <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium">خطوات بسيطة تضمن لك أمان المعاملات ومرونة الاختيار والجودة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 relative">
            {/* Connecting lines for desktop steps */}
            <div className="hidden md:block absolute top-[4rem] left-[15%] right-[15%] h-0.5 bg-gradient-to-l from-blue-300/30 via-slate-200 to-blue-300/30 pointer-events-none" />

            {/* Step 1 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col items-center transition-all duration-300 relative z-10 hover:shadow-lg text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20 mb-6">
                ١
              </div>
              <h3 className="text-base font-black text-slate-800">انشر مهمتك</h3>
              <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-[15rem]">
                اكتب وصف بسيط للمهمة التي تحتاج إنجازها، وحدد الموعد المفضل وميزانيتك بوضوح.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col items-center transition-all duration-300 relative z-10 hover:shadow-lg text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-l from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-400/20 mb-6">
                ٢
              </div>
              <h3 className="text-base font-black text-slate-800">احصل على عروض</h3>
              <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-[15rem]">
                سيصلك عروض من أشخاص مهتمين بتنفيذ المهمة بالمنطقة المحيطة بك خلال دقائق.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col items-center transition-all duration-300 relative z-10 hover:shadow-lg text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-sky-400/20 mb-6">
                ٣
              </div>
              <h3 className="text-base font-black text-slate-800">اختر الأفضل</h3>
              <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-[15rem]">
                قارن بين العروض المختلفة والتقييمات السابقة، واختر الشخص الأنسب لطلبك بثقة.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES GRID SECTION */}
      <section className="py-20 bg-slate-50/70 border-b border-gray-150">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">فئات مهام واسعة بمتناول يدك</h2>
            <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">أفضل المتخصصين ينتظرونك هنا للقيام بجميع أنواع الطلبات والفعاليات</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categoriesList.map((category) => {
              const IconComp = category.icon;
              return (
                <motion.div
                  key={category.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={onExploreClick}
                  className="bg-white border border-gray-150 p-6 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer text-right flex flex-col justify-between group"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${category.color} mb-4 transition-transform group-hover:scale-105 duration-200`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                      {category.ar}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-semibold leading-normal">
                      {category.descAr}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. TRUST / FEATURES SECTION */}
      <section className="py-20 bg-white border-b border-gray-150 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Trust Badges Details */}
            <div className="text-right">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">لماذا يثق الآلاف في منصة Tasker؟</h2>
              <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium leading-relaxed mb-10">منصة مرنة تمنحك تحكماً كاملاً وحماية متناهية لمستحقاتك والخصوصية</p>
              
              <div className="space-y-6">
                
                {/* Safe Payments */}
                <div className="flex gap-4 items-start flex-row-reverse text-right">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl mt-1 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800">دفع آمن بالكامل</h3>
                    <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed">الميزانية تظل محفوظة ولا تُصرف لمقدم الخدمة إلا بعد انتهاء العمل ورضاك التام.</p>
                  </div>
                </div>

                {/* Ratings */}
                <div className="flex gap-4 items-start flex-row-reverse text-right">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl mt-1 shrink-0">
                    <Star className="w-5 h-5 fill-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800">تقييمات حقيقية للمستخدمين</h3>
                    <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed">تاريخ حافل لكل مقدم خدمة بتقييمات حقيقية وشفافة كتبها عملاء حقيقيون.</p>
                  </div>
                </div>

                {/* Direct chat */}
                <div className="flex gap-4 items-start flex-row-reverse text-right">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl mt-1 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800">تواصل مباشر داخل المنصة</h3>
                    <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed">تواصل وارسل تفاصيل إضافية والتعليمات بدقة عبر نظام المحادثات الآمن.</p>
                  </div>
                </div>

                {/* Speed */}
                <div className="flex gap-4 items-start flex-row-reverse text-right">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-xl mt-1 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800">سرعة فائقة في إنجاز المهام</h3>
                    <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed">احصل على عروض تنفيذ أولية خلال دقائق معدودة من نشر طلبك.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Premium Illustration banner */}
            <div className="flex justify-center items-center">
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="w-full max-w-[28rem] bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 relative overflow-hidden"
              >
                {/* Decorative absolute element */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <h3 className="text-lg font-black tracking-tight mb-2 text-right">رأيك وأمانك أهم أولوياتنا</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6 text-right">خوارزميات فحص متقدمة وعمليات تحقيق بالهوية تضمن بيئة عمل راقية ومريحة لجميع أفراد المجتمع.</p>
                
                <div className="border-t border-slate-800/85 pt-6 flex justify-between items-center flex-row-reverse">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black mr-1 text-slate-100">4.9/5</span>
                  </div>
                  <span className="text-[10px] text-slate-450 uppercase font-black uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">موثوق ومصادق آمن</span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CTA FINAL SECTION */}
      <section className="py-20 relative overflow-hidden text-center bg-gradient-to-l from-blue-600 to-indigo-700 text-white">
        {/* Soft background light */}
        <div className="absolute top-0 left-12 w-96 h-96 bg-white/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-96 h-96 bg-sky-400/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-black">{isRTL ? 'ابدأ الآن ووفّر وقتك' : 'Gagnez du temps dès aujourd’hui'}</h2>
          <p className="mt-4 text-xs sm:text-sm text-blue-100 font-semibold leading-relaxed max-w-xl mx-auto">
            انضم إلى مجتمعنا المتنامي اليوم، وانشر مهامك مجاناً لتبدأ في استقبال عروض الأسعار التنافسية فوراً.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={onPostTask}
              className="bg-white hover:bg-slate-50 text-blue-750 font-black text-sm px-8 py-4 rounded-2xl shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <span>انشر مهمتك مجاناً</span>
              <PlusCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreClick}
              className="bg-blue-700/80 hover:bg-blue-700 text-white font-black text-sm px-6 py-4 rounded-2xl border border-blue-500 transition-all cursor-pointer flex items-center justify-center gap-1 w-full sm:w-auto"
            >
              <span>تصفح المهمات المفتوحة</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
