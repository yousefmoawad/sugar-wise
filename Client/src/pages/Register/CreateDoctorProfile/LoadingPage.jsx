import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LoadingPage = ({ shouldNavigate = true, seconds = 10, navigateTo = '/profile-doctor' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(seconds);

  useEffect(() => {
    if (!shouldNavigate) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(navigateTo);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate, shouldNavigate, seconds, navigateTo]);

  return (
    /* [BRAND ACTION] bg-[#F0F2F5] is the soft clinical background for doctor loading flow */
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-300 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-[#2DA1D7]/10 p-10 text-center transition-colors duration-300 border border-white dark:border-gray-800">
        <div className="relative mb-10">
          <div className="w-32 h-32 mx-auto relative">
            <div className="absolute inset-0 bg-[#2DA1D7]/20 rounded-[2.5rem] animate-pulse"></div>
            <div className={`absolute inset-4 bg-[#2DA1D7] rounded-3xl flex items-center justify-center shadow-xl shadow-[#2DA1D7]/30`}>
              <i className="fas fa-microscope text-white text-4xl animate-bounce"></i>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 transition-colors uppercase tracking-tight">{t('CreateProfileDoctor.VerificationTitle')}</h2>
        <p className="text-gray-400 dark:text-gray-500 mb-8 transition-colors text-sm font-medium leading-relaxed">{t('CreateProfileDoctor.VerificationDesc')}</p>
        <div className="mb-10">
          <div className="h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden transition-colors border border-gray-100 dark:border-gray-700">
            <div className="h-full bg-[#2DA1D7] rounded-full transition-all duration-1000 shadow-lg shadow-[#2DA1D7]/20" style={{ width: `${((seconds - countdown) / seconds) * 100}%` }}></div>
          </div>
          <div className="mt-3 text-[10px] font-black text-[#2DA1D7] uppercase tracking-widest animate-pulse">
            {t('CreateProfileDoctor.Processing') || 'Processing Clinical Data...'}
          </div>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="px-10 py-4 bg-white dark:bg-gray-800 text-[#2DA1D7] border border-[#2DA1D7]/20 rounded-2xl hover:bg-[#2DA1D7] hover:text-white transition shadow-xl shadow-[#2DA1D7]/5 active:scale-95 flex items-center justify-center mx-auto font-black uppercase tracking-widest text-[10px]"
        >
          <i className="fas fa-home mr-3"></i>{t('CreateProfileDoctor.BtnHome')}
        </button>
      </div>
    </div>
  );
};

export default LoadingPage;
