import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Trash2,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

/**
 * [COMPONENT]: SecuritySettings
 * Purpose: Handles password lifecycle and account termination securely.
 * Styling: Clean clinical aesthetic with Primary Blue (#2DA1D7) as the dominant theme.
 */
const SecuritySettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { deleteAccount, changePassword } = useAuth();
  const { addNotification } = useNotification();

  // View State Management
  const [currentView, setCurrentView] = useState("menu");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  // Form Field States
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deleteConfirmationPassword, setDeleteConfirmationPassword] =
    useState("");

  /**
   * [ACTION]: handlePasswordChange
   * Submits secure credentials update to the authentication context.
   */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage({ type: "error", text: t("security.all_fields_required") });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: t("security.passwords_mismatch") });
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      if (result.success) {
        addNotification(t("security.password_success"), "success");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setMessage({ type: "success", text: result.message });
        setTimeout(() => resetView(), 2000);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  /**
   * [ACTION]: handleDeleteAccount
   * Permanent removal of user data after credential confirmation.
   */
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deleteConfirmationPassword) {
      setMessage({ type: "error", text: t("security.confirm_delete_placeholder") });
      return;
    }

    try {
      const result = await deleteAccount(deleteConfirmationPassword);
      if (result.success) {
        addNotification(t("security.delete_success"), "success");
        navigate("/", { replace: true });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred during deletion." });
    }
  };

  const resetView = () => {
    setCurrentView("menu");
    setMessage({ type: "", text: "" });
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setDeleteConfirmationPassword("");
    setShowPassword(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
          {currentView !== "menu" && (
            <button
              onClick={resetView}
              className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-[#2DA1D7] transition-all"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-1">
              {currentView === "menu" && t("security.title")}
              {currentView === "change-password" && t("security.change_password")}
              {currentView === "delete-account" && t("security.delete_account")}
            </h1>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              {t("settings.security_subtitle") || "Protect your access and data."}
            </p>
          </div>
        </div>

        <div>
          {/* --- VIEW 1: SELECTION MENU --- */}
          {currentView === "menu" && (
            <div className="space-y-6">
              <button
                onClick={() => setCurrentView("change-password")}
                className="w-full flex items-center justify-between p-8 bg-white dark:bg-gray-800/50 rounded-[2rem] border-2 border-gray-50 dark:border-gray-800 hover:border-[#2DA1D7]/30 hover:shadow-2xl hover:shadow-[#2DA1D7]/5 transition-all group group text-left"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-[#2DA1D7]/10 text-[#2DA1D7] rounded-2xl flex items-center justify-center group-hover:bg-[#2DA1D7] group-hover:text-white transition-all shadow-inner">
                    <Lock size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">
                      {t("security.change_password")}
                    </h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                      {t("security.change_password_desc")}
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-300 group-hover:text-[#2DA1D7] group-hover:border-[#2DA1D7]/30 transition-all">
                  <i className="fas fa-arrow-right text-xs"></i>
                </div>
              </button>

              <button
                onClick={() => setCurrentView("delete-account")}
                className="w-full flex items-center justify-between p-8 bg-white dark:bg-gray-800/50 rounded-[2rem] border-2 border-gray-50 dark:border-gray-800 hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-500/5 transition-all group group text-left"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner">
                    <Trash2 size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">
                      {t("security.delete_account")}
                    </h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                      {t("security.delete_account_desc")}
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-300 group-hover:text-red-500 group-hover:border-red-500/30 transition-all">
                  <i className="fas fa-arrow-right text-xs"></i>
                </div>
              </button>
            </div>
          )}

          {/* --- VIEW 2: PASSWORD FORM --- */}
          {currentView === "change-password" && (
            <form onSubmit={handlePasswordChange} className="space-y-8 animate-slide-up">
              {message.text && (
                <div className={`p-6 rounded-3xl flex items-start gap-4 border-2 ${
                  message.type === "success" 
                  ? "bg-[#8EC641]/5 border-[#8EC641]/20 text-[#8EC641]" 
                  : "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-600"
                }`}>
                  <div className="mt-0.5">
                    {message.type === "success" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <p className="text-lg font-bold">{message.text}</p>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                  {t("security.old_password")}
                </label>
                <div className="relative">
                  <i className="fas fa-key absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full py-5 pl-16 pr-16 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-[#2DA1D7]/30 focus:ring-8 focus:ring-[#2DA1D7]/5 rounded-[2rem] text-gray-900 dark:text-white font-bold outline-none transition-all placeholder-gray-300"
                    placeholder={t("security.old_password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#2DA1D7] transition-colors"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                  {t("security.new_password")}
                </label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full py-5 pl-16 pr-6 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-[#2DA1D7]/30 focus:ring-8 focus:ring-[#2DA1D7]/5 rounded-[2rem] text-gray-900 dark:text-white font-bold outline-none transition-all placeholder-gray-300"
                    placeholder={t("security.new_password")}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                  {t("security.confirm_password")}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className={`w-full py-5 px-8 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-[2rem] font-bold outline-none transition-all placeholder-gray-300 ${
                    passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                      ? "border-red-200 text-red-600 focus:ring-8 focus:ring-red-50"
                      : "border-transparent focus:border-[#2DA1D7]/30 focus:ring-8 focus:ring-[#2DA1D7]/5 text-gray-900 dark:text-white"
                  }`}
                  placeholder={t("security.confirm_password")}
                />
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-sm text-red-500 font-bold px-4">{t("security.passwords_mismatch")}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#2DA1D7] to-[#1e7ca8] text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#2DA1D7]/30 hover:shadow-[#2DA1D7]/50 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {loading ? t("DRView.Loading") : t("security.update_password")}
              </button>
            </form>
          )}

          {/* --- VIEW 3: ACCOUNT DELETION --- */}
          {currentView === "delete-account" && (
            <div className="space-y-8 animate-slide-up">
              <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/30 rounded-[2.5rem] p-10 text-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <AlertTriangle size={40} />
                </div>
                <h3 className="text-2xl font-black text-red-600 uppercase tracking-tight mb-4">
                  {t("security.are_you_sure")}
                </h3>
                <p className="text-lg text-red-600/80 dark:text-red-300 font-medium leading-relaxed">
                  {t("security.delete_warning")}
                </p>
              </div>

              <form onSubmit={handleDeleteAccount} className="space-y-6">
                <div>
                  <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 mb-3 block">
                    {t("security.confirm_delete_placeholder")}
                  </label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"></i>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={deleteConfirmationPassword}
                      onChange={(e) => setDeleteConfirmationPassword(e.target.value)}
                      className="w-full py-5 pl-16 pr-16 bg-white dark:bg-gray-800 border-2 border-red-100 dark:border-red-900/30 focus:border-red-600 focus:ring-8 focus:ring-red-50 dark:focus:ring-red-900/10 rounded-[2rem] text-gray-900 dark:text-white font-bold outline-none transition-all placeholder-gray-300"
                      placeholder={t("security.confirm_delete_placeholder")}
                    />
                  </div>
                </div>

                {message.type === "error" && (
                  <p className="text-lg text-red-600 font-bold text-center animate-shake">
                    {message.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!deleteConfirmationPassword}
                  className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all ${
                    deleteConfirmationPassword
                      ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200 transform active:scale-95"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {t("security.delete_my_account")}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
