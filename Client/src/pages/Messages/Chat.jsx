import React, { useState, useEffect, useRef, memo } from "react";
import {
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Send,
  ChevronLeft,
  CheckCheck,
  Trash2,
} from "lucide-react";

const formatMsgTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Chat = memo(({
  chat,
  messages = [],
  messageLoading,
  sendError,
  currentUserId,
  onSend,
  onDeleteMessage,
  onDeleteChat,
  isTyping,
  onTyping,
  onBack,
}) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [isLocalTyping, setIsLocalTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (text.length > 0 && !isLocalTyping) {
      setIsLocalTyping(true);
      onTyping?.(true);
    }

    const timeout = setTimeout(() => {
      if (isLocalTyping) {
        setIsLocalTyping(false);
        onTyping?.(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [text, isLocalTyping, onTyping]);

  useEffect(() => {
    const behavior = messages.length <= 20 ? "auto" : "smooth";
    bottomRef.current?.scrollIntoView({ behavior });
  }, [messages.length, chat?.id]);

  if (!chat) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await onSend(trimmed);
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-[#080809] relative overflow-hidden transition-all duration-500">
      <div className="z-10 p-5 flex justify-between items-center bg-[#2DA1D7] shadow-xl border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="md:hidden text-white hover:bg-white/10 p-1 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="relative">
            <img
              src={chat.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100"}
              className="w-12 h-12 rounded-full border-2 border-white/20 object-cover shadow-sm"
              alt={chat.name}
            />
            {chat.status === "online" && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#288E87] rounded-full" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-black text-white leading-tight uppercase tracking-tight">
              {chat.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${chat.status === "online" ? "bg-green-400" : "bg-gray-400"}`} />
              <span className="text-[10px] text-white/80 font-black uppercase tracking-widest">
                {chat.status === "online" ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-white/90">
          <button type="button" className="hover:text-white transition-all hover:scale-110">
            <Video size={20} />
          </button>
          <button type="button" className="hover:text-white transition-all hover:scale-110">
            <Phone size={20} />
          </button>
          <div className="w-px h-6 bg-white/20 hidden sm:block" />
          <button
            type="button"
            onClick={onDeleteChat}
            className="hover:text-white transition-all hover:scale-110"
            title="Delete conversation"
          >
            <Trash2 size={20} />
          </button>
          <button type="button" className="hover:text-white transition-all hover:scale-110">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="z-10 flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 custom-scrollbar bg-transparent">
        {messageLoading && messages.length === 0 && (
          <p className="text-center text-[#2DA1D7] text-sm font-black uppercase tracking-widest animate-pulse">
            Establishing care connection...
          </p>
        )}

        {isTyping && (
          <div className="flex gap-3 justify-start animate-fade-in opacity-70">
            <img src={chat.avatar} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
            <div className="bg-white dark:bg-[#121214] p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 flex items-center gap-1 shadow-sm">
              <div className="w-1.5 h-1.5 bg-[#2DA1D7] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-[#2DA1D7] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-[#2DA1D7] rounded-full animate-bounce" />
            </div>
          </div>
        )}

        {messages.map((m) => {
          const sid = m.senderId || m.sender?._id || m.sender;
          const mine = currentUserId && String(sid) === String(currentUserId);
          const body = m.content || m.message || m.text || m.messageText || "";
          const time = formatMsgTime(m.createdAt);

          return (
            <div
              key={m._id || `${sid}-${time}-${body.slice(0, 20)}`}
              className={`group flex gap-3 ${mine ? "justify-end" : "justify-start"}`}
            >
              {!mine && (
                <img
                  src={chat.avatar}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 shadow-sm border border-white/10"
                  alt=""
                />
              )}
              <div
                className={`relative max-w-[85%] sm:max-w-[70%] p-5 rounded-[2rem] shadow-xl border ${
                  mine
                    ? "bg-[#2DA1D7] text-white rounded-tr-none border-[#2DA1D7]/20 shadow-[#2DA1D7]/20"
                    : "bg-white dark:bg-[#121214] text-gray-800 dark:text-gray-200 rounded-tl-none border-gray-100 dark:border-gray-800 shadow-[#2DA1D7]/5"
                }`}
              >
                <p className="text-base leading-relaxed font-medium whitespace-pre-wrap break-words">
                  {body || "Message removed after 60 days."}
                </p>
                <div
                  className={`flex items-center gap-1.5 mt-2.5 ${mine ? "justify-end text-white/70" : "justify-start text-gray-400 dark:text-gray-500"}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-tighter">{time}</span>
                  {mine && <CheckCheck size={12} className="text-white/70" />}
                </div>
                {mine && m._id ? (
                  <button
                    type="button"
                    onClick={() => onDeleteMessage?.(m._id)}
                    className="absolute -left-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-white dark:bg-gray-900 text-red-500 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-lg"
                    title="Delete message"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="z-10 p-5 bg-white dark:bg-[#121214] border-t border-gray-100 dark:border-gray-800/50 mt-auto">
        {sendError ? (
          <p className="text-xs text-red-500 mb-3 font-bold uppercase px-4">{sendError}</p>
        ) : null}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 sm:gap-4 p-2.5 pl-6 pr-2 bg-gray-50 dark:bg-[#1E1E22] rounded-[2.5rem] border border-gray-200 dark:border-gray-800/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
        >
          <button type="button" className="text-gray-400 hover:text-[#8EC641] transition-all hover:scale-110 active:scale-95">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write clinical inquiry..."
            className="flex-1 py-3 bg-transparent outline-none text-base dark:text-white placeholder:text-gray-400 font-medium"
          />
          <button
            type="button"
            className="text-gray-400 hover:text-[#2DA1D7] transition-all hover:scale-110 hidden sm:block"
          >
            <Smile size={20} />
          </button>
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              text.trim() && !sending
                ? "bg-[#2DA1D7] text-white shadow-xl shadow-[#2DA1D7]/30 rotate-0 hover:rotate-6 scale-100 hover:scale-110"
                : "bg-gray-200 dark:bg-[#121214] text-gray-400"
            }`}
          >
            <Send size={20} className={text.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
});

export default Chat;
