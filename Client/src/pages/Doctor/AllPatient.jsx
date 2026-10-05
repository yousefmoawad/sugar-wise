import React, { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Users, Building, ShoppingBag, 
  User, Bell, 
  ChevronRight, LogOut,
  ArrowLeft // Added for back button
} from "lucide-react";
import Navbar from "../../Components/Layouts/Navbar";
import Logout from "../Login/Logout";
import { useAuth } from "../../context/AuthContext";

const AllPatient = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Logic to check if we are on the Hub or a sub-page
  const isHub = location.pathname === "/doctor" || location.pathname === "/doctor/";

  const menuItems = [
    {
      id: "patients",
      label: t("SidebarDoctor.MenuPatients"),
      icon: Users,
      description: t("DoctorDashboard.WhatItDo.Patients") || "View and manage your patient records and health history.",
      path: "/doctor/my-patients",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-500/10"
    },
    {
      id: "clinic",
      label: t("SidebarDoctor.MenuClinic"),
      icon: Building,
      description: t("DoctorDashboard.WhatItDo.Clinic") || "Manage clinic hours, staff, and appointments.",
      path: "/doctor/my-clinic",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10"
    },
    {
      id: "orders",
      label: t("SidebarDoctor.MenuOrders"),
      icon: ShoppingBag,
      description: t("DoctorDashboard.WhatItDo.Orders") || "Track medical supply orders and prescriptions.",
      path: "/doctor/orders",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-500/10"
    },
    {
      id: "notifications",
      label: t("SidebarDoctor.MenuNotifications"),
      icon: Bell,
      description: t("DoctorDashboard.WhatItDo.Notifications") || "Check recent alerts and patient updates.",
      path: "/doctor/notifications",
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-500/10"
    },
    
    {
      id: "profile",
      label: t("SidebarDoctor.MenuProfile"),
      icon: User,
      description: t("DoctorDashboard.WhatItDo.Profile") || "Update your professional info and credentials.",
      path: "/profile-doctor",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-500/10"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] via-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-gray-950 dark:to-gray-900 font-sans transition-colors duration-300">
      {/* [DESIGN NOTE]: Doctor Hub with dominant Primary Blue theme for a professional clinical environment */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* --- BACK BUTTON: Only shows if NOT on Hub --- */}
            {!isHub && (
              <button 
                onClick={() => navigate("/doctor")}
                className="group flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-100 dark:hover:border-blue-900/50 transition-all duration-200 active:scale-90"
              >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            )}

            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
                {isHub ? t("DoctorDashboard.WelcomeTitle") : t("DoctorDashboard.DetailView")}
              </h1>
              <p className="text-base text-gray-500 dark:text-gray-400 font-medium mt-1">
                {isHub ? t("DoctorDashboard.WelcomeMsg") : t("DoctorDashboard.BackToHub")}
              </p>
            </div>
          </div>
          
          {isHub && (
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-95"
            >
              <LogOut size={20} />
              {t("SidebarDoctor.BtnLogout")}
            </button>
          )}
        </div>

        {/* Content Logic */}
        {isHub ? (
          /* 1. Grid of Cards (The Hub) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="group relative bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-[#2DA1D7]/10 hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
              >
                {/* [VISUAL DESIGN]: Subtle brand icon glow on hover */}
                <item.icon 
                  size={120} 
                  className="absolute -right-10 -bottom-10 text-gray-50 dark:text-gray-800/10 group-hover:text-[#2DA1D7]/5 transition-colors duration-500" 
                />

                <div className="relative z-10">
                  {/* [BRAND COLOR]: Primary Blue dominance for Doctor modules */}
                  <div className={`w-14 h-14 bg-[#2DA1D7]/10 text-[#2DA1D7] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-transparent group-hover:border-[#2DA1D7]/20`}>
                    <item.icon size={28} />
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                      {item.label}
                    </h3>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-[#2DA1D7] group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed font-semibold pr-8">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* 2. Sub-page Content (Outlet) */
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-10 animate-slide-up">
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

export default AllPatient;

