import React, { useEffect, useState } from "react";
import AddItemUnits from "./AddItemUnits";
import { useTranslation } from "react-i18next";
import useInsulinUnits from "../../hooks/useInsulinUnits";
/* [ICONS]: Brand-aligned iconography for insulin management */
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  UtensilsCrossed,
  Milk,
  Candy,
  Flame,
  Zap,
  Filter,
} from "lucide-react";

const InsulinUnitsDashboard = () => {
  const { t } = useTranslation();
  const { items, loading, error, fetchAll, createItem, updateItem, deleteItem } = useInsulinUnits();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All"); // Options: All, Food, Drink, Sweets
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  useEffect(() => {
    const mapped = (items || []).map((item) => ({
      id: item._id,
      name: item.name,
      type: "Food",
      carbs: item.carbs ? `${item.carbs}g` : "-",
      fats: item.fats ? `${item.fats}g` : "-",
      isHidden: false,
      image: item.image || "https://placehold.co/150",
      medications: (item.medications || []).map(m => ({
        name: m.name,
        units: String(m.units || 0)
      })),
    }));
    setCategories(mapped);
  }, [items]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (itemData) => {
    const payload = {
      name: itemData.name,
      image: itemData.image || "",
      carbs: Number(String(itemData.carbs).replace("g", "") || 0),
      fats: Number(String(itemData.fats).replace("g", "") || 0),
      medications: itemData.medications.map(m => ({
        name: m.name,
        units: Number(m.units || 0)
      }))
    };

    try {
      if (selectedItem) {
        await updateItem(selectedItem.id, payload);
      } else {
        await createItem(payload);
      }
      await fetchAll();
      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (saveError) {
      console.error(saveError);
    }
  };

  const filteredItems = categories.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case "Food": return <UtensilsCrossed size={16} />;
      case "Drink": return <Milk size={16} />;
      case "Sweets": return <Candy size={16} />;
      default: return <Filter size={16} />;
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case "All": return t("InsulinLibrary.CategoryAll");
      case "Food": return t("InsulinLibrary.CategoryFood");
      case "Drink": return t("InsulinLibrary.CategoryDrink");
      case "Sweets": return t("InsulinLibrary.CategorySweets");
      default: return cat;
    }
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in min-h-screen bg-gray-50 dark:bg-gray-900 ">
      {/* [HEADER SECTION]: Clean brand-aligned header with blue accents */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {t("InsulinLibrary.Title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {t("InsulinLibrary.Subtitle")}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#2DA1D7] text-white px-8 py-4 rounded-[1.5rem] font-bold hover:bg-[#1a5f7f] transition-all shadow-lg shadow-[#2DA1D7]/20"
        >
          <Plus size={20} /> {t("InsulinLibrary.BtnAddNew")}
        </button>
      </div>

      {/* [SEARCH & FILTERS]: Matches brand identity with blue focus keys */}
      <div className="flex flex-col xl:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2DA1D7] transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder={t("InsulinLibrary.SearchPlaceholder")}
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-900 border-none rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-[#2DA1D7] transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800 w-full xl:w-auto overflow-x-auto no-scrollbar">
          {["All", "Food", "Drink", "Sweets"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-[#2DA1D7] text-white shadow-md shadow-[#2DA1D7]/20"
                  : "text-gray-400 hover:text-[#2DA1D7] hover:bg-[#2DA1D7]/5 dark:hover:bg-[#2DA1D7]/10"
              }`}
            >
              {getTypeIcon(cat)}
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* [DATA TABLE]: Brand-consistent table accents and interactive rows */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-none">
        {loading && <p className="px-8 py-4 text-sm text-blue-600">Loading insulin units...</p>}
        {error && <p className="px-8 py-4 text-sm text-red-600">Failed to load insulin units</p>}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#2DA1D7]/5 dark:bg-gray-800/50 border-b border-[#2DA1D7]/10">
              <th className="px-8 py-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest">
                {t("InsulinLibrary.TableColItem")}
              </th>
              <th className="px-8 py-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest text-center">
                {t("InsulinLibrary.TableColCarbs")}
              </th>
              <th className="px-8 py-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest text-center">
                {t("InsulinLibrary.TableColFats")}
              </th>
              <th className="px-8 py-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest text-right">
                {t("InsulinLibrary.TableColActions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className={`group transition-all duration-300 ${item.isHidden ? "opacity-40 grayscale" : "hover:bg-[#2DA1D7]/5 dark:hover:bg-[#2DA1D7]/10"}`}
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border-2 border-white dark:border-gray-700 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-gray-800 dark:text-gray-100 block truncate">{item.name}</span>
                      <span className="text-[10px] font-black uppercase text-[#2DA1D7] tracking-tighter flex items-center gap-1">
                        {getTypeIcon(item.type)} {getCategoryLabel(item.type)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg text-xs font-black">
                    <Zap size={12} /> {item.carbs}
                  </span>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black ${item.fats === "-" ? "text-gray-300 dark:text-gray-600" : "bg-rose-50 dark:bg-rose-900/20 text-rose-600"}`}>
                    <Flame size={12} /> {item.fats}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenEdit(item)} className="p-3 text-gray-300 hover:text-[#2DA1D7] hover:bg-[#2DA1D7]/10 rounded-2xl transition-all shadow-sm">
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => setCategories(categories.map((c) => c.id === item.id ? { ...c, isHidden: !c.isHidden } : c))}
                      className={`p-3 rounded-2xl transition-all shadow-sm ${item.isHidden ? "text-amber-600 bg-amber-50" : "text-gray-300 hover:text-[#2DA1D7]"}`}
                    >
                      {item.isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await deleteItem(item.id);
                          setCategories(categories.filter((c) => c.id !== item.id));
                        } catch (e) { console.error(e); }
                      }}
                      className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="p-20 text-center animate-pulse">
            <Filter className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400 font-bold">{t("InsulinLibrary.EmptyState")}</p>
          </div>
        )}
      </div>

      <AddItemUnits
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleSaveItem}
        editData={selectedItem}
      />
    </div>
  );
};

export default InsulinUnitsDashboard;
