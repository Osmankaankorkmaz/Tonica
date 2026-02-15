import "./globals.css";
import Script from "next/script";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import Providers from "./providers";
import LayoutShell from "@/components/LayoutShell";
import AiStateResetOnReload from "@/components/workspace/AiStateResetOnReload";

export const metadata = {
  title: "Tonica TODO",
  description: "Tonica TODO (Next.js + Tailwind) • TR/EN • Light/Dark",
};

const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem("tonica-theme");
    var theme = t ? t : "light";
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
    
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>

      <body className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
        <LocaleProvider>
          <Providers>
            <AiStateResetOnReload/>
            <LayoutShell>{children}</LayoutShell>
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
