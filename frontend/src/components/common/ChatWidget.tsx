"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  content: string;
  is_admin: boolean;
  created_at: string;
}

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInFooter, setIsInFooter] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Session Management
  useEffect(() => {
    if (!localStorage.getItem("chat_session_id")) {
      localStorage.setItem("chat_session_id", Math.random().toString(36).substring(7));
    }
  }, []);

  const getSessionId = () => localStorage.getItem("chat_session_id") || "guest";

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/chats/${getSessionId()}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 500;
      setIsInFooter(scrollPosition > threshold);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;

    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      const res = await fetch("http://localhost:8000/api/v1/chats/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: inputText,
          session_id: getSessionId(),
          sender_id: user?.id || null
        })
      });

      if (res.ok) {
        setInputText("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "z-[110] bg-white flex flex-col overflow-hidden",
              "fixed inset-0 w-full h-full sm:absolute sm:inset-auto sm:bottom-20 sm:right-0 sm:w-80 sm:h-[450px] sm:border sm:border-[#e3e8ee] sm:rounded-2xl"
            )}
          >
            {/* Header - No Shadow */}
            <div className="bg-brand-blue p-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest">Поддержка</h3>
                  <p className="text-[10px] text-white/60">В сети — Отвечаем за 5 мин</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-2">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 bg-slate-50/50 overflow-y-auto space-y-4">
              <div className="bg-white p-3 text-[11px] text-brand-blue border border-[#e3e8ee] max-w-[85%]">
                Здравствуйте! Чем мы можем вам помочь сегодня?
              </div>
              
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-1",
                    msg.is_admin ? "items-start" : "items-end"
                  )}
                >
                  <div className="flex items-end gap-2 max-w-[90%]">
                    {msg.is_admin && (
                      <div className="w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center text-[10px] font-bold text-white shrink-0 mb-1">
                        A
                      </div>
                    )}
                    <div 
                      className={cn(
                        "p-3 text-[11px] border leading-relaxed",
                        msg.is_admin 
                          ? "bg-white text-brand-blue border-[#e3e8ee]" 
                          : "bg-brand-blue text-white border-transparent"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-400 uppercase tracking-widest px-1">
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#e3e8ee] flex gap-2">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Введите сообщение..." 
                className="flex-1 text-xs bg-transparent focus:outline-none placeholder:text-slate-400 min-w-0"
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || loading}
                className="w-8 h-8 bg-brand-blue flex items-center justify-center text-white hover:bg-slate-800 transition-colors flex-shrink-0 disabled:opacity-30"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button - No Shadow */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 active:scale-95 border backdrop-blur-md",
          isInFooter 
            ? "bg-white text-brand-blue border-[#e3e8ee] scale-105 md:scale-110" 
            : "bg-brand-blue text-white border-transparent"
        )}
      >
        {isOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <MessageSquare className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
      </button>
    </div>
  );
};
