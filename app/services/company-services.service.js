import api from "./api";

export const companyServicesService = {
  // GET /API/CompanyServices/List
  getList: async () => {
    const res = await api.get("/CompanyServices/List");
    return res.data;
  },

  // POST /API/CompanyServices/Create
  create: async (data) => {
    // data: { title, description, icon }
    const res = await api.post("/CompanyServices/Create", data);
    return res.data;
  },

  // PUT /API/CompanyServices/Update
  update: async (data) => {
    // data: { id, title, description, icon }
    const res = await api.put("/CompanyServices/Update", data);
    return res.data;
  },
};