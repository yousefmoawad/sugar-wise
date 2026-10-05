import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * [COMPONENT]: Mission
 * Purpose: Articulates the core values, vision, and social impact of Sugar Wise 4.
 * Path: /mission
 * Styling: Premium clinical aesthetic using Primary Blue (#2DA1D7) and Brand Green (#8EC641).
 */
const Mission = () => {
  const { t } = useTranslation();

  // Initialize scroll animations
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);
  
  return (
    <>
      <Navbar />

      {/* [MAIN WRAPPER]: Brand-consistent background flow. */}
      <div className="min-h-screen bg-gradient-to-br from-white via-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-gray-950 dark:via-[#1a5f7f]/10 dark:to-[#4d6a23]/10 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* [HEADER SECTION]: High-impact page introduction. */}
          <div className="text-center mb-20" data-aos="fade-down">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight transition-colors">
              {t("Mission.PageTitle")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium transition-colors">
              {t("Mission.PageSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* [CORE VISION]: Primary mission statement card. */}
            <div data-aos="fade-right">
              <div className="bg-white dark:bg-gray-800 p-10 md:p-14 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 relative overflow-hidden group">
                <div className="w-20 h-20 bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] rounded-3xl flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform">
                  <i className="fas fa-heart text-white text-3xl"></i>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 transition-colors uppercase tracking-tight">
                  {t("Mission.VisionTitle")}
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-10 transition-colors leading-relaxed font-medium">
                  {t("Mission.VisionDesc")}
                </p>
                <ul className="space-y-6 text-lg text-gray-700 dark:text-gray-300 font-bold transition-colors uppercase tracking-tight">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-[#8EC641] text-2xl mr-4 mt-0.5"></i>
                    <span>{t("Mission.VisionPoint1")}</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-[#8EC641] text-2xl mr-4 mt-0.5"></i>
                    <span>{t("Mission.VisionPoint2")}</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-[#8EC641] text-2xl mr-4 mt-0.5"></i>
                    <span>{t("Mission.VisionPoint3")}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* [VALUES & IMPACT]: Secondary informational metrics. */}
            <div className="space-y-10" data-aos="fade-left">
              
              {/* Values Card */}
              <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] border-2 border-[#2DA1D7]/10 dark:border-[#2DA1D7]/20 transition-all duration-300 shadow-xl">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 transition-colors uppercase tracking-widest">
                  {t("Mission.ValuesTitle")}
                </h3>
                <div className="space-y-8">
                  <div className="flex items-start group">
                    <div className="w-14 h-14 bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20 rounded-2xl flex items-center justify-center mr-6 transition-all shadow-inner group-hover:scale-110">
                      <i className="fas fa-child text-[#2DA1D7] text-xl"></i>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900 dark:text-gray-200 transition-colors uppercase tracking-tight">
                        {t("Mission.ValueChildTitle")}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-base transition-colors leading-relaxed font-medium">
                        {t("Mission.ValueChildDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start group">
                    <div className="w-14 h-14 bg-[#8EC641]/10 dark:bg-[#8EC641]/20 rounded-2xl flex items-center justify-center mr-6 transition-all shadow-inner group-hover:scale-110">
                      <i className="fas fa-shield-alt text-[#8EC641] text-xl"></i>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900 dark:text-gray-200 transition-colors uppercase tracking-tight">
                        {t("Mission.ValueSafetyTitle")}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-base transition-colors leading-relaxed font-medium">
                        {t("Mission.ValueSafetyDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Metrics Card */}
              <div className="bg-gradient-to-r from-[#2DA1D7] to-[#1e7ca8] p-10 rounded-[2.5rem] text-white shadow-2xl">
                <h3 className="text-2xl font-black mb-8 transition-colors uppercase tracking-widest text-center border-b border-white/20 pb-4">
                  {t("Mission.ImpactTitle")}
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10">
                    <div className="text-4xl font-black mb-1">50K+</div>
                    <div className="text-xs font-black uppercase tracking-widest opacity-80">{t("Mission.ImpactChildren")}</div>
                  </div>
                  <div className="text-center p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10">
                    <div className="text-4xl font-black mb-1">90%</div>
                    <div className="text-xs font-black uppercase tracking-widest opacity-80">
                      {t("Mission.ImpactEmergencies")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* [BACK BUTTON]: Return to about page. */}
          <div className="mt-20 text-center">
            <Link
              to="/about"
              className="inline-flex items-center text-gray-400 hover:text-[#2DA1D7] font-black uppercase tracking-widest transition-colors group"
            >
              <i className="fas fa-arrow-left mr-3 group-hover:-translate-x-2 transition-transform"></i>
              {t("Mission.BtnBack")}
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Mission;