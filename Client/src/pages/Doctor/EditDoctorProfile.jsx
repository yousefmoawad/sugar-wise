import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import Navbar from '../../Components/Layouts/Navbar';
import Footer from '../../Components/Layouts/Footer';
import { User, Save, X, Camera, FileText, Briefcase, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useDoctors from '../../hooks/useDoctors';
import { readImageAsDataURL } from '../../utils/readImageAsDataURL';

const MAX_PROFILE_IMAGE_BYTES = 6 * 1024 * 1024;

const MEDICAL_SPECIALTIES = [
  "Cardiology", "Endocrinology", "Neurology", "Pediatrics", "General Surgery",
  "Dermatology", "Orthopedics", "ENT", "Ophthalmology", "Psychiatry",
];

const pickSpecialty = (input, fallback) => {
  const t = String(input || "").trim();
  if (MEDICAL_SPECIALTIES.includes(t)) return t;
  const lower = t.toLowerCase();
  const hit = MEDICAL_SPECIALTIES.find((s) => s.toLowerCase() === lower);
  if (hit) return hit;
  const fb = String(fallback || "").trim();
  if (MEDICAL_SPECIALTIES.includes(fb)) return fb;
  return "Endocrinology";
};

const EditDoctorProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchById, updateItem } = useDoctors();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [imageError, setImageError] = useState('');
  const [doctorId, setDoctorId] = useState(null);
  const [fallbackSpecialty, setFallbackSpecialty] = useState('Endocrinology');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    specialty: 'Endocrinology',
    about: '',
    image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400',
  });

  useEffect(() => {
    const did = user?.doctor;
    if (!did) {
      setLoadError('No doctor profile linked to this account.');
      return;
    }
    let cancelled = false;
    setLoadError('');
    setLoading(true);
    (async () => {
      try {
        const raw = await fetchById(did);
        const d = raw?.data !== undefined ? raw.data : raw;
        if (cancelled || !d || !d._id) {
          if (!cancelled && (!d || !d._id)) setLoadError('Could not load profile.');
          return;
        }
        setDoctorId(d._id);
        const spec = d.medicalSpecialty || 'Endocrinology';
        setFallbackSpecialty(spec);
        setFormData({
          firstName: d.firstName || '',
          lastName: d.lastName || '',
          title: d.title || '',
          specialty: pickSpecialty(d.medicalSpecialty, spec),
          about: d.bio || '',
          image: d.profileImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400',
        });
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.doctor, fetchById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    setImageError('');
    if (!file) return;
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setImageError('Image must be 6 MB or smaller.');
      e.target.value = '';
      return;
    }
    try {
      const dataUrl = await readImageAsDataURL(file, MAX_PROFILE_IMAGE_BYTES);
      setFormData((prev) => ({ ...prev, image: dataUrl }));
    } catch {
      setImageError('Could not read image.');
    }
    e.target.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!doctorId) {
      setLoadError('Profile not loaded.');
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      const medicalSpecialty = pickSpecialty(formData.specialty, fallbackSpecialty);
      await updateItem(doctorId, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        title: formData.title.trim(),
        bio: formData.about,
        medicalSpecialty,
        profileImage: formData.image,
      });
      navigate('/profile-doctor');
    } catch (err) {
      setLoadError(err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-500/10 flex flex-col font-sans">
      {/* [DESIGN NOTE]: Brand-consistent clinical background */}
      <Navbar />

      <div className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSave}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t("EditDoctorProfile.PageTitle")}</h1>
              <p className="text-base text-gray-500 font-medium">{t("EditDoctorProfile.PageSubtitle")}</p>
            </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile-doctor')}
              className=" dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-2xl font-black uppercase tracking-tight text-xs hover:bg-gray-50 transition flex items-center gap-2"
            >
              <X size={16} /> {t("EditDoctorProfile.BtnCancel")}
            </button>
            {/* [BRAND ACTION]: Primary Blue for Save action */}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#2DA1D7] text-white px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#2DA1D7]/90 transition shadow-xl shadow-[#2DA1D7]/20 flex items-center gap-2"
            >
              {loading ? t("EditDoctorProfile.BtnSaving") : <><Save size={16} /> {t("EditDoctorProfile.BtnSave")}</>}
            </button>
          </div>
        </div>

          {(loadError || imageError) && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
              {loadError || imageError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                <h3 className="font-bold text-gray-800 mb-6">{t("EditDoctorProfile.HeaderPicture")}</h3>

                <div className="relative group cursor-pointer" onClick={handleImageClick}>
                  <div className="w-40 h-40 rounded-full border-4 border-blue-50 overflow-hidden shadow-sm">
                    <img
                      src={formData.image}
                      alt="Doctor Profile"
                      className="w-full h-full object-cover group-hover:opacity-75 transition duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300">
                    <Camera className="text-white" size={32} />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

                <p className="text-sm text-gray-400 mt-4">
                  {t("EditDoctorProfile.UploadPrompt")}<br />{t("EditDoctorProfile.UploadFormats")}
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-600" /> {t("EditDoctorProfile.HeaderBasicInfo")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{t("EditDoctorProfile.LabelFirstName")}</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{t("EditDoctorProfile.LabelLastName")}</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{t("EditDoctorProfile.LabelJobTitle")}</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{t("EditDoctorProfile.LabelSpecialty")}</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <select
                        name="specialty"
                        value={pickSpecialty(formData.specialty, fallbackSpecialty)}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        {MEDICAL_SPECIALTIES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" /> {t("EditDoctorProfile.HeaderAbout")}
                </h3>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{t("EditDoctorProfile.LabelBio")}</label>
                  <textarea
                    name="about"
                    rows={6}
                    value={formData.about}
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                    placeholder={t("EditDoctorProfile.PlaceholderBio")}
                  />
                  <p className="text-xs text-gray-400 mt-2 text-right">
                    {formData.about.length} {t("EditDoctorProfile.CharCount")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditDoctorProfile;
