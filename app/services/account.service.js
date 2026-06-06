import api from "./api";

export const accountService = {
  getMe: async () => {
    const res = await api.get("/me");
    return res.data;
  },

  updateInfo: async (payload) => {
    const res = await api.put("/me/Info", payload);
    return res.data;
  },

  changePassword: async (payload) => {
    const res = await api.put("/me/change-password", payload);
    return res.data;
  },
};