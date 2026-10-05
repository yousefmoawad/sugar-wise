import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/Home.css";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import { useTranslation } from "react-i18next"; 

import AOS from 'aos';
import 'aos/dist/aos.css';

const Home = () => {
  const { t } = useTranslation();

  useEffect(() => {
    AOS.init({
      duration: 1000, 
      once: true,     
      offset: 100,    
    });

    const handleAnchorClick = (e) => {
      if (e.target.hash) {
        e.preventDefault();
        const element = document.querySelector(e.target.hash);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 80,
            behavior: "smooth",
          });
        }
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", handleAnchorClick);
    });

    const backToTopButton = document.getElementById("backToTop");
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        backToTopButton?.classList.remove("hidden");
      } else {
        backToTopButton?.classList.add("hidden");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.removeEventListener("click", handleAnchorClick);
      });
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDownloadClick = (platform) => {
    alert(`${t('home.download_msg')} ${platform}`);
  };

  return (
    <>
      <Navbar />
      
        {/* [DESIGN NOTE]: Brand Gradient Background flow. Modify 'via' and 'to' classes to change secondary accent strength */}
        <div className="bg-gradient-to-br from-white via-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-gray-950 dark:via-[#1a5f7f]/10 dark:to-[#4d6a23]/10 text-gray-800 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden min-h-screen">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] dark:from-[#1a5f7f] dark:to-[#4d6a23] text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              
              <div 
                className="lg:w-1/2 mb-12 lg:mb-0" 
                data-aos="fade-right"
              >
                <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm mb-6 border border-white/10">
                  <i className="fas fa-heartbeat mr-2"></i>
                  <span>{t('home.hero_badge')}</span>
                </div>

                {/* [HERO TITLE]: Uppercased to 8xl on large screens for maximum impact */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1]">
                  {t('home.hero_title')}
                </h1>

                {/* [HERO SUBTITLE]: Increased to 3xl for better flow under the main heading */}
                <p className="text-2xl md:text-3xl mb-10 opacity-90 text-white/90 leading-relaxed">
                  {t('home.hero_description')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/features"
                    className="bg-white text-[#2DA1D7] dark:bg-gray-800 dark:text-[#8EC641] hover:bg-gray-100 dark:hover:bg-gray-700 font-bold py-3 px-8 rounded-lg text-lg text-center transition duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <i className="fas fa-play-circle mr-2"></i> {t('home.how_it_works')}
                  </Link>
                  <Link
                    to="/download"
                    className="border-2 border-white hover:bg-white/10 text-white font-bold py-3 px-8 rounded-lg text-lg text-center transition duration-300 transform hover:scale-105"
                  >
                    <i className="fas fa-mobile-alt mr-2"></i> {t('home.download_app')}
                  </Link>
                </div>
              </div>

              {/* [MOBILE ADJUSTMENT]: Scale down the floating icons slightly on mobile to prevent clipping */}
              <div 
                className="lg:w-1/2 flex justify-center w-full px-2"
                data-aos="fade-left"
                data-aos-delay="200"
              >
                <div className="relative w-full max-w-lg">
                  <div className="bg-white/20 dark:bg-black/20 rounded-2xl p-4 md:p-8 backdrop-blur-sm border border-white/30 dark:border-white/10">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] rounded-lg flex items-center justify-center mr-4 shadow-md">
                          <i className="fas fa-apple-alt text-white text-2xl"></i>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {t('home.app_card_title')}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-base">
                            {t('home.app_card_subtitle')}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">
                            {t('home.current_glucose')}
                          </span>
                          <span className="font-bold text-green-600 dark:text-green-400 text-xl">
                            112 mg/dL
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full shadow-sm"
                            style={{ width: "65%" }}
                          ></div>
                        </div>
                        <div className="text-center py-3 bg-gradient-to-r from-blue-50/50 to-green-50/50 dark:from-[#2DA1D7]/10 dark:to-[#8EC641]/10 rounded-lg border border-[#2DA1D7]/20 dark:border-[#2DA1D7]/30">
                          <p className="font-bold text-gray-800 dark:text-gray-200">
                            {t('home.target_status')}
                          </p>
                          <p className="text-base text-gray-600 dark:text-gray-400">
                            {t('home.last_24_hours')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -top-4 -left-2 md:-left-4 w-16 h-16 md:w-20 md:h-20 bg-yellow-400 dark:bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <i className="fas fa-bolt text-white text-xl md:text-2xl"></i>
                  </div>
                  <div className="absolute -bottom-4 -right-2 md:-right-4 w-20 h-20 md:w-24 md:h-24 bg-blue-400 dark:bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <i className="fas fa-chart-line text-white text-2xl md:text-3xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement Section */}
        <section className="py-16 bg-transparent transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className="text-center mb-16"
              data-aos="fade-up"
            >
              {/* [SECTION HEADER]: Bold brand header with responsive scale */}
              <h2 className="text-5xl md:text-6xl font-black mb-6 text-gray-900 dark:text-white tracking-tight">
                {t('home.challenge_title')}
              </h2>
              <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
                {t('home.challenge_description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div 
                className="bg-red-50 dark:bg-red-900/10 p-6 md:p-8 rounded-2xl border border-red-100 dark:border-red-900/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                data-aos="zoom-in"
              >
                <div className="w-16 h-16 bg-red-100 dark:bg-red-800/30 rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-2xl"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('home.card1_title')}
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                  {t('home.card1_description')}
                </p>
                <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow-sm">
                  <p className="text-base text-gray-500 dark:text-gray-400">
                    <i className="fas fa-image mr-2"></i> {t('home.image_label')} 1
                  </p>
                </div>
              </div>

              <div 
                className="bg-yellow-50 dark:bg-yellow-900/10 p-6 md:p-8 rounded-2xl border border-yellow-100 dark:border-yellow-900/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                data-aos="zoom-in"
                data-aos-delay="150"
              >
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-800/30 rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-calculator text-yellow-600 dark:text-yellow-400 text-2xl"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('home.card2_title')}
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                  {t('home.card2_description')}
                </p>
                <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow-sm">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <i className="fas fa-image mr-2"></i> {t('home.image_label')} 2
                  </p>
                </div>
              </div>

              <div 
                className="bg-blue-50 dark:bg-blue-900/10 p-6 md:p-8 rounded-2xl border border-blue-100 dark:border-blue-900/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                data-aos="zoom-in"
                data-aos-delay="300"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800/30 rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-heart text-blue-600 dark:text-blue-400 text-2xl"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('home.card3_title')}
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                  {t('home.card3_description')}
                </p>
                <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow-sm">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <i className="fas fa-image mr-2"></i> {t('home.image_label')} 3
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-16 bg-transparent transition-colors duration-300"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className="text-center mb-16"
              data-aos="fade-up"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('home.features_title')}
              </h2>
              <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {t('home.features_description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 Card */}
              <div 
                className="bg-blue-50/50 dark:bg-[#2DA1D7]/10 p-6 md:p-8 rounded-2xl border border-[#2DA1D7]/20 dark:border-[#2DA1D7]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col h-full"
                data-aos="zoom-in"
              >
                <div className="inline-flex items-center self-start px-4 py-2 bg-[#8EC641]/10 dark:bg-[#8EC641]/20 text-[#8EC641] dark:text-[#8EC641] rounded-full text-xs font-bold mb-6">
                  <i className="fas fa-chart-line mr-2"></i>
                  <span>{t('home.feature1_badge')}</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('home.feature1_title')}
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 flex-grow">
                  {t('home.feature1_description')}
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-[#2DA1D7]/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-gray-800 dark:text-white">{t('home.glucose_monitoring')}</span>
                    <span className="text-green-600 dark:text-green-400 text-xs font-bold"><i className="fas fa-wifi"></i> {t('home.connected')}</span>
                  </div>
                  <div className="text-center py-6">
                    <div className="text-5xl font-black text-gray-900 dark:text-white mb-1">112</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">mg/dL</div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                    <div className="bg-gradient-to-r from-[#8EC641] to-[#2DA1D7] h-1.5 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                </div>
              </div>

              {/* Feature 2 Card */}
              <div 
                className="bg-green-50/50 dark:bg-[#8EC641]/10 p-6 md:p-8 rounded-2xl border border-[#8EC641]/20 dark:border-[#8EC641]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col h-full"
                data-aos="zoom-in"
                data-aos-delay="150"
              >
                <div className="inline-flex items-center self-start px-4 py-2 bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20 text-[#2DA1D7] dark:text-[#2DA1D7] rounded-full text-xs font-bold mb-6">
                  <i className="fas fa-utensils mr-2"></i>
                  <span>{t('home.feature2_badge')}</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('home.feature2_title')}
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 flex-grow">
                  {t('home.feature2_description')}
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-[#8EC641]/10 space-y-3">
                  <div className="flex justify-between items-center text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-gray-800 dark:text-gray-200">{t('home.pasta')}</span>
                    <span className="font-bold text-[#2DA1D7]">45g</span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-gray-800 dark:text-gray-200">{t('home.apple')}</span>
                    <span className="font-bold text-[#2DA1D7]">25g</span>
                  </div>
                  <div className="text-center py-2 bg-[#8EC641]/10 rounded border border-[#8EC641]/20">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Insulin: 3.5 u</p>
                  </div>
                </div>
              </div>

              {/* Feature 3 Card */}
              <div 
                className="bg-orange-50/50 dark:bg-orange-900/10 p-6 md:p-8 rounded-2xl border border-orange-200 dark:border-orange-800/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col h-full"
                data-aos="zoom-in"
                data-aos-delay="300"
              >
                <div className="inline-flex items-center self-start px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold mb-6">
                  <i className="fas fa-gamepad mr-2"></i>
                  <span>{t('home.feature3_badge')}</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('home.feature3_title')}
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 flex-grow">
                  {t('home.feature3_description')}
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-orange-100 dark:border-orange-900/10 text-center">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-800 dark:text-white">{t('home.sugarwise_games')}</span>
                    <span className="text-orange-500 text-xs font-bold">Lvl 5</span>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-trophy text-yellow-600 text-sm"></i>
                  </div>
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{t('home.champion_title')}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{t('home.streak_achieved')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-[#8EC641] to-[#2DA1D7] dark:from-[#4d6a23] dark:to-[#1a5f7f] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              {/* [IMPACT HEADER]: White contrast heading on brand gradient */}
              <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                {t('home.impact_title')}
              </h2>
              <p className="text-2xl md:text-3xl opacity-90 max-w-4xl mx-auto leading-relaxed">
                {t('home.impact_description')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {[
                { val: "85%", label: t('home.stat_er') },
                { val: "92%", label: t('home.stat_improvement') },
                { val: "10K+", label: t('home.stat_active') },
                { val: "4.8", label: t('home.stat_rating'), stars: true }
              ].map((stat, idx) => (
                <div 
                  key={idx}
                  className="text-center p-4 md:p-6 bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  data-aos="flip-left"
                  data-aos-delay={idx * 100}
                >
                  <div className="text-3xl md:text-6xl font-black mb-3">{stat.val}</div>
                  {stat.stars && (
                    <div className="flex justify-center mb-1">
                      {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star text-yellow-300 text-[10px] md:text-sm"></i>)}
                    </div>
                  )}
                  <p className="opacity-90 text-[11px] md:text-base leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Download/CTA Section */}
        <section id="download" className="py-16 bg-transparent transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] dark:from-[#1a5f7f] dark:to-[#4d6a23] rounded-3xl p-6 md:p-12 shadow-2xl">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="lg:w-2/3 mb-10 lg:mb-0" data-aos="fade-right">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    {t('home.cta_title')}
                  </h2>
                  <p className="text-xl text-white/90 mb-8">
                    {t('home.cta_description')}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => handleDownloadClick("Google Play")}
                      className="bg-gray-900 dark:bg-black text-white hover:bg-black dark:hover:bg-gray-900 font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg text-lg flex items-center justify-center transition duration-300 transform hover:scale-105"
                    >
                      <i className="fab fa-google-play text-xl md:text-2xl mr-3"></i>
                      <div className="text-left">
                        <div className="text-xs md:text-sm font-bold uppercase tracking-wider opacity-80">{t('home.get_it_on')}</div>
                        <div className="text-lg md:text-2xl">Google Play</div>
                      </div>
                    </button>
                    <Link
                      to="/register"
                      className="bg-white/20 text-white hover:bg-white/30 font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg text-lg flex items-center justify-center border border-white transition duration-300 transform hover:scale-105"
                    >
                      <i className="fas fa-globe text-xl md:text-2xl mr-3"></i>
                      <div className="text-left">
                        <div className="text-lg md:text-2xl">{t('home.web_platform')}</div>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="lg:w-1/3 flex justify-center mt-8 lg:mt-0" data-aos="zoom-in">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl transform rotate-3 max-w-[280px] md:max-w-none">
                    <div className="bg-gradient-to-r from-[#8EC641] to-[#2DA1D7] rounded-xl p-1">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#8EC641] to-[#2DA1D7] rounded-lg flex items-center justify-center mr-3">
                            <i className="fas fa-heartbeat text-white"></i>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 dark:text-white">
                              SugarWise
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {t('home.today_summary')}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">{t('home.avg_glucose')}</span>
                            <span className="font-bold text-gray-800 dark:text-white text-sm">118 mg/dL</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">{t('home.time_in_range')}</span>
                            <span className="font-bold text-green-600 dark:text-green-400 text-sm">92%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* [TESTIMONIALS]: High-contrast social proof section with upscaled quote typography */}
        <section className="py-16 bg-white/40 dark:bg-black/20 backdrop-blur-md transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-aos="fade-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('home.testimonials_title')}
              </h2>
              <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {t('home.testimonials_description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: t('home.testi1_name'), role: t('home.testi1_role'), quote: t('home.testi1_quote'), initials: "SM", colors: "from-[#2DA1D7] to-[#8EC641]" },
                { name: t('home.testi2_name'), role: t('home.testi2_role'), quote: t('home.testi2_quote'), initials: "DR", colors: "from-green-400 to-teal-400" },
                { name: t('home.testi3_name'), role: t('home.testi3_role'), quote: t('home.testi3_quote'), initials: "TJ", colors: "from-orange-400 to-red-400" }
              ].map((testi, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-transparent dark:border-gray-700"
                  data-aos="fade-up"
                  data-aos-delay={idx * 150}
                >
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${testi.colors} rounded-full flex items-center justify-center text-white font-bold text-xl mr-4`}>
                      {testi.initials}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">{testi.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">{testi.role}</p>
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 italic mb-6">"{testi.quote}"</p>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* [ACCESSIBILITY]: Animated Back to Top button using brand gradient */}
        <button
          id="backToTop"
          onClick={scrollToTop}
          className="fixed bottom-10 right-10 w-16 h-16 bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] text-white rounded-full shadow-2xl items-center justify-center hover:shadow-[#2DA1D7]/40 transition duration-300 hidden z-50 animate-bounce group"
        >
          <i className="fas fa-arrow-up text-2xl group-hover:-translate-y-1 transition-transform"></i>
        </button>
      </div>
      <Footer />
    </>
  );
};

export default Home;