import React, { useRef, useState, useEffect, useCallback } from "react";
import { readImageAsDataURL } from "../../utils/readImageAsDataURL";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import usePatients from "../../hooks/usePatients";
import useDoctors from "../../hooks/useDoctors";
import { toViewDoctor, toViewPatient } from "../../utils/profileMappers";
import { useNotification } from "../../context/NotificationContext";
import { getAuthHeaders } from "../../utils/getAuthHeaders";

const MAX_PROFILE_IMAGE_BYTES = 6 * 1024 * 1024;

/**
 * [COMPONENT]: ProfileEdit
 * Purpose: Allows users to update their personal details and profile picture.
 * Styling: High-end clinical look with brand green themes and rounded-3xl inputs.
 */
const ProfileEdit = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const { fetchMe: fetchPatient } = usePatients();
  const { fetchById: fetchDoctorById } = useDoctors();
  const { addNotification } = useNotification();
  const doctorId =
    typeof user?.doctor === "object" ? user.doctor?._id || user.doctor?.id : user?.doctor;

  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [shakingField, setShakingField] = useState(null);

  /**
   * [LOGIC]: Data Fetching
   * Fetches the latest profile data from the server instead of just using context.
   */
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let freshData;
      const normalizedRole = String(user.role || "").trim().toLowerCase();
      if (normalizedRole === "doctor" && doctorId) {
        freshData = await fetchDoctorById(doctorId);
        const mapped = toViewDoctor(freshData);
        setFormData({
          firstName: freshData.firstName || "",
          lastName: freshData.lastName || "",
          phoneNumber: freshData.phoneNumber || freshData.telephoneNumber || "",
        });
        setProfileImage(mapped.image);
      } else {
        freshData = await fetchPatient();
        const mapped = toViewPatient(freshData);
        setFormData({
          firstName: freshData.firstName || "",
          lastName: freshData.lastName || "",
          phoneNumber:
            freshData.phone || freshData.phoneNumber || freshData.telephoneNumber || "",
        });
        setProfileImage(mapped.image);
      }
    } catch (err) {
      addNotification("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  }, [user, doctorId, fetchDoctorById, fetchPatient, addNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleImagePick = async (event) => {
    const file = event.target.files?.[0];
    setImageError("");
    if (!file) return;
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setImageError("Image must be 6 MB or smaller.");
      event.target.value = "";
      return;
    }
    try {
      const dataUrl = await readImageAsDataURL(file, MAX_PROFILE_IMAGE_BYTES);
      setProfileImage(dataUrl);
    } catch (error) {
      setImageError("Could not read image.");
    }
    event.target.value = "";
  };

  /**
   * [HAPTIC]: Programmatic beep and shake for errors.
   */
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine"; 
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
  };

  const triggerShake = (fieldName) => {
    playBeep();
    setShakingField(fieldName);
    setTimeout(() => {
      setShakingField(null);
    }, 300);
  };

  /**
   * [ACTION]: Save Profile
   * Includes validation, sanitization, and regex-based security checks.
   */
  const handleSave = async () => {
    if (!user?._id && !user?.id) {
      addNotification("User session expired. Please login again.", "error");
      return;
    }

    const { firstName, lastName, phoneNumber } = formData;
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
      triggerShake("validationError");
      addNotification(t("profile_edit.all_fields_required"), "error");
      return;
    }

    // Sanitization
    const sanitize = (str) => str.replace(/<[^>]*>?/gm, "").trim();
    const sanitizedData = {
      firstName: sanitize(firstName),
      lastName: sanitize(lastName),
      phoneNumber: sanitize(phoneNumber),
    };

    // Regex Validation
    const nameRegex = /^[a-zA-Z\u0600-\u06FF\s'-]+$/;
    const phoneRegex = /^[0-9+\s()-]+$/;

    if (!nameRegex.test(sanitizedData.firstName) || !nameRegex.test(sanitizedData.lastName)) {
      addNotification(t("profile_edit.invalid_name"), "error");
      return;
    }

    if (!phoneRegex.test(sanitizedData.phoneNumber)) {
      addNotification(t("profile_edit.invalid_phone"), "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...sanitizedData,
        profileImage: profileImage.startsWith("data:") ? profileImage : undefined,
      };
      
      const result = await updateProfile(payload);
      if (result.success) {
        const stored = localStorage.getItem("user");
        const currentSession = stored ? JSON.parse(stored) : {};
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...currentSession,
            ...result.user,
            name: `${sanitizedData.firstName} ${sanitizedData.lastName}`.trim(),
            image: payload.profileImage || currentSession.image || "",
          }),
        );
        if (String(user?.role || "").trim().toLowerCase() === "doctor" && doctorId) {
          await fetch(`/api/doctors/${doctorId}`, { headers: getAuthHeaders() }).catch(() => null);
        }
        addNotification(t("profile_edit.save_success"), "success");
        await loadData();
      } else {
        addNotification(result.message, "error");
      }
    } catch (err) {
      addNotification("Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <div className="w-16 h-16 border-4 border-[#8EC641]/20 border-t-[#8EC641] rounded-full animate-spin"></div>
        <p className="mt-6 text-gray-500 font-black uppercase tracking-widest text-xs animate-pulse">
          {t("DRView.Loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
          }
          .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        `}
      </style>

      {/* SECTION HEADER */}
      <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#8EC641]/10 flex items-center justify-center text-[#8EC641] shadow-inner">
          <i className="fas fa-user-edit text-xl"></i>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            {t("profile_edit.title")}
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
            {t("settings.account_settings")}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <div className="w-44 h-44 rounded-[2.5rem] overflow-hidden border-8 border-gray-50 dark:border-gray-800 shadow-2xl transition-all duration-500 group-hover:scale-105">
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -right-4 -bottom-4 bg-[#8EC641] text-white w-14 h-14 rounded-3xl flex items-center justify-center hover:bg-[#6a9431] transition-all shadow-xl shadow-[#8EC641]/30 active:scale-90"
            >
              <i className="fas fa-camera text-xl"></i>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagePick}
            />
          </div>
          <div className="text-center">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full inline-block">
              {t("profile_edit.allowed_files")}
            </p>
            {imageError && (
              <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-3 animate-shake">{imageError}</p>
            )}
          </div>
        </div>

        {/* INPUT FORM SECTION */}
        <div className="flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* First Name */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {t("profile_edit.first_name")}
                </label>
                <span className={`text-[10px] font-black ${formData.firstName.length >= 50 ? 'text-[#8EC641]' : 'text-gray-300'}`}>
                  {formData.firstName.length}/50
                </span>
              </div>
              <div className="relative">
                <i className="fas fa-user absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input
                  type="text"
                  value={formData.firstName}
                  maxLength="50"
                  onKeyDown={(e) => e.key.length === 1 && formData.firstName.length >= 50 && triggerShake("firstName")}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full py-5 pl-14 pr-6 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-[2rem] focus:ring-8 outline-none transition-all font-bold text-gray-900 dark:text-white ${
                    shakingField === "firstName" || (shakingField === "validationError" && !formData.firstName.trim()) 
                    ? "animate-shake border-red-500 ring-red-500/10" 
                    : "border-transparent focus:border-[#8EC641]/30 focus:ring-[#8EC641]/10"
                  }`}
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {t("profile_edit.last_name")}
                </label>
                <span className={`text-[10px] font-black ${formData.lastName.length >= 50 ? 'text-[#8EC641]' : 'text-gray-300'}`}>
                  {formData.lastName.length}/50
                </span>
              </div>
              <div className="relative">
                <i className="fas fa-user absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input
                  type="text"
                  value={formData.lastName}
                  maxLength="50"
                  onKeyDown={(e) => e.key.length === 1 && formData.lastName.length >= 50 && triggerShake("lastName")}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full py-5 pl-14 pr-6 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-[2rem] focus:ring-8 outline-none transition-all font-bold text-gray-900 dark:text-white ${
                    shakingField === "lastName" || (shakingField === "validationError" && !formData.lastName.trim()) 
                    ? "animate-shake border-red-500 ring-red-500/10" 
                    : "border-transparent focus:border-[#8EC641]/30 focus:ring-[#8EC641]/10"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                {t("profile_edit.phone")}
              </label>
              <span className={`text-[10px] font-black ${formData.phoneNumber.length >= 20 ? 'text-[#8EC641]' : 'text-gray-300'}`}>
                {formData.phoneNumber.length}/20
              </span>
            </div>
            <div className="relative">
              <i className="fas fa-phone-alt absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
              <input
                type="tel"
                value={formData.phoneNumber}
                maxLength="20"
                onKeyDown={(e) => e.key.length === 1 && formData.phoneNumber.length >= 20 && triggerShake("phoneNumber")}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={`w-full py-5 pl-14 pr-6 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-[2rem] focus:ring-8 outline-none transition-all font-bold text-gray-900 dark:text-white ${
                  shakingField === "phoneNumber" || (shakingField === "validationError" && !formData.phoneNumber.trim()) 
                  ? "animate-shake border-red-500 ring-red-500/10" 
                  : "border-transparent focus:border-[#8EC641]/30 focus:ring-[#8EC641]/10"
                }`}
              />
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="pt-8">
            <button 
              onClick={handleSave}
              disabled={saving || loading}
              className={`w-full md:w-auto px-16 py-5 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                shakingField === "saveButton" || shakingField === "validationError"
                ? "animate-shake bg-red-500 shadow-red-200 dark:shadow-none" 
                : "bg-gradient-to-r from-[#8EC641] to-[#6a9431] shadow-[#8EC641]/30 hover:shadow-[#8EC641]/50 hover:-translate-y-1"
              }`}
            >
              {saving ? t("DRView.Loading") : t("profile_edit.save_changes")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
