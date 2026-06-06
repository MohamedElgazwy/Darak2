"use client";

import { createContext, useContext, useState } from "react";

const CompanyThemeContext = createContext({
  templateId: null,
  setTemplateId: () => {},
});

export function CompanyThemeProvider({ children }) {
  const [templateId, setTemplateId] = useState(null);

  return (
    <CompanyThemeContext.Provider value={{ templateId, setTemplateId }}>
      {children}
    </CompanyThemeContext.Provider>
  );
}

export function useCompanyTheme() {
  return useContext(CompanyThemeContext);
}
