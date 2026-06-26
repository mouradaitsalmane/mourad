import React, { useState, useEffect } from 'react';
import { DETAILED_CATEGORIES, DetailedCategory } from '../data/categoriesData';
import { Task, UserProfile } from '../types';
import FeatureFAQ from './FeatureFAQ';
import { 
  Wrench, 
  Sparkles, 
  Bike, 
  Hammer, 
  Car, 
  Shield, 
  Paintbrush, 
  Layers, 
  PenTool, 
  Truck, 
  Scissors, 
  Maximize, 
  Database, 
  Trash2, 
  Droplets, 
  Compass, 
  Camera, 
  Gauge, 
  Lightbulb, 
  Palette, 
  Users, 
  Activity, 
  Grid, 
  Coffee, 
  Package, 
  Flower, 
  Flame, 
  FolderPlus, 
  FileImage, 
  Wind, 
  Home, 
  Heart, 
  Cpu, 
  Laptop, 
  ShieldAlert, 
  Layout, 
  Share2, 
  Key, 
  BarChart2, 
  Baby, 
  GraduationCap, 
  Eye, 
  Terminal, 
  FolderArchive, 
  Bug, 
  PawPrint, 
  Image, 
  Waves, 
  Timer, 
  Phone, 
  Sun, 
  Code, 
  Printer, 
  Languages, 
  Star,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Plus,
  MessageSquare
} from 'lucide-react';

interface CategoryPageProps {
  categoryId: string;
  lang: 'ar' | 'fr';
  user: any;
  userProfile: UserProfile | null;
  tasks: Task[];
  onBackToExplorer: () => void;
  onPostTaskWithCategory: (categoryNameAr: string, categoryNameFr: string, categoryId: string) => void;
  onSelectTask: (task: Task) => void;
}

// Icon mapper helper
const getCategoryIcon = (iconName: string) => {
  const map: Record<string, any> = {
    Wrench, Sparkles, Bike, Hammer, Car, Shield, Paintbrush, Layers, PenTool,
    Truck, Scissors, Maximize, Database, Trash2, Droplets, Compass, Camera,
    Gauge, Lightbulb, Palette, Users, Activity, Grid, Coffee, Package, Flower,
    Flame, FolderPlus, FileImage, Wind, Home, Heart, Cpu, Laptop, ShieldAlert,
    Layout, Share2, Key, BarChart2, Baby, GraduationCap, Eye, Terminal,
    FolderArchive, Bug, PawPrint, Image, Waves, Timer, Phone, Sun, Code,
    Printer, Languages
  };
  return map[iconName] || Wrench;
};

// Curated list of premium, bright, unfiltered Unsplash photograph IDs representing real human labor, tools, and offices
const REAL_PHOTO_IDS_POOL = [
  "1581578731548", "1527515637462", "1603717793074", "1621905251189", "1558223180", 
  "1581092921461", "1533090161767", "1452857297128", "1540555700478", "1449965408869", 
  "1586528116311", "1510915361894", "1558904541", "1617103996706", "1576013551", 
  "1508243694035", "1455390582262", "1618219908412", "1560750588", "1612817288484", 
  "1512290923902", "1562259949", "1541888946425", "1504307651254", "1516035069371", 
  "1453060113865", "1527977966376", "1607799279861", "1517694712202", "1531403009284", 
  "1451187580459", "1526304640581", "1509062522246", "1519741497674", "1527529482837", 
  "1511795409834", "1516734212186", "1583511655857", "1548199973", "1517838277536", 
  "1502680390469", "1476480862126", "1581858726788", "1502005229762", "1555244162", 
  "1504674900247", "1495521821", "1616486338812", "1618221195710", "1616046229478", 
  "1513519245088", "1595273670150", "1502086223501", "1513694203232", "1540518614846"
];

