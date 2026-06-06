  "use client";
  import { AuthProvider } from "./context/AuthContext";
  import { CompanyThemeProvider } from "./context/CompanyThemeContext";

  export default function Providers({ children }) {
    return (
      <CompanyThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </CompanyThemeProvider>
    );
  }