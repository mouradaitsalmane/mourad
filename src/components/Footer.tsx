import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/rabatData';
import FintechLogo from './FintechLogo';
import { 
  ShieldCheck, 
  Lock, 
  DollarSign, 
  Star, 
  HelpCircle, 
  Globe2, 
  Clock, 
  Zap, 
  MapPin, 
  X, 
  Mail, 
  Phone, 
  FileText, 
  MessageSquare,
  Facebook,
  Instagram,
  Linkedin,
  Compass,
  Briefcase,
  Layers,
  ArrowUp,
  Award
} from 'lucide-react';

interface FooterProps {
  lang: 'ar' | 'fr';
  setLang: (lang: 'ar' | 'fr') => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedNeighborhood: string;
  setSelectedNeighborhood: (neigh: string) => void;
  onViewChange?: (view: 'home' | 'explorer' | 'dashboard' | 'admin' | 'how-it-works' | 'gifts') => void;
}

export default function Footer({
  lang,
  setLang,
  selectedCategory,
  setSelectedCategory,
  selectedNeighborhood,
  setSelectedNeighborhood,
  onViewChange,
}: FooterProps) {
  const isRTL = lang === 'ar';

  // Modal active states
  const [activeModal, setActiveModal] = useState<'about' | 'contact' | 'privacy' | 'terms' | 'help' | 'faq' | 'working' | null>(null);

  // Contact form submission states
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Animated integers counters
  const [servicesCount, setServicesCount] = useState(1800);
  const [providersCount, setProvidersCount] = useState(900);

  useEffect(() => {
    const servicesTimer = setInterval(() => {
      setServicesCount(prev => {
        if (prev >= 2500) {
          clearInterval(servicesTimer);
          return 2500;
        }
        return prev + 35;
      });
    }, 25);

    const providersTimer = setInterval(() => {
      setProvidersCount(prev => {
        if (prev >= 1200) {
          clearInterval(providersTimer);
          return 1200;
        }
        return prev + 15;
      });
    }, 25);

    return () => {
      clearInterval(servicesTimer);
      clearInterval(providersTimer);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMsg) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setContactSuccess(true);
      setContactEmail('');
      setContactMsg('');
      setTimeout(() => setContactSuccess(false), 4000);
    }, 1200);
  };

  return (
    <footer 
      className="mt-20 text-slate-100 font-sans relative overflow-hidden" 
      id="tasker-premium-enterprise-footer"
      style={{
        background: 'linear-gradient(180deg, #04152d 0%, #03101f 100%)',
        borderTop: '1px solid rgba(59, 130, 246, 0.25)'
      }}
    >
      {/* Blue Ambient Glow Effect behind / within footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-56 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -right-40 -bottom-40 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-10">

        {/* ━━━━━━━━━━━━━━━━━━━━━━
            SECTION 1 — TRUST BAR
            ━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Card 1: Star */}
          <div 
            className="p-4 flex items-center gap-3.5 transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 text-right flex-row-reverse"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px'
            }}
          >
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Star className="w-5 h-5 fill-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-350">{isRTL ? 'تقييم متوسط 4.9/5' : 'Note moyenne de 4.9/5'}</span>
              <span className="text-[10px] text-slate-450 mt-0.5">{isRTL ? 'من آلاف العملاء بالرباط' : 'Par des milliers de clients'}</span>
            </div>
          </div>

          {/* Card 2: Safe Payments */}
          <div 
            className="p-4 flex items-center gap-3.5 transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 text-right flex-row-reverse"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px'
            }}
          >
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Lock className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-350">{isRTL ? 'مدفوعات آمنة 100%' : 'Transactions Sécurisées'}</span>
              <span className="text-[10px] text-slate-450 mt-0.5">{isRTL ? 'عبر بوابة Payzone و CMI' : 'Via protocole de séquestre'}</span>
            </div>
          </div>

          {/* Card 3: ID Verified */}
          <div 
            className="p-4 flex items-center gap-3.5 transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 text-right flex-row-reverse"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px'
            }}
          >
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-350">{isRTL ? 'حسابات موثقة ومؤمنة' : 'Prestataires Vérifiés'}</span>
              <span className="text-[10px] text-slate-450 mt-0.5">{isRTL ? 'تحقق مالي وفحص هوية صارم' : 'Contrôle strict d\'identité'}</span>
            </div>
          </div>

          {/* Card 4: Moroccan Identity */}
          <div 
            className="p-4 flex items-center gap-3.5 transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 text-right flex-row-reverse"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px'
            }}
          >
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-350">{isRTL ? 'منصة مغربية 100%' : 'Plateforme 100% Marocaine'}</span>
              <span className="text-[10px] text-slate-450 mt-0.5">{isRTL ? 'فريق دعم ومطورين محليين' : 'SaaS local basé à Rabat'}</span>
            </div>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━
            SECTION 2 — MAIN FOOTER
            ━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12 text-right">
          
          {/* COLUMN 1: BRAND */}
          <div className="lg:col-span-4 flex flex-col gap-4 text-right">
            <div className="flex items-center gap-3 justify-end">
              <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full select-none">
                🇲🇦 صنع للمغرب
              </span>
              <span className="font-sans font-black text-2xl tracking-tight text-white flex items-center select-none gap-1">
                <span className="text-blue-400">Tasker</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              منصة المهام المحلية الأولى في المغرب لربط العملاء بأصحاب الخدمات الموثوقين.
            </p>

            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              منصة آمنة تساعد سكان الرباط والمغرب على الوصول إلى مقدمي الخدمات الموثوقين بسرعة وسهولة.
            </p>

            <div className="flex items-center gap-3 justify-end mt-1 text-slate-400 text-xs">
              <button 
                onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
                className="flex items-center gap-1.5 hover:text-blue-400 transition-colors duration-200 cursor-pointer font-bold"
              >
                <Globe2 className="w-4 h-4 text-blue-400" />
                <span>{lang === 'ar' ? 'Français' : 'العربية'}</span>
              </button>
              <span className="text-slate-800">|</span>
              <span className="font-mono text-[10px] text-slate-550">v3.1.0 SSL Secured</span>
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase text-white tracking-widest border-b border-white/[0.06] pb-2">
              {isRTL ? 'روابط سريعة' : 'Navigation'}
            </h4>
            <ul className="space-y-2 mt-1">
              <li>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer text-right w-full flex justify-end"
                >
                  {isRTL ? 'الرئيسية' : 'Accueil'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const e = document.getElementById('tasks-bento-grid');
                    if (e) e.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer text-right w-full flex justify-end"
                >
                  {isRTL ? 'تصفح المهام' : 'Explorer les Missions'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const e = document.getElementById('navbar-post-task-trigger-btn');
                    if (e) e.click();
                  }}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer text-right w-full flex justify-end"
                >
                  {isRTL ? 'انشر مهمة' : 'Publier une Tâche'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (onViewChange) {
                      onViewChange('how-it-works');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      setActiveModal('working');
                    }
                  }}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer text-right w-full flex justify-end"
                >
                  {isRTL ? 'كيف يعمل Tasker' : 'Comment ça marche'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('faq')}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer text-right w-full flex justify-end"
                >
                  {isRTL ? 'الأسئلة الشائعة' : 'Foire Aux Questions'}
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: SUPPORT & LEGAL */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase text-white tracking-widest border-b border-white/[0.06] pb-2">
              {isRTL ? 'الدعم والقانونية' : 'Support & Légal'}
            </h4>
            <ul className="space-y-2 mt-1">
              <li>
                <button 
                  onClick={() => setActiveModal('help')}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer text-right w-full flex justify-end"
                >
                  {isRTL ? 'مركز المساعدة' : 'Centre d’Aide'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('privacy')}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer text-right w-full flex justify-end"
                >
                  {isRTL ? 'سياسة الخصوصية' : 'Politique de Confidentialité'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('terms')}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer text-right w-full flex justify-end"
                >
                  {isRTL ? 'الشروط والأحكام' : 'Conditions Générales'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('about')}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer text-right w-full flex justify-end"
                >
                  {isRTL ? 'من نحن • مهمتنا' : 'À Propos de Nous'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('contact')}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer text-right w-full flex justify-end"
                >
                  {isRTL ? 'اتصل بنا' : 'Contactez-Nous'}
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: PAYMENT METHODS (WITH CLASS FOR TARGETED SELECTOR) */}
          <div className="payment-methods-container lg:col-span-4 flex flex-col gap-3 text-right">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/[0.06] pb-2 text-right">
              {isRTL ? 'بوابات السداد المعتمدة والمضمونة' : 'Moyennes de paiements'}
            </h4>
            <span className="text-[10.5px] text-slate-400 font-bold block text-right">
              {isRTL ? 'الأداء الآمن والمدعوم من شركاء موثوقين بالمملكة والشركاء الدوليين' : 'Payez en toute sécurité via CMI et banques Marocaines'}
            </span>

            {/* Fictional Fintech Premium Brand Showcase: CrediZone Escrow */}
            <div className="mt-1 p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-amber-500/10 border border-blue-500/20 flex items-center justify-between gap-3 text-right group hover:border-amber-400/30 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
              <FintechLogo size="sm" showText={true} className="text-left" />
              <div className="flex flex-col text-right justify-center">
                <span className="text-[9.5px] font-extrabold text-blue-300 uppercase tracking-wider">{isRTL ? 'شريك الضمان الحصري' : 'Escrow Partner'}</span>
                <span className="text-[10.0px] font-bold text-slate-300">{isRTL ? 'تغطية مالية معتمدة 100%' : 'Garantie 100% Sécurisée'}</span>
              </div>
            </div>


          </div>

        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━
            SECTION 3 — TRUST STATISTICS
            ━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-8 border-y border-white/[0.06] mb-8">
          
          {/* Stat 1 */}
          <div className="p-3 text-center rounded-xl flex flex-col justify-center relative overflow-hidden"
               style={{
                 background: 'rgba(255,255,255,.04)',
                 backdropFilter: 'blur(10px)',
                 border: '1px solid rgba(255,255,255,.08)'
               }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <span className="text-xl font-black text-blue-400 tracking-tight">+{servicesCount}</span>
            <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{isRTL ? 'خدمة منجزة' : 'Missions Réalisées'}</span>
          </div>

          {/* Stat 2 */}
          <div className="p-3 text-center rounded-xl flex flex-col justify-center relative overflow-hidden"
               style={{
                 background: 'rgba(255,255,255,.04)',
                 backdropFilter: 'blur(10px)',
                 border: '1px solid rgba(255,255,255,.08)'
               }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <span className="text-xl font-black text-blue-400 tracking-tight">+{providersCount}</span>
            <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{isRTL ? 'مقدم خدمة موثق' : 'Prestataires Agréés'}</span>
          </div>

          {/* Stat 3 */}
          <div className="p-3 text-center rounded-xl flex flex-col justify-center relative overflow-hidden"
               style={{
                 background: 'rgba(255,255,255,.04)',
                 backdropFilter: 'blur(10px)',
                 border: '1px solid rgba(255,255,255,.08)'
               }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <span className="text-xl font-black text-blue-400 tracking-tight">4.9/5</span>
            <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{isRTL ? 'متوسط التقييم' : 'Note moyenne'}</span>
          </div>

          {/* Stat 4 */}
          <div className="p-3 text-center rounded-xl flex flex-col justify-center relative overflow-hidden"
               style={{
                 background: 'rgba(255,255,255,.04)',
                 backdropFilter: 'blur(10px)',
                 border: '1px solid rgba(255,255,255,.08)'
               }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <span className="text-xl font-black text-blue-400 tracking-tight">24/7</span>
            <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{isRTL ? 'دعم العملاء' : 'Support SLA'}</span>
          </div>

        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━
            SECTION 4 — SECURITY BADGES
            ━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-[10.5px] text-slate-400 font-semibold mb-8 border-b border-white/[0.04] pb-6 flex-row-reverse">
          <span className="flex items-center gap-1.5 transition-colors duration-200 hover:text-white select-none">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>🔒 حماية البيانات</span>
          </span>
          <span className="text-slate-850">•</span>
          <span className="flex items-center gap-1.5 transition-colors duration-200 hover:text-white select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>🛡️ حسابات موثقة</span>
          </span>
          <span className="text-slate-850">•</span>
          <span className="flex items-center gap-1.5 transition-colors duration-200 hover:text-white select-none">
            <DollarSign className="w-3.5 h-3.5 text-blue-400" />
            <span>💳 مدفوعات آمنة</span>
          </span>
          <span className="text-slate-850">•</span>
          <span className="flex items-center gap-1.5 transition-colors duration-200 hover:text-white select-none">
            <Zap className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>⚡ دعم سريع</span>
          </span>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━
            SECTION 5 — BOTTOM BAR
            ━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          
          {/* Scroll to Top button / Legal */}
          <div className="flex items-center gap-4">
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-1 bg-slate-900/50 border border-white/[0.06] hover:border-slate-750 px-3 py-1 bg-transparent hover:bg-white/[0.04] rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer font-sans"
            >
              <span>{isRTL ? 'العودة لأعلى الصفحة' : 'Retour en haut'}</span>
              <ArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <span>|</span>
            <span className="font-sans">© 2026 Tasker — جميع الحقوق محفوظة</span>
          </div>

          <div className="font-semibold text-slate-400 select-none">
            الرباط، المغرب 🇲🇦
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {[
              { id: 'fb', icon: Facebook, url: 'https://facebook.com' },
              { id: 'ig', icon: Instagram, url: 'https://instagram.com' },
              { id: 'ln', icon: Linkedin, url: 'https://linkedin.com' },
              { id: 'wa', icon: Phone, url: 'https://whatsapp.com' }
            ].map((social) => {
              const IconComp = social.icon;
              return (
                <a 
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer referrer"
                  className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-blue-500/40 text-slate-400 hover:text-blue-400 hover:scale-[1.1] transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] flex items-center justify-center cursor-pointer"
                >
                  <IconComp className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>

        </div>

      </div>

      {/* Interactive Detail Overlays */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm text-gray-950" id="footer-details-modal">
          <div className={`w-full max-w-lg bg-white rounded-3xl shadow-2xl relative overflow-hidden flex flex-col ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            
            <div className={`px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setContactSuccess(false);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-black text-slate-900">
                {activeModal === 'about' && (isRTL ? 'من نحن • مهمة منصتنا' : 'À Propos • Notre Mission')}
                {activeModal === 'contact' && (isRTL ? 'اتصل بنا المساعد المباشر' : 'Contactez Notre Support en Direct')}
                {activeModal === 'privacy' && (isRTL ? 'سياسة حماية البيانات والخصوصية' : 'Politique de Confidentialité')}
                {activeModal === 'terms' && (isRTL ? 'اتفاقية شروط استخدام المنصة' : 'Conditions Générales d’Utilisation')}
                {activeModal === 'working' && (isRTL ? 'كيف يعمل نظام Tasker العملي' : 'Comment fonctionne Tasker')}
                {activeModal === 'faq' && (isRTL ? 'الأسئلة الشائعة والإرشادات' : 'Questions Fréquentes & Aide')}
                {activeModal === 'help' && (isRTL ? 'مركز المساعدة وقواعد الأمان' : 'Centre d’Aide & Sécurité')}
              </h3>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] text-xs leading-relaxed text-gray-700 font-semibold space-y-4">
              
              {activeModal === 'about' && (
                <div className="flex flex-col gap-3">
                  <div className="p-3.5 bg-blue-50 text-blue-900 rounded-xl border border-blue-100 italic">
                    {isRTL 
                      ? 'تم تطوير منصة مهمات Tasker برعاية تكنولوجية محترفة لتوثيق الثقة وعمليات السداد الخدمي المنزلي في رباط الخير وسائر مدن المملكة.' 
                      : 'La plateforme Tasker a été développée pour garantir la confiance et la sécurité des paiements pour les services à domicile à Rabat et dans tout le Royaume.'}
                  </div>
                  <p>
                    {isRTL 
                      ? 'مهمتنا هي تمكين كل أسرة تبحث عن خدمة منزلية ممتازة كالسباكة والتنظيف والمربيات، من العثور على شريك متميز وموثوق يحمل بطاقة الهوية المؤكدة.' 
                      : 'Notre mission est de permettre à chaque foyer de trouver un prestataire qualifié (plomberie, ménage, électricité, etc.) dont l’identité a été rigoureusement vérifiée.'}
                  </p>
                  <p>
                    {isRTL 
                      ? 'تتميز المنصة بدعم حقيقي وتأمين مشفر للودائع المباشرة لحماية حقوق والتزامات الطرفين.' 
                      : 'La plateforme se distingue par un support de qualité et un système de séquestre sécurisé protégeant les transactions pour les deux parties.'}
                  </p>
                </div>
              )}

              {activeModal === 'contact' && (
                <div className="flex flex-col gap-4">
                  <p>
                    {isRTL 
                      ? 'الرجاء تعبئة النموذج أدناه للتواصل مباشرة مع إدارة الدعم الفني لمهمات Tasker. سيقوم فريقنا بالرد عليك خلال أقل من 12 ساعة.' 
                      : 'Veuillez remplir le formulaire ci-dessous pour contacter le support de Tasker. Notre équipe vous répondra sous 12h.'}
                  </p>
                  
                  {contactSuccess ? (
                    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-center font-bold">
                      {isRTL 
                        ? '✓ تم إرسال رسالتك بنجاح! شكراً للتواصل، سنقوم بالرد على بريدك الإلكتروني.' 
                        : '✓ Message envoyé avec succès ! Nous vous recontacterons par email rapidement.'}
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-gray-700 font-bold">
                          {isRTL ? 'البريد الإلكتروني للرد' : 'Votre adresse e-mail'}
                        </label>
                        <input 
                          type="email"
                          required
                          value={contactEmail}
                          onChange={e => setContactEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-gray-700 font-bold">
                          {isRTL ? 'نص الرسالة أو استفسار الشكوى' : 'Votre message ou réclamation'}
                        </label>
                        <textarea 
                          rows={4}
                          required
                          value={contactMsg}
                          onChange={e => setContactMsg(e.target.value)}
                          placeholder={isRTL ? 'يرجى كتابة كافة تفاصيل طلبكم...' : 'Veuillez décrire votre demande en détail...'}
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-slate-900 text-white font-extrabold py-3 rounded-xl hover:bg-slate-950 transition-colors cursor-pointer"
                      >
                        {submitting 
                          ? (isRTL ? 'جاري الإرسال...' : 'Envoi en cours...') 
                          : (isRTL ? 'إرسال الرسالة الآمنة لخدمة العملاء' : 'Envoyer le message sécurisé')}
                      </button>
                    </form>
                  )}

                  <div className={`mt-2 pt-3 border-t border-gray-100 flex flex-col gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <span className="text-gray-400 text-[10px]">{isRTL ? 'العنوان الإداري للمنصة:' : 'Adresse administrative :'}</span>
                    <span className={`font-bold text-slate-800 flex items-center gap-1.5 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                      {!isRTL && <MapPin className="w-4 h-4 text-blue-500 shrink-0" />}
                      <span>{isRTL ? 'شارع النخيل، حي الرياض، الرباط، المغرب' : 'Avenue des Palmiers, Hay Riad, Rabat, Maroc'}</span>
                      {isRTL && <MapPin className="w-4 h-4 text-blue-500 shrink-0" />}
                    </span>
                    <span className={`font-bold text-slate-800 flex items-center gap-1.5 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                      {!isRTL && <Phone className="w-4 h-4 text-emerald-500 shrink-0" />}
                      <span dir="ltr">+212 537-778899</span>
                      {isRTL && <Phone className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </span>
                  </div>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div className="flex flex-col gap-3">
                  <p>
                    {isRTL 
                      ? 'خصوصية سكان عاصمتنا هي حجر الأساس ومطلبنا الدائم. لا نقوم بمشاركة أرقام الهواتف أو معلومات الهوية الخاصة مع العامة أبداً.' 
                      : 'La confidentialité des données de nos utilisateurs est notre priorité absolue. Nous ne partageons jamais vos coordonnées téléphoniques ou vos pièces d’identité publiquement.'}
                  </p>
                  <p>
                    {isRTL 
                      ? 'يتم فقط تبادل وسائل الاتصال بعد موافقة العميل على عرض السعر ومصادقة المشرف لضمان عدم حدوث أي حرج.' 
                      : 'Les informations de contact ne sont communiquées qu’après votre acceptation d’une offre d’un artisan qualifié.'}
                  </p>
                  <p>
                    {isRTL 
                      ? 'جميع أصول البيانات والوثائق يتم تخزينها وتشفيرها محلياً وفقاً لقواعد حماية المعطيات الشخصية المعتمدة بالمغرب.' 
                      : 'Toutes les données personnelles sont stockées et chiffrées conformément aux exigences de la CNDP aux normes marocaines de protection des données.'}
                  </p>
                </div>
              )}

              {activeModal === 'terms' && (
                <div className="flex flex-col gap-3">
                  <p>
                    {isRTL 
                      ? 'نظام التشغيل يعتمد كلياً على الالتزام والأمانة المغربية الأصيلة، والمصلحة المشتركة المتبادلة بين الحرفي وطالب الخدمة.' 
                      : 'Notre plateforme repose sur l’intégrité, la confiance et le respect mutuel entre les prestataires indépendants et leurs clients.'}
                  </p>
                  <p>
                    {isRTL 
                      ? 'يتعهد الحرفيون باتمام المهام بالأسعار والجودة والمواعيد المحددة بدقة.' 
                      : 'Les artisans partenaires s’engagent à exécuter les travaux selon les tarifs acceptés et les délais convenus d’un commun accord.'}
                  </p>
                  <p>
                    {isRTL 
                      ? 'يحق للمشرف حجز أو إلغاء الصفقات غير المكتملة وإرجاع تكاليف الضمان الفوري لأصحابها.' 
                      : 'La plateforme conserve les fonds sous séquestre sécurisé. En cas de litige non résolu, le montant peut être restitué au client après vérification administrative.'}
                  </p>
                </div>
              )}

              {activeModal === 'working' && (
                <div className="flex flex-col gap-3">
                  <p className="font-bold text-blue-600">{isRTL ? 'نظام بسيط وسلس في ٣ خطوات:' : 'Un fonctionnement simple en 3 étapes :'}</p>
                  <ul className="list-decimal list-inside space-y-2">
                    {isRTL ? (
                      <>
                        <li><strong className="text-slate-900">انشر مهمتك مجاناً:</strong> حدد موقعك، الميزانية والتفاصيل المطلوبة بدقائق.</li>
                        <li><strong className="text-slate-900">اختر العرض الأنسب:</strong> استقبل عروض أسعار من حرفيين موثوقين وموثقين.</li>
                        <li><strong className="text-slate-900">سدد بأمان واسترخ:</strong> يدفع المبلغ فيSéquestre آمن ولا يسلم للحرفي إلا بعد تسليم العمل بنجاح.</li>
                      </>
                    ) : (
                      <>
                        <li><strong className="text-slate-900">Publiez gratuitement :</strong> Décrivez vos besoins, votre zone (Rabat et environs) et votre budget.</li>
                        <li><strong className="text-slate-900">Comparez les offres :</strong> Recevez des propositions directes d’artisans fiables dont l’identité a été validée.</li>
                        <li><strong className="text-slate-900">Libérez après satisfaction :</strong> Votre paiement reste au chaud sous séquestre sécurisé et n’est versé au prestataire qu’une fois la tâche finie et validée.</li>
                      </>
                    )}
                  </ul>
                </div>
              )}

              {activeModal === 'faq' && (
                <div className="flex flex-col gap-4">
                  {isRTL ? (
                    <>
                      <div>
                        <h5 className="font-black text-slate-900 text-xs mb-1">هل التسجيل مجاني للعملاء؟</h5>
                        <p className="text-gray-600">نعم، التسجيل ونشر الصفقات مجاني تماماً بنسبة مئة في المئة.</p>
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900 text-xs mb-1">كيف تتم عملية توثيق الحرفيين؟</h5>
                        <p className="text-gray-650">نطلب بطاقة الهوية الوطنية، فحص السجل المهني وحضور ورشة تدريب تقنية لضمان الكفاءة والأخلاق.</p>
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900 text-xs mb-1">ماذا أفعل إن واجهت مشكلة؟</h5>
                        <p className="text-gray-655">يمكنك رفع شكوى فوراً لفض النزاع إدارياً عبر لوحة التحكم، وسيتدخل المشرف بمهنية للفصل.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h5 className="font-black text-slate-900 text-xs mb-1">Est-ce gratuit d’utiliser la plateforme ?</h5>
                        <p className="text-gray-600">Oui, l’inscription et la publication de projets sont entièrement gratuites à 100%.</p>
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900 text-xs mb-1">Comment sont vérifiés les prestataires (Taskers) ?</h5>
                        <p className="text-gray-650">Nous exigeons le scan de la CIN, un contrôle des références et, si nécessaire, un entretien technique individuel.</p>
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900 text-xs mb-1">Que se passe-t-il en cas de problème sur un chantier ?</h5>
                        <p className="text-gray-650">Notre équipe de support client intervient comme tiers de confiance pour analyser le litige et débloquer la situation équitablement.</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeModal === 'help' && (
                <div className="flex flex-col gap-3">
                  <p>
                    {isRTL 
                      ? 'نوفر لجميع شركائنا في المغرب حماية مطلقة. لحجز موعد دعم عاجل أو طلب استشارة إدارية، يرجى التوجه لقسم الرسائل الفورية أو الاتصال بالرقم الأخضر المتاح طيلة اليوم.' 
                      : 'Nous garantissons un environnement d’échange sécurisé. Pour toute demande d’assistance urgente ou de médiation, notre ligne d’aide directe (le numéro vert) et notre chat interactif restent opérationnels 24h/24.'}
                  </p>
                </div>
              )}

            </div>

            <div className={`p-4 bg-slate-50 border-t border-gray-100 flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setContactSuccess(false);
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {isRTL ? 'إغلاق' : 'Fermer'}
              </button>
            </div>

          </div>
        </div>
      )}

    </footer>
  );
}
