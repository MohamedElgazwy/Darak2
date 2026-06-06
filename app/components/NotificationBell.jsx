"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/app/services/api";
import { useAuth } from "@/app/hooks/useAuth";

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. جلب الإشعارات من السيرفر طبقاً للـ Endpoint الجديدة
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get("/Notifications/List");
      // الوصول للمصفوفة داخل value كما في الـ JSON المرسل
      const data = res?.data?.value || []; 
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // اختياري: تحديث الإشعارات كل دقيقة تلقائياً
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // 2. دالة التحديد كمقروء (Mark as Read)
  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/Notifications/mark-as-read/${id}`);
      
      // تحديث الحالة محلياً فوراً لتحسين تجربة المستخدم (UI Optimistic Update)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── زر الجرس ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all duration-200 focus:outline-none border border-transparent hover:border-slate-200 bg-white shadow-sm"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* ── القائمة المنسدلة ── */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-3 w-85 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200" dir="rtl">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-sm">التنبيهات والإشعارات</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                {unreadCount} جديدة
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            {loading && notifications.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400 font-bold animate-pulse">
                جاري جلب آخر التحديثات...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="text-4xl text-slate-200">📭</div>
                <p className="text-sm text-slate-400 font-medium">صندوق الإشعارات فارغ حالياً</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                    className={`p-4 transition-all cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${
                      !n.isRead ? "bg-indigo-50/30 border-r-4 border-r-indigo-500" : ""
                    }`}
                  >
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.isRead ? "bg-indigo-600" : "bg-transparent"}`} />
                    <div className="flex-1 text-right">
                      <p className={`text-sm ${!n.isRead ? "font-black text-slate-900" : "font-semibold text-slate-600"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-[10px] text-slate-400 font-medium">
                           {new Date(n.createdAt).toLocaleDateString("ar-EG", {
                             hour: '2-digit',
                             minute: '2-digit'
                           })}
                         </span>
                         {!n.isRead && (
                           <span className="text-[9px] font-bold text-indigo-600 opacity-70">● اضغط للقراءة</span>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button 
              onClick={fetchNotifications}
              className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition"
            >
              🔄 تحديث القائمة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}