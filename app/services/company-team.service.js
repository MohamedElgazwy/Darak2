import api from "./api";

export const companyTeamService = {
  getByCompany: async (companyId) => {
    const res = await api.get(`/CompanyTeam/Company/${companyId}`);
    return res?.data || res;
  },

  getById: async (id) => {
    const res = await api.get(`/CompanyTeam/${id}`);
    return res?.data || res;
  },

  create: async (member) => {
    const payload = { ...member };
    // normalize IDs
    if (payload.CompanyId === undefined && payload.companyId !== undefined) payload.CompanyId = Number(payload.companyId);
    if (payload.UserId === undefined && payload.userId !== undefined) payload.UserId = Number(payload.userId);
    const res = await api.post("/CompanyTeam/Create", payload);
    return res?.data || res;
  },

  update: async (member) => {
    const res = await api.put("/CompanyTeam/Update", member);
    return res?.data || res;
  },

  delete: async (id) => {
    const res = await api.delete(`/CompanyTeam/${id}`);
    return res?.data || res;
  }
};
