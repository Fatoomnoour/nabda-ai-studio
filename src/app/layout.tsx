import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "نبضة | NABDA AI — مساحة صناعة المحتوى",
  description: "مساحة عمل عربية لصناعة محتوى أقرب لجمهورك، مع مراجعة بشرية وربط بالمصدر.",
  icons: { icon: "/brand/nabda-logo.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
