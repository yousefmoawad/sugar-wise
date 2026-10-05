import React, { useState, useMemo } from "react";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Eye,
  X,
  Syringe,
  LayoutGrid,
  List,
} from "lucide-react";
import { getFoodDatabase } from "./Insulin_Unit_Data";

const Insulin_Unit = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [insulinType, setInsulinType] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or row

  const foodDatabase = useMemo(() => getFoodDatabase(t), [t]);

  const filteredData = useMemo(() => {
    return foodDatabase.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, foodDatabase]);

  const calculateUnits = (carbs) => {
    if (!insulinType) return 0;
    return (carbs / 10).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-gray-950 dark:via-[#1a5f7f]/10 dark:to-[#4d6a23]/10 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-grow max-w-5xl mx-auto px-4 py-6 w-full">
        {/* HEADER & CONTROLS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 mb-6 border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center tracking-tight">
              <Syringe className="mr-3 text-[#2DA1D7]" size={28} />
              {t("InsulinUnit.PageTitle")}
            </h1>
            
            {/* VIEW TOGGLE BUTTONS */}
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl w-fit">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow-sm text-[#2DA1D7]" : "text-gray-400"}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode("row")}
                className={`p-2 rounded-lg transition-all ${viewMode === "row" ? "bg-white dark:bg-gray-600 shadow-sm text-[#2DA1D7]" : "text-gray-400"}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={t("InsulinUnit.SearchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#2DA1D7] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all"
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            </div>

            <div className="relative min-w-[200px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#2DA1D7] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white appearance-none cursor-pointer outline-none font-bold"
              >
                <option value="All">{t("InsulinUnit.CategoryAll")}</option>
                <option value="Food">{t("InsulinUnit.CategoryFood")}</option>
                <option value="Drinks">{t("InsulinUnit.CategoryDrinks")}</option>
                <option value="Sweets">{t("InsulinUnit.CategorySweets")}</option>
              </select>
              <Filter className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        {/* DATA DISPLAY: GRID OR ROWS */}
        {filteredData.length > 0 ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" 
            : "flex flex-col gap-3"
          }>
            {filteredData.map((item) => (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group ${
                  viewMode === "row" ? "flex items-center p-3" : "flex flex-col overflow-hidden"
                }`}
              >
                {/* IMAGE */}
                <div className={viewMode === "row" 
                  ? "h-16 w-16 rounded-xl overflow-hidden shrink-0" 
                  : "relative h-40 overflow-hidden"
                }>
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                {/* CONTENT */}
                <div className={viewMode === "row" ? "flex-grow px-4 flex items-center justify-between" : "p-4 flex flex-col flex-grow"}>
                  <div className={viewMode === "row" ? "flex flex-col" : "mb-4"}>
                    <h3 className="font-black text-gray-900 dark:text-white text-lg">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-[#2DA1D7] uppercase tracking-wider">{item.carbs}g Carbs</span>
                      {viewMode === "row" && (
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 uppercase">{item.category}</span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => { setSelectedItem(item); setInsulinType(""); }}
                    className={`${viewMode === "row" ? "w-12 h-12" : "w-full py-3"} bg-[#2DA1D7] hover:bg-[#1a8dbf] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2DA1D7]/20`}
                  >
                    <Eye size={18} />
                    {viewMode === "grid" && t("InsulinUnit.BtnView")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center text-gray-400 font-bold">{t("InsulinUnit.NoResults")}</div>
        )}
      </div>

      {/* COMPACT MODAL (Smaller Size) */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative border dark:border-gray-700 animate-scale-in">
            {/* Header Image */}
            <div className="relative h-48">
              <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-800 via-transparent to-transparent"></div>
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-black/20 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 -mt-10 relative z-10">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{selectedItem.name}</h2>
              <p className="text-[#2DA1D7] font-bold text-lg mb-6">{selectedItem.carbs}g {t("InsulinUnit.CarbsLabel")}</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("InsulinUnit.ModalInsulinLabel")}</label>
                  <select
                    value={insulinType}
                    onChange={(e) => setInsulinType(e.target.value)}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-2 focus:ring-[#2DA1D7] dark:text-white outline-none font-bold"
                  >
                    <option value="" disabled>{t("InsulinUnit.ModalInsulinPlaceholder")}</option>
                    <option value="Humalog">{t("InsulinUnit.InsulinHumalog")}</option>
                    <option value="Novorapid">{t("InsulinUnit.InsulinNovorapid")}</option>
                    <option value="Actrapid">{t("InsulinUnit.InsulinActrapid")}</option>
                  </select>
                </div>

                {insulinType && (
                  <div className="bg-[#8EC641]/10 rounded-3xl p-6 border-2 border-[#8EC641]/20 text-center animate-bounce-subtle">
                    <p className="text-[#8EC641] text-[10px] font-black uppercase tracking-widest mb-1">{t("InsulinUnit.ResultDoseFor")} {insulinType}</p>
                    <div className="text-5xl font-black text-gray-900 dark:text-white">
                      {calculateUnits(selectedItem.carbs)} <span className="text-xl opacity-50 uppercase">{t("InsulinUnit.ResultUnits")}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {/* Save Logic */}}
                  disabled={!insulinType}
                  className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
                    insulinType ? "bg-[#8EC641] text-white shadow-xl shadow-[#8EC641]/30 hover:scale-105 active:scale-95" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {t("InsulinUnit.BtnLogDose")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Insulin_Unit;