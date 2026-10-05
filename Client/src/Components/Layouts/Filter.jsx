import React from "react";
import { Check, Tag, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";

const SidebarShop = ({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  maxPrice,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* --- Categories Section --- */}
      <div>
        <h4 className="text-xs font-extrabold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Tag size={14} /> {t("SidebarShop.CategoriesTitle")}
        </h4>
        
        <div className="space-y-1.5">
          {/* Manual Item: Glucose Meters */}
          <button
            onClick={() => setSelectedCategory("Glucose Meters")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex justify-between items-center group
              ${selectedCategory === "Glucose Meters"
                ? "bg-slate-900 dark:bg-blue-600 text-white shadow-lg translate-x-1"
                : "text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white hover:translate-x-1"
              }`}
          >
            <span>{t("SidebarShop.CategoryItem_GlucoseMeters")}</span>
            {selectedCategory === "Glucose Meters" && (
              <span className="bg-white/20 p-1 rounded-full">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>

          {/* Manual Item: Glucose Pens */}
          <button
            onClick={() => setSelectedCategory("Glucose Pens")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex justify-between items-center group
              ${selectedCategory === "Glucose Pens"
                ? "bg-slate-900 dark:bg-blue-600 text-white shadow-lg translate-x-1"
                : "text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white hover:translate-x-1"
              }`}
          >
            <span>{t("SidebarShop.CategoryItem_GlucosePens")}</span>
            {selectedCategory === "Glucose Pens" && (
              <span className="bg-white/20 p-1 rounded-full">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>

          {/* Manual Item: Insulin */}
          <button
            onClick={() => setSelectedCategory("Insulin")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex justify-between items-center group
              ${selectedCategory === "Insulin"
                ? "bg-slate-900 dark:bg-blue-600 text-white shadow-lg translate-x-1"
                : "text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white hover:translate-x-1"
              }`}
          >
            <span>{t("SidebarShop.CategoryItem_Insulin")}</span>
            {selectedCategory === "Insulin" && (
              <span className="bg-white/20 p-1 rounded-full">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>

          {/* Manual Item: Diabetes Supplies */}
          <button
            onClick={() => setSelectedCategory("Diabetes Supplies")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex justify-between items-center group
              ${selectedCategory === "Diabetes Supplies"
                ? "bg-slate-900 dark:bg-blue-600 text-white shadow-lg translate-x-1"
                : "text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white hover:translate-x-1"
              }`}
          >
            <span>{t("SidebarShop.CategoryItem_DiabetesSupplies")}</span>
            {selectedCategory === "Diabetes Supplies" && (
              <span className="bg-white/20 p-1 rounded-full">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --- Divider --- */}
      <div className="h-px bg-gray-100 dark:bg-gray-700 w-full transition-colors"></div>

      {/* --- Price Range Section --- */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h4 className="text-xs font-extrabold text-slate-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <DollarSign size={14} /> {t("SidebarShop.PriceTitle")}
          </h4>
          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors">
            $0 - ${priceRange}
          </span>
        </div>

        <div className="px-1 py-2">
          <input
            type="range"
            min="0"
            max={maxPrice}
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-blue-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          />
          <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide">
            <span>{t("SidebarShop.MinLabel")} ($0)</span>
            <span>{t("SidebarShop.MaxLabel")} (${maxPrice})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarShop;