import api from "./api";

export const roleService = {
  getAll: async (includeDisable = false) => {
    const res = await api.get(`/Roles/List?includeDisable=${includeDisable}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/Roles/${id}`);
    return res.data;
  },

  create: async (roleData) => {
    const res = await api.post("/Roles/Create", roleData);
    return res.data;
  },

  update: async (id, roleData) => {
    const res = await api.put(`/Roles/${id}`, roleData);
    return res.data;
  },

  toggleStatus: async (id) => {
    const res = await api.put(`/Roles/${id}/toggle-status`);
    return res.data;
  }
};