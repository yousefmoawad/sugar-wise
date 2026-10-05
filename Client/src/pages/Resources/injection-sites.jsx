import React, { useState, useEffect } from "react";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  Syringe,
  Droplet,
  CheckCircle2,
  Rotate3D,
  AlertTriangle,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next";

/**
 * [COMPONENT]: InjectionSites
 * Purpose: An interactive 3D-perspective medical guide for insulin injections and glucose tests.
 * Styling: Matches clinical brand guidelines with Primary Green (#8EC641) and Blue (#2DA1D7).
 */
const InjectionSites = () => {
  const { t } = useTranslation();
  const [activeMode, setActiveMode] = useState("insulin");
  const [bodyView, setBodyView] = useState("front");
  const [selectedSite, setSelectedSite] = useState(null);

  // Initialize entrance animations
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  /**
   * [CONFIG]: Color Classes
   * Maps data categories to brand-specific color palettes.
   */
  const colorClasses = {
    blue: {
      bg: "bg-gradient-to-br from-[#2DA1D7] to-[#1e7ca8]",
      text: "text-[#2DA1D7] dark:text-[#2DA1D7]",
      indicator: "bg-[#2DA1D7]",
    },
    green: {
      bg: "bg-gradient-to-br from-[#8EC641] to-[#6a9431]",
      text: "text-[#8EC641] dark:text-[#8EC641]",
      indicator: "bg-[#8EC641]",
    },
    red: {
      bg: "bg-gradient-to-br from-red-600 to-red-400",
      text: "text-red-600 dark:text-red-400",
      indicator: "bg-red-500",
    },
    indigo: {
      bg: "bg-gradient-to-br from-[#2DA1D7] to-[#1a5f7f]",
      text: "text-[#2DA1D7]/80 dark:text-[#2DA1D7]/80",
      indicator: "bg-[#2DA1D7]",
    },
    purple: {
      bg: "bg-gradient-to-br from-[#8EC641] to-[#4d6a23]",
      text: "text-[#8EC641]/80 dark:text-[#8EC641]/80",
      indicator: "bg-[#8EC641]",
    },
  };

  /**
   * [DATA]: Medical Site Definitions
   * Provides coordinates and info for each anatomical area.
   */
  const siteData = {
    insulin: [
      {
        id: "abdomen",
        view: "front",
        name: t("InjectionSites.SiteAbdomenName"),
        speed: t("InjectionSites.SiteAbdomenSpeed"),
        desc: t("InjectionSites.SiteAbdomenDesc"),
        clinical: t("InjectionSites.SiteAbdomenClinical"),
        color: "blue",
      },
      {
        id: "thighs",
        view: "front",
        name: t("InjectionSites.SiteThighsName"),
        speed: t("InjectionSites.SiteThighsSpeed"),
        desc: t("InjectionSites.SiteThighsDesc"),
        clinical: t("InjectionSites.SiteThighsClinical"),
        color: "blue",
      },
      {
        id: "arms",
        view: "back",
        name: t("InjectionSites.SiteArmsName"),
        speed: t("InjectionSites.SiteArmsSpeed"),
        desc: t("InjectionSites.SiteArmsDesc"),
        clinical: t("InjectionSites.SiteArmsClinical"),
        color: "indigo",
      },
      {
        id: "buttocks",
        view: "back",
        name: t("InjectionSites.SiteButtocksName"),
        speed: t("InjectionSites.SiteButtocksSpeed"),
        desc: t("InjectionSites.SiteButtocksDesc"),
        clinical: t("InjectionSites.SiteButtocksClinical"),
        color: "purple",
      },
    ],
    blood: [
      {
        id: "fingers",
        view: "front",
        name: t("InjectionSites.SiteFingersName"),
        speed: t("InjectionSites.SiteFingersSpeed"),
        desc: t("InjectionSites.SiteFingersDesc"),
        clinical: t("InjectionSites.SiteFingersClinical"),
        color: "red",
      },
    ],
  };

  const currentSites =
    activeMode === "insulin" ? siteData.insulin : siteData.blood;

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    setSelectedSite(null);
    if (mode === "blood") setBodyView("front");
  };

  /**
   * [ANIMATION]: Hotspot Variants
   * Pulsing effects for interactive anatomical zones.
   */
  const hotspotVariants = {
    initial: { opacity: 0.6, scale: 1 },
    hover: { opacity: 0.9, scale: 1.05, transition: { duration: 0.3 } },
    active: {
      opacity: [0.7, 1, 0.7],
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
    },
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-white via-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-16 px-4 font-sans transition-colors duration-300" dir="ltr">
        
        {/**
         * [HEADER]: Page title and mode selection.
         */}
        <div
          className="max-w-5xl mx-auto text-center mb-16"
          data-aos="fade-down"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6 transition-colors uppercase">
            {t("InjectionSites.PageTitle")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium transition-colors max-w-3xl mx-auto">
            {t("InjectionSites.PageSubtitle")}
          </p>

          <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-6">
            <div className="bg-white dark:bg-gray-800 p-2.5 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 inline-flex transition-all">
              <button
                onClick={() => handleModeChange("insulin")}
                className={`px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest transition-all ${
                  activeMode === "insulin"
                    ? "bg-[#2DA1D7] text-white shadow-lg shadow-[#2DA1D7]/20"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Syringe size={22} /> {t("InjectionSites.BtnInsulin")}
              </button>
              <button
                onClick={() => handleModeChange("blood")}
                className={`px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest transition-all ${
                  activeMode === "blood"
                    ? "bg-red-600 text-white shadow-lg shadow-red-200"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Droplet size={22} /> {t("InjectionSites.BtnGlucose")}
              </button>
            </div>

            {activeMode === "insulin" && (
              <div className="bg-white dark:bg-gray-800 p-2.5 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 inline-flex transition-all">
                <button
                  onClick={() => setBodyView("front")}
                  className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all ${
                    bodyView === "front" 
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                    : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                >
                  <Rotate3D size={20} /> {t("InjectionSites.BtnFrontView")}
                </button>
                <button
                  onClick={() => setBodyView("back")}
                  className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all ${
                    bodyView === "back" 
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                    : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                >
                  <Rotate3D size={20} className="rotate-180" /> {t("InjectionSites.BtnBackView")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/**
         * [MAIN DISPLAY]: Anatomical model and details sidebar.
         */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/**
           * [LEFT]: Interactive anatomical SVG.
           */}
          <div
            className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden relative min-h-[800px] flex justify-center py-10 transition-colors duration-300"
            data-aos="fade-right"
          >
            <div className="relative w-full h-full flex justify-center items-center">
              <svg
                viewBox="0 0 500 950"
                className="h-[750px] w-auto drop-shadow-3xl"
              >
                <defs>
                  {/* Skin Tone Gradients */}
                  <linearGradient id="skinBase" x1="0.5" y1="0" x2="0.5" y2="1">
                    <stop offset="0%" stopColor="#F3E5D0" />
                    <stop offset="40%" stopColor="#E8D3B7" />
                    <stop offset="100%" stopColor="#D4BC9E" />
                  </linearGradient>

                  <linearGradient id="limbCylinder" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#C4B096" />
                    <stop offset="25%" stopColor="#E8D3B7" />
                    <stop offset="50%" stopColor="#F3E5D0" />
                    <stop offset="75%" stopColor="#E8D3B7" />
                    <stop offset="100%" stopColor="#C4B096" />
                  </linearGradient>

                  <linearGradient id="deepShadow" x1="0.5" y1="0" x2="0.5" y2="1">
                    <stop offset="0%" stopColor="#8A7660" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#8A7660" stopOpacity="0.1" />
                  </linearGradient>

                  <radialGradient id="blueZoneGrad" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="40%" stopColor="rgba(45, 161, 215, 0.4)" />
                    <stop offset="100%" stopColor="rgba(45, 161, 215, 0)" />
                  </radialGradient>
                  <radialGradient id="redZoneGrad" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="40%" stopColor="rgba(239, 68, 68, 0.4)" />
                    <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                  </radialGradient>
                  <radialGradient id="indigoZoneGrad" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="40%" stopColor="rgba(45, 161, 215, 0.3)" />
                    <stop offset="100%" stopColor="rgba(45, 161, 215, 0)" />
                  </radialGradient>
                  <radialGradient id="purpleZoneGrad" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="40%" stopColor="rgba(142, 198, 65, 0.4)" />
                    <stop offset="100%" stopColor="rgba(142, 198, 65, 0)" />
                  </radialGradient>

                  <filter id="zoneBlur">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                  </filter>
                  <filter id="softBlur">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
                  </filter>
                </defs>

                <AnimatePresence mode="wait">
                  {bodyView === "front" && (
                    <motion.g
                      key="front-body"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* --- Body Rendering logic (Preserved for anatomical accuracy) --- */}
                      <path d="M125,180 C105,270 95,370 105,470 L110,570 L155,570 L160,470 C170,370 160,270 145,180 Z" fill="url(#limbCylinder)" />
                      <path d="M375,180 C395,270 405,370 395,470 L390,570 L345,570 L340,470 C330,370 340,270 355,180 Z" fill="url(#limbCylinder)" />
                      <path d="M250,90 C295,90 320,110 340,150 C350,190 330,260 320,330 C315,360 330,390 350,430 L360,610 L350,820 L300,820 L280,610 L260,560 L240,610 L220,820 L170,820 L160,610 L170,430 C190,390 205,360 200,330 C190,260 170,190 180,150 C200,110 220,90 260,90 Z" fill="url(#skinBase)" stroke="#C4B096" strokeWidth="0.5" />
                      
                      {/* Anatomical Shadows */}
                      <path d="M180,150 C170,200 160,300 170,430 L160,610 L185,610 L195,430 C200,360 190,200 200,150 Z" fill="url(#deepShadow)" filter="url(#softBlur)" opacity="0.6" />
                      <path d="M340,150 C350,200 360,300 350,430 L360,610 L335,610 L325,430 C320,360 330,200 320,150 Z" fill="url(#deepShadow)" filter="url(#softBlur)" opacity="0.6" />
                      
                      {/* Head */}
                      <path d="M225,90 L225,55 C225,35 275,35 275,55 L275,90 Z" fill="url(#skinBase)" />
                      <ellipse cx="250" cy="45" rx="32" ry="42" fill="url(#skinBase)" stroke="#C4B096" strokeWidth="0.5" />

                      {/* --- Interactive Zones --- */}
                      {activeMode === "insulin" && (
                        <>
                          {/* Abdomen */}
                          <motion.ellipse
                            cx="250" cy="390" rx="75" ry="55" fill="url(#blueZoneGrad)" filter="url(#zoneBlur)"
                            variants={hotspotVariants} initial="initial" whileHover="hover"
                            animate={selectedSite?.id === "abdomen" ? "active" : "initial"}
                            onClick={() => setSelectedSite(currentSites.find((s) => s.id === "abdomen"))}
                            className="cursor-pointer"
                          />
                          {/* Thighs */}
                          <motion.ellipse
                            cx="185" cy="620" rx="40" ry="100" fill="url(#blueZoneGrad)" filter="url(#zoneBlur)"
                            variants={hotspotVariants} initial="initial" whileHover="hover"
                            animate={selectedSite?.id === "thighs" ? "active" : "initial"}
                            onClick={() => setSelectedSite(currentSites.find((s) => s.id === "thighs"))}
                            className="cursor-pointer"
                          />
                          <motion.ellipse
                            cx="315" cy="620" rx="40" ry="100" fill="url(#blueZoneGrad)" filter="url(#zoneBlur)"
                            variants={hotspotVariants} initial="initial" whileHover="hover"
                            animate={selectedSite?.id === "thighs" ? "active" : "initial"}
                            onClick={() => setSelectedSite(currentSites.find((s) => s.id === "thighs"))}
                            className="cursor-pointer"
                          />
                        </>
                      )}

                      {activeMode === "blood" && (
                        <>
                          <motion.circle
                            cx="140" cy="570" r="30" fill="url(#redZoneGrad)" filter="url(#zoneBlur)"
                            variants={hotspotVariants} initial="initial" whileHover="hover"
                            animate={selectedSite?.id === "fingers" ? "active" : "initial"}
                            onClick={() => setSelectedSite(currentSites.find((s) => s.id === "fingers"))}
                            className="cursor-pointer"
                          />
                          <motion.circle
                            cx="360" cy="570" r="30" fill="url(#redZoneGrad)" filter="url(#zoneBlur)"
                            variants={hotspotVariants} initial="initial" whileHover="hover"
                            animate={selectedSite?.id === "fingers" ? "active" : "initial"}
                            onClick={() => setSelectedSite(currentSites.find((s) => s.id === "fingers"))}
                            className="cursor-pointer"
                          />
                        </>
                      )}
                    </motion.g>
                  )}

                  {bodyView === "back" && activeMode === "insulin" && (
                    <motion.g
                      key="back-body"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Back rendering logic */}
                      <path d="M130,170 C100,260 90,360 100,460 L105,560 L150,560 L155,460 C165,360 155,260 140,170 Z" fill="url(#limbCylinder)" />
                      <path d="M370,170 C400,260 410,360 400,460 L395,560 L350,560 L345,460 C335,360 345,260 360,170 Z" fill="url(#limbCylinder)" />
                      <path d="M250,90 C210,90 190,110 170,160 C160,210 180,290 170,360 C160,410 140,460 150,510 C160,560 190,560 250,560 C310,560 340,560 350,510 C360,460 340,410 330,360 C320,290 340,210 330,160 C310,110 290,90 250,90 Z" fill="url(#skinBase)" stroke="#C4B096" strokeWidth="0.5" />
                      <path d="M190,560 L170,810 L230,810 L250,560" fill="url(#skinBase)" />
                      <path d="M310,560 L330,810 L270,810 L250,560" fill="url(#skinBase)" />

                      {/* Back Hotspots */}
                      <motion.ellipse
                        cx="125" cy="280" rx="30" ry="70" fill="url(#indigoZoneGrad)" filter="url(#zoneBlur)"
                        variants={hotspotVariants} initial="initial" whileHover="hover"
                        animate={selectedSite?.id === "arms" ? "active" : "initial"}
                        onClick={() => setSelectedSite(currentSites.find((s) => s.id === "arms"))}
                        className="cursor-pointer"
                      />
                      <motion.ellipse
                        cx="375" cy="280" rx="30" ry="70" fill="url(#indigoZoneGrad)" filter="url(#zoneBlur)"
                        variants={hotspotVariants} initial="initial" whileHover="hover"
                        animate={selectedSite?.id === "arms" ? "active" : "initial"}
                        onClick={() => setSelectedSite(currentSites.find((s) => s.id === "arms"))}
                        className="cursor-pointer"
                      />
                      <motion.circle
                        cx="205" cy="480" r="55" fill="url(#purpleZoneGrad)" filter="url(#zoneBlur)"
                        variants={hotspotVariants} initial="initial" whileHover="hover"
                        animate={selectedSite?.id === "buttocks" ? "active" : "initial"}
                        onClick={() => setSelectedSite(currentSites.find((s) => s.id === "buttocks"))}
                        className="cursor-pointer"
                      />
                      <motion.circle
                        cx="295" cy="480" r="55" fill="url(#purpleZoneGrad)" filter="url(#zoneBlur)"
                        variants={hotspotVariants} initial="initial" whileHover="hover"
                        animate={selectedSite?.id === "buttocks" ? "active" : "initial"}
                        onClick={() => setSelectedSite(currentSites.find((s) => s.id === "buttocks"))}
                        className="cursor-pointer"
                      />
                    </motion.g>
                  )}
                </AnimatePresence>
              </svg>

              {/**
               * [HELP TIP]: Guided instructions.
               */}
              {!selectedSite && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 animate-bounce">
                    <p className="text-[#2DA1D7] font-black text-center uppercase tracking-widest text-sm">
                      <i className="fas fa-hand-pointer mr-3"></i>
                      {t("InjectionSites.InstructionSelect")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/**
           * [RIGHT]: Details & Information sidebar.
           */}
          <div className="lg:col-span-5 space-y-8" data-aos="fade-left">
            <AnimatePresence mode="wait">
              {selectedSite ? (
                <motion.div
                  key={selectedSite.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border-4 border-gray-100 dark:border-gray-700 p-10 transition-colors"
                >
                  <div className="flex items-center gap-6 mb-10">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-xl ${colorClasses[selectedSite.color].bg}`}>
                      <Info size={36} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                        {selectedSite.name}
                      </h2>
                      <span className="text-[#2DA1D7] font-black text-xs uppercase tracking-[0.2em] mt-3 block opacity-80">
                        {selectedSite.speed}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    <div className="bg-gray-50 dark:bg-gray-950 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
                      <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                        <i className="fas fa-book-medical mr-3 text-[#2DA1D7]"></i>
                        {t("InjectionSites.LabelClinicalInfo")}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-medium">
                        {selectedSite.clinical}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-950 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
                      <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                        <i className="fas fa-info-circle mr-3 text-[#8EC641]"></i>
                        {t("InjectionSites.LabelPatientAdvice")}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-medium">
                        {selectedSite.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Default information cards when no site is selected
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 transition-colors">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 flex items-center">
                      <CheckCircle2 className="text-[#8EC641] mr-3" />
                      {t("InjectionSites.SectionRotationHeader")}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed">
                      {t("InjectionSites.SectionRotationDesc")}
                    </p>
                  </div>
                  <div className="bg-[#2DA1D7] p-8 rounded-[2.5rem] shadow-xl text-white">
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center">
                      <Syringe className="mr-3" />
                      {t("InjectionSites.SectionPrepHeader")}
                    </h3>
                    <p className="text-white/90 text-lg font-medium leading-relaxed">
                      {t("InjectionSites.SectionPrepDesc")}
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Global Precautions Card */}
            <div className="bg-orange-50 dark:bg-orange-900/10 p-8 rounded-[2.5rem] border-2 border-orange-100 dark:border-orange-900/30 transition-colors">
              <h3 className="text-2xl font-black text-orange-700 dark:text-orange-400 uppercase tracking-tight mb-4 flex items-center">
                <AlertTriangle className="mr-3" />
                {t("InjectionSites.SectionWarningHeader")}
              </h3>
              <p className="text-orange-800/80 dark:text-orange-300 text-lg font-medium leading-relaxed">
                {t("InjectionSites.SectionWarningDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InjectionSites;