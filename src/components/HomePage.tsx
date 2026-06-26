import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Layers, 
  Star, 
  ShieldCheck, 
  CheckCircle, 
  PlusCircle, 
  Flame, 
  Compass, 
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  MessageSquare,
  BadgeCheck,
  CreditCard,
  Building,
  UserCheck,
  Phone,
  IdCard,
  ThumbsUp,
  Lock
} from 'lucide-react';
import { Task, UserProfile } from '../types';
import { SERVICE_CATEGORIES, RABAT_NEIGHBORHOODS } from '../data/rabatData';
import { motion } from 'motion/react';
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
  onLoginClick: (mode?: 'signin' | 'signup') => void;
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
  const [searchInput, setSearchInput] = useState('');
  const [openTrustId, setOpenTrustId] = useState<string | null>(null);

  // 4 Open tasks for showroom preview
  const openTasksPreview = tasks
    .filter(t => t.status === 'open' || t.status === 'held')
    .slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchSubmit(searchInput.trim());
    } else {
      onExploreClick();
    }
  };

  // Featured services requested list with coordinates
  const featuredServices = [
    {
      id: 'cleaning',
      ar: 'تنظيف المنازل',
      fr: 'Nettoyage de maison',
      img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
      taglineAr: 'تنظيف عميق، ترتيب وإزالة الغبار بكل مهارة',
      taglineFr: 'Nettoyage complet, repassage et rangement'
    },
    {
      id: 'moving',
      ar: 'نقل الأثاث',
      fr: 'Déménagement d’objets',
      img: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&q=80&w=600',
      taglineAr: 'شحن آمن وفك عالي الجودة لقطع أثاث البيت',
      taglineFr: 'Transport lourd, cartons et montage serein'
    },
    {
      id: 'plumbing',
      ar: 'السباكة',
      fr: 'Dépannage plomberie',
      img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600',
      taglineAr: 'إصلاح تسربات المياه وتركيب الحنفيات بكفاءة',
      taglineFr: 'Fuites d’eau, tuyauterie et ballons d’eau'
    },
    {
      id: 'electricity',
      ar: 'الكهرباء',
      fr: 'Travaux d’électricité',
      img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
      taglineAr: 'تركيب الإضاءة وتشخيص أعطال ليد والكهرباء',
      taglineFr: 'Pannes de courant, installations et luminaires'
    },
    {
      id: 'repairs',
      ar: 'الطلاء',
      fr: 'Travaux de peinture',
      img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600',
      taglineAr: 'صباغة الجدران ومعالجة الشقوق بجمالية عالية',
      taglineFr: 'Peinture de murs, finitions et traitement'
    },
    {
      id: 'gardening',
      ar: 'البستنة',
      fr: 'Jardinage & Entretien',
      img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600',
      taglineAr: 'قص الأعشاب، تزيين الأشجار والعناية بالنباتات',
      taglineFr: 'Tonte de pelouse, élagage et aménagement'
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50" id="tasker-airtasker-homepage">
      
      {/* 1. HERO SECTION (Split layout, white background with soft warm indigo-sky gradients, responsive auto-fitting height to prevent spacing overlaps) */}
      <section className="relative bg-white overflow-hidden border-b border-gray-100 flex flex-col justify-center min-h-[520px] lg:min-h-[600px] py-12 lg:py-20">
        {/* Soft elegant ambient glows inspired by premium marketplaces */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/30 via-white to-indigo-50/10 opacity-80 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[35rem] h-[35rem] bg-radial-gradient from-sky-200/20 to-transparent pointer-events-none blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full h-full flex items-center py-10 lg:py-0">
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            
            {/* RIGHT SIDE (RTL): Content Panel */}
            <div className={`lg:col-span-7 flex flex-col justify-center ${isRTL ? 'text-right lg:order-2' : 'text-left lg:order-1'}`}>
              
              {/* Premium micro badge */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-sky-50 text-sky-600 border border-sky-100 w-fit mb-5 self-center lg:self-start shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                <span>{isRTL ? 'سوق المساعدات المنزلية الموثوق بالرباط' : 'Réseau d’entraide locale certifié à Rabat'}</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-[45px] font-black text-slate-900 leading-[1.12] tracking-tight text-center lg:text-right"
              >
                {isRTL ? 'أنجز أي مهمة في الرباط بسرعة وأمان' : 'Faites réaliser n’importe quelle tâche à Rabat en toute sécurité'}
              </motion.h1>

              {/* Subheadline */}
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-sm sm:text-base text-gray-500 mt-4 font-semibold leading-relaxed text-center lg:text-right max-w-2xl mx-auto lg:mx-0"
              >
                {isRTL 
                  ? 'اعثر على أشخاص موثوقين للتنظيف، الصيانة، النقل، التوصيل والخدمات المنزلية.' 
                  : 'Trouvez des prestataires qualifiés et disponibles pour le ménage, le bricolage, le déménagement, la livraison et le jardinage.'}
              </motion.p>

              {/* Main Search Area (Large clean search card inspired by Airtasker) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-8 bg-white border border-gray-200 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-100/80 hover:shadow-2xl hover:border-gray-300 focus-within:ring-4 focus-within:ring-sky-500/10 focus-within:border-sky-500 transition-all text-right"
              >
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
                  
                  {/* Search Term input */}
                  <div className="flex-1 flex items-center gap-3 px-3 py-2 border-b md:border-b-0 md:border-l border-gray-100">
                    <Search className="w-5 h-5 text-sky-500 shrink-0" />
                    <input 
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder={isRTL ? 'ما المهمة التي تريد إنجازها؟' : 'De quelle tâche avez-vous besoin ?'}
                      className="w-full text-xs font-bold text-slate-800 bg-transparent border-none outline-none placeholder:text-gray-400 focus:ring-0 text-right"
                    />
                  </div>

                  {/* Location Selector (Rabat static representation with pin) */}
                  <div className="flex items-center gap-2 px-4 py-2 border-b md:border-b-0 md:border-l border-gray-100 cursor-default select-none shrink-0 justify-end md:justify-start">
                    <span className="text-xs font-black text-slate-700">{isRTL ? 'الرباط' : 'Rabat'}</span>
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>

                  {/* Submit / Publier CTA button container */}
                  <div className="flex items-center gap-1.5 p-1">
                    <button
                      type="submit"
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-black px-6 py-3.5 rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm shadow-sky-400/20 active:scale-98 flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4 shrink-0" />
                      <span>{isRTL ? 'أنشر مهمة' : 'Publier une tâche'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>

              {/* Secondary CTA underneath and Popular keywords */}
              <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                
                {/* Secondary CTA Link */}
                <button
                  type="button"
                  onClick={onExploreClick}
                  className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 bg-indigo-50/50 hover:bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100/50 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>{isRTL ? 'تصفح الخدمات' : 'Explorer les services'}</span>
                </button>

                <div className="h-4 w-px bg-slate-200 hidden sm:block" />

                {/* Popular labels */}
                <div className="flex flex-wrap items-center gap-2 justify-center">
                  <span className="text-[10px] text-gray-400 font-extrabold">{isRTL ? 'فئات شائعة:' : 'Recherches populaires :'}</span>
                  {[
                    { key: 'cleaning', ar: 'تنظيف المنزل', fr: 'Ménage' },
                    { key: 'moving', ar: 'نقل الأثاث', fr: 'Déménagement' },
                    { key: 'repairs', ar: 'صيانة منزلية', fr: 'Bricolage' }
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => onCategorySelect(cat.key)}
                      className="bg-slate-100 hover:bg-sky-50 hover:text-sky-600 text-[10px] font-bold text-slate-600 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {isRTL ? cat.ar : cat.fr}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* LEFT SIDE: Lifestyle high-quality image of worker with customer (desktop 75vh compatible, rounded 3xl) */}
            <div className={`lg:col-span-5 flex items-center justify-center h-full relative ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="w-full relative max-w-md lg:max-w-none aspect-[4/3] lg:aspect-square rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 group"
              >
                {/* Real high quality lifestyle helper photo */}
                <img 
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200" 
                  alt="Airtasker Clean Worker and Happy Customer" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating active status glass card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-between text-right font-sans">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute -inset-0.5 rounded-full bg-emerald-500 opacity-60 animate-ping" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 z-10" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-extrabold">{isRTL ? 'نشط بالرباط' : 'Actif à Rabat'}</span>
                  </div>
                  
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-black text-slate-800">{isRTL ? 'فاطمة الزهراء (تنظيف)' : 'Fatima Zohra (Ménage)'}</span>
                    <span className="text-[8.5px] text-sky-600 font-black flex items-center gap-0.5 justify-end mt-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                      <span>4.9 (48 {isRTL ? 'تقييم' : 'avis'})</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* TRUST INDICATORS ROW (Elegant independent high-contrast trust ribbon) */}
      <section className="border-b border-gray-150 bg-gradient-to-br from-sky-50/70 via-white to-emerald-50/50 py-12" id="homepage-trust-indicators-ribbon">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${isRTL ? 'direction-rtl' : ''}`}>
              
              {/* Indicator 1 */}
              <div className={`flex items-start gap-5 p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-sky-500 hover:shadow-2xl hover:shadow-sky-500/15 shadow-md shadow-slate-100 transition-all duration-300 group cursor-pointer ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-black shadow-md border-2 border-sky-200 group-hover:scale-110 transition-all duration-300 shrink-0 mt-1">
                  <UserCheck className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[20px] sm:text-[23px] lg:text-[25px] leading-[26px] sm:leading-[30px] lg:leading-[34px] transition-colors group-hover:text-blue-700" style={{ fontFamily: '"Cairo", sans-serif', color: '#0054ff' }}>
                    {isRTL ? 'مختلف الحسابات موثقة' : 'Profils vérifiés'}
                  </span>
                  <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-extrabold mt-2 leading-[20px] sm:leading-[24px]" style={{ fontFamily: '"Cairo", sans-serif', color: '#114d8b' }}>
                    {isRTL ? 'فحص كامل للهوية والبطاقة الوطنية المغربية ' : 'Certifiés avec CIN marocaine'}
                  </span>
                </div>
              </div>

              {/* Indicator 2 */}
              <div className={`flex items-start gap-5 p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/15 shadow-md shadow-slate-100 transition-all duration-300 group cursor-pointer ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shadow-md border-2 border-emerald-200 group-hover:scale-110 transition-all duration-300 shrink-0 mt-1">
                  <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[20px] sm:text-[23px] lg:text-[25px] leading-[26px] sm:leading-[30px] lg:leading-[34px] transition-colors group-hover:text-emerald-700" style={{ fontFamily: '"Cairo", sans-serif', color: '#0054ff' }}>
                    {isRTL ? 'ضمان مالي موثوق' : 'Paiement sécurisé'}
                  </span>
                  <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-extrabold mt-2 leading-[20px] sm:leading-[24px]" style={{ fontFamily: '"Cairo", sans-serif', color: '#114d8b' }}>
                    {isRTL ? 'تجميد مستحقاتك بأمان حتى اكتمال العمل' : 'Fonds sécurisés via Payzone Maroc'}
                  </span>
                </div>
              </div>

              {/* Indicator 3 */}
              <div className={`flex items-start gap-5 p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/15 shadow-md shadow-slate-100 transition-all duration-300 group cursor-pointer ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shadow-md border-2 border-amber-200 group-hover:scale-110 transition-all duration-300 shrink-0 mt-1">
                  <MapPin className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[20px] sm:text-[23px] lg:text-[25px] leading-[26px] sm:leading-[30px] lg:leading-[34px] transition-colors group-hover:text-amber-700" style={{ fontFamily: '"Cairo", sans-serif', color: '#0054ff' }}>
                    {isRTL ? 'تغطية واسعة بالرباط' : 'Couverture à Rabat'}
                  </span>
                  <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-extrabold mt-2 leading-[20px] sm:leading-[24px]" style={{ fontFamily: '"Cairo", sans-serif', color: '#114d8b' }}>
                    {isRTL ? 'أكدال، حي رياض، حسان وجميع أحياء العاصمة' : 'Agdal, Hay Riad, Hassan'}
                  </span>
                </div>
              </div>

              {/* Indicator 4 */}
              <div className={`flex items-start gap-5 p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/15 shadow-md shadow-slate-100 transition-all duration-300 group cursor-pointer ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black shadow-md border-2 border-purple-200 group-hover:scale-110 transition-all duration-300 shrink-0 mt-1">
                  <Phone className="w-8 h-8 animate-pulse stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[20px] sm:text-[23px] lg:text-[25px] leading-[26px] sm:leading-[30px] lg:leading-[34px] transition-colors group-hover:text-purple-750" style={{ fontFamily: '"Cairo", sans-serif', color: '#0054ff' }}>
                    {isRTL ? 'دعم متواصل 24/7' : 'Assistance clientèle'}
                  </span>
                  <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-extrabold mt-2 leading-[20px] sm:leading-[24px]" style={{ fontFamily: '"Cairo", sans-serif', color: '#114d8b' }}>
                    {isRTL ? 'مواكبة هاتفية وإرشاد فوري لكل المغاربة' : 'Conseillers locaux marocains'}
                  </span>
                </div>
              </div>

            </div>
          </div>
      </section>

      {/* 2. STATISTICS ROW (State-of-the-art cinematic luxury dark/oceanic design with glowing borders and ultra-crisp fonts) */}
      <section className="bg-gradient-to-br from-slate-950 via-sky-950 to-slate-950 text-white py-24 relative overflow-hidden shadow-2xl border-y border-sky-900/40" id="homepage-statistics-metrics">
        {/* Hospital/Caregiver assistance task background with low opacity overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src="/src/assets/images/hospital_task_bg_v2_1781456772520.jpg" 
            alt="Medical Assistance Task Background" 
            className="w-full h-full object-cover opacity-50 sm:opacity-60 contrast-110 saturate-100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-sky-950/40 to-slate-950/70" />
        </div>

        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-[130px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Stat 1 */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 p-8 sm:p-10 rounded-[2.5rem] bg-transparent border-none transition-all duration-300 hover:scale-[1.03] shadow-none group cursor-pointer ${isRTL ? 'sm:flex-row-reverse text-right' : 'sm:flex-row text-left'}`}>
              <div className="w-16 h-16 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-6 transition-transform duration-300">
                <Sparkles className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div className={`flex flex-col flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent tracking-tighter drop-shadow-md">100+</span>
                <span className="text-xs sm:text-sm font-black text-slate-200 tracking-wider uppercase mt-2" style={{ fontFamily: '"Cairo", sans-serif' }}>
                  {isRTL ? 'مهمة منشورة بنجاح' : 'Missions publiées'}
                </span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 p-8 sm:p-10 rounded-[2.5rem] bg-transparent border-none transition-all duration-300 hover:scale-[1.03] shadow-none group cursor-pointer ${isRTL ? 'sm:flex-row-reverse text-right' : 'sm:flex-row text-left'}`}>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-6 transition-transform duration-300">
                <BadgeCheck className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div className={`flex flex-col flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent tracking-tighter drop-shadow-md">50+</span>
                <span className="text-xs sm:text-sm font-black text-slate-200 tracking-wider uppercase mt-2" style={{ fontFamily: '"Cairo", sans-serif' }}>
                  {isRTL ? 'مقدم خدمة معتمد' : 'Prestataires certifiés'}
                </span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 p-8 sm:p-10 rounded-[2.5rem] bg-transparent border-none transition-all duration-300 hover:scale-[1.03] shadow-none group cursor-pointer ${isRTL ? 'sm:flex-row-reverse text-right' : 'sm:flex-row text-left'}`}>
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-6 transition-transform duration-300">
                <Star className="w-8 h-8 fill-amber-400/20 text-amber-400 stroke-[2.5]" />
              </div>
              <div className={`flex flex-col flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent tracking-tighter drop-shadow-md">95%</span>
                <span className="text-xs sm:text-sm font-black text-slate-200 tracking-wider uppercase mt-2" style={{ fontFamily: '"Cairo", sans-serif' }}>
                  {isRTL ? 'نسبة رضا العملاء' : 'Membres satisfaits'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED TASKER SPOTLIGHT (An exact creative representation of our local brand power) */}
      <section className="bg-slate-50 py-16 sm:py-20 border-b border-gray-100" id="homepage-tasker-spotlight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest">{isRTL ? 'قصص نجاح من مجتمعنا' : 'Héros du Quotidien'}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
              {isRTL ? 'تعرف على حِرفيي Tasker المتميزين' : 'Rencontrez nos Taskers d’élite'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-extrabold mt-1.5 leading-relaxed">
              {isRTL 
                ? 'نخبة من خيرة الصناع التقليديين والحرفيين بالرباط، ملتزمون بالجودة والأمان.'
                : 'Découvrez les parcours inspirants de professionnels qui font battre le cœur de Rabat.'}
            </p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden relative">
            <div className={`grid grid-cols-1 lg:grid-cols-12 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
              
              {/* IMAGE COLUMN */}
              <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto min-h-[350px] overflow-hidden group">
                <img 
                  src="/src/assets/images/featured_tasker_hassan_1781452296807.jpg" 
                  alt="Hassan - Tasker Spotlight" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 right-6 bg-sky-500 text-white text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                  {isRTL ? 'حرفي الشهر المميز' : 'Tasker Vedette'}
                </div>
              </div>

              {/* CONTENT COLUMN */}
              <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
                
                {/* Header Profile Info */}
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 flex items-center gap-2 justify-start sm:justify-start">
                        {isRTL ? 'حسن' : 'Hassan'}
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                      </h3>
                      <p className="text-xs text-sky-600 font-black tracking-widest uppercase mt-1">
                        {isRTL ? 'سباك وخبير صيانة عامة' : 'Plombier & Expert Travaux'}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className={`flex gap-6 border-slate-100 ${isRTL ? 'justify-end flex-row-reverse' : ''}`}>
                      <div className="text-center">
                        <span className="text-[10px] text-gray-400 font-black block uppercase tracking-wider">{isRTL ? 'التقييم العام' : 'Note Globale'}</span>
                        <span className="text-xl font-black text-slate-800 flex items-center gap-1 justify-center mt-1">
                          5 <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold block mt-0.5">{isRTL ? '73 تقييمًا' : '73 avis'}</span>
                      </div>
                      <div className="h-10 w-px bg-slate-100 self-center" />
                      <div className="text-center">
                        <span className="text-[10px] text-gray-400 font-black block uppercase tracking-wider">{isRTL ? 'معدل الإنجاز' : 'Taux d’achèvement'}</span>
                        <span className="text-xl font-black text-emerald-600 block mt-1">97%</span>
                        <span className="text-[9px] text-gray-400 font-bold block mt-0.5">{isRTL ? '73 مهمة مكتملة' : '73 tâches'}</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100 mb-6" />

                  {/* Specialties & Story */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-black text-slate-800 block mb-1">
                        {isRTL ? 'التخصصات:' : 'Spécialités :'}
                      </span>
                      <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                        {isRTL 
                          ? 'خدمات سباكة طارئة على مدار الساعة، تركيبات غاز، تجديدات المطابخ والحمامات، تشخيص تسريبات المياه المتقدم.' 
                          : 'Plomberie d’urgence 24/7, installations de gaz, rénovation de salle de bain & cuisine, détections de fuites avancées.'}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-black text-slate-800 block mb-1">
                        {isRTL ? 'توازن وحياة مهنية:' : 'À propos :'}
                      </span>
                      <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
                        {isRTL 
                          ? 'يعمل حسن في مجال السباكة منذ 11 عامًا، وانضم إلى منصة Tasker لتحقيق توازن أفضل بين العمل والحياة. وهو يستمتع بفرصة التواصل العالي مع جيرانه ومساعدة سكان الرباط بشكل مباشر ومجزي.'
                          : 'Fort de ses 11 années d’expérience en plomberie, Hassan a rejoint Tasker pour concilier liberté et revenus réguliers. Il apprécie la flexibilité et le contact enrichissant avec les habitants de Rabat.'}
                      </p>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className={`flex flex-wrap gap-3 mt-8 ${isRTL ? 'justify-start flex-row-reverse' : ''}`}>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-black">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'متحرك' : 'Mobile & Réactif'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'طريقة الدفع' : 'Paiement Sécurisé'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-black">
                      <IdCard className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'الهوية الرقمية' : 'Identité Vérifiée'}</span>
                    </div>
                  </div>
                </div>

                {/* Testimonial / Review snippet */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <span className={`text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'ما تقوله المراجعات' : 'Ce que disent ses clients'}
                  </span>
                  <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-100 italic font-semibold text-[11px] text-slate-600 relative ${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="leading-relaxed">
                      {isRTL 
                        ? '"ممتاز! كنت في مأزق حقيقي بسبب تسرب في الدش، وقد حضر في غضون ساعة. كان محترفًا للغاية، ملتزمًا بالمواعيد، وأنجز كل شيء بابتسامة ودودة."' 
                        : '"Excellent ! J’étais dans une galère monstre à cause d’un robinet cassé dans la douche. Hassan est arrivé super vite, équipé, poli et très compétent. Service impécable !"'}
                    </p>
                    <span className="text-[10px] font-black text-sky-600 block mt-2.5 not-italic">
                      — {isRTL ? 'نيك ك.' : 'Nick K.'}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION (Sequential 4 columns layout) */}
      <section className="bg-white py-16 sm:py-20 border-b border-gray-100" id="homepage-how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Title Header */}
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest">{isRTL ? 'خطوات مبسطة وآمنة' : 'Processus simple'}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2" id="how-it-works-title">
              {isRTL ? 'كيف تعمل منصة Tasker؟' : 'Comment fonctionne Tasker ?'}
            </h2>
            <p className="text-sm text-gray-400 font-bold mt-2.5">
              {isRTL 
                ? 'اتبع هذه الخطوات الأربع للحصول على تجربة إنجاز مهام موثوقة تضمن أمان مدفوعاتك.'
                : 'Faites régler vos soucis quotidiens en quatre étapes transparentes.'}
            </p>
          </div>

          {/* Sequential 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2.5xl border border-gray-100 hover:border-sky-200 hover:shadow-lg transition-all relative">
              <span className="absolute -top-4 bg-sky-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs" id="how-it-works-step-1">1</span>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 mb-4 shadow-xs mt-1">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                {isRTL ? 'أنشر المهمة' : 'Publiez la tâche'}
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed font-semibold">
                {isRTL 
                  ? 'اكتب مواصفات العمل المرجوة مجانًا، حدد الميزانية المناسبة والحي السكني بالرباط.'
                  : 'Décrivez votre besoin gratuitement à Rabat en précisant votre proposition de budget.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2.5xl border border-gray-100 hover:border-sky-200 hover:shadow-lg transition-all relative">
              <span className="absolute -top-4 bg-sky-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs" id="how-it-works-step-2">2</span>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 mb-4 shadow-xs mt-1">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                {isRTL ? 'استقبل العروض' : 'Recevez de devis'}
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed font-semibold">
                {isRTL 
                  ? 'احصل على عروض أسعار تنافسية من مزودي الخدمات الموثقين والمهنيين خلال دقائق.'
                  : 'Échangez avec des prestataires motivés et comparez librement les grilles de tarifs.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2.5xl border border-gray-100 hover:border-sky-200 hover:shadow-lg transition-all relative">
              <span className="absolute -top-4 bg-sky-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs" id="how-it-works-step-3">3</span>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 mb-4 shadow-xs mt-1">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                {isRTL ? 'اختر الشخص المناسب' : 'Sélectionnez le profil'}
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed font-semibold">
                {isRTL 
                  ? 'راجع سجل التوثيق والهوية الوطنية، التقنيات السابقة، والتقييمات قبل توظيف المستقل.'
                  : 'Consultez les badges d’identité certifiée (CIN) et avis pour faire le meilleur choix.'}
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2.5xl border border-gray-100 hover:border-sky-200 hover:shadow-lg transition-all relative">
              <span className="absolute -top-4 bg-sky-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs" id="how-it-works-step-4">4</span>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 mb-4 shadow-xs mt-1">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                {isRTL ? 'ادفع بعد الإنجاز' : 'Libérez après satisfaction'}
              </h4>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed font-semibold">
                {isRTL 
                  ? 'يتم حجز الميزانية بأمان وتجميدها في بوابة Payzone، ولا يتم تحريرها للحرفي إلا بعد إتمام العمل.'
                  : 'Gel des fonds chez Payzone. Le partenaire n’est payé qu’une fois la tâche finie avec succès.'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* NEW TRUST & SAFETY PREMIUM COHESIVE SECTION */}
      <section className="bg-white py-16 sm:py-24 border-b border-gray-100 relative overflow-hidden" id="homepage-trust-and-safety-features">
        {/* Soft designer glows */}
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-sky-200/20 rounded-full blur-[120px] pointer-events-none -translate-x-12" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-100/30 rounded-full blur-[140px] pointer-events-none translate-x-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center ${isRTL ? 'direction-rtl' : ''}`}>
            
            {/* LEFT COLUMN: HERO VISUALS (Portrait card with custom floating status badges & artistic layout) */}
            <div className={`lg:col-span-5 flex justify-center relative ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
              
              {/* Branded Vector Doodles & Blobs Backdrop */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-sky-400/5 to-indigo-500/5 rounded-[3rem] -rotate-3 scale-102 pointer-events-none" />
              
              {/* Blue Hand-Drawn / Stylized Flower Shapes backdrop imitating the Airtasker art style */}
              <div className="absolute top-4 right-4 w-72 h-72 bg-sky-400/10 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse-slow pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-72 h-72 bg-indigo-400/10 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse-slow pointer-events-none" />

              {/* MAIN CONTENT CARD */}
              <div className="relative w-full max-w-[380px] bg-slate-50/50 rounded-[2.5rem] p-4 border border-slate-100 shadow-xl shadow-slate-100/50 overflow-visible">
                
                {/* Embedded Main Portrait */}
                <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-sky-100 border-2 border-white shadow-inner group">
                  <img 
                    src="/src/assets/images/trust_and_safety_hero_1781456557013.jpg" 
                    alt={isRTL ? 'ميزات الأمان' : 'Trust and Safety Features'} 
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  {/* Vibrant artistic floral drawings in pure high-contrast overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-950/20 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Badge 1: 5.0 Overall Rating Card (Top Left) */}
                <div className={`absolute -top-6 -left-6 bg-white rounded-3xl p-4 shadow-xl border border-slate-100 flex items-center gap-3 max-w-[210px] transform hover:scale-105 transition-transform duration-300 ${isRTL ? '-left-6 right-auto' : '-left-6'}`}>
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" 
                      alt="Reviewer avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-black text-slate-900 flex items-center gap-1">
                      5.0 <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      {isRTL ? 'التقييم العام للمنصة' : 'Overall rating'}
                    </span>
                  </div>
                </div>

                {/* Badge 2: Job Completed Status Tag */}
                <div className={`absolute bottom-20 -right-6 bg-blue-50/95 backdrop-blur-md rounded-2xl py-3 px-4 shadow-lg border border-blue-100/50 flex items-center gap-2.5 max-w-[190px] transform hover:translate-x-1 transition-transform duration-300 ${isRTL ? '-left-6 right-auto text-right' : '-right-6 text-left'}`}>
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-900">
                      {isRTL ? 'تم إكمال المهمة بنجاح' : 'Job completed'}
                    </span>
                    <span className="text-[8px] text-blue-500 font-bold">2m ago</span>
                  </div>
                </div>

                {/* Badge 3: Payment Released Status Tag */}
                <div className={`absolute bottom-4 -right-2 bg-emerald-50/95 backdrop-blur-md rounded-2xl py-3 px-4 shadow-lg border border-emerald-100/50 flex items-center gap-2.5 max-w-[190px] transform hover:translate-x-1 transition-transform duration-300 ${isRTL ? '-left-2 right-auto text-right' : '-right-2 text-left'}`}>
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-900">
                      {isRTL ? 'تم تحرير المستحقات بسلام' : 'Payment released'}
                    </span>
                    <span className="text-[8px] text-emerald-500 font-bold">2m ago</span>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: TEXT INFRASTRUCTURE & SAFETY MAPPING */}
            <div className={`lg:col-span-7 flex flex-col justify-center ${isRTL ? 'lg:order-2 text-right' : 'lg:order-1 text-left'}`}>
              
              {/* Header Info */}
              <div className="mb-10">
                <span className="text-xs font-black text-sky-600 uppercase tracking-widest block mb-2">
                  {isRTL ? 'راحة بالكم هي غايتنا الأساسية' : 'SÉCURITÉ AVANT TOUT'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight" style={{ fontFamily: '"Cairo", sans-serif' }}>
                  {isRTL ? 'ميزات الثقة والأمان لحمايتك' : 'Garanties de confiance et de sécurité'}
                </h2>
              </div>

              {/* THREE SPECIFIC INTERACTIVE KEY VALUES */}
              <div className="space-y-6 mb-10">
                
                {/* 1. PAYMENTS */}
                <div className="group p-5 sm:p-6 rounded-3xl bg-slate-50/50 hover:bg-slate-50 border border-slate-200 hover:border-sky-300 transition-all duration-300">
                  <div className={`flex gap-4 items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col w-full">
                      <h4 className="text-base sm:text-lg font-black text-slate-900" style={{ fontFamily: '"Cairo", sans-serif' }}>
                        {isRTL ? 'مدفوعات آمنة ومحمية' : 'Paiements hautement sécurisés'}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-relaxed mt-1">
                        {isRTL 
                          ? 'لا تقم بتحويل الدفعة إلا بعد إتمام المهمة بما يرضيك بسلام بنسبة 100%.' 
                          : 'Vos fonds sont réservés en toute sécurité lors de l’attribution et ne sont transmis au Tasker que lorsque vous validez.'}
                      </p>
                      
                      <button 
                        onClick={() => setOpenTrustId(openTrustId === 'payments' ? null : 'payments')}
                        className={`text-xs font-black tracking-wider text-right flex items-center gap-1 mt-2 hover:underline cursor-pointer bg-transparent border-none p-0 ${isRTL ? 'justify-start text-sky-600 hover:text-sky-700' : 'justify-start text-sky-650 hover:text-sky-800'}`}
                      >
                        {openTrustId === 'payments' 
                          ? (isRTL ? 'إغلاق تفاصيل الدفع ↑' : 'Fermer ↑') 
                          : (isRTL ? 'اقرأ المزيد عن الضمان والأمان ←' : 'En savoir plus →')}
                      </button>

                      {openTrustId === 'payments' && (
                        <div className="mt-4 p-4 rounded-2xl bg-sky-50/50 border border-sky-100 text-xs text-sky-950 font-semibold leading-normal animate-fade-in">
                          {isRTL 
                            ? 'بفضل شراكتنا الاستراتيجية مع بوابات الدفع الوطنية وسياش والتجاري، فإننا نعتمد نظام الحجز المالي الآمن (Escrow). عند قبولك لعرض، يتم حجز المبلغ بأمان تام ولا يتم تحريره للحرفي إلا بعد مصادقتك الصريحة ورضاك الكامل عن الخدمة المقدمة!' 
                            : 'Grâce à notre partenaire bancaire sécurisé (conformité CMI), vos fonds sont placés sous séquestre dès l’attribution de la tâche. Ils ne sont versés au prestataire que lorsque vous confirmez la bonne réalisation des travaux.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. RATINGS */}
                <div className="group p-5 sm:p-6 rounded-3xl bg-slate-50/50 hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all duration-300">
                  <div className={`flex gap-4 items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Star className="w-6 h-6 fill-emerald-600/10" />
                    </div>
                    <div className="flex flex-col w-full">
                      <h4 className="text-base sm:text-lg font-black text-slate-900" style={{ fontFamily: '"Cairo", sans-serif' }}>
                        {isRTL ? 'تقييمات ومراجعات موثوقة' : 'Profils et avis 100% vérifiés'}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-relaxed mt-1">
                        {isRTL 
                          ? 'اختر الشخص المناسب للمهمة بناءً على التقييمات والمراجعات الحقيقية من المستخدمين الآخرين.' 
                          : 'Trouvez la personne idéale pour vous aider en consultant ses évaluations, photos de réalisations et badges.'}
                      </p>
                      
                      <button 
                        onClick={() => setOpenTrustId(openTrustId === 'ratings' ? null : 'ratings')}
                        className={`text-xs font-black tracking-wider text-right flex items-center gap-1 mt-2 hover:underline cursor-pointer bg-transparent border-none p-0 ${isRTL ? 'justify-start text-emerald-600' : 'justify-start text-emerald-600 hover:text-emerald-700'}`}
                      >
                        {openTrustId === 'ratings' 
                          ? (isRTL ? 'إغلاق التفاصيل ↑' : 'Fermer ↑') 
                          : (isRTL ? 'اقرأ المزيد عن التقييمات الشفافة ←' : 'En savoir plus →')}
                      </button>

                      {openTrustId === 'ratings' && (
                        <div className="mt-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 text-xs text-emerald-950 font-semibold leading-normal animate-fade-in">
                          {isRTL 
                            ? 'كل تقييم وساعة عمل مسجلة بالمنصة تنبع حصراً من عمليات توظيف حقيقية وسداد مكتمل عبر النظام. لا توجد تقييمات عشوائية أو حسابات وهمية؛ فمعايير النزاهة والشفافية هي قلب مجتمع Tasker.' 
                            : 'Chaque avis et note provient exclusivement de transactions réelles effectuées sur la plateforme. Notre charte de transparence garantit un écosystème sain, sans faux profils ni évaluations fictives.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. INSURANCE */}
                <div className="group p-5 sm:p-6 rounded-3xl bg-slate-50/50 hover:bg-slate-50 border border-slate-200 hover:border-purple-300 transition-all duration-300">
                  <div className={`flex gap-4 items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col w-full">
                      <h4 className="text-base sm:text-lg font-black text-slate-900" style={{ fontFamily: '"Cairo", sans-serif' }}>
                        {isRTL ? 'تأمين شامل لراحة البال' : 'Assurance civile & Tranquillité'}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-relaxed mt-1">
                        {isRTL 
                          ? 'نحن نوفر تأمين المسؤولية المدنية للعمال الذين يقومون بمعظم أنشطة المهام المنزلية بالمملكة.' 
                          : 'Nous mettons en place des assurances de responsabilité civile pour couvrir la grande majorité des prestations.'}
                      </p>
                      
                      <button 
                        onClick={() => setOpenTrustId(openTrustId === 'insurance' ? null : 'insurance')}
                        className={`text-xs font-black tracking-wider text-right flex items-center gap-1 mt-2 hover:underline cursor-pointer bg-transparent border-none p-0 ${isRTL ? 'justify-start text-purple-600' : 'justify-start text-purple-600 hover:text-purple-700'}`}
                      >
                        {openTrustId === 'insurance' 
                          ? (isRTL ? 'إغلاق التفاصيل ↑' : 'Fermer ↑') 
                          : (isRTL ? 'اقرأ المزيد عن التغطية التأمينية ←' : 'En savoir plus →')}
                      </button>

                      {openTrustId === 'insurance' && (
                        <div className="mt-4 p-4 rounded-2xl bg-purple-50/40 border border-purple-100 text-xs text-purple-950 font-semibold leading-normal animate-fade-in">
                          {isRTL 
                            ? 'سلامتك وحماية ممتلكاتك هي أولوية قصوى. تضمن منصة Tasker تغطية شاملة للمسؤولية المدنية للأعمال المنزلية المرخصة، مما يقي الطرفين شر أي حوادث أو أضرار عرضية قد تقع أثناء إنجاز الأعمال.' 
                            : 'Bénéficiez d\'une tranquillité d\'esprit absolue. Tasker couvre les prestations qualifiées par une police d\'assurance responsabilité civile contre les dommages matériels accidentels.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* ACTION CALL TO BUTTON */}
              <div className={`flex ${isRTL ? 'justify-start' : 'justify-start'}`}>
                <button
                  onClick={onPostTask}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-xl shadow-sky-500/25 hover:shadow-sky-500/35 transition-all cursor-pointer active:scale-95"
                >
                  {isRTL ? 'انشر مهمتك الآن مجاناً' : 'Publiez votre tâche gratuitement'}
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. FEATURED SERVICES SECTION (Renders the 6 requested services with full Unsplash real images) */}
      <section className="bg-slate-50/50 py-16 sm:py-20 border-b border-gray-100" id="homepage-featured-services-showroom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black text-sky-600 uppercase tracking-widest">{isRTL ? 'خدماتنا المتميزة' : 'Prestations Phares'}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
              {isRTL ? 'الخدمات المنزلية الأكثر طلباً بالعاصمة' : 'Services les plus populaires à Rabat'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-extrabold mt-1.5 leading-relaxed">
              {isRTL 
                ? 'استعرض التخصصات التي يفضلها سكان الرباط لتنظيم منازلهم وصيانة ممتلكاتهم.'
                : 'Sélectionnez parmi nos services à la carte pour simplifier l’organisation de vos journées.'}
            </p>
          </div>

          {/* Service Cards Grid (6 items, styled with large rounded cards, soft shadows & premium typography) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <div 
                key={service.id}
                onClick={() => onCategorySelect(service.id)}
                className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 transform hover:-translate-y-1 text-right flex flex-col justify-end h-64 cursor-pointer"
              >
                {/* Backdrop high-res image */}
                <div className="absolute inset-0">
                  <img 
                    src={service.img} 
                    alt={isRTL ? service.ar : service.fr} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle darkening gradient overlays for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-85" />
                </div>
                
                {/* Glassmorphic card label content overlay */}
                <div className="p-5 relative z-10 text-right">
                  <span className="text-[10px] font-black uppercase text-sky-400 tracking-widest mb-1.5 inline-block">
                    {service.id === 'repairs' && isRTL ? 'صباغة وطلاء' : service.id}
                  </span>
                  
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {isRTL ? service.ar : service.fr}
                  </h3>
                  
                  <p className="text-[10px] text-slate-300 mt-1 font-bold line-clamp-2">
                    {isRTL ? service.taglineAr : service.taglineFr}
                  </p>

                  <div className="mt-4 flex items-center justify-end text-[10px] text-white font-extrabold gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 text-sky-400">
                    <span>{isRTL ? 'اطلب الخدمة الآن' : 'Demander ce service'}</span>
                    <span>{isRTL ? '←' : '→'}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. HOMEPAGE ACTIVE SHOWROOM (Preserves core database lookups matching user goals) */}
      <section className="bg-white py-16 sm:py-20" id="homepage-active-tasks-showroom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
              <span className="text-xs font-black text-sky-600 tracking-wider uppercase flex items-center gap-1 sm:justify-start justify-center">
                <Flame className="w-4 h-4 text-orange-500 animate-pulse-slow" />
                <span>{isRTL ? 'مهمات عاجلة متاحة حالياً' : 'Tâches urgentes disponibles'}</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {isRTL ? 'آخر فرص العمل الشاغرة بمختلف أحياء الرباط' : 'Dernières offres publiées à Rabat'}
              </h2>
            </div>
            
            <button
              onClick={onExploreClick}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black px-5 py-2.5 rounded-xl transition-colors cursor-pointer active:scale-95"
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
              <Compass className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-500 mt-2">
                {isRTL ? 'لا توجد مهمات مفتوحة حالياً، كن أول من ينشر مهمة لقضاء حوائجه!' : 'Aucune tâche disponible pour le moment.'}
              </p>
              <button
                onClick={onPostTask}
                className="mt-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                {isRTL ? 'انشر مهمة الآن' : 'Poster une tâche'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {openTasksPreview.map((task) => {
                // Find neighborhood designation badge
                const neighborhood = RABAT_NEIGHBORHOODS.find(n => n.ar === task.location || n.fr === task.location);
                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskSelect(task)}
                    className="bg-slate-50 hover:bg-white border border-gray-200 hover:border-sky-500 rounded-3xl p-5 shadow-xs hover:shadow-md cursor-pointer text-right flex flex-col justify-between min-h-[190px] group transition-all duration-300 transform hover:-translate-y-1"
                    id={`showroom-task-id-${task.id}`}
                  >
                    <div>
                      <div className="flex items-center justify-between flex-row-reverse mb-3">
                        <span className="text-[10px] font-black uppercase text-indigo-750 bg-indigo-50 px-2.5 py-1 rounded-lg">
                          {task.category}
                        </span>
                        <span className="text-xs font-black text-rose-600">
                          {task.budget} {isRTL ? 'درهم' : 'MAD'}
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-black text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-1 mb-2">
                        {task.title}
                      </h4>
                      
                      <p className="text-[10px] text-gray-400 font-semibold line-clamp-3 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400/90 font-bold">
                      <span className="truncate max-w-[100px]">{task.posterName}</span>
                      <span className="flex items-center gap-0.5 text-gray-500">
                        <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
                        <span className="truncate max-w-[90px]">{isRTL ? neighborhood?.ar : neighborhood?.fr}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
