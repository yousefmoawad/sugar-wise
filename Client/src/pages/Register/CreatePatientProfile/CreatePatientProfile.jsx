import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

/**
 * [COMPONENT]: CreateProfilePatient (Standalone Version)
 * Collects all patient data in a single multi-step component.
 * Dominant Color: brand green (#8EC641).
 * Features: Step indicator, form validation, and Arabic governorates support.
 */
const CreateProfilePatient = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Part 1: Personal Information
    firstName: '',
    lastName: '',
    gender: '',
    birthday: '',
    telephone: '',
    
    // Part 2: Account Information
    email: '',
    password: '',
    confirmPassword: '',
    
    // Part 3: Address Information
    address: '',
    governorate: '',
    city: '',
    
    // Part 4: Health Information
    weight: '',
    height: '',
    medicalConditions: [],
    diabetesYears: '',
  });

  // Egypt Governorates List for Dropdown
  const egyptGovernorates = [
    'القاهرة', 'الإسكندرية', 'بورسعيد', 'السويس', 'دمياط', 'الدقهلية', 'الشرقية', 'القليوبية',
    'كفر الشيخ', 'الغربية', 'المنوفية', 'البحيرة', 'الإسماعيلية', 'الجيزة', 'بني سويف', 'الفيوم',
    'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'أسوان', 'الأقصر', 'البحر الأحمر', 'الوادي الجديد',
    'مطروح', 'شمال سيناء', 'جنوب سيناء'
  ];

  // Medical Conditions with Icons for UX
  const medicalConditionsList = [
    { id: 'diabetes', label: t('CreateProfilePatient.CondDiabetes'), icon: 'fa-syringe' },
    { id: 'highBP', label: t('CreateProfilePatient.CondBP'), icon: 'fa-heartbeat' },
    { id: 'heartDisease', label: t('CreateProfilePatient.CondHeart'), icon: 'fa-heart' },
    { id: 'kidneyDisease', label: t('CreateProfilePatient.CondKidney'), icon: 'fa-kidneys' },
    { id: 'thyroid', label: t('CreateProfilePatient.CondThyroid'), icon: 'fa-butterfly' },
    { id: 'asthma', label: t('CreateProfilePatient.CondAsthma'), icon: 'fa-lungs' }
  ];

  /**
   * Handle generic input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Toggle condition inclusion in the health profile
   */
  const handleConditionToggle = (condition) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.includes(condition)
        ? prev.medicalConditions.filter(c => c !== condition)
        : [...prev.medicalConditions, condition]
    }));
  };

  /**
   * Navigate to the next step after validation
   */
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  /**
   * Go back to the previous step
   */
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  /**
   * Validate current fields before advancing
   */
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.gender && formData.birthday && formData.telephone;
      case 2:
        return formData.email && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
      case 3:
        return formData.address && formData.governorate && formData.city;
      case 4:
        return formData.weight && formData.height;
      default:
        return true;
    }
  };

  /**
   * Submit logic to the backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save patient data');
      }

      navigate('/profile-patient');
    } catch (error) {
      console.error('Error saving patient data:', error);
      alert('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
    }
  };

  /**
   * UI Helper: Calculate Age from Birthday
   */
  const calculateAge = (birthday) => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * [RENDER]: Step Progress Indicator
   */
  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: t('CreateProfilePatient.Step1Label') },
      { number: 2, label: t('CreateProfilePatient.Step2Label') },
      { number: 3, label: t('CreateProfilePatient.Step3Label') },
      { number: 4, label: t('CreateProfilePatient.Step4Label') }
    ];

    return (
      <div className="mb-10">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-500 shadow-lg
                  ${currentStep >= step.number 
                    ? 'bg-gradient-to-r from-[#8EC641] to-[#6a9431] text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'}
                `}>
                  {currentStep > step.number ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`text-sm mt-3 transition-colors duration-300 font-bold uppercase ${currentStep >= step.number ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 max-w-[50px] h-1 mx-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <div className={`h-full transition-all duration-700 ${currentStep > step.number ? 'w-full bg-[#8EC641]' : 'w-0'}`}></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  /**
   * [RENDER]: Step 1 (Personal) Fields
   */
  const renderStep1 = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">{t('CreateProfilePatient.LabelFirstName')}</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium" required placeholder={t('CreateProfilePatient.PlaceholderFirstName')} />
        </div>
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">{t('CreateProfilePatient.LabelLastName')}</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium" required placeholder={t('CreateProfilePatient.PlaceholderLastName')} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">{t('CreateProfilePatient.LabelGender')}</label>
          <div className="grid grid-cols-2 gap-4">
            {['Male', 'Female'].map((option) => (
              <button key={option} type="button" onClick={() => setFormData(prev => ({ ...prev, gender: option }))} className={`py-4 px-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center space-x-3 font-bold ${formData.gender === option ? 'border-[#8EC641] bg-[#8EC641]/10 text-gray-900 dark:text-white shadow-sm' : 'border-gray-100 dark:border-gray-700 text-gray-500 bg-gray-50 dark:bg-gray-900/50'}`}><i className={`fas fa-${option.toLowerCase() === 'male' ? 'male' : 'female'} text-xl`}></i><span>{t(`CreateProfilePatient.Gender${option}`)}</span></button>
            ))}
          </div>
        </div>
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">{t('CreateProfilePatient.LabelBirthday')}</label>
          <div className="relative">
            <input type="date" name="birthday" value={formData.birthday} onChange={handleInputChange} className="w-full px-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white transition-all duration-300 outline-none font-medium dark:[color-scheme:dark]" required />
            <div className="absolute right-5 top-5 text-gray-400 dark:text-gray-500 pointer-events-none"><i className="fas fa-calendar-alt"></i></div>
          </div>
          {formData.birthday && <div className="mt-2 text-sm text-[#8EC641] font-bold"><i className="fas fa-birthday-cake mr-2"></i>{t('CreateProfilePatient.AgePrefix')} {calculateAge(formData.birthday)} {t('CreateProfilePatient.AgeSuffix')}</div>}
        </div>
      </div>
    </div>
  );

  /**
   * [RENDER]: Step 2 (Account) Fields
   */
  const renderStep2 = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="group">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">{t('CreateProfilePatient.LabelEmail')}</label>
        <div className="relative">
          <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500"><i className="fas fa-envelope text-xl"></i></div>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-14 pr-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium" required placeholder="patient@example.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">{t('CreateProfilePatient.LabelPassword')}</label>
          <div className="relative">
            <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500"><i className="fas fa-lock text-xl"></i></div>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-14 pr-12 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium" required placeholder="••••••••" minLength="8" />
          </div>
        </div>
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">{t('CreateProfilePatient.LabelConfirmPassword')}</label>
          <div className="relative">
            <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500"><i className="fas fa-lock text-xl"></i></div>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className={`w-full pl-14 pr-12 py-4 border-2 rounded-2xl transition-all duration-300 font-medium bg-gray-50 dark:bg-gray-900/50 dark:text-white outline-none ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500 focus:ring-red-100' : 'border-gray-100 dark:border-gray-700 focus:ring-[#8EC641]/20 focus:border-[#8EC641]'}`} required placeholder="••••••••" />
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && <div className="mt-2 text-sm text-red-600 font-medium"><i className="fas fa-exclamation-circle mr-2"></i>{t('CreateProfilePatient.ErrorMismatch')}</div>}
        </div>
      </div>
    </div>
  );

  /**
   * [RENDER]: Step 3 (Address) Fields
   */
  const renderStep3 = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="group">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">{t('CreateProfilePatient.LabelAddress')}</label>
        <div className="relative">
          <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500"><i className="fas fa-map-marker-alt text-xl"></i></div>
          <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full pl-14 pr-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium resize-none" rows="3" placeholder={t('CreateProfilePatient.PlaceholderAddress')} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">{t('CreateProfilePatient.LabelGovernorate')}</label>
          <div className="relative">
            <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500"><i className="fas fa-map text-xl"></i></div>
            <select name="governorate" value={formData.governorate} onChange={handleInputChange} className="w-full pl-14 pr-10 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white appearance-none cursor-pointer outline-none font-medium" required>
              <option value="">{t('CreateProfilePatient.PlaceholderGovernorate')}</option>
              {egyptGovernorates.map((gov) => (<option key={gov} value={gov}>{gov}</option>))}
            </select>
            <div className="absolute right-5 top-5 text-gray-400 pointer-events-none"><i className="fas fa-chevron-down"></i></div>
          </div>
        </div>
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">{t('CreateProfilePatient.LabelCity')}</label>
          <div className="relative">
            <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500"><i className="fas fa-city text-xl"></i></div>
            <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full pl-14 pr-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium" required placeholder={t('CreateProfilePatient.PlaceholderCity')} />
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * [RENDER]: Step 4 (Health) Fields
   */
  const renderStep4 = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">{t('CreateProfilePatient.LabelWeight')}</label>
          <div className="relative">
            <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500"><i className="fas fa-weight text-xl"></i></div>
            <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full pl-14 pr-12 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none font-medium" required placeholder="70" />
            <div className="absolute right-5 top-5 text-gray-500 font-bold">kg</div>
          </div>
        </div>
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">{t('CreateProfilePatient.LabelHeight')}</label>
          <div className="relative">
            <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500"><i className="fas fa-ruler-vertical text-xl"></i></div>
            <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-full pl-14 pr-12 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none font-medium" required placeholder="170" />
            <div className="absolute right-5 top-5 text-gray-500 font-bold">cm</div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">{t('CreateProfilePatient.LabelConditions')}</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {medicalConditionsList.map((condition) => (
            <button key={condition.id} type="button" onClick={() => handleConditionToggle(condition.label)} className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center space-y-3 ${formData.medicalConditions.includes(condition.label) ? 'border-[#8EC641] bg-[#8EC641]/10 text-gray-900 dark:text-white shadow-md' : 'border-gray-100 dark:border-gray-700 text-gray-500 bg-gray-50 dark:bg-gray-900/50'}`}><i className={`fas ${condition.icon} text-3xl ${formData.medicalConditions.includes(condition.label) ? 'text-[#8EC641]' : 'text-gray-400'}`}></i><span className="text-xs font-bold uppercase">{condition.label}</span></button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8EC641]/5 via-white to-[#2DA1D7]/5 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex flex-col items-center space-y-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-[#8EC641] to-[#6a9431] rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <i className="fas fa-user-plus text-white text-3xl"></i>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white transition-colors tracking-tight uppercase">{t('CreateProfilePatient.PageTitle')}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2 transition-colors font-medium">{t('CreateProfilePatient.PageSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {renderStepIndicator()}

        {/* Main Form Box */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 md:p-10 transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="mb-10">
            {renderCurrentStep()}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-700">
            {currentStep > 1 ? (
              <button type="button" onClick={prevStep} className="px-8 py-4 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300 flex items-center shadow-sm">
                <i className="fas fa-arrow-left mr-3"></i>{t('CreateProfilePatient.BtnPrev')}
              </button>
            ) : (
              <button type="button" onClick={() => navigate('/register')} className="px-8 py-4 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300 flex items-center shadow-sm">
                <i className="fas fa-home mr-3"></i>{t('CreateProfilePatient.BtnHome')}
              </button>
            )}

            {currentStep < 4 ? (
              <button type="button" onClick={nextStep} disabled={!validateCurrentStep()} className={`px-10 py-4 rounded-2xl font-black uppercase tracking-wider transition-all duration-300 flex items-center shadow-lg ${validateCurrentStep() ? 'bg-[#8EC641] text-white hover:bg-[#7ab036] hover:shadow-[#8EC641]/30 hover:-translate-y-0.5' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}>
                {t('CreateProfilePatient.BtnNext')}<i className="fas fa-arrow-right ml-3"></i>
              </button>
            ) : (
              <button type="submit" disabled={!validateCurrentStep()} className={`px-10 py-4 rounded-2xl font-black uppercase tracking-wider transition-all duration-300 flex items-center shadow-lg ${validateCurrentStep() ? 'bg-[#8EC641] text-white hover:bg-[#7ab036] hover:shadow-[#8EC641]/30 hover:-translate-y-0.5' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}>
                {t('CreateProfilePatient.BtnSubmit')}<i className="fas fa-check-circle ml-3"></i>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfilePatient;
