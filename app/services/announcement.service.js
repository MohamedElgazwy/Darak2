import api from "./api";

export const announcementService = {
  getPaginated: async (params) => {
    const res = await api.get("/Announcement/Paginated", { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/Announcement/${id}`);
    return res.data;
  },

  create: async (formData) => {
    const res = await api.post("/Announcement/Create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  update: async (formData) => {
    const res = await api.put("/Announcement/Update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/Announcement/${id}`);
    return res.data;
  },

  changeStatus: async (data) => {
    const res = await api.put("/Announcement/ChangeStatus", data);
    return res.data;
  },

  // ─── الدوال الجديدة لجلب القوائم الديناميكية ───
  getGovernorates: async () => {
    const res = await api.get("/Announcement/Governorates");
    return res.data;
  },

  getPropertyTypes: async () => {
    const res = await api.get("/Announcement/PropertyTypes");
    return res.data;
  },

  getPurposes: async () => {
    const res = await api.get("/Announcement/Purposes");
    return res.data;
  },

  getAdminPaginated: async (params) => {
    const res = await api.get("/Announcement/Admin", { params });
    return res.data;
  },

  getMyAnnouncements: async (params = {}) => {
    const res = await api.get("/Announcement/my", { params });
    return res.data;
  },
};