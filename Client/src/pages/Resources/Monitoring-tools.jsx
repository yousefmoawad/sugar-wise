import React, { useState, useEffect } from "react";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next";

/**
 * [SUB-COMPONENT]: StatCard
 * Purpose: Visualizes Key Performance Indicators (KPIs) with icons and trend indicators.
 */
const StatCard = ({ title, value, change, icon, colorBase }) => {
  const { t } = useTranslation();
  
  // High-contrast color mapping for clinical indicators
  const colorMap = {
    green: "bg-[#8EC641]/10 text-[#8EC641] dark:bg-[#8EC641]/20 dark:text-[#8EC641]",
    blue: "bg-[#2DA1D7]/10 text-[#2DA1D7] dark:bg-[#2DA1D7]/20 dark:text-[#2DA1D7]",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  };

  const activeColorClass = colorMap[colorBase] || colorMap.blue;

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors duration-300">
      <div>
        <p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 dark:text-white transition-colors">{value}</h3>
        <span
          className={`text-xs font-black uppercase tracking-tighter px-3 py-1 rounded-full mt-3 inline-block ${
            change.startsWith("+") ? "bg-[#8EC641]/10 text-[#8EC641]" : "bg-red-50 text-red-500"
          }`}
        >
          {change} {t("MonitoringTools.StatSuffix")}
        </span>
      </div>
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${activeColorClass}`}
      >
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
  );
};

/**
 * [SUB-COMPONENT]: SimpleLineChart
 * Logic: Renders a lightweight SVG polyline chart for data trends.
 */
const SimpleLineChart = ({ data, color = "#2DA1D7" }) => {
  const height = 200;
  const width = 600;
  const maxVal = Math.max(...data.map((d) => d.value));

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d.value / maxVal) * (height - 20);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height + 40}`}
        className="w-full h-56 overflow-visible"
      >
        {/* Horizontal Grid Rails */}
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <line
            key={p}
            x1="0"
            y1={height * p}
            x2={width}
            y2={height * p}
            className="stroke-gray-100 dark:stroke-gray-800"
            strokeWidth="1"
          />
        ))}

        {/* The Main Trend Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="6"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-lg"
        />

        {/* Interaction Points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - (d.value / maxVal) * (height - 20);
          return (
            <g key={i} className="group cursor-default">
              <circle
                cx={x}
                cy={y}
                r="6"
                fill="white"
                stroke={color}
                strokeWidth="3"
                className="transition-all dark:fill-gray-900 group-hover:r-10"
              />
              <text
                x={x}
                y={height + 30}
                textAnchor="middle"
                fontSize="12"
                className="font-black fill-gray-400 dark:fill-gray-500 uppercase"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/**
 * [COMPONENT]: MonitoringTools
 * Purpose: Administrative dashboard for clinicians to monitor patient flow and system metrics.
 */
const MonitoringTools = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const [timeRange, setTimeRange] = useState("Weekly");

  const chartData = [
    { label: "Sat", value: 12 },
    { label: "Sun", value: 19 },
    { label: "Mon", value: 15 },
    { label: "Tue", value: 25 },
    { label: "Wed", value: 22 },
    { label: "Thu", value: 30 },
    { label: "Fri", value: 18 },
  ];

  const liveWaitingList = [
    { id: 1, name: "Sarah Connor", time: "10:30 AM", status: "In Consultation", type: "Checkup" },
    { id: 2, name: "Kyle Reese", time: "10:45 AM", status: "Waiting (15m)", type: "Follow-up" },
    { id: 3, name: "John Doe", time: "11:00 AM", status: "Waiting (5m)", type: "New Patient" },
  ];

  return (
    <>
      <Navbar />

      {/**
       * [MAIN WRAPPER]: Clinical background with subtle mixed brand gradient.
       */}
      <div className="min-h-screen bg-gradient-to-br from-white via-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-20 transition-colors duration-300">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12" data-aos="fade-down">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white transition-colors uppercase tracking-tight">
                {t("MonitoringTools.DashTitle")}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mt-1 transition-colors">
                {t("MonitoringTools.DashSubtitle")}
              </p>
            </div>
            
            {/* Filter Pill List */}
            <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1.5 shadow-xl border border-gray-100 dark:border-gray-700 mt-6 md:mt-0 transition-colors">
              {["Daily", "Weekly", "Monthly"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition ${
                    timeRange === range
                      ? "bg-[#2DA1D7] text-white shadow-lg shadow-[#2DA1D7]/20"
                      : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {t(`MonitoringTools.Btn${range}`)}
                </button>
              ))}
            </div>
          </div>

          {/**
           * [KPI SECTION]: Core performance metrics.
           */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12" data-aos="fade-up">
            <StatCard
              title={t("MonitoringTools.StatRevenue")}
              value="42,500 EGP"
              change="+12.5%"
              icon="fa-coins"
              colorBase="green"
            />
            <StatCard
              title={t("MonitoringTools.StatAppointments")}
              value="148"
              change="+8.2%"
              icon="fa-calendar-check"
              colorBase="blue"
            />
            <StatCard
              title={t("MonitoringTools.StatNewPatients")}
              value="35"
              change="-2.4%"
              icon="fa-user-plus"
              colorBase="purple"
            />
            <StatCard
              title={t("MonitoringTools.StatWaitTime")}
              value="14 min"
              change="+1.2%"
              icon="fa-clock"
              colorBase="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/**
             * [TREND CHART]: Historical data visualization.
             */}
            <div
              className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300"
              data-aos="fade-right"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-black text-gray-900 dark:text-white transition-colors uppercase tracking-tight">
                  {t("MonitoringTools.ChartTitle")}
                </h2>
                <button className="text-[#2DA1D7] font-black text-xs uppercase tracking-widest hover:underline flex items-center">
                  <i className="fas fa-download mr-2"></i> {t("MonitoringTools.BtnReport")}
                </button>
              </div>

              {/* Custom SVG Visualization Area */}
              <div className="h-72 flex items-end pb-6">
                <SimpleLineChart data={chartData} color="#2DA1D7" />
              </div>
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 transition-colors font-bold uppercase tracking-widest">
                {t("MonitoringTools.ChartFooter")}
              </p>
            </div>

            {/**
             * [WAITING LIST]: Real-time patient flow monitor.
             */}
            <div
              className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300"
              data-aos="fade-left"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-gray-900 dark:text-white transition-colors uppercase tracking-tight">
                  {t("MonitoringTools.WaitingTitle")}
                </h2>
                <span className="flex h-4 w-4 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8EC641] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#8EC641]"></span>
                </span>
              </div>

              <div className="space-y-5">
                {liveWaitingList.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center p-5 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:border-[#2DA1D7]/30 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#2DA1D7] text-white flex items-center justify-center font-black text-lg mr-4 shadow-lg group-hover:scale-110 transition-transform">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-black text-gray-900 dark:text-white transition-colors">
                        {patient.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors font-bold uppercase tracking-wide">
                        {patient.type} • {patient.time}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-tighter ${
                        patient.status === "In Consultation"
                          ? "bg-[#2DA1D7]/10 text-[#2DA1D7]"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 rounded-2xl font-black uppercase tracking-widest hover:border-[#2DA1D7] hover:text-[#2DA1D7] transition-all">
                {t("MonitoringTools.BtnSchedule")}
              </button>
            </div>
          </div>

          {/**
           * [STATUS ALERTS]: System health and critical inventory notifications.
           */}
          <div
            className="mt-12 bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300"
            data-aos="fade-up"
          >
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 transition-colors uppercase tracking-tight">
              {t("MonitoringTools.AlertSection")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="flex items-start p-6 bg-[#8EC641]/5 dark:bg-[#8EC641]/10 rounded-2xl border-2 border-[#8EC641]/20 transition-colors">
                <i className="fas fa-check-circle text-[#8EC641] text-xl mt-1 mr-4"></i>
                <div>
                  <h4 className="font-black text-[#8EC641] text-sm uppercase tracking-tight">
                    {t("MonitoringTools.AlertSyncTitle")}
                  </h4>
                  <p className="text-[#8EC641]/80 text-xs mt-1 font-medium italic">
                    {t("MonitoringTools.AlertSyncDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border-2 border-red-100 transition-colors">
                <i className="fas fa-exclamation-triangle text-red-500 text-xl mt-1 mr-4"></i>
                <div>
                  <h4 className="font-black text-red-600 text-sm uppercase tracking-tight">
                    {t("MonitoringTools.AlertInvTitle")}
                  </h4>
                  <p className="text-red-500/80 text-xs mt-1 font-medium italic">
                    {t("MonitoringTools.AlertInvDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start p-6 bg-[#2DA1D7]/5 dark:bg-[#2DA1D7]/10 rounded-2xl border-2 border-[#2DA1D7]/20 transition-colors">
                <i className="fas fa-wifi text-[#2DA1D7] text-xl mt-1 mr-4"></i>
                <div>
                  <h4 className="font-black text-[#2DA1D7] text-sm uppercase tracking-tight">
                    {t("MonitoringTools.AlertNetTitle")}
                  </h4>
                  <p className="text-[#2DA1D7]/80 text-xs mt-1 font-medium italic">
                    {t("MonitoringTools.AlertNetDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MonitoringTools;