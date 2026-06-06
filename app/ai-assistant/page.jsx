// app/ai-assistant/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { chatbotService } from "../services/chatbot.service";
import Link from "next/link";

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  
  // ⚡ حالتان جديدتان للتحقق من سلامة خادم الـ AI
  const [isServerHealthy, setIsServerHealthy] = useState(true);
  const [checkingHealth, setCheckingHealth] = useState(true);

  const messagesEndRef = useRef(null);

  // 1. فحص الـ Health Check وتوليد الجلسة عند تحميل الصفحة
  useEffect(() => {
    const initChatbot = async () => {
      try {
        setCheckingHealth(true);
        // ضرب الـ Endpoint التي أرسلتها للتأكد من الحالة
        const health = await chatbotService.checkHealth();
        
        if (health && health.status === "ok" && health.database === true) {
          setIsServerHealthy(true);
          
          // إذا كان السيرفر سليماً، نجهز الجلسة والترحيب
          const generateSession = () => "session_" + Math.random().toString(36).substr(2, 9);
          let currentSession = localStorage.getItem("darak_ai_session");
          if (!currentSession) {
            currentSession = generateSession();
            localStorage.setItem("darak_ai_session", currentSession);
          }
          setSessionId(currentSession);
          
          setMessages([
            { sender: "bot", text: "أهلاً بك في منصة دارك! 🏢 أنا مساعدك العقاري الذكي. كيف يمكنني مساعدتك في البحث عن عقار أو استثمار اليوم؟" }
          ]);
        } else {
          setIsServerHealthy(false);
        }
      } catch (err) {
        console.error("Health check failed:", err);
        setIsServerHealthy(false);
      } finally {
        setCheckingHealth(false);
      }
    };

    initChatbot();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !isServerHealthy) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    loading && setStatus(true);
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(userMessage, sessionId);
      const botReply = response?.reply_message || response?.message || "تمت معالجة طلبك.";
      const botUrls = response?.urls || [];
      
      if (response?.session_id) {
        setSessionId(response.session_id);
        localStorage.setItem("darak_ai_session", response.session_id);
      }

      setMessages(prev => [...prev, { sender: "bot", text: botReply, urls: botUrls }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { sender: "bot", text: "عذراً، واجهت مشكلة أثناء معالجة رسالتك.", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("هل أنت متأكد من مسح المحادثة بالكامل؟")) return;
    try {
      await chatbotService.deleteSession(sessionId);
      setMessages([{ sender: "bot", text: "تم بدء محادثة جديدة. كيف يمكنني مساعدتك؟" }]);
      const newSession = "session_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("darak_ai_session", newSession);
      setSessionId(newSession);
    } catch (err) {
      console.error("Failed to clear session:", err);
    }
  };

  const getAnnouncementId = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1] || "عقار";
  };

  // ─── 1. واجهة جاري الفحص (Loading State) ───
  if (checkingHealth) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col items-center justify-center text-center p-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4" />
        <p className="text-sm font-bold text-slate-600">جاري الاتصال بالمستشار العقاري الذكي وفحص حالة النظام...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-8 px-4 sm:px-6 flex justify-center text-right" dir="rtl">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[80vh]">
        
        {/* رأس المحادثة */}
        <div className="bg-indigo-600 p-4 sm:p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl shadow-inner border border-white/30 backdrop-blur-sm">🤖</div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">مستشارك العقاري الذكي</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isServerHealthy ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
                <span className="text-xs text-indigo-100 font-medium">
                  {isServerHealthy ? "متصل ومستعد للمساعدة" : "غير متصل حالياً"}
                </span>
              </div>
            </div>
          </div>
          {isServerHealthy && (
            <button onClick={handleClearChat} className="text-xs font-bold bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-1">
              <span>🗑️</span> مسح المحادثة
            </button>
          )}
        </div>

        {/* ─── 2. واجهة السيرفر المعطل (Server Offline UI) ─── */}
        {!isServerHealthy ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 space-y-4">
            <div className="text-5xl">🛠️</div>
            <h3 className="text-lg font-black text-slate-800">صيانة مؤقتة في نظام الذكاء الاصطناعي</h3>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed">
              المساعد العقاري الذكي يمر بفترة صيانة قصيرة لتحديث قاعدة بيانات العقارات وتطوير التوصيات. نعتذر عن هذا العطل، ويمكنك استخدام محرك البحث التقليدي في الموقع مؤقتاً!
            </p>
            <Link href="/search" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition">
              الذهاب إلى صفحة البحث التقليدي 🔍
            </Link>
          </div>
        ) : (
          <>
            {/* منطقة الرسائل الطبيعية */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}>
                  <div className={`flex max-w-[85%] sm:max-w-[75%] gap-3 ${msg.sender === "user" ? "flex-row" : "flex-row-reverse"}`}>
                    
                    <div className="shrink-0 mt-auto mb-1">
                      {msg.sender === "user" ? (
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-sm">أنت</div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-sm text-sm">🤖</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.sender === "user" 
                          ? "bg-slate-800 text-white rounded-br-none" 
                          : msg.isError 
                            ? "bg-red-50 text-red-700 border border-red-100 rounded-bl-none"
                            : "bg-white border border-slate-200 text-slate-700 rounded-bl-none"
                      }`}>
                        {msg.text}
                      </div>

                      {msg.urls && msg.urls.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1 justify-start">
                          {msg.urls.map((url, uIdx) => (
                            <Link 
                              key={uIdx}
                              href={`/announcement/${getAnnouncementId(url)}`}
                              className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 text-xs font-bold px-3 py-2 rounded-xl transition shadow-sm"
                            >
                              🏢 استعراض العقار رقم {getAnnouncementId(url)} &larr;
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-end">
                  <div className="flex gap-3 flex-row-reverse max-w-[85%]">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center mt-auto mb-1 text-sm">🤖</div>
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm">
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* حقل إدخال النص */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  placeholder="اسألني عن أسعار العقارات، أين تستثمر، أو أي استشارة عقارية..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-4 pl-14 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white w-10 h-10 rounded-xl flex items-center justify-center transition"
                >
                  <svg className="w-5 h-5 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[10px] text-slate-400 font-medium">الذكاء الاصطناعي قد يخطئ أحياناً، يرجى التحقق من المعلومات الاستثمارية الهامة.</span>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}