// app/services/chatbot.service.js
import axios from "axios";

// الرابط الأساسي للمساعد الذكي المرفوع على Hugging Face
const AI_BASE_URL = "https://michael-adly33-real-estate-chatbot.hf.space";

export const chatbotService = {
  
  /**
   * 1. فحص حالة الخادم (Health Check)
   * GET /health
   */
  checkHealth: async () => {
    const res = await axios.get(`${AI_BASE_URL}/health`);
    return res.data; // يرجع { "status": "ok", "database": true, "message": "" }
  },

  /**
   * 2. إرسال رسالة واستلام الرد (Chat)
   * POST /chat
   * Body: ChatRequest { message, session_id }
   */
  sendMessage: async (message, sessionId) => {
    const res = await axios.post(`${AI_BASE_URL}/chat`, {
      message: message,
      session_id: sessionId || null // يقبل string أو null في المرة الأولى
    });
    return res.data; // يرجع ChatResponse { session_id, reply_message, urls }
  },

  /**
   * 3. مسح جلسة المحادثة (Clear Session)
   * DELETE /chat/session
   * Body: ClearSessionRequest { session_id } 👈 تم ضبطها كـ Body وليس Params لتطابق السكيما
   */
  deleteSession: async (sessionId) => {
    const res = await axios.delete(`${AI_BASE_URL}/chat/session`, {
      data: {
        session_id: sessionId
      }
    });
    return res.data; // يرجع كائن فارغ {} في حالة النجاح
  }
};