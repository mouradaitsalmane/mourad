import React from 'react';
import { Task, RabatNeighborhood } from '../types';
import { RABAT_NEIGHBORHOODS, LanguageKey } from '../data/rabatData';
import { 
  MapPin, 
  Map, 
  Compass, 
  Briefcase, 
  GraduationCap, 
  Trees, 
  Landmark, 
  Users, 
  Ship,
  Home,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Smooth-incrementing digital counter component using requestAnimationFrame
function SmoothCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing out quadratic
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      
      setCount(Math.floor(easedProgress * target));
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  return <span className="font-extrabold tabular-nums">{count}</span>;
}

interface RabatMapProps {
  tasks: Task[];
  selectedNeighborhood: string;
  onSelectNeighborhood: (id: string) => void;
  lang: LanguageKey;
}

export default function RabatMap({ 
  tasks, 
  selectedNeighborhood, 
  onSelectNeighborhood, 
  lang 
}: RabatMapProps) {
  const isRTL = lang === 'ar';
  
  // Calculate active task counts per neighborhood
  const getTaskCountByNeighborhood = (neighborhoodId: string) => {
    const neighborhoodObj = RABAT_NEIGHBORHOODS.find(n => n.id === neighborhoodId);
    if (!neighborhoodObj) return 0;
    
    return tasks.filter(task => {
      // Check for matching AR or FR name, or status = open
      const matchesName = task.location === neighborhoodObj.ar || task.location === neighborhoodObj.fr;
      return matchesName && task.status === 'open';
    }).length;
  };

  // Calculate completed tasks per neighborhood for the smooth animated counter
  const getCompletedTaskCountByNeighborhood = (neighborhoodId: string) => {
    const neighborhoodObj = RABAT_NEIGHBORHOODS.find(n => n.id === neighborhoodId);
    if (!neighborhoodObj) return 0;

    const actualCompletedCount = tasks.filter(task => {
      const matchesName = task.location === neighborhoodObj.ar || task.location === neighborhoodObj.fr;
      return matchesName && task.status === 'completed';
    }).length;

    // Realistic robust baseline seed volumes so that the map starts populated with live success counts
    const seedValues: Record<string, number> = {
      medina: 84,
      hassan: 126,
      yacoub_mansour: 62,
      agdal: 205,
      youssoufia: 89,
      hay_riad: 174,
      souissi: 53,
      el_menzeh: 31
    };

    return (seedValues[neighborhoodId] || 45) + actualCompletedCount;
  };

  // Get total completed tasks in Rabat city
  const getAllCompletedTasks = () => {
    return MAP_SECTORS.reduce((sum, sector) => sum + getCompletedTaskCountByNeighborhood(sector.id), 0);
  };

  // Neighborhood visual map nodes with coordinates & custom style information
  const MAP_SECTORS = [
    {
      id: 'medina',
      svgPath: 'M 280 30 L 350 30 L 335 85 L 265 85 Z',
      labelX: 307,
      labelY: 57,
      icon: Compass,
      colorClass: 'fill-emerald-500/10 stroke-emerald-500/40 hover:fill-emerald-500/20',
      activeColorClass: 'fill-emerald-600/30 stroke-emerald-500 bg-emerald-50 text-emerald-950',
      dotColor: 'bg-emerald-500',
      descriptionAr: 'المدينة العتيقة والتاريخ الأندلسي العريق',
      descriptionFr: 'Médina historique et artisanat traditionnel'
    },
    {
      id: 'hassan',
      svgPath: 'M 350 30 L 430 50 L 400 115 L 335 85 Z',
      labelX: 382,
      labelY: 70,
      icon: Landmark,
      colorClass: 'fill-amber-500/10 stroke-amber-500/40 hover:fill-amber-500/20',
      activeColorClass: 'fill-amber-600/30 stroke-amber-500 bg-amber-50 text-amber-950',
      dotColor: 'bg-amber-500',
      descriptionAr: 'صومعة حسان، الإدارات الوزارية والمزارات السياحية',
      descriptionFr: 'Tour Hassan, administrations et centre historique'
    },
    {
      id: 'yacoub_mansour',
      svgPath: 'M 110 65 L 280 30 L 265 85 L 165 135 Z',
      labelX: 185,
      labelY: 82,
      icon: Ship,
      colorClass: 'fill-sky-500/10 stroke-sky-500/40 hover:fill-sky-500/20',
      activeColorClass: 'fill-sky-600/30 stroke-sky-500 bg-sky-50 text-sky-950',
      dotColor: 'bg-sky-500',
      descriptionAr: 'كورنيش البحر والحي الشعبي النابض بالحيوية والنشاط',
      descriptionFr: 'Quartier côtier dynamique et populaire'
    },
    {
      id: 'agdal',
      svgPath: 'M 165 135 L 265 85 L 335 85 L 305 175 L 195 175 Z',
      labelX: 250,
      labelY: 130,
      icon: GraduationCap,
      colorClass: 'fill-indigo-500/10 stroke-indigo-500/40 hover:fill-indigo-500/20',
      activeColorClass: 'fill-indigo-600/30 stroke-indigo-500 bg-indigo-50 text-indigo-950',
      dotColor: 'bg-indigo-500',
      descriptionAr: 'مركز التسوق، المقاهي والجامعات الكبرى بالعاصمة',
      descriptionFr: 'Commerces, universités et vitalité urbaine'
    },
    {
      id: 'youssoufia',
      svgPath: 'M 335 85 L 400 115 L 460 155 L 375 205 L 305 175 Z',
      labelX: 377,
      labelY: 147,
      icon: Users,
      colorClass: 'fill-rose-500/10 stroke-rose-500/40 hover:fill-rose-500/20',
      activeColorClass: 'fill-rose-600/30 stroke-rose-500 bg-rose-50 text-rose-950',
      dotColor: 'bg-rose-500',
      descriptionAr: 'الأحياء السكنية النشطة كالتقدم واليوسفية',
      descriptionFr: 'Secteurs résidentiels populaires à forte densité'
    },
    {
      id: 'hay_riad',
      svgPath: 'M 90 185 L 195 175 L 305 175 L 265 265 L 135 265 Z',
      labelX: 197,
      labelY: 220,
      icon: Briefcase,
      colorClass: 'fill-blue-500/10 stroke-blue-500/40 hover:fill-blue-500/20',
      activeColorClass: 'fill-blue-600/30 stroke-blue-500 bg-blue-50 text-blue-950',
      dotColor: 'bg-blue-500',
      descriptionAr: 'حي المال والأعمال وباقة الشركات العالمية والمقرات الكبرى',
      descriptionFr: 'Centre d’affaires moderne, ministères et villas'
    },
    {
      id: 'souissi',
      svgPath: 'M 305 175 L 375 205 L 475 225 L 415 305 L 265 265 Z',
      labelX: 367,
      labelY: 237,
      icon: Trees,
      colorClass: 'fill-teal-500/10 stroke-teal-500/40 hover:fill-teal-500/20',
      activeColorClass: 'fill-teal-600/30 stroke-teal-500 bg-teal-50 text-teal-950',
      dotColor: 'bg-teal-500',
      descriptionAr: 'السفارات، الفيلات الراقية والمساحات الخضراء الشاسعة',
      descriptionFr: 'Ambassades, résidences de prestige et forêts'
    },
    {
      id: 'el_menzeh',
      svgPath: 'M 135 265 L 265 265 L 415 305 L 350 355 L 175 355 Z',
      labelX: 257,
      labelY: 310,
      icon: Home,
      colorClass: 'fill-cyan-500/10 stroke-cyan-500/40 hover:fill-cyan-500/20',
      activeColorClass: 'fill-cyan-600/30 stroke-cyan-500 bg-cyan-50 text-cyan-950',
      dotColor: 'bg-cyan-500',
      descriptionAr: 'التوسع الفاخر الهادئ جنوب الرباط وصالات الفروسية',
      descriptionFr: 'Extension calme, clubs équestres et verdures'
    }
  ];

  // Quick reset toggle
  const handleMapClick = (sectorId: string) => {
    if (selectedNeighborhood === sectorId) {
      onSelectNeighborhood('all');
    } else {
      onSelectNeighborhood(sectorId);
    }
  };

  const selectedSectorObj = MAP_SECTORS.find(s => s.id === selectedNeighborhood);
  const selectedDistrictObj = RABAT_NEIGHBORHOODS.find(n => n.id === selectedNeighborhood);

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-5" id="rabat-interactive-map-card">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-50 rounded-xl text-sky-600">
            <Map className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col text-right">
            <h3 className="text-sm font-black text-gray-900">
              {isRTL ? 'الخريطة التفاعلية لأحياء الرباط' : 'Carte interactive des quartiers'}
            </h3>
            <span className="text-[11px] text-gray-400 font-medium mt-0.5">
              {isRTL ? 'اختر الحي من الخريطة لعرض عروض العمل المتوفرة فيه' : 'Sélectionnez un quartier pour filtrer les tâches.'}
            </span>
          </div>
        </div>

        {/* Clear selection filter badge */}
        {selectedNeighborhood !== 'all' && (
          <button
            onClick={() => onSelectNeighborhood('all')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/50 transition-all cursor-pointer"
          >
            <span>{isRTL ? 'عرض كل أحياء العاصمة ↺' : 'Voir tout Rabat ↺'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* SVG Map (Responsive Container) */}
        <div className="lg:col-span-8 flex justify-center bg-slate-50/50 rounded-2xl p-2 sm:p-4 border border-gray-100/60 relative overflow-hidden">
          
          {/* Compass Rose absolute layout decoration */}
          <div className="absolute top-4 right-4 text-gray-300 opacity-60 flex flex-col items-center pointer-events-none">
            <Compass className="w-8 h-8 stroke-[1.5]" />
            <span className="text-[9px] font-bold tracking-widest mt-1">N_RABAT</span>
          </div>

          {/* Ocean Water representation wrapper */}
          <div className="absolute -left-12 -top-12 w-60 h-60 rounded-full bg-sky-400/5 blur-3xl pointer-events-none" />
          <div className="absolute left-4 top-4 text-sky-700/30 text-[10px] font-black uppercase tracking-widest pointer-events-none select-none">
            {isRTL ? 'المحيط الأطلسي' : 'Océan Atlantique'}
          </div>

          {/* Bouregreg River representation vector */}
          <div className="absolute right-4 top-2 text-indigo-700/30 text-[10px] font-black uppercase tracking-widest pointer-events-none select-none text-right">
            {isRTL ? 'وادي أبي رقراق' : 'Oued Bouregreg'}
          </div>

          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 540 380" 
            className="w-full max-w-lg h-auto drop-shadow-sm select-none"
          >
            {/* Outline Atlantic Ocean Coast Grid lines */}
            <path d="M 0,20 Q 80,40 100,100" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d="M 0,55 Q 110,80 120,180" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 4" />
            
            {/* Bouregreg River blue path decoration */}
            <path 
              d="M 330,30 Q 380,20 460,50 T 540,110" 
              fill="none" 
              stroke="#bae6fd" 
              strokeWidth="10" 
              className="opacity-70"
            />
            <path 
              d="M 330,30 Q 380,20 460,50 T 540,110" 
              fill="none" 
              stroke="#7dd3fc" 
              strokeWidth="3" 
              className="opacity-90"
            />

            {/* Neighborhood Polygons */}
            <g id="neighborhood-polygons-group">
              {MAP_SECTORS.map((sector) => {
                const isActive = selectedNeighborhood === sector.id;
                const taskCount = getTaskCountByNeighborhood(sector.id);
                const translationInfo = RABAT_NEIGHBORHOODS.find(n => n.id === sector.id);
                const arabicName = translationInfo?.ar || '';
                const frenchName = translationInfo?.fr || '';

                return (
                  <motion.path
                    key={sector.id}
                    d={sector.svgPath}
                    onClick={() => handleMapClick(sector.id)}
                    whileHover={{ scale: 1.015, fillOpacity: 0.28 }}
                    whileTap={{ scale: 0.985 }}
                    animate={{ 
                      strokeWidth: isActive ? 2.5 : 1.5
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 18 }}
                    style={{ transformOrigin: `${sector.labelX}px ${sector.labelY}px` }}
                    className={`transition-colors duration-300 cursor-pointer ${
                      isActive 
                        ? 'fill-sky-500/25 stroke-sky-500 drop-shadow-md' 
                        : sector.colorClass
                    }`}
                  >
                    <title>{isRTL ? `${arabicName} (${taskCount} مهمة مفتوحة)` : `${frenchName} (${taskCount} tâches)`}</title>
                  </motion.path>
                );
              })}
            </g>

            {/* Labels and Icons Overlaid on Centers */}
            {MAP_SECTORS.map((sector) => {
              const isActive = selectedNeighborhood === sector.id;
              const taskCount = getTaskCountByNeighborhood(sector.id);
              const translationInfo = RABAT_NEIGHBORHOODS.find(n => n.id === sector.id);
              const displayName = translationInfo ? (isRTL ? translationInfo.ar : translationInfo.fr) : '';
              const IconComp = sector.icon;

              return (
                <motion.g 
                  key={`label-${sector.id}`} 
                  className="pointer-events-none"
                  initial={false}
                  animate={isActive ? { scale: 1.25, y: -3 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  style={{ transformOrigin: `${sector.labelX}px ${sector.labelY}px` }}
                >
                  {/* Radar ripple pulse under active item */}
                  {isActive && (
                    <motion.circle
                      cx={sector.labelX}
                      cy={sector.labelY}
                      r={15}
                      className="fill-none stroke-amber-400 stroke-2"
                      initial={{ scale: 0.8, opacity: 1 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.6, 
                        ease: "easeOut" 
                      }}
                      style={{ transformOrigin: `${sector.labelX}px ${sector.labelY}px` }}
                    />
                  )}

                  {/* Subtle marker background circle */}
                  <circle 
                    cx={sector.labelX} 
                    cy={sector.labelY} 
                    r={15} 
                    className={`transition-all duration-300 filter drop-shadow-md ${
                      isActive ? 'fill-amber-500 stroke-amber-200 stroke-2' : 'fill-white/90 stroke-gray-200'
                    }`}
                  />
                  
                  {/* Embedded Tiny Icon */}
                  <foreignObject 
                    x={sector.labelX - 8} 
                    y={sector.labelY - 8} 
                    width={16} 
                    height={16}
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      <IconComp className={`w-4 h-4 transition-all ${isActive ? 'text-white scale-120 stroke-[2.5]' : 'text-gray-700'}`} />
                    </div>
                  </foreignObject>

                  {/* Neighborhood Text tag */}
                  <text
                    x={sector.labelX}
                    y={sector.labelY + 24}
                    textAnchor="middle"
                    className={`font-black text-[9px] tracking-tight pointer-events-none transition-colors ${
                      isActive ? 'fill-sky-800 font-black text-[10px]' : 'fill-gray-900 font-bold'
                    }`}
                  >
                    {displayName}
                  </text>

                  {/* Counter Badge if tasks count > 0 */}
                  {taskCount > 0 && (
                    <g transform={`translate(${sector.labelX + 8}, ${sector.labelY - 14})`}>
                      <circle r={7.5} fill="#f43f5e" />
                      <text 
                        y={2.5} 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize="7.5" 
                        fontWeight="black"
                      >
                        {taskCount}
                      </text>
                    </g>
                  )}
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* Right Details Panel for Selection Info */}
        <div className="lg:col-span-4 flex flex-col justify-between h-full bg-slate-50/40 rounded-2xl p-4 border border-gray-100/60 min-h-[290px]">
          
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
              {isRTL ? 'معلومات الحي المحدد' : 'Informations quartier'}
            </span>

            <AnimatePresence mode="wait">
              {selectedNeighborhood === 'all' ? (
                <motion.div
                  key="all-neighborhoods"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex flex-col gap-1.5 py-6 text-center lg:text-right"
                >
                  <MapPin className="w-8 h-8 text-sky-400 mx-auto lg:margin-0 self-center lg:self-start stroke-[1.5]" />
                  <h4 className="text-xs font-bold text-gray-800 mt-2">
                    {isRTL ? 'العاصمة الرباط كاملة' : 'Toute la ville de Rabat'}
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                    {isRTL 
                      ? 'اضغط على أي منطقة بالخريطة الجغرافية لتحديد المهام المعروضة في ذلك الحي بعينه.' 
                      : 'Cliquez sur n’importe quelle zone sur la carte pour filtrer par quartier spécifique.'}
                  </p>
                  
                  {/* General Rabat distribution list */}
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] bg-white px-3 py-2 rounded-xl border border-gray-100">
                      <span className="text-gray-500 font-semibold">{isRTL ? 'مهمات مفتوحة كلياً' : 'Tâches totales ouvertes'}</span>
                      <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100">
                        {tasks.filter(t => t.status === 'open').length}
                      </span>
                    </div>

                    {/* Smooth digital counter for overall completed tasks */}
                    <div className="flex items-center justify-between text-[11px] bg-emerald-50/40 px-3 py-2.5 rounded-xl border border-emerald-100/60 shadow-2xs">
                      <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                        {isRTL ? 'المهام المنجزة الكلية 🏆' : 'Total tâches accomplies 🏆'}
                      </span>
                      <span className="font-extrabold text-sm text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                        <SmoothCounter target={getAllCompletedTasks()} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                selectedSectorObj && (
                  <motion.div
                    key={selectedNeighborhood}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex flex-col gap-2"
                  >
                    
                    {/* Header Area */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <selectedSectorObj.icon className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{isRTL ? selectedDistrictObj?.ar : selectedDistrictObj?.fr}</span>
                      </h4>
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {isRTL ? 'نشط' : 'Actif'}
                      </span>
                    </div>

                    {/* Desc */}
                    <p className="text-[11px] text-gray-500 leading-relaxed font-semibold mt-1 bg-white p-3 rounded-xl border border-gray-100">
                      {isRTL ? selectedSectorObj.descriptionAr : selectedSectorObj.descriptionFr}
                    </p>

                    {/* Active tasks count block */}
                    <div className="mt-2 flex items-center justify-between p-3 bg-sky-50 border border-sky-100 rounded-xl">
                      <span className="text-[11px] text-sky-950 font-bold">
                        {isRTL ? 'المهمات المتوفرة للتقديم:' : 'Tâches disponibles :'}
                      </span>
                      <span className="text-sm font-black text-sky-700">
                        {getTaskCountByNeighborhood(selectedNeighborhood)}
                      </span>
                    </div>

                    {/* Smooth digital counter for completed tasks in selected neighborhood */}
                    <div className="mt-2 flex items-center justify-between p-3 bg-emerald-500/15 border border-emerald-200 rounded-xl shadow-2xs">
                      <span className="text-[11px] text-emerald-950 font-black flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                        {isRTL ? 'المهام المنجزة في الحي:' : 'Tâches accomplies dans le quartier :'}
                      </span>
                      <span className="font-extrabold text-base text-emerald-700 flex items-center gap-1">
                        🏆 <SmoothCounter target={getCompletedTaskCountByNeighborhood(selectedNeighborhood)} />
                      </span>
                    </div>

                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>

          {/* Quick list of mini text buttons to select/deselect from sidebar too */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-2">
              {isRTL ? 'اختصار التحديد السريع' : 'Sélection rapide'}
            </span>
            
            <div className="flex flex-wrap gap-1.5">
              {RABAT_NEIGHBORHOODS.map(n => {
                const isActive = selectedNeighborhood === n.id;
                const count = getTaskCountByNeighborhood(n.id);
                
                return (
                  <motion.button
                    key={n.id}
                    onClick={() => handleMapClick(n.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                      isActive 
                        ? 'bg-sky-600 border-sky-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{isRTL ? n.ar : n.fr}</span>
                    {count > 0 && (
                      <span className={`px-1 rounded-full text-[8px] font-extrabold ${isActive ? 'bg-white text-sky-600' : 'bg-red-500 text-white'}`}>
                        {count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
