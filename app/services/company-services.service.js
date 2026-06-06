import api from "./api";

export const companyServicesService = {
  getList: async () => {
    const res = await api.get("/CompanyServices/List");
    return res.data;
  },
  create: async (serviceData) => {
    const res = await api.post("/CompanyServices/Create", serviceData);
    return res.data;
  },
  update: async (serviceData) => {
    const res = await api.put("/CompanyServices/Update", serviceData);
    return res.data;
  }
};