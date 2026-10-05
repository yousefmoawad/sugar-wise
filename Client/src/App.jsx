import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./styles/App.css";

// AI Chat
import AIChat from "./pages/AIChat/AIChat";

// --- IMPORT PROVIDERS ---
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext"; // ✅ Added Auth Provider
import { NotificationProvider } from "./context/NotificationContext";
import { useNotification } from "./context/NotificationContext";
import useNotifications from "./hooks/useNotifications";
import useDiabetesMonitorings from "./hooks/useDiabetesMonitorings";
import usePresence from "./hooks/usePresence";
import Downloads from "./pages/Downloads/DownloadApp"
import I18n from "./context/i18n";
import { useTranslation } from "react-i18next";

// Errors Page
import Error404 from "./pages/Error404/error404";

// Loading Page
import Loading from "./pages/Loading/Loading";

//Navbar
import Home from "./pages/Home/Home";
import AboutUs from "./pages/AboutUs/AboutUs";
import ContactUs from "./pages/ContactUs/ContactUs";
import Blog from "./pages/Blog/Blog";
import ForDoctors from "./pages/Blog/ForDoctors";
import ForPatients from "./pages/Blog/ForPatient";
import InsulinUnit from "./pages/InsulinUnits/Insulin_Units";
import TopDoctors from "./pages/TopDoctors/TopDoctors";
import DRView from "./pages/TopDoctors/DRView";
import Messages from "./pages/Messages/Messages";

// Register
import Login from "./pages/Login/Login";
import SignUp from "./pages/Register/SignUp";
import ForgotPassword from "./pages/Login/ForgetPassword";

// Create Patient Profile
import CreatePatientProfileContainer from "./pages/Register/CreatePatientProfile/CreatePatientProfileContainer";
import Step1PersonalDetailsPatient from "./pages/Register/CreatePatientProfile/Step1PersonalDetailsPatient";
import Step2AccountDetailsPatient from "./pages/Register/CreatePatientProfile/Step2AccountDetailsPatient";
import Step3AddressingDetailsPatient from "./pages/Register/CreatePatientProfile/Step3AddressingDetailsPatient";
import Step4HealthDetailsPatient from "./pages/Register/CreatePatientProfile/Step4HealthDetailsPatient";

// Create Doctor Profile
import CreateProfileDoctorContainer from "./pages/Register/CreateDoctorProfile/CreateProfileDoctorContainer";
import Step1PersonalDetailsDoctor from "./pages/Register/CreateDoctorProfile/Step1PersonalDetailsDoctor";
import Step2AccountDetailsDoctor from "./pages/Register/CreateDoctorProfile/Step2AccountDetailsDoctor";
import Step3ProfessionalDetailsDoctor from "./pages/Register/CreateDoctorProfile/Step3ProfessionalDetailsDoctor";
import Step4ProfessionalDetailsDoctor from "./pages/Register/CreateDoctorProfile/Step4ProfessionalDetailsDoctor";

// Shop
import Shop from "./pages/Shop/Shop";
import Cart from "./pages/Shop/Cart";
import ProductDetails from "./pages/Shop/ProductDetails";
import Payment from "./pages/Shop/Payment";
import MyOrders from "./pages/Shop/MyOrder";

// Footer
import Mission from "./pages/Resources/Mission";
import Careers from "./pages/Resources/Careers";
import Press from "./pages/Resources/Press";
import MonitoringTools from "./pages/Resources/Monitoring-tools";
import EducationalGames from "./pages/Resources/EducationalGames";
import FAQ from "./pages/Resources/FAQ";
import Terms from "./pages/Legal/Terms";
import Privacy from "./pages/Legal/Privacy";
import MedicalDisclaimer from "./pages/Legal/MedicalDisclaimer";
import CookiePolicy from "./pages/Legal/CookiePolicy";
import Compliance from "./pages/Legal/Compliance";
import DataProtection from "./pages/Legal/DataProtection";
import InjectionSites from "./pages/Resources/injection-sites";

// Doctor Pages
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import EditDoctorProfile from "./pages/Doctor/EditDoctorProfile";
import AllPatient from "./pages/Doctor/AllPatient";
import MyPatient from "./pages/Doctor/MyPatient";
import MyClinic from "./pages/Doctor/MyClinic";
import NotificationDoctor from "./pages/Doctor/NotificationDoctor";

// patient Pages
import PatientProfile from "./pages/Patient/PatientProfile";
import EditPatientProfile from "./pages/Patient/EditPatientProfile";
import NotificationPatient from "./pages/Patient/NotificationPatient";
import MyHealth from "./pages/Patient/MyHealth";
import DiabetesMonitoring from "./pages/Patient/DiabetesMonitoring";
import MyDoctor from "./pages/Patient/MyDoctors";
import LabTest from "./pages/Patient/LabTest";
import DietarySystems from "./pages/Patient/DietarySystems";

