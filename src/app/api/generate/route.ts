import { overLimit, streamText, type Tier } from "@/lib/server/ai-provider";

export const maxDuration = 60;

export async function POST(request: Request) {
  if (overLimit(request, "gen")) {
    return Response.json({ error: "RATE_LIMITED", message: "تم الوصول للحد اليومي للتجربة" }, { status: 429 });
  }
  let body: { prompt?: unknown; tier?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    /* empty body */
  }
  const prompt = String(body.prompt || "").slice(0, 16000);
  if (!prompt) return Response.json({ error: "EMPTY_PROMPT" }, { status: 400 });
  const tier: Tier = body.tier === "quick" ? "quick" : "default";
  return streamText(prompt, tier);
}
