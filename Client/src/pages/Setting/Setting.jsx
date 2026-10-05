import React from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  Palette,
  Languages,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Layouts/Navbar";

/**
 * [COMPONENT]: Setting
 * Purpose: Main layout and navigation hub for account/app preferences.
 * Styling: Premium clinical brand look using Primary Blue (#2DA1D7) and Green (#8EC641).
 */
const Setting = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isHub =
    location.pathname.toLowerCase() === "/setting" ||
    location.pathname.toLowerCase() === "/setting/";

  /**
   * [DATA]: Module Configuration
   * Central list of setting sections with brand-consistent color tokens.
   */
  const settingModules = [
    {
      id: "edit-profile",
      label: t("profile_edit.title"),
      icon: User,
      description: t("My_Health.ProfileDesc"),
      path: "/Setting/profile",
      color: "text-[#8EC641]",
      bgColor: "bg-[#8EC641]/10 dark:bg-[#8EC641]/20",
      accent: "from-[#8EC641] to-[#6a9431]",
    },
    {
      id: "notifications",
      label: t("notifications.title"),
      icon: Bell,
      description: t("My_Health.NotifDesc"),
      path: "/Setting/notifications",
      color: "text-[#2DA1D7]",
      bgColor: "bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20",
      accent: "from-[#2DA1D7] to-[#1e7ca8]",
    },
    {
      id: "security",
      label: t("security.title"),
      icon: Shield,
      description: t("security.change_password"),
      path: "/Setting/security",
      color: "text-[#2DA1D7]",
      bgColor: "bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20",
      accent: "from-[#2DA1D7] to-[#1a5f7f]",
    },
    {
      id: "billing",
      label: t("billing.title"),
      icon: CreditCard,
      description: t("billing.payment_method"),
      path: "/Setting/billing",
      color: "text-[#8EC641]",
      bgColor: "bg-[#8EC641]/10 dark:bg-[#8EC641]/20",
      accent: "from-[#8EC641] to-[#4d6a23]",
    },
    {
      id: "themes",
      label: t("themes.title"),
      icon: Palette,
      description: t("themes.interface_theme_desc"),
      path: "/Setting/themes",
      color: "text-[#2DA1D7]",
      bgColor: "bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20",
      accent: "from-[#2DA1D7] to-[#1a5f7f]",
    },
    {
      id: "language",
      label: t("lang_title"),
      icon: Languages,
      description: t("lang_desc"),
      path: "/Setting/language",
      color: "text-[#8EC641]",
      bgColor: "bg-[#8EC641]/10 dark:bg-[#8EC641]/20",
      accent: "from-[#8EC641] to-[#6a9431]",
    },
    {
      id: "help",
      label: t("help.title"),
      icon: HelpCircle,
      description: t("help.email_us"),
      path: "/Setting/help",
      color: "text-gray-500",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      accent: "from-gray-400 to-gray-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-gray-950 dark:via-[#1a5f7f]/5 dark:to-[#4d6a23]/5 font-sans transition-colors duration-300">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        
        {/* HEADER: Dynamic context-aware title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            {!isHub && (
              <button
                onClick={() => navigate("/Setting")}
                className="w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-[#2DA1D7] hover:border-[#2DA1D7]/30 transition-all active:scale-95 group flex items-center justify-center"
              >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-2">
                {isHub ? t("settings.title") : t("settings.account_settings")}
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                {isHub
                  ? t("settings.account_settings_desc")
                  : t("My_Health.DetailSubtitle")}
              </p>
            </div>
          </div>
          
          {isHub && (
            <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md px-6 py-3 rounded-full border border-white dark:border-gray-800 shadow-sm flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#8EC641] animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">{t("profile_edit.status_live")}</span>
            </div>
          )}
        </div>

        {/* CONTENT AREA: Grid layout for hub, Outlet for child settings */}
        {isHub ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {settingModules.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="group relative bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-xl border border-gray-50 dark:border-gray-800 hover:shadow-2xl hover:shadow-[#2DA1D7]/10 hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden ring-1 ring-gray-100/50 dark:ring-gray-800/50"
              >
                {/* Large Background Decorative Icon */}
                <item.icon
                  size={140}
                  className="absolute -right-12 -bottom-12 text-gray-50 dark:text-gray-800/20 group-hover:text-[#2DA1D7]/10 transition-colors duration-700"
                />

                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 ${item.bgColor} ${item.color} rounded-[1.25rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}
                  >
                    <item.icon size={32} />
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                      {item.label}
                    </h3>
                    <ChevronRight
                      size={20}
                      className="text-gray-300 group-hover:text-[#2DA1D7] group-hover:translate-x-2 transition-all"
                    />
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed font-medium pr-6">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 min-h-[650px] p-8 md:p-14 relative overflow-hidden transition-all duration-500 ring-1 ring-gray-100/50 dark:ring-gray-800/50">
            {/* Ambient Background Glow for content container */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2DA1D7]/5 to-[#8EC641]/5 rounded-full blur-3xl pointer-events-none opacity-50"></div>
            
            <div className="relative z-10">
              <Outlet />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setting;