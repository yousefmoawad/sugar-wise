import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";
import {
  Bell,
  Calendar,
  Activity,
  Info,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

const NotificationPatient = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, loading, error, fetchAll, updateItem } = useNotifications();

  const handleNotificationClick = async (notification) => {
    if (!notification.read && notification.id && !notification.id.startsWith("notification-")) {
      try {
        await updateItem(notification.id, { isRead: true });
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
    if (["message", "chat"].includes(notification.type)) {
      navigate("/messages-patient");
      return;
    }
    if (["booking", "appointment"].includes(notification.type)) {
      navigate("/my-health/my-doctors");
    }
  };

  const getIconMeta = (type) => {
    switch (type) {
      case "appointment":
      case "booking":
        return { icon: Calendar, color: "text-[#2DA1D7]", bg: "bg-[#2DA1D7]/10" };
      case "alert":
        return { icon: Activity, color: "text-rose-500", bg: "bg-rose-500/10" };
      case "success":
        return { icon: CheckCircle, color: "text-[#8EC641]", bg: "bg-[#8EC641]/10" };
      case "message":
        return { icon: MessageSquare, color: "text-[#2DA1D7]", bg: "bg-[#2DA1D7]/10" };
      case "follow":
        return { icon: CheckCircle, color: "text-[#8EC641]", bg: "bg-[#8EC641]/10" };
      default:
        return { icon: Info, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" };
    }
  };

  const notifications = useMemo(
    () =>
      (Array.isArray(items) ? items : [])
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .map((notification, index) => {
        const meta = getIconMeta(notification.type);
        const createdAt = notification.createdAt ? new Date(notification.createdAt) : null;
        return {
          id: notification._id || `notification-${index}`,
          type: notification.type || "info",
          title: notification.title || "Notification",
          message: notification.message || "",
          time: createdAt ? createdAt.toLocaleString() : "Recently",
          read: Boolean(notification.isRead),
          icon: meta.icon,
          color: meta.color,
          bg: meta.bg,
        };
      }),
    [items],
  );

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  return (
    <div className="flex bg-[#F0F2F5] dark:bg-gray-950 min-h-screen transition-colors duration-300">

      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                {/* [BRAND ACTION]: Primary Green clinical header */}
                <h1 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-tight transition-colors">
                  <Bell className="text-[#8EC641]" size={36} />
                  {t("Notifications.PageTitle") || "Notifications"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2 transition-colors">
                  {t("Notifications.PageSubtitle") ||
                    "Stay updated with your latest health alerts and appointments."}
                </p>
              </div>
              <span className="bg-[#8EC641]/10 text-[#8EC641] text-[10px] font-black mr-2 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                {notifications.filter((n) => !n.read).length}{" "}
                {t("Notifications.New") || "New"}
              </span>
            </div>
            {loading && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Loading notifications...
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to load notifications.
              </p>
            )}

            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white cursor-pointer dark:bg-gray-800 rounded-[2rem] p-8 shadow-xl shadow-[#8EC641]/5 border border-white dark:border-gray-800 transition-all hover:shadow-2xl hover:shadow-[#8EC641]/10 flex items-start gap-6 ${!notification.read ? "border-l-4 border-l-[#8EC641]" : ""}`}
                >
                  <div className={`p-3 rounded-full ${notification.bg}`}>
                    <notification.icon
                      size={24}
                      className={notification.color}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3
                        className={`text-lg font-bold mb-1 ${!notification.read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}
                      >
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-base font-bold leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2.5 h-2.5 bg-[#8EC641] rounded-full mt-3 shadow-lg shadow-[#8EC641]/50 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>

            {notifications.length === 0 && (
              <div className="text-center py-20">
                <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {t("Notifications.NoNotifications") ||
                    "No notifications yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPatient;
