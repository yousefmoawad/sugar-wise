import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * [COMPONENT]: Careers
 * Purpose: Displays job openings and company benefits for prospective employees.
 * Path: /careers
 * Styling: Clinical brand aesthetic using Primary Blue (#2DA1D7) and Brand Green (#8EC641).
 */
const Careers = () => {
  const { t } = useTranslation();

  // Trigger scroll-reveal animations
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  /**
   * [DATA]: Job Openings
   * Array of available roles categorized by department.
   */
  const jobOpenings = [
    {
      id: 1,
      title: "Frontend Developer",
      department: t("Careers.DeptEngineering"),
      location: t("Careers.LocRemote"),
      type: t("Careers.TypeFullTime"),
    },
    {
      id: 2,
      title: "Pediatric Diabetes Specialist",
      department: t("Careers.DeptMedical"),
      location: "Cairo, Egypt",
      type: t("Careers.TypeFullTime"),
    },
    {
      id: 3,
      title: "UX/UI Designer",
      department: t("Careers.DeptDesign"),
      location: t("Careers.LocRemote"),
      type: t("Careers.TypeContract"),
    },
    {
      id: 4,
      title: "Customer Success Manager",
      department: t("Careers.DeptSupport"),
      location: "Dubai, UAE",
      type: t("Careers.TypeFullTime"),
    },
  ];

  return (
    <>
      <Navbar />

      {/**
       * [MAIN WRAPPER]: Soft brand gradient background from Colors.txt guidelines.
       */}
      <div className="min-h-screen bg-gradient-to-br from-white via-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-gray-950 dark:via-[#1a5f7f]/10 dark:to-[#4d6a23]/10 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/**
           * [HEADER SECTION]: High-impact page title.
           */}
          <div className="text-center mb-16" data-aos="fade-down">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
              {t("Careers.PageTitle")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
              {t("Careers.PageSubtitle")}
            </p>
          </div>

          {/**
           * [BENEFITS SECTION]: Corporate culture highlights.
           */}
          <div className="mb-20" data-aos="fade-up">
            <div className="bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] rounded-[2.5rem] p-10 md:p-14 text-white shadow-2xl transition-all">
              <h2 className="text-3xl font-black mb-10 text-center uppercase tracking-widest border-b border-white/20 pb-6">
                {t("Careers.BenefitsHeader")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Benefit 1 */}
                <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all group">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    <i className="fas fa-heart text-3xl"></i>
                  </div>
                  <h3 className="font-bold text-xl mb-3 uppercase tracking-tight">{t("Careers.BenefitMeaningfulTitle")}</h3>
                  <p className="text-white/80 leading-relaxed font-medium">
                    {t("Careers.BenefitMeaningfulDesc")}
                  </p>
                </div>
                {/* Benefit 2 */}
                <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all group">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    <i className="fas fa-users text-3xl"></i>
                  </div>
                  <h3 className="font-bold text-xl mb-3 uppercase tracking-tight">{t("Careers.BenefitTeamTitle")}</h3>
                  <p className="text-white/80 leading-relaxed font-medium">
                    {t("Careers.BenefitTeamDesc")}
                  </p>
                </div>
                {/* Benefit 3 */}
                <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all group">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    <i className="fas fa-graduation-cap text-3xl"></i>
                  </div>
                  <h3 className="font-bold text-xl mb-3 uppercase tracking-tight">
                    {t("Careers.BenefitGrowthTitle")}
                  </h3>
                  <p className="text-white/80 leading-relaxed font-medium">
                    {t("Careers.BenefitGrowthDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/**
           * [OPENINGS SECTION]: Current job listings.
           */}
          <div className="mb-20">
            <div className="flex items-center mb-10 space-x-4">
              <div className="h-10 w-2 bg-[#8EC641] rounded-full"></div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">
                {t("Careers.SectionOpenings")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {jobOpenings.map((job, index) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:border-[#2DA1D7]/30 transition-all duration-300 hover:-translate-y-2 group"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white transition-colors uppercase tracking-tighter">
                        {job.title}
                      </h3>
                      <p className="text-lg text-[#2DA1D7] font-bold mt-1 transition-colors">{job.department}</p>
                    </div>
                    <span className="bg-[#2DA1D7]/10 text-[#2DA1D7] dark:bg-[#2DA1D7]/20 dark:text-[#2DA1D7] text-xs font-black uppercase px-4 py-2 rounded-full tracking-widest transition-colors">
                      {job.type}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-8 transition-colors font-medium">
                    <i className="fas fa-map-marker-alt mr-3 text-[#8EC641]"></i>
                    <span>{job.location}</span>
                  </div>
                  <button
                    onClick={() => alert(t("Careers.ApplyingAlert", { job: job.title }))}
                    className="w-full bg-gradient-to-r from-[#2DA1D7] to-[#1e7ca8] text-white font-black py-4 rounded-2xl transition duration-300 shadow-xl shadow-[#2DA1D7]/20 hover:shadow-[#2DA1D7]/40 uppercase tracking-widest"
                  >
                    {t("Careers.BtnApply")}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/**
           * [CTA SECTION]: General applications.
           */}
          <div className="text-center bg-white dark:bg-gray-800 p-12 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 transition-colors">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 transition-colors font-medium">
              {t("Careers.CtaGeneralText")}
            </p>
            <button
              onClick={() => alert(t("Careers.GeneralAlert"))}
              className="bg-white dark:bg-gray-900 border-4 border-[#8EC641] text-[#8EC641] hover:bg-[#8EC641] hover:text-white font-black py-4 px-12 rounded-2xl transition-all duration-300 shadow-lg uppercase tracking-widest"
            >
              {t("Careers.BtnGeneral")}
            </button>
          </div>

          {/**
           * [NAVIGATION]: Return link.
           */}
          <div className="mt-16 text-center">
            <Link
              to="/about"
              className="inline-flex items-center text-gray-400 hover:text-[#2DA1D7] font-black uppercase tracking-widest transition-colors group"
            >
              <i className="fas fa-arrow-left mr-3 group-hover:-translate-x-2 transition-transform"></i>
              {t("Careers.BtnBack")}
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Careers;