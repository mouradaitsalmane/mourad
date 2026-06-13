import React, { useState } from 'react';
import { TRANSLATIONS, LanguageKey, RABAT_NEIGHBORHOODS, SERVICE_CATEGORIES } from '../data/rabatData';
import Logo from './Logo';
import { 
  ShieldCheck, 
  MapPin, 
  CheckCircle, 
  HelpCircle, 
  Compass, 
  Heart,
  Globe2,
  Lock,
  ChevronUp,
  X,
  Mail,
  Phone,
  Info,
  FileText,
  MessageSquare
} from 'lucide-react';

interface FooterProps {
  lang: LanguageKey;
  setLang: (lang: LanguageKey) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedNeighborhood: string;
  setSelectedNeighborhood: (neigh: string) => void;
}

export default function Footer({
  lang,
  setLang,
  selectedCategory,
  setSelectedCategory,
  selectedNeighborhood,
  setSelectedNeighborhood,
}: FooterProps) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  // Modal active states
  const [activeModal, setActiveModal] = useState<'about' | 'contact' | 'privacy' | 'terms' | null>(null);

  // Contact form submission states
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNeighborhoodSelect = (id: string) => {
    setSelectedNeighborhood(id);
    const element = document.getElementById('rabat-map-dashboard-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    const element = document.getElementById('tasks-bento-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Simulated messaging hub
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

  // Social sharing helpers
  const shareOnFacebook = () => {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank');
  };

  const shareOnTwitter = () => {
    window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent(isRTL ? 'منصة مهمات الرباط - خدمات منزلية موثوقة بالرباط!' : 'RabatTasker - Services à domicile à Rabat!'), '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent((isRTL ? 'استكشف منصة مهمات الرباط: ' : 'RabatTasker: ') + window.location.href), '_blank');
  };

  return (
    <footer className="mt-20 bg-slate-900 text-slate-200 border-t-4 border-sky-600 font-sans relative overflow-hidden" id="rabattasker-footer">
      {/* Decorative background vectors */}
      <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-32 -top-32 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Trust Banner with beautiful micro-cards */}
      <div className="border-b border-slate-800/80 bg-slate-950/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
            
            <div className={`flex items-start gap-3.5 p-4 rounded-2xl bg-slate-800/20 border border-slate-800/50 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-100">{isRTL ? 'توثيق وأمان العاصمة' : 'Confiance & Sécurité'}</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-semibold">
                  {isRTL 
                    ? 'يتم التحقق من بيانات الهوية والبريد لجميع المشاركين لضمان تعامل آمن وصادق بالرباط.' 
                    : 'Les identités des utilisateurs sont vérifiées pour garantir des transactions sereines.'}
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3.5 p-4 rounded-2xl bg-slate-800/20 border border-slate-800/50 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400 shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-100">{isRTL ? 'اتفاق مالي محلي مباشر' : 'Paiement Direct de Gré à Gré'}</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-semibold">
                  {isRTL 
                    ? 'بدون عمولات خفية! يتم تنسيق الدفع نقداً أو بالتراضي مباشرة بين الطرفين عند تسليم العمل.' 
                    : 'Aucun frais caché ! Les prix sont convenus d’avance et réglés directement à Rabat.'}
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3.5 p-4 rounded-2xl bg-slate-800/20 border border-slate-800/50 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-100">{isRTL ? 'تغطية جغرافية شاملة' : 'Couverture de Rabat'}</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-semibold">
                  {isRTL 
                    ? 'من أكدال وحي الرياض إلى تقدم وحسان والمنزه؛ نوفر خدماتنا لجميع أحياء الرباط.' 
                    : 'De l’Agdal à Hay Riad, en passant par Hassan et la Médina, nous couvrons tout Rabat.'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Columnar Site Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Col 1: Brand Pitch */}
        <div className="md:col-span-4 flex flex-col gap-4 text-right">
          <div className="flex items-center gap-3 justify-end md:justify-start">
            <Logo size="sm" showText={true} />
            <span className="text-[10px] text-sky-400 font-bold tracking-widest uppercase py-0.5 px-2 bg-sky-950/40 border border-sky-800/30 rounded-md">
              {isRTL ? 'الرباط' : 'Rabat'}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-semibold mt-2">
            {isRTL 
              ? 'Tasker هي منصة محلية مجانية تهدف لمساعدة سكان مدينة الرباط في العثور على مزودي خدمات موثوقين لحل مشاكل السباكة، الكهرباء، التنظيف المنزلي، البستنة بسعر عادل.'
              : 'Tasker est une plateforme locale gratuite aidant les résidents de Rabat à trouver des prestataires de confiance pour le ménage, la plomberie et le jardinage.'}
          </p>

          {/* Social Media Sharing Icons Requirement */}
          <div className="flex items-center gap-2.5 justify-end md:justify-start mt-2">
            <span className="text-[10px] text-slate-500 font-bold ml-1">{isRTL ? 'انشر المنصة:' : 'Partager :'}</span>
            
            <button 
              onClick={shareOnFacebook}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-sky-600 hover:scale-110 transition-all flex items-center justify-center text-white cursor-pointer"
              title="Partager sur Facebook"
              id="share-fb-btn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </button>
            <button 
              onClick={shareOnTwitter}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-950 hover:scale-110 transition-all flex items-center justify-center text-white cursor-pointer"
              title="Partager sur Twitter"
              id="share-tw-btn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button 
              onClick={shareOnWhatsApp}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:scale-110 transition-all flex items-center justify-center text-white cursor-pointer"
              title="Partager sur WhatsApp"
              id="share-wa-btn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.022-.015-.022-.015-.465-.24c-.213-.105-.465-.225-.57-.27-.105-.045-.18-.075-.255.045-.075.12-.3.375-.368.45-.067.075-.135.09-.255.03-.12-.06-1.545-.585-2.61-1.53-.825-.735-1.38-1.635-1.545-1.92-.165-.285-.015-.435.12-.57.12-.12.255-.285.39-.435.06-.06.105-.12.15-.195.045-.075.03-.15-.015-.24-.045-.09-.255-.615-.405-.975-.15-.36-.315-.315-.435-.315-.105 0-.225-.015-.345-.015-.12 0-.315.045-.48.225-.165.18-.63.615-.63 1.5s.645 1.74 1.74 1.89c.105.015 2.1 3.21 5.085 4.5 1.845.81 2.52.87 3.42.72.645-.105 1.98-.81 2.25-1.545.27-.735.27-1.365.195-1.5-.075-.135-.225-.21-.465-.33zM12 2C6.48 2 2 6.48 2 12c0 2.17.69 4.19 1.86 5.86L2 22l4.29-1.14A9.92 9.92 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.84 0-3.55-.5-5.01-1.35l-.36-.21-2.52.67.68-2.46-.23-.37A7.93 7.93 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 justify-end md:justify-start md:flex-row-reverse">
            <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              {isRTL ? 'آمن وموثوق فربيز' : 'Sécurité SSL / Auth'}
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-[11px] text-slate-500 font-bold">
              v2.0.0 (2026)
            </span>
          </div>
        </div>

        {/* Col 2: Quick Neighbourhood links */}
        <div className="md:col-span-4 flex flex-col gap-3 text-right">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 border-b border-slate-800 pb-2">
            {isRTL ? 'استكشف عروض أحياء الرباط' : 'Quartiers de Rabat'}
          </h4>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {RABAT_NEIGHBORHOODS.map(n => {
              const isActive = selectedNeighborhood === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => handleNeighborhoodSelect(n.id)}
                  className={`text-right text-xs transition-colors py-1 hover:text-sky-400 cursor-pointer ${
                    isActive ? 'text-sky-400 font-extrabold' : 'text-slate-400 font-semibold'
                  }`}
                >
                  📍 {isRTL ? n.ar : n.fr}
                </button>
              );
            })}
          </div>
        </div>

        {/* Col 3: Quick Category links */}
        <div className="md:col-span-4 flex flex-col gap-3 text-right">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 border-b border-slate-800 pb-2">
            {isRTL ? 'صفحات وموارد المنصة' : 'Pages d’information'}
          </h4>
          {/* REQUIREMENT Links To Pages */}
          <div className="flex flex-col gap-2 mt-1">
            <button
              onClick={() => setActiveModal('about')}
              className="text-right text-xs text-slate-400 hover:text-sky-400 font-bold flex items-center gap-1.5 justify-end cursor-pointer"
            >
              <span>{isRTL ? 'من نحن (فريق العمل)' : 'À propos de nous'}</span>
              <Info className="w-3.5 h-3.5 text-sky-500" />
            </button>
            <button
              onClick={() => setActiveModal('contact')}
              className="text-right text-xs text-slate-400 hover:text-sky-400 font-bold flex items-center gap-1.5 justify-end cursor-pointer"
            >
              <span>{isRTL ? 'اتصل بنا / الدعم المباشر' : 'Contactez-nous'}</span>
              <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
            </button>
            <button
              onClick={() => setActiveModal('privacy')}
              className="text-right text-xs text-slate-400 hover:text-sky-400 font-bold flex items-center gap-1.5 justify-end cursor-pointer"
            >
              <span>{isRTL ? 'سياسة الخصوصية وحماية البيانات' : 'Politique de confidentialité'}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            </button>
            <button
              onClick={() => setActiveModal('terms')}
              className="text-right text-xs text-slate-400 hover:text-sky-400 font-bold flex items-center gap-1.5 justify-end cursor-pointer"
            >
              <span>{isRTL ? 'شروط الخدمة والاتفاقية المالية' : 'Conditions d’utilisation'}</span>
              <FileText className="w-3.5 h-3.5 text-sky-400" />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Legal bar */}
      <div className="border-t border-slate-800/85 bg-slate-950/85 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold font-mono">
          
          {/* Scroll to Top button */}
          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer font-sans"
          >
            <span>{isRTL ? 'العودة لأعلى الصفحة' : 'Retour en haut'}</span>
            <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Social and Language details */}
          <div className="flex items-center gap-4 font-sans">
            <button 
              onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Globe2 className="w-4 h-4" />
              <span>{lang === 'ar' ? 'Français' : 'العربية'}</span>
            </button>
            <span>|</span>
            <span>{isRTL ? 'شروط الاستخدام والخصوصية المحلية المغربية' : 'Conditions de Rabat'}</span>
          </div>

          <div className="font-sans">
            <span className="flex items-center gap-1">
              {isRTL ? 'صُنع بكل' : 'Fait avec'} 
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-0.5" /> 
              {isRTL ? 'لسكان عاصمة الأنوار الرباط © 2026' : 'pour les habitants de Rabat © 2026'}
            </span>
          </div>

        </div>
      </div>

      {/* Interactive Detail Overlays for Footer Links */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs text-gray-900" id="footer-details-modal">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl relative overflow-hidden flex flex-col text-right">
            
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setContactSuccess(false);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 cursor-pointer"
                id="close-footer-modal-btn"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-black text-slate-900">
                {activeModal === 'about' && (isRTL ? 'من نحن • مهمات الرباط' : 'À propos de RabatTasker')}
                {activeModal === 'contact' && (isRTL ? 'اتصل بنا المساعد المباشر' : 'Dernier contact de support')}
                {activeModal === 'privacy' && (isRTL ? 'سياسة حماية البيانات والخصوصية' : 'Politique de confidentialité')}
                {activeModal === 'terms' && (isRTL ? 'اتفاقية شروط استخدام المنصة' : 'Conditions générales')}
              </h3>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] text-xs leading-relaxed text-gray-600 font-semibold space-y-4">
              
              {activeModal === 'about' && (
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-sky-55/40 text-sky-850 rounded-xl border border-sky-100 italic">
                    {isRTL 
                      ? 'تم تطوير منصة مهمات الرباط برعاية تكنولوجية عالية لتوثيق الثقة وعمليات الدعم الخدمي المنزلي في العاصمة الإدارية للمملكة.'
                      : 'RabatTasker est la première plateforme marocaine d’entraide locale reliant de manière sécurisée les clients et prestataires à Rabat.'}
                  </div>
                  <p>
                    {isRTL 
                      ? 'مهمتنا هي تمكين كل أسرة تبحث عن خدمة منزلية كالسباكة والتنظيف والمربيات، من العثور على شريك متميز وموثوق يحمل بطاقة الهوية المؤكدة.'
                      : 'Notre but est de structurer le marché des services à la personne d’Agdal aux Orangeries via l’innovation digitale.'}
                  </p>
                  <p>
                    {isRTL
                      ? 'تتميز المنصة بدعم حقيقي وبوابة دفع ذكية Payzone المغربية لتأمين الودائع المالية بشكل مشفر.'
                      : 'Notre technologie intègre le protocole de séquestre Payzone garantissant la satisfaction avant déblocage de l’argent.'}
                  </p>
                </div>
              )}

              {activeModal === 'contact' && (
                <div className="flex flex-col gap-4">
                  <p>
                    {isRTL 
                      ? 'الرجاء تعبئة النموذج أدناه للتواصل مباشرة مع إدارة الدعم الفني لمهمات الرباط. سيقوم فريقنا بالرد عليك خلال أقل من 12 ساعة.'
                      : 'Notre équipe de support basée à Rabat est disponible de 8h à 20h pour répondre à vos questions.'}
                  </p>
                  
                  {contactSuccess ? (
                    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-center font-bold">
                      {isRTL ? '✓ تم إرسال رسالتك بنجاح! شكراً للتواصل، سنقوم بالرد على بريدك الإلكتروني.' : '✓ Message envoyé avec succès ! Nous vous recontacterons sous peu.'}
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-gray-700 font-bold">{isRTL ? 'البريد الإلكتروني للرد' : 'E-mail de contact'}</label>
                        <input 
                          type="email"
                          required
                          value={contactEmail}
                          onChange={e => setContactEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-gray-700 font-bold">{isRTL ? 'نص الرسالة أو الاستفسار' : 'Votre message'}</label>
                        <textarea 
                          rows={4}
                          required
                          value={contactMsg}
                          onChange={e => setContactMsg(e.target.value)}
                          placeholder={isRTL ? 'يرجى كتابة كافة تفاصيل طلبكم...' : 'Votre message détaillé...'}
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-slate-900 text-white font-extrabold py-3 rounded-xl hover:bg-slate-950 transition-colors cursor-pointer"
                      >
                        {submitting ? (isRTL ? 'جاري الإرسال...' : 'Envoi...') : (isRTL ? 'إرسال الرسالة الآمنة' : 'Envoyer')}
                      </button>
                    </form>
                  )}

                  <div className="mt-2 pt-3 border-t border-gray-100 flex flex-col gap-2 text-right">
                    <span className="text-gray-400 text-[10px]">{isRTL ? 'العنوان الإداري:' : 'Adresse locale :'}</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 justify-end">
                      <span>{isRTL ? 'شارع النخيل، حي الرياض، الرباط، المغرب' : 'Avenue d’Anakhil, Hay Riad, Rabat, Maroc'}</span>
                      <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
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
                    {isRTL 
                      ? 'خصوصية سكان الرباط هي حجر الأساس لدينا. لا نقوم بمشاركة أرقام الهواتف أو معلومات الهوية مع العامة أبداً.'
                      : 'La protection de votre vie privée est cruciale pour RabatTasker.'}
                  </p>
                  <p>
                    {isRTL 
                      ? 'يتم عرض الأسماء الأولى فقط والأحياء الجغرافية (مثل: حسان، أكدال) لحماية هويات عائلات العاصمة المغربية.'
                      : 'Seuls vos prénoms et localités de Rabat sont visibles publiquement.'}
                  </p>
                  <p>
                    {isRTL 
                      ? 'عند قبولك لعرض أسعار معين، نقوم فقط بمشاركة رقم الهاتف المسجل لتسهيل الاتصال المباشر لإكمال المهمة.'
                      : 'Les détails de contact ne sont partagés qu’après attribution d’une tâche.'}
                  </p>
                </div>
              )}

              {activeModal === 'terms' && (
                <div className="flex flex-col gap-3">
                  <p>
                    {isRTL 
                      ? 'من خلال نشر مهمة أو التقديم لحلها عبر مهمات الرباط، فإنك توافق على شروط الاستخدام والأخلاقيات المحلية السامية.'
                      : 'En accédant à RabatTasker, vous vous engagez à respecter les valeurs de politesse.'}
                  </p>
                  <p>
                    {isRTL 
                      ? 'يتعهد المستقلون بتقديم معلومات دقيقة وتفاصيل صحيحة عن خدماتهم وحماية ممتلكات الزبائن بالرباط.'
                      : 'Les prestataires s’engagent à réaliser leurs missions avec sérieux et compétence.'}
                  </p>
                  <p>
                    {isRTL 
                      ? 'تعتبر بوابة Payzone و CMI الوسيلة الوحيدة لحجز وضمان تكلفة المهام إدارياً لحماية حقوق الطرفين.'
                      : 'Le système de séquestre marocain Payzone est le seul garant neutre en cas de différend.'}
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
                {isRTL ? 'إغلاق' : 'Fermer'}
              </button>
            </div>

          </div>
        </div>
      )}

    </footer>
  );
}
