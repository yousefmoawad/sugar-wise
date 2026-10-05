import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Layouts/Navbar";
import Logout from "../Login/Logout";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  ShoppingBag,
  Syringe,
  UserCheck,
  LogOut,
  TicketPercent,
  ArrowLeft,
  ArrowRight,
  TrendingUp, // Added icon for Selling Dashboard
} from "lucide-react";

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isHubVisible =
    location.pathname === "/admin" || location.pathname === "/admin/";
  const isRtl = i18n.language === "ar";

  const menuItems = [
    {
      id: "users",
      label: t("SidebarAdmin.MenuUsers") || "Users Management",
      description:
        t("AdminDashboard.DescUsers") ||
        "Manage user accounts, permissions, and profiles.",
      icon: Users,
      path: "/admin/users-dashboard",
      color: "text-[#2DA1D7]",
      bgColor: "bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20",
    },
    {
      id: "selling",
      label: "Selling Analytics",
      description: "Track sales performance, revenue, and order trends.",
      icon: TrendingUp,
      path: "/admin/selling-dashboard",
      color: "text-[#8EC641]",
      bgColor: "bg-[#8EC641]/10 dark:bg-[#8EC641]/20",
    },
    {
      id: "products",
      label: t("SidebarAdmin.MenuProducts") || "Shop Products",
      description:
        t("AdminDashboard.DescProducts") ||
        "Add, edit, or remove products from the medical shop.",
      icon: ShoppingBag,
      path: "/admin/shop-products-dashboard",
      color: "text-[#2DA1D7]",
      bgColor: "bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20",
    },
    {
      id: "insulin",
      label: t("SidebarAdmin.MenuInsulin") || "Insulin Units",
      description:
        t("AdminDashboard.DescInsulin") ||
        "Configure insulin types and dosage measurement units.",
      icon: Syringe,
      path: "/admin/insulin-units-dashboard",
      color: "text-[#8EC641]",
      bgColor: "bg-[#8EC641]/10 dark:bg-[#8EC641]/20",
    },
    {
      id: "checkDoctor",
      label: t("SidebarAdmin.MenuCheckDoctor") || "Verify Doctors",
      description:
        t("AdminDashboard.DescCheckDoctor") ||
        "Review and approve medical professional certifications.",
      icon: UserCheck,
      path: "/admin/check-doctor-dashboard",
      color: "text-[#2DA1D7]",
      bgColor: "bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20",
    },
    {
      id: "promo",
      label: "Promo Codes",
      description:
        t("AdminDashboard.DescPromo") ||
        "Create and manage discount codes for the store.",
      icon: TicketPercent,
      path: "/admin/promo-code",
      color: "text-[#8EC641]",
      bgColor: "bg-[#8EC641]/10 dark:bg-[#8EC641]/20",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-white via-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-gray-950 dark:via-[#1a5f7f]/10 dark:to-[#4d6a23]/10 flex flex-col font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Navbar />

      <main
        className={`mx-auto w-full flex-grow transition-all duration-300 ${location.pathname.includes("selling-dashboard") ? "max-w-[100%] px-4 sm:px-12 pb-12 pt-4" : "max-w-7xl p-6 md:p-12"}`}
      >
        {isHubVisible ? (
          <div className="animate-fade-in px-4">
            {/* [ADMIN HUB HEADER]: Centered layout with upscaled typography for a premium feel */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 mt-4 gap-6">
              <div>
                <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                  {t("AdminDashboard.WelcomeTitle") || "Admin Control "}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-2xl max-w-2xl leading-relaxed">
                  {t("AdminDashboard.WelcomeSubtitle") ||
                    "Welcome back! Manage your medical system modules below."}
                </p>
              </div>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-red-500 border border-red-100 dark:border-red-900/30 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-bold shadow-sm active:scale-95"
              >
                <LogOut size={20} />
                <span>{t("SidebarAdmin.BtnLogout") || "Sign Out"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="group bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden flex flex-col items-start"
                >
                  <div
                    className={`${item.bgColor} ${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                  >
                    <item.icon size={32} />
                  </div>

                  {/* [MODULE CARD]: Optimized for high-resolution screens with upscaled padding and text */}
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                    {item.label}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-10 flex-grow">
                    {item.description}
                  </p>

                  <div className="flex items-center text-[#2DA1D7] dark:text-[#2DA1D7] font-black text-base uppercase tracking-widest group-hover:underline decoration-2 underline-offset-8">
                    {t("AdminDashboard.OpenModule") || "Manage Module"}
                    <ArrowRight
                      size={20}
                      className={`ml-2 transition-transform group-hover:translate-x-2 ${isRtl ? "rotate-180 mr-2 ml-0 group-hover:-translate-x-2" : ""}`}
                    />
                  </div>

                  <div
                    className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-5 ${item.bgColor}`}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* [NAVIGATION]: Slightly upscaled 'Back to Hub' transition with brand interaction */}
            <button
              onClick={() => navigate("/admin")}
              className="group mb-8 flex items-center gap-4 text-gray-600 dark:text-gray-400 font-bold hover:text-[#2DA1D7] dark:hover:text-[#2DA1D7] transition-all transform hover:-translate-x-1"
            >
              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md group-hover:shadow-lg transition-all border border-[#2DA1D7]/10">
                <ArrowLeft size={22} className={isRtl ? "rotate-180" : ""} />
              </div>
              <span className="text-xl">
                {t("AdminDashboard.BackToHub") || "Return to Admin Hub"}
              </span>
            </button>

            <div
              className={`transition-all duration-300 ${
                location.pathname.includes("selling-dashboard")
                  ? "w-full"
                  : "bg-white dark:bg-gray-800 rounded-[2.5rem] p-4 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[60vh]"
              }`}
            >
              <Outlet />
            </div>
          </div>
        )}
      </main>

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

export default AdminDashboard;


