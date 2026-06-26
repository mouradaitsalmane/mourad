import React from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  MessageSquare, 
  Zap, 
  Paintbrush, 
  Code, 
  Truck, 
  Camera, 
  Wrench, 
  Home, 
  Briefcase
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
  onExploreClick
}: HowItWorksPageProps) {
  const isRTL = lang === 'ar';

  const categoriesList = [
    {
      id: 'cleaning',
      ar: 'تنظيف وتطهير',
      fr: 'Propreté & Ménage',
      icon: Home,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      descAr: 'ترتيب المنازل، غسيل عميق وإزالة الغبار بمهنية.',
      descFr: 'Nettoyage professionnel de maisons, appartements ou bureaux.'
    },
    {
      id: 'design',
      ar: 'تصميم وعلامات',
      fr: 'Design & Graphisme',
      icon: Paintbrush,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      descAr: 'تصميم شعارات، هويات بصرية، ومطبوعات لترقية أعمالكم.',
      descFr: 'Logos raffinés, chartes graphiques et supports de communication.'
    },
    {
      id: 'programming',
      ar: 'برمجة ودعم تقني',
      fr: 'Informatique & Code',
      icon: Code,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      descAr: 'بناء مواقع ريسبرنسيف وحل مشاكل البرمجيات المختلفة سريعا.',
      descFr: 'Développement de sites, conseil technique et résolution de bugs.'
    },
    {
      id: 'moving',
      ar: 'نقل وتغليف الأثاث',
      fr: 'Aide au Déménagement',
      icon: Truck,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      descAr: 'فك، تركيب، ونقل الأواني والمفروشات بمدينة الرباط بسلام.',
      descFr: 'Transport de meubles et objets lourds en toute sécurité.'
    },
    {
      id: 'photography',
      ar: 'تصوير وإنتاج فيديو',
      fr: 'Vidéo & Photographie',
      icon: Camera,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      descAr: 'تغطية احترافية للمناسبات والأفراح بجودة سينمائية فائقة.',
      descFr: 'Captations pro pour vos cérémonies et shootings corporatifs.'
    },
    {
      id: 'maintenance',
      ar: 'صيانة وبناء خفيف',
      fr: 'Plomberie & Bricolage',
      icon: Wrench,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
      descAr: 'خدمات السباكة، الكهرباء، وصيانة الأعطال المنزلية الطارئة.',
      descFr: 'Interventions urgentes, électricité et petite maçonnerie.'
    },
    {
      id: 'home_chores',
      ar: 'خدمات رعاية منزلية',
      fr: 'Garde & Aide à domicile',
      icon: Home,
      color: 'bg-violet-50 text-violet-600 border-violet-100',
      descAr: 'مربيات أطفال، رعاية الطهي المنزلي المغربي وحراسة الفلل ومحبي الحيوانات.',
      descFr: 'Baby-sitting, cuisine traditionnelle marocaine et aide aux seniors.'
    },
    {
      id: 'freelance',
      ar: 'أعمال حرة وترجمة',
      fr: 'Secrétariat & Freelance',
      icon: Briefcase,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
      descAr: 'صياغة العقود بالعربية والفرنسية، الترجمة الفورية والتدقيق.',
      descFr: 'Aide comptable, traductions assermentées et secrétariat de qualité.'
    }
  ];

  return (
    <div 
      className="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden" 
      dir={isRTL ? 'rtl' : 'ltr'} 
      id="tasker-how-it-works-page"
    >
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-white py-16 lg:py-24 border-b border-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/15 via-white to-sky-50/20 opacity-90 pointer-events-none" />
        <div className="absolute top-0 left-12 w-[35rem] h-[35rem] bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-[20rem] h-[20rem] bg-sky-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Content Segment */}
            <div className={`lg:col-span-7 flex flex-col ${isRTL ? 'text-right items-start' : 'text-left items-start'} justify-center`}>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-600 border border-blue-100 mb-6 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                <span>{isRTL ? 'كيف يعمل منصتنا الجديدة بالكامل' : 'Comment fonctionne l’écosystème Tasker'}</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.28] tracking-tight"
                style={{ fontFamily: isRTL ? '"Cairo", sans-serif' : 'inherit' }}
              >
                {isRTL ? 'انشر مهمة. ' : 'Publiez une tâche. '}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-sky-500 font-extrabold">
                  {isRTL ? 'احصل على عروض.' : 'Recevez des offres réelles.'}
                </span>
                {isRTL ? ' أنجزها بسلام!' : ' Validez et souriez !'}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-6 text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-xl"
              >
                {isRTL 
                  ? 'Tasker هي منصة تربط بين الأشخاص الذين يحتاجون إنجاز مهام وبين مقدمي الخدمات المستعدين للعمل فوراً بالرباط والمغرب مع حماية تامة وحجز مالي آمن.' 
                  : 'Tasker est une plateforme de confiance qui connecte les particuliers et entreprises avec des prestataires indépendants réactifs, compétents et rigoureusement vérifiés par carte nationale à Rabat et au Maroc.'}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-8 flex flex-row items-center gap-4 w-full sm:w-auto"
              >
                <button
                  onClick={onPostTask}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-lg border border-blue-500 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <span>{isRTL ? 'ابدأ مجاناً الآن' : 'Créer un projet gratuit'}</span>
                  <PlusCircle className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={onExploreClick}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-black text-xs sm:text-sm px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl border border-gray-200 transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                >
                  <span>{isRTL ? 'تصفح المهمات المتاحة' : 'Consulter les offres'}</span>
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
                  className={`absolute top-4 ${isRTL ? 'right-2' : 'left-2'} bg-white rounded-2xl p-4 shadow-xl border border-slate-100 max-w-[17rem] transition-all hover:scale-103 duration-300 z-10`}
                  style={{ transform: isRTL ? 'rotate(2deg)' : 'rotate(-2deg)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[9px] uppercase tracking-widest font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {isRTL ? 'شيك الضمان نشط' : 'Escrow Actif'}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800">
                    {isRTL ? 'صيانة مكيف الهواء المنزلي' : 'Entretien de climatisation'}
                  </h4>
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-50 gap-4">
                    <span className="text-[9.5px] text-gray-400 font-bold">{isRTL ? 'الرباط، حي الرياض' : 'Hay Riad, Rabat'}</span>
                    <span className="text-xs font-black text-blue-600">350 DH</span>
                  </div>
                </div>

                <div 
                  className={`absolute bottom-4 ${isRTL ? 'left-2' : 'right-2'} bg-gradient-to-l from-blue-600 to-indigo-700 rounded-2xl p-4 shadow-xl border border-blue-500 max-w-[17rem] transition-all hover:scale-103 duration-300 z-20 text-white`}
                  style={{ transform: isRTL ? 'rotate(-3deg)' : 'rotate(3deg)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      <span className="text-[10px] font-black">{isRTL ? 'رأي العميل 5/5' : 'Avis 5/5'}</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-black bg-white/20 px-2 py-0.5 rounded-md text-white">
                      {isRTL ? 'مصادق وثقة' : 'Hautement qualifié'}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold leading-relaxed opacity-95">
                    {isRTL 
                      ? '"السباك مراد كان في غاية الكفاءة والأناقة وحل مشكل تسريب المياه في ساعة واحدة فقط!"' 
                      : '"Le plombier était courtois, excellent travail, réparation rapide de la fuite de cuisine !"'}
                  </p>
                  <div className={`mt-3 pt-2 text-[9px] font-black uppercase text-blue-200 border-t border-white/10 ${isRTL ? 'text-left' : 'text-right'}`}>
                    - {isRTL ? 'يوسف ك. (صاحب شقة)' : 'Youssef K.'}
                  </div>
                </div>

                {/* Grid backdrop accents */}
                <div className="absolute inset-10 border border-dashed border-sky-200/50 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '40s' }} />
                <div className="absolute inset-16 border border-slate-200/60 rounded-full pointer-events-none" />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (3 STEPS SECTION) */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900" style={{ fontFamily: isRTL ? '"Cairo", sans-serif' : 'inherit' }}>
              {isRTL ? 'أنجز مهامك بثلاث خطوات سهلة' : 'Comment ça marche pour les clients ?'}
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium">
              {isRTL 
                ? 'خطوات مرنة تضمن لك أمان الأموال بالضمان، تصفح سريع، وحل كافة أزماتك المنزلية.' 
                : 'Un fonctionnement transparent conçu pour simplifier vos travaux quotidiens de manière sécurisée.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 relative">
            {/* Connecting lines for desktop steps */}
            <div className="hidden md:block absolute top-[4rem] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-200 via-slate-100 to-blue-200 pointer-events-none" />

            {/* Step 1 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col items-center transition-all duration-300 relative z-10 hover:shadow-lg text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20 mb-6">
                1
              </div>
              <h3 className="text-base font-black text-slate-800" style={{ fontFamily: isRTL ? '"Cairo", sans-serif' : 'inherit' }}>
                {isRTL ? '1. انشر مهمتك مجاناً' : '1. Exprimez votre besoin'}
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-[17rem]">
                {isRTL 
                  ? 'صف المطلوب كالتنظيف أو السباكة، واكتب الميزانية والموعد المناسب ليتلقى العمال طلبك.' 
                  : 'Décrivez brièvement la tâche en fixant vos exigences de prix, délai et emplacement au Maroc.'}
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col items-center transition-all duration-300 relative z-10 hover:shadow-lg text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-l from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-400/20 mb-6">
                2
              </div>
              <h3 className="text-base font-black text-slate-800" style={{ fontFamily: isRTL ? '"Cairo", sans-serif' : 'inherit' }}>
                {isRTL ? '2. قارن عروض الأسعار' : '2. Recevez des offres'}
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-[17rem]">
                {isRTL 
                  ? 'ستتلقى عروض حقيقية وتنافسية من حرفيين موثقين متواجدين في الرباط بأسعار مذهلة.' 
                  : 'Des prestataires vérifiés à Hay Riad, Agdal ou Médina vous proposent leurs services en direct.'}
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col items-center transition-all duration-300 relative z-10 hover:shadow-lg text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-sky-400/20 mb-6">
                3
              </div>
              <h3 className="text-base font-black text-slate-800" style={{ fontFamily: isRTL ? '"Cairo", sans-serif' : 'inherit' }}>
                {isRTL ? '3. ادفع بحجز آمن ونفذ' : '3. Libérez après satisfaction'}
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-[17rem]">
                {isRTL 
                  ? 'احجز التكلفة في بوابتنا الآمنة، وسيتوجه الحرفي للبدء. لا نرسل رصيد الحرفي إلا بعد نيل رضاك التام.' 
                  : 'Payez par séquestre bancaire sécurisé. Le budget n’est libéré au prestataire qu’après validation.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES GRID SECTION */}
      <section className="py-20 bg-slate-50/70 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900" style={{ fontFamily: isRTL ? '"Cairo", sans-serif' : 'inherit' }}>
              {isRTL ? 'فئات مهام واسعة متوفرة بالمنصة' : 'Trouvez le bon pro parmi nos grandes catégories'}
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
              {isRTL 
                ? 'أفضل الحرفيين والمستشارين رهن إشارتكم لخدمتكم طيلة اليوم بكافة الأحياء.' 
                : 'Du bricolage urgent au secrétariat, nos Taskers marocains agréés gèrent vos imprévus.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categoriesList.map((category) => {
              const IconComp = category.icon;
              return (
                <motion.div
                  key={category.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={onExploreClick}
                  className={`bg-white border border-gray-200 p-6 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${category.color} mb-4 transition-transform group-hover:scale-105 duration-200`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors" style={{ fontFamily: isRTL ? '"Cairo", sans-serif' : 'inherit' }}>
                      {isRTL ? category.ar : category.fr}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-gray-400 mt-2 font-medium leading-relaxed">
                      {isRTL ? category.descAr : category.descFr}
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
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900" style={{ fontFamily: isRTL ? '"Cairo", sans-serif' : 'inherit' }}>
                {isRTL ? 'لماذا يثق الآلاف في منصة Tasker؟' : 'Pourquoi les Marocains choisissent Tasker ?'}
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium leading-relaxed mb-10">
                {isRTL 
                  ? 'بروتوكولات حديثة لتأمين الشفافية وحجز المستحقات والتحقق المهني لكل شريك.' 
                  : 'Un écosystème conçu pour éliminer les déconvenues des services à domicile informels.'}
              </p>
              
              <div className="space-y-6">
                
                {/* Safe Payments */}
                <div className={`flex gap-4 items-start ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl mt-1 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800">
                      {isRTL ? 'دفع آمن وضمان' : 'Séquestre Sécurisé & Protection'}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed">
                      {isRTL 
                        ? 'الميزانية تظل محفوظة بأمان ولا يتم تحرير الدفعة إلا بعد الانتهاء والرضا بنسبة 100%.' 
                        : 'Vos fonds sont réservés au chaud chez notre banque partenaire et libérés après validation.'}
                    </p>
                  </div>
                </div>

                {/* Ratings */}
                <div className={`flex gap-4 items-start ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl mt-1 shrink-0">
                    <Star className="w-5 h-5 fill-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800">
                      {isRTL ? 'تقييمات حقيقية وصادقة' : 'Avis d’utilisateurs 100% réels'}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed">
                      {isRTL 
                        ? 'كل التقاييم نابعة من أصحاب منازل حقيقيين قاموا بتوظيف وسداد الرصيد للحرفي.' 
                        : 'Pas d’avis fictifs : seuls les clients ayant payé de manière vérifiée peuvent évaluer.'}
                    </p>
                  </div>
                </div>

                {/* Direct chat */}
                <div className={`flex gap-4 items-start ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl mt-1 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800">
                      {isRTL ? 'نظام محادثة آمن ومشفر' : 'Messagerie Instantanée Privée'}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed">
                      {isRTL 
                        ? 'اتفق على التفاصيل وارسل الصور وقائمة المشتريات بكل سلاسة دون الكشف عن رقم هاتفك.' 
                        : 'Dialoguez, partagez des photos et planifiez l’intervention sans dévoiler votre numéro.'}
                    </p>
                  </div>
                </div>

                {/* Speed */}
                <div className={`flex gap-4 items-start ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-xl mt-1 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800">
                      {isRTL ? 'سرعة فائقة ومرونة' : 'Réponse en 10 minutes'}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed">
                      {isRTL 
                        ? 'انشر المهمة واستقبل أول العروض المناسبة من المحترفين خلال دقائق معدودة.' 
                        : 'Recevez instantanément de multiples estimations personnalisées de professionnels.'}
                    </p>
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
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <h3 className="text-lg font-black tracking-tight mb-2 text-right">
                  {isRTL ? 'رأيك وأمانك أهم أولوياتنا' : 'La qualité marocaine et la sécurité avant tout'}
                </h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6 text-right">
                  {isRTL 
                    ? 'عمليات تحقق ميكانيكية مشددة لوثائق الهوية لشركائنا الحرفيين تضمن راحة تامة وعملاً راقياً.' 
                    : 'Nous vérifions rigoureusement la carte d’identité de chaque prestataire inscrit afin de garantir la sérénité des foyers.'}
                </p>
                
                <div className="border-t border-slate-800/85 pt-6 flex justify-between items-center flex-row-reverse">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black mr-1 text-slate-100">4.9/5</span>
                  </div>
                  <span className="text-[10px] text-blue-200 uppercase font-black tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
                    {isRTL ? 'موثق ومؤمن بالكامل' : 'Agréé & Sécurisé'}
                  </span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CTA FINAL SECTION */}
      <section className="py-20 relative overflow-hidden text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute top-0 left-12 w-96 h-96 bg-white/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-96 h-96 bg-sky-400/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-black">
            {isRTL ? 'ابدأ الآن ووفّر وقتك وجدارتك' : 'Simplifiez-vous la vie dès aujourd’hui'}
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-blue-100 font-semibold leading-relaxed max-w-xl mx-auto">
            {isRTL 
              ? 'انضم لمجتمعنا بالرباط مجاناً، وانشر أولى صفقاتك المنزلية أو رعاية عائلتك لتلقي الأسعار.' 
              : 'Rejoignez la première communauté de services au Maroc. Publiez gratuitement et recevez vos estimations.'}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={onPostTask}
              className="bg-white hover:bg-slate-50 text-blue-800 font-extrabold text-xs sm:text-sm px-8 py-4 rounded-2xl shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <span>{isRTL ? 'انشر مهمتك مجاناً' : 'Publier un projet gratuit'}</span>
              <PlusCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreClick}
              className="bg-blue-700/80 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-7 py-4 rounded-2xl border border-blue-500 transition-all cursor-pointer flex items-center justify-center gap-1 w-full sm:w-auto"
            >
              <span>{isRTL ? 'تصفح طلبات العمل المفتوحة' : 'Voir toutes les missions'}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