// Setting
import Setting from "./pages/Setting/Setting";
import ProfileEdit from "./pages/Setting/ProfileEdit";
import NotificationSettings from "./pages/Setting/NotificationSettings";
import SecuritySettings from "./pages/Setting/SecuritySettings";
import BillingSettings from "./pages/Setting/BillingSettings";
import HelpSettings from "./pages/Setting/HelpSettings";
import Themes from "./pages/Setting/Themes";
import Language from "./pages/Setting/Language";
import Features from "./pages/HowItWork/features";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UsersDashboard from "./pages/Admin/UsersDashboard";
import ShopProductsDashboard from "./pages/Admin/ShopProductsDashboard";
import InsulinUnitsDashboard from "./pages/Admin/InsulinUnits.Dashboard";
import CheckDoctorDashboard from "./pages/Admin/CheckDoctorDashboard";
import PromoCode from "./pages/Admin/PromoCode";
import SellingDashboard from "./pages/Admin/SellingDashboard";

import ScrollToTop from "./Components/Layouts/ScrollToTop";
import ProtectedRoute from "./Components/auth/ProtectedRoute";

// --- مكون المهام الدورية (إشعار كل ساعة) ---
const GlobalBackgroundTasks = () => {
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotification();
  const { createItem: persistNotification } = useNotifications();
  const { fetchAll: syncHealthData } = useDiabetesMonitorings(); // لجلب ورفع أحدث البيانات
  const { t } = useTranslation();

  // Enable presence tracking for all authenticated users
  // This sends periodic heartbeats to update online status (every 5 minutes)
  usePresence(300000, isAuthenticated);

  useEffect(() => {
    // يعمل فقط إذا كان المستخدم مريضاً ومسجل دخول
    if (!isAuthenticated || user?.role !== "Patient") return;

    const performHourlySync = async () => {
      const title = t("Notifications.HourlyTitle") || "Glucose Check Reminder";
      const message = t("Notifications.HourlyMessage") || "It's time to log your glucose reading for this hour.";

      // 1. إظهار إشعار Toast في الواجهة
      addNotification(message, "info");

      // 2. حفظ الإشعار في قاعدة البيانات ليظهر في صفحة NotificationPatient
      try {
        // تفعيل "رفع التحاليل" برمجياً عبر الـ API
        await syncHealthData(); 
        console.log("Hourly analysis sync completed.");

        await persistNotification({
          type: "alert",
          title: title,
          message: message,
        });
      } catch (err) {
        console.error("Failed to save hourly reminder", err);
      }
    };

    // ضبط العداد (كل ساعة = 3600000 مللي ثانية)
    // للتجربة السريعة يمكنك تغيير الرقم إلى 60000 (دقيقة واحدة)
    const intervalId = setInterval(performHourlySync, 3600000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, user, addNotification, persistNotification, syncHealthData, t]);

  return null;
};

function App() {
  return (
    // --- WRAP EVERYTHING WITH PROVIDERS ---
    <ThemeProvider>
      <NotificationProvider>
      <AuthProvider>
        <GlobalBackgroundTasks />
        <Router>
          <ScrollToTop />
          <Loading />
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Routes>
            {/* Navbar */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route
              path="/blog/doctors"
              element={(
                <ProtectedRoute allowedRoles={["Doctor", "Admin", "Super Admin"]}>
                  <ForDoctors />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/blog/patients"
              element={(
                <ProtectedRoute allowedRoles={["Patient", "Admin", "Super Admin"]}>
                  <ForPatients />
                </ProtectedRoute>
              )}
            />
            <Route path="/download" element={<Downloads />} />
            <Route path="/top-doctors" element={<TopDoctors />} />
            <Route path="/doctor-view/:id" element={<DRView />} />
            <Route
              path="/messages"
              element={(
                <ProtectedRoute allowedRoles={["Patient", "Doctor", "Admin", "Super Admin"]}>
                  <Messages />
                </ProtectedRoute>
              )}
            />
            <Route path="/features" element={<Features />} />

            {/* Shop */}
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/orders" element={<MyOrders />} />

            {/* Register */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/insulin_units" element={<InsulinUnit />} />

            {/* Create Patient profile */}
            <Route
              path="/create-profile-patient"
              element={<CreatePatientProfileContainer />}
            >
              {/* Automatically redirect from parent path to step 1 */}
              <Route index element={<Navigate to="step1" replace />} />

              <Route path="step1" element={<Step1PersonalDetailsPatient />} />
              <Route path="step2" element={<Step2AccountDetailsPatient />} />
              <Route path="step3" element={<Step3AddressingDetailsPatient />} />
              <Route path="step4" element={<Step4HealthDetailsPatient />} />
            </Route>

            {/* Create Doctor Profile */}
            <Route
              path="/create-profile-doctor"
              element={<CreateProfileDoctorContainer />}
            >
              {/* Redirect base path to step 1 */}
              <Route index element={<Navigate to="step1" replace />} />

              <Route path="step1" element={<Step1PersonalDetailsDoctor />} />
              <Route path="step2" element={<Step2AccountDetailsDoctor />} />
              <Route
                path="step3"
                element={<Step3ProfessionalDetailsDoctor />}
              />
              <Route
                path="step4"
                element={<Step4ProfessionalDetailsDoctor />}
              />
            </Route>

            {/* Logout */}
            <Route path="/logout" element={<Navigate to="/" replace />} />

            {/* Doctor Pages */}
            <Route
              path="/profile-doctor"
              element={(
                <ProtectedRoute allowedRoles={["Doctor", "Admin", "Super Admin"]}>
                  <DoctorProfile />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/edit-doctor-profile"
              element={(
                <ProtectedRoute allowedRoles={["Doctor", "Admin", "Super Admin"]}>
                  <EditDoctorProfile />
                </ProtectedRoute>
              )}
            />

            {/* New Nested Doctor Dashboard */}
            <Route
              path="/doctor"
              element={(
                <ProtectedRoute allowedRoles={["Doctor", "Admin", "Super Admin"]}>
                  <AllPatient />
                </ProtectedRoute>
              )}
            >
              <Route index element={<Navigate to="my-patients" replace />} />
              <Route path="my-patients" element={<MyPatient />} />
              <Route path="my-clinic" element={<MyClinic />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="notifications" element={<NotificationDoctor />} />
            </Route>

            {/* Patient Pages */}
            <Route path="/profile-patient" element={<PatientProfile />} />
            <Route path="/profile-patient/:id" element={<PatientProfile />} />
            <Route
              path="/edit-patient-profile"
              element={<EditPatientProfile />}
            />
            <Route
              path="/notifications-patient"
              element={<NotificationPatient />}
            />
            <Route path="/my-health" element={<MyHealth />}>
              <Route path="monitoring" element={<DiabetesMonitoring />} />
              <Route path="lab-test" element={<LabTest />} />
              <Route path="my-doctors" element={<MyDoctor />} />
              <Route path="dietary" element={<DietarySystems />} />
              <Route path="orders" element={<MyOrders />} />
            </Route>
            {/* Setting */}
            {/* Setting */}
            <Route path="/Setting" element={<Setting />}>
              <Route path="profile" element={<ProfileEdit />} />
              <Route path="notifications" element={<NotificationSettings />} />
              <Route path="security" element={<SecuritySettings />} />
              <Route path="billing" element={<BillingSettings />} />
              <Route path="help" element={<HelpSettings />} />
              <Route path="themes" element={<Themes />} />
              <Route path="language" element={<Language />} />
            </Route>

            {/* Footer */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<Press />} />
            <Route
              path="/resources/monitoring-tools"
              element={<MonitoringTools />}
            />
            <Route
              path="/resources/educational-games"
              element={<EducationalGames />}
            />
            <Route path="/resources/faq" element={<FAQ />} />
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/privacy" element={<Privacy />} />
            <Route
              path="/legal/medical-disclaimer"
              element={<MedicalDisclaimer />}
            />
            <Route path="/legal/cookie-policy" element={<CookiePolicy />} />
            <Route path="/legal/compliance" element={<Compliance />} />
            <Route path="/legal/data-protection" element={<DataProtection />} />
            <Route
              path="/resources/injection-sites"
              element={<InjectionSites />}
            />
            {/* Admin Pages */}
            <Route
              path="/admin"
              element={(
                <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              )}
            >
              <Route
                index
                element={<Navigate to="users-dashboard" replace />}
              />
              <Route path="users-dashboard" element={<UsersDashboard />} />
              <Route
                path="shop-products-dashboard"
                element={<ShopProductsDashboard />}
              />
              <Route
                path="insulin-units-dashboard"
                element={<InsulinUnitsDashboard />}
              />
              <Route
                path="check-doctor-dashboard"
                element={<CheckDoctorDashboard />}
              />
              <Route path="promo-code" element={<PromoCode />} />
              <Route path="selling-dashboard" element={<SellingDashboard />} />
            </Route>

            {/* translate */}
            <Route path="/i18n" element={<I18n />} />

            {/* Error Page */}
            <Route path="*" element={<Error404 />} />
          </Routes>
        </div>
        <AIChat />
      </Router>
      </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
