import React, { useEffect } from "react";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import { useTranslation } from "react-i18next";
import { 
  Smartphone, 
  ChevronRight, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  Zap, 
  BarChart3 
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const DownloadApp = () => {
  const { t } = useTranslation();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors duration-300 overflow-hidden font-sans">
        
        {/* --- HERO SECTION --- */}
        <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#2DA1D7]/15 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#8EC641]/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              
              <div data-aos="fade-right" className="text-center lg:text-left text-balance">
                <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-[#2DA1D7]/10 text-[#2DA1D7] font-black text-[10px] uppercase tracking-[0.2em] mb-8 border border-[#2DA1D7]/20">
                  <Smartphone size={14} /> {t('DownloadApp.HeroBadge')}
                </div>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                  {t('DownloadApp.HeroTitlePart1')} <br />
                  <span className="text-[#2DA1D7]">{t('DownloadApp.HeroTitlePart2')}</span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {t('DownloadApp.HeroDescription')}
                </p>

                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5">
                  <button className="flex items-center justify-center px-10 py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300">
                    <i className="fab fa-apple text-3xl mr-4"></i>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-black opacity-60 leading-none mb-1">{t('DownloadApp.AppStoreLabel')}</p>
                      <p className="text-lg font-bold leading-none">{t('DownloadApp.DownloadNow')}</p>
                    </div>
                  </button>
                  
                  <button className="flex items-center justify-center px-10 py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-2xl hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1 transition-all duration-300">
                    <i className="fab fa-google-play text-2xl mr-4"></i>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-black opacity-60 leading-none mb-1">{t('DownloadApp.PlayStoreLabel')}</p>
                      <p className="text-lg font-bold leading-none">{t('DownloadApp.GetItNow')}</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Enhanced Phone Mockup */}
              <div className="relative group" data-aos="zoom-in" data-aos-delay="200">
                <div className="relative mx-auto w-[320px] h-[650px] bg-gray-900 rounded-[3.5rem] border-[12px] border-gray-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="absolute inset-0 bg-white dark:bg-[#121214] p-8 flex flex-col gap-8">
                    <div className="flex justify-between items-center mt-4">
                      <div className="w-10 h-10 bg-[#2DA1D7] rounded-xl flex items-center justify-center text-white">
                         <Activity size={20} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                    </div>
                    
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{t('DownloadApp.LiveStatus')}</p>
                        <h3 className="text-3xl font-black dark:text-white leading-none">112 <span className="text-sm font-medium text-gray-500">mg/dL</span></h3>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8EC641]/10 text-[#8EC641] rounded-full text-[10px] font-bold">
                            <CheckCircle2 size={10} /> {t('DownloadApp.NormalRange')}
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800 p-4">
                        <div className="flex justify-between mb-4">
                            <span className="text-[10px] font-bold dark:text-white">{t('DownloadApp.Analytics')}</span>
                            <BarChart3 size={12} className="text-[#2DA1D7]" />
                        </div>
                        <div className="h-full flex items-end gap-2 pb-6">
                            {[40, 70, 45, 90, 65].map((h, i) => (
                                <div key={i} className="flex-1 bg-[#2DA1D7]/20 rounded-t-lg relative">
                                    <div className="absolute bottom-0 w-full bg-[#2DA1D7] rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-1/4 -right-12 bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 animate-bounce duration-[3000ms]">
                  <div className="w-12 h-12 bg-[#8EC641]/20 rounded-2xl flex items-center justify-center text-[#8EC641]">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">{t('DownloadApp.FloatingBadgeTitle')}</p>
                    <p className="font-bold text-gray-900 dark:text-white leading-none">{t('DownloadApp.FloatingBadgeDesc')}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section className="py-32 bg-gray-50/50 dark:bg-[#080809] border-y border-gray-100 dark:border-gray-900 text-balance">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20" data-aos="fade-up">
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                {t('DownloadApp.FeatureTitleMain')} <br /><span className="text-[#8EC641]">{t('DownloadApp.FeatureTitleSub')}</span>
              </h2>
              <div className="w-24 h-2 bg-[#2DA1D7] mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
               {[
                 { icon: <Zap />, title: t('DownloadApp.Feat1Title'), desc: t('DownloadApp.Feat1Desc'), color: "#2DA1D7" },
                 { icon: <BarChart3 />, title: t('DownloadApp.Feat2Title'), desc: t('DownloadApp.Feat2Desc'), color: "#8EC641" },
                 { icon: <ShieldCheck />, title: t('DownloadApp.Feat3Title'), desc: t('DownloadApp.Feat3Desc'), color: "#2DA1D7" }
               ].map((feat, i) => (
                 <div key={i} className="group p-10 bg-white dark:bg-[#121214] rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 hover:border-[#2DA1D7]/30" data-aos="fade-up" data-aos-delay={i * 100}>
                   <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg" style={{ backgroundColor: `${feat.color}15`, color: feat.color }}>
                     {React.cloneElement(feat.icon, { size: 28, strokeWidth: 2.5 })}
                   </div>
                   <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">{feat.title}</h3>
                   <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{feat.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="py-32">
            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-gradient-to-br from-[#2DA1D7] to-[#1e1b4b] rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">{t('DownloadApp.CTATitle')}</h2>
                        <p className="text-blue-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto opacity-90 leading-relaxed">
                            {t('DownloadApp.CTADesc')}
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button className="px-10 py-5 bg-white text-gray-950 font-black rounded-2xl hover:scale-105 transition-all shadow-xl flex items-center gap-2 uppercase tracking-widest text-xs">
                                {t('DownloadApp.CTAButton')} <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default DownloadApp;