import React from 'react';
import { Search, MapPin, Tag, Map, Sliders, MapPin as MapPinIcon } from 'lucide-react';
import { Task } from '../../types';
import RabatMap from '../RabatMap';

interface RabatNeighborhood {
  id: string;
  ar: string;
  fr: string;
}

interface ServiceCategory {
  id: string;
  ar: string;
  fr: string;
  icon: string;
}

interface WorkerDashboardJobsTabProps {
  lang: 'ar' | 'fr';
  isRTL: boolean;
  jobSearchQuery: string;
  setJobSearchQuery: (query: string) => void;
  selectedNeighborhood: string;
  setSelectedNeighborhood: (n: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  showMap: boolean;
  setShowMap: (show: boolean) => void;
  filteredAvailableTasks: Task[];
  onSelectTask: (task: Task) => void;
  getCategoryTheme: (catId: string) => { name: string; icon: React.ReactNode; color: string };
  rabatNeighborhoods: RabatNeighborhood[];
  serviceCategories: ServiceCategory[];
}

export default function WorkerDashboardJobsTab({
  lang,
  isRTL,
  jobSearchQuery,
  setJobSearchQuery,
  selectedNeighborhood,
  setSelectedNeighborhood,
  selectedCategory,
  setSelectedCategory,
  showMap,
  setShowMap,
  filteredAvailableTasks,
  onSelectTask,
  getCategoryTheme,
  rabatNeighborhoods,
  serviceCategories
}: WorkerDashboardJobsTabProps) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="worker-tab-jobs">
      
      {/* Header filters banner */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search bar input value */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4.5 h-4.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={jobSearchQuery}
            onChange={(e) => setJobSearchQuery(e.target.value)}
            placeholder={isRTL ? 'ابحث بالكلمات الدلالية هنا (مثل: غسيل، صباغة)...' : 'Rechercher une tâche...'}
            className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white"
          />
        </div>

        {/* Filters dropdown parameters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end flex-row">
          
          {/* Neighborhood switch dropdown */}
          <select
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-extrabold bg-slate-50 focus:outline-none text-right"
          >
            <option value="all">{isRTL ? 'كل أحياء الرباط' : 'Rabat (Tous)'}</option>
            {rabatNeighborhoods.map(n => (
              <option key={n.id} value={n.id}>{isRTL ? n.ar : n.fr}</option>
            ))}
          </select>

          {/* Category switch filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-extrabold bg-slate-50 focus:outline-none text-right"
          >
            <option value="all">{isRTL ? 'كل تخصصات الخدمات' : 'Spécialités (Toutes)'}</option>
            {serviceCategories.map(c => (
              <option key={c.id} value={c.id}>{isRTL ? c.ar : c.fr}</option>
            ))}
          </select>

          {/* Toggle Map Show status */}
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className={`p-2.5 px-3.5 transition-all text-xs font-bold rounded-xl border cursor-pointer flex items-center gap-1.5 bg-white hover:bg-slate-50 ${
              showMap ? 'text-emerald-700 border-emerald-350 bg-emerald-50 shadow-xs' : 'text-slate-550 border-gray-200'
            }`}
          >
            <Map className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{showMap ? (isRTL ? 'إخفاء الخريطة' : 'Masquer la carte') : (isRTL ? 'عرض الخريطة' : 'Afficher la carte')}</span>
          </button>

        </div>

      </div>

      {/* Map visual section */}
      {showMap && (
        <div className="bg-white p-4.5 rounded-3xl border border-gray-150 h-[320px] shadow-xs flex flex-col justify-between">
          <div className="flex-1 w-full relative">
            <RabatMap 
              tasks={filteredAvailableTasks}
              selectedNeighborhood={selectedNeighborhood}
              onSelectNeighborhood={(nId) => setSelectedNeighborhood(nId)}
              lang={lang}
            />
          </div>
          <div className="text-[10px] text-gray-400 font-bold mt-2 text-right">
            {isRTL ? 'خريطة تفاعلية لأحياء الرباط. اضغط على حي لتصفية المهمات المتواجدة به.' : 'Cliquez sur un quartier de Rabat pour filtrer.'}
          </div>
        </div>
      )}

      {/* Results lists */}
      <div className="space-y-4">
        {filteredAvailableTasks.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 shadow-xs">
            <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
              {isRTL 
                ? 'لا توجد أي مهام مطابقة وبميزانية متاحة بفلتر البحث الحالي. تصفح أحياء أخرى مجاورة بالرباط!' 
                : 'Aucune tâche disponible avec ces critères.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAvailableTasks.map((task) => {
              const theme = getCategoryTheme(task.category);
              return (
                <div 
                  key={task.id}
                  className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs flex flex-col justify-between hover:shadow-md transition-all gap-4 text-right"
                >
                  <div className="flex items-start justify-between flex-row-reverse">
                    <span className="text-[10px] font-black text-slate-450 uppercase">{task.dueDate}</span>
                    <span className="text-base font-black text-slate-900">{task.budget} DH</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 leading-snug">{task.title}</h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1 sm:mt-1.5 leading-relaxed">{task.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-50 pt-2.5 flex-row-reverse">
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <MapPinIcon size={12} className="text-emerald-500" />
                        <span>{task.location}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 capitalize">
                        <span>{theme.name}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectTask(task)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold leading-none active:scale-95 transition-all text-center cursor-pointer"
                    >
                      {isRTL ? 'تفاصيل / تقديم عرض' : 'Pitcher'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
