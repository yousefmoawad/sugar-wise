import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import useDietlySystems from "../../hooks/useDietlySystems";
import useDiabetesMonitorings from "../../hooks/useDiabetesMonitorings";
import { readImageAsDataURL } from "../../utils/readImageAsDataURL";
import {
  Info,
  Plus,
  Calculator,
  X,
  Eye,
  Edit3,
  Trash2,
  Camera,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const DietarySystems = () => {
  const { t } = useTranslation();
  const {
    items,
    loading,
    error,
    fetchAll,
    createItem,
    updateItem,
    deleteItem,
  } = useDietlySystems();
  const { createItem: syncToMonitoring } = useDiabetesMonitorings();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingMeal, setViewingMeal] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);

  const [meals, setMeals] = useState([]);
  const [mealImageDataUrl, setMealImageDataUrl] = useState("");
  const [mealImageError, setMealImageError] = useState("");
  const mealFileInputRef = useRef(null);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  useEffect(() => {
    const mapped = (items || []).map((meal) => ({
      id: meal._id,
      name: meal.name,
      cals: meal.cals,
      carbs: meal.carbs,
      ingredients: meal.ingredients,
      image:
        meal.image ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
    }));
    setMeals(mapped);
  }, [items]);

  useEffect(() => {
    if (isAddModalOpen) {
      setMealImageError("");
      if (editingMeal?.image) setMealImageDataUrl(editingMeal.image);
      else setMealImageDataUrl("");
    }
  }, [isAddModalOpen, editingMeal]);

  const handleMealImageChange = async (e) => {
    const file = e.target.files?.[0];
    setMealImageError("");
    if (!file) return;
    try {
      const url = await readImageAsDataURL(file);
      setMealImageDataUrl(url);
    } catch (err) {
      setMealImageError(
        err.message === "FILE_TOO_LARGE"
          ? "Image must be 6 MB or smaller."
          : "Could not read image.",
      );
    }
    e.target.value = "";
  };

  const calculateInsulin = (carbs) => Math.round((carbs / 10) * 10) / 10;

  const handleDelete = async (id) => {
    if (window.confirm(t("DietarySystems.ConfirmDelete") || "Are you sure?")) {
      try {
        await deleteItem(id);
        setMeals((prev) => prev.filter((meal) => meal.id !== id));
      } catch (deleteError) {
        console.error(deleteError);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const image =
      mealImageDataUrl ||
      editingMeal?.image ||
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
    const mealData = {
      name: formData.get("name"),
      cals: Number(formData.get("cals")),
      carbs: Number(formData.get("carbs")),
      ingredients: formData.get("ingredients"),
      image,
    };

    try {
      if (editingMeal) {
        await updateItem(editingMeal.id, mealData);
      } else {
        await createItem(mealData);
      }
      await fetchAll();

      // المزامنة التلقائية مع صفحة التحاليل (Diabetes Monitoring)
      await syncToMonitoring({
        level: 100, // نضع قيمة افتراضية طبيعية طالما لم يتم القياس بعد
        unit: "mg/dL",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        mealType: "Extra",
        foods: [mealData.name],
        insulin: [t("DiabetesMonitoring.None")],
      });

      setIsAddModalOpen(false);
      setEditingMeal(null);
      setMealImageDataUrl("");
    } catch (saveError) {
      console.error(saveError);
    }
  };

  return (
    <div className="p-6 space-y-10 animate-fade-in min-h-screen bg-[#F0F2F5] dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          {/* [BRAND ACTION]: Primary Green clinical header */}
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            {t("DietarySystems.PageTitle")}
          </h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">
            {meals.length}{" "}
            {t("DietarySystems.LabelTotalMeals") || "Meals Saved"}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingMeal(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#8EC641] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-[#8EC641]/20 hover:bg-[#8EC641]/90"
        >
          <Plus size={20} /> {t("DietarySystems.BtnAddMeal")}
        </button>
      </div>

      {/* Meal Grid */}
      {loading && <p className="text-sm text-blue-600">Loading meals...</p>}
      {error && <p className="text-sm text-red-600">Failed to load meals</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="relative group bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-xl shadow-[#8EC641]/5 border border-white dark:border-gray-800 hover:border-[#8EC641]/30 transition-all duration-300"
          >
            <img
              src={meal.image}
              alt={meal.name}
              className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* HOVER OVERLAY */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
              <button
                onClick={() => setViewingMeal(meal)}
                className="p-4 bg-white text-[#2DA1D7] rounded-2xl hover:scale-110 transition-transform shadow-lg"
              >
                <Eye size={20} />
              </button>
              <button
                onClick={() => {
                  setEditingMeal(meal);
                  setIsAddModalOpen(true);
                }}
                className="p-4 bg-white text-[#8EC641] rounded-2xl hover:scale-110 transition-transform shadow-lg"
              >
                <Edit3 size={20} />
              </button>
              <button
                onClick={() => handleDelete(meal.id)}
                className="p-4 bg-white text-rose-500 rounded-2xl hover:scale-110 transition-transform shadow-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="p-6">
              <h3 className="font-black text-lg text-gray-800 dark:text-white truncate">
                {meal.name}
              </h3>
              <p className="text-xs font-bold text-gray-400 mt-1">
                {meal.cals} {t("DietarySystems.Calories")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 1. ADD/EDIT MODAL */}
      {isAddModalOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md dark:text-white">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] p-8 animate-slide-up overflow-hidden shadow-2xl">
              <h2 className="text-2xl font-black mb-6">
                {editingMeal
                  ? t("DietarySystems.ModalTitleEdit")
                  : t("DietarySystems.ModalTitleAdd")}
              </h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <label
                  htmlFor="diet-meal-image-input"
                  className="w-full h-36 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors overflow-hidden relative"
                >
                  {mealImageDataUrl ? (
                    <img
                      src={mealImageDataUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Camera
                        size={24}
                        className="text-gray-400 mb-2 relative z-10"
                      />
                      <span className="text-[10px] font-black text-gray-400 uppercase relative z-10">
                        {t("DietarySystems.LabelUploadImg")}
                      </span>
                    </>
                  )}
                  <input
                    id="diet-meal-image-input"
                    ref={mealFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMealImageChange}
                  />
                </label>
                {mealImageError ? (
                  <p className="text-xs text-red-500 font-bold">
                    {mealImageError}
                  </p>
                ) : null}

                <input
                  name="name"
                  defaultValue={editingMeal?.name}
                  required
                  placeholder={t("DietarySystems.PlaceholderName")}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="cals"
                    defaultValue={editingMeal?.cals}
                    required
                    type="number"
                    placeholder={t("DietarySystems.Calories")}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none dark:text-white"
                  />
                  <input
                    name="carbs"
                    defaultValue={editingMeal?.carbs}
                    required
                    type="number"
                    placeholder={t("DietarySystems.PlaceholderCarbs")}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none dark:text-white"
                  />
                </div>

                <textarea
                  name="ingredients"
                  defaultValue={editingMeal?.ingredients}
                  placeholder={t("DietarySystems.PlaceholderIngredients")}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none h-24 dark:text-white resize-none"
                />

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {t("DietarySystems.BtnCancel")}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-[#8EC641] py-4 text-white font-black rounded-2xl shadow-xl shadow-[#8EC641]/20 uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                  >
                    {t("DietarySystems.BtnSave")}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* 2. VIEW POP-UP */}
      {viewingMeal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-slide-up relative">
              <div className="relative h-64">
                <img
                  src={viewingMeal.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setViewingMeal(null)}
                  className="absolute top-6 right-6 p-3 bg-black/20 backdrop-blur-md text-white rounded-full hover:bg-rose-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                      {viewingMeal.name}
                    </h2>
                    <span className="text-[#8EC641] font-black uppercase text-[10px] tracking-widest">
                      {t("DietarySystems.LabelMealDetail") || "Meal Details"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#8EC641]">
                      {viewingMeal.cals}
                    </p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {t("DietarySystems.LabelTotalCalories")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Info size={14} /> {t("DietarySystems.LabelContents")}
                    </h4>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                      {viewingMeal.ingredients}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-[#8EC641] uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Calculator size={14} />{" "}
                      {t("DietarySystems.LabelRequiredUnits")}
                    </h4>
                    <div className="bg-gradient-to-br from-[#8EC641] to-[#2DA1D7] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-[#8EC641]/20">
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black">
                          {calculateInsulin(viewingMeal.carbs)}
                        </span>
                        <span className="text-sm font-black uppercase tracking-widest">
                          {t("DietarySystems.LabelUnits")}
                        </span>
                      </div>
                      <p className="text-[9px] font-black uppercase mt-4 tracking-widest opacity-90">
                        {t("DietarySystems.LabelBasedOn")} {viewingMeal.carbs}g{" "}
                        {t("DietarySystems.PlaceholderCarbs")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default DietarySystems;
