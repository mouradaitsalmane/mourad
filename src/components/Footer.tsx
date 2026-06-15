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
  onViewChange?: (view: 'home' | 'explorer' | 'dashboard' | 'admin' | 'how-it-works') => void;
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
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const e = document.getElementById('tasks-bento-grid');
                    if (e) e.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer"
                >
                  تصفح المهام
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const e = document.getElementById('navbar-post-task-trigger-btn');
                    if (e) e.click();
                  }}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer"
                >
                  انشر مهمة
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
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer"
                >
                  كيف يعمل Tasker
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('faq')}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer"
                >
                  الأسئلة الشائعة
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
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer"
                >
                  مركز المساعدة
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('privacy')}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer"
                >
                  سياسة الخصوصية
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('terms')}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer"
                >
                  الشروط والأحكام
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('about')}
                  className="text-slate-400 hover:text-[#60a5fa] text-xs font-semibold leading-relaxed transition-colors duration-200 cursor-pointer"
                >
                  اتصل بنا
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

            {/* Payment partners Grid - High Fidelity Brand Logo Cards */}
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              
              {/* Visa Logo Card */}
              <div 
                className="group p-3 rounded-2xl flex flex-col items-center justify-between select-none transition-all duration-300 hover:scale-[1.04] bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] h-16 min-w-[80px]"
                title="Visa Secure Network"
              >
                <div className="flex items-center justify-center h-6 text-slate-400 group-hover:text-blue-400 transition-colors duration-300">
                  <svg className="h-4 w-auto fill-current" viewBox="0 0 100 32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M37.89 1.15L31.29 29.85H22.7L29.3 1.15H37.89ZM60.84 1.15L55.15 21.65L54.34 17.5C52.74 9.15 45.41 2.35 36.85 1.15H48.16L55.51 29.85H63.95L76.15 1.15H60.84ZM22.5 1.15L15.34 21.65L12.44 7.15C11.39 3.1 6.8 1.45 2.15 1.15H0L0.15 1.75C4.19 2.75 7.64 4.65 10.15 7.3L17.84 29.85H26.3L38.44 1.15H22.5ZM97.85 1.15H91.19C84.95 1.15 81.35 4.8 81.35 10.3C81.35 18.25 91.95 18.7 91.95 23.35C91.95 25.1 90.05 26.65 86.45 26.65C81.45 26.65 77.4 24.55 75.3 23.35L74.1 22.65L72.95 28.5C76.2 30.15 81.15 31.15 86.15 31.15C93.45 31.15 99.85 27.25 99.85 20.35C99.85 11.5 89.15 11.05 89.15 7.15C89.15 5.8 90.5 4.45 93.65 4.45C97.75 4.45 101.3 6.1 103.1 7.15L104.2 7.8L105.3 1.95C102.95 1.15 100.41 1.15 97.85 1.15Z"/>
                  </svg>
                </div>
                <span className="text-[7.5px] font-sans font-extrabold text-slate-500 group-hover:text-blue-300 transition-colors duration-300 tracking-wider">VISA SECURE</span>
              </div>

              {/* Mastercard Logo Card */}
              <div 
                className="group p-3 rounded-2xl flex flex-col items-center justify-between select-none transition-all duration-300 hover:scale-[1.04] bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] h-16 min-w-[80px]"
                title="Mastercard Identity Check"
              >
                <div className="flex items-center justify-center h-6 text-slate-400 group-hover:text-blue-400 transition-colors duration-300">
                  <svg className="h-6 w-auto stroke-none fill-current" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7.5" cy="8" r="6" opacity="0.6"/>
                    <circle cx="16.5" cy="8" r="6" opacity="0.9"/>
                    <path d="M12 2.1A6 6 0 0 0 12 13.9A6 6 0 0 0 12 2.1Z" opacity="0.8"/>
                  </svg>
                </div>
                <span className="text-[7.5px] font-sans font-extrabold text-slate-500 group-hover:text-blue-300 transition-colors duration-300 tracking-wider">MASTERD ID</span>
              </div>

              {/* CMI Card */}
              <div 
                className="group p-3 rounded-2xl flex flex-col items-center justify-between select-none transition-all duration-300 hover:scale-[1.04] bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] h-16 min-w-[80px]"
                title="CMI (Centre Monétique Interbancaire) - Morocco"
              >
                <div className="flex items-center justify-center h-6 text-slate-400 group-hover:text-blue-400 transition-colors duration-300">
                  <svg className="h-5 w-auto stroke-current fill-none" viewBox="0 0 80 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 12C4 7.58 7.58 4 12 4" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M9 12C9 9 11 7 14 7" strokeWidth="2.5" strokeLinecap="round"/>
                    <ellipse cx="14" cy="14" rx="2" ry="2" className="fill-current"/>
                    <text x="24" y="17" className="fill-current font-black italic text-[13px] tracking-tight font-sans" stroke="none">cmi</text>
                  </svg>
                </div>
                <span className="text-[7.5px] font-sans font-extrabold text-slate-500 group-hover:text-blue-300 transition-colors duration-300 tracking-wider">{isRTL ? 'مضمونة CMI' : 'AGRÉÉ CMI'}</span>
              </div>

              {/* CIH Bank Logo Card */}
              <div 
                className="group p-3 rounded-2xl flex flex-col items-center justify-between select-none transition-all duration-300 hover:scale-[1.04] bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] h-16 min-w-[80px]"
                title="CIH Bank (سياش بنك)"
              >
                <div className="flex items-center justify-center h-6 text-slate-400 group-hover:text-blue-400 transition-colors duration-300">
                  <svg className="h-4.5 w-auto fill-current" viewBox="0 0 100 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 4 H15 L11 20 H1 Z" opacity="0.6" />
                    <path d="M13 4 H23 L19 20 H9 Z" opacity="0.9" />
                    <text x="28" y="15" className="fill-current font-black text-[11px] font-sans" stroke="none">CIH</text>
                    <text x="28" y="21" className="fill-current font-bold text-[6px] opacity-85 font-sans" stroke="none">BANK</text>
                  </svg>
                </div>
                <span className="text-[7.5px] font-sans font-extrabold text-slate-500 group-hover:text-blue-300 transition-colors duration-300 tracking-wider">{isRTL ? 'سياش موبايل' : 'CIH MOBILE'}</span>
              </div>

              {/* Attijariwafa Bank Logo Card */}
              <div 
                className="group p-3 rounded-2xl flex flex-col items-center justify-between select-none transition-all duration-300 hover:scale-[1.04] bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] h-16 min-w-[80px]"
                title="Attijariwafa Bank (التجاري وفا بنك)"
              >
                <div className="flex items-center justify-center h-6 text-slate-400 group-hover:text-blue-400 transition-colors duration-300">
                  <svg className="h-5.5 w-auto fill-current" viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(13, 14)">
                      <circle cx="0" cy="0" r="4.5" />
                      <path d="M-6 -6 L6 -6 L6 6 L-6 6 Z" opacity="0.6" transform="rotate(22.5)" />
                      <path d="M-6 -6 L6 -6 L6 6 L-6 6 Z" transform="rotate(67.5)" />
                    </g>
                    <text x="25" y="12" className="fill-current font-sans font-black text-[9px] tracking-tight" stroke="none">Attijariwafa</text>
                    <text x="25" y="20" className="fill-current font-sans font-black text-[7.5px] tracking-wide" stroke="none">bank</text>
                  </svg>
                </div>
                <span className="text-[7.5px] font-sans font-extrabold text-slate-500 group-hover:text-blue-300 transition-colors duration-300 tracking-wider">{isRTL ? 'وفا آمن' : 'WAFA NET'}</span>
              </div>

              {/* Banque Populaire Logo Card */}
              <div 
                className="group p-3 rounded-2xl flex flex-col items-center justify-between select-none transition-all duration-300 hover:scale-[1.04] bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] h-16 min-w-[80px]"
                title="Groupe Banque Populaire (البنك الشعبي)"
              >
                <div className="flex items-center justify-center h-6 text-slate-400 group-hover:text-blue-400 transition-colors duration-300">
                  <svg className="h-5.5 w-auto fill-current" viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="10.5" opacity="0.6" />
                    <circle cx="14" cy="14" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 16.5 C10.5 15.5, 11.5 13.5, 13 12 C14.5 10.5, 15.5 10, 16.5 10 C17 10, 18 11, 18.5 12 C18 12, 17.5 11.5, 16.5 11.5 C15.5 11.5, 14 12, 13.5 13.5 C13 15, 12 16, 11 16.5 Z" />
                    <text x="29" y="12" className="fill-current font-sans font-black text-[9.5px]" stroke="none">CHAABI</text>
                    <text x="29" y="20" className="fill-current font-sans font-bold text-[7px]" stroke="none">POPULAIRE</text>
                  </svg>
                </div>
                <span className="text-[7.5px] font-sans font-extrabold text-slate-500 group-hover:text-blue-300 transition-colors duration-300 tracking-wider">{isRTL ? 'الشعبي نت' : 'CHAABI PAY'}</span>
              </div>

              {/* Bank Of Africa Logo Card */}
              <div 
                className="group p-3 rounded-2xl flex flex-col items-center justify-between select-none transition-all duration-300 hover:scale-[1.04] bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] h-16 min-w-[80px]"
                title="Bank Of Africa - Groupe BMCE (بنك إفريقيا)"
              >
                <div className="flex items-center justify-center h-6 text-slate-400 group-hover:text-blue-400 transition-colors duration-300">
                  <svg className="h-5.5 w-auto stroke-current fill-none" viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="9.5" className="fill-current" stroke="none" opacity="0.4" />
                    <circle cx="14" cy="14" r="8.5" strokeWidth="1" />
                    <ellipse cx="14" cy="14" rx="8.5" ry="3.5" strokeWidth="1" />
                    <ellipse cx="14" cy="14" rx="3.5" ry="8.5" strokeWidth="1" />
                    <path d="M7 17 C9 12, 18 9, 21 14" strokeWidth="1.8" strokeLinecap="round" />
                    <text x="27" y="12" className="fill-current font-sans font-black text-[7.5px] tracking-tight" stroke="none">BANK OF</text>
                    <text x="27" y="20" className="fill-current font-sans font-black text-[8px] tracking-wide" stroke="none">AFRICA</text>
                  </svg>
                </div>
                <span className="text-[7.5px] font-sans font-extrabold text-slate-500 group-hover:text-blue-300 transition-colors duration-300 tracking-wider">{isRTL ? 'بنك إفريقيا' : 'BOA DIRECT'}</span>
              </div>

              {/* BMCI BNP Paribas Group */}
              <div 
                className="group p-3 rounded-2xl flex flex-col items-center justify-between select-none transition-all duration-300 hover:scale-[1.04] bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] h-16 min-w-[80px]"
                title="BMCI - Groupe BNP Paribas (البنك المغربي للتجارة والصناعة)"
              >
                <div className="flex items-center justify-center h-6 text-slate-400 group-hover:text-blue-400 transition-colors duration-300">
                  <svg className="h-5.5 w-auto fill-current" viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg">
                    <text x="2" y="14" className="fill-current font-sans font-black text-[13px]" stroke="none">BMCI</text>
                    <text x="2" y="22" className="fill-current font-sans font-extrabold text-[6.2px] opacity-80" stroke="none">BNP PARIBAS</text>
                    <g className="fill-current">
                      <path d="M54 12 L55.5 15.5 L59 15.5 L56 17.5 L57.5 21 L54 19 L50.5 21 L52 17.5 L49 15.5 L52.5 15.5 Z" />
                      <path d="M66 9 L67.2 11.8 L70 11.8 L67.6 13.4 L68.8 16.2 L66 14.6 L63.2 16.2 L64.4 13.4 L62 11.8 L64.8 11.8 Z" opacity="0.85" />
                      <path d="M76 7 L77 9 L79.2 9 L77.4 10.2 L78.2 12.2 L76 11 L73.8 12.2 L74.6 10.2 L72.8 9 L75 9 Z" opacity="0.7" />
                    </g>
                  </svg>
                </div>
                <span className="text-[7.5px] font-sans font-extrabold text-slate-500 group-hover:text-blue-300 transition-colors duration-300 tracking-wider">{isRTL ? 'مجموعة باريبا' : 'BMCI SECURE'}</span>
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
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl relative overflow-hidden flex flex-col text-right">
            
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setContactSuccess(false);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-250 text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-black text-slate-900">
                {activeModal === 'about' && 'من نحن • مهمات المغرب'}
                {activeModal === 'contact' && 'اتصل بنا المساعد المباشر'}
                {activeModal === 'privacy' && 'سياسة حماية البيانات والخصوصية'}
                {activeModal === 'terms' && 'اتفاقية شروط استخدام المنصة'}
                {activeModal === 'working' && 'كيف يعمل نظام Tasker العملي'}
                {activeModal === 'faq' && 'الأسئلة الشائعة والإرشادات'}
                {activeModal === 'help' && 'مركز المساعدة وقواعد الأمان'}
              </h3>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] text-xs leading-relaxed text-gray-700 font-semibold space-y-4">
              
              {activeModal === 'about' && (
                <div className="flex flex-col gap-3">
                  <div className="p-3.5 bg-blue-50 text-blue-900 rounded-xl border border-blue-100 italic">
                    تم تطوير منصة مهمات Tasker برعاية تكنولوجية محترفة لتوثيق الثقة وعمليات السداد الخدمي المنزلي في رباط الخير وسائر مدن المملكة.
                  </div>
                  <p>
                    مهمتنا هي تمكين كل أسرة تبحث عن خدمة منزلية ممتازة كالسباكة والتنظيف والمربيات، من العثور على شريك متميز وموثوق يحمل بطاقة الهوية المؤكدة.
                  </p>
                  <p>
                    تتميز المنصة بدعم حقيقي وتأمين مشفر للودائع المباشرة لحماية حقوق والتزامات الطرفين.
                  </p>
                </div>
              )}

              {activeModal === 'contact' && (
                <div className="flex flex-col gap-4">
                  <p>
                    الرجاء تعبئة النموذج أدناه للتواصل مباشرة مع إدارة الدعم الفني لمهمات Tasker. سيقوم فريقنا بالرد عليك خلال أقل من 12 ساعة.
                  </p>
                  
                  {contactSuccess ? (
                    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-center font-bold">
                      ✓ تم إرسال رسالتك بنجاح! شكراً للتواصل، سنقوم بالرد على بريدك الإلكتروني.
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-gray-700 font-bold">البريد الإلكتروني للرد</label>
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
                        <label className="text-gray-700 font-bold">نص الرسالة أو استفسار الشكوى</label>
                        <textarea 
                          rows={4}
                          required
                          value={contactMsg}
                          onChange={e => setContactMsg(e.target.value)}
                          placeholder="يرجى كتابة كافة تفاصيل طلبكم..."
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-slate-900 text-white font-extrabold py-3 rounded-xl hover:bg-slate-950 transition-colors cursor-pointer"
                      >
                        {submitting ? 'جاري الإرسال...' : 'إرسال الرسالة الآمنة لخدمة العملاء'}
                      </button>
                    </form>
                  )}

                  <div className="mt-2 pt-3 border-t border-gray-100 flex flex-col gap-2 text-right">
                    <span className="text-gray-450 text-[10px]">العنوان الإداري للمنصة:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 justify-end">
                      <span>شارع النخيل، حي الرياض، الرباط، المغرب</span>
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    </span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 justify-end">
                      <span>+212 537-778899</span>
                      <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                    </span>
                  </div>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div className="flex flex-col gap-3">
                  <p>
                    خصوصية سكان عاصمتنا هي حجر الأساس ومطلبنا الدائم. لا نقوم بمشاركة أرقام الهواتف أو معلومات الهوية الخاصة مع العامة أبداً.
                  </p>
                  <p>
                    يتم فقط تبادل وسائل الاتصال بعد موافقة العميل على عرض السعر ومصادقة المشرف لضمان عدم حدوث أي حرج.
                  </p>
                  <p>
                    جميع أصول البيانات والوثائق يتم تخزينها وتشفيرها محلياً وفقاً لقواعد حماية المعطيات الشخصية المعتمدة بالمغرب.
                  </p>
                </div>
              )}

              {activeModal === 'terms' && (
                <div className="flex flex-col gap-3">
                  <p>
                    نظام التشغيل يعتمد كلياً على الالتزام والأمانة المغربية الأصيلة، والمصلحة المشتركة المتبادلة بين الحرفي وطالب الخدمة.
                  </p>
                  <p>
                    يتعهد الحرفيون باتمام المهام بالأسعار والجودة والمواعيد المحددة بدقة.
                  </p>
                  <p>
                    يحق للمشرف حجز أو إلغاء الصفقات غير المكتملة وإرجاع تكاليف الضمان الفوري لأصحابها.
                  </p>
                </div>
              )}

              {activeModal === 'working' && (
                <div className="flex flex-col gap-3">
                  <p className="font-bold text-blue-650">نظام بسيط وسلس في ٣ خطوات:</p>
                  <ul className="list-decimal list-inside space-y-2">
                    <li><strong className="text-slate-900">انشر مهمتك مجاناً:</strong> حدد موقعك، الميزانية والتفاصيل المطلوبة بدقائق.</li>
                    <li><strong className="text-slate-900">اختر العرض الأنسب:</strong> استقبل عروض أسعار من حرفيين موثوقين وموثقين.</li>
                    <li><strong className="text-slate-900">سدد بأمان واسترخ:</strong> يدفع المبلغ فيSéquestre آمن ولا يسلم للحرفي إلا بعد تسليم العمل بنجاح.</li>
                  </ul>
                </div>
              )}

              {activeModal === 'faq' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h5 className="font-black text-slate-900 text-xs mb-1">هل التسجيل مجاني للعملاء؟</h5>
                    <p className="text-gray-600">نعم، التسجيل ونشر الصفقات مجاني تماماً بنسبة مئة في المئة.</p>
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-xs mb-1">كيف تتم عملية توثيق الحرفيين؟</h5>
                    <p className="text-gray-600">نطلب بطاقة الهوية الوطنية، فحص السجل المهني وحضور ورشة تدريب تقنية لضمان الكفاءة والأخلاق.</p>
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-xs mb-1">ماذا أفعل إن واجهت مشكلة؟</h5>
                    <p className="text-gray-600">يمكنك رفع شكوى فوراً لفض النزاع إدارياً عبر لوحة التحكم، وسيتدخل المشرف بمهنية للفصل.</p>
                  </div>
                </div>
              )}

              {activeModal === 'help' && (
                <div className="flex flex-col gap-3">
                  <p>
                    نوفر لجميع شركائنا في المغرب حماية مطلقة. لحجز موعد دعم عاجل أو طلب استشارة إدارية، يرجى التوجه لقسم الرسائل الفورية أو الاتصال بالرقم الأخضر المتاح طيلة اليوم.
                  </p>
                </div>
              )}

            </div>

            <div className="p-4 bg-slate-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setContactSuccess(false);
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </footer>
  );
}
