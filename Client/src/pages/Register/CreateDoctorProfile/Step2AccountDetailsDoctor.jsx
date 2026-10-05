import React from 'react';
import { useOutletContext } from 'react-router-dom';

const Step2AccountDetailsDoctor = () => {
  const { t, formData, handleInputChange, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword } = useOutletContext();

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('CreateProfileDoctor.Step2Title')}</h2>
        <div className="w-20 h-1.5 bg-[#2DA1D7] rounded-full mt-2"></div>
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelEmail')} *</label>
        <div className="relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2DA1D7]">
            <i className="fas fa-envelope"></i>
          </div>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleInputChange} 
            className="w-full pl-14 pr-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium" 
            required 
            placeholder="dr.smith@hospital.com" 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelPassword')} *</label>
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2DA1D7]">
              <i className="fas fa-lock"></i>
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              className="w-full pl-14 pr-12 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold tracking-widest" 
              required 
              minLength="8" 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2DA1D7] transition-colors">
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelConfirmPassword')} *</label>
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2DA1D7]">
              <i className="fas fa-check-double"></i>
            </div>
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleInputChange} 
              className="w-full pl-14 pr-12 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold tracking-widest" 
              required 
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2DA1D7] transition-colors">
              <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2AccountDetailsDoctor;