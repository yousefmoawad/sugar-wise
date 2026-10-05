import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Added for translation
import {
  User,
  MapPin,
  Phone,
  Mail,
  Save,
  X,
  Activity,
  Pill,
  Syringe,
  FileText,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  Camera,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../Components/Layouts/Navbar";
import usePatients from "../../hooks/usePatients";
import { readImageAsDataURL } from "../../utils/readImageAsDataURL";
import {
  savePatientDataToStorage,
  updatePatientIdInStorage,
} from "../../utils/patientDataManager";

const MAX_PROFILE_IMAGE_BYTES = 6 * 1024 * 1024;

const calcAge = (birthday) => {
  if (!birthday) return "";
  const bd = new Date(birthday);
  if (Number.isNaN(bd.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age -= 1;
  return age;
};

const EditPatientProfile = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const navigate = useNavigate();
  const { user, rehydrateFromStorage } = useAuth();
  const { fetchById, updateItem } = usePatients();
  const [loading, setLoading] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [imageError, setImageError] = useState("");
  const [apiError, setApiError] = useState("");
  const [patientMongoId, setPatientMongoId] = useState(null);
  const fileInputRef = useRef(null);

  // --- DATA LISTS ---
  const insulinList = [
    "Lantus (Basal)",
    "Novorapid (Bolus)",
    "Humalog (Rapid)",
    "Levemir (Long-acting)",
    "Tresiba (Ultra-long-acting)",
    "Actrapid (Short-acting)",
    "Apidra (Rapid)",
  ];

  const medicationTypes = [
    t("EditPatientProfile.TypePill"),
    t("EditPatientProfile.TypeInjection"),
    t("EditPatientProfile.TypeIV"),
  ];

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    photo:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60",
    age: "",
    gender: "Male",
    height: "",
    weight: "",
    bloodType: "",
    address: "",
    phone: "",
    email: "",
    condition: "",
    yearsOfIllness: "",
    diagnosisDate: "",
    insulin1: "",
    insulin1Dosage: "",
    insulin2: "",
    insulin2Dosage: "",
    governorate: "",
    city: "",
    otherMedications: [],
  });

  const [searchInsulin1, setSearchInsulin1] = useState(formData.insulin1);
  const [searchInsulin2, setSearchInsulin2] = useState(formData.insulin2);
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);

  const dropdownRef1 = useRef(null);
  const dropdownRef2 = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef1.current && !dropdownRef1.current.contains(event.target))
        setShowDropdown1(false);
      if (dropdownRef2.current && !dropdownRef2.current.contains(event.target))
        setShowDropdown2(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const pid = user?.patient;
    if (!pid) {
      setApiError("Sign in as a patient to load this profile.");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const raw = await fetchById(pid);
        const p = raw?.data !== undefined ? raw.data : raw;
        if (cancelled || !p) return;
        const mid = p._id || p.id || pid;
        setPatientMongoId(mid);
        const cond = Array.isArray(p.medicalCondition)
          ? p.medicalCondition[0] || "Diabetes"
          : p.medicalCondition || "Diabetes";
        const bd = p.birthday
          ? new Date(p.birthday).toISOString().slice(0, 10)
          : "2010-01-01";
        setFormData((prev) => ({
          ...prev,
          name: `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient",
          id: p.Patient_Id || String(mid),
          photo: p.profileImage || prev.photo,
          age: calcAge(p.birthday) || prev.age,
          gender: p.gender || prev.gender,
          height: String(p.height ?? prev.height),
          weight: String(p.weight ?? prev.weight),
          bloodType: p.bloodType || prev.bloodType,
          address: p.address || prev.address,
          phone: p.phone || prev.phone,
          email: p.email || prev.email,
          condition: cond,
          yearsOfIllness: p.diabetesYears ?? prev.yearsOfIllness,
          diagnosisDate: bd,
          insulin1: p.insulinPrimary || prev.insulin1,
          insulin1Dosage: p.insulinPrimaryDosage || prev.insulin1Dosage,
          insulin2: p.insulinSecondary || prev.insulin2,
          insulin2Dosage: p.insulinSecondaryDosage || prev.insulin2Dosage,
          governorate: p.governorate || prev.governorate,
          city: p.city || prev.city,
          otherMedications: Array.isArray(p.otherMedications)
            ? p.otherMedications.map((m, i) => ({ ...m, id: m._id || i }))
            : prev.otherMedications,
        }));
        setSearchInsulin1(p.insulinPrimary || "");
        setSearchInsulin2(p.insulinSecondary || "");
        setApiError("");
        setIsProfileLoaded(true);
      } catch (e) {
        if (!cancelled) setApiError(e.message || "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.patient, fetchById]);

  /**
   * دالة معالجة تغيير قيم حقول الإدخال
   * تقوم بتحديث حالة النموذج عند تغيير قيمة أي حقل
   * @param {Event} e - حدث تغيير قيمة الحقل
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * دالة معالجة النقر على صورة الملف الشخصي
   * تقوم بفتح نافذة اختيار الملف
   */
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  /**
   * دالة معالجة تغيير صورة الملف الشخصي
   * تقوم بقراءة وتحديث صورة الملف الشخصي
   * @param {Event} e - حدث اختيار الملف
   */
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    setImageError("");
    if (!file) return;
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setImageError("Image must be 6 MB or smaller.");
      e.target.value = "";
      return;
    }
    try {
      const dataUrl = await readImageAsDataURL(file, MAX_PROFILE_IMAGE_BYTES);
      setFormData((prev) => ({ ...prev, photo: dataUrl }));
    } catch {
      setImageError("Could not read image.");
    }
    e.target.value = "";
  };

  /**
   * دالة معالجة اختيار الأنسولين
   * تقوم بتحديث نوع الأنسولين المختار
   * @param {string} field - اسم الحقل (insulin1 أو insulin2)
   * @param {string} value - نوع الأنسولين المختار
   */
  const handleInsulinSelect = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "insulin1") {
      setSearchInsulin1(value);
      setShowDropdown1(false);
    } else {
      setSearchInsulin2(value);
      setShowDropdown2(false);
    }
  };

  /**
   * دالة إضافة دواء جديد
   * تقوم بإضافة دواء جديد لقائمة الأدوية الأخرى
   */
  const addMedication = () => {
    const newMed = {
      id: Date.now(),
      name: "",
      type: t("EditPatientProfile.TypePill"),
      frequency: "",
    };
    setFormData((prev) => ({
      ...prev,
      otherMedications: [...prev.otherMedications, newMed],
    }));
  };

  /**
   * دالة حذف دواء
   * تقوم بحذف دواء من قائمة الأدوية الأخرى
   * @param {number} id - معرف الدواء
   */
  const removeMedication = (id) => {
    setFormData((prev) => ({
      ...prev,
      otherMedications: prev.otherMedications.filter((med) => med.id !== id),
    }));
  };

  /**
   * دالة تحديث بيانات دواء
   * تقوم بتحديث بيانات دواء محدد
   * @param {number} id - معرف الدواء
   * @param {string} field - اسم الحقل المراد تحديثه
   * @param {string} value - القيمة الجديدة
   */
  const updateMedication = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      otherMedications: prev.otherMedications.map((med) =>
        med.id === id ? { ...med, [field]: value } : med,
      ),
    }));
  };

  /**
   * دالة حفظ بيانات المريض
   * تقوم بحفظ البيانات المحدثة في قاعدة البيانات
   * @param {Event} e - حدث إرسال النموذج
   */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.insulin1 || formData.insulin1.trim() === "") {
      alert(t("EditPatientProfile.AlertInsulinMandatory"));
      return;
    }
    const targetId = patientMongoId || user?.patient;
    if (!targetId) {
      setApiError("Profile not loaded yet.");
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      const parts = formData.name.trim().split(/\s+/);
      const firstName = parts[0] || "Patient";
      const lastName = parts.slice(1).join(" ") || firstName;
      const cl = (formData.condition || "").toLowerCase();
      let medicalCondition = ["Diabetes"];
      if (cl.includes("hypertension")) medicalCondition = ["Hypertension"];
      else if (cl.includes("heart")) medicalCondition = ["Heart Disease"];
      else if (cl.includes("none")) medicalCondition = ["None"];
      const birthday = formData.diagnosisDate
        ? new Date(formData.diagnosisDate)
        : new Date("2010-01-01");

      // تحديث البيانات في localStorage
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.patient = targetId;
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (err) {
        console.error("Failed to update localStorage:", err);
      }

      const updatedPatient = await updateItem(targetId, {
        firstName,
        lastName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        governorate: formData.governorate,
        city: formData.city,
        weight: Number(formData.weight) || 0,
        height: Number(formData.height) || 0,
        bloodType: formData.bloodType,
        gender: formData.gender,
        birthday,
        diabetesYears: Number(formData.yearsOfIllness) || 0,
        medicalCondition,
        profileImage: formData.photo,
        insulinPrimary: formData.insulin1,
        insulinPrimaryDosage: formData.insulin1Dosage,
        insulinSecondary: formData.insulin2,
        insulinSecondaryDosage: formData.insulin2Dosage,
        otherMedications: formData.otherMedications.map((m) => ({
          name: m.name,
          type: m.type,
          frequency: m.frequency,
        })),
      });

      // حفظ البيانات المحدثة في localStorage باستخدام دوال الإدارة الجديدة
      savePatientDataToStorage(updatedPatient);
      updatePatientIdInStorage(targetId);

      // Keep Navbar in sync: it reads user.image/profileImage from AuthContext.
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const u = JSON.parse(storedUser);
          const profileImage =
            updatedPatient?.profileImage ||
            formData.photo ||
            u.image ||
            u.profileImage;
          const name =
            `${updatedPatient?.firstName || firstName} ${updatedPatient?.lastName || lastName}`.trim() ||
            u.name;
          const next = {
            ...u,
            patient: updatedPatient?._id || u.patient || targetId,
            name,
            image: profileImage,
            profileImage: profileImage,
          };
          localStorage.setItem("user", JSON.stringify(next));
        }
      } catch {
        /* ignore */
      }
      rehydrateFromStorage?.();

      navigate("/profile-patient");
    } catch (err) {
      setApiError(err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredInsulin1 = insulinList.filter((item) =>
    item.toLowerCase().includes(searchInsulin1.toLowerCase()),
  );
  const filteredInsulin2 = insulinList.filter((item) =>
    item.toLowerCase().includes(searchInsulin2.toLowerCase()),
  );

  if (!isProfileLoaded && !apiError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSave}>
          {apiError ? (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm border border-red-100 dark:border-red-900/40">
              {apiError}
            </div>
          ) : null}
          <div className="relative mb-24">
            <div className="h-48 w-full bg-gradient-to-r from-[#8EC641] via-[#8EC641]/90 to-[#2DA1D7]/80 rounded-t-[2rem] shadow-xl"></div>
            <div className="absolute -bottom-16 left-6 right-6 flex flex-col md:flex-row items-end md:items-center justify-between">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div
                  className="relative group cursor-pointer"
                  onClick={handleImageClick}
                >
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-white dark:bg-gray-700 transition-colors">
                    <img
                      src={formData.photo}
                      alt="Profile"
                      className="w-full h-full object-cover group-hover:opacity-75 transition"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition">
                    <Camera className="text-white" size={24} />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

                <div className="mb-2 text-center md:text-left">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="text-4xl font-black text-gray-900 dark:text-white bg-transparent border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-[#8EC641] outline-none w-full md:w-auto text-center md:text-left transition-colors uppercase tracking-tight"
                  />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    {t("EditPatientProfile.LabelID")}: {formData.id}
                  </p>
                  {imageError ? (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {imageError}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-3 mb-4 md:mb-2 mt-4 md:mt-0">
                <button
                  type="button"
                  onClick={() => navigate("/profile-patient")}
                  className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <X size={18} /> {t("EditPatientProfile.BtnCancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#8EC641] hover:bg-[#8EC641]/90 dark:bg-[#3E5C1D] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition shadow-xl shadow-[#8EC641]/10 flex items-center gap-2"
                >
                  {loading ? (
                    t("EditPatientProfile.BtnSaving")
                  ) : (
                    <>
                      <Save size={18} /> {t("EditPatientProfile.BtnSave")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <User size={20} className="text-[#8EC641]" />{" "}
                  {t("EditPatientProfile.TitlePersonal")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">
                      {t("EditPatientProfile.LabelAge")}
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">
                      {t("EditPatientProfile.LabelGender")}
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    >
                      <option value="Male">
                        {t("EditPatientProfile.GenderMale")}
                      </option>
                      <option value="Female">
                        {t("EditPatientProfile.GenderFemale")}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">
                      {t("EditPatientProfile.LabelBlood")}
                    </label>
                    <select
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    >
                      <option value="A+">A+</option>
                      <option value="O+">O+</option>
                      <option value="B+">B+</option>
                    </select>
                  </div>
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={18}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full text-sm border-b border-gray-200 dark:border-gray-600 focus:border-blue-500 outline-none py-1 bg-transparent text-gray-900 dark:text-white transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone
                        size={18}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full text-sm border-b border-gray-200 dark:border-gray-600 focus:border-blue-500 outline-none py-1 bg-transparent text-gray-900 dark:text-white transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail
                        size={18}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full text-sm border-b border-gray-200 dark:border-gray-600 focus:border-blue-500 outline-none py-1 bg-transparent text-gray-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <Activity size={20} className="text-[#8EC641]" />{" "}
                  {t("EditPatientProfile.TitleVitals")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl text-center">
                    <span className="text-xs text-green-600 dark:text-green-400 font-bold uppercase">
                      {t("EditPatientProfile.LabelHeight")}
                    </span>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      className="w-full mt-1 p-1 text-center rounded border border-green-200 dark:border-green-800 outline-none font-bold text-green-800 dark:text-green-300 bg-white dark:bg-green-900/40 transition-colors"
                    />
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-center">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">
                      {t("EditPatientProfile.LabelWeight")}
                    </span>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full mt-1 p-1 text-center rounded border border-blue-200 dark:border-blue-800 outline-none font-bold text-blue-800 dark:text-blue-300 bg-white dark:bg-blue-900/40 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tight">
                  <FileText size={22} className="text-[#8EC641]" />{" "}
                  {t("EditPatientProfile.TitleHistory")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase block mb-1">
                      {t("EditPatientProfile.LabelCondition")}
                    </label>
                    <input
                      type="text"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase block mb-1">
                      {t("EditPatientProfile.LabelYears")}
                    </label>
                    <input
                      type="number"
                      name="yearsOfIllness"
                      value={formData.yearsOfIllness}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-4 uppercase tracking-tight">
                  <Syringe size={22} className="text-[#8EC641]" />{" "}
                  {t("EditPatientProfile.TitleInsulin")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative" ref={dropdownRef1}>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">
                      {t("EditPatientProfile.LabelInsulin1")}{" "}
                      <span className="text-red-500">
                        * ({t("EditPatientProfile.Required")})
                      </span>
                    </label>
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder={t("EditPatientProfile.PlaceholderSearch")}
                        value={searchInsulin1}
                        onChange={(e) => {
                          setSearchInsulin1(e.target.value);
                          setShowDropdown1(true);
                        }}
                        onFocus={() => setShowDropdown1(true)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      />
                      <ChevronDown
                        className="absolute right-3 top-3.5 text-gray-400 dark:text-gray-500 pointer-events-none"
                        size={18}
                      />
                    </div>
                    {showDropdown1 && (
                      <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto transition-colors">
                        {filteredInsulin1.map((opt, i) => (
                          <div
                            key={i}
                            onClick={() => handleInsulinSelect("insulin1", opt)}
                            className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer text-sm border-b border-gray-50 dark:border-gray-600 last:border-0 text-gray-700 dark:text-gray-200"
                          >
                            {opt}
                          </div>
                        ))}
                        {filteredInsulin1.length === 0 && (
                          <div className="px-4 py-2 text-gray-400 dark:text-gray-500 text-sm">
                            {t("EditPatientProfile.NoResults")}
                          </div>
                        )}
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder={t("EditPatientProfile.LabelDosage")}
                      name="insulin1Dosage"
                      value={formData.insulin1Dosage}
                      onChange={handleChange}
                      className="w-full mt-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    />
                  </div>
                  <div className="relative" ref={dropdownRef2}>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">
                      {t("EditPatientProfile.LabelInsulin2")} (
                      {t("EditPatientProfile.Optional")})
                    </label>
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder={t("EditPatientProfile.PlaceholderSearch")}
                        value={searchInsulin2}
                        onChange={(e) => {
                          setSearchInsulin2(e.target.value);
                          setShowDropdown2(true);
                        }}
                        onFocus={() => setShowDropdown2(true)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      />
                      <ChevronDown
                        className="absolute right-3 top-3.5 text-gray-400 dark:text-gray-500 pointer-events-none"
                        size={18}
                      />
                    </div>
                    {showDropdown2 && (
                      <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto transition-colors">
                        {filteredInsulin2.map((opt, i) => (
                          <div
                            key={i}
                            onClick={() => handleInsulinSelect("insulin2", opt)}
                            className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer text-sm border-b border-gray-50 dark:border-gray-600 last:border-0 text-gray-700 dark:text-gray-200"
                          >
                            {opt}
                          </div>
                        ))}
                        {filteredInsulin2.length === 0 && (
                          <div className="px-4 py-2 text-gray-400 dark:text-gray-500 text-sm">
                            {t("EditPatientProfile.NoResults")}
                          </div>
                        )}
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder={t("EditPatientProfile.LabelDosage")}
                      name="insulin2Dosage"
                      value={formData.insulin2Dosage}
                      onChange={handleChange}
                      className="w-full mt-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 transition-colors">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                    <Pill size={22} className="text-[#8EC641]" />{" "}
                    {t("EditPatientProfile.TitleMeds")}
                  </h3>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="flex items-center gap-1 text-[10px] bg-[#8EC641]/10 text-[#8EC641] px-4 py-2 rounded-xl hover:bg-[#8EC641] hover:text-white transition font-black uppercase tracking-widest"
                  >
                    <Plus size={16} /> {t("EditPatientProfile.BtnAddMed")}
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.otherMedications.length === 0 && (
                    <p className="text-center text-gray-400 dark:text-gray-500 py-4 italic">
                      {t("EditPatientProfile.NoMeds")}
                    </p>
                  )}
                  {formData.otherMedications.map((med) => (
                    <div
                      key={med.id}
                      className="grid grid-cols-12 gap-4 items-end bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600 animate-fade-in-up transition-colors"
                    >
                      <div className="col-span-12 md:col-span-4">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">
                          {t("EditPatientProfile.MedName")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("EditPatientProfile.PlaceholderName")}
                          value={med.name}
                          onChange={(e) =>
                            updateMedication(med.id, "name", e.target.value)
                          }
                          className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-3">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">
                          {t("EditPatientProfile.MedType")}
                        </label>
                        <div className="relative">
                          <select
                            value={med.type}
                            onChange={(e) =>
                              updateMedication(med.id, "type", e.target.value)
                            }
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer transition-colors"
                          >
                            {medicationTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="absolute right-2 top-3 text-gray-400 pointer-events-none"
                            size={14}
                          />
                        </div>
                      </div>
                      <div className="col-span-10 md:col-span-4">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">
                          {t("EditPatientProfile.MedFreq")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("EditPatientProfile.PlaceholderFreq")}
                          value={med.frequency}
                          onChange={(e) =>
                            updateMedication(
                              med.id,
                              "frequency",
                              e.target.value,
                            )
                          }
                          className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1 flex justify-end pb-1">
                        <button
                          type="button"
                          onClick={() => removeMedication(med.id)}
                          className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientProfile;
