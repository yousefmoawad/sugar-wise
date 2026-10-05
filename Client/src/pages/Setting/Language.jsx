import React, { useState } from "react";
import { Languages, Check, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * [COMPONENT]: Language
 * Purpose: Allows users to localize the application interface.
 * Styling: Clean, grid-based language selector using Primary Green (#8EC641).
 */
const Language = () => {
  const { t, i18n } = useTranslation();

  const [selectedLang, setSelectedLang] = useState(i18n.language || "en");
  const [searchQuery, setSearchQuery] = useState("");

  const languages = [
    { id: "en", name: "English", native: "English", flag: "🇺🇸" },
    { id: "ar", name: "Arabic", native: "العربية", flag: "🇪🇬" },
    { id: "fr", name: "French", native: "Français", flag: "🇫🇷" },
    { id: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
    { id: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
    { id: "tr", name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  ];

  const handleLanguageChange = (langId) => {
    setSelectedLang(langId);
  };

  const handleSave = () => {
    i18n.changeLanguage(selectedLang);
  };

  const handleReset = () => {
    setSelectedLang(i18n.language);
  };

  const filteredLanguages = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.native.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* SECTION HEADER */}
      <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#8EC641]/10 flex items-center justify-center text-[#8EC641] shadow-inner">
          <Languages size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-1">
            {t("lang_title")}
          </h2>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {t("settings.account_settings")}
          </p>
        </div>
      </div>

      <p className="text-lg text-gray-600 dark:text-gray-400 font-medium max-w-2xl leading-relaxed mb-6">
        {t("lang_desc")}
      </p>

      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative group max-w-md">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8EC641] transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder={t("search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-[#8EC641]/30 focus:ring-8 focus:ring-[#8EC641]/5 rounded-[1.5rem] outline-none font-bold text-gray-900 dark:text-white transition-all"
          />
        </div>

        {/* Language Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLanguages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all group ${
                selectedLang === lang.id
                  ? "bg-[#8EC641]/5 border-[#8EC641]/20 shadow-xl shadow-[#8EC641]/5"
                  : "bg-white dark:bg-gray-800/40 border-gray-50 dark:border-gray-800 hover:border-[#8EC641]/20"
              }`}
            >
              <div className="flex items-center gap-5">
                <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-500">
                  {lang.flag}
                </span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className={`font-black uppercase tracking-tight text-sm ${
                      selectedLang === lang.id ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {lang.name}
                    </p>
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-[9px] font-black uppercase text-gray-400">
                      {lang.id}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500">
                    {lang.native}
                  </p>
                </div>
              </div>
              {selectedLang === lang.id && (
                <div className="w-8 h-8 bg-[#8EC641] rounded-full flex items-center justify-center text-white shadow-lg animate-scale-in">
                  <Check size={16} strokeWidth={4} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-end gap-6 pt-10 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleReset}
          className="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          {t("reset_btn")}
        </button>
        <button
          onClick={handleSave}
          className="px-12 py-4 bg-gradient-to-r from-[#8EC641] to-[#6a9431] text-white rounded-[1.25rem] font-black uppercase tracking-widest shadow-2xl shadow-[#8EC641]/30 hover:shadow-[#8EC641]/50 hover:-translate-y-1 transition-all active:scale-95"
        >
          {t("save_btn")}
        </button>
      </div>
    </div>
  );
};

export default Language;
