import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Layers, 
  Star, 
  ShieldCheck, 
  CheckCircle, 
  Play, 
  HeartHandshake, 
  PlusCircle, 
  Flame, 
  Award, 
  ArrowLeft, 
  ArrowRight, 
  Compass, 
  Users,
  Video
} from 'lucide-react';
import { Task, UserProfile } from '../types';
import { SERVICE_CATEGORIES, RABAT_NEIGHBORHOODS } from '../data/rabatData';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

interface HomePageProps {
  tasks: Task[];
  loadingTasks: boolean;
  lang: 'ar' | 'fr';
  user: any;
  userProfile: UserProfile | null;
  onPostTask: () => void;
  onExploreClick: () => void;
  onTaskSelect: (task: Task) => void;
  onSearchSubmit: (term: string) => void;
  onCategorySelect: (catId: string) => void;
  onLoginClick: () => void;
}

export default function HomePage({
  tasks,
  loadingTasks,
  lang,
  user,
  userProfile,
  onPostTask,
  onExploreClick,
  onTaskSelect,
  onSearchSubmit,
  onCategorySelect,
  onLoginClick
}: HomePageProps) {
  const isRTL = lang === 'ar';
  
  // Home states
  const [searchInput, setSearchInput] = useState('');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Filter open tasks to preview (up to 4 items in home)
  const openTasksPreview = tasks
    .filter(t => t.status === 'open')
    .slice(0, 4);

  // Localized statistics
  const stats = [
    { 
      number: '98%', 
      labelAr: 'نسبة رضا العملاء بالرباط', 
      labelFr: 'Satisfaction client à Rabat',
      icon: Star,
      color: 'text-amber-500'
    },
    { 
      number: '+3,500', 
      labelAr: 'مهمة منجزة بنجاح', 
      labelFr: 'Missions accomplies',
      icon: CheckCircle, 
      color: 'text-emerald-500' 
    },
    { 
      number: '100%', 
      labelAr: 'ضمان الدفع عبر Payzone', 
      labelFr: 'Sécurisé par Payzone',
      icon: ShieldCheck, 
      color: 'text-sky-500' 
    },
    { 
      number: '+15', 
      labelAr: 'حي مغطى بالرباط', 
      labelFr: 'Quartiers couverts',
      icon: MapPin, 
      color: 'text-indigo-500' 
    },
  ];

  // Steps how it works
  const steps = [
    {
      titleAr: '1. انشر مهمتكم بوضوح',
      titleFr: '1. Publiez votre tâche',
      descAr: 'حدد ما تحتاج إليه مجاناً، اذكر تفاصيل العمل والميزانية المتوقعة بحي السويسي، أكدال أو حسان.',
      descFr: 'Décrivez votre besoin gratuitement, indiquez le lieu à Rabat et fixez votre proposition de budget.'
    },
    {
      titleAr: '2. قارن عروض المستقلين المحترفين',
      titleFr: '2. Comparez les offres',
      descAr: 'تلقى عروض أسعار من خبراء الصيانة والخدمات المنزلية بالرباط، راجع تقييماتهم وملفهم الشخصي وعلامة توثيقهم.',
      descFr: 'Recevez des devis de taskers locaux qualifiés, vérifiez leurs profils certifiés et leurs évaluations.'
    },
    {
      titleAr: '3. أمّن ميزانيتك عبر Payzone المعترف بها',
      titleFr: '3. Sécurisez avec Payzone',
      descAr: 'نقوم بحفظ الميزانية آمنة في صندوق الأمانات ولا نسلمها للمستقل إلا بعد إتمام الخدمة وتأكيدك التام.',
      descFr: 'Votre paiement est conservé sous séquestre sécurisé CMI. Le tasker n’est payé qu’une fois la tâche finie.'
    }
  ];

  // Localized testimonials
  const testimonials = [
    {
      nameAr: 'مريم التازي',
      nameFr: 'Meryem Tazi',
      roleAr: 'طالبة خدمة - السويسي',
      roleFr: 'Client - Souissi',
      textAr: 'كنت بحاجة ماسة لتنظيف المنزل قبل مناسبة عائلية بالرباط. نشرت المهمة وحصلت على 4 عروض رائعة خلال دقائق، والخدمة كانت استثنائية وبكل أمان بفضل نظام الضمان المالي!',
      textFr: 'Superbe expérience ! J’avais besoin d’un nettoyage en urgence à Souissi. La plateforme m’a permis de recruter une femme de ménage impeccable et de payer via Payzone en toute tranquillité.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      rating: 5
    },
    {
      nameAr: 'يوسف بنجلون',
      nameFr: 'Youssef Benjelloun',
      roleAr: 'كهربائي موثق - أكدال',
      roleFr: 'Tasker certifié - Agdal',
      textAr: 'كمزود خدمة في أكدال، منصة ممتازة مكنتني من مضاعفة أعمالي وزيادة دخلي بشكل احترافي، شارة التوثيق منحتني ثقة كبرى وضمنت استلام مستحقاتي البنكية دون مماطلة.',
      textFr: 'Grâce au badge certifié RabatTasker, j’ai pu décrocher 5 fois plus de chantiers d’électricité sur Agdal. Le système d’escrow garantit que je serai payé à coup sûr.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      rating: 5
    },
    {
      nameAr: 'أمين العلمي',
      nameFr: 'Amine Alami',
      roleAr: 'طالب خدمة - حي الرياض',
      roleFr: 'Client - Hay Riad',
      textAr: 'خدمة الدعم الفني وتنسيق السباكة سريعة للغاية. السباك وصل مجهزاً بالكمامة والمعدات وأصلح حنفية المطبخ بحي الرياض بسعر منطقي ومحدد مسبقاً. أنصح به بشدة.',
      textFr: 'Simple, rapide et efficace pour réparer une fuite de plomberie à Hay Riad. Le prestataire est intervenu le jour même pour le montant fixe convenu.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      rating: 5
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchSubmit(searchInput.trim());
    } else {
      onExploreClick();
    }
  };

  return (
    <div className="flex-1 flex flex-col" id="rabattasker-homepage-container">
      
      {/* 1. Hero Showcase Block with Dynamic Search */}
      <section className="relative bg-white overflow-hidden border-b border-gray-100 flex-1 flex flex-col justify-center py-16 sm:py-24">
        {/* Abstract pattern backdrops */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 via-white to-indigo-500/5 opacity-70 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/30 via-transparent to-transparent opacity-60 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero text and Search */}
          <div className={`lg:col-span-7 flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100 w-fit mb-5 self-center sm:self-start"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>{isRTL ? 'منصة الخدمات المنزلية الأولى بالعاصمة الرباط' : 'N°1 de l’entraide et des services à Rabat'}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 leading-tight tracking-tight text-center sm:text-right"
            >
              {isRTL ? (
                <>
                  منصتكم المفضلة لحل جميع <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-700 font-extrabold">المهمات المنزلية</span> بالرباط
                </>
              ) : (
                <>
                  Réalisez tous vos <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-700">Services à Domicile</span> à Rabat
                </>
              )}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-sm sm:text-base text-gray-500 mt-4 leading-relaxed font-semibold max-w-xl text-center sm:text-right"
            >
              {isRTL 
                ? 'اربط طلبك فورياً بآلاف المستقلين الموثقين الجاهزين لمساعدتكم في أعمال الصيانة، الكهرباء، تنظيف البيوت، الطهي والبستنة بأي حي بالرباط.' 
                : 'Publiez votre besoin en quelques clics et recevez des propositions adaptées de professionnels de votre quartier à Rabat, sécurisées par Payzone Maroc.'}
            </motion.p>

            {/* Direct Search Bar Requirement */}
            <motion.form 
              onSubmit={handleSearchSubmit}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="mt-8 bg-white border border-gray-200 p-2 rounded-2xl shadow-lg hover:shadow-xl focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all flex flex-col sm:flex-row gap-2 max-w-2xl"
              id="hero-search-form"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={isRTL ? 'ما الذي تبحث عنه؟ (مثال: سباك بأكدال، تنظيف شقة...)' : 'De quoi avez-vous besoin ? (ex: électricien Agdal...)'}
                  className="w-full text-xs text-slate-800 bg-transparent border-none outline-none font-semibold focus:ring-0 placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-6 py-3 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                {isRTL ? 'ابحث عن مهمة' : 'Rechercher'}
              </button>
            </motion.form>

            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.35 }}
              className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-gray-400 font-bold justify-center sm:justify-start"
            >
              <span>{isRTL ? 'الكلمات الرائجة:' : 'Suggestions :'}</span>
              {['سباكة', 'تنظيف', 'كهرباء', 'توصيل هدايا'].map((word) => (
                <button
                  type="button"
                  key={word}
                  onClick={() => {
                    setSearchInput(word);
                    onSearchSubmit(word);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-md transition-colors"
                >
                  #{word}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Graphical Trust Widget */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 text-white p-7 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              {/* Decorative glows */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

              <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-5 justify-between">
                <div className="flex items-center gap-2">
                  <Logo size="sm" showText={false} />
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-sky-400">{isRTL ? 'منصة معتمدة' : 'Plateforme Agréée'}</span>
                    <span className="text-sm font-black text-white">Tasker</span>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                  {isRTL ? 'نشط الآن' : 'LIVE'}
                </div>
              </div>

              <div className="flex flex-col gap-4 text-right">
                <div className="bg-slate-950/55 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold">{isRTL ? 'المهمات الشاغرة اليوم:' : 'Tâches vacantes :'}</span>
                  <span className="text-base font-black text-sky-400">{tasks.filter(t => t.status === 'open').length}</span>
                </div>

                <div className="bg-slate-950/55 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold">{isRTL ? 'مزودي الخدمات النشطين:' : 'Taskers actifs :'}</span>
                  <span className="text-base font-black text-emerald-400">+182</span>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={onPostTask}
                    className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" />
                    <span>{isRTL ? 'انشر مهمة جديدة الآن' : 'Créer une tâche'}</span>
                  </button>

                  <button
                    onClick={onExploreClick}
                    className="w-full bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    {isRTL ? 'تصفح خريطة الرباط والمهام' : 'Explorer les tâches'}
                  </button>
                </div>
              </div>

              {/* Decorative Verified Stamp */}
              <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{isRTL ? 'مؤمن ومدعوم كلياً بنظام الحماية' : 'Sécurité certifiée RabatTasker'}</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 2. Beautiful Video Presentation Section */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 relative overflow-hidden" id="tasker-presentation-video-section">
        {/* Neon accent effects */}
        <div className="absolute top-[-50px] left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section text */}
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-xs font-black text-sky-400 uppercase tracking-widest">{isRTL ? 'دليل توضيحي مرئي' : 'Présentation vidéo'}</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              {isRTL ? 'كيف تعمل منصة مهمات الرباط؟' : 'Comment fonctionne RabatTasker ?'}
            </h2>
            <p className="text-sm text-slate-400 mt-3 font-semibold leading-relaxed">
              {isRTL 
                ? 'شاهد هذا العرض التوضيحي السريع لتتعرف على طريقة نشر طلبات الصيانة المنزليّة واختيار أفضل الحرفيين والتعامل بنظام الضمان المالي المعتمد.'
                : 'Découvrez en vidéo la simplicité pour poster vos tâches, négocier les tarifs et assurer vos règlements à Rabat.'}
            </p>
          </div>

          {/* Interactive Widescreen Player Panel */}
          <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 p-2 relative group/video">
            <div className="aspect-video relative rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
              
              {!videoPlaying ? (
                <>
                  {/* Decorative Thumbnail Backdrop with dynamic mockup look */}
                  <img 
                    src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1200" 
                    alt="Rabat Tasker Demo" 
                    className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-50 group-hover/video:scale-101 transition-transform duration-500"
                  />
                  {/* Glowing Play Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 flex flex-col items-center justify-center gap-4 text-center p-6">
                    <button
                      onClick={() => setVideoPlaying(true)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-sky-300/20 group-hover/video:ring-sky-500/30 animate-pulse-slow"
                    >
                      <Play className="w-8 h-8 fill-white ml-1 text-slate-900" />
                    </button>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-sky-400 uppercase tracking-widest">{isRTL ? 'فيديو الرعاية التوعوية' : 'Tutoriel interactif'}</span>
                      <span className="text-sm font-bold text-white">{isRTL ? 'شاهد الشرح الكامل في دقيقتين' : 'Regarder les explications (2 min)'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <video
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain bg-slate-950"
                  title="Rabat Tasker Tutorial"
                >
                  <source src="/assets/video.mp4" type="video/mp4" />
                  <source src="/video.mp4" type="video/mp4" />
                  <source src="/assets/uploaded_video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

            </div>
          </div>

          {/* Explanatory text below the video - REQUIREMENT */}
          <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-800/60">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl bg-slate-800/30 border border-slate-800/40 relative text-right flex flex-col gap-2 cursor-pointer transition-all hover:bg-slate-800/40 ${activeStep === idx ? 'ring-2 ring-sky-500 border-sky-500' : ''}`}
                onClick={() => setActiveStep(idx)}
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-black self-end">
                  {idx + 1}
                </div>
                <h4 className="text-xs font-extrabold text-white">
                  {isRTL ? step.titleAr : step.titleFr}
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  {isRTL ? step.descAr : step.descFr}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. Interactive Content Section: Benefits & Statistics */}
      <section className="bg-white py-16 sm:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Col: Explanatory statistics */}
            <div className={`lg:col-span-5 flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
              <span className="text-xs font-black text-sky-600 tracking-wider uppercase">{isRTL ? 'إحصائيات الثقة بالرباط' : 'Statistiques locales'}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-2 leading-tight">
                {isRTL ? 'لماذا يعتمد سكان الرباط على منصتنا؟' : 'Pourquoi nous faire confiance à Rabat ?'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-4 leading-relaxed font-semibold">
                {isRTL 
                  ? 'قمنا بتصميم نظام بيئي محلي يضمن مصلحة الطرفين لكي يجد سكان العاصمة المساعدة المنزلية الرائعة بأسعار بدون وسطاء ونوفر للمهنيين مدخول كافٍ وعمل مستمر.'
                  : 'Nous facilitons la vie des Rbatis avec une plateforme sécurisée pour toutes les réparations, la plomberie ou le jardinage à domicile sans intermédiaire.'}
              </p>

              {/* Grid of Micro stats */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-gray-100 flex flex-col gap-2">
                    <div className={`p-2 rounded-xl bg-white w-fit ${stat.color} self-end shadow-sm`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">{stat.number}</span>
                    <span className="text-[10px] text-gray-400 font-extrabold">{isRTL ? stat.labelAr : stat.labelFr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Category quick lookup - Interactive */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="p-6 sm:p-8 bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-3xl text-white relative overflow-hidden shadow-xl text-right">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl" />
                
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 justify-end">
                  <Layers className="w-5 h-5 text-sky-400" />
                  <span>{isRTL ? 'استكشف الخدمات الأكثر طلباً بالرباط' : 'Services les plus demandés à Rabat'}</span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 font-semibold leading-relaxed">
                  {isRTL 
                    ? 'اضغط على أي تخصص لتصفح المهمات المنشورة فورياً والتواصل مع طالبي الخدمة.'
                    : 'Cliquez sur une catégorie pour voir directement les offres correspondantes.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => onCategorySelect(cat.id)}
                      className="p-3 bg-slate-800/60 hover:bg-slate-800 hover:scale-102 border border-slate-700/50 hover:border-sky-500 rounded-xl text-right text-xs transition-all cursor-pointer flex flex-col justify-between min-h-[80px]"
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-extrabold text-white mt-2 mb-1">{isRTL ? cat.ar : cat.fr}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Interactive Testimonial Section - REQUIRED */}
      <section className="bg-slate-50 py-16 sm:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{isRTL ? 'آراء شركاء النجاح بالرباط' : 'Témoignages de confiance'}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
              {isRTL ? 'ماذا يقول سكان العاصمة عن خدماتنا؟' : 'Ce que disent nos utilisateurs'}
            </h2>
            <p className="text-sm text-gray-500 mt-2 font-semibold">
              {isRTL 
                ? 'ثقة مطلقة وتجارب حية من طالبي الخدمة ومزوديها بمختلف أحياء الرباط.' 
                : 'La satisfaction de notre communauté est notre priorité absolue de Salé à Témara.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, index) => (
              <motion.div 
                key={index} 
                whileHover={{ y: -5 }}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between text-right cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 flex-row-reverse">
                    <img 
                      src={test.avatar} 
                      alt={test.nameAr} 
                      className="w-11 h-11 rounded-full object-cover border-2 border-sky-100"
                    />
                    <div className="flex items-center gap-0.5">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed font-semibold italic">
                    "{isRTL ? test.textAr : test.textFr}"
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-50 flex flex-col">
                  <span className="text-xs font-black text-slate-900">{isRTL ? test.nameAr : test.nameFr}</span>
                  <span className="text-[9px] text-indigo-600 font-extrabold mt-0.5">{isRTL ? test.roleAr : test.roleFr}</span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Active Available Tasks Section (Body requirement) */}
      <section className="bg-white py-16 sm:py-20" id="homepage-active-tasks-showroom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
              <span className="text-xs font-black text-sky-600 tracking-wider uppercase flex items-center gap-1 sm:justify-start justify-center">
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                <span>{isRTL ? 'مهمات عاجلة متاحة حالياً' : 'Tâches urgentes disponibles'}</span>
              </span>
              <h2 className="text-2xl font-black text-slate-950 mt-1">
                {isRTL ? 'آخر فرص العمل الشاغرة بالرباط' : 'Dernières offres publiées'}
              </h2>
            </div>
            
            <button
              onClick={onExploreClick}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              {isRTL ? 'عرض كافة المهمات بالخريطة' : 'Voir toutes les tâches'}
            </button>
          </div>

          {loadingTasks ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="bg-slate-50 border border-gray-100 h-48 rounded-3xl" />
              ))}
            </div>
          ) : openTasksPreview.length === 0 ? (
            <div className="py-12 bg-slate-50 border-2 border-dashed border-gray-200/50 rounded-3xl text-center">
              <Compass className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-xs font-bold text-gray-500 mt-2">
                {isRTL ? 'لا توجد مهمات مفتوحة حالياً، كن أول من ينشر مهمة لقضاء حوائجه!' : 'Aucune tâche disponible pour le moment.'}
              </p>
              <button
                onClick={onPostTask}
                className="mt-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                {isRTL ? 'انشر مهمة الآن' : 'Poster une tâche'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {openTasksPreview.map((task) => {
                // Get neighborhood badge
                const neighborhood = RABAT_NEIGHBORHOODS.find(n => n.ar === task.location || n.fr === task.location);
                return (
                  <motion.div
                    key={task.id}
                    onClick={() => onTaskSelect(task)}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="bg-slate-50 hover:bg-white border border-gray-150-300 hover:border-sky-500 rounded-3xl p-5 shadow-xs hover:shadow-md cursor-pointer text-right flex flex-col justify-between min-h-[190px] group transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between flex-row-reverse mb-3">
                        <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {task.category}
                        </span>
                        <span className="text-xs font-black text-rose-600">
                          {task.budget} {isRTL ? 'درهم' : 'MAD'}
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1 mb-2">
                        {task.title}
                      </h4>
                      
                      <p className="text-[10px] text-gray-400 font-semibold line-clamp-3 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400/90 font-bold">
                      <span>{task.posterName}</span>
                      <span className="flex items-center gap-0.5 text-gray-500">
                        <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
                        <span>{isRTL ? neighborhood?.ar : neighborhood?.fr}</span>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
