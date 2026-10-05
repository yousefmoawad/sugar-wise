import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next"; // Added for translation
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import WeeklyProgressChart from './Diagram'; // Ensure this path is correct

const PatientDashboard = () => {
  const { t } = useTranslation(); // Initialize translation hook

  // Mock data for demonstration
  const healthMetrics = {
    bloodSugar: 125,
    bloodPressure: '120/80',
    weight: 75,
    steps: 8243,
    sleep: 7.2,
    hba1c: 6.5
  };

  const recentActivities = [
    { id: 1, action: t("PatientDashboard.ActSugarCheck"), time: t("PatientDashboard.Time30m"), value: '125 mg/dL', icon: 'fas fa-tint' },
    { id: 2, action: t("PatientDashboard.ActMeds"), time: t("PatientDashboard.Time2h"), value: 'Metformin 500mg', icon: 'fas fa-pills' },
    { id: 3, action: t("PatientDashboard.ActMeal"), time: t("PatientDashboard.Time4h"), value: 'Lunch: 45g carbs', icon: 'fas fa-utensils' },
    { id: 4, action: t("PatientDashboard.ActExercise"), time: t("PatientDashboard.Time6h"), value: '30 min walk', icon: 'fas fa-running' }
  ];

  const upcomingAppointments = [
    { id: 1, doctor: 'Dr. Sarah Johnson', date: t("PatientDashboard.ApptTomorrow"), type: t("PatientDashboard.ApptCheckup"), icon: 'fas fa-user-md' },
    { id: 2, doctor: 'Dr. Michael Chen', date: t("PatientDashboard.ApptApril"), type: t("PatientDashboard.ApptNutrition"), icon: 'fas fa-apple-alt' }
  ];

  const medications = [
    { id: 1, name: 'Metformin', dosage: '500mg', frequency: t("PatientDashboard.FreqTwice"), lastTaken: t("PatientDashboard.Last8am"), icon: 'fas fa-capsules' },
    { id: 2, name: 'Insulin Glargine', dosage: '20 units', frequency: t("PatientDashboard.FreqOnce"), lastTaken: t("PatientDashboard.Last9pm"), icon: 'fas fa-syringe' },
    { id: 3, name: 'Lisinopril', dosage: '10mg', frequency: t("PatientDashboard.FreqOnce"), lastTaken: t("PatientDashboard.Last8am"), icon: 'fas fa-prescription-bottle' }
  ];

  const healthTips = [
    t("PatientDashboard.TipSugar"),
    t("PatientDashboard.TipHydrate"),
    t("PatientDashboard.TipWalk"),
    t("PatientDashboard.TipSleep"),
    t("PatientDashboard.TipCarbs")
  ];

  return (
    <>
      <Navbar />
      {/* Main Container: Added Dark Mode Backgrounds */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black transition-colors duration-300">
      
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats and Overview */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Health Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                
                {/* Blood Sugar Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-[#8EC641]/10 rounded-xl flex items-center justify-center">
                      <i className="fas fa-tint text-[#8EC641] text-2xl"></i>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${
                      healthMetrics.bloodSugar < 130 
                        ? 'bg-[#8EC641]/10 text-[#8EC641]' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    }`}>
                      {healthMetrics.bloodSugar < 130 ? t("PatientDashboard.StatusGood") : t("PatientDashboard.StatusHigh")}
                    </span>
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{healthMetrics.bloodSugar} <span className="text-xl">mg/dL</span></h3>
                  <p className="text-gray-500 dark:text-gray-400 text-base font-medium">{t("PatientDashboard.LabelGlucose")}</p>
                  <div className="mt-4 text-sm text-gray-400 font-bold">
                    <i className="fas fa-clock mr-1"></i>
                    {t("PatientDashboard.LastCheckPrefix")} {t("PatientDashboard.Time30m")}
                  </div>
                </div>

                {/* Blood Pressure Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-[#2DA1D7]/10 rounded-xl flex items-center justify-center">
                      <i className="fas fa-heartbeat text-[#2DA1D7] text-2xl"></i>
                    </div>
                    <span className="px-4 py-1.5 bg-[#8EC641]/10 text-[#8EC641] rounded-full text-sm font-bold uppercase tracking-wider">
                      {t("PatientDashboard.StatusNormal")}
                    </span>
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{healthMetrics.bloodPressure}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-base font-medium">{t("PatientDashboard.LabelBP")}</p>
                </div>

                {/* Weight Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <i className="fas fa-weight text-purple-600 dark:text-purple-400 text-2xl"></i>
                    </div>
                    <span className="px-4 py-1.5 bg-[#8EC641]/10 text-[#8EC641] rounded-full text-sm font-bold uppercase tracking-wider">
                      {t("PatientDashboard.WeightTrend")}
                    </span>
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{healthMetrics.weight} <span className="text-xl">kg</span></h3>
                  <p className="text-gray-500 dark:text-gray-400 text-base font-medium">{t("PatientDashboard.LabelWeight")}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                {/* [ACTIVITY LOG]: Branded section with upscaled text */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t("PatientDashboard.TitleActivity")}</h2>
                  <Link to="/activity" className="text-[#8EC641] hover:text-[#76a536] font-bold text-base">
                    {t("PatientDashboard.ViewAll")} <i className="fas fa-arrow-right ml-1"></i>
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300 border border-transparent hover:border-[#8EC641]/20">
                      <div className="w-12 h-12 bg-[#8EC641]/10 rounded-full flex items-center justify-center mr-4">
                        <i className={`${activity.icon} text-[#8EC641] text-lg`}></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{activity.action}</h4>
                        <p className="text-base text-gray-500 dark:text-gray-400 font-medium">{activity.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg text-gray-900 dark:text-white">{activity.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Progress Chart */}
              <WeeklyProgressChart />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-8">
              
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t("PatientDashboard.TitleQuickActions")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-3">
                      <i className="fas fa-plus text-white text-xl"></i>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{t("PatientDashboard.ActionLogGlucose")}</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-3">
                      <i className="fas fa-utensils text-white text-xl"></i>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{t("PatientDashboard.ActionLogMeal")}</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3">
                      <i className="fas fa-running text-white text-xl"></i>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{t("PatientDashboard.ActionLogExercise")}</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mb-3">
                      <i className="fas fa-pills text-white text-xl"></i>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{t("PatientDashboard.ActionLogMeds")}</span>
                  </button>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("PatientDashboard.TitleAppts")}</h3>
                  <Link to="/appointments" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm">
                    {t("PatientDashboard.All")} <i className="fas fa-arrow-right ml-1"></i>
                  </Link>
                </div>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                          <i className={`${appointment.icon} text-green-600 dark:text-green-400`}></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{appointment.doctor}</h4>
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        <span>{appointment.date}</span>
                      </div>
                      <div className="mt-3">
                        <button className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium transition duration-300">
                          <i className="fas fa-video mr-2"></i>
                          {t("PatientDashboard.BtnJoinCall")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("PatientDashboard.TitleMeds")}</h3>
                  <Link to="/medications" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm">
                    {t("PatientDashboard.All")} <i className="fas fa-arrow-right ml-1"></i>
                  </Link>
                </div>
                <div className="space-y-4">
                  {medications.map((med) => (
                    <div key={med.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-3">
                        <i className={`${med.icon} text-red-600 dark:text-red-400`}></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{med.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{med.dosage} • {med.frequency}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t("PatientDashboard.LastTakenLabel")}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{med.lastTaken}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Tips */}
              <div className="bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-700 dark:to-teal-700 rounded-2xl p-6 text-white transition-colors">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <i className="fas fa-lightbulb text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t("PatientDashboard.TitleTips")}</h3>
                    <p className="opacity-90 text-sm">{t("PatientDashboard.SubtitleTips")}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {healthTips.map((tip, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Additional Resources */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t("PatientDashboard.TitleHelpfulRes")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { to: "/resources/faq", icon: "fa-book-medical", color: "green", title: t("PatientDashboard.ResFaq"), desc: t("PatientDashboard.ResFaqDesc") },
                { to: "/calculator", icon: "fa-calculator", color: "blue", title: t("PatientDashboard.ResCalc"), desc: t("PatientDashboard.ResCalcDesc") },
                { to: "/community", icon: "fa-users", color: "purple", title: t("PatientDashboard.ResComm"), desc: t("PatientDashboard.ResCommDesc") },
                { to: "/emergency", icon: "fa-first-aid", color: "red", title: t("PatientDashboard.ResEmerg"), desc: t("PatientDashboard.ResEmergDesc") }
              ].map((res, index) => (
                <Link 
                  key={index}
                  to={res.to} 
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition duration-300 text-center hover:-translate-y-1"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r from-${res.color}-100 to-${res.color}-50 dark:from-${res.color}-900/30 dark:to-${res.color}-800/30 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <i className={`fas ${res.icon} text-${res.color}-600 dark:text-${res.color}-400 text-2xl`}></i>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{res.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{res.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-12 bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-700 dark:to-teal-700 rounded-2xl p-6 text-white transition-colors">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { val: healthMetrics.steps, label: t("PatientDashboard.StatSteps") },
                { val: `${healthMetrics.sleep}h`, label: t("PatientDashboard.StatSleep") },
                { val: `${healthMetrics.hba1c}%`, label: t("PatientDashboard.StatHbA1c") },
                { val: 28, label: t("PatientDashboard.StatRange") }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold mb-2">{stat.val}</div>
                  <p className="text-white/90 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default PatientDashboard;