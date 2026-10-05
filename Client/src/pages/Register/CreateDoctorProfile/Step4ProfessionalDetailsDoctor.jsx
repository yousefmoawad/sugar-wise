import React from 'react';
import { useOutletContext } from 'react-router-dom';

const Step4ProfessionalDetailsDoctor = () => {
  const { t, formData, handleInputChange, egyptGovernorates } = useOutletContext();

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('CreateProfileDoctor.Step4Title')}</h2>
        <div className="w-20 h-1.5 bg-[#2DA1D7] rounded-full mt-2"></div>
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelAddress')} *</label>
        <textarea 
          name="addressDescription" 
          value={formData.addressDescription} 
          onChange={handleInputChange} 
          className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium" 
          rows="4" 
          placeholder={t('CreateProfileDoctor.PlaceholderAddress')} 
          required 
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelGov')} *</label>
          <select 
            name="governorate" 
            value={formData.governorate} 
            onChange={handleInputChange} 
            className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold appearance-none cursor-pointer" 
            required
          >
            <option value="">{t('CreateProfileDoctor.SelectGov') || 'Select Governorate'}</option>
            {egyptGovernorates.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelCity')} *</label>
          <input 
            type="text" 
            name="city" 
            value={formData.city} 
            onChange={handleInputChange} 
            className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium" 
            placeholder={t('CreateProfileDoctor.LabelCity')} 
            required 
          />
        </div>
      </div>
    </div>
  );
};

export default Step4ProfessionalDetailsDoctor;