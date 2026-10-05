import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import {
  X,
  Ticket,
  Percent,
  Banknote,
  Plus,
  Search,
  CheckCircle2,
} from "lucide-react";

const NewCode = ({ isOpen, onClose, products, onSave, editData }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    startDate: "",
    endDate: "",
    selectedProducts: [],
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Logic to handle pre-filling form if editData exists
  useEffect(() => {
    if (editData) {
      setFormData({
        code: editData.code || "",
        discountType: editData.discountType || "percentage",
        discountValue: editData.discountValue || "",
        startDate: editData.startDate || "",
        endDate: editData.expiryDate || "",
        selectedProducts: editData.selectedProducts || [],
      });
    } else {
      // Reset for "Add New" mode
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: "",
        startDate: "",
        endDate: "",
        selectedProducts: [],
      });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const toggleProduct = (productId) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter((id) => id !== productId)
        : [...prev.selectedProducts, productId],
    }));
  };

  const selectAll = () => {
    if (formData.selectedProducts.length === products.length) {
      setFormData({ ...formData, selectedProducts: [] });
    } else {
      setFormData({ ...formData, selectedProducts: products.map((p) => p.id) });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return ReactDOM.createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="absolute inset-0 w-full h-full" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* [MODAL HEADER]: Branded ticket icon with blue gradient */}
            <div className="p-3 bg-gradient-to-br from-[#2DA1D7] to-[#1a5f7f] rounded-xl text-white shadow-lg shadow-[#2DA1D7]/20 dark:shadow-none">
              <Ticket size={22} />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              {editData
                ? t("PromoCode.ModalTitleEdit")
                : t("PromoCode.ModalTitle")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8 overflow-y-auto custom-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Promo Code Input */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                {t("PromoCode.LabelCode")}
              </label>
              <div className="relative group">
                <Plus
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2DA1D7] group-focus-within:text-[#1a5f7f] transition-colors"
                  size={18}
                />
                <input
                  required
                  type="text"
                  placeholder={t("PromoCode.PlaceholderCode")}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/50 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/20 transition-all text-gray-900 dark:text-gray-100 font-black uppercase tracking-wider text-base hover:bg-gray-100 dark:hover:bg-gray-800/80 outline-none"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
            </div>

            {/* Discount Type Toggle */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                {t("PromoCode.LabelType")}
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, discountType: "percentage" })
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                    formData.discountType === "percentage"
                      ? "bg-white dark:bg-gray-700 text-[#2DA1D7] shadow-md"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  <Percent size={14} /> {t("PromoCode.TypePercentage")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, discountType: "fixed" })
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                    formData.discountType === "fixed"
                      ? "bg-white dark:bg-gray-700 text-[#2DA1D7] shadow-md"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  <Banknote size={14} /> {t("PromoCode.TypeFixed")}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Discount Value */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                {t("PromoCode.LabelValue")}
              </label>
              <input
                required
                type="number"
                placeholder={
                  formData.discountType === "percentage" ? "%" : "EGP"
                }
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/50 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/20 transition-all text-gray-900 dark:text-gray-100 font-black outline-none"
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({ ...formData, discountValue: e.target.value })
                }
              />
            </div>
            {/* Dates */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                {t("PromoCode.LabelStart")}
              </label>
              <input
                required
                type="date"
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/50 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/20 transition-all text-gray-900 dark:text-gray-100 font-bold outline-none"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                {t("PromoCode.LabelEnd")}
              </label>
              <input
                required
                type="date"
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/50 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/20 transition-all text-gray-900 dark:text-gray-100 font-bold outline-none"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Product Selection Section */}
          <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-end">
              <label className="text-xs font-black text-[#2DA1D7] uppercase tracking-widest">
                {t("PromoCode.LabelProducts")}
              </label>
              <button
                type="button"
                onClick={selectAll}
                className="text-[10px] font-black text-gray-400 uppercase hover:text-[#2DA1D7] transition-colors"
              >
                {formData.selectedProducts.length === products.length
                  ? t("PromoCode.BtnDeselectAll")
                  : t("PromoCode.BtnSelectAll")}
              </button>
            </div>

            {/* Mini Search */}
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2DA1D7] transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder={t("PromoCode.SearchProducts")}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#2DA1D7]/20 transition-all outline-none text-gray-900 dark:text-gray-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Product List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {filteredProducts.map((p) => {
                const isSelected = formData.selectedProducts.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 text-left group ${
                      isSelected
                        ? "border-[#2DA1D7] bg-[#2DA1D7]/5 dark:bg-[#2DA1D7]/20"
                        : "border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                      <img
                        src={p.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className={`flex-1 text-xs font-bold truncate ${
                        isSelected
                          ? "text-[#2DA1D7] dark:text-[#2DA1D7]"
                          : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"
                      }`}
                    >
                      {p.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2
                        size={16}
                        className="text-[#2DA1D7] animate-in zoom-in spin-in-90 duration-300"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#2DA1D7] to-[#1a5f7f] hover:from-[#1a5f7f] hover:to-[#2DA1D7] text-white font-black py-5 rounded-2xl shadow-xl shadow-[#2DA1D7]/20 dark:shadow-none transition-all active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
          >
            {editData
              ? t("PromoCode.BtnUpdateCode")
              : t("PromoCode.BtnGenerate")}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default NewCode;
