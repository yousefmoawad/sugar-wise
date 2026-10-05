import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next"; // Added for translation
import { userAPI } from '../../services/api';

const ForgotPassword = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const navigate = useNavigate();
  
  // State Management
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Data State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(30); // Countdown for OTP resend

  // Handle Timer for Step 2
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // --- Handlers ---

  // Step 1: Send Email
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!email || !email.includes('@')) {
      setError(t("ForgotPassword.ErrorEmail"));
      return;
    }

    setIsLoading(true);
    userAPI.sendResetOtp(email)
      .then(() => {
        setSuccessMessage('OTP sent successfully. Please check your email.');
        setStep(2);
        setTimer(30); // Reset timer
      })
      .catch((apiError) => {
        setError(
          apiError?.response?.data?.message ||
          apiError?.response?.data?.error ||
          'Failed to send OTP'
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (otp.length < 4) {
      setError(t("ForgotPassword.ErrorOtp"));
      return;
    }

    setIsLoading(true);
    userAPI.verifyResetOtp(email, otp)
      .then(() => {
        setSuccessMessage('OTP verified successfully.');
        setStep(3);
      })
      .catch((apiError) => {
        setError(
          apiError?.response?.data?.message ||
          apiError?.response?.data?.error ||
          'OTP is invalid or expired'
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Step 3: Reset Password
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword.length < 8) {
      setError(t("ForgotPassword.ErrorLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("ForgotPassword.ErrorMismatch"));
      return;
    }

    setIsLoading(true);
    userAPI.confirmResetPassword(email, otp, newPassword)
      .then(() => {
        setSuccessMessage('Password reset successfully.');
        setStep(4); // Success State
      })
      .catch((apiError) => {
        setError(
          apiError?.response?.data?.message ||
          apiError?.response?.data?.error ||
          'Failed to reset password'
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      await userAPI.sendResetOtp(email);
      setSuccessMessage('A new OTP was sent to your email.');
      setTimer(30);
    } catch (apiError) {
      setError(
        apiError?.response?.data?.message ||
        apiError?.response?.data?.error ||
        'Failed to resend OTP'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renders ---

  // Render Step 1: Email
  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
          <i className="fas fa-envelope text-blue-600 dark:text-blue-400 text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t("ForgotPassword.Step1Title")}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm transition-colors">
          {t("ForgotPassword.Step1Subtitle")}
        </p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">{t("ForgotPassword.EmailLabel")}</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 transition-colors">
              <i className="fas fa-at"></i>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              placeholder={t("ForgotPassword.EmailPlaceholder")}
              autoFocus
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#2DA1D7] hover:bg-[#2DA1D7]/90 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#2DA1D7]/20 transition-all duration-300 flex items-center justify-center disabled:opacity-70"
        >
          {isLoading ? (
            <span className="flex items-center">
              <i className="fas fa-circle-notch fa-spin mr-2"></i> {t("ForgotPassword.SendingBtn")}
            </span>
          ) : (
            t("ForgotPassword.SendBtn")
          )}
        </button>
      </form>
    </div>
  );

  // Render Step 2: OTP
  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
          <i className="fas fa-shield-alt text-teal-600 dark:text-teal-400 text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t("ForgotPassword.Step2Title")}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm transition-colors">
          {t("ForgotPassword.Step2Subtitle")} <span className="font-semibold text-gray-700 dark:text-gray-200">{email}</span>
        </p>
      </div>

      <form onSubmit={handleOtpSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">{t("ForgotPassword.OtpLabel")}</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            className="w-full text-center text-2xl tracking-widest py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors font-mono"
            placeholder="000000"
            maxLength="6"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition duration-300 flex items-center justify-center disabled:opacity-70"
        >
          {isLoading ? (
            <span className="flex items-center">
              <i className="fas fa-circle-notch fa-spin mr-2"></i> {t("ForgotPassword.VerifyingBtn")}
            </span>
          ) : (
            t("ForgotPassword.VerifyBtn")
          )}
        </button>

        <div className="text-center text-sm">
          <p className="text-gray-500 dark:text-gray-400 transition-colors">
            {t("ForgotPassword.ResendText")}{' '}
            {timer > 0 ? (
              <span className="text-gray-400 dark:text-gray-500">{t("ForgotPassword.ResendTimer")} {timer}s</span>
            ) : (
              <button 
                type="button" 
                onClick={handleResendOtp} 
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors"
              >
                {t("ForgotPassword.ResendLink")}
              </button>
            )}
          </p>
          <button 
            type="button" 
            onClick={() => setStep(1)} 
            className="mt-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xs transition-colors"
          >
            {t("ForgotPassword.WrongEmailBtn")}
          </button>
        </div>
      </form>
    </div>
  );

  // Render Step 3: New Password
  const renderStep3 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
          <i className="fas fa-lock text-blue-600 dark:text-blue-400 text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t("ForgotPassword.Step3Title")}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm transition-colors">
          {t("ForgotPassword.Step3Subtitle")}
        </p>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">{t("ForgotPassword.NewPasswordLabel")}</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 transition-colors">
              <i className="fas fa-key"></i>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">{t("ForgotPassword.ConfirmPasswordLabel")}</label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 transition-colors">
              <i className="fas fa-check-circle"></i>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                confirmPassword && newPassword !== confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="••••••••"
            />
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{t("ForgotPassword.ErrorMismatch")}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition duration-300 flex items-center justify-center disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center">
                <i className="fas fa-circle-notch fa-spin mr-2"></i> {t("ForgotPassword.ResettingBtn")}
              </span>
            ) : (
              t("ForgotPassword.ResetBtn")
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // Success View (Step 4)
  const renderSuccess = () => (
    <div className="text-center space-y-6 animate-fadeIn">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto transition-colors">
        <i className="fas fa-check text-green-500 dark:text-green-400 text-4xl"></i>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t("ForgotPassword.Step4Title")}</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2 transition-colors">
          {t("ForgotPassword.Step4Subtitle1")} <br />
          {t("ForgotPassword.Step4Subtitle2")}
        </p>
      </div>
      <button
        onClick={() => navigate('/login')}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-500 transition duration-300"
      >
        {t("ForgotPassword.BackToLoginBtn")}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F2F5] via-[#8EC641]/10 to-[#2DA1D7]/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-colors duration-300 font-sans">
      {/* [DESIGN NOTE]: Brand-consistent background with soft mixed gradient */}
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 relative overflow-hidden transition-colors duration-300 border border-transparent dark:border-gray-700">
        
        {/* Top Progress Bar */}
        {step < 4 && (
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-100 dark:bg-gray-700">
            <div 
              className="h-full bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] transition-all duration-700 ease-in-out shadow-sm"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        )}

        {/* Global Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center animate-pulse transition-colors">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm flex items-center transition-colors">
            <i className="fas fa-check-circle mr-2"></i>
            {successMessage}
          </div>
        )}

        {/* Render Logic */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderSuccess()}

        {/* Back to Login Link (Only show in steps 1-3) */}
        {step < 4 && (
          <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-700 pt-4 transition-colors">
            <Link to="/login" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm flex items-center justify-center transition-colors">
              <i className="fas fa-arrow-left mr-2"></i>
              {t("ForgotPassword.BackToLoginLink")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
