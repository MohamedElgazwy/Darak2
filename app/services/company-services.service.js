import api from "./api";

export const companyServicesService = {
  getList: async () => {
    const res = await api.get("/CompanyServices/List");
    return res?.data || res;
  },
  create: async (serviceData) => {
    try {
      const payload = { ...serviceData };
      // normalize possible ID fields to numeric types backend may expect
      const cid = payload.CompanyId ?? payload.companyId;
      const uid = payload.UserId ?? payload.userId;
      if (cid !== undefined) payload.CompanyId = Number(cid);
      if (uid !== undefined) payload.UserId = Number(uid);

      // Debug: log outgoing payload
      // eslint-disable-next-line no-console
      console.log("[companyServices.create] payload:", payload);

      const res = await api.post("/CompanyServices/Create", payload);
      return res?.data || res;
    } catch (err) {
      // attach server response for better diagnostics upstream
      const serverData = err?.response?.data;
      // eslint-disable-next-line no-console
      console.error("[companyServices.create] server error:", err?.response?.status, serverData);
      const enhanced = new Error(err.message || 'CompanyServices create failed');
      enhanced.response = err.response;
      enhanced.serverData = serverData;
      throw enhanced;
    }
  },
  update: async (serviceData) => {
    const res = await api.put("/CompanyServices/Update", serviceData);
    return res?.data || res;
  }
};