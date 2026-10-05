import React, { useEffect, useMemo, useState } from "react";
import NewCode from "./NewCode";
import { useTranslation } from "react-i18next";
import usePromoCodes from "../../hooks/usePromoCodes";
import useProducts from "../../hooks/useProducts";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Tag,
  Percent,
  CheckCircle2,
  XCircle,
  Calendar,
  ShoppingBag,
  Copy,
} from "lucide-react";

const PromoCode = () => {
  const { t } = useTranslation();
  const {
    items,
    loading,
    error,
    fetchAll,
    createItem,
    updateItem,
    deleteItem,
  } = usePromoCodes();
  const { items: productItems, fetchAll: fetchProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isNewCodeOpen, setIsNewCodeOpen] = useState(false);

  // New state to hold the code being edited
  const [selectedPromo, setSelectedPromo] = useState(null);

  const [promoCodes, setPromoCodes] = useState([]);

  useEffect(() => {
    fetchAll().catch(() => {});
    fetchProducts().catch(() => {});
  }, [fetchAll, fetchProducts]);

  useEffect(() => {
    const mapped = (items || []).map((promo) => ({
      id: promo._id,
      code: promo.promoCodeName,
      discount:
        promo.discountTypeArray === "Percentage"
          ? `${promo.value}%`
          : `$${promo.value}`,
      type: promo.discountTypeArray,
      status: promo.state || "Active",
      usage: 0,
      startDate: promo.startDate
        ? new Date(promo.startDate).toISOString().slice(0, 10)
        : "",
      expiryDate: promo.endDate
        ? new Date(promo.endDate).toISOString().slice(0, 10)
        : "",
      description: promo.applyProduct?.productName || "Promo code",
      discountValue: promo.value,
      discountType:
        promo.discountTypeArray === "Percentage" ? "percentage" : "fixed",
      selectedProducts: promo.product ? [promo.product] : [],
    }));
    setPromoCodes(mapped);
  }, [items]);

  const products = useMemo(
    () =>
      (productItems || []).map((p) => ({
        id: p._id,
        name: p.name,
        image: p.image1 || "https://placehold.co/100",
      })),
    [productItems],
  );

  const handleOpenAdd = () => {
    setSelectedPromo(null);
    setIsNewCodeOpen(true);
  };

  const handleOpenEdit = (promo) => {
    setSelectedPromo(promo);
    setIsNewCodeOpen(true);
  };

  const handleSavePromoCode = async (data) => {
    const payload = {
      promoCodeName: data.code,
      discountTypeArray:
        data.discountType === "percentage" ? "Percentage" : "Fixed Amount",
      value: Number(data.discountValue),
      startDate: data.startDate,
      endDate: data.endDate,
      product: data.selectedProducts?.[0],
      state: "Active",
    };

    try {
      if (selectedPromo) {
        await updateItem(selectedPromo.id, payload);
      } else {
        await createItem(payload);
      }
      await fetchAll();
      setIsNewCodeOpen(false);
      setSelectedPromo(null);
    } catch (saveError) {
      console.error(saveError);
    }
  };

  const toggleStatus = async (id) => {
    const promo = promoCodes.find((p) => p.id === id);
    if (!promo) return;
    const nextState = promo.status === "Active" ? "Inactive" : "Active";
    try {
      await updateItem(id, { state: nextState });
      await fetchAll();
    } catch (statusError) {
      console.error(statusError);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("PromoCode.ConfirmDelete"))) {
      try {
        await deleteItem(id);
        setPromoCodes((prev) => prev.filter((p) => p.id !== id));
      } catch (deleteError) {
        console.error(deleteError);
      }
    }
  };

  const filteredCodes = promoCodes.filter((promo) => {
    const matchesSearch = promo.code
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "All" || promo.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-8 animate-fade-in min-h-screen ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {t("PromoCode.Title")}
          </h1>
          <p className="text-gray-50 dark:text-gray-400 font-medium">
            {t("PromoCode.Subtitle")}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#2DA1D7] text-white px-8 py-4 rounded-[1.5rem] font-bold hover:bg-[#1a5f7f] transition-all shadow-lg shadow-[#2DA1D7]/20"
        >
          <Plus size={20} /> {t("PromoCode.BtnCreate")}
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2DA1D7] transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder={t("PromoCode.SearchPlaceholder")}
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-900 border-none rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-[#2DA1D7] transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800 w-full xl:w-auto overflow-x-auto no-scrollbar">
          {["All", "Active", "Expired", "Inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeFilter === f ? "bg-[#2DA1D7] text-white shadow-md shadow-[#2DA1D7]/20" : "text-gray-400 hover:text-[#2DA1D7] hover:bg-[#2DA1D7]/5"}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && <p className="text-sm text-blue-600">Loading promo codes...</p>}
        {error && <p className="text-sm text-red-600">Failed to load promo codes</p>}
        {filteredCodes.map((promo) => (
          <div
            key={promo.id}
            className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-all group overflow-hidden"
          >
            {/* [PROMO CARD]: Robust design to handle long strings and prevent overflow */}
            <div className="flex justify-between items-start mb-4 gap-4 overflow-hidden">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-3 bg-[#2DA1D7]/10 text-[#2DA1D7] rounded-2xl flex-shrink-0">
                  <Tag size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white break-all leading-tight">
                    {promo.code}
                  </h3>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block truncate">
                    {promo.type}
                  </span>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border flex-shrink-0 ${promo.status === "Active" ? "bg-[#8EC641]/10 text-[#8EC641] border-[#8EC641]/20" : "bg-gray-100 text-gray-500 border-gray-200"}`}
              >
                {promo.status}
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-6 line-clamp-2 min-h-[40px]">
              {promo.description}
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-400 font-bold">
                  <Percent size={16} /> {t("PromoCode.CardDiscount")}
                </span>
                <span className="font-black text-gray-800 dark:text-white">
                  {promo.discount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-400 font-bold">
                  <ShoppingBag size={16} /> {t("PromoCode.CardUsage")}
                </span>
                <span className="font-black text-gray-800 dark:text-white">
                  {promo.usage} {t("PromoCode.Times")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-400 font-bold">
                  <Calendar size={16} /> {t("PromoCode.CardExpires")}
                </span>
                <span className="font-black text-gray-800 dark:text-white">
                  {promo.expiryDate}
                </span>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-50 dark:border-gray-800">
              <button
                onClick={() => navigator.clipboard.writeText(promo.code)}
                className="flex-1 py-3 items-center justify-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors flex"
              >
                <Copy size={16} /> {t("PromoCode.BtnCopy")}
              </button>
              <button
                onClick={() => toggleStatus(promo.id)}
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-[#2DA1D7] transition-colors"
              >
                {promo.status === "Active" ? (
                  <XCircle size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}
              </button>

              {/* EDIT BUTTON */}
              <button
                onClick={() => handleOpenEdit(promo)}
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-[#2DA1D7] transition-colors"
              >
                <Edit3 size={20} />
              </button>

              <button
                onClick={() => handleDelete(promo.id)}
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        <div
          onClick={handleOpenAdd}
          className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-[#2DA1D7]/50 transition-all min-h-[300px]"
        >
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-300 group-hover:text-[#2DA1D7] transition-all mb-4">
            <Plus size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {t("PromoCode.EmptyTitle")}
          </h3>
        </div>
      </div>

      <NewCode
        isOpen={isNewCodeOpen}
        onClose={() => setIsNewCodeOpen(false)}
        products={products}
        onSave={handleSavePromoCode}
        editData={selectedPromo}
      />
    </div>
  );
};

export default PromoCode;
