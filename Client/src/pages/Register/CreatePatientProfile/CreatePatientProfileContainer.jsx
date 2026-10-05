import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { apiClient, userAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { consumePendingCheckout, consumePendingAddToCart } from '../../../utils/pendingCart';

/**
 * [MAPPER]: Arabic Governorates to English
 * Used for backend compatibility where English names are expected.
 */
const AR_GOV_TO_EN = {
  'القاهرة': 'Cairo',
  'الإسكندرية': 'Alexandria',
  'بورسعيد': 'Port Said',
  'السويس': 'Suez',
  'دمياط': 'Damietta',
  'الدقهلية': 'Dakahlia',
  'الشرقية': 'Sharqia',
  'القليوبية': 'Qalyubia',
  'كفر الشيخ': 'Kafr El Sheikh',
  'الغربية': 'Gharbia',
  'المنوفية': 'Monufia',
  'البحيرة': 'Beheira',
  'الإسماعيلية': 'Ismailia',
  'الجيزة': 'Giza',
  'بني سويف': 'Beni Suef',
  'الفيوم': 'Fayoum',
  'المنيا': 'Minya',
  'أسيوط': 'Asyut',
  'سوهاج': 'Sohag',
  'قنا': 'Qena',
  'أسوان': 'Aswan',
  'الأقصر': 'Luxor',
  'البحر الأحمر': 'Red Sea',
  'الوادي الجديد': 'New Valley',
  'مطروح': 'Matrouh',
  'شمال سيناء': 'North Sinai',
  'جنوب سيناء': 'South Sinai',
};

/**
 * [HELPER]: Map governorate selection
 */
function mapGovernorate(g) {
  const t = String(g || '').trim();
  if (AR_GOV_TO_EN[t]) return AR_GOV_TO_EN[t];
  return 'Cairo';
}

/**
 * [HELPER]: Map gender selection
 */
function mapGender(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'male') return 'Male';
  if (normalized === 'female') return 'Female';
  return '';
}

/**
 * [HELPER]: Map medical conditions labels to standard backend strings
 */
function mapMedicalConditions(labels) {
  const out = [];
  for (const lab of labels || []) {
    const s = String(lab);
    const lower = s.toLowerCase();
    if (lower.includes('diabet') || s.includes('سكري')) {
      if (!out.includes('Diabetes')) out.push('Diabetes');
    }
    if (lower.includes('hypertens') || lower.includes('pressure') || s.includes('ضغط')) {
      if (!out.includes('Hypertension')) out.push('Hypertension');
    }
    if (lower.includes('heart') || s.includes('قلب')) {
      if (!out.includes('Heart Disease')) out.push('Heart Disease');
    }
  }
  if (!out.length) out.push('None');
  return out;
}

/**
 * [COMPONENT]: CreatePatientProfileContainer
 * Wraps the multi-step patient registration process.
 * Handles: Multi-step logic, Form state management, API submission, and post-login redirection.
 */
