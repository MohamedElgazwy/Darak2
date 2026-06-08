import api from "./api";

export const announcementService = {
  getPaginated: async (params) => {
    try {
      const res = await api.get("/Announcement/Paginated", { params });
      return res.data;
    } catch (err) {
      // Try a pluralized endpoint as a fallback
      if (err?.response?.status === 404) {
        try {
          const res2 = await api.get("/Announcements/Paginated", { params });
          return res2.data;
        } catch (err2) {
          if (err2?.response?.status === 404) {
            // Return an empty paginated-like shape to avoid crashes in callers
            return { items: [], currentPage: params?.PageNumber || 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false };
          }
          throw err2;
        }
      }
      throw err;
    }
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