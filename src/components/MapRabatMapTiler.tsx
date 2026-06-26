'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Task } from '../types';
import { RABAT_NEIGHBORHOODS, LanguageKey } from '../data/rabatData';
import { DETAILED_CATEGORIES } from '../data/categoriesData';
import { Crosshair, MapPin } from 'lucide-react';

// Leaflet stylesheet import
import 'leaflet/dist/leaflet.css';

interface MapRabatMapTilerProps {
  tasks?: Task[];
  selectedNeighborhood?: string;
  onSelectNeighborhood?: (id: string) => void;
  lang?: LanguageKey;
  onSelectTask?: (task: Task) => void;
  hoveredTaskId?: string | null;
  height?: string;
  interactiveMode?: boolean;
}

// Rabat Neighborhood Geographical Centroids
const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  medina: [34.0264, -6.8378],
  hassan: [34.0227, -6.8278],
  yacoub_mansour: [34.0150, -6.8650],
  agdal: [34.0062, -6.8480],
  youssoufia: [34.0020, -6.8290],
  hay_riad: [33.9680, -6.8770],
  souissi: [33.9550, -6.8350],
  el_menzeh: [33.9250, -6.8520],
  temara: [33.9200, -6.9120],
  sale: [34.0320, -6.8120]
};

const MAPTILER_KEY = 'DnpjWXgevsKRXeK0lPLe';
const MAP_STYLES = {
  streets: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
  basic: `https://api.maptiler.com/maps/basic-v1/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
  satellite: `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
};

