import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Upload,
  Utensils,
  Zap,
  Flame,
  Syringe,
  Plus,
  Trash2,
  Save,
} from "lucide-react";

const AddItemUnits = ({ isOpen, onClose, onAdd, editData }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    category: "Food",
    carbs: "",
    fats: "",
    image: null,
    medications: [
      { name: "Humalog", units: "" },
      { name: "Novorapid", units: "" },
      { name: "Actrapid", units: "" },
    ],
  });

  const [imagePreview, setImagePreview] = useState(null);

  // --- EFFECT TO HANDLE EDIT MODE ---
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        category: editData.type || "Food",
        carbs: editData.carbs === "-" ? "" : editData.carbs,
        fats: editData.fats === "-" ? "" : editData.fats,
        image: editData.image || null,
        medications: editData.medications || [
          { name: "Humalog", units: "" },
          { name: "Novorapid", units: "" },
          { name: "Actrapid", units: "" },
        ],
      });
      setImagePreview(editData.image || null);
    } else {
      // Reset for "Add" mode
      setFormData({
        name: "",
        category: "Food",
        carbs: "",
        fats: "",
        image: null,
        medications: [
          { name: "Humalog", units: "" },
          { name: "Novorapid", units: "" },
          { name: "Actrapid", units: "" },
        ],
      });
      setImagePreview(null);
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addMedicationRow = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: "", units: "" }],
    });
  };

  const updateMedication = (index, field, value) => {
    const updatedMeds = [...formData.medications];
    updatedMeds[index][field] = value;
    setFormData({ ...formData, medications: updatedMeds });
  };

  const removeMedication = (index) => {
    const updatedMeds = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: updatedMeds });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      type: formData.category,
      carbs: formData.carbs || "-",
      fats: formData.fats || "-",
      image: imagePreview, // Keep the preview URL or file
    };
    onAdd(submissionData);
    onClose();
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case "Food":
        return t("InsulinLibrary.CategoryFood");
      case "Drink":
        return t("InsulinLibrary.CategoryDrink");
      case "Sweets":
        return t("InsulinLibrary.CategorySweets");
      default:
        return cat;
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-hidden">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[95vh]">
        {/* [FORM HEADER]: Professional brand header with blue-green accents */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white ${editData ? "bg-amber-500" : "bg-gradient-to-br from-[#2DA1D7] to-[#8EC641]"}`}>
              <Plus size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editData
                ? t("InsulinLibrary.ModalTitleEdit")
                : t("InsulinLibrary.ModalTitleAdd")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-400 transition-all hover:text-rose-500"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 overflow-y-auto custom-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {/* [IMAGE UPLOAD]: Branded dropzone interface */}
              <label className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] cursor-pointer hover:bg-[#2DA1D7]/5 dark:hover:bg-[#2DA1D7]/10 hover:border-[#2DA1D7]/30 transition-all overflow-hidden group">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Upload size={32} className="mb-2 group-hover:text-[#2DA1D7] transition-all" />
                    <span className="text-xs font-bold uppercase tracking-widest text-center group-hover:text-[#2DA1D7]">
                      {t("InsulinLibrary.LabelUpload")}
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </label>

              {/* [CATEGORY SELECTOR]: Integrated with brand palette */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  {t("InsulinLibrary.LabelCategory")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Food", "Drink", "Sweets"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category: cat })
                      }
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${formData.category === cat ? "bg-[#2DA1D7] border-[#2DA1D7] text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-[#2DA1D7]/30"}`}
                    >
                      {getCategoryLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  {t("InsulinLibrary.LabelName")}
                </label>
                <div className="relative">
                  <Utensils
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    required
                    type="text"
                    placeholder={t("InsulinLibrary.PlaceholderName")}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-[#2DA1D7] transition-all text-gray-900 dark:text-gray-100"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Zap size={10} className="text-[#2DA1D7]" /> {t("InsulinLibrary.LabelCarbs")}
                  </label>
                  <input
                    type="text"
                    placeholder="-"
                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-[#2DA1D7]/30 transition-all text-gray-900 dark:text-gray-100 font-bold"
                    value={formData.carbs}
                    onChange={(e) =>
                      setFormData({ ...formData, carbs: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Flame size={10} className="text-rose-500" /> {t("InsulinLibrary.LabelFats")}
                  </label>
                  <input
                    type="text"
                    placeholder="-"
                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-[#2DA1D7]/30 transition-all text-gray-900 dark:text-gray-100 font-bold"
                    value={formData.fats}
                    onChange={(e) =>
                      setFormData({ ...formData, fats: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* [INSULIN REQUIREMENTS]: Detailed medication tracking with brand accents */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-black text-[#2DA1D7] uppercase tracking-widest flex items-center gap-2">
                <Syringe size={16} /> {t("InsulinLibrary.LabelInsulinReq")}
              </label>
              <button
                type="button"
                onClick={addMedicationRow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2DA1D7]/5 dark:bg-[#2DA1D7]/10 text-[#2DA1D7] rounded-lg text-[10px] font-black uppercase hover:bg-[#2DA1D7] hover:text-white transition-all border border-[#2DA1D7]/10"
              >
                <Plus size={12} /> {t("InsulinLibrary.BtnAddMed")}
              </button>
            </div>

            <div className="space-y-3">
              {formData.medications.map((med, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-center group animate-fade-in"
                >
                  <input
                    required
                    type="text"
                    placeholder={t("InsulinLibrary.PlaceholderMedName")}
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200"
                    value={med.name}
                    onChange={(e) =>
                      updateMedication(index, "name", e.target.value)
                    }
                  />
                  <div className="relative w-32">
                    <input
                      required
                      type="number"
                      placeholder={t("InsulinLibrary.PlaceholderUnits")}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-black text-[#2DA1D7]"
                      value={med.units}
                      onChange={(e) =>
                        updateMedication(index, "units", e.target.value)
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                      U
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] hover:from-[#1a5f7f] hover:to-[#5e8b24] text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
          >
            <Save size={20} />{" "}
            {editData
              ? t("InsulinLibrary.BtnUpdate")
              : t("InsulinLibrary.BtnSave")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItemUnits;
