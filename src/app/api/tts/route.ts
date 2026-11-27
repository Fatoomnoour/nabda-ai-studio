import { consumeUsage, synthesizeSpeech, ttsAvailable } from "@/lib/server/ai-provider";

export const maxDuration = 60;

export async function POST(request: Request) {
  if (!ttsAvailable()) return Response.json({ error: "INTEGRATION_NOT_CONFIGURED" }, { status: 503 });
  if ((await consumeUsage(request, "tts")).over) return Response.json({ error: "RATE_LIMITED" }, { status: 429 });
  let body: { text?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    /* empty body */
  }
  const text = String(body.text || "").slice(0, 2500);
  if (!text) return Response.json({ error: "EMPTY_TEXT" }, { status: 400 });
  return synthesizeSpeech(text);
}
