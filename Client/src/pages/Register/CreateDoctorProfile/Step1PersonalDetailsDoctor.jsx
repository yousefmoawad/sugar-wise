import React from 'react';
import { useOutletContext } from 'react-router-dom';

const Step1PersonalDetailsDoctor = () => {
  const { t, formData, handleInputChange } = useOutletContext();

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('CreateProfileDoctor.Step1Title')}</h2>
        <div className="w-20 h-1.5 bg-[#2DA1D7] rounded-full mt-2"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelFirstName')} *</label>
          <input 
            type="text" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleInputChange} 
            className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium" 
            required 
            placeholder={t('CreateProfileDoctor.PlaceholderFirstName')} 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelLastName')} *</label>
          <input 
            type="text" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleInputChange} 
            className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium" 
            required 
            placeholder={t('CreateProfileDoctor.PlaceholderLastName')} 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelGender')} *</label>
          <div className="grid grid-cols-2 gap-4">
            {['Male', 'Female'].map((option) => (
              <button 
                key={option} 
                type="button" 
                onClick={() => handleInputChange({ target: { name: 'gender', value: option.toLowerCase() } })} 
                className={`py-4 px-6 rounded-2xl border-2 transition-all duration-300 font-bold text-[11px] uppercase tracking-widest flex items-center justify-center ${formData.gender === option.toLowerCase() ? 'border-[#2DA1D7] bg-[#2DA1D7]/5 text-[#2DA1D7] shadow-xl shadow-[#2DA1D7]/5' : 'border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:border-gray-200 dark:hover:border-gray-700'}`}
              >
                <i className={`fas fa-${option.toLowerCase() === 'male' ? 'male' : 'female'} mr-2 text-base`}></i>{t(`CreateProfileDoctor.Gender${option}`)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelBirthday')} *</label>
          <input 
            type="date" 
            name="birthday" 
            value={formData.birthday} 
            onChange={handleInputChange} 
            className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white dark:[color-scheme:dark] outline-none transition-all font-medium" 
            required 
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelPhone')} *</label>
        <div className="relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center">
            <span className="text-[#2DA1D7] font-black text-xs">+20</span>
            <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-3"></div>
          </div>
          <input 
            type="tel" 
            name="telephone" 
            value={formData.telephone} 
            onChange={handleInputChange} 
            className="w-full pl-20 pr-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold tracking-widest" 
            required 
            placeholder="1XXXXXXXXX" 
          />
        </div>
      </div>
    </div>
  );
};

export default Step1PersonalDetailsDoctor;