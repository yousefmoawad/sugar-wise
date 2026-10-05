import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useOutletContext } from "react-router-dom"; // Link with MyHealthFrame
import { useTranslation } from "react-i18next";
import useMessages from "../../hooks/useMessages";
import { useAuth } from "../../context/AuthContext";
import {
  MessageCircle,
  Search,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  X,
  Send,
  Filter,
} from "lucide-react";

// --- PORTAL MODAL FOR COMPOSING ---
const ComposeModal = ({ onClose, onSend, recipients = [] }) => {
  const { t } = useTranslation();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend({ to, subject, message });
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
            <MessageCircle className="text-[#8EC641]" />{" "}
            {t("Messages.ComposeTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 transition-colors">
              {t("Messages.LabelDoctor")}
            </label>
            <select
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            >
              <option value="">{t("Messages.DoctorPlaceholder")}</option>
              {recipients.map((recipient) => (
                <option key={recipient.value} value={recipient.value}>
                  {recipient.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 transition-colors">
              {t("Messages.LabelSubject")}
            </label>
            <input
              type="text"
              required
              placeholder={t("Messages.SubjectPlaceholder")}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 transition-colors">
              {t("Messages.LabelMessage")}
            </label>
            <textarea
              rows="4"
              required
              placeholder={t("Messages.MessagePlaceholder")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#8EC641] hover:bg-[#8EC641]/90 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#8EC641]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Send size={18} /> {t("Messages.BtnSend")}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
};

const Messages = () => {
  // Use context from MyHealthFrame to get translation function t and layout state
  const { t } = useOutletContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { items, loading, error, fetchAll, createItem } = useMessages();
  const { user } = useAuth();

  const formatDate = (value) => {
    if (!value) return "Recently";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleString();
  };

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  // تحسين: استخدام useMemo بدلاً من useEffect + state لتقليل عمليات الـ Render
  const inbox = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const currentUserId = user?._id || user?.id;

    return items.map((chat, index) => {
      const participants = Array.isArray(chat.participants)
        ? chat.participants
        : [];
      const otherParticipant =
        participants.find((p) => {
          const participantId = p?._id || p?.id;
          return (
            participantId != null &&
            String(participantId) !== String(currentUserId)
          );
        }) ||
        participants[0] ||
        null;

      const doctorName = otherParticipant
        ? otherParticipant.name ||
          `${otherParticipant.firstName || ""} ${otherParticipant.lastName || ""}`.trim()
        : chat.chatName || "Doctor";

      const lastText = chat.lastMessage?.messageText || "";
      const status = chat.lastMessage
        ? chat.lastMessage.isRead
          ? "Replied"
          : "Unread"
        : "Pending";

      return {
        id: chat._id || `api-chat-${index}`,
        chatId: chat._id,
        receiverId: otherParticipant?._id || otherParticipant?.id || null,
        doctor: doctorName || "Doctor",
        specialty: otherParticipant?.role || "Specialist",
        image:
          otherParticipant?.image ||
          "https://img.freepik.com/free-photo/portrait-smiling-handsome-male-doctor-man_171337-5055.jpg",
        subject: lastText ? "Follow up" : "New conversation",
        preview: lastText || "No messages yet.",
        date: formatDate(chat.lastMessageTime || chat.updatedAt),
        status,
      };
    });
  }, [items, user]);

  const recipients = useMemo(
    () =>
      inbox.map((entry) => ({
        value: entry.doctor,
        label: `${entry.doctor} (${entry.specialty})`,
      })),
    [inbox],
  );

  const handleSendMessage = async (newMsg) => {
    const senderId = user?._id || user?.id;
    const existingChat = inbox.find((message) => message.doctor === newMsg.to);

    if (existingChat?.chatId && senderId) {
      try {
        await createItem({
          chatId: existingChat.chatId,
          receiverId: existingChat.receiverId,
          senderId,
          messageText: newMsg.message,
        });
        await fetchAll();
      } catch (sendError) {
        console.error(sendError);
      }
    } else if (senderId && existingChat?.receiverId) {
      try {
        await createItem({
          receiverId: existingChat.receiverId,
          senderId,
          messageText: newMsg.message,
        });
        await fetchAll();
      } catch (sendError) {
        console.error(sendError);
      }
    }

    // يتم التحديث تلقائياً عند استدعاء fetchAll بالاعتماد على useMemo
    setIsComposeOpen(false);
  };

  // تحسين: تصفية القائمة بذكاء لضمان سرعة الاستجابة أثناء الكتابة
  const filteredInbox = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return inbox.filter((msg) => {
      const matchesFilter = filter === "All" || msg.status === filter;
      if (!matchesFilter) return false;
      if (!query) return true;
      return (
        msg.doctor.toLowerCase().includes(query) ||
        msg.subject.toLowerCase().includes(query) ||
        msg.preview.toLowerCase().includes(query)
      );
    });
  }, [inbox, filter, searchTerm]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Unread":
        return (
          <span className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors">
            <AlertCircle size={12} /> {t("Messages.BadgeNew")}
          </span>
        );
      case "Replied":
        return (
          <span className="bg-[#8EC641]/10 text-[#8EC641] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors">
            <CheckCircle size={12} /> {t("Messages.BadgeSolved")}
          </span>
        );
      case "Pending":
        return (
          <span className="bg-[#2DA1D7]/10 text-[#2DA1D7] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors">
            <Clock size={12} /> {t("Messages.BadgeWaiting")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* [BRAND ACTION]: Primary Green clinical header */}
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">
            {t("Messages.PageTitle")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1 transition-colors">
            {t("Messages.PageSubtitle")}
          </p>
        </div>
        <button
          onClick={() => setIsComposeOpen(true)}
          className="bg-[#8EC641] hover:bg-[#8EC641]/90 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-[#8EC641]/20 transition-all active:scale-95"
        >
          <Plus size={20} /> {t("Messages.BtnNewInquiry")}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center transition-colors">
        <div className="flex gap-1 bg-gray-50 dark:bg-gray-700 p-1 rounded-xl w-full md:w-auto transition-colors">
          {["All", "Unread", "Pending", "Replied"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition flex-1 md:flex-none ${
                filter === f
                  ? "bg-white dark:bg-gray-600 text-[#8EC641] shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {t(`Messages.Filter${f}`)}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 pr-2">
          <Search
            className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder={t("Messages.SearchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8EC641] text-sm transition-colors"
          />
        </div>
      </div>

      {loading && (
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Loading messages...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          API unavailable right now, showing local data.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInbox.length > 0 ? (
          filteredInbox.map((msg) => (
            <div
              key={msg.id}
              onClick={() => navigate("/messages")}
              className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition duration-300 group cursor-pointer relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={msg.image}
                    alt={msg.doctor}
                    className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-gray-600"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white transition-colors">
                      {msg.doctor}
                    </h3>
                    <p className="text-[10px] text-[#2DA1D7] dark:text-[#2DA1D7] font-black uppercase tracking-widest transition-colors">
                      {msg.specialty}
                    </p>
                  </div>
                </div>
                {getStatusBadge(msg.status)}
              </div>

              <div className="mb-4">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1 transition-colors">
                  {msg.subject}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed transition-colors">
                  {msg.preview}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700 transition-colors">
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium transition-colors">
                  <Clock size={14} /> {msg.date}
                </div>
                <button className="text-[#8EC641] dark:text-[#8EC641] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                  {t("Messages.ViewThread")} <ChevronRight size={16} />
                </button>
              </div>

              {msg.status === "Unread" && (
                <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-[#8EC641] rounded-full animate-pulse shadow-lg shadow-[#8EC641]/50"></div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 transition-colors">
            <Filter
              size={48}
              className="mx-auto mb-3 text-gray-300 dark:text-gray-600"
            />
            <p>{t("Messages.EmptyState")}</p>
          </div>
        )}
      </div>

      {isComposeOpen && (
        <ComposeModal
          onClose={() => setIsComposeOpen(false)}
          onSend={handleSendMessage}
          recipients={recipients}
        />
      )}
    </div>
  );
};

export default Messages;
