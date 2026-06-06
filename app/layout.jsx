// app/layout.jsx
import "./globals.css";
import Providers from "./providers";
import ThemeWrapper from "./components/layout/ThemeWrapper";

export const metadata = {
  title: "دارك | Darak",
  description: "منصة دارك للعقارات - وجهتك الأولى لبيع وشراء واستئجار العقارات في مصر",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 text-slate-900 antialiased transition-colors duration-300">
        <Providers>
          <ThemeWrapper>{children}</ThemeWrapper>
        </Providers>
      </body>
    </html>
  );
}