import React from "react";
import { useTranslation } from "react-i18next";

/**
 * [COMPONENT]: NotificationSettings
 * Purpose: Manages user preferences for system and marketing alerts.
 * Styling: Clean clinical cards with premium toggle switches using Primary Blue (#2DA1D7).
 */
const NotificationSettings = () => {
  const { t } = useTranslation();
  
  const preferences = [
    {
      label: t("notifications.appointment_reminders"),
      desc: t("notifications.appointment_reminders_desc"),
      active: true,
      icon: "fa-calendar-alt",
    },
    {
      label: t("notifications.lab_results"),
      desc: t("notifications.lab_results_desc"),
      active: true,
      icon: "fa-flask",
    },
    {
      label: t("notifications.marketing_offers"),
      desc: t("notifications.marketing_offers_desc"),
      active: false,
      icon: "fa-tags",
    },
    {
      label: t("notifications.security_alerts"),
      desc: t("notifications.security_alerts_desc"),
      active: true,
      icon: "fa-shield-alt",
    },
  ];

  return (
    <div className="animate-fade-in">
      
      {/* SECTION HEADER */}
      <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#2DA1D7]/10 flex items-center justify-center text-[#2DA1D7] shadow-inner">
          <i className="fas fa-bell text-xl"></i>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-1">
            {t("notifications.title")}
          </h2>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {t("settings.account_settings")}
          </p>
        </div>
      </div>

      <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mb-12 max-w-2xl leading-relaxed">
        {t("notifications.desc")}
      </p>

      {/* NOTIFICATION PREFERENCES LIST */}
      <div className="space-y-6">
        {preferences.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-8 bg-white dark:bg-gray-800/40 border-2 border-gray-50 dark:border-gray-800 rounded-[2rem] hover:bg-white dark:hover:bg-gray-800 hover:shadow-2xl hover:shadow-[#2DA1D7]/5 hover:-translate-y-1 transition-all group"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#2DA1D7] group-hover:bg-[#2DA1D7]/5 transition-all shadow-inner">
                <i className={`fas ${item.icon} text-xl`}></i>
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">
                  {item.label}
                </h4>
                <p className="text-base text-gray-500 dark:text-gray-400 font-medium transition-colors">
                  {item.desc}
                </p>
              </div>
            </div>

            {/* Premium Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer scale-125 mr-4">
              <input
                type="checkbox"
                defaultChecked={item.active}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2DA1D7] dark:peer-checked:bg-[#2DA1D7]/100 transition-colors shadow-inner"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-[#2DA1D7]/5 rounded-[2rem] border border-[#2DA1D7]/20 flex items-center gap-6">
        <div className="w-12 h-12 bg-[#2DA1D7] text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
          <i className="fas fa-magic"></i>
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-bold uppercase tracking-tight text-sm">
          {t("notifications.smart_notif") || "Smart alerts are adapted to your health activity."}
        </p>
      </div>
    </div>
  );
};

export default NotificationSettings;
