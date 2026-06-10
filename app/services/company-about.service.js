import api from "./api";

export const companyAboutService = {
  /**
   * @deprecated Prefer `getMyAbout()` which is JWT-scoped on the server.
   */
  getList: async () => {
    try {
      const res = await api.get("/CompanyAbouts/List");
      return res?.data || res;
    } catch (err) {
      if (err?.response?.status === 404) return [];
      throw err;
    }
  },

  // New: fetch the current user's/company about (server-scoped by JWT)
  getMyAbout: async () => {
    try {
      const res = await api.get("/CompanyAbouts/me");
      return res?.data || res;
    } catch (err) {
      // If backend doesn't expose /me yet, fallback to client-side filter
      if (err?.response?.status === 404) {
        return companyAboutService._fallbackGetMine();
      }
      throw err;
    }
  },

  // Fallback: filter full list by localStorage user/company id (client-only)
  _fallbackGetMine: async () => {
    // Best-effort: if no localStorage (SSR) just return empty
    try {
      if (typeof window === "undefined") return null;
      const stored = localStorage.getItem("authUser");
      const currentUser = stored ? JSON.parse(stored) : null;
      const all = await companyAboutService.getList();
      const arr = Array.isArray(all) ? all : (all?.data || []);
      if (!currentUser) return arr[0] || null;
      const match = arr.find(a => {
        const cid = a.companyId ?? a.CompanyId ?? a.company?.id ?? a.Company?.Id;
        return cid && (Number(cid) === Number(currentUser.companyId || currentUser.id));
      });
      return match || (arr[0] || null);
    } catch (err) {
      // silent fallback to null when anything goes wrong
      return null;
    }
  },

  create: async (aboutData) => {
    const res = await api.post("/CompanyAbouts/Create", aboutData);
    return res?.data || res;
  },
  update: async (aboutData) => {
    const res = await api.put("/CompanyAbouts/Update", aboutData);
    return res?.data || res;
  }
};