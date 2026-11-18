import { activeProvider, streamText, ttsAvailable } from "@/lib/server/ai-provider";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const provider = activeProvider();
  const body: Record<string, unknown> = { ok: provider !== null, provider, tts: ttsAvailable() };
  // ?probe=1 → one tiny live generation to report which model answered and how fast.
  if (provider && new URL(request.url).searchParams.get("probe") === "1") {
    const t0 = Date.now();
    const res = await streamText("قل: هلا", "quick");
    const text = (await res.text()).slice(0, 80);
    body.probe = { status: res.status, model: res.headers.get("x-nabda-model"), ms: Date.now() - t0, text };
  }
  return Response.json(body, { headers: { "cache-control": "no-store" } });
}
