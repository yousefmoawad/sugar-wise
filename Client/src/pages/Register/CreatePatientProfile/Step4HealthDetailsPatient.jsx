import React from 'react';
import { useOutletContext } from 'react-router-dom';

/**
 * [STEP 4]: Health Details
 * Collects: Weight, Height, and Medical Conditions.
 * Style: Uses brand green (#8EC641) for condition tags and focus states.
 * Design Choice: Conditions are displayed as interactive cards for easy touch/click selection.
 */
const Step4HealthDetailsPatient = () => {
  // Extract shared state and handlers
  const { t, formData, handleInputChange, handleConditionToggle } = useOutletContext();

  // List of medical conditions with corresponding icons
  const medicalConditionsList = [
    { id: 'diabetes', label: t('CreateProfilePatient.CondDiabetes'), icon: 'fa-syringe' },
    { id: 'highBP', label: t('CreateProfilePatient.CondBP'), icon: 'fa-heartbeat' },
    { id: 'heartDisease', label: t('CreateProfilePatient.CondHeart'), icon: 'fa-heart' },
    { id: 'kidneyDisease', label: t('CreateProfilePatient.CondKidney'), icon: 'fa-kidneys' },
    { id: 'thyroid', label: t('CreateProfilePatient.CondThyroid'), icon: 'fa-butterfly' },
    { id: 'asthma', label: t('CreateProfilePatient.CondAsthma'), icon: 'fa-lungs' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Step Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
          {t('CreateProfilePatient.Step4Title')}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 transition-colors">
          {t('CreateProfilePatient.Step4Subtitle')}
        </p>
      </div>
      
      {/* Physical Metrics: Weight and Height */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">
            {t('CreateProfilePatient.LabelWeight')}
          </label>
          <div className="relative">
            <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500">
              <i className="fas fa-weight text-xl"></i>
            </div>
            <input 
              type="number" 
              name="weight" 
              value={formData.weight} 
              onChange={handleInputChange} 
              className="w-full pl-14 pr-12 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium placeholder-gray-400 dark:placeholder-gray-600" 
              required 
              placeholder="70" 
            />
            <div className="absolute right-5 top-5 text-gray-500 dark:text-gray-400 font-bold">kg</div>
          </div>
        </div>
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">
            {t('CreateProfilePatient.LabelHeight')}
          </label>
          <div className="relative">
            <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500">
              <i className="fas fa-ruler-vertical text-xl"></i>
            </div>
            <input 
              type="number" 
              name="height" 
              value={formData.height} 
              onChange={handleInputChange} 
              className="w-full pl-14 pr-12 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none transition-all duration-300 font-medium placeholder-gray-400 dark:placeholder-gray-600" 
              required 
              placeholder="170" 
            />
            <div className="absolute right-5 top-5 text-gray-500 dark:text-gray-400 font-bold">cm</div>
          </div>
        </div>
      </div>

      {/* Medical Conditions Selection (Grid of active cards) */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 transition-colors">
          {t('CreateProfilePatient.LabelConditions')}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {medicalConditionsList.map((condition) => (
            <button 
              key={condition.id} 
              type="button" 
              onClick={() => handleConditionToggle(condition.label)} 
              className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center space-y-3 ${formData.medicalConditions.includes(condition.label) ? 'border-[#8EC641] bg-[#8EC641]/10 text-gray-900 dark:text-white shadow-md' : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 hover:border-[#8EC641]/30'}`}
            >
              <i className={`fas ${condition.icon} text-3xl ${formData.medicalConditions.includes(condition.label) ? 'text-[#8EC641]' : 'text-gray-400'}`}></i>
              <span className="text-sm font-bold uppercase tracking-tight">{condition.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Field: Only shown if Diabetes is selected */}
      {formData.medicalConditions.includes(t('CreateProfilePatient.CondDiabetes')) && (
        <div className="animate-fade-in group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-[#8EC641]">
            {t('CreateProfilePatient.LabelDiabetesYears')}
          </label>
          <div className="relative">
            <div className="absolute left-5 top-5 text-gray-400 dark:text-gray-500">
              <i className="fas fa-calendar-alt text-xl"></i>
            </div>
            <input 
              type="number" 
              name="diabetesYears" 
              value={formData.diabetesYears} 
              onChange={handleInputChange} 
              className="w-full md:w-1/2 pl-14 pr-12 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8EC641]/20 focus:border-[#8EC641] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white transition-all duration-300 outline-none font-medium placeholder-gray-400 dark:placeholder-gray-600" 
              required={formData.medicalConditions.includes(t('CreateProfilePatient.CondDiabetes'))} 
              placeholder="5" 
            />
            <div className="absolute right-5 top-5 text-gray-500 dark:text-gray-400 font-bold">{t('CreateProfilePatient.YearsLabel')}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4HealthDetailsPatient;