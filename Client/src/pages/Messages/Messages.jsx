import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  MessageSquare,
  ChevronRight,
  Plus,
  X
} from "lucide-react";
import Chat from "./Chat";
import useMessages from "../../hooks/useMessages";
import SugerWiseLogo from "../../Images/BrandLogo/logo-cycle.png";
import { normalizeRefId } from "../../utils/normalizeRefId";

const getUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const raw = u._id ?? u.id;
    return normalizeRefId(raw);
  } catch {
    return "";
  }
};

const formatListTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return d.toLocaleDateString();
};

const mapChatRow = (chat, userId) => {
  const peers = chat.participants || [];
  const other =
    peers.find((p) => String(p._id || p.id) !== String(userId)) || peers[0] || {};
  const lm = chat.lastMessage;
  const lastText =
    lm?.content || lm?.message || lm?.text || lm?.messageText || "";
  const t = chat.lastMessageTime || chat.updatedAt;
  const img = other.image || other.profileImage || "";
  const avatar =
    img && (img.startsWith("http") || img.startsWith("data:"))
      ? img
      : "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100";
  const st = String(other.status || "").toLowerCase();
  return {
    id: chat._id,
    name: other.name || chat.chatName || "User",
    avatar,
    status: st === "online" ? "online" : "offline",
    lastMsg: lastText,
    time: formatListTime(t),
    unread: Number(chat.unreadCount) || 0,
    raw: chat,
  };
};

const sortMessagesAscending = (list) =>
  [...(Array.isArray(list) ? list : [])].sort((a, b) => {
    const aTime = new Date(a?.createdAt || 0).getTime();
    const bTime = new Date(b?.createdAt || 0).getTime();
    if (aTime !== bTime) return aTime - bTime;
    return String(a?._id || "").localeCompare(String(b?._id || ""));
  });

