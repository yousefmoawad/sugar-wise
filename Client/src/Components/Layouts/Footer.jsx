import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Added for translation
import "../../styles/Footer.css";
import Logo_Cycle from "../../Images/BrandLogo/logo-cycle.png";
import Suger_Wise_Logo from "../../Images/BrandLogo/Suger_Wise_Logo.png";

const Footer = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const currentYear = new Date().getFullYear();

  const handleInternalLinkClick = (page) => {
    console.log(`Navigating to: ${page}`);
  };

  return (
    // Updated Gradient for Dark Mode consistency
    <footer className="bg-gradient-to-r from-[#8EC641] to-[#2DA1D7] dark:from-[#4d6a23] dark:to-[#1a5f7f] text-white mt-auto transition-colors duration-300">
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Part 1: Logo, Information & Social Media */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                <img src={Logo_Cycle} alt="Logo Cycle" className="h-15" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  <img 
                    src={Suger_Wise_Logo} 
                    alt="SugarWise" 
                    className="h-10 dark:brightness-0 dark:invert" 
                  />
                </h2>
                <p className="text-sm text-white/80 dark:text-green-100/70">
                  {t("Footer.Tagline")}
                </p>
              </div>
            </div>

            {/* Information about us */}
            <p className="text-white/90 dark:text-green-100/80 leading-relaxed">
              {t("Footer.Description")}
            </p>

            {/* Social Media Icons */}
            <div className="pt-4">
              <h3 className="font-bold mb-4 text-lg text-white">{t("Footer.ConnectTitle")}</h3>
              <div className="flex space-x-4">
                {[
                  { href: "https://www.facebook.com", icon: "fa-facebook-f", hover: "hover:bg-blue-600" },
                  { href: "https://www.instagram.com", icon: "fa-instagram", hover: "hover:bg-pink-600" },
                  { href: "https://www.linkedin.com", icon: "fa-linkedin-in", hover: "hover:bg-blue-800" },
                  { href: "https://twitter.com", icon: "fa-twitter", hover: "hover:bg-black" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-white/10 dark:bg-white/5 ${social.hover} w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/10`}
                  >
                    <i className={`fab ${social.icon} text-white`}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Part 2: Company */}
          <div>
            <h3 className="text-xl font-bold mb-6 pb-2 border-b border-white/20">
              {t("Footer.CompanyTitle")}
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/about", label: t("Footer.LinkAbout") },
                { to: "/mission", label: t("Footer.LinkMission") },
                { to: "/careers", label: t("Footer.LinkCareers") },
                { to: "/press", label: t("Footer.LinkPress") },
                { to: "/contact", label: t("Footer.LinkContact") },
                { to: "/Blog", label: t("Footer.LinkBlog") },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-white/80 dark:text-green-100/70 hover:text-white flex items-center transition-all duration-300 hover:pl-2 hover:font-medium"
                    onClick={() => handleInternalLinkClick(link.label)}
                  >
                    <i className="fas fa-chevron-right text-xs mr-2 opacity-70"></i>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Part 3: Resources */}
          <div>
            <h3 className="text-xl font-bold mb-6 pb-2 border-b border-white/20">
              {t("Footer.ResourcesTitle")}
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/resources/monitoring-tools", label: t("Footer.LinkMonitoring"), icon: "fa-chart-line" },
                { to: "/resources/educational-games", label: t("Footer.LinkGames"), icon: "fa-gamepad" },
                { to: "/resources/faq", label: t("Footer.LinkFaq"), icon: "fa-question-circle" },
                { to: "/download", label: t("Footer.LinkDownload"), icon: "fa-download" },
                { to: "/resources/injection-sites", label: t("Footer.LinkInjection"), icon: "fa-map-marker-alt" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-white/80 dark:text-green-100/70 hover:text-white flex items-center transition-all duration-300 hover:pl-2 hover:font-medium"
                    onClick={() => handleInternalLinkClick(link.label)}
                  >
                    <i className={`fas ${link.icon} text-sm mr-2 opacity-70`}></i>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Part 4: Legal */}
          <div>
            <h3 className="text-xl font-bold mb-6 pb-2 border-b border-white/20">
              {t("Footer.LegalTitle")}
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/legal/terms", label: t("Footer.LinkTerms"), icon: "fa-gavel" },
                { to: "/legal/privacy", label: t("Footer.LinkPrivacy"), icon: "fa-shield-alt" },
                { to: "/legal/medical-disclaimer", label: t("Footer.LinkDisclaimer"), icon: "fa-file-medical" },
                { to: "/legal/cookie-policy", label: t("Footer.LinkCookies"), icon: "fa-cookie" },
                { to: "/legal/compliance", label: t("Footer.LinkCompliance"), icon: "fa-balance-scale" },
                { to: "/legal/data-protection", label: t("Footer.LinkData"), icon: "fa-user-shield" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-white/80 dark:text-green-100/70 hover:text-white flex items-center transition-all duration-300 hover:pl-2 hover:font-medium"
                    onClick={() => handleInternalLinkClick(link.label)}
                  >
                    <i className={`fas ${link.icon} text-sm mr-2 opacity-70`}></i>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-black/20 dark:bg-black/40 py-6 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-white/90 dark:text-green-100/80 font-medium">
                &copy; {currentYear} {t("Footer.CopyrightText")}
              </p>
              <p className="text-white/70 dark:text-green-100/60 text-sm mt-1 opacity-75">
                {t("Footer.CopyrightNotice")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;