import React from 'react';
import { useOutletContext } from 'react-router-dom';

const Step3ProfessionalDetailsDoctor = () => {
  const { t, formData, handleInputChange, egyptianMedicalSchools, medicalSpecialties } = useOutletContext();

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('CreateProfileDoctor.Step3Title')}</h2>
        <div className="w-20 h-1.5 bg-[#2DA1D7] rounded-full mt-2"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelUniversity')} *</label>
          <input 
            list="universities" 
            name="university" 
            value={formData.university} 
            onChange={handleInputChange} 
            className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium" 
            placeholder={t('CreateProfileDoctor.PlaceholderUniversity')} 
            required 
          />
          <datalist id="universities">{egyptianMedicalSchools.map(u => <option key={u} value={u} />)}</datalist>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelSpecialty')} *</label>
          <select 
            name="specialtyCode" 
            value={formData.specialtyCode} 
            onChange={handleInputChange} 
            className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold appearance-none" 
            required
          >
            <option value="">{t('CreateProfileDoctor.SelectSpecialty')}</option>
            {medicalSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelExperience')} *</label>
          <input 
            type="number" 
            name="yearsOfExperience" 
            value={formData.yearsOfExperience} 
            onChange={handleInputChange} 
            className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold" 
            required 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelNationalID')} *</label>
          <input 
            type="text" 
            name="nationalID" 
            value={formData.nationalID} 
            onChange={handleInputChange} 
            className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold tracking-widest" 
            placeholder="2XXXXXXXXXXXXXXXX" 
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { id: 'idFront', label: t('CreateProfileDoctor.UploadIDFront'), icon: 'fa-id-card' },
          { id: 'idBack', label: t('CreateProfileDoctor.UploadIDBack'), icon: 'fa-id-card' },
          { id: 'selfieWithId', label: t('CreateProfileDoctor.UploadSelfie'), icon: 'fa-camera-retro' },
          { id: 'graduationCertificate', label: t('CreateProfileDoctor.UploadCert'), icon: 'fa-file-medical' }
        ].map((file) => (
          <div key={file.id}>
            <label className="block text-[8px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 mb-2 ml-1">{file.label} *</label>
            <div 
              onClick={() => document.getElementById(file.id).click()} 
              className={`group border-2 border-dashed rounded-[1.5rem] p-6 text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${formData[file.id] ? 'border-[#8EC641] bg-[#8EC641]/5 shadow-xl shadow-[#8EC641]/5' : 'border-gray-100 dark:border-gray-800 hover:border-[#2DA1D7]/40 hover:bg-[#2DA1D7]/5'}`}
            >
              <input type="file" id={file.id} name={file.id} onChange={handleInputChange} className="hidden" accept="image/*,.pdf" />
              <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 transition-colors ${formData[file.id] ? 'bg-[#8EC641] text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-[#2DA1D7]'}`}>
                <i className={`fas ${file.icon} text-lg`}></i>
              </div>
              <p className={`text-[10px] truncate font-black uppercase tracking-widest ${formData[file.id] ? 'text-[#8EC641]' : 'text-gray-500'}`}>
                {formData[file.id] ? formData[file.id].name : t('CreateProfileDoctor.BtnUpload')}
              </p>
              {formData[file.id] && (
                <div className="absolute top-2 right-2">
                  <i className="fas fa-check-circle text-[#8EC641] text-sm animate-bounce"></i>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step3ProfessionalDetailsDoctor;