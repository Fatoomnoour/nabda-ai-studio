# Leader HTML: Controlled Migration Audit

**Source:** `docs/references/leader-prototype.html` (byte-for-byte copy of uploaded prototype). Reference SHA-256: `66b864091cbac93599a14ec727316570b5212ba9886c02ee7beba39fd504c32f`.

This document distinguishes genuinely useful UI ideas from prototype-only behavior. It is not an audit of a deployed service.

| Feature found in source | Evidence / behavior | Decision | Starter outcome |
|---|---|---|---|
| Deep emerald, mint, gold palette | CSS variables at source lines 10–13 | KEEP | Tokens carried into `globals.css` |
| Alexandria + IBM Plex Sans Arabic | Google Fonts links at lines 7–8 | KEEP | Fonts with fallback in layout |
| Arabic RTL navigation, app shell | `<html lang="ar" dir="rtl">`, sidebar | ADAPT | React shell and responsive menu |
| Pulse symbol and typography | inline SVG near line 110 | ADAPT | **Official user-supplied full PNG logo** in `public/brand/` |
| Source type, audience, dialect, tone | new-campaign form lines 151–173 | KEEP | Simplified, real locally controlled input |
| Fact quote highlighting | `renderSrc()` lines 275–277 | REBUILD | Safe React mark elements with source offsets |
| Script editor and review controls | studio lines 189–205, JS line 385 | REBUILD | Versioned local drafts and explicit approval |
| 5-agent swarm production | AGENTS line 257 onwards | DEFER | Not a real multi-agent backend in starter |
| `window.claude?.use()` | lines 233–236 | REBUILD | Never use as deployed API; server adapter later |
| Hidden hardcoded fallback to DEMO | `runAgent` lines 292–294, `runDemo` 300–304 | REBUILD | Explicit development fixture only; never falsely label as AI |
| Live output and fact checker | `runChecker` lines 295–298 | DEFER | Human source warnings; model verification ≠ independent checking |
| Canvas reel and browser speech | lines 333–355 | REBUILD | **Static visual concept only**; real MP4 via backend later |
| MediaRecorder export | lines 356–359 | REBUILD | Could output WebM or muted video; export disabled until real approved asset |
| Browser-only approvals | `approve()` lines 385–386 | REBUILD | Local demo version approval, then server hash binding later |
| Social posts, slides, quiz, voice | `TABS` lines 364 onward | DEFER | Social caption fixture only |
| Calendar and scheduling button | lines 208–215, 390–396 | DEFER | No claim of live publishing |
| Fake KPIs / 400 package allowance | home lines 127–130 | REMOVE | Honest per-browser counts and pending labels |
| Animated fake multi-agent cursors | lines 399–408 | REMOVE | Decorative, not relevant to functional slice |
| Saudi dialect selector variants | lines 228–230 | KEEP UI | Not claimed as functioning AI localization |

## Conflicts resolved

1. **Vision vs prototype:** The Week 3 PDF describes five formats and two modes; page 20 narrows the first working pilot to Week 1 of aptitude preparation with video and posts. We deliver a functional frontend journey and defer actual media to later integration.
2. **Prototype demo vs product truth:** The original HTML can show prewritten demo content if its proprietary Claude environment is missing; our new starter labels all offline content as fixtures or manual templates.
3. **Leader stack vs starter:** Next.js + Tailwind approved; Supabase and all providers are documented, not silently initialized or billed.
4. **Logo:** Uploaded `NABDA_Logo_Transparent.png` is authoritative full logo. We preserve it unchanged instead of using the simplified inline pulse mark as a substitute.

## Migration guardrails

Do **not** copy the original inline JS wholesale into React. Do **not** rename the immutable reference or write over it. Do **not** implement non-working APIs that return fake 200 responses. Do **not** claim a video exists until an actual, validated MP4 is available.
