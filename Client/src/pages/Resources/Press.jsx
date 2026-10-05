import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * [COMPONENT]: Press
 * Purpose: Repository for official news, press releases, and media coverage.
 * Path: /press
 * Styling: Clinical editorial look with brand green (#8EC641) and blue (#2DA1D7) accents.
 */
const Press = () => {
  const { t } = useTranslation();

  // Initialize scroll-reveal transition effects
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  /**
   * [DATA]: Press Releases
   * Mapped for internationalization support.
   */
  const newsItems = [
    {
      id: 1,
      date: "October 15, 2023",
      title: t("Press.News1Title"),
      category: t("Press.CatAnnouncement"),
      excerpt: t("Press.News1Excerpt"),
    },
    {
      id: 2,
      date: "September 28, 2023",
      title: t("Press.News2Title"),
      category: t("Press.CatMedical"),
      excerpt: t("Press.News2Excerpt"),
    },
    {
      id: 3,
      date: "August 12, 2023",
      title: t("Press.News3Title"),
      category: t("Press.CatInovation"),
      excerpt: t("Press.News3Excerpt"),
    },
    {
      id: 4,
      date: "July 05, 2023",
      title: t("Press.News4Title"),
      category: t("Press.CatEvents"),
      excerpt: t("Press.News4Excerpt"),
    },
  ];

  return (
    <>
      <Navbar />
      
      {/**
       * [MAIN WRAPPER]: Editorial style with soft branded gradient flow.
       */}
      <div className="min-h-screen bg-gradient-to-br from-white via-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-gray-950 dark:via-[#1a5f7f]/10 dark:to-[#4d6a23]/10 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/**
           * [HEADER SECTION]: Page introduction.
           */}
          <div className="text-center mb-16" data-aos="fade-down">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight transition-colors">
              {t("Press.PageTitle")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-bold transition-colors">
              {t("Press.PageSubtitle")}
            </p>
          </div>

          {/**
           * [FEATURED POST]: Highlighted main announcement.
           */}
          <div className="mb-20" data-aos="fade-up">
            <div className="bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <span className="bg-white/20 text-white text-xs font-black uppercase px-6 py-2 rounded-full tracking-widest backdrop-blur-md mb-6 inline-block">
                  {t("Press.FeaturedLabel")}
                </span>
                <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight tracking-tighter uppercase max-w-4xl">
                  {t("Press.FeaturedTitle")}
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl font-medium leading-relaxed">
                  {t("Press.FeaturedExcerpt")}
                </p>
                <button className="bg-white text-[#2DA1D7] font-black py-4 px-12 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm">
                  {t("Press.BtnReadFull")}
                </button>
              </div>
              
              {/* Decorative Background Elements */}
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
              <div className="absolute top-10 right-10 opacity-20 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                <i className="fas fa-bullhorn text-[12rem] text-white"></i>
              </div>
            </div>
          </div>

          {/**
           * [MEDIA KITS & CONTACT]: Direct links for media inquiries.
           */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20" data-aos="fade-up">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20 rounded-2xl flex items-center justify-center text-[#2DA1D7] text-2xl mb-6 shadow-inner group-hover:bg-[#2DA1D7] group-hover:text-white transition-colors">
                <i className="fas fa-file-pdf"></i>
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2 transition-colors">{t("Press.AssetKitTitle")}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">{t("Press.AssetKitDesc")}</p>
              <button className="text-[#2DA1D7] font-black text-xs uppercase tracking-widest hover:underline">{t("Press.BtnDownload")}</button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 bg-[#8EC641]/10 dark:bg-[#8EC641]/20 rounded-2xl flex items-center justify-center text-[#8EC641] text-2xl mb-6 shadow-inner group-hover:bg-[#8EC641] group-hover:text-white transition-colors">
                <i className="fas fa-camera"></i>
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2 transition-colors">{t("Press.AssetGalleryTitle")}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">{t("Press.AssetGalleryDesc")}</p>
              <button className="text-[#8EC641] font-black text-xs uppercase tracking-widest hover:underline">{t("Press.BtnBrowse")}</button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20 rounded-2xl flex items-center justify-center text-[#2DA1D7] text-2xl mb-6 shadow-inner group-hover:bg-[#2DA1D7] group-hover:text-white transition-colors">
                <i className="fas fa-envelope"></i>
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2 transition-colors">{t("Press.AssetMediaTitle")}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">{t("Press.AssetMediaDesc")}</p>
              <button className="text-[#2DA1D7] font-black text-xs uppercase tracking-widest hover:underline">{t("Press.BtnContact")}</button>
            </div>
          </div>

          {/**
           * [LATEST NEWS]: Secondary article feed.
           */}
          <div>
            <div className="flex items-center mb-10 space-x-4">
              <div className="h-10 w-2 bg-[#8EC641] rounded-full"></div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">
                {t("Press.SectionLatest")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {newsItems.map((news, index) => (
                <div
                  key={news.id}
                  className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:border-[#2DA1D7]/30 transition-all duration-300 group"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-black text-[#8EC641] uppercase tracking-widest bg-[#8EC641]/10 px-4 py-1.5 rounded-full transition-colors">
                      {news.category}
                    </span>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{news.date}</span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter leading-tight group-hover:text-[#2DA1D7] transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed font-medium transition-colors">
                    {news.excerpt}
                  </p>
                  <button className="flex items-center text-[#2DA1D7] font-black uppercase tracking-widest text-xs group/btn">
                    {t("Press.BtnReadMore")}
                    <i className="fas fa-arrow-right ml-3 group-hover/btn:translate-x-2 transition-transform"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/**
           * [NEWSLETTER SECTION]: Call to action for press updates.
           */}
          <div className="mt-20 bg-white dark:bg-gray-800 p-12 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 text-center transition-colors">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">
              {t("Press.NewsletterTitle")}
            </h3>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-lg mx-auto font-medium">{t("Press.NewsletterDesc")}</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input 
                type="email" 
                placeholder={t("Press.NewsletterPlaceholder")}
                className="flex-1 px-8 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-4 focus:ring-[#2DA1D7]/20 outline-none text-gray-900 dark:text-white font-bold transition-all"
              />
              <button className="bg-[#2DA1D7] hover:bg-[#1e7ca8] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-[#2DA1D7]/20 transition-all whitespace-nowrap">
                {t("Press.BtnSubscribe")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Press;