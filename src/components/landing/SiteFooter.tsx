import Image from "next/image";
import { NAV_LINKS } from "./content";

export function SiteFooter({ logoUrl }: { logoUrl: string }) {
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer__inner">
        <div className="lp-footer__brand">
          <Image className="nabda-logo" src={logoUrl} alt="نبضة — NABDA AI" width={528} height={166} />
          <p>من خبر واحد إلى محتوى بلغة جمهورك، تحت مراجعتك.</p>
        </div>
        <nav aria-label="روابط التذييل">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
            <li>
              <a href="#faq">أسئلة شائعة</a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="lp-container lp-footer__legal">
        <p>نموذج مرئي للمراجعة، ولا يمثّل الخدمة النهائية.</p>
        <p>© 2026 نبضة NABDA AI</p>
      </div>
    </footer>
  );
}