const CreatePatientProfileContainer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { rehydrateFromStorage } = useAuth();

  // Unified form state for all steps
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', gender: '', birthday: '', telephone: '',
    email: '', password: '', confirmPassword: '',
    address: '', governorate: '', city: '',
    weight: '', height: '', medicalConditions: [], diabetesYears: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Determine current step based on the URL path
  const getStepNumber = () => {
    if (location.pathname.includes('step1')) return 1;
    if (location.pathname.includes('step2')) return 2;
    if (location.pathname.includes('step3')) return 3;
    if (location.pathname.includes('step4')) return 4;
    return 1;
  };
  const currentStep = getStepNumber();

  // Basic input change handler passed to children via Outlet Context
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Toggle for multi-select medical conditions
  const handleConditionToggle = (condition) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.includes(condition)
        ? prev.medicalConditions.filter(c => c !== condition)
        : [...prev.medicalConditions, condition]
    }));
  };

  // Validation logic per step
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: return formData.firstName && formData.lastName && formData.gender && formData.birthday && formData.telephone;
      case 2: return formData.email && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
      case 3: return formData.address && formData.governorate && formData.city;
      case 4: return formData.weight && formData.height;
      default: return true;
    }
  };

  // Age calculator helper
  const calculateAge = (birthday) => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  // Final submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const medicalCondition = mapMedicalConditions(formData.medicalConditions);
      const email = String(formData.email || '').trim().toLowerCase();
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: mapGender(formData.gender),
        birthday: formData.birthday,
        phone: formData.telephone.trim(),
        email,
        password: formData.password,
        address: formData.address.trim(),
        governorate: mapGovernorate(formData.governorate),
        city: formData.city.trim(),
        weight: Number(formData.weight),
        height: Number(formData.height),
        medicalCondition,
        diabetesYears: Number(formData.diabetesYears) || 0,
        bloodType: 'O+',
        role: 'Patient',
      };

      let token = localStorage.getItem('token');
      let user = null;

      // 1. Ensure the user account exists first so protected patient-create routes work too.
      if (!token) {
        const registerResp = await userAPI.register({
          name: `${payload.firstName} ${payload.lastName}`.trim(),
          email,
          password: formData.password,
          role: 'Patient',
        });
        token = registerResp.data?.data?.token || '';
        user = registerResp.data?.data?.user || null;
        if (!token || !user) {
          throw new Error('Could not create your account. Please try again.');
        }
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        rehydrateFromStorage();
      }

      // 2. Create the patient profile with the authenticated session.
      try {
        await apiClient.post('/patients', payload);
      } catch (error) {
        const body = error?.response?.data || {};
        const msg =
          body.error ||
          body.message ||
          error.message ||
          'Could not create profile';
        throw new Error(typeof msg === 'string' ? msg : 'Could not create profile');
      }

      // 3. Refresh the stored user so patient linkage is available immediately.
      const loginResp = await userAPI.login({ email, password: formData.password });
      token = loginResp.data?.data?.token;
      user = loginResp.data?.data?.user;
      if (!token || !user) {
        throw new Error('Profile saved. Please sign in with your email and password.');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      rehydrateFromStorage();

      // 4. Handle redirects (Shop checkout or standard path)
      const pendingCheckout = consumePendingCheckout();
      if (pendingCheckout?.returnPath) {
        navigate(pendingCheckout.returnPath, {
          replace: true,
          state: pendingCheckout.state || {},
        });
        return;
      }
      const pendingCart = consumePendingAddToCart();
      if (pendingCart?.returnPath && pendingCart?.product) {
        navigate(pendingCart.returnPath, {
          replace: true,
          state: { postLoginAddToCart: pendingCart.product },
        });
        return;
      }
      
      // Standard successful registration landing
      navigate('/my-health', { replace: true });
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* [MAIN WRAPPER]: Soft brand gradient for an "easy on the eyes" experience */
    <div className="min-h-screen bg-gradient-to-br from-[#8EC641]/5 via-white to-[#2DA1D7]/5 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* [HEADER]: Hero icon and page titles */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center space-y-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-[#8EC641] to-[#6a9431] rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <i className="fas fa-user-plus text-white text-3xl"></i>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white transition-colors tracking-tight uppercase">
                {t('CreateProfilePatient.PageTitle')}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2 transition-colors font-medium">
                {t('CreateProfilePatient.PageSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* [STEP INDICATOR]: Visual progress through the registration flow */}
        <div className="mb-10 flex items-center justify-center overflow-x-auto py-2">
          {[1, 2, 3, 4].map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center min-w-[80px]">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-500 shadow-md ${currentStep >= step ? 'bg-gradient-to-r from-[#8EC641] to-[#6a9431] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'}`}>
                  {currentStep > step ? <i className="fas fa-check"></i> : step}
                </div>
                <span className={`text-sm mt-3 transition-colors duration-300 whitespace-nowrap font-bold uppercase ${currentStep >= step ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                  {t(`CreateProfilePatient.Step${step}Label`)}
                </span>
              </div>
              {index < 3 && (
                <div className="flex-1 min-w-[20px] max-w-[60px] h-1 mx-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <div className={`h-full transition-all duration-700 ${currentStep > step ? 'w-full bg-[#8EC641]' : 'w-0'}`}></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* [FORM CONTAINER]: Main white/dark surface for input fields */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 md:p-10 transition-all duration-300 border border-gray-100 dark:border-gray-700">
          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-base border border-red-200 dark:border-red-900/40 font-medium flex items-center">
              <i className="fas fa-exclamation-circle mr-3"></i>
              {submitError}
            </div>
          )}
          
          <div className="mb-10">
            {/* The individual steps are rendered here via React Router Outlet */}
            <Outlet context={{ t, formData, handleInputChange, calculateAge, handleConditionToggle }} />
          </div>

          {/* [NAVIGATION CONTROLS]: Back and Next/Submit buttons */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-700">
            <button 
              type="button" 
              onClick={() => currentStep > 1 ? navigate(`step${currentStep - 1}`) : navigate('/register')} 
              className="px-8 py-4 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300 flex items-center shadow-sm"
            >
              <i className="fas fa-arrow-left mr-3"></i>
              {currentStep === 1 ? t('CreateProfilePatient.BtnHome') : t('CreateProfilePatient.BtnPrev')}
            </button>

            {currentStep < 4 ? (
              <button 
                type="button" 
                onClick={() => navigate(`step${currentStep + 1}`)} 
                disabled={!validateCurrentStep()} 
                className={`px-10 py-4 rounded-2xl font-black uppercase tracking-wider transition-all duration-300 flex items-center shadow-lg ${validateCurrentStep() ? 'bg-[#8EC641] text-white hover:bg-[#7ab036] hover:shadow-[#8EC641]/30 hover:-translate-y-0.5' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
              >
                {t('CreateProfilePatient.BtnNext')}
                <i className="fas fa-arrow-right ml-3"></i>
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={!validateCurrentStep() || submitting} 
                className={`px-10 py-4 rounded-2xl font-black uppercase tracking-wider transition-all duration-300 flex items-center shadow-lg ${validateCurrentStep() && !submitting ? 'bg-[#8EC641] text-white hover:bg-[#7ab036] hover:shadow-[#8EC641]/30 hover:-translate-y-0.5' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
              >
                {submitting ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
                {submitting ? '...' : t('CreateProfilePatient.BtnSubmit')}
                {!submitting && <i className="fas fa-check-circle ml-3"></i>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePatientProfileContainer;