const Messages = () => {
  const location = useLocation();
  const userId = useMemo(() => getUserId(), []);
  const requestedChatId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("chat") || "";
  }, [location.search]);
  const requestedRecipientId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("recipient") || "";
  }, [location.search]);
  
  const { items, loading, error, fetchAll, fetchChatsQuiet, fetchMessagesQuiet, markChatRead, sendMessage, deleteItem, deleteChat } =
    useMessages();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [isOtherTyping] = useState(false); // حالة مراقبة الطرف الآخر (سيتم تحديثها عند ربط الـ WebSocket أو الـ Polling)
  const [sendError, setSendError] = useState("");
  const [search, setSearch] = useState("");
  const [showNewInquiry, setShowNewInquiry] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const msgCursorRef = useRef({});
  const handledNotificationChatRef = useRef("");

  const chatRows = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list.map((c) => mapChatRow(c, userId));
  }, [items, userId]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chatRows;
    return chatRows.filter((r) => r.name.toLowerCase().includes(q));
  }, [chatRows, search]);

  const selectedChat =
    filteredRows.find((c) => String(c.id) === String(selectedChatId)) ||
    chatRows.find((c) => String(c.id) === String(selectedChatId)) ||
    null;

  const loadChats = useCallback(() => fetchAll().catch(() => {}), [fetchAll]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    const id = setInterval(() => {
      fetchChatsQuiet().catch(() => {});
    }, 8000);
    return () => clearInterval(id);
  }, [fetchChatsQuiet]);

  useEffect(() => {
    if (!selectedChatId && chatRows.length) {
      const targetDoc = location.state?.targetDoctor;
      if (targetDoc) {
        const docId = targetDoc._id || targetDoc.id;
        const existing = chatRows.find(row => {
          const peers = row.raw?.participants || [];
          return peers.some(p => String(p._id || p.id || p) === String(docId) || 
                               String(p.doctor || '') === String(docId) ||
                               String(p.patient || '') === String(docId));
        });
        if (existing) {
          setSelectedChatId(existing.id);
          return;
        }
      }
      setSelectedChatId(chatRows[0].id);
    }
  }, [chatRows, selectedChatId, location.state]);

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    const chatKey = String(selectedChatId);

    const setCursorFromList = (list) => {
      const last = Array.isArray(list) && list.length ? list[list.length - 1] : null;
      if (last && last.createdAt && last._id) {
        msgCursorRef.current[chatKey] = { after: last.createdAt, afterId: last._id };
      } else {
        delete msgCursorRef.current[chatKey];
      }
    };

    const loadInitial = async () => {
      let didMarkRead = false;
      setMsgLoading(true);
      try {
        const data = await fetchMessagesQuiet(selectedChatId, { markRead: false });
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setMessages(sortMessagesAscending(list));
        setCursorFromList(list);

        const hasUnreadFromOther = list.some((m) => {
          const sid = m.senderId || m.sender?._id || m.sender;
          return userId && String(sid) !== String(userId) && m.isRead === false;
        });
        if (hasUnreadFromOther && selectedChatId) {
          didMarkRead = true;
          markChatRead(selectedChatId).then(() => fetchChatsQuiet().catch(() => {}));
        }
      } catch {
        if (!cancelled) setMessages([]);
        delete msgCursorRef.current[chatKey];
      } finally {
        if (!cancelled) setMsgLoading(false);
      }
      const unreadSnap =
        typeof selectedChat?.unread === "number" ? selectedChat.unread : 0;
      if (!cancelled && !didMarkRead && unreadSnap > 0 && selectedChatId) {
        markChatRead(selectedChatId).then(() => fetchChatsQuiet().catch(() => {}));
      }
    };

    const pollNew = async () => {
      const cursor = msgCursorRef.current[chatKey];
      if (!cursor?.after) return;
      try {
        const delta = await fetchMessagesQuiet(selectedChatId, {
          after: cursor.after,
          afterId: cursor.afterId,
          limit: 100,
          includeSender: false,
          markRead: false,
        });
        if (cancelled) return;
        const add = Array.isArray(delta) ? delta : [];
        if (!add.length) return;

        setMessages((prev) => {
          const list = Array.isArray(prev) ? prev : [];
          const existing = new Set(list.map((m) => String(m?._id || "")));
          const fresh = add.filter((m) => !existing.has(String(m?._id || "")));
          return fresh.length ? sortMessagesAscending([...list, ...fresh]) : list;
        });

        const last = add[add.length - 1];
        if (last && last.createdAt && last._id) {
          msgCursorRef.current[chatKey] = { after: last.createdAt, afterId: last._id };
        }

        const hasIncoming = add.some((m) => {
          const sid = m.senderId || m.sender?._id || m.sender;
          return userId && String(sid) !== String(userId);
        });
        if (hasIncoming && selectedChatId) {
          markChatRead(selectedChatId).then(() => fetchChatsQuiet().catch(() => {}));
        } else {
          fetchChatsQuiet().catch(() => {});
        }
      } catch {
        // ignore polling errors
      }
    };

    loadInitial();
    const poll = setInterval(pollNew, 2000);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [selectedChatId, fetchMessagesQuiet, markChatRead, fetchChatsQuiet, selectedChat?.unread, userId]);

  useEffect(() => {
    if (!requestedChatId || !chatRows.length) return;
    if (handledNotificationChatRef.current === String(requestedChatId)) return;
    const targetChat = chatRows.find((row) => String(row.id) === String(requestedChatId));
    if (targetChat) {
      handledNotificationChatRef.current = String(requestedChatId);
      setSelectedChatId(targetChat.id);
    }
  }, [requestedChatId, chatRows]);

  useEffect(() => {
    if (!requestedRecipientId || !chatRows.length) return;
    if (handledNotificationChatRef.current === `recipient:${requestedRecipientId}`) return;

    const targetChat = chatRows.find((row) => {
      const peers = row.raw?.participants || [];
      return peers.some((peer) => {
        const userRef = peer?._id || peer?.id || peer;
        return (
          String(userRef || "") === String(requestedRecipientId) ||
          String(peer?.patient || "") === String(requestedRecipientId) ||
          String(peer?.doctor || "") === String(requestedRecipientId)
        );
      });
    });

    if (targetChat) {
      handledNotificationChatRef.current = `recipient:${requestedRecipientId}`;
      setSelectedChatId(targetChat.id);
    }
  }, [requestedRecipientId, chatRows]);

  // دالة إرسال إشارة الكتابة للسيرفر
  const handleTyping = useCallback(async (isTyping) => {
    if (!selectedChatId || !userId) return;
    try {
      // هنا يتم استدعاء الـ API الخاص بحالة الكتابة
      // مثال: await fetch(`/api/chats/${selectedChatId}/typing`, { 
      //   method: 'POST', 
      //   body: JSON.stringify({ isTyping, userId }) 
      // });
      console.log(`User is ${isTyping ? 'typing...' : 'stopped typing'}`);
    } catch (e) { /* تجاهل أخطاء الحالة الثانوية */ }
  }, [selectedChatId, userId]);

  const handleSend = async (text) => {
    setSendError("");
    if (!selectedChatId || !userId) {
      setSendError("Sign in to send messages.");
      return;
    }
    try {
      const sent = await sendMessage({
        chatId: selectedChatId,
        senderId: userId,
        messageText: text,
      });

      if (sent) {
        setMessages((prev) => {
          const list = prev || [];
          const sid = String(sent?._id || "");
          if (sid && list.some((m) => String(m?._id || "") === sid)) return list;
          return sortMessagesAscending([...list, sent]);
        });
        const chatKey = String(selectedChatId);
        if (sent.createdAt && sent._id) {
          msgCursorRef.current[chatKey] = { after: sent.createdAt, afterId: sent._id };
        }
      }
      await fetchChatsQuiet().catch(() => {});
    } catch (e) {
      setSendError(e.message || "Failed to send");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId) return;
    try {
      await deleteItem(messageId);
      setMessages((prev) =>
        Array.isArray(prev) ? prev.filter((msg) => String(msg._id) !== String(messageId)) : prev,
      );
      await fetchChatsQuiet().catch(() => {});
    } catch (e) {
      setSendError(e.message || "Failed to delete message");
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedChatId) return;
    if (!window.confirm("Delete this conversation from your list?")) return;
    const removedId = selectedChatId;
    try {
      await deleteChat(removedId);
      setSelectedChatId((prev) => (String(prev) === String(removedId) ? null : prev));
      setMessages([]);
      await fetchChatsQuiet().catch(() => {});
    } catch (e) {
      setSendError(e.message || "Failed to delete conversation");
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-[#F0F2F5] via-[#8EC641]/5 to-[#2DA1D7]/5 dark:from-[#0A0A0B] dark:via-[#1e3a1e]/10 dark:to-[#0f2a3a]/10 overflow-hidden transition-colors duration-500 font-sans fixed inset-0 z-[50]">
      {/* [DESIGN NOTE]: Brand-consistent mixed theme (Doctor/Patient) layout */}
      <div
        className={`${selectedChatId ? "hidden md:flex" : "flex"} w-full md:w-1/3 flex-col bg-white dark:bg-[#121214] border-r border-gray-200 dark:border-gray-800 flex-shrink-0 transition-all duration-300`}
      >
        <div className="p-5 flex justify-between items-center bg-white dark:bg-[#121214] border-b border-gray-100 dark:border-gray-800">
          <Link
            to="/"
            className="flex items-center gap-3 active:scale-95 transition-transform group"
          >
            {/* [BRANDING]: Logo container with brand gradient accent */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2DA1D7] to-[#8EC641] p-0.5 shadow-lg group-hover:rotate-6 transition-transform">
              <img
                src={SugerWiseLogo}
                className="w-full h-full bg-white rounded-[0.9rem] object-contain"
                alt="Home"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-none tracking-tight">
                SugarWise
              </h1>
              <p className="text-[10px] text-[#2DA1D7] dark:text-[#8EC641] font-black uppercase tracking-widest mt-1">
                Clinical Messages
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-gray-400 hover:text-[#2DA1D7] p-2 hover:bg-[#2DA1D7]/5 dark:hover:bg-white/5 rounded-xl transition-all relative"
          >
            <Bell size={20} />
          </button>
          <button
            type="button"
            onClick={async () => {
              setShowNewInquiry(true);
              setDoctorsLoading(true);
              try {
                const res = await fetch('/api/doctors', { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
                const data = await res.json();
                setAllDoctors(Array.isArray(data.data) ? data.data : []);
              } catch { setAllDoctors([]); }
              setDoctorsLoading(false);
            }}
            className="text-white bg-[#8EC641] hover:bg-[#8EC641]/90 p-2 rounded-xl transition-all shadow-lg shadow-[#8EC641]/20"
          >
            <Plus size={20} />
          </button>
          </div>
        </div>

        <div className="p-6 pb-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              Chats
            </h2>
            <div className="px-3 py-1 bg-[#8EC641]/10 dark:bg-[#8EC641]/20 rounded-full border border-[#8EC641]/20">
              <span className="text-[10px] font-black text-[#8EC641] uppercase tracking-widest">
                Active
              </span>
            </div>
          </div>
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2DA1D7] transition-colors"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#1E1E22] rounded-2xl outline-none text-base dark:text-white border border-transparent focus:border-[#2DA1D7]/50 focus:ring-2 focus:ring-[#2DA1D7]/5 transition-all shadow-inner placeholder:text-gray-400"
            />
          </div>
        </div>

        {loading && (
          <p className="px-6 text-sm text-[#2DA1D7] font-black uppercase tracking-tight">Loading chats…</p>
        )}
        {error && (
          <p className="px-6 text-sm text-red-600 dark:text-red-400">
            Could not load chats. Sign in and try again.
          </p>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 px-4 py-2">
          {filteredRows.map((chat) => (
            <div
              key={chat.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedChatId(chat.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedChatId(chat.id);
              }}
              className={`flex items-center gap-4 p-5 rounded-[2rem] cursor-pointer transition-all duration-300 group border ${
                String(selectedChatId) === String(chat.id)
                  ? "bg-[#2DA1D7] border-[#2DA1D7]/50 shadow-2xl shadow-[#2DA1D7]/20 translate-x-1"
                  : "bg-white dark:bg-[#1e1e22]/40 border-transparent hover:bg-[#8EC641]/5 dark:hover:bg-[#1A1A1D] hover:translate-x-1"
              }`}
            >
              <div className="relative flex-shrink-0">
                <div
                  className={`p-0.5 rounded-2xl ${
                    String(selectedChatId) === String(chat.id)
                      ? "bg-white/30"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <img
                    src={chat.avatar}
                    className="w-12 h-12 rounded-[0.9rem] object-cover border border-white/10"
                    alt=""
                  />
                </div>
                {chat.status === "online" && (
                  <div
                    className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 shadow-sm ${
                      String(selectedChatId) === String(chat.id)
                        ? "bg-white border-[#2DA1D7]"
                        : "bg-[#8EC641] border-white dark:border-[#121214]"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3
                    className={`font-black truncate text-base tracking-tight ${
                      String(selectedChatId) === String(chat.id)
                        ? "text-white"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {chat.name}
                  </h3>
                  <span
                    className={`text-[10px] font-black tracking-widest uppercase ${
                      String(selectedChatId) === String(chat.id)
                        ? "text-white/70"
                        : "text-gray-400"
                    }`}
                  >
                    {chat.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p
                    className={`text-xs truncate pr-4 leading-relaxed ${
                      String(selectedChatId) === String(chat.id)
                        ? "text-white/80"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {chat.lastMsg || "—"}
                  </p>
                  {chat.unread > 0 && String(selectedChatId) !== String(chat.id) && (
                    <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg border border-red-400">
                      {chat.unread}
                    </span>
                  )}
                  {String(selectedChatId) === String(chat.id) && (
                    <ChevronRight size={14} className="text-white/50" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`${!selectedChatId ? "hidden md:flex" : "flex"} flex-1 md:w-2/3 flex-col bg-slate-50 dark:bg-[#080809] relative transition-all duration-500 overflow-hidden`}
      >
        {!selectedChatId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-24 h-24 bg-white dark:bg-[#121214] rounded-[3rem] flex items-center justify-center mb-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-bounce">
              <MessageSquare size={48} className="text-[#2DA1D7]" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2 uppercase">
              Your messages
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-base leading-relaxed font-medium">
              Select a conversation to chat with your healthcare clinical team.
            </p>
          </div>
        ) : (
          <Chat
            chat={selectedChat}
            messages={messages}
            messageLoading={msgLoading}
            sendError={sendError}
            currentUserId={userId}
            onSend={handleSend}
            onDeleteMessage={handleDeleteMessage}
            onDeleteChat={handleDeleteChat}
            isTyping={isOtherTyping}
            onTyping={handleTyping}
            onBack={() => setSelectedChatId(null)}
          />
        )}
      </div>

      {/* New Inquiry Modal */}
      {showNewInquiry && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setShowNewInquiry(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">New Inquiry</h3>
              <button onClick={() => setShowNewInquiry(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder="Search doctors..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm outline-none border border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:text-white"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
              {doctorsLoading && <p className="text-sm text-blue-600 text-center py-4">Loading doctors...</p>}
              {!doctorsLoading && allDoctors
                .filter((d) => {
                  const q = doctorSearch.trim().toLowerCase();
                  if (!q) return true;
                  const name = `${d.firstName || ''} ${d.lastName || ''} ${d.name || ''}`.toLowerCase();
                  return name.includes(q) || (d.specialty || '').toLowerCase().includes(q);
                })
                .map((doc) => (
                  <button
                    key={doc._id}
                    onClick={async () => {
                      // Find existing chat with this doctor
                      const existingChat = chatRows.find((c) => {
                        const raw = c.raw;
                        const peers = raw?.participants || [];
                        return peers.some((p) => {
                          const pid = p._id || p.id || p;
                          // Match by User ID OR by linked profile ID
                          return String(pid) === String(doc._id) || 
                                 String(p.doctor || '') === String(doc._id) ||
                                 String(p.patient || '') === String(doc._id);
                        });
                      });
                      if (existingChat) {
                        setSelectedChatId(existingChat.id);
                      } else {
                        // Send a greeting to trigger chat creation
                        try {
                          await sendMessage({
                            chatId: null,
                            senderId: userId,
                            recipientId: doc._id,
                            messageText: 'Hello, I would like to inquire.',
                          });
                          await fetchAll();
                        } catch (err) {
                          console.error('Failed to create inquiry', err);
                        }
                      }
                      setShowNewInquiry(false);
                      setDoctorSearch("");
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <img
                      src={doc.profileImage || doc.image || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100'}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {doc.name || `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'Doctor'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doc.specialty || 'General'}</p>
                    </div>
                  </button>
                ))}
              {!doctorsLoading && allDoctors.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No doctors found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
