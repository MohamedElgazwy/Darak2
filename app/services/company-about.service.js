import api from "./api";

export const companyAboutService = {
  // GET /API/CompanyAbouts/List
  getList: async () => {
    const res = await api.get("/CompanyAbouts/List");
    return res.data;
  },

  // POST /API/CompanyAbouts/Create
  create: async (data) => {
    // data: { description, vision, mission }
    const res = await api.post("/CompanyAbouts/Create", data);
    return res.data;
  },

  // PUT /API/CompanyAbouts/Update
  update: async (data) => {
    // data: { description, vision, mission }
    const res = await api.put("/CompanyAbouts/Update", data);
    return res.data;
  },
};