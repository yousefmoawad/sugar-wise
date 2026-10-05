import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import Navbar from "../../Components/Layouts/Navbar";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import useDoctors from "../../hooks/useDoctors";
import useMyClinics from "../../hooks/useMyClinics";

// --- Icon Fix for Leaflet ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14);
  }, [center, map]);
  return null;
};

const formatTime12h = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
};

const renderStars = (rating) => {
  return [...Array(5)].map((_, i) => (
    <i
      key={i}
      className={`fas fa-star text-sm ${i < Math.floor(rating) ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
    ></i>
  ));
};

const safeReviewPatientLabel = (translated) => {
  const value = String(translated || "").trim();
  if (!value || value === "DoctorProfile.ReviewPatient") return "Patient";
  return value;
};

const DoctorProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchById } = useDoctors();
  const { items: clinicRows, fetchAll: fetchClinics } = useMyClinics();
  const [activeTab, setActiveTab] = useState("overview");
  const [loadErr, setLoadErr] = useState("");
  const doctorId =
    typeof user?.doctor === "object" ? user.doctor?._id || user.doctor?.id : user?.doctor;

  const handleGoToAddClinic = () => {
    navigate("/doctor/my-clinic", { state: { targetTab: "clinic" } });
  };

  const [doctorData, setDoctorData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    specialty: "",
    rating: 0,
    reviewCount: 0,
    patientsCount: "0",
    experience: 0,
    image: "",
    about: "",
    education: {
      university: "",
      degree: "",
      graduationYear: "",
    },
    clinics: [],
    reviews: [],
  });

  useEffect(() => {
    if (!doctorId) return;
    let cancelled = false;
    setLoadErr("");
    (async () => {
      try {
        const d = await fetchById(doctorId);
        if (cancelled || !d) return;
        const ratings = Array.isArray(d.patientRatings) ? d.patientRatings : [];
        const avg = ratings.length
          ? Math.round(
              (ratings.reduce((s, r) => s + Number(r.value || 0), 0) /
                ratings.length) *
                10,
            ) / 10
          : 0;
        const followers = Array.isArray(d.followers) ? d.followers.length : 0;
        setDoctorData((prev) => ({
          ...prev,
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          title: d.title || "",
          specialty: d.medicalSpecialty || "",
          rating: avg,
          reviewCount: ratings.length,
          patientsCount: String(followers || 0),
          experience: Number(d.experienceYears || d.yearsOfExperience || 0),
          image: d.profileImage || d.image || "",
          about: d.bio || d.about || "",
          education: {
            university: d.university || "",
            degree: d.title || d.medicalSpecialty || "",
            graduationYear:
              typeof d.graduation === "string" &&
              /^\d{4}$/.test(d.graduation.trim())
                ? d.graduation.trim()
                : "",
          },
          reviews:
            ratings.length > 0
              ? ratings.slice(0, 8).map((r, i) => ({
                  id: String(r.patient?._id || r.patient || r._id || i),
                  name:
                    `${r.patient?.firstName || ""} ${r.patient?.lastName || ""}`.trim() ||
                    safeReviewPatientLabel(t("DoctorProfile.ReviewPatient")) ||
                    "Patient",
                  date: r.updatedAt
                    ? new Date(r.updatedAt).toLocaleDateString()
                    : "",
                  rating: Math.min(5, Math.max(1, Number(r.value) || 5)),
                  comment: `Rated ${Number(r.value) || 5}/5`,
                }))
              : [],
        }));
      } catch (e) {
        if (!cancelled) setLoadErr(e.message || "Failed to load profile");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doctorId, fetchById, t]);

  useEffect(() => {
    if (!doctorId) return;
    fetchClinics().catch(() => {});
  }, [doctorId, fetchClinics]);

  useEffect(() => {
    if (!Array.isArray(clinicRows) || clinicRows.length === 0) {
      setDoctorData((prev) => ({ ...prev, clinics: [] }));
      return;
    }
    const mapped = clinicRows.map((c, idx) => ({
      id: c._id || idx,
      clinicName: c.name || "",
      address: c.address || "",
      city: c.city || "",
      governorate: c.governorate || "",
      gps: [c.position?.lat ?? 30.0444, c.position?.lng ?? 31.2357],
      phone: c.phone || "—",
      price: c.price || "—",
      workingDays: [{ day: "—", start: "10:00", end: "16:00" }],
    }));
    setDoctorData((prev) => ({ ...prev, clinics: mapped }));
  }, [clinicRows]);

  const handleOpenGoogleMaps = (gps) => {
    window.open(`https://www.google.com/maps?q=${gps[0]},${gps[1]}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 transition-colors duration-300 font-sans">
      <Navbar />

      {/* [BRAND ACTION]: Primary Blue clinical hero header */}
      <div className="relative h-64 bg-gradient-to-br from-[#2DA1D7] via-[#2DA1D7]/90 to-[#8EC641]/80 overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute -bottom-16 left-0 right-0 h-32 bg-[#F0F2F5] dark:bg-gray-950 rounded-[100%] scale-x-150"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        {loadErr ? (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/40">
            {loadErr}
          </div>
        ) : null}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Profile Card */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-blue-500/10 p-8 sticky top-24 border border-white/20">
              <div className="relative w-40 h-40 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-full animate-pulse blur-md opacity-50"></div>
                <img
                  src={
                    doctorData.image ||
                    ""
                  }
                  alt="Doctor"
                  className="relative w-40 h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-xl object-cover"
                />
                <div className="absolute bottom-3 right-3 bg-green-500 w-6 h-6 border-4 border-white dark:border-gray-900 rounded-full"></div>
              </div>

              <div className="text-center">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  Dr. {doctorData.firstName} {doctorData.lastName}
                </h1>
                <p className="text-[#2DA1D7] font-black tracking-[0.1em] uppercase text-[10px] mt-1.5 px-3 py-1 bg-[#2DA1D7]/5 rounded-full w-fit mx-auto">
                  {doctorData.specialty || ""}
                </p>

                <div className="mt-4 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 py-2 px-4 rounded-2xl w-fit mx-auto">
                  <span className="text-amber-500 mr-2">
                    <i className="fas fa-star"></i>
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {doctorData.rating}
                  </span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-gray-500 text-sm">
                    {doctorData.reviewCount} {t("DoctorProfile.LabelReviews")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/edit-doctor-profile")}
                  className="mt-8 w-full bg-[#2DA1D7] text-white hover:bg-[#2DA1D7]/90 font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl transition-all shadow-xl shadow-[#2DA1D7]/20 flex items-center justify-center group"
                >
                  <i className="fas fa-fingerprint mr-2 group-hover:rotate-12 transition-transform"></i>
                  {t("DoctorProfile.BtnEditProfile")}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: t("DoctorProfile.StatPatients"),
                  val: doctorData.patientsCount,
                  icon: "fa-users",
                  color: "text-blue-600",
                  bg: "bg-blue-500/10",
                },
                {
                  label: t("DoctorProfile.StatExperience"),
                  val: `${doctorData.experience}+ Yrs`,
                  icon: "fa-user-md",
                  color: "text-teal-600",
                  bg: "bg-teal-500/10",
                },
                {
                  label: t("DoctorProfile.StatRating"),
                  val: "Top 1%",
                  icon: "fa-award",
                  color: "text-amber-600",
                  bg: "bg-amber-500/10",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center shadow-sm"
                >
                  <div
                    className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl mr-4`}
                  >
                    <i className={`fas ${stat.icon}`}></i>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                      {stat.val}
                    </p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Tabs Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="bg-gray-50/50 dark:bg-gray-800/50 px-8 border-b border-gray-100 dark:border-gray-800 flex flex-wrap justify-between items-center">
                <nav className="flex space-x-8">
                  {["Overview", "Reviews", "Clinics"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className={`relative py-6 text-xs font-black uppercase tracking-tight transition-all ${
                        activeTab === tab.toLowerCase()
                          ? "text-[#2DA1D7]"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      }`}
                    >
                      {t(`DoctorProfile.Tab${tab}`)}
                      {activeTab === tab.toLowerCase() && (
                        <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#2DA1D7] rounded-t-full"></span>
                      )}
                    </button>
                  ))}
                </nav>

                {activeTab === "clinics" && (
                  <button
                    onClick={handleGoToAddClinic}
                    className="my-4 bg-[#2DA1D7] text-white text-[10px] font-black uppercase tracking-[0.1em] px-5 py-3 rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-[#2DA1D7]/20"
                  >
                    <i className="fas fa-plus mr-2"></i>{" "}
                    {t("DoctorProfile.BtnAddClinic")}
                  </button>
                )}
              </div>

              <div className="p-8">
                {activeTab === "overview" && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <section>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center uppercase tracking-tight">
                        <span className="w-2 h-8 bg-[#2DA1D7] rounded-full mr-3"></span>
                        {t("DoctorProfile.AboutHeader")} {doctorData.lastName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                        {doctorData.about}
                      </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <section>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center uppercase tracking-tight">
                          <i className="fas fa-graduation-cap text-[#2DA1D7] mr-3"></i>
                          {t("DoctorProfile.EduHeader")}
                        </h3>
                        <div className="relative pl-8 border-l-2 border-[#2DA1D7]/20 dark:border-gray-800 space-y-8">
                          <div className="relative">
                            <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-[#2DA1D7] border-4 border-white dark:border-gray-900 shadow-sm"></div>
                            <span className="text-[10px] font-black text-[#2DA1D7] bg-[#2DA1D7]/5 px-3 py-1 rounded-full uppercase tracking-widest">
                              {doctorData.education.graduationYear}
                            </span>
                            <h4 className="font-bold text-gray-900 dark:text-white mt-2">
                              {doctorData.education.degree}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {doctorData.education.university}
                            </p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                          <i className="fas fa-tags text-teal-500 mr-3"></i>
                          {t("DoctorProfile.SpecHeader")}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {[doctorData.specialty, doctorData.title, doctorData.education.degree]
                            .filter(Boolean)
                            .map((tag) => (
                            <span
                              key={tag}
                              className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl text-sm font-semibold border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Patient Stories
                      </h3>
                      <button className="text-blue-600 text-sm font-bold hover:underline">
                        {t("DoctorProfile.BtnViewAllReviews")}
                      </button>
                    </div>
                    {doctorData.reviews.length > 0 ? doctorData.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl p-6 border border-gray-100 dark:border-gray-800"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg">
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">
                                {review.name}
                              </h4>
                              <span className="text-xs text-gray-400 font-medium italic">
                                {review.date}
                              </span>
                            </div>
                          </div>
                          <div className="flex bg-white dark:bg-gray-900 px-3 py-1 rounded-full shadow-sm">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                          "{review.comment}"
                        </p>
                      </div>
                    )) : (
                      <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
                    )}
                  </div>
                )}

                {activeTab === "clinics" && (
                  <div className="space-y-10 animate-in fade-in duration-500">
                    {doctorData.clinics.map((clinic) => (
                      <div
                        key={clinic.id}
                        className="grid grid-cols-1 xl:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm group"
                      >
                        <div className="p-8 bg-white dark:bg-gray-900">
                          <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-[#2DA1D7] transition-colors leading-tight">
                              {clinic.clinicName}
                            </h3>
                            <div className="bg-[#8EC641]/10 text-[#8EC641] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter">
                              Open Now
                            </div>
                          </div>

                          <div className="space-y-4 mb-8">
                            <p className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                              <i className="fas fa-map-marker-alt w-8 text-[#2DA1D7]"></i>
                              {clinic.address}, {clinic.city}
                            </p>
                            <p className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                              <i className="fas fa-phone-alt w-8 text-[#8EC641]"></i>
                              {clinic.phone}
                            </p>
                            <p className="flex items-center text-gray-500 dark:text-gray-400 font-bold text-sm">
                              <i className="fas fa-wallet w-8 text-amber-500"></i>
                              {clinic.price}{" "}
                              {t("DoctorProfile.ClinicPriceSuffix")}
                            </p>
                          </div>

                          <div className="mb-8">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                              {t("DoctorProfile.ClinicHoursHeader")}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {clinic.workingDays.map((day, i) => (
                                <div
                                  key={i}
                                  className="text-[10px] font-black bg-[#2DA1D7]/5 text-[#2DA1D7] px-4 py-2 rounded-xl"
                                >
                                  {day.day}: {formatTime12h(day.start)} -{" "}
                                  {formatTime12h(day.end)}
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenGoogleMaps(clinic.gps)}
                            className="w-full bg-[#F0F2F5] dark:bg-gray-800 text-gray-900 dark:text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#2DA1D7] hover:text-white transition-all border border-gray-100 dark:border-gray-700 shadow-sm"
                          >
                            <i className="fas fa-directions mr-2"></i> Get
                            Directions
                          </button>
                        </div>

                        <div className="h-64 xl:h-auto min-h-[300px] relative">
                          <MapContainer
                            center={clinic.gps}
                            zoom={15}
                            scrollWheelZoom={false}
                            className="h-full w-full z-0 grayscale-[0.5] hover:grayscale-0 transition-all duration-700"
                          >
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                            <MapUpdater center={clinic.gps} />
                            <Marker position={clinic.gps} />
                          </MapContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
