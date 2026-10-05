import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import ClinicBook from "./ClinicBook";
import useDoctors from "../../hooks/useDoctors";
import { useNotification } from "../../context/NotificationContext";
import { toViewDoctor } from "../../utils/profileMappers";
import {
  Star,
  ShieldCheck,
  Users,
  Award,
  ChevronLeft,
  UserPlus,
  UserCheck,
  AlertTriangle,
  CalendarDays,
  MessageSquare
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * [COMPONENT]: DRView (Doctor Profile)
 * Purpose: Intensive profile view for clinical specialists with status markers and booking actions.
 * Styling: Premium clinical aesthetic using Primary Blue (#2DA1D7) and Green (#8EC641).
 */
const DRView = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { fetchById, followDoctor, rateDoctor } = useDoctors();

  // Initialization logic to prioritize URL ID and local state mappers
  const initialDoctor = state?.doctor || null;
  const [doctor, setDoctor] = useState(initialDoctor ? toViewDoctor(initialDoctor) : null);
  const [loading, setLoading] = useState(initialDoctor ? false : true); 
  const doctorId = id || initialDoctor?._id || initialDoctor?.id || doctor?._id;

  const [isFollowing, setIsFollowing] = useState(initialDoctor?.isFollowing || false);
  const [activeTab, setActiveTab] = useState("about");
  const [userRating, setUserRating] = useState(initialDoctor?.currentUserRating || 0);
  const [displayRating, setDisplayRating] = useState(Number(initialDoctor?.averageRating ?? initialDoctor?.rating ?? 0));
  const [actionError, setActionError] = useState("");
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);

  /**
   * [LOGIC]: syncDoctorData
   * Synchronizes incoming API data with the local component state while preserving transient UI flags.
   */
  const syncDoctorData = useCallback((data) => {
    if (!data) return;
    const actualData = data?.data && typeof data.data === 'object' ? data.data : data;

    if (actualData?._id || actualData?.id || actualData?.name) {
      const vm = toViewDoctor(actualData);
      setDoctor(prev => (prev ? { ...prev, ...vm } : vm));

      if (Object.prototype.hasOwnProperty.call(actualData, 'isFollowing')) {
        setIsFollowing(Boolean(actualData.isFollowing));
      }
      
      if (Object.prototype.hasOwnProperty.call(actualData, 'currentUserRating')) {
        setUserRating(Number(actualData.currentUserRating));
      } else if (vm.currentUserRating !== undefined) {
        setUserRating(vm.currentUserRating);
      }

      if (vm.averageRating !== undefined) {
        setDisplayRating(vm.averageRating);
      }
    }
  }, []);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    window.scrollTo(0, 0);
    if (initialDoctor) syncDoctorData(initialDoctor);
  }, [initialDoctor, syncDoctorData]);

  useEffect(() => {
    if (!doctorId || doctorId === "undefined") {
        setLoading(false);
        return;
    }
    setLoading(true);
    let cancelled = false;
    fetchById(doctorId)
      .then((fresh) => {
        if (!cancelled && fresh) syncDoctorData(fresh);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [doctorId, fetchById, syncDoctorData]);

  const executeFollowAction = async (shouldFollow) => {
    try {
      setActionError("");
      const updated = await followDoctor(doctorId, { follow: shouldFollow });
      if (updated) {
        syncDoctorData(updated);
        addNotification(shouldFollow ? "Following provider" : "Unfollowed successfully", "success");
      }
    } catch (err) {
      const errMsg = err?.message || "Registry update failed";
      setActionError(errMsg);
      addNotification(errMsg, "error");
    } finally {
      setShowUnfollowConfirm(false);
    }
  };

  const handleFollowToggle = () => {
    if (!doctorId) return setActionError("Doctor ID missing");
    if (isFollowing) setShowUnfollowConfirm(true);
    else executeFollowAction(true);
  };

  const handleRate = async (star) => {
    if (!doctorId) return setActionError("Doctor ID missing");
    setUserRating(star);
    try {
      setActionError("");
      const updated = await rateDoctor(doctorId, star);
      if (updated) {
        syncDoctorData(updated);
        addNotification("Rating synchronized", "success");
      }
    } catch (err) {
      addNotification(err?.message || "Rating failed", "error");
    }
  };

  if (loading && !doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-16 h-16 border-4 border-[#2DA1D7]/20 border-t-[#2DA1D7] rounded-full animate-spin"></div>
        <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Retrieving Medical Profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 text-gray-400">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Profile Not Registered</h2>
        <button onClick={() => navigate("/top-doctors")} className="text-[#2DA1D7] font-black uppercase tracking-widest text-xs underline decoration-2 underline-offset-8">Return to Directory</button>
      </div>
    );
  }

  const avatar = doctor.profileImage || doctor.image || "https://img.freepik.com/free-photo/portrait-smiling-handsome-male-doctor-man_171337-5055.jpg";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans transition-colors duration-300">
      
      {/* UNFOLLOW MODAL */}
      {showUnfollowConfirm && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0" onClick={() => setShowUnfollowConfirm(false)}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-sm shadow-2xl p-10 text-center animate-slide-up border border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-8 shadow-inner">
               <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Disconnect Registry?</h3>
            <p className="text-sm text-gray-500 font-medium mb-10 leading-relaxed uppercase tracking-widest">Are you sure you want to cease following {doctor.name}?</p>
            <div className="space-y-4">
              <button onClick={() => executeFollowAction(false)} className="w-full py-5 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 active:scale-95 transition-all">Confirm Termination</button>
              <button onClick={() => setShowUnfollowConfirm(false)} className="w-full py-5 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-xs transition-all">Abort Action</button>
            </div>
          </div>
        </div>, document.body
      )}

      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-gray-400 hover:text-[#2DA1D7] mb-12 transition-all font-black uppercase tracking-widest text-xs"
        >
          <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-[#2DA1D7] group-hover:text-white shadow-inner transition-all">
            <ChevronLeft size={18} />
          </div>
          Return to Registry
        </button>

        <div className="space-y-12">
          
          {/* PROFILE HEADER CARD */}
          <div className="bg-white dark:bg-gray-900 rounded-[3.5rem] border-2 border-gray-50 dark:border-gray-800 p-8 sm:p-12 shadow-2xl shadow-gray-100/50 dark:shadow-none flex flex-col md:flex-row gap-12 items-center relative overflow-hidden" data-aos="fade-up">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2DA1D7]/5 rounded-bl-full pointer-events-none"></div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-[#2DA1D7] rounded-3xl blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <img src={avatar} alt={doctor.name} className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-[2.5rem] object-cover border-4 border-white dark:border-gray-800 shadow-2xl" />
            </div>

            <div className="flex-1 w-full text-center md:text-left space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                    <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">
                      {doctor.name}
                    </h1>
                    <ShieldCheck className="text-[#2DA1D7]" size={32} />
                  </div>
                  <p className="text-xl font-black text-[#2DA1D7] uppercase tracking-[0.15em] opacity-80">
                    {doctor.specialty}
                  </p>
                </div>
                
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <button
                      onClick={handleFollowToggle}
                      className={`flex items-center justify-center gap-3 px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all duration-500 ${isFollowing ? "bg-[#8EC641]/10 text-[#8EC641] border-2 border-[#8EC641]/20" : "bg-[#2DA1D7] text-white shadow-2xl shadow-[#2DA1D7]/30 hover:-translate-y-1 active:scale-90"}`}
                    >
                      {isFollowing ? <><UserCheck size={18} /> Reserving Access</> : <><UserPlus size={18} /> Follow Provider</>}
                    </button>

                    <button
                      onClick={() => navigate("/messages", { state: { targetDoctor: doctor } })}
                      className="flex items-center justify-center gap-3 px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-white border-2 border-gray-100 dark:border-gray-700 hover:border-[#2DA1D7] hover:text-[#2DA1D7] transition-all duration-300 shadow-xl shadow-gray-100/20"
                    >
                      <MessageSquare size={18} /> Message
                    </button>
                  </div>
                  {actionError && (
                    <p className="mt-4 text-[10px] font-black text-red-500 uppercase tracking-widest px-4 animate-pulse">
                      Registry Sync Error: {actionError}
                    </p>
                  )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 py-6 border-t border-b border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-yellow-100 dark:border-yellow-900/30">
                    <Star size={20} className="text-[#8EC641] fill-[#8EC641]" />
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{displayRating}</span>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{doctor.reviews} Certified Validations</p>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => handleRate(s)} className="hover:scale-125 transition-transform active:scale-90">
                      <Star size={22} className={`${userRating >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-200 dark:text-gray-700"} transition-colors`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TABS SELECTION */}
          <div className="flex gap-12 px-8 border-b-2 border-gray-50 dark:border-gray-800" data-aos="fade-in">
            <button
              onClick={() => setActiveTab("about")}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "about" ? "text-[#2DA1D7] -mb-[2px] border-b-4 border-[#2DA1D7]" : "text-gray-400 hover:text-gray-600"}`}
            >
              Clinical Profile
            </button>
            <button
              onClick={() => setActiveTab("clinics")}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "clinics" ? "text-[#2DA1D7] -mb-[2px] border-b-4 border-[#2DA1D7]" : "text-gray-400 hover:text-gray-600"}`}
            >
              Registry & Bookings
            </button>
          </div>

          <div className="transition-all duration-500">
            {activeTab === "about" ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12" data-aos="fade-up">
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[3rem] p-10 sm:p-14 border-2 border-gray-50 dark:border-gray-800 shadow-xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-2 h-32 bg-[#2DA1D7] rounded-bl-full opacity-20"></div>
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-4">
                     <div className="w-1.5 h-6 bg-[#2DA1D7] rounded-full"></div> Professional Background
                   </h3>
                   <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-12 indent-8">
                     {doctor.about}
                   </p>
                </div>
                
                <div className="space-y-6">
                   <div className="bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] p-8 text-center border-2 border-transparent hover:border-[#2DA1D7]/20 transition-all shadow-inner group">
                      <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl text-[#2DA1D7] group-hover:bg-[#2DA1D7] group-hover:text-white transition-all">
                        <Users size={32} />
                      </div>
                      <h4 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{doctor.patients}</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Patients</p>
                   </div>
                   <div className="bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] p-8 text-center border-2 border-transparent hover:border-[#8EC641]/20 transition-all shadow-inner group">
                      <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl text-[#8EC641] group-hover:bg-[#8EC641] group-hover:text-white transition-all">
                        <Award size={32} />
                      </div>
                      <h4 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{doctor.experience}</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinical Seniority</p>
                   </div>
                   <div className="bg-gradient-to-br from-[#2DA1D7] to-[#1e7ca8] rounded-[2.5rem] p-8 text-center text-white shadow-2xl shadow-[#2DA1D7]/30">
                      <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                        <CalendarDays size={32} />
                      </div>
                      <h4 className="text-xl font-black uppercase mb-2">Instant Booking</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Available in Registry</p>
                   </div>
                </div>
              </div>
            ) : (
              <ClinicBook doctor={doctor} t={t} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DRView;
