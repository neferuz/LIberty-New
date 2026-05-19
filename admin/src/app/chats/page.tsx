"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Search, 
  Send, 
  User, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  Loader2,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface ChatSession {
  session_id: string;
  last_message: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

interface Message {
  id: number;
  content: string;
  is_admin: boolean;
  created_at: string;
}

export default function ChatsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession.session_id);
      const interval = setInterval(() => fetchMessages(selectedSession.session_id), 3000);
      return () => clearInterval(interval);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSessions = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    try {
      const res = await fetch("/api/v1/chats/admin/list");
      if (res.ok) {
        const data = await res.json();
        setSessions(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (sessionId: string) => {
    if (document.visibilityState !== "visible" || !sessionId) return;
    try {
      const res = await fetch(`/api/v1/chats/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession.session_id);
      const interval = setInterval(() => fetchMessages(selectedSession.session_id), 3000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [selectedSession, fetchMessages]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !inputText.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/chats/admin/reply?session_id=${selectedSession.session_id}&content=${encodeURIComponent(inputText)}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setInputText("");
        fetchMessages(selectedSession.session_id);
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setSending(false);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.last_message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight mb-0.5">Чаты с клиентами</h1>
          <p className="text-[13px] text-[#4f566b]">Оперативная поддержка и общение с пользователями.</p>
        </div>
        <button 
          onClick={fetchSessions}
          className="p-2 text-[#4f566b] hover:bg-[#f7f8f9] rounded-lg transition-all"
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="flex-1 min-h-0 bg-white border border-[#e3e8ee] rounded-xl overflow-hidden flex">
        {/* Sidebar: Chat List */}
        <div className={cn(
          "w-full md:w-80 border-r border-[#e3e8ee] flex flex-col bg-[#f7f8f9]/50 shrink-0",
          selectedSession && "hidden md:flex"
        )}>
          <div className="p-4 border-b border-[#e3e8ee] bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9]" />
              <input 
                type="text" 
                placeholder="Поиск чатов..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white text-[13px] rounded-lg outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {filteredSessions.length === 0 && !loading && (
              <div className="p-8 text-center text-[#4f566b] text-[13px]">
                Чатов пока нет
              </div>
            )}
            {filteredSessions.map((session) => (
              <button 
                key={session.session_id}
                onClick={() => setSelectedSession(session)}
                className={cn(
                  "w-full p-4 flex items-start gap-3 border-b border-[#e3e8ee] transition-all text-left group",
                  selectedSession?.session_id === session.session_id 
                    ? "bg-white border-l-4 border-l-[#2c3b6e]" 
                    : "hover:bg-white"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-[#1a1f36] flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                  {session.user_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[13px] font-bold text-[#1a1f36] truncate">{session.user_name}</span>
                    <span className="text-[10px] text-[#a3acb9] shrink-0">
                      {new Date(session.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' })}
                    </span>
                  </div>
                  {session.user_email && session.user_email !== "Не авторизован" && (
                    <div className="text-[9px] text-[#2c3b6e] font-semibold tracking-wide uppercase truncate mb-1 bg-[#2c3b6e]/5 px-1.5 py-0.5 rounded w-max max-w-full">
                      {session.user_email}
                    </div>
                  )}
                  <p className="text-[12px] text-[#4f566b] truncate line-clamp-1">
                    {session.last_message.startsWith("[Контакты]") 
                      ? "📥 Оставлены контакты для связи" 
                      : session.last_message}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col bg-white",
          !selectedSession && "hidden md:flex items-center justify-center bg-[#f7f8f9]/30"
        )}>
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#e3e8ee] flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedSession(null)}
                    className="md:hidden p-2 -ml-2 text-[#4f566b]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-[#1a1f36] flex items-center justify-center text-white text-[12px] font-bold">
                    {selectedSession.user_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#1a1f36] leading-none mb-1.5 flex items-center gap-2">
                      {selectedSession.user_name}
                      {selectedSession.user_email && selectedSession.user_email !== "Не авторизован" && (
                        <span className="text-[9px] bg-[#2c3b6e] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                          Клиент с формы
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-[#4f566b] flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold uppercase tracking-wider text-[#2c3b6e] text-[9px]">Контакты:</span>
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {selectedSession.user_email}
                      </span>
                    </p>
                  </div>
                </div>
                <button className="p-2 text-[#4f566b] hover:bg-[#f7f8f9] rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4 bg-[#fcfcfd]">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[70%]",
                      msg.is_admin ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    {msg.content.startsWith("[Контакты]") ? (
                      <div className="bg-slate-50 border border-[#e3e8ee] p-4 rounded-xl w-full space-y-2 mb-1">
                        <div className="flex items-center justify-between border-b border-[#e3e8ee] pb-1.5 mb-1.5">
                          <span className="text-[9px] font-black text-[#2c3b6e] uppercase tracking-widest">Контактная Информация</span>
                          <span className="text-[9px] bg-[#2c3b6e] text-white font-bold px-2 py-0.5 rounded-full uppercase">Форма</span>
                        </div>
                        <div className="grid grid-cols-3 gap-y-1.5 text-[11px] leading-normal">
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Имя:</span>
                          <span className="col-span-2 font-bold text-[#1a1f36]">{msg.content.match(/Имя:\s*([^,]+)/)?.[1] || "—"}</span>
                          
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Телефон:</span>
                          <span className="col-span-2 font-bold text-[#1a1f36]">
                            <a href={`tel:${msg.content.match(/Телефон:\s*([^,]+)/)?.[1]?.replace(/\s+/g, '')}`} className="hover:underline hover:text-[#2c3b6e]">
                              {msg.content.match(/Телефон:\s*([^,]+)/)?.[1] || "—"}
                            </a>
                          </span>
                          
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Email:</span>
                          <span className="col-span-2 font-bold text-[#1a1f36]">
                            <a href={`mailto:${msg.content.match(/Email:\s*([^,]+)/)?.[1]}`} className="hover:underline hover:text-[#2c3b6e]">
                              {msg.content.match(/Email:\s*([^,]+)/)?.[1] || "—"}
                            </a>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className={cn(
                        "p-3.5 rounded-2xl text-[13px] leading-relaxed",
                        msg.is_admin 
                          ? "bg-[#2c3b6e] text-white rounded-tr-none" 
                          : "bg-white border border-[#e3e8ee] text-[#1a1f36] rounded-tl-none shadow-none"
                      )}>
                        {msg.content}
                      </div>
                    )}
                    <span className="text-[10px] text-[#a3acb9] mt-1.5 px-1">
                      {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleReply} className="p-4 bg-white border-t border-[#e3e8ee] shrink-0">
                <div className="relative flex items-center gap-3">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ваше сообщение..." 
                    className="flex-1 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white pl-4 pr-12 py-3 text-[13px] rounded-xl outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="absolute right-2 p-2 bg-[#2c3b6e] text-white rounded-lg hover:bg-[#232f58] transition-all disabled:opacity-30"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-[#2c3b6e]/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-[#2c3b6e]/40" />
              </div>
              <h3 className="text-[15px] font-bold text-[#1a1f36] mb-1">Выберите чат для начала общения</h3>
              <p className="text-[12px] text-[#4f566b]">Все сообщения от клиентов будут отображаться здесь в реальном времени.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
