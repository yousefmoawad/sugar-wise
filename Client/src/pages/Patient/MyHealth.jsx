import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  User, Activity, FileText, Stethoscope, 
  ShoppingBag, LogOut, Utensils, Bell, 
  ChevronRight, 
  ArrowLeft // 1. Added ArrowLeft
} from "lucide-react";
import Logout from "../Login/Logout";
import Navbar from "../../Components/Layouts/Navbar";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

const MyHealth = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHub = location.pathname === "/my-health" || location.pathname === "/my-health/";

  const healthModules = [
    { 
      id: "profile", 
      label: t("SidebarPatient.MenuProfile"), 
      icon: User, 
      path: "/profile-patient",
      desc: t("My_Health.ProfileDesc"),
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-500/10"
    },
    { 
      id: "monitoring", 
      label: t("SidebarPatient.MenuMonitoring"), 
      icon: Activity, 
      path: "/my-health/monitoring",
      desc: t("My_Health.MonitoringDesc"),
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10"
    },
    { 
      id: "lab", 
      label: t("SidebarPatient.MenuLab"), 
      icon: FileText, 
      path: "/my-health/lab-test",
      desc: t("My_Health.LabDesc"),
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-500/10"
    },
    { 
      id: "doctor", 
      label: t("SidebarPatient.MenuDoctor"), 
      icon: Stethoscope, 
      path: "/my-health/my-doctors",
      desc: t("My_Health.DoctorDesc"),
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-500/10"
    },
    { 
      id: "diet", 
      label: t("SidebarPatient.MenuDiet"), 
      icon: Utensils, 
      path: "/my-health/dietary",
      desc: t("My_Health.DietDesc"),
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-500/10"
    },
    { 
      id: "orders", 
      label: t("SidebarPatient.MenuOrders"), 
      icon: ShoppingBag, 
      path: "/my-health/orders",
      desc: t("My_Health.OrdersDesc"),
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-500/10"
    },
    { 
      id: "notifications", 
      label: t("SidebarPatient.MenuNotifications"), 
      icon: Bell, 
      path: "/notifications-patient",
      desc: t("My_Health.NotifDesc"),
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-500/10"
    },
  ];

  // [DESIGN NOTE]: Unified Brand Gradient Background - Flowing from white to soft Brand Green/Blue
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#8EC641]/5 to-[#2DA1D7]/5 dark:from-gray-950 dark:via-[#4d6a23]/10 dark:to-[#1a5f7f]/10 font-sans transition-colors duration-300">
      
      <Navbar onLogoutClick={() => setShowLogoutConfirm(true)} />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* --- Header Section with Back Button --- */}
        <div className="mb-10 flex items-center gap-4 animate-fade-in">
          {/* 2. Conditional Back Button */}
          {!isHub && (
            <button 
              onClick={() => navigate("/my-health")}
              className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all hover:scale-105 active:scale-95 group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}

          <div>
            {/* [TYPOGRAPHY]: Professional weighting for primary page headings */}
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight mb-1">
              {isHub ? t("My_Health.HubTitle") : t("My_Health.ConfigTitle")}
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400 font-medium tracking-tight">
              {isHub ? t("My_Health.HubSubtitle") : t("My_Health.DetailSubtitle")}
            </p>
          </div>
        </div>

        {/* --- Logic: Show Grid Hub OR Sub-page Content --- */}
        {isHub ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {healthModules.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="group relative bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-[#8EC641]/10 hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
              >
                {/* [HOVER DESIGN]: Soft green Glow effect for Eye-friendly interaction */}
                <item.icon 
                  size={120} 
                  className="absolute -right-10 -bottom-10 text-gray-50 dark:text-gray-800/10 group-hover:text-[#8EC641]/5 transition-colors duration-500" 
                />

                <div className="relative z-10">
                  {/* [BRAND COLOR]: Prioritizing Green for module icons to ensure eye-friendly contrast */}
                  <div className={`w-14 h-14 bg-[#8EC641]/10 text-[#8EC641] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-transparent group-hover:border-[#8EC641]/20`}>
                    <item.icon size={28} />
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                      {item.label}
                    </h3>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-[#8EC641] group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed font-medium pr-8">
                    {item.desc}
                  </p>
                </div>
              </button>
            ))}

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="group relative bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-red-100 dark:border-red-900/30 hover:bg-red-50/30 dark:hover:bg-red-900/10 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 text-left overflow-hidden"
            >
              <LogOut size={120} className="absolute -right-10 -bottom-10 text-red-50 dark:text-red-900/5 opacity-40 transition-colors" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <LogOut size={28} />
                </div>
                <h3 className="text-xl font-bold text-red-600 dark:text-red-500 mb-2">
                  {t("SidebarPatient.BtnLogout")}
                </h3>
                <p className="text-red-400 dark:text-red-900/60 text-sm leading-relaxed font-medium">
                  {t("My_Health.LogoutDesc") || "End your current session securely."}
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 min-h-[500px] p-6 md:p-12 animate-slide-up">
            <Outlet context={{ t }} />
          </div>
        )}
      </div>

      {showLogoutConfirm && (
        <Logout
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            logout();
            navigate("/");
          }}
        />
      )}
    </div>
  );
};

export default MyHealth;

