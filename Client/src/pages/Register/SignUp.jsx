import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AOS from "aos";
import "aos/dist/aos.css";


const SignUp = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("");

  // Initialize Scroll-to-Reveal animations
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

 
  const handleContinue = () => {
    if (!selectedType) return;
    if (selectedType === "patient") {
      navigate("/create-profile-patient");
    } else if (selectedType === "doctor") {
      navigate("/create-profile-doctor");
    }
  };

 
  const accountTypes = [
    {
      id: "patient",
      title: t("SignUp.PatientTitle"),
      icon: "fas fa-user",
      description: t("SignUp.PatientDesc"),
      features: [
        t("SignUp.FeaturePatient1"),
        t("SignUp.FeaturePatient2"),
        t("SignUp.FeaturePatient3"),
        t("SignUp.FeaturePatient4"),
        t("SignUp.FeaturePatient5"),
      ],
      // [BRAND COLORS]: Clinical Primary Green
      color: "from-[#8EC641] to-[#6a9431]",
      brandHex: "#8EC641",
    },
    {
      id: "doctor",
      title: t("SignUp.DoctorTitle"),
      icon: "fas fa-user-md",
      description: t("SignUp.DoctorDesc"),
      features: [
        t("SignUp.FeatureDoctor1"),
        t("SignUp.FeatureDoctor2"),
        t("SignUp.FeatureDoctor3"),
        t("SignUp.FeatureDoctor4"),
        t("SignUp.FeatureDoctor5"),
      ],
      // [BRAND COLORS]: Clinical Secondary Blue
      color: "from-[#2DA1D7] to-[#1e7ca8]",
      brandHex: "#2DA1D7",
    },
  ];

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#8EC641]/5 via-white to-[#2DA1D7]/5 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 transition-colors duration-300">
      <div className="w-full max-w-5xl">
        
        
         
        <div className="text-center mb-12" data-aos="zoom-in">
          <div className="flex flex-col items-center space-y-4 mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-[#8EC641] to-[#6a9431] rounded-3xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform cursor-default">
              <i className="fas fa-heartbeat text-white text-3xl"></i>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white transition-colors tracking-tight uppercase">
                {t("SignUp.PageTitle")}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 transition-colors font-medium mt-2">
                {t("SignUp.PageSubtitle")}
              </p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
            {t("SignUp.MainHeader")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors leading-relaxed font-medium">
            {t("SignUp.MainDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {accountTypes.map((type) => (
            <div
              key={type.id}
              data-aos={type.id === "patient" ? "fade-right" : "fade-left"}
              data-aos-delay={type.id === "patient" ? "100" : "200"}
              className="h-full"
            >
              <div
                className={`group relative rounded-3xl border-4 p-8 cursor-pointer transition-all duration-500 shadow-sm hover:shadow-2xl h-full ${
                  selectedType === type.id
                    ? `border-[${type.brandHex}] bg-white dark:bg-gray-800 shadow-[${type.brandHex}]/20`
                    : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                }`}
                style={{
                  borderColor: selectedType === type.id ? type.brandHex : '',
                }}
                onClick={() => setSelectedType(type.id)}
              >
                {/* Active Checkmark Badge */}
                {selectedType === type.id && (
                  <div 
                    className="absolute -top-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800"
                    style={{ backgroundColor: type.brandHex }}
                  >
                    <i className="fas fa-check text-white text-lg"></i>
                  </div>
                )}

                <div className="flex flex-col items-center text-center h-full">
                  {/* Hero Icon for the Account Type */}
                  <div
                    className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 bg-gradient-to-br shadow-xl ${type.color} transform group-hover:scale-105 transition-transform duration-500`}
                  >
                    <i className={`${type.icon} text-white text-5xl`}></i>
                  </div>

                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 transition-colors uppercase tracking-tight">
                    {type.title}
                  </h3>
                  <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 transition-colors font-medium">
                    {type.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-4 text-left w-full mt-auto bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl">
                    {type.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <i 
                          className="fas fa-check-circle mr-4 text-xl"
                          style={{ color: type.brandHex }}
                        ></i>
                        <span className="text-gray-700 dark:text-gray-300 transition-colors font-bold text-sm uppercase tracking-wide">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Context Info Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 w-full transition-colors">
                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-tight">
                      <span className="text-gray-400">{t("SignUp.LabelBestFor")}</span>
                      <span style={{ color: type.brandHex }}>
                        {type.id === "patient"
                          ? t("SignUp.TargetIndividuals")
                          : t("SignUp.TargetProfessionals")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          data-aos="zoom-in"
          data-aos-delay="300"
        >
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-300 flex items-center justify-center min-w-[240px] shadow-sm"
          >
            <i className="fas fa-arrow-left mr-3"></i>
            {t("SignUp.BtnBack")}
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedType}
            className={`px-10 py-5 font-black uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center min-w-[240px] shadow-xl ${
              selectedType
                ? "bg-gradient-to-r from-[#8EC641] to-[#6a9431] text-white hover:scale-105 hover:shadow-[#8EC641]/20 active:scale-95"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            {t("SignUp.BtnContinue")}
            <i className="fas fa-arrow-right ml-3"></i>
          </button>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap justify-center gap-8 text-gray-500 dark:text-gray-400 transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-8 py-4 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm">
            {[
              { icon: 'fa-shield-alt', text: t("SignUp.InfoSecure") },
              { icon: 'fa-lock', text: t("SignUp.InfoHipaa") },
              { icon: 'fa-user-check', text: t("SignUp.InfoVerified") }
            ].map((info, i) => (
              <div key={i} className="flex items-center space-x-2">
                <i className={`fas ${info.icon} text-[#8EC641]`}></i>
                <span className="text-xs font-bold uppercase tracking-tighter">{info.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 max-w-lg mx-auto shadow-sm transition-all duration-300">
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              <i className="fas fa-info-circle text-[#2DA1D7] mr-3 text-lg"></i>
              <span className="font-medium">{t("SignUp.HelpText")}</span>{" "}
              <span className="font-black text-[#8EC641] uppercase tracking-tighter">
                {selectedType === "patient"
                  ? t("SignUp.HelpPatient")
                  : selectedType === "doctor"
                    ? t("SignUp.HelpDoctor")
                    : t("SignUp.HelpDefault")}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;