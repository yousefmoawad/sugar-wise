import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Trash2,
  AlertCircle,
  Calendar,
  UserPlus,
  FileText,
} from "lucide-react";

const NotificationDoctor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, loading, error, fetchAll, updateItem, deleteItem } = useNotifications();
  const [filter, setFilter] = useState("all"); // 'all', 'unread'
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  const typeMeta = useMemo(
    () => ({
      appointment: {
        icon: Calendar,
        color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
      },
      alert: {
        icon: AlertCircle,
        color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
      },
      new_patient: {
        icon: UserPlus,
        color:
          "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
      },
      report: {
        icon: FileText,
        color:
          "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
      },
      system: {
        icon: Bell,
        color:
          "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
      },
    }),
    [],
  );

  useEffect(() => {
    const mapped = (items || []).map((n) => {
      const meta = typeMeta[n.type] || typeMeta.system;
      return {
        id: n._id,
        type: n.type || "system",
        title: n.title,
        message: n.message,
        time: n.createdAt ? new Date(n.createdAt).toLocaleString() : "-",
        isRead: !!n.isRead,
        icon: meta.icon,
        color: meta.color,
      };
    });
    setNotifications(mapped);
  }, [items, typeMeta]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await updateItem(id, { isRead: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (markError) {
      console.error(markError);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.isRead)
          .map((n) => updateItem(n.id, { isRead: true })),
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (markAllError) {
      console.error(markAllError);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteItem(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (deleteError) {
      console.error(deleteError);
    }
  };

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.isRead);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white transition-colors tracking-tight uppercase">
            {t("NotificationDoctor.PageTitle") || "Notifications"}
          </h1>
          <p className="text-base font-medium text-gray-500 dark:text-gray-400 mt-1">
            {t("NotificationDoctor.PageSubtitle") ||
              "Stay updated with your patients and clinic activities."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-black uppercase tracking-tight transition-all ${
                filter === "all"
                  ? "bg-[#2DA1D7] text-white shadow-xl shadow-[#2DA1D7]/20"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {t("NotificationDoctor.FilterAll") || "All"}
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                filter === "unread"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {t("NotificationDoctor.FilterUnread") || "Unread"}
              {unreadCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${filter === "unread" ? "bg-white/20 text-white" : "bg-red-500 text-white"}`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="p-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("NotificationDoctor.MarkAllRead") || "Mark all as read"}
          >
            <CheckCheck size={20} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading && <p className="text-sm text-blue-600">Loading notifications...</p>}
      {error && <p className="text-sm text-red-600">Failed to load notifications</p>}
      <div className="bg-white/50 dark:bg-gray-900/50 rounded-3xl backdrop-blur-xl">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={async () => {
                  if (!notification.isRead) await markAsRead(notification.id);
                  if (notification.type === 'message' || notification.type === 'chat') {
                    navigate('/messages-doctor');
                  }
                }}
                className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  notification.isRead
                    ? "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-75 hover:opacity-100"
                    : "bg-white dark:bg-gray-800 border-blue-100 dark:border-blue-900/30 shadow-md ring-1 ring-blue-500/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-xl ${notification.color} shrink-0`}
                  >
                    <notification.icon size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3
                        className={`text-base font-bold ${notification.isRead ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}
                      >
                        {notification.title}
                      </h3>
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1 shrink-0 ml-2">
                        <Clock size={12} /> {notification.time}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 truncate sm:whitespace-normal ${notification.isRead ? "text-gray-500 dark:text-gray-500" : "text-gray-600 dark:text-gray-300"}`}
                    >
                      {notification.message}
                    </p>
                  </div>
                </div>

                {/* Actions (Hover) */}
                <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      title="Mark as Read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Bell className="text-gray-400 dark:text-gray-500" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("NotificationDoctor.EmptyTitle") || "All caught up!"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
              {filter === "unread"
                ? t("NotificationDoctor.EmptyUnread") ||
                  "You have no unread notifications."
                : t("NotificationDoctor.EmptyAll") ||
                  "You have no notifications at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDoctor;
