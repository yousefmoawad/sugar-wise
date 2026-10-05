import React from 'react';
import { useOutletContext } from 'react-router-dom';

/**
 * [STEP 3]: Addressing Details
 * Collects: Full Address, Governorate, and City.
 * Style: brand green (#8EC641) focus states and responsive grid.
 */
const Step3AddressingDetailsPatient = () => {
  // Shared context from Outlet parent
  const { t, formData, handleInputChange } = useOutletContext();

  // List of Egypt governorates for the dropdown menu
  const egyptGovernorates = [
    'القاهرة', 'الإسكندرية', 'بورسعيد', 'السويس', 'دمياط', 'الدقهلية', 'الشرقية', 'القليوبية',
    'كفر الشيخ', 'الغربية', 'المنوفية', 'البحيرة', 'الإسماعيلية', 'الجيزة', 'بني سويف', 'الفيوم',
    'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'أسوان', 'الأقصر', 'البحر الأحمر', 'الوادي الجديد',
    'مطروح', 'شمال سيناء', 'جنوب سيناء'
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Step Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
          {t('CreateProfilePatient.Step3Title')}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 transition-colors">
          {t('CreateProfilePatient.Step3Subtitle')}
        </p>
      </div>
      
      {/* Detailed Address TextArea */}
      <div className="group">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">
          {t('CreateProfilePatient.LabelAddress')}
        </label>
        <div className="relative">
          <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500">
            <i className="fas fa-map-marker-alt text-xl"></i>
          </div>
          <textarea 
            name="address" 
            value={formData.address} 
            onChange={handleInputChange} 
            className="w-full pl-14 pr-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium placeholder-gray-400 dark:placeholder-gray-600 resize-none" 
            rows="4" 
            placeholder={t('CreateProfilePatient.PlaceholderAddress')} 
            required 
          />
        </div>
      </div>

      {/* Regional Location: Governorate and City */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">
            {t('CreateProfilePatient.LabelGovernorate')}
          </label>
          <div className="relative">
            <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500">
              <i className="fas fa-map text-xl"></i>
            </div>
            <select 
              name="governorate" 
              value={formData.governorate} 
              onChange={handleInputChange} 
              className="w-full pl-14 pr-10 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white transition-all duration-300 outline-none cursor-pointer appearance-none font-medium" 
              required
            >
              <option value="">{t('CreateProfilePatient.PlaceholderGovernorate')}</option>
              {egyptGovernorates.map((gov) => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
            <div className="absolute right-5 top-5 text-gray-400 dark:text-gray-500 pointer-events-none">
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">
            {t('CreateProfilePatient.LabelCity')}
          </label>
          <div className="relative">
            <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500">
              <i className="fas fa-city text-xl"></i>
            </div>
            <input 
              type="text" 
              name="city" 
              value={formData.city} 
              onChange={handleInputChange} 
              className="w-full pl-14 pr-5 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white transition-all duration-300 outline-none font-medium placeholder-gray-400 dark:placeholder-gray-600" 
              required 
              placeholder={t('CreateProfilePatient.PlaceholderCity')} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3AddressingDetailsPatient;