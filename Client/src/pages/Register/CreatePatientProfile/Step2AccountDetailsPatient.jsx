import React from 'react';
import { useOutletContext } from 'react-router-dom';

/**
 * [STEP 2]: Account Details
 * Collects: Email, Password, and Password Confirmation.
 * Style: brand green (#8EC641) accents and soft rounded design.
 * Features: Password mismatch validation indicators.
 */
const Step2AccountDetailsPatient = () => {
  // Shared context from Outlet
  const { t, formData, handleInputChange } = useOutletContext();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Step Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
          {t('CreateProfilePatient.Step2Title')}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 transition-colors">
          {t('CreateProfilePatient.Step2Subtitle')}
        </p>
      </div>
      
      {/* Email Address Field */}
      <div className="group">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">
          {t('CreateProfilePatient.LabelEmail')}
        </label>
        <div className="relative">
          <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500">
            <i className="fas fa-envelope text-xl"></i>
          </div>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleInputChange} 
            className="w-full pl-14 pr-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium placeholder-gray-400 dark:placeholder-gray-600" 
            required 
            placeholder="patient@example.com" 
          />
        </div>
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">
            {t('CreateProfilePatient.LabelPassword')}
          </label>
          <div className="relative">
            <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500">
              <i className="fas fa-lock text-xl"></i>
            </div>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              className="w-full pl-14 pr-12 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium placeholder-gray-400 dark:placeholder-gray-600" 
              required 
              placeholder="••••••••" 
              minLength="8" 
            />
            <div className="absolute right-5 top-5 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-[#8EC641] transition-colors">
              <i className="fas fa-eye"></i>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 flex items-center">
            <i className="fas fa-info-circle mr-2"></i>
            {t('CreateProfilePatient.PasswordHint')}
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">
            {t('CreateProfilePatient.LabelConfirmPassword')}
          </label>
          <div className="relative">
            <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500">
              <i className="fas fa-lock text-xl"></i>
            </div>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleInputChange} 
              className={`w-full pl-14 pr-12 py-4 border-2 rounded-2xl focus:ring-2 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium placeholder-gray-400 dark:placeholder-gray-600 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500 focus:ring-red-100' : 'border-gray-100 dark:border-gray-700 focus:ring-[#8EC641]/20 focus:border-[#8EC641]'}`} 
              required 
              placeholder="••••••••" 
            />
            <div className="absolute right-5 top-5 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-[#8EC641] transition-colors">
              <i className="fas fa-eye"></i>
            </div>
          </div>
          {/* Mismatch Error Hint */}
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium flex items-center animate-pulse">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {t('CreateProfilePatient.ErrorMismatch')}
            </div>
          )}
          {/* Match Success Hint */}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <div className="mt-2 text-sm text-[#8EC641] font-bold flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              {t('CreateProfilePatient.SuccessMatch')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2AccountDetailsPatient;