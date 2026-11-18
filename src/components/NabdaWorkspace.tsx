"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpenText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  FileEdit,
  FolderOpen,
  Home,
  Layers3,
  Lightbulb,
  Menu,
  Plus,
  ShieldCheck,
  WandSparkles,
  X,
} from "lucide-react";
import { PreferencesControls } from "@/components/PreferencesControls";
import { usePreferences } from "@/components/PreferencesProvider";
import { ContentInput } from "@/features/content/ContentInput";
import { ScriptStudio } from "@/features/script/ScriptStudio";
import { VideoStudio } from "@/features/video/VideoStudio";
import { FinalReview } from "@/features/review/FinalReview";
import type { CreateProjectInput, Project, ProjectMode, ScriptSections, StylePreference } from "@/lib/contracts/domain";
import { createNabdaService } from "@/lib/api/service";
import {
  formatLocalizedDate,
  localizeApprovalLabel,
  localizeValidationMessage,
  WORKSPACE_EN,
} from "@/lib/i18n/translations";
import { getVersionApprovalLabel } from "@/lib/utils/client";

type View = "home" | "new" | "script" | "video" | "final";

const WORKFLOW_AR: { id: View; label: string; index: string }[] = [
  { id: "new", label: "المصدر", index: "01" },
  { id: "script", label: "السكريبت", index: "02" },
  { id: "video", label: "الفيديو", index: "03" },
  { id: "final", label: "الاعتماد", index: "04" },
];

const VIEW_TITLES_AR: Record<View, string> = {
  home: "الرئيسية",
  new: "إنشاء محتوى",
  script: "استوديو السكريبت",
  video: "استوديو الفيديو",
  final: "الاعتماد والتصدير",
};