export default function MapRabatMapTiler({
  tasks = [],
  selectedNeighborhood = 'all',
  onSelectNeighborhood,
  lang = 'ar',
  onSelectTask,
  hoveredTaskId = null,
  height = '500px',
  interactiveMode = true
}: MapRabatMapTilerProps) {
  const isRTL = lang === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const neighborhoodCirclesRef = useRef<Record<string, any>>({});
  
  const [activeStyle, setActiveStyle] = useState<'streets' | 'basic' | 'satellite'>('streets');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedTaskState, setSelectedTaskState] = useState<Task | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    let map: any;
    let LInstance: any;

    async function initLeaflet() {
      const Leaflet = await import('leaflet');
      LInstance = Leaflet.default;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      map = LInstance.map(containerRef.current!, {
        center: [34.020882, -6.841650], 
        zoom: 11.5,
        zoomControl: false,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      LInstance.control.zoom({ position: 'bottomright' }).addTo(map);
      LInstance.control.attribution({
        position: 'bottomleft',
        prefix: '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>'
      }).addTo(map);

      LInstance.tileLayer(MAP_STYLES[activeStyle], {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      setMapLoaded(true);

      // Circles for neighborhoods
      Object.entries(NEIGHBORHOOD_COORDS).forEach(([id, [lat, lng]]) => {
        const translation = RABAT_NEIGHBORHOODS.find(n => n.id === id);
        const name = translation ? (isRTL ? translation.ar : translation.fr) : id;

        const count = tasks.filter(task => {
          const matched = translation ? (task.location === translation.ar || task.location === translation.fr) : false;
          return matched && (task.status === 'open' || task.status === 'held');
        }).length;

        const circle = LInstance.circle([lat, lng], {
          color: selectedNeighborhood === id ? '#0984e3' : '#94a3b8',
          fillColor: selectedNeighborhood === id ? '#74b9ff' : '#e2e8f0',
          fillOpacity: selectedNeighborhood === id ? 0.35 : 0.15,
          radius: 900,
          weight: selectedNeighborhood === id ? 3 : 1.5
        }).addTo(map);

        circle.on('click', () => {
          if (onSelectNeighborhood) {
            onSelectNeighborhood(selectedNeighborhood === id ? 'all' : id);
          }
        });

        circle.bindTooltip(`
          <div class="text-right p-1 font-sans" style="direction: ${isRTL ? 'rtl' : 'ltr'}">
            <p class="text-xs font-black text-slate-900">${name}</p>
            <p class="text-[10px] text-sky-600 font-extrabold">${count} ${isRTL ? 'مهام متاحة' : 'missions'}</p>
          </div>
        `, { direction: 'top', permanent: false });

        neighborhoodCirclesRef.current[id] = circle;
      });

      // Interactive Pins
      tasks.forEach((task) => {
        if (task.status !== 'open' && task.status !== 'held') return;

        const neighborhood = RABAT_NEIGHBORHOODS.find(n => task.location === n.ar || task.location === n.fr);
        if (!neighborhood) return;

        const baseCoords = NEIGHBORHOOD_COORDS[neighborhood.id];
        if (!baseCoords) return;

        const seedValue = task.id ? task.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) : Math.random();
        const offsetLat = ((seedValue % 17) - 8.5) * 0.0012;
        const offsetLng = ((seedValue % 13) - 6.5) * 0.0012;

        const finalCoords: [number, number] = [baseCoords[0] + offsetLat, baseCoords[1] + offsetLng];
        const cat = DETAILED_CATEGORIES.find(c => c.id === task.category);
        const emoji = cat?.icon || '🔧';

        const iconHtml = `
          <div class="relative flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all" id="tiler-marker-${task.id}">
            <div class="w-8 h-8 rounded-full bg-slate-900/90 hover:bg-sky-600/90 border-2 border-white shadow-lg flex items-center justify-center text-xs text-white relative">
              <span class="text-[12px]">${emoji}</span>
              <span class="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 font-black text-[8px] py-0.5 px-1 rounded-full border border-white">
                ${task.budget}
              </span>
            </div>
          </div>
        `;

        const customIcon = LInstance.divIcon({
          html: iconHtml,
          className: 'custom-leaflet-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = LInstance.marker(finalCoords, { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          setSelectedTaskState(task);
          if (onSelectTask) {
            onSelectTask(task);
          }
        });

        markersRef.current[task.id] = marker;
      });
    }

    initLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [tasks]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof (window as any).L.TileLayer || (layer._url && layer._url.includes('maptiler'))) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    const LInstance = (window as any).L;
    if (LInstance) {
      LInstance.tileLayer(MAP_STYLES[activeStyle], {
        maxZoom: 19,
        attribution: '© OpenStreetMap | © MapTiler'
      }).addTo(mapInstanceRef.current);
    }
  }, [activeStyle, mapLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    if (selectedNeighborhood !== 'all' && NEIGHBORHOOD_COORDS[selectedNeighborhood]) {
      const coords = NEIGHBORHOOD_COORDS[selectedNeighborhood];
      mapInstanceRef.current.setView(coords, 14, { animate: true });
    }

    Object.entries(neighborhoodCirclesRef.current).forEach(([id, circleObj]) => {
      const isSelected = selectedNeighborhood === id;
      const circle = circleObj as any;
      circle.setStyle({
        color: isSelected ? '#0369a1' : '#94a3b8',
        fillColor: isSelected ? '#0284c7' : '#cbd5e1',
        fillOpacity: isSelected ? 0.38 : 0.12,
        weight: isSelected ? 3.5 : 1.5
      });
    });
  }, [selectedNeighborhood, mapLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    Object.entries(markersRef.current).forEach(([id, markerObj]) => {
      const element = document.getElementById(`tiler-marker-${id}`);
      if (element) {
        const marker = markerObj as any;
        if (id === hoveredTaskId) {
          element.classList.add('scale-125', 'z-[1000]');
          element.firstElementChild?.classList.add('bg-rose-600', 'ring-4', 'ring-rose-200');
          mapInstanceRef.current.panTo(marker.getLatLng());
        } else {
          element.classList.remove('scale-125', 'z-[1000]');
          element.firstElementChild?.classList.remove('bg-rose-600', 'ring-4', 'ring-rose-200');
        }
      }
    });
  }, [hoveredTaskId, mapLoaded]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert(isRTL ? 'متصفحك لا يدعم تحديد الموقع الجغرافي.' : 'La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 14, { animate: true });
          
          // Add temporary blue marker for user's location
          const LInstance = (window as any).L;
          if (LInstance) {
            LInstance.marker([latitude, longitude], {
              icon: LInstance.divIcon({
                html: `
                  <div class="relative flex items-center justify-center">
                    <span class="absolute w-6 h-6 rounded-full bg-blue-500/30 animate-ping"></span>
                    <span class="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md"></span>
                  </div>
                `,
                className: 'user-location-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
            }).addTo(mapInstanceRef.current)
              .bindPopup(isRTL ? 'موقعك الحالي' : 'Votre position actuelle')
              .openPopup();
          }
        }
      },
      (err) => {
        console.error("Error getting map geolocation:", err);
        alert(isRTL ? 'فشل تحديد الموقع الجغرافي. يرجى السماح للمتصفح بالوصول لموقعك.' : 'Échec de la détection de votre position. Veuillez autoriser l\'accès.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-150 shadow-sm bg-slate-50 flex flex-col h-full">
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5">
        <div className="bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200 flex items-center gap-1">
          <button onClick={() => setActiveStyle('streets')} className={`p-1.5 rounded-lg text-[10px] font-black cursor-pointer ${activeStyle === 'streets' ? 'bg-sky-600 text-white' : 'text-slate-600'}`}>
            {isRTL ? 'شوارع' : 'Rues'}
          </button>
          <button onClick={() => setActiveStyle('basic')} className={`p-1.5 rounded-lg text-[10px] font-black cursor-pointer ${activeStyle === 'basic' ? 'bg-sky-600 text-white' : 'text-slate-600'}`}>
            {isRTL ? 'مبسط' : 'Minime'}
          </button>
          <button onClick={() => setActiveStyle('satellite')} className={`p-1.5 rounded-lg text-[10px] font-black cursor-pointer ${activeStyle === 'satellite' ? 'bg-sky-600 text-white' : 'text-slate-600'}`}>
            {isRTL ? 'قمر صناعي' : 'Satellite'}
          </button>
        </div>
        <button onClick={() => mapInstanceRef.current?.setView([34.020882, -6.841650], 11.5, { animate: true })} className="bg-white/90 p-2 rounded-xl shadow-md text-slate-700 hover:text-sky-600 flex items-center gap-1 text-[10px] font-extrabold cursor-pointer">
          <Crosshair className="w-3.5 h-3.5" />
          <span>{isRTL ? 'إعادة ضبط الخريطة' : 'Recentre'}</span>
        </button>
        <button onClick={handleLocateMe} className="bg-white/90 p-2 rounded-xl shadow-md text-slate-700 hover:text-sky-600 flex items-center gap-1 text-[10px] font-extrabold cursor-pointer">
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          <span>{isRTL ? 'تحديد موقعي الحالي' : 'Ma position'}</span>
        </button>
      </div>

      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl text-[10px] font-black text-white">
        {selectedNeighborhood === 'all' ? (isRTL ? 'جهة الرباط سلا تمارة' : 'Rabat-Salé-Témara') : (isRTL ? `${RABAT_NEIGHBORHOODS.find(n => n.id === selectedNeighborhood)?.ar}` : `${RABAT_NEIGHBORHOODS.find(n => n.id === selectedNeighborhood)?.fr}`)}
      </div>

      <div ref={containerRef} className="w-full h-full relative z-0" />

      {selectedTaskState && (
        <div className="absolute bottom-3 left-3 right-12 z-[1000] bg-white rounded-xl shadow-2xl p-3 border border-slate-150 flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 rounded-xl text-sky-600 text-sm">💼</div>
          <div className="flex-1 min-w-0 text-right">
            <h4 className="text-xs font-black text-slate-900 truncate">{selectedTaskState.title}</h4>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">📍 {selectedTaskState.location} • {selectedTaskState.budget} MAD</p>
          </div>
          <button onClick={() => setSelectedTaskState(null)} className="text-slate-400 p-1 hover:text-slate-700">✕</button>
        </div>
      )}
    </div>
  );
}
