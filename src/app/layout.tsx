import type { Metadata, Viewport } from "next";
import { PreferencesProvider } from "@/components/PreferencesProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "نبضة | NABDA AI — مساحة صناعة المحتوى",
  description: "مساحة عمل عربية لصناعة محتوى أقرب لجمهورك، مع مراجعة بشرية وربط بالمصدر.",
  icons: { icon: "/brand/nabda-logo.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const INIT_PREFERENCES_SCRIPT = `(function(){try{var t=localStorage.getItem("nabda-theme");var l=localStorage.getItem("nabda-lang");var r=document.documentElement;if(t==="light"||t==="dark"){r.dataset.theme=t;}if(l==="en"||l==="ar"){r.lang=l;r.dir=l==="en"?"ltr":"rtl";}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INIT_PREFERENCES_SCRIPT }} />
      </head>
      <body>
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
