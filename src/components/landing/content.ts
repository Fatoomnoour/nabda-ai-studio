// Landing copy and truthful capability states for the NABDA A2 prototype.
// Keep this file framework-agnostic so it can move to the Next.js app unchanged.

export type DemoStatus = "available" | "partial" | "sample";

export const STATUS_LABEL: Record<DemoStatus, string> = {
  available: "متاح في التجربة",
  partial: "متاح جزئيًا",
  sample: "عيّنة تطوير",
};

export const NAV_LINKS = [
  { href: "#how", label: "كيف تعمل" },
  { href: "#features", label: "المميزات" },
  { href: "#vision", label: "الرؤية" },
] as const;

export type WorkflowStage = {
  id: string;
  title: string;
  summary: string;
  role: string;
  today: string;
  later: string;
  status: DemoStatus;
};

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: "source",
    title: "إدخال المصدر",
    summary: "تلصق الخبر أو النص الأصلي، أو تبدأ بعيّنة التطوير الجاهزة.",
    role: "تختار المصدر وتتأكد إنه كامل وواضح.",
    today: "إدخال النص مع عدّاد الأحرف، وعيّنة تطوير جاهزة للتجربة.",
    later: "استيراد الروابط والملفات بعد ربط الخادم.",
    status: "available",
  },
  {
    id: "understand",
    title: "فهم المحتوى",
    summary: "تحديد الفكرة الأساسية والجمهور والنبرة المناسبة قبل الكتابة.",
    role: "تراجع الفكرة الأساسية وتتأكد إنها تمثّل المصدر.",
    today: "عيّنة تطوير مرتبطة بالمصدر توضّح الشكل المتوقع، وليست تحليلًا حيًّا.",
    later: "التحليل الحي بالذكاء الاصطناعي متاح الآن في «الاستوديو الحي» (استخراج الحقائق من نصك).",
    status: "sample",
  },
  {
    id: "script",
    title: "إعداد السكريبت",
    summary: "سكريبت من ثلاثة أجزاء: الافتتاحية والمحتوى والدعوة (Hook/Body/CTA).",
    role: "تعدّل كل جزء وتحفظ نسخة جديدة متى ما احتجت.",
    today: "تحرير الأجزاء الثلاثة وحفظ النسخ في متصفحك.",
    later: "التوليد الآلي لخمس صيغ متاح في «الاستوديو الحي»، والجولة المحلية بعيّنة ثابتة.",
    status: "partial",
  },
  {
    id: "review",
    title: "المراجعة البشرية",
    summary: "ما فيه خطوة تتقدّم بدون موافقتك الصريحة.",
    role: "تقارن النسخ وتعتمد النسخة النهائية بنفسك.",
    today: "اعتماد صريح لنسخة محددة، يُحفظ في متصفحك فقط.",
    later: "مراجعة جماعية وحفظ على الخادم.",
    status: "available",
  },
  {
    id: "preview",
    title: "المعاينة الإعلامية",
    summary: "لوحة قصة عمودية تبيّن مشاهد الفيديو بالترتيب.",
    role: "تراجع المشاهد والنص المصاحب قبل أي إنتاج.",
    today: "لوحة قصة ثابتة، بدون صوت وبدون ملف فيديو.",
    later: "معاينة الصوت متاحة في «الاستوديو الحي»، والصوت السعودي النهائي وتصدير MP4 لاحقًا.",
    status: "partial",
  },
];

export type ShowcaseItem = { id: string; title: string; caption: string };

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  { id: "source", title: "إدخال المصدر", caption: "حقل واضح للنص الأصلي مع عدّاد للأحرف." },
  { id: "script", title: "تحرير السكريبت", caption: "الافتتاحية والمحتوى والدعوة، كل جزء في مكانه." },
  { id: "sample", title: "عيّنة مرتبطة بالمصدر", caption: "كل جملة في العيّنة تشير لمكانها في المصدر." },
  { id: "revisions", title: "نسخ السكريبت", caption: "كل تعديل محفوظ كنسخة تقدر ترجع لها." },
  { id: "approval", title: "الاعتماد المحلي", caption: "اعتماد صريح منك، محفوظ في هذا المتصفح." },
  { id: "storyboard", title: "لوحة القصة", caption: "مشاهد عمودية ثابتة لمراجعة الفكرة." },
];

export type VisionStatus = "ضمن الرؤية" | "قريبًا";

export type VisionFormat = { id: string; title: string; text: string; status: VisionStatus };

export const VISION_FORMATS: VisionFormat[] = [
  { id: "video", title: "فيديو عمودي قصير", text: "من لوحة القصة إلى فيديو بصوت سعودي.", status: "ضمن الرؤية" },
  { id: "post", title: "منشور نصي", text: "صياغة مختصرة تناسب طبيعة كل منصة.", status: "ضمن الرؤية" },
  { id: "carousel", title: "سلسلة شرائح", text: "تقسيم الفكرة إلى شرائح متتابعة.", status: "ضمن الرؤية" },
  { id: "audio", title: "سكريبت صوتي", text: "نص جاهز للتسجيل الصوتي أو البودكاست.", status: "ضمن الرؤية" },
  { id: "brief", title: "ملخص إخباري", text: "نسخة موجزة للنشرات والقنوات.", status: "ضمن الرؤية" },
];

export const NOT_OPERATIONAL = [
  "النشر التلقائي",
  "الصوت السعودي (TTS)",
  "تصدير الفيديو MP4",
];

export const CONVERSION = {
  title: "جاهز تبدأ أول نبضة؟",
  primary: "ابدأ التجربة",
  secondary: "اكتشف كيف تعمل نبضة",
  plannedRoute: "/login",
};

export const FAQ_ITEMS = [
  {
    q: "وش الميزات المتاحة في التجربة الحين؟",
    a: "إدخال المصدر، وعيّنة تطوير مرتبطة بالمصدر، وتحرير السكريبت بأجزائه الثلاثة مع حفظ النسخ، والاعتماد المحلي، ولوحة قصة عمودية ثابتة.",
  },
  {
    q: "وين تنحفظ بياناتي؟",
    a: "الاعتمادات والنسخ تبقى في متصفحك فقط، ومسح بيانات المتصفح يحذفها. في «الاستوديو الحي» يُرسل النص إلى مزوّد النموذج لتوليد المحتوى، ولا نحفظه على خوادم نبضة. لا ترفع محتوى سريًا.",
  },
  {
    q: "هل يُعتمد السكريبت تلقائيًا؟",
    a: "لا. الاعتماد خطوة صريحة تسويها بنفسك لنسخة محددة، وتُحفظ محليًا.",
  },
  {
    q: "هل أقدر أطلع فيديو جاهز؟",
    a: "ليس حاليًا. المعاينة لوحة قصة ثابتة بدون صوت أو ملف فيديو. الصوت السعودي وتصدير MP4 ضمن الرؤية.",
  },
  {
    q: "هل التوليد بالذكاء الاصطناعي شغال؟",
    a: "إي. الاستوديو الحي يولّد من أي نص تلصقه: حقائق مربوطة بالمصدر، وخمس صيغ، ومدقّق. اضغط «جرّب نبضة». أما النشر المباشر على المنصات وتنبيه الصيغ عند تغيير المصدر وتعلّم نبرة الجهة فلا تزال ضمن الرؤية وبنعلن عنها لما تجهز.",
  },
];
