import api from "./api";

export const authService = {
  register: async (data) => {
    const res = await api.post("/Auth/Register", data);
    return res.data;
  },

  login: async (data) => {
    const res = await api.post("/Auth/Login", data);
    return res.data;
  },

  confirmEmail: async (data) => {
    const res = await api.post("/Auth/ConfirmEmail", data);
    return res.data;
  },

  resendEmail: async (data) => {
    const res = await api.post("/Auth/ResendConfirmEmail", data);
    return res.data;
  },

  forgetPassword: async (data) => {
    const res = await api.post("/Auth/ForgetPassword", data);
    return res.data;
  },

  resetPassword: async (data) => {
    const res = await api.post("/Auth/ResetPassword", data);
    return res.data;
  },

  revokeToken: async (data) => {
      const res = await api.post("/Auth/RevokeRefreshToken", data);
      return res.data;
  },
};