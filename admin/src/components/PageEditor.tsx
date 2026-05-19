"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Heading2, 
  Heading3, 
  Type, 
  Eye, 
  Edit3,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageEditorProps {
  pageName: string;
  pageTitle: string;
  defaultTitle: string;
  defaultHtml: string;
}

export default function PageEditor({ pageName, pageTitle, defaultTitle, defaultHtml }: PageEditorProps) {
  const [title, setTitle] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [initialTitle, setInitialTitle] = useState("");
  const [initialHtmlContent, setInitialHtmlContent] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  
  // Toolbar states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const hasUnsavedChanges = title !== initialTitle || htmlContent !== initialHtmlContent;

  useEffect(() => {
    fetchPageContent();
  }, [pageName]);

  // Set innerHTML once content has loaded and ref is fully mounted in the DOM
  useEffect(() => {
    if (!loading && editorRef.current) {
      editorRef.current.innerHTML = htmlContent;
    }
  }, [loading, pageName]);

  const fetchPageContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/pages/${pageName}?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data || {};
        
        const loadedTitle = data.title || defaultTitle;
        const loadedHtml = data.htmlContent || defaultHtml;
        
        setTitle(loadedTitle);
        setHtmlContent(loadedHtml);
        setInitialTitle(loadedTitle);
        setInitialHtmlContent(loadedHtml);
      }
    } catch (err) {
      console.error(`Failed to fetch ${pageName} content:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges && !saving) return;

    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/pages/${pageName}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            title,
            htmlContent
          }
        })
      });

      if (res.ok) {
        setInitialTitle(title);
        setInitialHtmlContent(htmlContent);
        setMessage({ type: "success", text: "Страница успешно сохранена" });
      } else {
        setMessage({ type: "error", text: "Не удалось сохранить страницу" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Ошибка соединения с сервером" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // Sync editor content on input
  const handleEditorInput = () => {
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
  };

  // Keep formatting button states active based on selection
  const checkSelectionState = () => {
    setIsBold(document.queryCommandState("bold"));
    setIsItalic(document.queryCommandState("italic"));
    setIsUnderline(document.queryCommandState("underline"));
  };

  // Format action execution
  const executeCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    checkSelectionState();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Handle default key behaviors inside lists
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      executeCommand("indent");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-150 rounded" />
            <div className="h-3.5 w-64 bg-slate-100 rounded" />
          </div>
          <div className="h-8 w-24 bg-slate-100 rounded" />
        </div>
        <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 h-[400px] space-y-4">
          <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded-lg" />
          <div className="h-8 bg-slate-50 border border-[#e3e8ee] rounded-lg w-1/2" />
          <div className="h-64 bg-slate-50 border border-[#e3e8ee] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic Notifications */}
      <div className="fixed top-8 right-8 z-[120] pointer-events-none">
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="min-w-[320px] p-4 rounded-lg shadow-2xl flex items-center gap-4 pointer-events-auto bg-[#1a1f36] text-white border border-white/10 backdrop-blur-xl"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                message.type === "success" ? "bg-[#10b981]" : "bg-[#cd5c5c]"
              )}>
                {message.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-white" />
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-[13px] font-bold tracking-tight">
                  {message.type === "success" ? "Успешно" : "Ошибка"}
                </p>
                <p className="text-[11px] text-white/70 font-medium leading-normal">
                  {message.text}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6 animate-in fade-in duration-500 pb-32 w-full">
        
        {/* Top bar header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-[#1a1f36] tracking-tight mb-0.5 uppercase">
              {pageTitle}
            </h1>
            <p className="text-[13px] text-[#4f566b]">
              Управление и форматирование контента страницы.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Tab togglers */}
            <div className="flex bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg p-0.5 text-xs font-semibold mr-2">
              <button
                onClick={() => setActiveTab("edit")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer",
                  activeTab === "edit" ? "bg-white text-[#2c3b6e] shadow-sm" : "text-[#4f566b] hover:text-slate-900"
                )}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Редактирование
              </button>
              <button
                onClick={() => {
                  setActiveTab("preview");
                  // Make sure we have the latest content updated
                  if (editorRef.current) {
                    setHtmlContent(editorRef.current.innerHTML);
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer",
                  activeTab === "preview" ? "bg-white text-[#2c3b6e] shadow-sm" : "text-[#4f566b] hover:text-slate-900"
                )}
              >
                <Eye className="w-3.5 h-3.5" />
                Предпросмотр
              </button>
            </div>

            <button 
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider rounded-md transition-all border",
                hasUnsavedChanges 
                  ? "text-white bg-[#2c3b6e] border-[#2c3b6e] hover:bg-[#232f58] cursor-pointer" 
                  : "text-[#a3acb9] bg-[#f7f8f9] border-[#e3e8ee] cursor-not-allowed"
              )}
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Сохранить
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#e3e8ee] rounded-xl shadow-sm overflow-hidden w-full">
          
          {/* Edit Workspace - kept alive in DOM to maintain focus and caret position */}
          <div className={cn("flex flex-col", activeTab !== "edit" && "hidden")}>
            
            {/* Page Title Field */}
            <div className="p-4 border-b border-[#e3e8ee] bg-[#fcfcfd]/50 space-y-1.5">
              <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-[0.15em]">Заголовок страницы</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm font-medium text-slate-800 bg-white border border-[#e3e8ee] px-3 py-2 rounded-lg outline-none focus:border-[#2c3b6e]/30 focus:ring-1 focus:ring-[#2c3b6e]/10 transition-all"
                placeholder="Введите заголовок..."
              />
            </div>

            {/* Rich-Text Editing Toolbar */}
            <div className="px-3 py-1.5 bg-slate-50 border-b border-[#e3e8ee] flex flex-wrap items-center gap-1">
              {/* Format buttons */}
              <button
                type="button"
                onClick={() => executeCommand("bold")}
                className={cn(
                  "p-1.5 rounded hover:bg-[#e3e8ee] transition-all cursor-pointer",
                  isBold ? "bg-[#2c3b6e]/10 text-[#2c3b6e] font-bold" : "text-[#4f566b]"
                )}
                title="Жирный"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("italic")}
                className={cn(
                  "p-1.5 rounded hover:bg-[#e3e8ee] transition-all cursor-pointer",
                  isItalic ? "bg-[#2c3b6e]/10 text-[#2c3b6e]" : "text-[#4f566b]"
                )}
                title="Курсив"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("underline")}
                className={cn(
                  "p-1.5 rounded hover:bg-[#e3e8ee] transition-all cursor-pointer",
                  isUnderline ? "bg-[#2c3b6e]/10 text-[#2c3b6e]" : "text-[#4f566b]"
                )}
                title="Подчеркнутый"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-4 bg-[#e3e8ee] mx-1" />

              {/* Headings */}
              <button
                type="button"
                onClick={() => executeCommand("formatBlock", "<h2>")}
                className="p-1.5 rounded text-[#4f566b] hover:bg-[#e3e8ee] transition-all font-semibold flex items-center gap-0.5 text-xs cursor-pointer"
                title="Заголовок H2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("formatBlock", "<h3>")}
                className="p-1.5 rounded text-[#4f566b] hover:bg-[#e3e8ee] transition-all font-semibold flex items-center gap-0.5 text-xs cursor-pointer"
                title="Заголовок H3"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("formatBlock", "<p>")}
                className="p-1.5 rounded text-[#4f566b] hover:bg-[#e3e8ee] transition-all font-semibold flex items-center gap-0.5 text-xs cursor-pointer"
                title="Обычный текст"
              >
                <Type className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-4 bg-[#e3e8ee] mx-1" />

              {/* Lists */}
              <button
                type="button"
                onClick={() => executeCommand("insertUnorderedList")}
                className="p-1.5 rounded text-[#4f566b] hover:bg-[#e3e8ee] transition-all cursor-pointer"
                title="Маркированный список"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("insertOrderedList")}
                className="p-1.5 rounded text-[#4f566b] hover:bg-[#e3e8ee] transition-all cursor-pointer"
                title="Нумерованный список"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>

              <div className="ml-auto flex items-center gap-1 bg-[#2c3b6e]/5 border border-[#2c3b6e]/10 px-2 py-0.5 rounded text-[9px] font-bold text-[#2c3b6e] uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5 text-[#2c3b6e]" />
                WYSIWYG РЕДАКТОР
              </div>
            </div>

            {/* Editable Content Workspace */}
            <div 
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              onSelect={checkSelectionState}
              onKeyDown={handleKeyDown}
              className={cn(
                "p-5 min-h-[300px] outline-none overflow-y-auto text-slate-700 leading-relaxed font-sans prose prose-slate max-w-none focus:bg-white transition-colors bg-[#fcfcfd]/20",
                "admin-editor-workspace"
              )}
              {...{ placeholder: "Начните писать контент здесь..." }}
              style={{ fontFamily: "inherit" }}
            />

            {/* CSS hacks for clean contentEditable view inside panel */}
            <style jsx global>{`
              .admin-editor-workspace h2 {
                font-size: 1.125rem;
                font-weight: 600;
                color: #0f172a;
                margin-top: 1rem;
                margin-bottom: 0.5rem;
              }
              .admin-editor-workspace h3 {
                font-size: 1rem;
                font-weight: 500;
                color: #0f172a;
                margin-top: 0.85rem;
                margin-bottom: 0.4rem;
              }
              .admin-editor-workspace p {
                margin-bottom: 0.75rem;
                font-size: 0.85rem;
              }
              .admin-editor-workspace ul {
                list-style-type: disc;
                padding-left: 1.25rem;
                margin-bottom: 0.75rem;
                font-size: 0.85rem;
              }
              .admin-editor-workspace ol {
                list-style-type: decimal;
                padding-left: 1.25rem;
                margin-bottom: 0.75rem;
                font-size: 0.85rem;
              }
              .admin-editor-workspace li {
                margin-bottom: 0.25rem;
              }
              .admin-editor-workspace strong {
                font-weight: 700;
                color: #000;
              }
              .admin-editor-workspace em {
                font-style: italic;
              }
              .admin-editor-workspace u {
                text-decoration: underline;
              }
              .admin-editor-workspace:empty:before {
                content: attr(placeholder);
                color: #a3acb9;
                font-style: italic;
              }
            `}</style>
          </div>

          {/* Live Preview Workspace representing customer frontend view */}
          <div className={cn("p-6 md:p-8 bg-white min-h-[350px] overflow-y-auto", activeTab !== "preview" && "hidden")}>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-light mb-4 md:mb-8 tracking-tight text-black border-b border-slate-100 pb-3">
                {title || "Без заголовка"}
              </h1>
              
              {/* Dynamically parsed HTML container matching the style sheet */}
              <div 
                dangerouslySetInnerHTML={{ __html: htmlContent }} 
                className="space-y-4 md:space-y-6 text-slate-600 text-xs md:text-sm leading-relaxed preview-content-layout"
              />
            </div>
            
            <style jsx global>{`
              .preview-content-layout h2 {
                font-size: 1.125rem;
                font-weight: 500;
                color: #000;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
              }
              @media (min-width: 768px) {
                .preview-content-layout h2 {
                  font-size: 1.25rem;
                }
              }
              .preview-content-layout h3 {
                font-size: 1rem;
                font-weight: 500;
                color: #000;
                margin-top: 1.15rem;
                margin-bottom: 0.5rem;
              }
              .preview-content-layout p {
                margin-bottom: 0.75rem;
              }
              .preview-content-layout ul {
                list-style-type: disc;
                padding-left: 1.25rem;
                margin-bottom: 0.75rem;
                color: #475569;
              }
              .preview-content-layout ol {
                list-style-type: decimal;
                padding-left: 1.25rem;
                margin-bottom: 0.75rem;
                color: #475569;
              }
              .preview-content-layout li {
                margin-bottom: 0.35rem;
              }
              .preview-content-layout strong {
                font-weight: 700;
                color: #000;
              }
              .preview-content-layout em {
                font-style: italic;
              }
              .preview-content-layout u {
                text-decoration: underline;
              }
            `}</style>
          </div>
        </div>

        {/* Floating Save controls */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div 
              initial={{ y: 100, x: "-50%" }}
              animate={{ y: 0, x: "-50%" }}
              exit={{ y: 100, x: "-50%" }}
              className="fixed bottom-6 left-1/2 z-[100]"
            >
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-[#2c3b6e] text-white px-6 py-3 rounded-full hover:bg-[#232f58] shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 font-bold text-[12px] uppercase tracking-wider group"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                Сохранить изменения
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
