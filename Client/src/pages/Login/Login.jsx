import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo_Cycle from "../../Images/BrandLogo/logo-cycle.png";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next"; // Added for translation
import { useAuth } from "../../context/AuthContext";
import {
  consumePendingAddToCart,
  consumePendingCheckout,
} from "../../utils/pendingCart";

const LoginPage = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const normalizeRole = (role) => {
    const value = String(role || "")
      .trim()
      .toLowerCase();
    if (
      value === "super admin" ||
      value === "superadmin" ||
      value === "subadmin"
    )
      return "superadmin";
    if (value === "admin") return "admin";
    if (value === "doctor") return "doctor";
    if (value === "patient") return "patient";
    return "guest";
  };

  const getRedirectByRole = (role) => {
    const normalized = normalizeRole(role);
    if (normalized === "admin" || normalized === "superadmin") return "/admin";
    if (normalized === "doctor") return "/doctor";
    if (normalized === "patient") return "/my-health";
    return "/";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    login(email, password)
      .then((result) => {
        if (!result.success) {
          setErrorMessage(result.message || "Login failed");
          return;
        }
        const pendingCheckout = consumePendingCheckout();
        if (pendingCheckout?.returnPath) {
          navigate(pendingCheckout.returnPath, {
            replace: true,
            state: pendingCheckout.state || {},
          });
          return;
        }
        const pending = consumePendingAddToCart();
        if (pending?.returnPath && pending?.product) {
          navigate(pending.returnPath, {
            replace: true,
            state: { postLoginAddToCart: pending.product },
          });
          return;
        }
        const from = location.state?.from;
        const fromPath = from ? `${from.pathname}${from.search || ""}` : null;
        navigate(fromPath || getRedirectByRole(result.user?.role), {
          replace: true,
        });
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F2F5] via-[#8EC641]/5 to-[#2DA1D7]/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-colors duration-300 font-sans">
      {/* [DESIGN NOTE]: Brand-consistent background with soft mixed gradient */}
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-10" data-aos="fade-down">
          <div className="w-24 h-24 bg-white dark:bg-gray-800 border-4 border-[#8EC641]/20 p-1.5 text-center rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 transition-all transform hover:rotate-3">
            <img
              src={Logo_Cycle}
              alt="SugarWise"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white transition-colors tracking-tight uppercase">
            {t("LoginPage.Title")}
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-3 transition-colors font-medium max-w-xs mx-auto leading-relaxed">
            {t("LoginPage.Subtitle")}
          </p>
        </div>

        {/* Login Form Card */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-300 border border-transparent dark:border-gray-700"
          data-aos="fade-up"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                {t("LoginPage.EmailLabel")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <i className="fas fa-envelope text-gray-400 dark:text-gray-500"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                  placeholder={t("LoginPage.EmailPlaceholder")}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                {t("LoginPage.PasswordLabel")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <i className="fas fa-lock text-gray-400 dark:text-gray-500"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#8EC641]/10 focus:border-[#8EC641] bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium text-base"
                  placeholder={t("LoginPage.PasswordPlaceholder")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    } text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-[#2DA1D7] hover:text-[#2DA1D7]/80 dark:text-[#2DA1D7]/60 font-bold transition-colors uppercase tracking-tight"
              >
                {t("LoginPage.ForgotPasswordLink")}
              </Link>
            </div>

            {/* Submit Button */}
            {/* [BRAND ACTION]: Primary Blue for main CTA button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#2DA1D7] hover:bg-[#2DA1D7]/90 text-white font-black py-4 px-4 rounded-2xl transition-all duration-300 shadow-xl shadow-[#2DA1D7]/20 hover:shadow-2xl hover:-translate-y-0.5 uppercase tracking-widest text-base"
            >
              {submitting ? "Processing..." : t("LoginPage.SubmitBtn")}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-700 transition-colors"></div>
            <span className="px-3 text-gray-500 dark:text-gray-400 text-sm transition-colors">
              {t("LoginPage.DividerText")}
            </span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-700 transition-colors"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 transition-colors">
              {t("LoginPage.NoAccountText")}{" "}
              <Link
                to="/register"
                className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 transition-colors"
              >
                {t("LoginPage.SignUpLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
