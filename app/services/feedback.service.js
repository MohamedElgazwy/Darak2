import api from "./api";

export const feedbackService = {
  // POST /API/Feedback/Create
  create: async (data) => {
    // data: { comment, rating, announcementId }
    const res = await api.post("/Feedback/Create", data);
    return res.data;
  },

  // PUT /API/Feedback/Update
  update: async (data) => {
    // data: { id, comment, rating }
    const res = await api.put("/Feedback/Update", data);
    return res.data;
  },

  // DELETE /API/Feedback/{id}
  delete: async (id) => {
    const res = await api.delete(`/Feedback/${id}`);
    return res.data;
  },
};