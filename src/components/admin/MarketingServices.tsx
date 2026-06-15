import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Percent, 
  MapPin, 
  Sliders, 
  Award, 
  Send, 
  Check, 
  Settings, 
  HelpCircle,
  TrendingUp
} from 'lucide-react';

interface MarketingServicesProps {
  isRTL: boolean;
  isDarkMode: boolean;
  onAddLog: (log: string) => void;
}

export default function MarketingServices({
  isRTL,
  isDarkMode,
  onAddLog
}: MarketingServicesProps) {
  // Service categories configuration with commissions
  const [categories, setCategories] = useState([
    { id: 'cat-1', nameFr: 'Cleaning & Maid', nameAr: 'تنظيف وتطهير المنازل', baseCost: 150, currentCommission: 15, active: true },
    { id: 'cat-2', nameFr: 'Plumbing & Repairs', nameAr: 'سباكة وصيانة الأنابيب', baseCost: 200, currentCommission: 15, active: true },
    { id: 'cat-3', nameFr: 'Electrician & Power', nameAr: 'أعمال الكهرباء والشبكات', baseCost: 180, currentCommission: 12, active: true },
    { id: 'cat-4', nameFr: 'Gardening & Green', nameAr: 'البستنة وتزيين الحدائق', baseCost: 120, currentCommission: 10, active: false }
  ]);

  // Locations / Rabat Neighborhood localized factors
  const [locations, setLocations] = useState([
    { id: 'loc-1', nameFr: 'Agdal', nameAr: 'أكدال', activeProviders: 42, baseMultiplier: 1.0, activeStatus: true },
    { id: 'loc-2', nameFr: 'Souissi', nameAr: 'السويسي', activeProviders: 18, baseMultiplier: 1.25, activeStatus: true },
    { id: 'loc-3', nameFr: 'Hay Riad', nameAr: 'حي الرياض', activeProviders: 29, baseMultiplier: 1.15, activeStatus: true },
    { id: 'loc-4', nameFr: 'Hassan', nameAr: 'حسان', activeProviders: 35, baseMultiplier: 1.0, activeStatus: true },
    { id: 'loc-5', nameFr: 'El Youssoufia', nameAr: 'اليوسفية', activeProviders: 15, baseMultiplier: 0.9, activeStatus: true }
  ]);

  // Coupons state
  const [coupons, setCoupons] = useState([
    { id: 'COP-AKDAL10', code: 'AKDAL10', discount: 10, type: 'percent', active: true, redeemed: 142 },
    { id: 'COP-RABATFREE', code: 'RABATFREE', discount: 100, type: 'flat', active: true, redeemed: 88 },
    { id: 'COP-HIYA5', code: 'HIYA5', discount: 5, type: 'percent', active: false, redeemed: 12 }
  ]);

  // Form states
  const [newCatFr, setNewCatFr] = useState('');
  const [newCatAr, setNewCatAr] = useState('');
  const [newCatPrice, setNewCatPrice] = useState(150);

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);
  const [newCouponType, setNewCouponType] = useState<'percent' | 'flat'>('percent');

  const handleAddCategory = () => {
    if (!newCatFr.trim() || !newCatAr.trim()) return;
    const item = {
      id: `cat-${Date.now()}`,
      nameFr: newCatFr.trim(),
      nameAr: newCatAr.trim(),
      baseCost: Number(newCatPrice),
      currentCommission: 15,
      active: true
    };
    setCategories(prev => [...prev, item]);
    onAddLog(`SaaS Catalog: Added new service category [${newCatFr}]`);
    setNewCatFr('');
    setNewCatAr('');
    alert(isRTL ? 'تم إدراج فئة الخدمات الجديدة للمنصة بنجاح!' : 'Catégorie de service ajoutée avec succès !');
  };

  const handleAddCoupon = () => {
    if (!newCouponCode.trim()) return;
    const item = {
      id: `cop-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discount: Number(newCouponDiscount),
      type: newCouponType,
      active: true,
      redeemed: 0
    };
    setCoupons(prev => [item, ...prev]);
    onAddLog(`Marketing: Created promotional coupon [${item.code}]`);
    setNewCouponCode('');
    alert(isRTL ? 'تم إنشاء كود الخصم الترويجي وضخه بالشبكة!' : 'Coupon de réduction actif de suite !');
  };

  const toggleCategory = (id: string, name: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    onAddLog(`Catalog toggle [${name}]`);
  };

  const adjustMultiplier = (id: string, factor: number) => {
    setLocations(prev => prev.map(l => l.id === id ? { ...l, baseMultiplier: factor } : l));
    onAddLog(`Zone surge altered. ID ${id} set to x${factor}`);
  };

  return (
    <div className="flex flex-col gap-8" id="admin-module-marketing-services">
      {/* 1. Services categories Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category lists */}
        <div className={`p-5 rounded-3xl border lg:col-span-8 flex flex-col gap-4 text-right ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
        }`}>
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
            {isRTL ? 'فئات الخدمات المتاحة ومفوضية الخصم' : 'Modèles de Services & Commissions de Catalogue'}
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/50 text-slate-400 border-b select-none dark:bg-slate-950/40 dark:border-slate-800">
                <tr>
                  <th className="p-2 text-right">{isRTL ? 'إسم الفئة وتوطينها' : 'Catégorie'}</th>
                  <th className="p-2 text-right">{isRTL ? 'سعر الاستدعاء الأدنى' : 'Base (MAD)'}</th>
                  <th className="p-2 text-right">{isRTL ? 'خصم مخصص للفئة' : 'Com (%)'}</th>
                  <th className="p-2 text-center">{isRTL ? 'حالة السريان' : 'Statut'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/10 font-bold">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-100/30 transition-all border-b dark:border-slate-850">
                    <td className="p-2.5">
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{isRTL ? cat.nameAr : cat.nameFr}</span>
                        <span className="text-[9.5px] text-gray-400 font-semibold">{cat.nameFr}</span>
                      </div>
                    </td>
                    <td className="p-2.5 font-mono text-indigo-505 dark:text-indigo-405">{cat.baseCost} MAD</td>
                    <td className="p-2.5 font-mono">{cat.currentCommission}%</td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => toggleCategory(cat.id, cat.nameFr)}
                        className={`px-3 py-1 rounded-xl text-[9.5px] cursor-pointer font-black transition-all ${
                          cat.active 
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' 
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-450'
                        }`}
                      >
                        {cat.active ? (isRTL ? 'نشط بالكتالوج' : 'Actif') : (isRTL ? 'موقوف إدارياً' : 'Désactivé')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Category Workbench Form */}
        <div className={`p-5 rounded-3xl border lg:col-span-4 flex flex-col gap-3 text-right ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
        }`}>
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
            {isRTL ? 'أداة إضافة الفئات وسلاسل الموردين' : 'Création de Catégorie SaaS'}
          </h4>

          <div className="flex flex-col gap-3 mt-1.5 text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-black text-slate-500">{isRTL ? 'الإسم بالفرنسية (للـ URL)' : 'Nom (Fr)'}</label>
              <input
                type="text"
                placeholder="Ex. Electrician Services"
                value={newCatFr}
                onChange={(e) => setNewCatFr(e.target.value)}
                className={`px-3 py-2 border rounded-xl focus:outline-none font-semibold ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-gray-200'
                }`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-black text-slate-500">{isRTL ? 'الإسم بالعربية (للمستهلك)' : 'Nom (Ar)'}</label>
              <input
                type="text"
                placeholder="مثال: أشغال السباكة"
                value={newCatAr}
                onChange={(e) => setNewCatAr(e.target.value)}
                className={`px-3 py-2 border rounded-xl focus:outline-none font-semibold text-right ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-gray-200'
                }`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-black text-slate-500">{isRTL ? 'الحد الأدنى لطلب الخدمة (MAD)' : 'Frais minimum (MAD)'}</label>
              <input
                type="number"
                min="50"
                value={newCatPrice}
                onChange={(e) => setNewCatPrice(Number(e.target.value))}
                className={`px-3 py-2 border rounded-xl focus:outline-none font-mono ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-gray-200'
                }`}
              />
            </div>

            <button
              onClick={handleAddCategory}
              className="mt-2.5 bg-indigo-650 hover:bg-indigo-700 text-white py-2.5 rounded-xl cursor-pointer font-black flex items-center justify-center gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isRTL ? 'إدراج بالكتالوج الميداني' : 'Ajouter au catalogue'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. localized Rabat Neighborhood Surge multiplier limits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-5 rounded-3xl border flex flex-col gap-4 text-right ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 mb-1 flex-row-reverse">
            <MapPin className="w-4 h-4 text-sky-505" />
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              {isRTL ? 'تغطية المقاطعات بالرباط ومعاملات الطلب الطارئ' : 'Zones de Rabat & Coefficients Multiplicateurs'}
            </h4>
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed">
            {isRTL 
              ? 'اضبط معامل تسعير المهام التلقائي في المقاطعات لحساب فترات الذروة وتقلب العرض، كحي الرياض والسويسي الراقيين.' 
              : 'Gérer les multiplicateurs de tarification dynamiques par district de Rabat (Agdal, Souissi, Hay Riad...) selon l\'affluence.'}
          </p>

          <div className="space-y-3.5 mt-2">
            {locations.map((loc) => (
              <div key={loc.id} className="p-3 rounded-2xl border flex items-center justify-between text-xs font-bold dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.8"
                    max="1.8"
                    step="0.05"
                    value={loc.baseMultiplier}
                    onChange={(e) => adjustMultiplier(loc.id, Number(e.target.value))}
                    className="w-20 sm:w-28 accent-indigo-600 focus:outline-none"
                  />
                  <span className="font-mono text-indigo-660 dark:text-indigo-405 font-black w-8">x{loc.baseMultiplier}</span>
                </div>

                <div className="flex flex-col text-right">
                  <span className="font-extrabold text-slate-800 dark:text-slate-100">{isRTL ? loc.nameAr : loc.nameFr}</span>
                  <span className="text-[9px] text-slate-405 font-semibold">{loc.activeProviders} {isRTL ? 'حرفي متواجد' : 'prestataires dispos'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Coupon management catalog */}
        <div className={`p-5 rounded-3xl border flex flex-col gap-4 text-right ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-150 shadow-xs'
        }`}>
          <div className="flex justify-between items-center border-b pb-2 flex-row-reverse">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              {isRTL ? 'حملات الكوبونات الترويجية الفعالة' : 'Codes de Réduction & Marketing'}
            </h4>
            <Percent className="w-4 h-4 text-sky-505" />
          </div>

          <div className="flex gap-2 text-xs flex-row-reverse items-end mt-1">
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-black text-slate-500 text-[10px]">{isRTL ? 'كود الخصم (بارز)' : 'Coupon'}</label>
              <input
                type="text"
                placeholder="EX: RAMADAN10"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
                className={`px-3 py-2 border rounded-xl focus:outline-none font-black uppercase ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-gray-200'
                }`}
              />
            </div>

            <div className="w-20 flex flex-col gap-1">
              <label className="font-black text-slate-500 text-[10px]">{isRTL ? 'الخصم' : 'Valeur'}</label>
              <input
                type="number"
                value={newCouponDiscount}
                onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                className={`px-3 py-2 border rounded-xl focus:outline-none font-mono ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-gray-200'
                }`}
              />
            </div>

            <button
              onClick={handleAddCoupon}
              className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer transition-all shrink-0"
            >
              {isRTL ? 'إنشاء' : 'Créer'}
            </button>
          </div>

          {/* Coupon Ledger lists */}
          <div className="space-y-3 mt-2.5 max-h-[190px] overflow-y-auto pr-1">
            {coupons.map((cop) => (
              <div key={cop.id} className="p-3 rounded-2xl border flex items-center justify-between text-xs font-bold dark:border-slate-800/80">
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black ${
                  cop.active 
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10' 
                    : 'bg-gray-100 text-gray-500 dark:bg-slate-800 text-slate-400'
                }`}>
                  {cop.active ? (isRTL ? 'مفعل وجاهز' : 'Actif') : (isRTL ? 'منتهي الصلاحية' : 'Expiré')}
                </span>

                <div className="flex flex-col text-right">
                  <span className="font-mono text-slate-900 dark:text-white uppercase font-black">{cop.code}</span>
                  <span className="text-[9.5px] text-gray-400 font-medium">
                    {isRTL ? `قيمة الخصم: ${cop.discount}` : `Réduction: ${cop.discount}`} {cop.type === 'percent' ? '%' : 'MAD'} • {cop.redeemed} utilized
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
