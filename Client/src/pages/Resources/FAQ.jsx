import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * [COMPONENT]: FAQ
 * Purpose: Provides answers to common user questions categorized by role.
 * Path: /faq
 * Styling: Clean clinical aesthetic with high-contrast categories and branded gradients.
 */
const FAQ = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItemIndex, setOpenItemIndex] = useState(null);

  // Initialize animations
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  /**
   * [DATA]: FAQ Content
   * Content is mapped to internationalization keys.
   */
  const faqData = [
    { category: "General", question: t("FAQ.QGeneral1"), answer: t("FAQ.AGeneral1") },
    { category: "General", question: t("FAQ.QGeneral2"), answer: t("FAQ.AGeneral2") },
    { category: "Patients", question: t("FAQ.QPatients1"), answer: t("FAQ.APatients1") },
    { category: "Patients", question: t("FAQ.QPatients2"), answer: t("FAQ.APatients2") },
    { category: "Patients", question: t("FAQ.QPatients3"), answer: t("FAQ.APatients3") },
    { category: "Doctors", question: t("FAQ.QDoctors1"), answer: t("FAQ.ADoctors1") },
    { category: "Doctors", question: t("FAQ.QDoctors2"), answer: t("FAQ.ADoctors2") },
    { category: "Doctors", question: t("FAQ.QDoctors3"), answer: t("FAQ.ADoctors3") },
    { category: "Technical", question: t("FAQ.QTech1"), answer: t("FAQ.ATech1") },
    { category: "Technical", question: t("FAQ.QTech2"), answer: t("FAQ.ATech2") },
  ];

  const categories = ["All", "General", "Patients", "Doctors", "Technical"];

  /**
   * [LOGIC]: Filtering
   * Filters FAQs by category and searches through questions/answers.
   */
  const filteredFAQs = faqData.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (index) => {
    setOpenItemIndex(openItemIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 transition-colors duration-300">
        
        {/**
         * [HERO SECTION]: Dynamic search and brand background.
         */}
        <div className="bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] dark:from-[#1a5f7f] dark:to-[#4d6a23] py-24 px-4 relative transition-colors overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10" data-aos="fade-down">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
              {t("FAQ.HeroTitle")}
            </h1>
            <p className="text-white/90 mb-10 text-lg font-medium transition-colors max-w-2xl mx-auto leading-relaxed">
              {t("FAQ.HeroSubtitle")}
            </p>

            {/* Global Search Input */}
            <div className="relative max-w-2xl mx-auto group">
              <input
                type="text"
                placeholder={t("FAQ.SearchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-6 pl-16 pr-6 rounded-3xl shadow-2xl border-none focus:ring-8 focus:ring-white/20 outline-none text-gray-900 dark:text-white bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm placeholder-gray-400 font-bold text-lg transition-all"
              />
              <i className="fas fa-search absolute left-6 top-1/2 transform -translate-y-1/2 text-[#2DA1D7] text-xl transition-transform group-focus-within:scale-125"></i>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-12 -translate-y-12"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-20 translate-y-20"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
          
          {/**
           * [FILTERS]: Category selection pills.
           */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-3 flex flex-wrap justify-center gap-3 mb-12 border border-gray-100 dark:border-gray-700 transition-colors" data-aos="fade-up">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenItemIndex(null);
                }}
                className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300
                ${activeCategory === cat
                    ? "bg-[#2DA1D7] text-white shadow-xl shadow-[#2DA1D7]/20 scale-105"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                }
              `}
              >
                {t(`FAQ.Cat${cat}`)}
              </button>
            ))}
          </div>

          {/**
           * [ACCORDION]: Expandable FAQ items.
           */}
          <div className="space-y-6">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item, index) => (
                <div
                  key={index}
                  className={`bg-white dark:bg-gray-800 rounded-[2rem] border-2 transition-all duration-300 overflow-hidden ${
                    openItemIndex === index
                      ? "shadow-2xl border-[#8EC641]/30"
                      : "border-transparent shadow-sm hover:border-gray-200 dark:hover:border-gray-700"
                  }`}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full flex justify-between items-center p-8 text-left focus:outline-none"
                  >
                    <div className="flex items-center gap-6">
                      <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all shadow-inner ${
                          openItemIndex === index
                            ? "bg-[#8EC641] text-white rotate-12"
                            : "bg-gray-100 dark:bg-gray-900 text-gray-400"
                        }`}
                      >
                        Q
                      </span>
                      <span className={`font-black text-xl tracking-tight transition-colors ${
                          openItemIndex === index
                            ? "text-[#2DA1D7]"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {item.question}
                      </span>
                    </div>
                    <i className={`fas fa-chevron-down transition-transform duration-500 text-gray-400 ${
                        openItemIndex === index ? "rotate-180 text-[#8EC641]" : ""
                      }`}
                    ></i>
                  </button>

                  {/* Expandable Content Area */}
                  <div className={`px-8 pl-24 text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed overflow-hidden transition-all duration-500 ease-in-out ${
                      openItemIndex === index ? "max-h-96 opacity-100 pb-10" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border-l-4 border-[#8EC641]">
                      {item.answer}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty State
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm">
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 transition-colors">
                  <i className="fas fa-search text-4xl"></i>
                </div>
                <h3 className="text-2xl font-black text-gray-700 dark:text-white uppercase tracking-tight">
                  {t("FAQ.EmptyTitle")}
                </h3>
                <p className="text-lg text-gray-400 mt-2 font-medium">
                  {t("FAQ.EmptyDesc")}
                </p>
              </div>
            )}
          </div>

          {/**
           * [CTA BANNER]: Support contact section.
           */}
          <div className="mt-20 bg-gradient-to-br from-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-[#2DA1D7]/10 dark:to-[#8EC641]/10 rounded-[2.5rem] p-12 text-center border-2 border-white dark:border-gray-800 shadow-2xl transition-colors" data-aos="zoom-in">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl text-[#2DA1D7] text-2xl">
              <i className="fas fa-headset"></i>
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">
              {t("FAQ.CtaTitle")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto font-medium">
              {t("FAQ.CtaDesc")}
            </p>
            <button
              onClick={() => navigate("/contact")}
              className="bg-[#2DA1D7] hover:bg-[#1e7ca8] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest transition shadow-2xl shadow-[#2DA1D7]/30 hover:shadow-[#2DA1D7]/50"
            >
              {t("FAQ.BtnContact")}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQ;