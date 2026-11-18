import "@/styles/landing.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "دخول التجربة | نبضة NABDA AI" };

// Demo entry only: no accounts or authentication exist yet, so nothing here pretends to sign you in.
export default function DemoEntryPage() {
  return (
    <main className="nabda-page lp-demo-entry" dir="rtl" lang="ar">
      <div className="lp-demo-entry__card">
        <Image className="nabda-logo" src="/brand/nabda-logo.png" alt="نبضة — NABDA AI" width={528} height={166} priority />
        <h1 className="lp-title">دخول التجربة</h1>
        <p className="lp-lead">
          هذي نسخة تجريبية بدون حسابات. عملك ونسخ السكريبت والاعتمادات تنحفظ في متصفحك فقط، ومسح بيانات المتصفح يحذفها.
        </p>
        <div className="lp-cta__actions">
          <Link href="/app" className="pulse-btn pulse-btn--primary pulse-btn--lg">ادخل مساحة العمل</Link>
          <Link href="/" className="pulse-btn pulse-btn--ghost pulse-btn--lg">ارجع للصفحة الرئيسية</Link>
        </div>
      </div>
    </main>
  );
}
