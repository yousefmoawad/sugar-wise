import React, { useEffect, useRef, useState } from "react";
import { X, Send, Sparkles, Bot } from "lucide-react";
import ReactDOM from "react-dom";
import { callGroqAPI } from "./CallAPI";

const initialMessage =
  "Hello! I can share general diabetes-related medical information about glucose, insulin, meals, exercise, and warning signs.";

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { id: "welcome", role: "bot", text: initialMessage },
  ]);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isTyping) return;

    const userEntry = { id: `user-${Date.now()}`, role: "user", text: trimmed };
    setChatHistory((prev) => [...prev, userEntry]);
    setMessage("");
    setError("");
    setIsTyping(true);

    try {
      // Calling the direct Groq API function
      const answer = await callGroqAPI(trimmed);

      setChatHistory((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, role: "bot", text: answer },
      ]);
    } catch (sendError) {
      console.error("Chat Error:", sendError);
      const msg = sendError.message || "Failed to reach chatbot";
      setError(msg);
      setChatHistory((prev) => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          role: "bot",
          text: "I could not load a medical reply right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const chatContent = (
    <>
      {/* [FLOATING BUTTON]: Branded AI entry point with ripple effect */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 z-[10000] hover:scale-110 active:scale-95 ${
          isOpen
            ? "bg-rose-500 rotate-90 text-white"
            : "bg-gradient-to-tr from-[#2DA1D7] to-[#8EC641] text-white shadow-[#2DA1D7]/20"
        }`}
      >
        {isOpen ? <X size={28} /> : <Bot size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DA1D7] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#8EC641]"></span>
          </span>
        )}
      </button>

      {/* [CHAT WINDOW]: Premium interface with branded gradients */}
      <div
        className={`fixed bottom-24 right-6 w-[90vw] sm:w-[420px] h-[72vh] max-h-[640px] bg-white dark:bg-gray-900 shadow-2xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800 transition-all duration-500 z-[9999] overflow-hidden flex flex-col ${
          isOpen
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-12 opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <div className="p-6 bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg">SugarWise Medical AI</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="text-xs text-white/90 font-medium uppercase tracking-wider">
                  Verified Medical Guidance
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* [CHAT HISTORY]: Branded gradient background for a premium feel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-br from-white via-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-gray-950 dark:via-[#1a5f7f]/10 dark:to-[#4d6a23]/10">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[84%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  chat.role === "user"
                    ? "bg-[#2DA1D7] text-white rounded-tr-none shadow-lg shadow-[#2DA1D7]/20"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm"
                }`}
              >
                {chat.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="max-w-[84%] p-4 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 shadow-sm italic text-xs">
                Analyzing medical literature for the best guidance...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          {error ? (
            <p className="mb-2 text-xs text-red-500">{error}</p>
          ) : null}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about diabetes, diet, or insulin..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-5 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-[#2DA1D7]/50 dark:text-white transition-all text-sm"
            />
            <button
              type="submit"
              disabled={!message.trim() || isTyping}
              className="w-12 h-12 bg-[#2DA1D7] hover:bg-[#1a5f7f] text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-[#2DA1D7]/20"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-3 font-medium uppercase tracking-tighter italic">
            <Sparkles size={10} className="inline mr-1 text-[#8EC641]" /> Sugar Wise AI Support
          </p>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(chatContent, document.body);
};

export default AIChat;
