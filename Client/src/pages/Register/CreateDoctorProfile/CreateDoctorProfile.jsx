import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import useDoctors from '../../../hooks/useDoctors';
import { useNotification } from '../../../context/NotificationContext';

// ==========================================
// 1. Loading Page Component (Verification UI)
// ==========================================
const LoadingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/profile-doctor');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    /* [BRAND ACTION] bg-[#F0F2F5] is the soft clinical background for doctor loading flow */
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-300 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-[#2DA1D7]/10 p-10 text-center transition-colors duration-300 border border-white dark:border-gray-800">
        <div className="relative mb-10">
          <div className="w-32 h-32 mx-auto relative">
            <div className="absolute inset-0 bg-[#2DA1D7]/20 rounded-[2.5rem] animate-pulse"></div>
            <div className="absolute inset-4 bg-[#2DA1D7] rounded-3xl flex items-center justify-center shadow-xl shadow-[#2DA1D7]/30">
              <i className="fas fa-microscope text-white text-4xl animate-bounce"></i>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 transition-colors uppercase tracking-tight">{t('CreateProfileDoctor.VerificationTitle')}</h2>
        <p className="text-gray-400 dark:text-gray-500 mb-8 transition-colors text-sm font-medium leading-relaxed">
          {t('CreateProfileDoctor.VerificationDesc')}
        </p>

        <div className="mb-10">
          <div className="h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden transition-colors border border-gray-100 dark:border-gray-700">
            <div
              className="h-full bg-[#2DA1D7] rounded-full transition-all duration-1000 shadow-lg shadow-[#2DA1D7]/20"
              style={{ width: `${((10 - countdown) / 10) * 100}%` }}
            ></div>
          </div>
          <div className="mt-3 text-[10px] font-black text-[#2DA1D7] uppercase tracking-widest animate-pulse">
            {t('CreateProfileDoctor.Processing') || 'Processing Clinical Data...'}
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-10 py-4 bg-white dark:bg-gray-800 text-[#2DA1D7] border border-[#2DA1D7]/20 rounded-2xl hover:bg-[#2DA1D7] hover:text-white transition shadow-xl shadow-[#2DA1D7]/5 active:scale-95 flex items-center justify-center mx-auto font-black uppercase tracking-widest text-[10px]"
        >
          <i className="fas fa-home mr-3"></i>
          {t('CreateProfileDoctor.BtnHome')}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. Main CreateProfileDoctor Component
// ==========================================
const CreateProfileDoctor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { createItem: registerDoctor } = useDoctors();
  const { addNotification } = useNotification();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', gender: '', birthday: '', telephone: '',
    email: '', password: '', confirmPassword: '',
    university: '', specialtyCode: '', yearsOfExperience: '', nationalID: '',
    idFront: null, idBack: null, selfieWithId: null, graduationCertificate: null,
    addressDescription: '', governorate: '', city: '',
  });

  const egyptianMedicalSchools = [
    "Cairo University", "Ain Shams University", "Alexandria University", "Mansoura University", 
    "Assiut University", "Tanta University", "Zagazig University", "Minia University", 
    "Monufia University", "Suez Canal University", "Beni-Suef University", "Fayoum University", 
    "Sohag University", "Port Said University", "Helwan University", "Aswan University", 
    "Kafr El-Sheikh University", "Al-Azhar University", "Badr University in Cairo (BUC)",
    "October 6 University", "Misr University for Science and Technology (MUST)"
  ];

  const medicalSpecialties = [
    'Endocrinology', 'Internal Medicine', 'Cardiology', 'Nephrology',
    'Ophthalmology', 'Neurology', 'General Practitioner', 'Diabetes Specialist',
    'Nutrition', 'Dermatology', 'Gastroenterology', 'Psychiatry', 'Pediatrics'
  ];

  const egyptGovernorates = [
    'Cairo', 'Alexandria', 'Giza', 'Qalyubia', 'Beheira', 'Gharbia', 'Dakahlia', 'Monufia', 
    'Sharqia', 'Kafr El Sheikh', 'Damietta', 'Port Said', 'Ismailia', 'Suez', 'Fayoum', 'Beni Suef', 
    'Minya', 'Asyut', 'Sohag', 'Qena', 'Luxor', 'Aswan', 'Red Sea', 'New Valley', 
    'Matrouh', 'North Sinai', 'South Sinai'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: return formData.firstName && formData.lastName && formData.gender && formData.birthday && formData.telephone;
      case 2: return formData.email && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
      case 3: return formData.university && formData.specialtyCode && formData.yearsOfExperience && formData.nationalID && formData.idFront && formData.idBack && formData.selfieWithId && formData.graduationCertificate;
      case 4: return formData.addressDescription && formData.governorate && formData.city;
      default: return true;
    }
  };

  const nextStep = () => { if (validateCurrentStep()) setCurrentStep(prev => prev + 1); };
  const prevStep = () => { setCurrentStep(prev => prev - 1); };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      if (!file) return resolve('');
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        role: 'Doctor',
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender === 'female' ? 'Female' : 'Male',
        birthday: formData.birthday,
        phoneNumber: formData.telephone.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        university: formData.university.trim(),
        medicalSpecialty: formData.specialtyCode.trim(),
        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        nationalID: formData.nationalID.trim(),
        idFrontImg: await fileToDataUrl(formData.idFront),
        idBackImg: await fileToDataUrl(formData.idBack),
        selfImg: await fileToDataUrl(formData.selfieWithId),
        graduation: await fileToDataUrl(formData.graduationCertificate),
        address: formData.addressDescription.trim(),
        governorate: formData.governorate,
        city: formData.city.trim(),
      };

      const result = await registerDoctor(payload);
      if (!result) throw new Error('Failed to create doctor profile');

      await login(payload.email, payload.password);
      addNotification("Welcome to Sugar Wise, Doctor!", "success");
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err.message);
      addNotification(err.message, "error");
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: t('CreateProfileDoctor.Step1Label') }, 
      { number: 2, label: t('CreateProfileDoctor.Step2Label') }, 
      { number: 3, label: t('CreateProfileDoctor.Step3Label') }, 
      { number: 4, label: t('CreateProfileDoctor.Step4Label') }
    ];
    return (
      <div className="mb-12 flex items-center justify-center px-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${currentStep >= step.number ? 'bg-[#2DA1D7] text-white shadow-xl shadow-[#2DA1D7]/30 scale-110' : 'bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-600 border border-gray-100 dark:border-gray-800'}`}>
                {currentStep > step.number ? <i className="fas fa-check text-sm"></i> : <span className="text-sm">{step.number}</span>}
              </div>
              <span className={`text-[10px] mt-3 uppercase tracking-widest transition-colors duration-300 font-black ${currentStep >= step.number ? 'text-[#2DA1D7]' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 relative -mt-6">
                <div className={`h-1.5 rounded-full transition-all duration-700 ${currentStep > step.number ? 'bg-[#2DA1D7]' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-10 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('CreateProfileDoctor.Step1Title')}</h2>
        <div className="w-20 h-1.5 bg-[#2DA1D7] rounded-full mt-2"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelFirstName')} *</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium" required placeholder={t('CreateProfileDoctor.PlaceholderFirstName')} />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelLastName')} *</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium" required placeholder={t('CreateProfileDoctor.PlaceholderLastName')} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelGender')} *</label>
          <div className="grid grid-cols-2 gap-4">
            {['Male', 'Female'].map((option) => (
              <button key={option} type="button" onClick={() => setFormData(prev => ({ ...prev, gender: option.toLowerCase() }))} className={`py-4 px-6 rounded-2xl border-2 transition-all duration-300 font-bold text-[11px] uppercase tracking-widest flex items-center justify-center ${formData.gender === option.toLowerCase() ? 'border-[#2DA1D7] bg-[#2DA1D7]/5 text-[#2DA1D7] shadow-xl shadow-[#2DA1D7]/5' : 'border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:border-gray-200 dark:hover:border-gray-700'}`}>
                <i className={`fas fa-${option.toLowerCase() === 'male' ? 'male' : 'female'} mr-2 text-base`}></i>{t(`CreateProfileDoctor.Gender${option}`)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelBirthday')} *</label>
          <input type="date" name="birthday" value={formData.birthday} onChange={handleInputChange} className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white dark:[color-scheme:dark] outline-none transition-all font-medium" required />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelPhone')} *</label>
        <div className="relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center">
            <span className="text-[#2DA1D7] font-black text-xs">+20</span>
            <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-3"></div>
          </div>
          <input type="tel" name="telephone" value={formData.telephone} onChange={handleInputChange} className="w-full pl-20 pr-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold tracking-widest" required placeholder="1XXXXXXXXX" />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-10 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('CreateProfileDoctor.Step2Title')}</h2>
        <div className="w-20 h-1.5 bg-[#2DA1D7] rounded-full mt-2"></div>
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelEmail')} *</label>
        <div className="relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2DA1D7]">
            <i className="fas fa-envelope"></i>
          </div>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-14 pr-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium" required placeholder="dr.smith@hospital.com" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelPassword')} *</label>
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2DA1D7]">
              <i className="fas fa-lock"></i>
            </div>
            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-14 pr-12 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold tracking-widest" required minLength="8" />
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
            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full pl-14 pr-12 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold tracking-widest" required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2DA1D7] transition-colors">
              <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-10 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('CreateProfileDoctor.Step3Title')}</h2>
        <div className="w-20 h-1.5 bg-[#2DA1D7] rounded-full mt-2"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelUniversity')} *</label>
          <input list="universities" name="university" value={formData.university} onChange={handleInputChange} className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium" placeholder={t('CreateProfileDoctor.PlaceholderUniversity')} required />
          <datalist id="universities">{egyptianMedicalSchools.map(u => <option key={u} value={u} />)}</datalist>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelSpecialty')} *</label>
          <select name="specialtyCode" value={formData.specialtyCode} onChange={handleInputChange} className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold appearance-none cursor-pointer" required>
            <option value="">{t('CreateProfileDoctor.SelectSpecialty')}</option>
            {medicalSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelExperience')} *</label>
          <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange} className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold" required />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelNationalID')} *</label>
          <input type="text" name="nationalID" value={formData.nationalID} onChange={handleInputChange} className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold tracking-widest" placeholder="2XXXXXXXXXXXXXXXX" required />
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
            <div onClick={() => document.getElementById(file.id).click()} className={`group border-2 border-dashed rounded-[1.5rem] p-6 text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${formData[file.id] ? 'border-[#8EC641] bg-[#8EC641]/5 shadow-xl shadow-[#8EC641]/5' : 'border-gray-100 dark:border-gray-800 hover:border-[#2DA1D7]/40 hover:bg-[#2DA1D7]/5'}`}>
              <input type="file" id={file.id} name={file.id} onChange={handleInputChange} className="hidden" accept="image/*,.pdf" />
              <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 transition-colors ${formData[file.id] ? 'bg-[#8EC641] text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-[#2DA1D7]'}`}>
                <i className={`fas ${file.icon} text-lg`}></i>
              </div>
              <p className={`text-[10px] truncate font-black uppercase tracking-widest ${formData[file.id] ? 'text-[#8EC641]' : 'text-gray-500'}`}>
                {formData[file.id] ? formData[file.id].name : t('CreateProfileDoctor.BtnUpload')}
              </p>
              {formData[file.id] && <div className="absolute top-2 right-2"><i className="fas fa-check-circle text-[#8EC641] text-sm animate-bounce"></i></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-10 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('CreateProfileDoctor.Step4Title')}</h2>
        <div className="w-20 h-1.5 bg-[#2DA1D7] rounded-full mt-2"></div>
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelAddress')} *</label>
        <textarea name="addressDescription" value={formData.addressDescription} onChange={handleInputChange} className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium" rows="4" placeholder={t('CreateProfileDoctor.PlaceholderAddress')} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelGov')} *</label>
          <select name="governorate" value={formData.governorate} onChange={handleInputChange} className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-bold appearance-none cursor-pointer" required>
            <option value="">{t('CreateProfileDoctor.SelectGov') || 'Select Governorate'}</option>
            {egyptGovernorates.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">{t('CreateProfileDoctor.LabelCity')} *</label>
          <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-all font-medium" placeholder={t('CreateProfileDoctor.LabelCity')} required />
        </div>
      </div>
    </div>
  );

  if (isSubmitting) return <LoadingPage />;

  return (
    /* [BRAND ACTION] bg-[#F0F2F5] is the soft clinical background for doctor registration */
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 p-4 md:p-8 transition-colors duration-300 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-3xl flex items-center justify-center shadow-xl shadow-[#2DA1D7]/10 mx-auto mb-6 text-[#2DA1D7] text-3xl border border-white dark:border-gray-800">
            <i className="fas fa-user-md"></i>
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('CreateProfileDoctor.PageHeader')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">{t('CreateProfileDoctor.SubHeader') || 'Join our network of professional healthcare providers'}</p>
        </div>
        {renderStepIndicator()}
        {/* [BRAND ACTION] Main Form Container with premium clinical styling */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-[#2DA1D7]/5 p-8 md:p-12 border border-white dark:border-gray-800 transition-all duration-300">
          <div className="mb-10">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>
          {submitError ? (
            <div className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 text-[11px] font-black uppercase tracking-widest flex items-center animate-shake">
              <i className="fas fa-exclamation-circle mr-3 text-lg"></i> {submitError}
            </div>
          ) : null}
          <div className="flex justify-between items-center pt-8 border-t border-gray-50 dark:border-gray-800">
            <button 
              type="button" 
              onClick={currentStep > 1 ? prevStep : () => navigate('/register')} 
              className="px-8 py-4 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition active:scale-95 flex items-center"
            >
              <i className={`fas fa-chevron-${t('lang') === 'ar' ? 'right' : 'left'} mr-2`}></i>
              {currentStep > 1 ? t('CreateProfileDoctor.BtnPrev') : t('CreateProfileDoctor.BtnBack')}
            </button>
            <button 
              type="button" 
              onClick={currentStep < 4 ? nextStep : handleSubmit} 
              disabled={!validateCurrentStep()} 
              className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition duration-500 flex items-center ${validateCurrentStep() ? 'bg-[#2DA1D7] text-white shadow-xl shadow-[#2DA1D7]/20 hover:bg-[#2DA1D7]/90 active:scale-95' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
            >
              {currentStep < 4 ? t('CreateProfileDoctor.BtnNext') : t('CreateProfileDoctor.BtnSubmit')}
              <i className={`fas fa-chevron-${t('lang') === 'ar' ? 'left' : 'right'} ml-2`}></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfileDoctor;