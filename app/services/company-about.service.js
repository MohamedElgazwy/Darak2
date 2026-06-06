import api from "./api";

export const companyAboutService = {
  getList: async () => {
    const res = await api.get("/CompanyAbouts/List");
    return res.data;
  },
  create: async (aboutData) => {
    const res = await api.post("/CompanyAbouts/Create", aboutData);
    return res.data;
  },
  update: async (aboutData) => {
    const res = await api.put("/CompanyAbouts/Update", aboutData);
    return res.data;
  }
};