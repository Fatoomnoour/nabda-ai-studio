import "@/styles/landing.css";
import type { Metadata } from "next";
import Link from "next/link";
import { DemoEntryCopy, DemoEntryLogo, DemoEntryShell } from "@/components/landing/DemoEntryClient";
import { PreferencesControls } from "@/components/PreferencesControls";

export const metadata: Metadata = { title: "دخول التجربة | نبضة NABDA AI" };

// Demo entry only: no accounts or authentication exist yet, so nothing here pretends to sign you in.
export default function DemoEntryPage() {
  return (
    <DemoEntryShell>
      <div className="lp-demo-entry__card">
        <div className="lp-demo-entry__top">
          <PreferencesControls variant="landing" />
        </div>
        <DemoEntryLogo />
        <DemoEntryCopy part="title" />
        <DemoEntryCopy part="lead" />
        <div className="lp-cta__actions">
          <Link href="/app" className="pulse-btn pulse-btn--primary pulse-btn--lg">
            <DemoEntryCopy part="enterBtn" />
          </Link>
          <Link href="/" className="pulse-btn pulse-btn--ghost pulse-btn--lg">
            <DemoEntryCopy part="backBtn" />
          </Link>
        </div>
      </div>
    </DemoEntryShell>
  );
}
