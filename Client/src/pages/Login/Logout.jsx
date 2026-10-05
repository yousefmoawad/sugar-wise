import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react'; 
import { useTranslation } from "react-i18next"; // Added for translation

const Logout = ({ onCancel, onConfirm }) => {
  const { t } = useTranslation(); // Initialize translation hook
  const navigate = useNavigate();

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    console.log(t("Logout.ConsoleLog"));
    navigate('/'); 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-gray-100 dark:border-gray-700 transform transition-all scale-100">
        
        {/* Icon Circle */}
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
          <LogOut size={40} className="text-red-500 dark:text-red-400" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
          {t("Logout.Title")}
        </h2>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors">
          {t("Logout.Description")}
        </p>

        <div className="space-y-3">
          {/* Confirm Button */}
          <button 
            onClick={handleConfirm} 
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition shadow-lg shadow-red-200 dark:shadow-none"
          >
            {t("Logout.ConfirmBtn")}
          </button>

          {/* Cancel Button */}
          <button 
            onClick={onCancel} 
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3.5 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t("Logout.CancelBtn")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;