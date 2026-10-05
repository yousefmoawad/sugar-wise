import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "../locales/en/translation.json";
import arTranslation from "../locales/ar/translation.json";
import frTranslation from "../locales/fr/translation.json";
import deTranslation from "../locales/de/translation.json";
import esTranslation from "../locales/es/translation.json";
import trTranslation from "../locales/tr/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: enTranslation },
      ar: { translation: arTranslation },
      fr: { translation: frTranslation },
      de: { translation: deTranslation },
      es: { translation: esTranslation },
      tr: { translation: trTranslation },
    },
  });

// --- ADD THIS LOGIC HERE ---
// This runs on refresh and whenever changeLanguage is called
i18n.on("languageChanged", (lng) => {
  document.body.dir = lng === "ar" ? "rtl" : "ltr";
  // Optional: Update the lang attribute for SEO/Accessibility
  document.documentElement.lang = lng;
});

export default i18n;