export function NabdaWorkspace() {
  const { theme, lang, dir } = usePreferences();
  const isEn = lang === "en";
  const w = WORKSPACE_EN;
  const WORKFLOW = isEn ? w.workflow : WORKFLOW_AR;
  const VIEW_TITLES = isEn ? w.viewTitles : VIEW_TITLES_AR;
  const ForwardArrow = isEn ? ArrowRight : ArrowLeft;
  const ForwardChevron = isEn ? ChevronRight : ChevronLeft;

  const service = useMemo(() => createNabdaService(), []);
  const [view, setView] = useState<View>("home");
  const [preferredMode, setPreferredMode] = useState<ProjectMode>("source");
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [preferences, setPreferences] = useState<StylePreference[]>([]);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const drawerCloseRef = useRef<HTMLButtonElement | null>(null);

  const notify = useCallback((message: string) => setNotice(message), []);

  const closeMobileMenu = useCallback((restoreFocus = false) => {
    setMobileMenu(false);
    if (restoreFocus) {
      requestAnimationFrame(() => hamburgerRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4200);
    return () => clearTimeout(timer);
  }, [notice]);

  const refresh = useCallback(async (currentId?: string) => {
    try {
      const all = await service.listProjects();
      const rules = await service.listStylePreferences();
      setProjects(all);
      setPreferences(rules);
      if (currentId) {
        const current = await service.getProject(currentId);
        setProject(current);
      }
    } catch (e) {
      const msg = e instanceof Error ? localizeValidationMessage(e.message, lang) : null;
      setNotice(msg || (isEn ? w.toasts.loadFailed : "تعذّر تحميل البيانات المحلية من المتصفح."));
    } finally {
      setReady(true);
    }
  }, [service, lang, isEn, w.toasts.loadFailed]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([service.listProjects(), service.listStylePreferences()])
      .then(([all, rules]) => {
        if (cancelled) return;
        setProjects(all);
        setPreferences(rules);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? localizeValidationMessage(e.message, lang) : null;
        setNotice(msg || (isEn ? w.toasts.loadFailed : "تعذّر تحميل البيانات المحلية من المتصفح."));
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [service, lang, isEn, w.toasts.loadFailed]);

  useEffect(() => {
    if (!mobileMenu) return;
    document.body.style.overflow = "hidden";
    drawerCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenu, closeMobileMenu]);

  function navigate(target: View, mode?: ProjectMode) {
    setMobileMenu(false);
    if ((target === "script" || target === "video" || target === "final") && !project) {
      notify(isEn ? w.toasts.selectProjectFirst : "يرجى اختيار مشروع حالي أو إنشاء مشروع جديد أولًا.");
      return;
    }
    if (mode) setPreferredMode(mode);
    setView(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function create(input: CreateProjectInput) {
    setBusy(true);
    try {
      const created = await service.createProject(input);
      const { project: prepared } = await service.prepareDraft(created.id);
      setProject(prepared);
      await refresh(prepared.id);
      setView("script");
      setMobileMenu(false);
      window.scrollTo(0, 0);
      notify(isEn ? w.toasts.draftPrepared : "تم تجهيز مسودة محلية للمراجعة — دون استدعاء الذكاء الاصطناعي.");
    } catch (e) {
      const msg = e instanceof Error ? localizeValidationMessage(e.message, lang) : null;
      notify(msg || (isEn ? w.toasts.saveProjectFailed : "تعذّر حفظ المشروع."));
    } finally {
      setBusy(false);
    }
  }

  async function saveScript(sections: ScriptSections, baseVersionId: string) {
    if (!project) return;
    setBusy(true);
    try {
      const updated = await service.reviseScript(project.id, sections, baseVersionId);
      setProject(updated);
      await refresh(updated.id);
      notify(isEn ? w.toasts.revisionSaved : "تم حفظ نسخة جديدة من السكريبت — الاعتماد السابق لا يشمل هذه النسخة.");
    } catch (e) {
      const msg = e instanceof Error ? localizeValidationMessage(e.message, lang) : null;
      notify(msg || (isEn ? w.toasts.saveRevisionFailed : "تعذّر حفظ التعديلات."));
    } finally {
      setBusy(false);
    }
  }

  async function approveScript(versionId: string, expectedContentHash: string) {
    if (!project) return;
    setBusy(true);
    try {
      const updated = await service.approveScript(project.id, versionId, expectedContentHash);
      setProject(updated);
      await refresh(updated.id);
      notify(isEn ? w.toasts.scriptApproved : "تم تسجيل الاعتماد المحلي لهذه النسخة.");
    } catch (e) {
      const msg = e instanceof Error ? localizeValidationMessage(e.message, lang) : null;
      notify(msg || (isEn ? w.toasts.approveFailed : "تعذّر اعتماد النسخة."));
    } finally {
      setBusy(false);
    }
  }

  function loadExisting(p: Project) {
    setProject(p);
    setView("script");
    setMobileMenu(false);
    window.scrollTo(0, 0);
  }

  async function addPreference(rule: string) {
    try {
      setPreferences(await service.saveStylePreference(rule));
      notify(isEn ? w.toasts.prefSaved : "تم حفظ تفضيل الأسلوب محليًا — سيُطبّق تلقائيًا بعد ربط الذكاء الاصطناعي.");
    } catch (e) {
      const msg = e instanceof Error ? localizeValidationMessage(e.message, lang) : null;
      notify(msg || (isEn ? w.toasts.prefSaveFailed : "تعذّر حفظ القاعدة."));
    }
  }

  async function togglePreference(id: string) {
    try {
      setPreferences(await service.toggleStylePreference(id));
    } catch (e) {
      const msg = e instanceof Error ? localizeValidationMessage(e.message, lang) : null;
      notify(msg || (isEn ? w.toasts.prefToggleFailed : "تعذّر تحديث التفضيل."));
    }
  }

  const approvedCount = projects.filter(p => {
    const latest = p.scripts.at(-1);
    return latest ? getVersionApprovalLabel(p, latest.id) === "معتمد حاليًا" : false;
  }).length;
  const totalVersions = projects.reduce((acc, p) => acc + p.scripts.length, 0);

  const homeCards = [
    {
      label: isEn ? w.home.cards[0].label : "مشاريع محفوظة محليًا",
      value: projects.length.toString().padStart(2, "0"),
      note: isEn ? w.home.cards[0].note : "في هذا المتصفح فقط",
      icon: FolderOpen,
    },
    {
      label: isEn ? w.home.cards[1].label : "نسخ السكريبت المحررة",
      value: totalVersions.toString().padStart(2, "0"),
      note: isEn ? w.home.cards[1].note : "إجمالي الإصدارات المحلية",
      icon: FileEdit,
    },
    {
      label: isEn ? w.home.cards[2].label : "نسخ معتمدة محليًا",
      value: approvedCount.toString().padStart(2, "0"),
      note: isEn ? w.home.cards[2].note : "اعتماد تطوير — ليس عبر الخادم",
      icon: ShieldCheck,
    },
    {
      label: isEn ? w.home.cards[3].label : "ملفات فيديو MP4 منجزة",
      value: "00",
      note: isEn ? w.home.cards[3].note : "بانتظار ربط خدمة الرندر",
      icon: Clapperboard,
    },
  ];

  const logoSrc = theme === "light" ? "/brand/nabda-logo.png" : "/brand/nabda-logo-dark.png";

  return (
    <div className="app-shell" dir={dir} lang={lang}>
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`} aria-label={isEn ? w.sidebarAria : "القائمة الجانبية"}>
        <div className="sidebar-top">
          <button type="button" className="brand-logo" onClick={() => navigate("home")} aria-label={isEn ? w.brandHomeAria : "نبضة — الرئيسية"}>
            <Image
              src={logoSrc}
              alt={isEn ? w.brandLogoAlt : "شعار نبضة NABDA AI"}
              width={136}
              height={theme === "light" ? 43 : 35}
              priority
              className="brand-image"
            />
          </button>
          <button ref={drawerCloseRef} type="button" className="mobile-close" onClick={() => closeMobileMenu(true)} aria-label={isEn ? w.closeMenuAria : "إغلاق القائمة"}>
            <X size={20} />
          </button>
          <div className="brand-caption">{isEn ? w.brandCaption : "NABDA AI · منصة صناعة المحتوى"}</div>
        </div>

        <button type="button" className="sidebar-new" onClick={() => navigate("new", "source")}>
          <Plus size={18} />
          <span>{isEn ? w.newProject : "مشروع جديد"}</span>
          <ForwardArrow size={16} className="push-left" />
        </button>

        <div className="sidebar-section-title">{isEn ? w.workspaceSection : "مساحة العمل"}</div>
        <nav className="sidebar-nav" aria-label={isEn ? w.primaryNavAria : "التنقل الرئيسي"}>
          <button type="button" aria-current={view === "home" ? "page" : undefined} className={view === "home" ? "nav-active" : ""} onClick={() => navigate("home")}>
            <Home size={17} />
            <span>{isEn ? w.nav.home : "نظرة عامة"}</span>
          </button>
          <button type="button" aria-current={view === "new" ? "page" : undefined} className={view === "new" ? "nav-active" : ""} onClick={() => navigate("new")}>
            <FileEdit size={17} />
            <span>{isEn ? w.nav.new : "إنشاء محتوى"}</span>
          </button>
          <button type="button" aria-current={view === "script" ? "page" : undefined} className={view === "script" ? "nav-active" : ""} onClick={() => navigate("script")}>
            <WandSparkles size={17} />
            <span>{isEn ? w.nav.script : "استوديو السكريبت"}</span>
          </button>
          <button type="button" aria-current={view === "video" ? "page" : undefined} className={view === "video" ? "nav-active" : ""} onClick={() => navigate("video")}>
            <Clapperboard size={17} />
            <span>{isEn ? w.nav.video : "استوديو الفيديو"}</span>
          </button>
          <button type="button" aria-current={view === "final" ? "page" : undefined} className={view === "final" ? "nav-active" : ""} onClick={() => navigate("final")}>
            <CheckCircle2 size={17} />
            <span>{isEn ? w.nav.final : "الاعتماد والتصدير"}</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="team-mini">
            <div className="team-avatar">{isEn ? w.teamAvatar : "ن"}</div>
            <div className="team-meta">
              <strong>{isEn ? w.teamName : "فريق نبضة"}</strong>
              <span dir="ltr">Saudi MIB 2027 · Track 02</span>
              <small className="sidebar-status-line">
                <span className="live-dot" />
                <span>{isEn ? w.sidebarVersion : "نسخة التطوير المحلية · "}<bdi dir="ltr">v0.1.7</bdi></span>
              </small>
            </div>
          </div>
          <div className="sidebar-bottom-pattern" aria-hidden="true" />
        </div>
      </aside>

      {mobileMenu && (
        <button type="button" className="mobile-scrim" onClick={() => closeMobileMenu(true)} aria-label={isEn ? w.closeScrimAria : "إغلاق القائمة الجانبية"} />
      )}

      <main className="main-content">
        <header className="main-header">
          <div className="header-location">
            <button ref={hamburgerRef} type="button" className="hamburger" onClick={() => setMobileMenu(true)} aria-label={isEn ? w.openMenuAria : "فتح القائمة"} aria-expanded={mobileMenu}>
              <Menu size={20} />
            </button>
            <span>{isEn ? w.brandName : "نبضة"}</span>
            <ForwardChevron size={15} />
            <strong>{VIEW_TITLES[view]}</strong>
          </div>
          <div className="header-right">
            <PreferencesControls variant="workspace" compact />
            <span className="demo-pill">
              <span className="live-dot" />
              <span>{isEn ? w.headerBadge : "نسخة تطوير محلية"}</span>
            </span>
            <div className="user-circle" aria-label={isEn ? w.teamAvatarAria : "فريق المحتوى"}>{isEn ? w.teamAvatar : "ن"}</div>
          </div>
        </header>

        <div className="content-wrap">
          {view !== "home" && (
            <nav className="workflow-bar" aria-label={isEn ? w.workflowAria : "مراحل المشروع"}>
              {WORKFLOW.map((item, i) => (
                <button
                  type="button"
                  key={item.id}
                  disabled={item.id !== "new" && !project}
                  aria-current={view === item.id ? "step" : undefined}
                  className={`workflow-step ${view === item.id ? "active" : ""} ${view !== "new" && i < WORKFLOW.findIndex(v => v.id === view) ? "complete" : ""}`}
                  onClick={() => navigate(item.id)}
                >
                  <span className="step-bubble" dir="ltr">{item.index}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          )}

          {!ready && <div className="loading-card">{isEn ? w.loading : "جارٍ تحميل مساحة العمل المحلية…"}</div>}

          {ready && view === "home" && (
            <div className="animate-in">
              <div className="vh">
                <div>
                  <h1>{isEn ? w.home.greeting : "أهلاً بك، فريق المحتوى 👋"}</h1>
                  <p className="sub">
                    {isEn ? w.home.subtitle : "أضف مصدرًا واحدًا، ونبضة تصوغ السكريبت بلهجة جمهورك مع ربط الحقائق بالمصدر واعتماد كل نسخة."}
                  </p>
                </div>
                <div className="vh-actions">
                  <button type="button" className="secondary-btn" onClick={() => navigate("new", "idea")}>
                    <span>{isEn ? w.home.quickIdea : "فكرة سريعة"}</span>
                  </button>
                  <button type="button" className="primary-btn gold-btn" onClick={() => navigate("new", "source")}>
                    <Plus size={17} />
                    <span>{isEn ? w.home.newProject : "مشروع جديد"}</span>
                  </button>
                </div>
              </div>

              <div className="metrics-caption">
                <span>{isEn ? w.home.metricsTitle : "ملخص المتصفح الحالي"}</span>
                <small>{isEn ? w.home.metricsNote : "بيانات تطوير محلية في هذا المتصفح فقط — ليست مؤشرات أداء تجارية"}</small>
              </div>

              <div className="metrics-grid">
                {homeCards.map(card => (
                  <div className="metric-card" key={card.label}>
                    <div className="metric-top">
                      <span>{card.label}</span>
                      <card.icon size={17} />
                    </div>
                    <strong dir="ltr">{card.value}</strong>
                    <small>{card.note}</small>
                  </div>
                ))}
              </div>

              <div className="home-bottom">
                <div className="surface home-projects">
                  <div className="block-title">
                    <div>
                      <h2>{isEn ? w.home.recentTitle : "آخر المشاريع"}</h2>
                      <p>{isEn ? w.home.recentSubtitle : "استكمال العمل من آخر نسخة محفوظة في المتصفح"}</p>
                    </div>
                    <button type="button" className="quiet-btn" onClick={() => navigate("new", "source")}>
                      <span>{isEn ? w.home.newProject : "مشروع جديد"}</span>
                      <Plus size={15} />
                    </button>
                  </div>

                  {projects.length ? (
                    <div className="project-list">
                      {projects.slice(0, 3).map(p => {
                        const latest = p.scripts.at(-1);
                        const rawApproval = latest ? getVersionApprovalLabel(p, latest.id) : "";
                        const approvalLabel = latest
                          ? localizeApprovalLabel(rawApproval, lang)
                          : isEn
                            ? w.home.draftInitial
                            : "مسودة أولية";
                        return (
                          <button type="button" className="project-row" key={p.id} onClick={() => loadExisting(p)}>
                            <div className="project-symbol">
                              <BookMarked size={18} />
                            </div>
                            <div className="project-info">
                              <strong title={p.name}><bdi>{p.name}</bdi></strong>
                              <span>{p.contentType} · {formatLocalizedDate(p.updatedAt, lang)}</span>
                              <div className="project-tags">
                                <span>{p.source.mode === "source" ? (isEn ? w.home.modeSource : "نص مصدر") : isEn ? w.home.modeIdea : "فكرة"}</span>
                                <span>{p.dialect}</span>
                                {latest && <span dir="ltr">V{latest.version}</span>}
                              </div>
                            </div>
                            <span className={`project-state ${rawApproval === "معتمد حاليًا" ? "approved" : ""}`}>
                              {approvalLabel}
                            </span>
                            <ForwardChevron size={16} />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-projects">
                      <div className="empty-icon">
                        <Layers3 size={22} />
                      </div>
                      <h3>{isEn ? w.home.emptyTitle : "لا توجد مشاريع محفوظة حتى الآن"}</h3>
                      <p>{isEn ? w.home.emptyBody : "يمكن البدء بإدخال نص أو فكرة، أو تجربة مثال دورة القدرات المعتمد."}</p>
                      <button type="button" className="secondary-btn" onClick={() => navigate("new", "source")}>
                        <span>{isEn ? w.home.emptyCta : "إنشاء أول مشروع"}</span>
                        <ForwardArrow size={15} />
                      </button>
                    </div>
                  )}

                  <div className="projects-footer">
                    <span>{isEn ? w.home.projectsTotal : "إجمالي المشاريع في هذا المتصفح:"} <bdi dir="ltr">{projects.length}</bdi></span>
                    <span>{isEn ? w.home.browserStorageLabel : "حفظ محلي في المتصفح"}</span>
                  </div>
                </div>

                <div className="surface process-card">
                  <div className="block-title">
                    <div>
                      <h2>{isEn ? w.home.howTitle : "كيف تعمل نبضة"}</h2>
                      <p>{isEn ? w.home.howSubtitle : "رحلة واضحة من المصدر إلى الاعتماد البشري"}</p>
                    </div>
                    <span className="tiny-pill">{isEn ? w.home.corePathPill : "المسار الأساسي"}</span>
                  </div>

                  <div className="pipe" aria-label={isEn ? w.home.pipeAria : "خطوات العمل في نبضة"}>
                    <span className="pipe-step ok">
                      <span className="pipe-step-num" dir="ltr">01</span>
                      <span className="pipe-step-label">{isEn ? w.home.pipeSteps[0] : "المصدر"}</span>
                    </span>
                    <span className="pipe-step ok">
                      <span className="pipe-step-num" dir="ltr">02</span>
                      <span className="pipe-step-label">{isEn ? w.home.pipeSteps[1] : "استخراج الحقائق"}</span>
                    </span>
                    <span className="pipe-step ok">
                      <span className="pipe-step-num" dir="ltr">03</span>
                      <span className="pipe-step-label">{isEn ? w.home.pipeSteps[2] : "السكريبت السعودي"}</span>
                    </span>
                    <span className="pipe-step on">
                      <span className="pipe-step-num" dir="ltr">04</span>
                      {isEn ? (
                        <span className="pipe-step-label">{w.home.pipeSteps[3]}</span>
                      ) : (
                        <span className="pipe-step-label">الاعتماد البشري</span>
                      )}
                    </span>
                  </div>

                  <p className="pipe-sub">
                    {isEn
                      ? w.home.pipeSub
                      : "كل معلومة في المخرجات مربوطة بجملة في المصدر. اضغط على أي حقيقة داخل استوديو السكريبت لإبراز اقتباسها الحرفي."}
                  </p>

                  <div className="home-mode-grid">
                    <button type="button" className="home-mode-btn" onClick={() => navigate("new", "source")}>
                      <div className="home-mode-icon">
                        <BookOpenText size={18} />
                      </div>
                      <div className="home-mode-copy">
                        <strong>{isEn ? w.home.sourceCardTitle : "نص مصدر متكامل"}</strong>
                        <small>{isEn ? w.home.sourceCardSub : "درس، خبر، أو مقال"}</small>
                      </div>
                    </button>
                    <button type="button" className="home-mode-btn" onClick={() => navigate("new", "idea")}>
                      <div className="home-mode-icon">
                        <Lightbulb size={18} />
                      </div>
                      <div className="home-mode-copy">
                        <strong>{isEn ? w.home.ideaCardTitle : "فكرة مبدئية"}</strong>
                        <small>{isEn ? w.home.ideaCardSub : "وصف سريع للموضوع"}</small>
                      </div>
                    </button>
                  </div>

                  <div className="process-footer">
                    <ShieldCheck size={16} />
                    <span>{isEn ? w.home.processFooter : "لا يتم تصدير أو اعتماد أي مخرج دون مراجعة وموافقة بشرية صريحة."}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {ready && view === "new" && <ContentInput key={preferredMode} initialMode={preferredMode} onSubmit={create} busy={busy} />}

          {ready && view === "script" && project && (
            <ScriptStudio
              key={project.scripts.at(-1)?.id || project.id}
              project={project}
              saving={busy}
              onSave={saveScript}
              onApprove={approveScript}
              onContinue={() => navigate("video")}
            />
          )}

          {ready && view === "video" && project && (
            <VideoStudio
              project={project}
              onBack={() => navigate("script")}
              onFinal={() => navigate("final")}
              onTryRender={async () => {
                try {
                  const latestScript = project.scripts.at(-1);
                  if (!latestScript) return;
                  await service.requestVideoRender({
                    projectId: project.id,
                    scriptVersionId: latestScript.id,
                    voiceId: "ar-SA-ZariyahNeural",
                    templateId: "nabda-educational-v1",
                    expectedScriptHash: latestScript.contentHash,
                  });
                } catch (e) {
                  const msg = e instanceof Error ? localizeValidationMessage(e.message, lang) : null;
                  notify(msg || (isEn ? w.toasts.renderUnavailable : "توليد الفيديو الفعلي غير متاح حاليًا."));
                }
              }}
            />
          )}

          {ready && view === "final" && project && (
            <FinalReview
              project={project}
              preferences={preferences}
              onAddPreference={addPreference}
              onTogglePreference={togglePreference}
              onNew={() => {
                setProject(null);
                navigate("new", "source");
              }}
            />
          )}

          <footer className="main-footer">
            <span>
              <bdi dir="ltr">© 2026 NABDA AI</bdi> · {isEn ? w.footer.versionPrefix : "نسخة التطوير"} <bdi dir="ltr">v0.1.7</bdi>
            </span>
            <span>
              Saudi MIB 2027 <span className="footer-dot">·</span>{" "}
              {isEn ? w.footer.rightNote : "واجهة تطوير محلية — ليست خدمة إنتاج منشورة"}
            </span>
          </footer>
        </div>
      </main>

      {notice && (
        <div className="toast" role="status" aria-live="polite">
          <span className="toast-info" aria-hidden="true">i</span>
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label={isEn ? w.toasts.closeToastAria : "إغلاق الإشعار"}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
