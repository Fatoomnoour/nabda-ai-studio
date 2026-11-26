import { consumeUsage, streamText, type Tier, type Usage } from "@/lib/server/ai-provider";

export const maxDuration = 60;

function withUsage(res: Response, usage: Usage): Response {
  const headers = new Headers(res.headers);
  headers.set("x-nabda-remaining", String(usage.remaining));
  headers.set("x-nabda-limit", String(usage.limit));
  headers.set("x-nabda-campaigns-left", String(usage.campaignsLeft));
  headers.set("access-control-expose-headers", "x-nabda-remaining,x-nabda-limit,x-nabda-campaigns-left,x-nabda-provider");
  return new Response(res.body, { status: res.status, headers });
}

export async function POST(request: Request) {
  const { over, usage } = consumeUsage(request, "gen");
  if (over) {
    return withUsage(
      Response.json(
        { error: "RATE_LIMITED", message: "تم الوصول للحد اليومي للتجربة" },
        { status: 429, headers: { "x-nabda-limit-reached": "daily" } },
      ),
      usage,
    );
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
  return withUsage(await streamText(prompt, tier), usage);
}