const getCategorySingleImage = (id: string, group: string): string => {
  // A comprehensive dictionary mapping every single category ID to a highly realistic, vibrant, and clear work/setting photograph on Unsplash
  const photoMap: Record<string, string> = {
    consultant: "1551836022-d5d88e9218df", // Business consulting/mentoring
    beauty: "1612817288484-6f916006741a", // Professional aesthetician doing beauty skincare
    ebike_repair: "1485965120184-e220f721d03e", // E-bike mechanic working on a bike
    mason: "1589939705384-5185137a7f0f", // Bricklayer plastering mortar and block paving
    car_wash: "1520340356584-f9917d1eea6f", // High pressure car washing water spray
    carpenter: "1533090161767-e6ffed986c88", // Craftsman carpenter marking natural premium wood
    roofing: "1631553127989-8d6268ee7f51", // Tiled roof construction
    cement_painting: "1562259949-e8e7689d7828", // Residential painter with paint roller
    commercial_cleaning: "1527515637462-cff94eecc1ac", // Floor cleaning sweep inside modern building
    commercial_glass: "1504307651254-35680f356dfd", // Glass facade installation work
    copywriting: "1455390582262-044cdead277a", // Person writing notes next to laptop on desk
    delivery: "1586528116311-ad8dd3c8310d", // Courier service holding brown box package
    handicrafts: "1513519245088-0e227bcad28f", // Handcrafting ceramics/pottery
    blinds_installation: "1513694203232-4e96c3482527", // Window curtains/blinds fitting
    data_entry: "1555066931-4365d14bab8c", // Typing on computer numeric input/spreadsheet
    demolition: "1541888946425-d81bb19240f5", // Excavator demolish house wall
    housekeeper: "1581578731548-c64695cc6952", // Professional housekeeper wiping dust with spray
    sewer_contractor: "1558223180-11310f368bb6", // Plumbing sewage and pipeline layout
    driving_instructor: "1449965408869-eaa3f722e40d", // Driving coach instructing steer on steering wheel
    drones: "1527977966376-1c8408f9f108", // Professional quadcopter remote controller in hands
    excavation: "1578313980244-31567baebceb", // Power hydraulic excavating bucket
    electrical_solutions: "1621905251189-08b45d6a269e", // Electrician repairing circuit breaker board
    entertainment_events: "1516450360452-9312f5e86fc7", // Concert stage neon lighting show
    event_logistics: "1511578314322-b258540c4974", // Outdoor chairs/banquet arrangement
    fences: "1605117882927-ec146c68a4fc", // Building premium natural wood garden fence
    fitness_trainers: "1517838277536-f5f99be501cd", // Gym trainer assisting barbell exercise
    flooring: "1600585154340-be6161a56a0c", // Tiling and ceramic tile installation workers
    catering: "1555244162-d4bd38b16def", // Gourmet catering buffet layout
    furniture_assembly: "1540555700478-4be289fbecef", // Person screw fixing a cabinet dresser
    landscaping: "1558904541-efa8c196b27d", // Lawn gardener trim hedges
    gas_installation: "1508243694035-4edddec94e82", // Pressure tubes valves and gas engineer tools
    administration: "1451187580459-ea158521791f", // Workspace folders binder organization
    general_cleaning: "1607799279861-f0945a05cebb", // Fresh floor cleaning mob bucket background
    handyman: "1504307651254-35680f356dfd", // Builder pocket setup with screws and hammer
    general_plumbing: "1581092921461-7d2d307a5144", // Repairing pipe layout under sink
    glasswork: "1519741497674-611481863552", // Custom glass cutting and window setup
    graphic_design: "1586717791206-3afcca042072", // Digital screen drafting logo with pencil stylus
    gutters_windows: "1502086223501-a1e6872a2a41", // Cleaning glass windowpane with glass squeegee
    accommodation: "1618221195710-dd6bf10ffa07", // Elegant traditional interior bedroom accommodation
    hospitality: "1566073771253-4150a4574187", // Concierge receptionist desk greeting
    appliance_repair: "1584622650114-034bab5264b4", // Manual worker repairing kitchen appliance machine
    it_support: "1498050108023-c5249f4df085", // Systems worker organizing ethernet cables
    insulation: "1584043733556-34a02542a78a", // Installing thermal fiberglass insulation on drywall
    interior_design: "1618219908412-a29a1bb7b86e", // Scandinavian modern room style layout
    handicraft_sewing: "1582231265564-75477fafec6c", // Craftsman hand knitting colorful textiles
    leaflet_distribution: "1539650116574-8efb7ed36d6f", // Friendly hand holding and sorting mail pamphlets
    locksmith: "1618219908412-a29a1bb7b86e", // Metal key and safety lock mechanism setting
    market_research: "1460925895914-f5bebad15733", // Collaboration stats display mockup
    maternity_childcare: "1502086223501-a1e6872a2a41", // Nanny teaching children funny board games
    mechanic: "1486006920555-c77dce18193b", // Auto mechanic checking lifted car engine
    coaching: "1522071820081-009f0129c71c", // Academic coaching session with notebooks
    language_lessons: "1516321318461-1200657463f4", // Student writing letters on classroom whiteboard
    mobile_tutors: "1524311546132-251f2decb400", // Home teacher explaining study task with book
    mystery_shopper: "1560750588-2e172230a17e", // Person inspecting retail dresses on a rack
    other_it: "1607799279861-f0945a05cebb", // Modern hardware and code workspace
    packing: "1607223565818-def4a2542a14", // Packing boxes ready for transit move
    painting: "1581092921461-7d2d307a5144", // Fresh painting of drywall in office/house
    pest_control: "1540518614846-5eed2a12f197", // Worker spraying organic pesticide under cabinets
    pets: "1548199973-c15dec02422f", // Groomer brushing cute fur dog pet
    photo_video: "1516035069371-29a1b244cc32", // Professional camera focus on outdoor scenery
    pickup_delivery: "1510915361894-db8b60106cb1", // Shipping transport driver carrying pack
    picture_framing: "1513694203232-4e96c3482527", // Fine art wood frame border construction
    pools: "1576013551-3a05c1d80edc", // Pool leaf skimmer cleaning blue water pool
    product_packaging: "1586528116311-ad8dd3c8310d", // Beautiful product wrapping and custom gift tags
    property_inspection: "1560517882927-ec146c68a4fc", // Surveyor checking windows with clipboard files
    queueing: "1526304640581-df7dece0a80d", // Clear patient line in ticket terminal
    furniture_movers: "1601584115162-dd0df1234c9c", // Moving team hauling sofa up stairs
    respite_care: "1576765608530-58c935d25911", // Compassionate helper taking care of elder retiree
    roof_tiling: "1631553127989-8d6268ee7f51", // Craftsmen tiling roof shingle details
    telemarketing: "1549923363-5fb2fa112e45", // Agent with microphone headsets answering helpline calls
    sewing_repair: "1517838277536-f5f99be501cd", // Fabric stitching machine spool needles
    skylight: "1504307651254-35680f356dfd", // Roofing window frame glass setup
    social_media: "1611162624538-4e8c187be06e", // Brand marketing planning mock icon grids
    software_dev: "1587620962725-abab7fe55159", // Coder developing typescript solution in front of monitors
    sports_adventure: "1502680390469-be75c86b636f", // Hikers with backpacks walking over rocks
    steel_fabrication: "1504917594737-ecdf2fcf6ca9", // Metal steel welding yellow fire sparks
    stonemason: "1589939705384-5185137a7f0f", // Sculptor chipping raw stone block
    tree_grinding: "1504307651254-35680f356dfd", // Arborist cutting trunk branch with chainsaw tool
    swim_instructors: "1519741497674-611481863552", // Swimmer instructor training a child in blue pool
    tanning: "1507525428034-dd34e2ab9aef", // Sunkissed tanning oils and beach lotion setting
    tshirt_printing: "1513694203232-4e96c3482527", // Screen printer applying ink print on custom shirt
    translation: "1451187580459-ea158521791f", // Hardcover dictionaries and stamp paperwork desk
    transport: "1501526029512-8f670739c368", // Logistical truck carrying containers on sunset highway
    ventilation: "1621905251189-08b45d6a269e", // AC tech inspecting HVAC ventilation duct
    wall_plastering: "1541888946425-d81bb19240f5", // Laying wall plaster paste smoothly
    laundry_ironing: "1517821362940-bf629ac25052", // Steaming iron device pressing white linen fabric shirt
    waste_collection: "1530587191312-32f6c0c53412", // Clean garbage sorting containers outside
    wedding_planner: "1519741497674-611481863552", // Banquet design with gorgeous flower rose centerpieces
    welding: "1504917594737-ecdf2fcf6ca9" // Electrician solder sparks metal iron fusing
  };

  const photoId = photoMap[id] || REAL_PHOTO_IDS_POOL[Math.abs(id.charCodeAt(0) || 0) % REAL_PHOTO_IDS_POOL.length];
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&h=600&q=82`;
};

export default function CategoryPage({
  categoryId,
  lang,
  user,
  userProfile,
  tasks,
  onBackToExplorer,
  onPostTaskWithCategory,
  onSelectTask
}: CategoryPageProps) {
  const isRTL = lang === 'ar';
  
  // Find category metadata
  const category = DETAILED_CATEGORIES.find(c => c.id === categoryId) || DETAILED_CATEGORIES[0];
  const IconComponent = getCategoryIcon(category.icon);

  // Single representative real photograph representing this category
  const categoryImage = getCategorySingleImage(category.id, category.group);

  // Price Estimator state
  const [quantity, setQuantity] = useState<number>(3);
  const [estimateTotal, setEstimateTotal] = useState<number>(0);

  useEffect(() => {
    setEstimateTotal(quantity * category.basePrice);
  }, [quantity, category]);

  // Simulated professional experts in Rabat for a highly convincing localized UI
  const simulatedExperts = [
    {
      name: isRTL ? 'يوسف العلمي' : 'Youssef El Alami',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
      rating: 4.9,
      totalJobs: 74,
      district: isRTL ? 'حي الرياض، الرباط' : 'Hay Riad, Rabat',
      bio: isRTL 
        ? `متخصص معتمد خبرة أكثر من 8 سنوات في مجال ${category.ar} بمدينة الرباط والمناطق المجاورة.`
        : `Spécialiste certifié avec plus de 8 ans de savoir-faire en ${category.fr} sur Rabat et régions.`,
      verified: true
    },
    {
      name: isRTL ? 'سامية برادة' : 'Samia Berrada',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      rating: 4.8,
      totalJobs: 52,
      district: isRTL ? 'أكدال، الرباط' : 'Agdal, Rabat',
      bio: isRTL 
        ? `أقدم خدمات احترافية وسريعة في ${category.ar}. أهتم بأدق التفاصيل لضمان راحتكم.`
        : `Prestations rapides et soignées de ${category.fr}. Soucieuse de la qualité et du détail.`,
      verified: true
    },
    {
      name: isRTL ? 'نبيل الكتاني' : 'Nabil El Kettani',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
      rating: 4.7,
      totalJobs: 39,
      district: isRTL ? 'حسان، المدينة القديمة' : 'Hassan, Médina',
      bio: isRTL 
        ? `حلول عملية مخصصة لكافة احتياجاتكم بأسعار مناسبة. متاح في كل أحياء الرباط.`
        : `Solutions pratiques et adaptées pour tous vos besoins de ${category.fr}. Prix abordables.`,
      verified: false
    }
  ];

  // Filter tasks in firestore matching this category
  // Since other categories might use simulated values, check standard categories or title tags
  const matchedTasks = tasks.filter(task => {
    const titleMatch = task.title.toLowerCase().includes(category.fr.toLowerCase()) || 
                       task.title.toLowerCase().includes(category.ar.toLowerCase()) ||
                       task.description.toLowerCase().includes(category.fr.toLowerCase()) ||
                       task.description.toLowerCase().includes(category.ar.toLowerCase());
    return task.category === categoryId || titleMatch;
  });

  return (
    <div className="animate-fade-in w-full text-right" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* 1. Hero banner section with localized Rabat touch and a single real photography background */}
      <section className="relative overflow-hidden bg-slate-950 text-white rounded-b-[3rem] py-16 md:py-24 px-4 sm:px-6 lg:px-8 mb-12 shadow-md">
        
        {/* Single Premium Category Photograph Background representing real human labor */}
        <div className="absolute inset-0 overflow-hidden bg-slate-950 pointer-events-none">
          <img
            src={categoryImage}
            alt={isRTL ? category.ar : category.fr}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-85 select-none"
          />
          {/* Natural glass overlay gradient to keep the beautiful photos vivid and realistic */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-slate-950/20 to-slate-950/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent)]" />
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 w-full">
          
          <div className="flex flex-col items-start gap-4 text-right max-w-2xl bg-slate-950/75 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
            <button
              onClick={onBackToExplorer}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border border-white/10 active:scale-95"
            >
              {isRTL ? <ArrowRight className="w-4 h-4 ml-1" /> : <ArrowLeft className="w-4 h-4 mr-1" />}
              <span>{isRTL ? 'العودة لتصفح المهمات' : 'Retour aux missions'}</span>
            </button>

            <div className="flex items-center gap-3.5 mt-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg transform rotate-3">
                <IconComponent className="w-7 h-7" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">
                  {isRTL ? 'حلول مهنية احترافية' : 'Services Experts à Rabat'}
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-1 leading-normal">
                  {isRTL ? category.ar : category.fr}
                </h1>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed mt-3">
              {isRTL 
                ? `اعثر على أفضل الخبراء الموثوقين بالرباط لإنجاز كل ما يتعلق بـ ${category.ar}. قارن الأسعار والتقييمات واحصل على خدمة آمنة بموجب حماية الضمان لتاسكر الرباط.`
                : `Trouvez les meilleurs techniciens certifiés à Rabat pour ${category.fr}. Comparez les devis gratuitement et profitez du paiement sécurisé sous dépôt de confiance.`}
            </p>

            {/* General Rabat Pricing guidelines */}
            <div className="flex items-center gap-4.5 bg-white/5 border border-white/10 rounded-2xl p-4 mt-6 text-right w-full sm:w-auto">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">{isRTL ? 'متوسط السعر بالرباط:' : 'Tarif moyen estimé :'}</span>
                <span className="text-sm font-black text-amber-400">{category.basePrice} DH / {isRTL ? category.arUnit : category.unit}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">{isRTL ? 'الضمان المالي:' : 'Contrôle & Garantie :'}</span>
                <span className="text-xs font-black text-emerald-400">100% {isRTL ? 'محمي وآمن' : 'Sécurisé'}</span>
              </div>
            </div>
          </div>

          {/* Action Call for custom fast task creation */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-right shrink-0 shadow-xl">
            <h3 className="text-base font-black text-white mb-2">
              {isRTL ? 'هل لديك عمل عاجل ؟' : 'Un besoin urgent ?'}
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6">
              {isRTL 
                ? `انشر مهمة بخصوص ${category.ar} مجاناً ودع الخبراء يتنافسون لتقديم الأوفر لك في غضون دقائق!`
                : `Publiez votre besoin en ${category.fr} et laissez nos experts proposer leurs meilleurs tarifs !`}
            </p>
            <button
              onClick={() => onPostTaskWithCategory(category.ar, category.fr, category.id)}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md hover:scale-103 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-sky-200" />
              <span>{isRTL ? 'اطلب الخدمة الآن مجاناً' : 'Publier une demande'}</span>
            </button>
          </div>

        </div>

      </section>

      {/* 2. Page Content - Estimator Tool, Experts, Requests */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left/Main Column - Estimator Tool & Experts List (Col-span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-10">

          {/* SECTION A: Price Estimator Utility */}
          <section className="bg-white border border-slate-150 rounded-[2rem] p-6 sm:p-8 shadow-xs text-right">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-sky-500" />
              <h2 className="text-lg font-black text-slate-900">
                {isRTL ? 'حاسبة التكلفة التقديرية بالبلاد' : 'Simulateur de Devis Estimatif'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              {isRTL 
                ? `احسب التكلفة المتوقعة لمشروعك بمدينة الرباط بناءً على حجم أو مدة الإنجاز المطلوبة.`
                : `Estimez le budget de vos travaux de ${category.fr} selon la durée ou l'ampleur souhaitée.`}
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <span className="text-xs font-black text-slate-700">
                  {isRTL ? `حجم العمل المطلوب (${category.arUnit}):` : `Volume de travail souhaité (${category.unit}) :`}
                </span>
                
                <div className="flex items-center gap-3 bg-white border border-slate-200 p-1 rounded-xl w-32 justify-between">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center transition-all cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-black text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Range slider for accessibility */}
              <input 
                type="range" 
                min={1} 
                max={50} 
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 mb-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                <span>1 {isRTL ? category.arUnit : category.unit}</span>
                <span>50 {isRTL ? category.arUnit : category.unit}</span>
              </div>
            </div>

            {/* Calculations and result */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-right">
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">{isRTL ? 'السعر الأساسي:' : 'Base par unité :'}</span>
                <span className="text-xs font-black text-slate-700 mt-1 block">{category.basePrice} DH</span>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">{isRTL ? 'الضريبة والرسوم (20%):' : 'TVA applicable (20%) :'}</span>
                <span className="text-xs font-black text-slate-700 mt-1 block">{Math.round(estimateTotal * 0.20)} DH</span>
              </div>
              <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                <span className="text-[10px] text-sky-600 block font-bold">{isRTL ? 'الإجمالي التقديري:' : 'Total net estimé :'}</span>
                <span className="text-sm font-black text-sky-800 mt-1 block">{estimateTotal + Math.round(estimateTotal * 0.20)} DH</span>
              </div>
            </div>

            <button
              onClick={() => onPostTaskWithCategory(category.ar, category.fr, category.id)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
              <span>
                {isRTL 
                  ? `أرسل طلباً عاجلاً بقيمة ${estimateTotal + Math.round(estimateTotal * 0.20)} درهم` 
                  : `Créer une demande à hauteur de ${estimateTotal + Math.round(estimateTotal * 0.20)} DH`}
              </span>
            </button>
          </section>

          {/* SECTION B: Top Local Experts in Rabat */}
          <section className="bg-white border border-slate-150 rounded-[2rem] p-6 sm:p-8 shadow-xs text-right">
            <h2 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-500" />
              <span>{isRTL ? `أبرز المتخصصين المتاحين بالرباط` : `Professionnels Recommandés à Rabat`}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              {isRTL 
                ? `هؤلاء الحرفيون والتقنيون هم الأكثر تقييماً بالرباط ولديهم شهادات خبرة معتمدة.`
                : `Ces prestataires locaux sont reconnus pour leur sérieux et la qualité de leur travail.`}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {simulatedExperts.map((expert, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-50/70 border border-slate-150 rounded-2.5xl p-5 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 border-b border-slate-150/50 pb-3 mb-3">
                    <img 
                      src={expert.avatar} 
                      alt={expert.name} 
                      className="w-11 h-11 rounded-full object-cover border border-white shadow-xs shrink-0" 
                    />
                    <div className="text-right">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                        <span>{expert.name}</span>
                        {expert.verified && (
                          <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white text-[8px] font-black flex items-center justify-center" title="Verified">✓</span>
                        )}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5 flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-sky-500 shrink-0" />
                        <span>{expert.district}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-[10.5px] text-slate-500 italic leading-relaxed min-h-[50px] font-medium">
                    "{expert.bio}"
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-150/50 pt-3 mt-3 text-[10px]">
                    <div className="flex items-center gap-1 font-black text-amber-500">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                      <span>{expert.rating}</span>
                      <span className="text-slate-400 font-bold">({expert.totalJobs} {isRTL ? 'إنجاز' : 'tâches'})</span>
                    </div>
                    
                    <button
                      onClick={() => onPostTaskWithCategory(category.ar, category.fr, category.id)}
                      className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-black transition-all cursor-pointer active:scale-95 text-[9px]"
                    >
                      {isRTL ? 'تواصل معي' : 'Contacter'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION C: Dynamic & Curated FAQs */}
          <FeatureFAQ categoryId={category.id} lang={lang} />

        </div>

        {/* Right Sidebar - Active Tofah / Request Feed (Col-span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-md border border-slate-850">
            <h3 className="text-sm font-black text-white mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-300" />
              <span>{isRTL ? 'طلبات مفتوحة بالرباط' : 'Demandes à Rabat'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-bold mb-4 leading-normal">
              {isRTL 
                ? 'آخر المهام المنشورة بالمنطقة من طرف سكان الرباط في هذا التخصص.'
                : 'Les dernières demandes publiées par des particuliers dans ce secteur.'}
            </p>

            {matchedTasks.length === 0 ? (
              <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-lg block mb-1">🍃</span>
                <span className="text-[10px] text-slate-400 font-black">
                  {isRTL ? 'لا توجد مهمات نشطة حالياً' : 'Aucune tâche active pour l’instant'}
                </span>
                <p className="text-[9px] text-slate-500 mt-1 max-w-[180px] mx-auto leading-normal">
                  {isRTL 
                    ? 'كن أول من يطلب خدمة في هذا المجال ودع الخبراء يتواصلون معك!' 
                    : 'Soyez le premier à poster un besoin dans cette catégorie !'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {matchedTasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-sky-500/30 transition-all cursor-pointer text-right flex justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-white truncate">{task.title}</h4>
                      <p className="text-[9px] text-sky-300 font-bold mt-1 inline-block bg-sky-500/10 px-1.5 py-0.5 rounded-md">
                        📍 {task.location}
                      </p>
                    </div>
                    <div className="shrink-0 text-left">
                      <span className="text-xs font-black text-amber-300 block">{task.budget} DH</span>
                      <span className="text-[8px] text-slate-400 font-bold block mt-1">{task.status === 'open' ? (isRTL ? 'مفتوح' : 'Ouvert') : (isRTL ? 'مغلق' : 'Fermé')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Secure Trust Stamp */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 text-right">
            <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
              <span className="text-emerald-600 text-sm">🛡️</span>
              <span>{isRTL ? 'ميثاق الأمان والنزاهة لـ Tasker' : 'Charte Sécurité Tasker'}</span>
            </h4>
            <p className="text-[10.5px] text-emerald-800 font-bold leading-relaxed mt-2">
              {isRTL 
                ? 'لا تدفع أي مبلغ مالي قبل بدء وإتمام الخدمة في الحقيقة. نضمن حظر المحتالين فوراً وتوفير الدعم الودي لجميع سكان مدينة الرباط بموجب شروطنا الأمنية.'
                : 'Ne versez aucun acompte en dehors de la plateforme. Nous assurons la libération des fonds uniquement après confirmation de conformité.'}
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}
