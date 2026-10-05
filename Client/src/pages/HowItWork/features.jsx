import React, { useEffect } from "react";
import { Play, Monitor, Zap, ShieldCheck, HeartPulse } from "lucide-react";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import { useTranslation } from "react-i18next";
import AOS from "aos";
import "aos/dist/aos.css";

const Features = () => {
  const { t } = useTranslation();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    window.scrollTo(0, 0);
  }, []);

  const videoTutorials = [
    {
      title: t("Features.Video1Title"),
      desc: t("Features.Video1Desc"),
      duration: "2:15",
      thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
    },
    {
      title: t("Features.Video2Title"),
      desc: t("Features.Video2Desc"),
      duration: "3:45",
      thumbnail: "https://images.unsplash.com/photo-1466632348570-84803b1d5820?auto=format&fit=crop&q=80",
    },
    {
      title: t("Features.Video3Title"),
      desc: t("Features.Video3Desc"),
      duration: "1:50",
      thumbnail: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80",
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors duration-300 overflow-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-16 pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2DA1D7]/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center text-balance">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#2DA1D7]/10 border border-[#2DA1D7]/20 mb-6" data-aos="fade-down">
            <Zap size={14} className="text-[#2DA1D7]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2DA1D7]">{t("Features.HeroBadge")}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight" data-aos="zoom-in">
            {t("Features.HeroTitle1")} <span className="text-[#2DA1D7]">SugarWise</span> <br /> {t("Features.HeroTitle2")}
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed" data-aos="fade-up">
            {t("Features.HeroDescription")}
          </p>
        </div>
      </section>

      {/* --- FEATURED VIDEO --- */}
      <section className="max-w-5xl mx-auto px-6 -mt-10 mb-24" data-aos="fade-up">
        <div className="relative group rounded-[2.5rem] overflow-hidden border-[8px] border-white dark:border-gray-800 shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=2000" 
            alt="Main Tutorial" 
            className="w-full aspect-video object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
            <button className="w-20 h-20 bg-[#8EC641] hover:bg-[#76a536] text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 group/btn border-2 border-white/20">
               <Play size={32} fill="currentColor" className="ml-1" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent">
            <h2 className="text-white text-xl font-black mb-1">{t("Features.MainVideoTitle")}</h2>
            <p className="text-white/70 text-sm italic">{t("Features.MainVideoSub")}</p>
          </div>
        </div>
      </section>

      {/* --- VIDEO GRID --- */}
      <section className="max-w-7xl mx-auto px-6 py-16 bg-gray-50 dark:bg-[#080809] rounded-[3rem] text-balance">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black dark:text-white mb-4">{t("Features.LibraryTitle")}</h2>
          <div className="w-16 h-1.5 bg-[#8EC641] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {videoTutorials.map((video, idx) => (
            <div key={idx} className="group cursor-pointer p-2 transition-all" data-aos="fade-up" data-aos-delay={idx * 100}>
              <div className="relative h-48 rounded-[2rem] overflow-hidden mb-4 shadow-lg border dark:border-gray-800">
                <img src={video.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#2DA1D7] rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all duration-300 shadow-xl border-2 border-white/20">
                        <Play size={18} fill="currentColor" />
                    </div>
                </div>
                <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-md">
                    {video.duration}
                </span>
              </div>
              <h3 className="text-lg font-black dark:text-white mb-2 group-hover:text-[#2DA1D7] transition-colors">{video.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{video.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STEP BY STEP SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-balance">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6" data-aos="fade-right">
                <h2 className="text-4xl font-black dark:text-white leading-[1.1] tracking-tight">
                    {t("Features.RoutineTitle")} <br /> <span className="text-[#2DA1D7]">{t("Features.RoutineSub")}</span>
                </h2>
                
                <div className="space-y-4">
                    {[
                        { icon: <Monitor />, key: "Tracking" },
                        { icon: <Zap />, key: "Alerts" },
                        { icon: <HeartPulse />, key: "Insights" }
                    ].map((step, i) => (
                        <div key={i} className="flex gap-4 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-[#2DA1D7]/10 flex items-center justify-center shrink-0 text-[#2DA1D7]">
                                {step.icon}
                            </div>
                            <div>
                                <h4 className="text-lg font-black dark:text-white mb-1 uppercase tracking-tight">{t(`Features.StepTitle${step.key}`)}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t(`Features.StepDesc${step.key}`)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative" data-aos="fade-left">
                <div className="relative bg-[#121214] p-3 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                    <img 
                        src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&q=80" 
                        className="rounded-[2.2rem] grayscale hover:grayscale-0 transition-all duration-700" 
                        alt="Medical Tech" 
                    />
                    <div className="absolute -bottom-6 -left-6 bg-white dark:bg-[#1a1a1c] p-5 rounded-3xl shadow-2xl border dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="text-[#8EC641]" size={18} />
                            <span className="font-bold dark:text-white text-sm">{t("Features.SecureLabel")}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">{t("Features.SecureDesc")}</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="max-w-6xl mx-auto px-6 pb-24" data-aos="zoom-in">
        <div className="bg-gradient-to-br from-[#2DA1D7] to-[#1a5f7f] rounded-[3.5rem] p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10 tracking-tight">{t("Features.CTATitle")}</h2>
            <p className="text-blue-100 mb-10 text-lg max-w-xl mx-auto relative z-10 font-bold opacity-90 leading-relaxed">
                {t("Features.CTADesc")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                <button className="px-10 py-4 bg-white text-[#2DA1D7] font-black rounded-2xl shadow-xl hover:scale-105 transition-transform uppercase tracking-widest text-sm">
                    {t("Features.BtnCreate")}
                </button>
                <button className="px-10 py-4 bg-[#080809] text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-transform uppercase tracking-widest text-sm border border-white/10">
                    {t("Features.BtnSupport")}
                </button>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;