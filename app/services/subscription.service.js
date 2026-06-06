import api from "./api";

export const subscriptionService = {
  getPackages: async () => {
    const res = await api.get("/Packages/List");
    return res.data;
  },

  getPackageById: async (id) => {
    const res = await api.get(`/Packages/${id}`);
    return res.data;
  },

  getTemplates: async () => {
    const res = await api.get("/Templates/List");
    return res.data;
  },

  getTemplateById: async (id) => {
    const res = await api.get(`/Templates/${id}`);
    return res.data;
  },

  getMySubscription: async () => {
    const res = await api.get("/Subscriptions/me");
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/Subscriptions/Create", data);
    return res.data;
  },

  confirmCashPayment: async ({ subscriptionId }) => {
    const res = await api.post("/Payments/Confirm-Cash", { subscriptionId: parseInt(subscriptionId) });
    return res.data;
  },
};