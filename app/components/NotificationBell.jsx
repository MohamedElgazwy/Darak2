"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/app/services/api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // جلب الإشعارات من السيرفر بأمان
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/Notifications/List");
      
      // 🟢 قنص المصفوفة بذكاء بناءً على الهيكل الموحد للباك إند التابع لـ Darak
      const rawData = res?.data?.data || res?.data?.items || res?.data || res || [];
      const finalArray = Array.isArray(rawData) ? rawData : (Array.isArray(rawData.items) ? rawData.items : []);
      
      setNotifications(finalArray);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]); // حماية الـ State في حالة حدوث خطأ أجاكس
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Polling كل دقيقتين لتحديث الإشعارات تلقائياً
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

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

  // 🟢 تأمين الفلترة: التشييك أولاً أن notifications مصفوفة صريحة
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.isRead && !n.isReaded && !n.isReadbyUser).length;

  // الضغط على الإشعار لجعله مقروءاً
  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/Notifications/mark-as-read/${id}`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true, isReaded: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  return (
    <div className="relative text-right" dir="rtl" ref={dropdownRef}>
      {/* زر جرس الإشعارات */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition focus:outline-none"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* شارة العدد فوق الجرس */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* القائمة المنسدلة للإشعارات */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-900">الإشعارات الأخيرة</span>
            {unreadCount > 0 && <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">جديد</span>}
          </div>

          <div className="max-h-64 overflow-y-auto mt-1 divide-y divide-slate-100">
            {safeNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">لا توجد إشعارات حالياً.</div>
            ) : (
              safeNotifications.map((notif, index) => {
                const isRead = notif.isRead || notif.isReaded;
                return (
                  <div
                    key={notif.id || index}
                    onClick={() => !isRead && handleMarkAsRead(notif.id)}
                    className={`p-3 text-right cursor-pointer transition rounded-xl ${
                      isRead ? "opacity-60 hover:bg-slate-50" : "bg-indigo-50/40 hover:bg-indigo-50/80 font-medium"
                    }`}
                  >
                    <p className="text-xs text-slate-800 leading-relaxed">
                      {notif.message || notif.title || "تحديث جديد بخصوص الحساب"}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString("ar-EG") : "الآن"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}