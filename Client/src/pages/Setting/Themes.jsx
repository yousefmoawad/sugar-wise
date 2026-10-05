import React, { useState, useEffect } from "react";
import { Save, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

/**
 * [COMPONENT]: Themes
 * Purpose: Allows users to customize the visual appearance of the application.
 * Styling: Clean, modern card interface using both brand blue and green accents.
 */
const Themes = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  // Local state for pending selection before saving
  const [pendingTheme, setPendingTheme] = useState(theme);

  useEffect(() => {
    setPendingTheme(theme);
  }, [theme]);

  const themeOptions = [
    { value: "system", label: t("themes.system_default"), icon: Monitor, color: "text-gray-400" },
    { value: "light", label: t("themes.light_mode"), icon: Sun, color: "text-[#8EC641]" },
    { value: "dark", label: t("themes.dark_mode"), icon: Moon, color: "text-[#2DA1D7]" },
  ];

  const handleSave = () => {
    setTheme(pendingTheme);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-10">
      
      {/* SECTION HEADER */}
      <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 flex items-center justify-center text-indigo-500 shadow-inner">
          <i className="fas fa-palette text-xl"></i>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-1">
            {t("themes.title")}
          </h2>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {t("settings.account_settings")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* PREVIEW CARDS */}
        {themeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setPendingTheme(option.value)}
            className={`relative group p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col items-center text-center overflow-hidden h-full ${
              pendingTheme === option.value
                ? "bg-white dark:bg-gray-800 border-[#2DA1D7]/30 shadow-2xl shadow-[#2DA1D7]/10 scale-105 z-10"
                : "bg-gray-50/50 dark:bg-gray-900/30 border-transparent hover:border-gray-200 dark:hover:border-gray-800"
            }`}
          >
            {/* Active Checkmark */}
            {pendingTheme === option.value && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-[#2DA1D7] text-white rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                <Check size={16} strokeWidth={4} />
              </div>
            )}

            <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-110 ${
              pendingTheme === option.value ? "bg-white dark:bg-gray-700" : "bg-white dark:bg-gray-800"
            }`}>
              <option.icon className={`w-10 h-10 ${option.color}`} />
            </div>

            <h3 className={`font-black uppercase tracking-tight mb-2 ${
              pendingTheme === option.value ? "text-gray-900 dark:text-white" : "text-gray-400"
            }`}>
              {option.label}
            </h3>
            
            <div className="mt-4 flex gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <div className="w-4 h-4 rounded-full bg-[#8EC641]"></div>
              <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </button>
        ))}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-end gap-6 pt-10 mt-14 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#2DA1D7] to-[#1e7ca8] text-white px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-[#2DA1D7]/30 hover:shadow-[#2DA1D7]/50 hover:-translate-y-1 transition-all active:scale-95"
        >
          <Save size={20} />
          {t("themes.save_changes")}
        </button>
      </div>
    </div>
  );
};

// Check if Check is missing from imports
const Check = ({ size, strokeWidth }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default Themes;
