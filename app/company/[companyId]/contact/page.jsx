"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function CompanyContactPage() {
  const params = useParams();
  const companyId = params?.companyId;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // هنا سيتم استدعاء الـ API لإرسال الرسالة للشركة
      // await api.post(`/Contact/Company/${companyId}`, formData);
      
      // محاكاة للنجاح:
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
    <div className="max-w-4xl mx-auto py-12 px-4 text-right" dir="rtl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-4">📞 تواصل معنا</h1>
        <p className="text-slate-500">لديك استفسار عن عقار معين؟ اترك رسالتك وسيقوم فريقنا بالتواصل معك في أقرب وقت.</p>
      </div>

      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-8 rounded-3xl text-center">
          <span className="text-5xl mb-4 block">✅</span>
          <h3 className="text-2xl font-bold mb-2">تم إرسال رسالتك بنجاح!</h3>
          <p>شكراً لتواصلك معنا. سنقوم بالرد عليك قريباً.</p>
          <button onClick={() => setSuccess(false)} className="mt-6 text-emerald-600 font-bold hover:underline">
            إرسال رسالة أخرى
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">الاسم بالكامل</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="محمد أحمد..." />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">رقم الهاتف</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="010..." dir="ltr" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">البريد الإلكتروني (اختياري)</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="example@mail.com" dir="ltr" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">الرسالة</label>
            <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none resize-none" placeholder="اكتب استفسارك هنا..."></textarea>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex justify-center items-center">
            {isSubmitting ? <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "إرسال الرسالة 🚀"}
          </button>
        </form>
      )}
    </div>
  );
}