import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingPage from './LoadingPage';
import useDoctors from '../../../hooks/useDoctors'; // استخدام الـ Hook الموحد
import { useNotification } from '../../../context/NotificationContext';

const CreateProfileDoctorContainer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { createItem: registerDoctor } = useDoctors(); // ربط الدالة بالـ API المطلوب
  const { addNotification } = useNotification();
  const [submitState, setSubmitState] = useState('idle'); // idle | submitting | success
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', gender: '', birthday: '', telephone: '',
    email: '', password: '', confirmPassword: '',
    university: '', specialtyCode: '', yearsOfExperience: '', nationalID: '',
    idFront: null, idBack: null, selfieWithId: null, graduationCertificate: null,
    addressDescription: '', governorate: '', city: '',
  });

  const egyptianMedicalSchools = ["Cairo University", "Ain Shams University", "Alexandria University", "Mansoura University", "Assiut University", "Tanta University", "Zagazig University", "Minia University", "Monufia University", "Suez Canal University", "Beni-Suef University", "Fayoum University", "Sohag University", "Port Said University", "Helwan University", "Aswan University", "Kafr El-Sheikh University", "Al-Azhar University", "Badr University in Cairo (BUC)", "October 6 University", "Misr University for Science and Technology (MUST)"];
  const medicalSpecialties = ['Endocrinology', 'Internal Medicine', 'Cardiology', 'Nephrology', 'Ophthalmology', 'Neurology', 'General Practitioner', 'Diabetes Specialist', 'Nutrition', 'Dermatology', 'Gastroenterology', 'Psychiatry', 'Pediatrics'];
  const egyptGovernorates = ['Cairo', 'Alexandria', 'Giza', 'Qalyubia', 'Beheira', 'Gharbia', 'Dakahlia', 'Monufia', 'Sharqia', 'Kafr El Sheikh', 'Damietta', 'Port Said', 'Ismailia', 'Suez', 'Fayoum', 'Beni Suef', 'Minya', 'Asyut', 'Sohag', 'Qena', 'Luxor', 'Aswan', 'Red Sea', 'New Valley', 'Matrouh', 'North Sinai', 'South Sinai'];

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const f = files && files[0] ? files[0] : null;
      if (f && f.size > 6 * 1024 * 1024) {
        setSubmitError('File size must be 6MB or less.');
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: f }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateAge = (birthday) => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getStepNumber = () => {
    if (location.pathname.includes('step1')) return 1;
    if (location.pathname.includes('step2')) return 2;
    if (location.pathname.includes('step3')) return 3;
    if (location.pathname.includes('step4')) return 4;
    return 1;
  };
  const currentStep = getStepNumber();

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: return formData.firstName && formData.lastName && formData.gender && formData.birthday && formData.telephone;
      case 2: return formData.email && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
      case 3: return formData.university && formData.specialtyCode && formData.yearsOfExperience && formData.nationalID && formData.idFront && formData.idBack && formData.selfieWithId && formData.graduationCertificate;
      case 4: return formData.addressDescription && formData.governorate && formData.city;
      default: return true;
    }
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      if (!file) return resolve('');
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const submitDoctor = async () => {
    setSubmitError('');
    try {
      setSubmitState('submitting');

      const genderRaw = String(formData.gender || '').trim().toLowerCase();
      const gender = genderRaw === 'female' ? 'Female' : 'Male';

      const payload = {
        role: 'Doctor',
        firstName: String(formData.firstName || '').trim(),
        lastName: String(formData.lastName || '').trim(),
        gender,
        birthday: formData.birthday,
        phoneNumber: String(formData.telephone || '').trim(),
        email: String(formData.email || '').trim().toLowerCase(),
        password: formData.password,
        university: String(formData.university || '').trim(),
        medicalSpecialty: String(formData.specialtyCode || '').trim(),
        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        nationalID: String(formData.nationalID || '').trim(),
        idFrontImg: await fileToDataUrl(formData.idFront),
        idBackImg: await fileToDataUrl(formData.idBack),
        selfImg: await fileToDataUrl(formData.selfieWithId),
        graduation: await fileToDataUrl(formData.graduationCertificate),
        address: String(formData.addressDescription || '').trim(),
        governorate: String(formData.governorate || '').trim(),
        city: String(formData.city || '').trim(),
      };

      const result = await registerDoctor(payload);
      
      if (!result) {
        throw new Error('Registration failed. Please check your data.');
      }

      addNotification("Doctor request submitted successfully. Wait for admin approval before logging in.", "success");
      setSubmitState('success');
    } catch (err) {
      setSubmitState('idle');
      const msg = err?.message || 'Doctor registration failed';
      setSubmitError(msg);
      addNotification(msg, "error");
    }
  };

  if (submitState === 'submitting') return <LoadingPage shouldNavigate={false} seconds={10} />;
  if (submitState === 'success') return <LoadingPage shouldNavigate={true} seconds={6} navigateTo="/" />;

  return (
    /* [BRAND ACTION] bg-[#F0F2F5] is the soft clinical background for doctor registration */
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 p-4 md:p-8 transition-colors duration-300 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-3xl flex items-center justify-center shadow-xl shadow-[#2DA1D7]/10 mx-auto mb-6 text-[#2DA1D7] text-3xl border border-white dark:border-gray-800">
            <i className="fas fa-user-md"></i>
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('CreateProfileDoctor.PageHeader')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">{t('CreateProfileDoctor.SubHeader') || 'Join our network of professional healthcare providers'}</p>
        </div>

        <div className="mb-12 flex items-center justify-center px-4">
          {[1, 2, 3, 4].map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${currentStep >= step ? 'bg-[#2DA1D7] text-white shadow-xl shadow-[#2DA1D7]/30 scale-110' : 'bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-600 border border-gray-100 dark:border-gray-800'}`}>
                  {currentStep > step ? <i className="fas fa-check text-sm"></i> : <span className="text-sm">{step}</span>}
                </div>
                <span className={`text-[10px] mt-3 uppercase tracking-widest transition-colors duration-300 font-black ${currentStep >= step ? 'text-[#2DA1D7]' : 'text-gray-400'}`}>
                  {t(`CreateProfileDoctor.Step${step}Label`)}
                </span>
              </div>
              {index < 3 && (
                <div className="flex-1 mx-2 relative -mt-6">
                  <div className={`h-1.5 rounded-full transition-all duration-700 ${currentStep > step ? 'bg-[#2DA1D7]' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

         {/* [BRAND ACTION] Main Form Container with premium clinical styling */}
         <form onSubmit={(e) => e.preventDefault()} className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-[#2DA1D7]/5 p-8 md:p-12 border border-white dark:border-gray-800 transition-all duration-300">
          <Outlet context={{ t, formData, handleInputChange, calculateAge, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, egyptianMedicalSchools, medicalSpecialties, egyptGovernorates }} />
          {submitError ? (
            <div className="mt-8 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 text-[11px] font-black uppercase tracking-widest flex items-center">
              <i className="fas fa-exclamation-circle mr-3 text-lg"></i> {submitError}
            </div>
          ) : null}
          <div className="flex justify-between mt-12 pt-8 border-t border-gray-50 dark:border-gray-800">
            <button 
              type="button" 
              onClick={() => currentStep > 1 ? navigate(`step${currentStep - 1}`) : navigate('/register')} 
              className="px-8 py-4 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition active:scale-95 flex items-center"
            >
              <i className={`fas fa-chevron-${t('lang') === 'ar' ? 'right' : 'left'} mr-2`}></i>
              {currentStep > 1 ? t('CreateProfileDoctor.BtnPrev') : t('CreateProfileDoctor.BtnBack')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentStep < 4) return navigate(`step${currentStep + 1}`);
                if (!validateCurrentStep()) return;
                submitDoctor().catch((e) => {
                  setSubmitState('idle');
                  setSubmitError(e?.message || 'Doctor registration failed');
                });
              }}
              disabled={!validateCurrentStep()}
              className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition duration-500 flex items-center ${validateCurrentStep() ? 'bg-[#2DA1D7] text-white shadow-xl shadow-[#2DA1D7]/20 hover:bg-[#2DA1D7]/90 active:scale-95' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
            >
              {currentStep < 4 ? t('CreateProfileDoctor.BtnNext') : t('CreateProfileDoctor.BtnSubmit')}
              <i className={`fas fa-chevron-${t('lang') === 'ar' ? 'left' : 'right'} ml-2`}></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfileDoctorContainer;
