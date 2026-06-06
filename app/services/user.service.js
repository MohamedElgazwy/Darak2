import api from "./api";

export const userService = {
  getAll: async () => {
    const res = await api.get("/Users/List");
    return res.data;
  },

  getProfile: async (userId) => {
    const res = await api.get(`/Users/${userId}/profile`);
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/Users/${id}`);
    return res.data;
  },

  create: async (userData) => {
    const res = await api.post("/Users/Create", userData);
    return res.data;
  },

  update: async (id, userData) => {
    const res = await api.put(`/Users/${id}`, userData);
    return res.data;
  },

  toggleStatus: async (id) => {
    const res = await api.put(`/Users/${id}/toggle-status`);
    return res.data;
  },

  unlock: async (id) => {
    const res = await api.put(`/Users/${id}/Unlock`);
    return res.data;
  }
};