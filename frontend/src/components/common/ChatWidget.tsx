"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2, User, Phone, Mail } from "lucide-react";
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

  // Guest pre-chat form states
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [contactsSubmitted, setContactsSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Session Management & Contact check
  useEffect(() => {
    if (!localStorage.getItem("chat_session_id")) {
      localStorage.setItem("chat_session_id", Math.random().toString(36).substring(7));
    }

    const isSubmitted = localStorage.getItem("chat_contacts_submitted") === "true";
    const isLoggedIn = !!localStorage.getItem("token") || !!localStorage.getItem("user");
    if (isSubmitted || isLoggedIn) {
      setContactsSubmitted(true);
    }
  }, []);

  const getSessionId = () => localStorage.getItem("chat_session_id") || "guest";

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/v1/chats/${getSessionId()}`);
      if (res.ok) {
        const data = await res.json();
        // Filter out the system [Контакты] message from showing to the customer in the message list
        const filtered = data.filter((msg: Message) => !msg.content.startsWith("[Контакты]"));
        setMessages(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    if (isOpen && contactsSubmitted) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, contactsSubmitted]);

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

  const handleContactsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim() || !guestEmail.trim() || loading) return;

    setLoading(true);
    try {
      const contactPayload = `[Контакты] Имя: ${guestName.trim()}, Телефон: ${guestPhone.trim()}, Email: ${guestEmail.trim()}`;
      
      const res = await fetch("/api/v1/chats/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contactPayload,
          session_id: getSessionId(),
          sender_id: null
        })
      });

      if (res.ok) {
        localStorage.setItem("chat_contacts_submitted", "true");
        localStorage.setItem("chat_guest_name", guestName.trim());
        localStorage.setItem("chat_guest_phone", guestPhone.trim());
        localStorage.setItem("chat_guest_email", guestEmail.trim());
        setContactsSubmitted(true);
        fetchMessages();
      }
    } catch (err) {
      console.error("Failed to submit guest contact info:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;

    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      const res = await fetch("/api/v1/chats/", {
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
              "fixed inset-0 w-full h-full sm:absolute sm:inset-auto sm:bottom-20 sm:right-0 sm:w-80 sm:h-[450px] sm:border sm:border-[#e3e8ee] sm:rounded-2xl shadow-2xl"
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
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-2 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!contactsSubmitted ? (
              /* Pre-Chat Guest Form styled beautifully matching the footer design */
              <form onSubmit={handleContactsSubmit} className="flex-1 p-5 flex flex-col justify-center bg-white space-y-4 overflow-y-auto">
                <div className="text-center space-y-1 mb-2">
                  <h4 className="text-[12px] font-extrabold text-brand-blue uppercase tracking-widest">Представьтесь, пожалуйста</h4>
                  <p className="text-[10px] text-slate-400">Оставьте ваши контакты, чтобы мы могли помочь вам!</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1 relative">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <User className="w-2.5 h-2.5" />
                      Ваше Имя
                    </label>
                    <input 
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Иван Иванов"
                      className="w-full text-xs border border-[#e3e8ee] focus:border-brand-blue px-3 py-2.5 rounded-lg outline-none transition-all placeholder:text-slate-350"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" />
                      Номер телефона
                    </label>
                    <input 
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+998 (90) 123-45-67"
                      className="w-full text-xs border border-[#e3e8ee] focus:border-brand-blue px-3 py-2.5 rounded-lg outline-none transition-all placeholder:text-slate-350"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5" />
                      E-mail почта
                    </label>
                    <input 
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="example@mail.com"
                      className="w-full text-xs border border-[#e3e8ee] focus:border-brand-blue px-3 py-2.5 rounded-lg outline-none transition-all placeholder:text-slate-350"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-blue hover:bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 active:scale-[0.98] border border-transparent rounded-lg"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Начать общение"}
                </button>
              </form>
            ) : (
              /* Regular Chat Area */
              <>
                {/* Messages Area */}
                <div className="flex-1 p-4 bg-slate-50/50 overflow-y-auto space-y-4">
                  <div className="bg-white p-3 text-[11px] text-brand-blue border border-[#e3e8ee] max-w-[85%] rounded-2xl rounded-tl-none leading-relaxed">
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
                            "p-3 text-[11px] border leading-relaxed rounded-2xl",
                            msg.is_admin 
                              ? "bg-white text-brand-blue border-[#e3e8ee] rounded-tl-none" 
                              : "bg-brand-blue text-white border-transparent rounded-tr-none"
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
                    className="w-8 h-8 bg-brand-blue flex items-center justify-center text-white hover:bg-slate-800 transition-colors flex-shrink-0 disabled:opacity-30 cursor-pointer rounded-lg"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button - No Shadow */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 active:scale-95 border backdrop-blur-md cursor-pointer",
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
