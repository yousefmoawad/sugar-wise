import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import {
  User,
  MapPin,
  Phone,
  Edit,
  Activity,
  Calendar,
  Ruler,
  Pill,
  Syringe,
  FileText,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAuth } from "../../context/AuthContext";
import usePatients from "../../hooks/usePatients";
import { normalizeRefId } from "../../utils/normalizeRefId";

const calcAge = (birthday) => {
  if (!birthday) return "—";
  const bd = new Date(birthday);
  if (Number.isNaN(bd.getTime())) return "—";
  const today = new Date();
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age -= 1;
  return age;
};

const PatientProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: routePatientId } = useParams();
  const { user } = useAuth();
  const { fetchById, fetchMe } = usePatients();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [patientData, setPatientData] = useState({
    name: "",
    photo:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60",
    age: "—",
    gender: "",
    height: "",
    weight: "",
    bloodType: "",
    address: "",
    phone: "",
    condition: "",
    yearsOfIllness: 0,
    diagnosisDate: "",
    insulinTypes: [],
    otherMedications: [],
  });

  /**
   * دالة تحميل بيانات المريض
   * تقوم بجلب بيانات المريض من قاعدة البيانات وتحديث الحالة
   */
  const loadPatient = useCallback(async () => {
    if (!user) {
      setLoadError("Sign in to view your profile.");
      setLoading(false);
      return;
    }
    setLoadError("");
    setLoading(true);
    try {
      let p = null;
      if (routePatientId) {
        const raw = await fetchById(routePatientId);
        p = raw?.data !== undefined ? raw.data : raw;
      } else {
        try {
          p = await fetchMe();
        } catch {
          p = null;
        }
      }
      if (!p) {
        const pid = normalizeRefId(user?.patient);
        if (!pid) {
          setLoadError("No patient profile is linked to this account.");
          return;
        }
        const raw = await fetchById(pid);
        p = raw?.data !== undefined ? raw.data : raw;
      }
      if (!p) {
        setLoadError("Could not load profile.");
        return;
      }
      const cond = Array.isArray(p.medicalCondition)
        ? p.medicalCondition.join(", ")
        : p.medicalCondition || "";
      setPatientData({
        name: `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient",
        photo:
          p.profileImage ||
          "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60",
        age: calcAge(p.birthday),
        gender: p.gender || "",
        height: p.height != null ? `${p.height} cm` : "—",
        weight: p.weight != null ? `${p.weight} kg` : "—",
        bloodType: p.bloodType || "—",
        address: p.address || "—",
        phone: p.phone || "—",
        condition: cond || "—",
        yearsOfIllness: p.diabetesYears ?? 0,
        diagnosisDate: p.birthday
          ? new Date(p.birthday).toISOString().slice(0, 10)
          : "—",
        insulinTypes: [
          {
            name: p.insulinPrimary || "—",
            dosage: p.insulinPrimaryDosage || "—",
          },
          {
            name: p.insulinSecondary || "—",
            dosage: p.insulinSecondaryDosage || "—",
          },
        ],
        otherMedications: p.otherMedications || [],
      });
    } catch (e) {
      setLoadError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [user, fetchById, fetchMe, routePatientId]);

  useEffect(() => {
    // تحديث البيانات عند فتح الصفحة من MongoDB
    loadPatient();
  }, [loadPatient]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const showEmpty = useMemo(
    () => !routePatientId && !normalizeRefId(user?.patient) && !loading && user,
    [user, loading, routePatientId],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300">
        <Navbar />
        <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Loading profile...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (loadError || showEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300">
        <Navbar />
        <div className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
          {loadError ? (
            <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/40">
              {loadError}
            </div>
          ) : null}
          {showEmpty && !loadError ? (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please sign in as a patient.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => navigate("/create-profile-patient")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg"
          >
            Create Patient Profile
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {showEmpty ? (
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in as a patient.
          </p>
        ) : null}

        <div className="relative mb-24" data-aos="fade-down">
          <div className="h-48 w-full bg-gradient-to-r from-[#8EC641] via-[#8EC641]/90 to-[#2DA1D7]/80 dark:from-[#3E5C1D] dark:to-[#1B6A91] rounded-t-[2.5rem] shadow-xl transition-colors"></div>

          <div className="absolute -bottom-16 left-6 right-6 flex flex-col md:flex-row items-end md:items-center justify-between">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-white dark:bg-gray-700 transition-colors">
                <img
                  src={patientData.photo}
                  alt={patientData.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mb-2 text-center md:text-left">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white transition-colors uppercase tracking-tight">
                  {patientData.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center md:justify-start gap-2 transition-colors">
                  <span className="bg-[#8EC641]/10 text-[#8EC641] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors">
                    {t("PatientProfile.BadgePatient")}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/edit-patient-profile")}
              disabled={!user?.patient}
              className="mb-4 md:mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-transparent px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition shadow-xl shadow-[#8EC641]/10 flex items-center gap-2 disabled:opacity-50 hover:bg-[#8EC641] hover:text-white active:scale-95"
            >
              <Edit size={18} /> {t("PatientProfile.BtnEditProfile")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8" data-aos="fade-right">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-[#8EC641]/5 border border-white dark:border-gray-700 p-8 transition-colors">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors uppercase tracking-tight">
                <User size={20} className="text-[#8EC641]" />{" "}
                {t("PatientProfile.TitlePersonalDetails")}
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-2 transition-colors">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {t("PatientProfile.LabelAge")}
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {patientData.age}{" "}
                    {patientData.age !== "—"
                      ? t("PatientProfile.LabelYears")
                      : ""}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-2 transition-colors">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {t("PatientProfile.LabelGender")}
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {patientData.gender || "—"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-2 transition-colors">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {t("PatientProfile.LabelBloodType")}
                  </span>
                  <span className="font-bold text-red-500 dark:text-red-400">
                    {patientData.bloodType}
                  </span>
                </div>

                <div className="pt-2 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="text-gray-400 dark:text-gray-500 mt-1 shrink-0"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {patientData.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone
                      size={18}
                      className="text-gray-400 dark:text-gray-500"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {patientData.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-[#8EC641]/5 border border-white dark:border-gray-700 p-8 transition-colors">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                <Activity size={20} className="text-[#8EC641]" />{" "}
                {t("PatientProfile.TitleVitals")}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center transition-colors">
                  <span className="text-xs text-green-600 dark:text-green-400 font-bold uppercase block mb-1">
                    {t("PatientProfile.LabelHeight")}
                  </span>
                  <div className="flex items-center justify-center gap-1 text-green-800 dark:text-green-300 font-bold text-xl">
                    <Ruler size={18} /> {patientData.height}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center transition-colors">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase block mb-1">
                    {t("PatientProfile.LabelWeight")}
                  </span>
                  <div className="flex items-center justify-center gap-1 text-blue-800 dark:text-blue-300 font-bold text-xl">
                    <Activity size={18} /> {patientData.weight}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div
              className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl shadow-[#8EC641]/5 border border-white dark:border-gray-700 p-10 transition-colors"
              data-aos="fade-up"
            >
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                <FileText size={22} className="text-[#8EC641]" />{" "}
                {t("PatientProfile.TitleMedicalHistory")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50 transition-colors">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {t("PatientProfile.LabelPrimaryCondition")}
                  </p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {patientData.condition}
                  </p>
                </div>

                <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50 transition-colors">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {t("PatientProfile.LabelDurationOfIllness")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={20}
                      className="text-purple-500 dark:text-purple-400"
                    />
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      {patientData.yearsOfIllness}{" "}
                      {t("PatientProfile.LabelYears")}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {t("PatientProfile.LabelDiagnosed")}:{" "}
                    {patientData.diagnosisDate}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl shadow-[#2DA1D7]/5 border border-white dark:border-gray-700 p-10 transition-colors"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                <Syringe size={22} className="text-[#8EC641]" />{" "}
                {t("PatientProfile.TitleInsulinRegimen")}
              </h3>

              <div className="space-y-4">
                {patientData.insulinTypes.map((ins, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white dark:bg-gray-700 p-2 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm transition-colors">
                        <Syringe size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white transition-colors">
                          {ins.name}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-300 font-medium transition-colors">
                          {t("PatientProfile.LabelInsulinType")}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 transition-colors">
                      {ins.dosage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl shadow-[#8EC641]/5 border border-white dark:border-gray-700 p-10 transition-colors"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                <Pill size={22} className="text-[#8EC641]" />{" "}
                {t("PatientProfile.TitleOtherMedications")}
              </h3>

              {patientData.otherMedications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patientData.otherMedications.map((med, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-md dark:hover:bg-gray-700/50 transition-all duration-300"
                    >
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full text-orange-600 dark:text-orange-400 transition-colors">
                        <Pill size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white transition-colors">
                          {med.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                          {med.frequency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic transition-colors">
                  {t("PatientProfile.NoMedications")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PatientProfile;
