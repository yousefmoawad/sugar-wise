import React from 'react';
import { useOutletContext } from 'react-router-dom';

/**
 * [STEP 1]: Personal Details
 * Collects: Name, Gender, Birthday, and Phone Number.
 * Style: Uses brand green (#8EC641) for focus states and active buttons.
 * Design Note: Easy on the eyes with rounded-2xl containers and soft backgrounds.
 */
const Step1PersonalDetailsPatient = () => {
  // Access shared form state and handlers from the Parent Container via Outlet Context
  const { t, formData, handleInputChange, calculateAge } = useOutletContext();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Step Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
          {t('CreateProfilePatient.Step1Title')}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 transition-colors">
          {t('CreateProfilePatient.Step1Subtitle')}
        </p>
      </div>
      
      {/* Name Fields: First and Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">
            {t('CreateProfilePatient.LabelFirstName')}
          </label>
          <input 
            type="text" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleInputChange} 
            className="w-full px-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium placeholder-gray-400 dark:placeholder-gray-600" 
            required 
            placeholder={t('CreateProfilePatient.PlaceholderFirstName')} 
          />
        </div>
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">
            {t('CreateProfilePatient.LabelLastName')}
          </label>
          <input 
            type="text" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleInputChange} 
            className="w-full px-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium placeholder-gray-400 dark:placeholder-gray-600" 
            required 
            placeholder={t('CreateProfilePatient.PlaceholderLastName')} 
          />
        </div>
      </div>

      {/* Demographic Fields: Gender and Birthday */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
            {t('CreateProfilePatient.LabelGender')}
          </label>
          <div className="grid grid-cols-2 gap-4">
            {['Male', 'Female'].map((option) => (
              <button 
                key={option} 
                type="button" 
                onClick={() => handleInputChange({ target: { name: 'gender', value: option } })} 
                className={`py-4 px-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center space-x-3 font-bold ${formData.gender === option ? 'border-[#8EC641] bg-[#8EC641]/10 text-gray-900 dark:text-white shadow-sm' : 'border-gray-100 dark:border-gray-700 hover:border-[#8EC641]/30 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50'}`}
              >
                <i className={`fas fa-${option.toLowerCase() === 'male' ? 'male' : 'female'} text-xl`}></i>
                <span>{t(`CreateProfilePatient.Gender${option}`)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">
            {t('CreateProfilePatient.LabelBirthday')}
          </label>
          <div className="relative">
            <input 
              type="date" 
              name="birthday" 
              value={formData.birthday} 
              onChange={handleInputChange} 
              className="w-full px-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium appearance-none cursor-pointer dark:[color-scheme:dark]" 
              required 
            />
            <div className="absolute right-5 top-5 text-gray-400 dark:text-gray-500 pointer-events-none">
              <i className="fas fa-calendar-alt"></i>
            </div>
          </div>
          {formData.birthday && (
            <div className="mt-2 text-sm text-[#8EC641] font-bold flex items-center">
              <i className="fas fa-birthday-cake mr-2"></i>
              {t('CreateProfilePatient.AgePrefix')} {calculateAge(formData.birthday)} {t('CreateProfilePatient.AgeSuffix')}
            </div>
          )}
        </div>
      </div>

      {/* Contact Field: Phone Number */}
      <div className="group">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">
          {t('CreateProfilePatient.LabelPhone')}
        </label>
        <div className="relative">
          <div className="absolute left-5 top-5 flex items-center border-r-2 border-gray-200 dark:border-gray-700 pr-3">
            <i className="fas fa-phone text-gray-400 dark:text-gray-500 mr-2"></i>
            <span className="text-gray-700 dark:text-gray-300 font-bold">+20</span>
          </div>
          <input 
            type="tel" 
            name="telephone" 
            value={formData.telephone} 
            onChange={handleInputChange} 
            className="w-full pl-24 pr-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium placeholder-gray-400 dark:placeholder-gray-600" 
            required 
            placeholder="1XXXXXXXXX" 
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-3 font-medium flex items-center">
          <i className="fas fa-info-circle mr-2"></i>
          {t('CreateProfilePatient.PhoneHint')}
        </p>
      </div>
    </div>
  );
};

export default Step1PersonalDetailsPatient;
