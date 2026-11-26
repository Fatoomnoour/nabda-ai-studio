import { activeProvider, fallbackEnabled, streamText, ttsAvailable } from "@/lib/server/ai-provider";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

let probeHits: number[] = [];
function probeAllowed() {
  const now = Date.now();
  probeHits = probeHits.filter(t => now - t < 3_600_000);
  if (probeHits.length >= 5) return false;
  probeHits.push(now);
  return true;
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function GET(request: Request) {
  const provider = activeProvider();
  const body: Record<string, unknown> = { ok: provider !== null, provider, tts: ttsAvailable(), fallback: provider === "gemini" && fallbackEnabled() };
  // ?probe=1 with header "Authorization: Bearer <HEALTH_PROBE_TOKEN>" → one tiny billable generation (max 5/hour per instance). Public calls only report config. live generation to report which model answered and how fast.
  const probeToken = process.env.HEALTH_PROBE_TOKEN;
  const wantsProbe = new URL(request.url).searchParams.get("probe") === "1";
  const auth = request.headers.get("authorization") ?? "";
  if (provider && probeToken && wantsProbe && safeEqual(auth, `Bearer ${probeToken}`) && probeAllowed()) {
    const t0 = Date.now();
    const res = await streamText("قل: هلا", "quick");
    const text = (await res.text()).slice(0, 80);
    body.probe = { status: res.status, model: res.headers.get("x-nabda-model"), ms: Date.now() - t0, text };
  }
  return Response.json(body, { headers: { "cache-control": "no-store" } });
}
