# نبضة — NABDA AI · Frontend Starter v0.1.6

> **Saudi MIB 2027 — Track 02 · Phase 0.8**
> جاهز كهيكل مشروع برمجي قابل للتوسعة، **وليس** نموذج AI/فيديو متكامل بعد.

![NABDA AI logo](public/brand/nabda-logo.png)

## ما الذي يحتويه المشروع؟

- واجهة Next.js App Router + TypeScript + Tailwind مع RTL حقيقي وهوية نبضة الأصلية.
- إدخال فكرة/نص، الجمهور، نوع المحتوى، اللهجة والنبرة، وتحميل مثال التناظر اللفظي.
- استوديو Hook/Body/CTA قابل للتحرير، وإصدارات وموافقات محلية محفوظة داخل المتصفح.
- إبراز مواضع الاقتباسات من المصدر **للمثال التجريبي فقط**.
- صفحة فيديو تعرض قالبًا بصريًا ثابتًا بصراحة، **من غير ادعاء فيديو أو صوت مولّد**.
- صفحة مراجعة وتصدير؛ زر تحميل MP4 معطل لحين وجود ملف حقيقي معتمد من الخادم.
- ذاكرة أسلوب تجريبية محلية؛ لا تُطبق تلقائيًا على AI.
- Domain Models، Development Adapter، Backend API Adapter مغلق لحين التنفيذ، توثيق كامل للفريق.

## حالة حزمة التثبيت (`package-lock.json`)

تم توليد **`package-lock.json` كامل** (`lockfileVersion: 3`، بحجم `236,637` بايت) والتحقق منه فعليًا عبر `npm ci` على Node.js `v24.17.0` و npm `11.13.0`، كما تم التحقق من `typecheck` و `lint` و `build` و `test:contracts`. يُفضّل استخدام `npm ci` مباشرة بعد استنساخ المستودع من GitHub.

## Local Setup

1. Clone or unpack the workspace into `<workspace-root>/nabda-ai-mvp/`.
2. Open the project folder in **Google Antigravity IDE → Open Folder** (do not initialize a second project).
3. In your terminal inside the project directory:

```powershell
cd nabda-ai-mvp
node --version
npm --version
git --version
npm ci
npm run typecheck
npm run lint
npm run build
npm run test:contracts
npm run dev
```

Open `http://localhost:3000`. Dependencies are pinned cleanly via `package-lock.json` (`npm ci`).

## Quick Tour

**الرئيسية → إنشاء محتوى → تحميل مثال القدرات → مسودة محلية → تعديل/حفظ إصدار → اعتماد محلي → معاينة قالب الفيديو الثابت → صفحة المراجعة.**

الـDevelopment Adapter يستعمل `localStorage`. دي بيانات تخص المتصفح الحالي، مش قاعدة بيانات سحابية، وتتمسح لو مسحتي Storage. لو غيّرتي `.env` إلى `NEXT_PUBLIC_NABDA_ADAPTER=http`، الـHTTP adapter يرفض العمليات صراحة لأن الـAPI لم يُنفّذ؛ لا يحاول إيهامك بنتائج ناجحة.

## أول برومبت لـAntigravity

افتحي **[`docs/AG_FIRST_PROMPT.md`](docs/AG_FIRST_PROMPT.md)** وانسخي النص كله في جلسة AG جديدة بالمجلد المفتوح. البرومبت بيفحص الموجود، بيشغّل الاختبارات، ويطلب موافقتك قبل التعديلات؛ **لا ينشئ مشروع Next جديدًا**.

## Docs Index

| File | Purpose |
|---|---|
| `AGENTS.md` | تعليمات كل Coding Agent والـGit approvals |
| `docs/PROJECT_HANDOFF.md` | الحالة الحالية والاختبارات والـBlockers |
| `docs/MVP_SCOPE.md` | الحدود الصارمة للنموذج الأولي |
| `docs/ARCHITECTURE.md` | خطة النظام من الواجهة إلى Supabase/AI/Media |
| `docs/PROTOTYPE_AUDIT.md` | مراجعة كود الليدر الأصلي، KEEP/ADAPT/DEFER |
| `docs/BRAND_GUIDELINES.md` | ألوان/خطوط/شعار المرجع |
| `docs/API_CONTRACT.md` | عقود Backend موثقة بـDRAFT |
| `docs/BACKEND_HANDOFF.md` | دليل التسليم والتكاملات لـ Backend Lead |
| `docs/AG_FIRST_PROMPT.md` | أول أمر تنفيذي لـAntigravity |
| `docs/CHANGELOG.md` | سجل التطوير |

## Git / Team Handoff

بعد التحقق من المشروع **وبموافقة Project Lead**:

```powershell
git init -b main
# بعد مراجعة الملفات المهيأة (git status --short && git diff --cached --stat) وبموافقة صاحبة المستودع:
git commit -m "chore: establish clean NABDA frontend baseline v0.1.6"
git remote add origin https://github.com/OWNER/nabda-ai-mvp.git
git push -u origin main
```

أنشئ Private GitHub Repository فارغًا باسم `nabda-ai-mvp` أولًا، واستبدل `OWNER`. راجع `git status` دوريًا وتأكد من عدم إضافة `.env.local` أو أي أسرار. يعمل Frontend Lead على `feat/frontend-core`، ويعمل Shared Contract Owner على `feat/api-contract-alignment` (**P02A**) قبل بدء Backend Lead على `feat/backend-integrations`، ويجري الدمج عبر Pull Request فقط. لا يُربط المستودع الرسمي بـ Lovable أو بأي صلاحية كتابة خارجية.

## Current limitations

No Supabase, AI API, Saudi TTS, Remotion, real MP4, server approvals, authentication, media download, social publishing, or scheduling. Do not deploy publicly as a production-ready content platform. Real providers remain gated by credentials, cost, human editorial quality and technical smoke tests.

## Antigravity Model

Use `Orchestrator (Argon)` for initial repository audit if available on your paid Google AI Pro account (no custom effort setting), `Gemini 4 Hydrogen — High` for controlled coding, and `Gemini 3.8 Flash — Medium` for routine CSS fixes. See `docs/ANTIGRAVITY_MODELS.md`; do not assume account entitlements.
