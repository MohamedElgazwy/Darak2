"use client";

import { createContext, useContext, useState } from "react";

const CompanyThemeContext = createContext({
  templateId: null,
  setTemplateId: () => {},
  companyName: null,
  setCompanyName: () => {},
});

export function CompanyThemeProvider({ children }) {
  const [templateId, setTemplateId] = useState(null);
  const [companyName, setCompanyName] = useState(null);

  return (
    <CompanyThemeContext.Provider value={{ templateId, setTemplateId, companyName, setCompanyName }}>
      {children}
    </CompanyThemeContext.Provider>
  );
}

export function useCompanyTheme() {
  return useContext(CompanyThemeContext);
}
