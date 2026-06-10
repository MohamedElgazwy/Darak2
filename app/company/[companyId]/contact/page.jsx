"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useCompanyTheme } from "@/app/context/CompanyThemeContext";

export default function CompanyContactPage() {
  const params = useParams();
  const companyId = params?.companyId;
  const { storeData } = useCompanyTheme(); // 👈 جلب الألوان الديناميكية

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // إذا كانت الألوان لم تحمل بعد
  if (!storeData) return <div className="min-h-[50vh]"></div>;
  const theme = storeData.themeStyles; // 👈 سحب قاموس الألوان!

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 💡 قريباً: سيتم استدعاء الـ API هنا بمجرد أن يوفره الباك إند
      // await api.post(`/API/Companies/${companyId}/Contact`, formData);
      
      // محاكاة مؤقتة للنجاح لحين توفر الـ API
      setTimeout(() => {
        setSuccess(true);
        setIsSubmitting(false);
        setFormData({ name: "", phone: "", email: "", message: "" });
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-right space-y-10" dir="rtl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-4">📞 تواصل معنا</h1>
        <div className={`w-20 h-1.5 mx-auto rounded-full mb-4 ${theme.accentBg}`} />
        <p className={`text-lg leading-relaxed ${theme.mutedText}`}>
          لديك استفسار عن عقار معين؟ اترك رسالتك وسيقوم فريقنا بالتواصل معك في أقرب وقت.
        </p>
      </div>

      {success ? (
        <div className={`border p-10 rounded-[2rem] text-center shadow-sm ${theme.card}`}>
          <span className="text-6xl mb-4 block">✅</span>
          <h3 className="text-2xl font-bold mb-2">تم إرسال رسالتك بنجاح!</h3>
          <p className={theme.mutedText}>شكراً لتواصلك معنا. سنقوم بالرد عليك قريباً.</p>
          <button 
            onClick={() => setSuccess(false)} 
            className={`mt-8 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${theme.accentBg}`}
          >
            إرسال رسالة أخرى
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={`p-8 md:p-12 rounded-[2.5rem] shadow-sm border space-y-8 transition-all ${theme.card}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold opacity-80">الاسم بالكامل</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className={`w-full p-4 border rounded-xl outline-none focus:ring-2 transition-all bg-transparent ${theme.divider}`} 
                placeholder="محمد أحمد..." 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold opacity-80">رقم الهاتف</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                className={`w-full p-4 border rounded-xl outline-none focus:ring-2 transition-all bg-transparent ${theme.divider}`} 
                placeholder="010..." 
                dir="ltr" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold opacity-80">البريد الإلكتروني (اختياري)</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className={`w-full p-4 border rounded-xl outline-none focus:ring-2 transition-all bg-transparent ${theme.divider}`} 
              placeholder="example@mail.com" 
              dir="ltr" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold opacity-80">الرسالة</label>
            <textarea 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              required 
              rows="5" 
              className={`w-full p-4 border rounded-xl outline-none focus:ring-2 transition-all resize-none bg-transparent ${theme.divider}`} 
              placeholder="اكتب استفسارك هنا..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex justify-center items-center shadow-lg disabled:opacity-70 ${theme.accentBg}`}
          >
            {isSubmitting ? <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "إرسال الرسالة 🚀"}
          </button>
        </form>
      )}
    </div>
  );
}