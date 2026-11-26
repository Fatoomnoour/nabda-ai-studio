// Server-only AI provider for the live studio (/studio).
// Keys live in server env vars only — never in the browser bundle.
// Provider order: Gemini (GEMINI_API_KEY) → Claude (ANTHROPIC_API_KEY).

export const SYSTEM_PROMPT =
  'أنت محرك التوليد في منصة "نبضة" لصناعة المحتوى الإعلامي والتعليمي باللهجة السعودية. ' +
  'نفّذ مهام صناعة المحتوى فقط (تلخيص، منشورات، سكريبتات، شرائح، أسئلة، تعليق صوتي، استخراج حقائق، تدقيق). ' +
  'لا تضف معلومة غير موجودة في المصدر. إذا طُلب منك أي شيء خارج ذلك فاعتذر في جملة واحدة.';

const GEMINI_BASE = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com";

export type Tier = "default" | "quick";
export type Provider = "gemini" | "anthropic" | null;

export function activeProvider(): Provider {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

export function ttsAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY) && process.env.NABDA_TTS !== "off";
}

// Best-effort per-IP daily limit (per serverless instance). Protects the demo budget.
// A campaign = ~8 model calls, so the visible "campaigns left" is remaining / REQUESTS_PER_CAMPAIGN.
export const REQUESTS_PER_CAMPAIGN = 8;
const hits = new Map<string, number>();

function usageKey(req: Request, bucket: string): string {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  return `${bucket}:${ip}:${new Date().toISOString().slice(0, 10)}`;
}
function dailyLimit(): number {
  const n = Number(process.env.DAILY_LIMIT_PER_IP || 80);
  return Number.isFinite(n) && n > 0 ? n : 80;
}
export type Usage = { used: number; limit: number; remaining: number; campaignsLeft: number };
function toUsage(used: number): Usage {
  const limit = dailyLimit();
  const remaining = Math.max(0, limit - used);
  return { used: Math.min(used, limit), limit, remaining, campaignsLeft: Math.floor(remaining / REQUESTS_PER_CAMPAIGN) };
}
/** Read the caller's usage without counting a request. */
export function peekUsage(req: Request, bucket = "gen"): Usage {
  return toUsage(hits.get(usageKey(req, bucket)) || 0);
}
/** Count one request. `over` is true once the daily limit is exceeded (the request must be refused). */
export function consumeUsage(req: Request, bucket: string): { over: boolean; usage: Usage } {
  const key = usageKey(req, bucket);
  const n = (hits.get(key) || 0) + 1;
  hits.set(key, n);
  return { over: n > dailyLimit(), usage: toUsage(n) };
}
export function overLimit(req: Request, bucket: string): boolean {
  return consumeUsage(req, bucket).over;
}

// Claude is only a fallback when Gemini fails. Hard cap on fallback calls per day per instance
// (CLAUDE_FALLBACK_DAILY_MAX, default 16; 0 disables). Real spend cap: set a monthly limit in the Anthropic Console.
let fallbackDay = "";
let fallbackCount = 0;
function claudeFallbackAllowed(): boolean {
  if (!process.env.ANTHROPIC_API_KEY) return false;
  const max = Number(process.env.CLAUDE_FALLBACK_DAILY_MAX ?? 16);
  if (!(max > 0)) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (fallbackDay !== today) {
    fallbackDay = today;
    fallbackCount = 0;
  }
  if (fallbackCount >= max) return false;
  fallbackCount++;
  return true;
}
export function fallbackEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY) && Number(process.env.CLAUDE_FALLBACK_DAILY_MAX ?? 16) > 0;
}

/** Reads an SSE stream and forwards only the text deltas picked by `pick`. */
function sseToText(upstream: Response, pick: (ev: unknown) => string | undefined): ReadableStream<Uint8Array> {
  const reader = upstream.body!.getReader();
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  let buf = "";
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buf += dec.decode(value, { stream: true });
      let i: number;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue;
        try {
          const t = pick(JSON.parse(line.slice(5)));
          if (t) controller.enqueue(enc.encode(t));
        } catch {
          /* keep-alive or partial line */
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

export async function streamText(prompt: string, tier: Tier): Promise<Response> {
  const provider = activeProvider();
  if (provider === "gemini") {
    // Non-streaming generateContent (the SSE stream stalled on Vercel). Fast-first chain:
    // skip models the key can't use (404/400) or that don't answer within GEMINI_TIMEOUT_MS.
    const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || 25000);
    let last: Response | null = null;
    for (const model of geminiChain(tier)) {
      let upstream: Response;
      try {
        upstream = await fetch(`${GEMINI_BASE}/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 4096, ...thinkingFor(model) },
          }),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch {
        last = Response.json({ error: "UPSTREAM_TIMEOUT", model }, { status: 504 });
        continue;
      }
      if (upstream.ok) {
        const data = (await upstream.json()) as {
          candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
        };
        const text = (data.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || "").join("");
        return new Response(text, {
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-nabda-model": model, "x-nabda-provider": "gemini" },
        });
      }
      last = upstream;
      if (upstream.status !== 404 && upstream.status !== 400) break;
    }
    if (claudeFallbackAllowed()) {
      console.warn("GEMINI_FAILED_FALLBACK_TO_CLAUDE", last?.status);
      return anthropicStream(prompt, tier, "claude-fallback");
    }
    return last && last.headers.get("content-type")?.includes("json") && last.status === 504 ? last : upstreamError(last!);
  }
  if (provider === "anthropic") return anthropicStream(prompt, tier, "anthropic");
  return Response.json({ error: "INTEGRATION_NOT_CONFIGURED" }, { status: 503 });
}

async function anthropicStream(prompt: string, tier: Tier, label: string): Promise<Response> {
  const model =
    tier === "quick"
      ? process.env.ANTHROPIC_MODEL_QUICK || "claude-haiku-5-5"
      : process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      stream: true,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!upstream.ok) return upstreamError(upstream);
  return textResponse(
    sseToText(upstream, ev => {
      const e = ev as { type?: string; delta?: { text?: string } };
      return e.type === "content_block_delta" ? e.delta?.text : undefined;
    }),
    model,
    label,
  );
}

function textResponse(body: ReadableStream<Uint8Array>, model?: string, provider?: string): Response {
  const headers: Record<string, string> = { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" };
  if (model) headers["x-nabda-model"] = model;
  if (provider) headers["x-nabda-provider"] = provider;
  return new Response(body, { headers });
}

/** Fast-first model order. Override with GEMINI_MODEL (and GEMINI_MODEL_QUICK). */
export function geminiChain(tier: Tier): string[] {
  const pinned = tier === "quick" ? process.env.GEMINI_MODEL_QUICK || process.env.GEMINI_MODEL : process.env.GEMINI_MODEL;
  const defaults = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-2.5-flash-lite"];
  return [...new Set([...(pinned ? [pinned] : []), ...defaults])];
}

function thinkingFor(model: string): Record<string, unknown> {
  if (model.includes("lite")) return {}; // lite models: lowest thinking by default
  if (model.startsWith("gemini-2.5")) return { thinkingConfig: { thinkingBudget: 0 } };
  return { thinkingConfig: { thinkingLevel: process.env.GEMINI_THINKING_LEVEL || "low" } };
}

async function upstreamError(upstream: Response): Promise<Response> {
  const detail = (await upstream.text()).slice(0, 300);
  console.error("UPSTREAM_ERROR", upstream.status, detail);
  return Response.json({ error: "UPSTREAM_ERROR", status: upstream.status }, { status: 502 });
}

/** Gemini TTS → 16-bit PCM 24 kHz mono, wrapped as WAV so the browser can play it. */
export async function synthesizeSpeech(text: string): Promise<Response> {
  const model = process.env.GEMINI_TTS_MODEL || "gemini-3.8-flash-lite-tts";
  const voice = process.env.GEMINI_TTS_VOICE || "Kore";
  const upstream = await fetch(`${GEMINI_BASE}/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `اقرأ النص التالي بلهجة سعودية طبيعية وواضحة ونبرة ودودة:\n${text}` }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    }),
  });
  if (!upstream.ok) return upstreamError(upstream);
  const data = (await upstream.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[];
  };
  const b64 = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data)?.inlineData?.data;
  if (!b64) return Response.json({ error: "NO_AUDIO" }, { status: 502 });
  const pcm = Buffer.from(b64, "base64");
  return new Response(new Uint8Array(wav(pcm, 24000)), {
    headers: { "content-type": "audio/wav", "cache-control": "no-store" },
  });
}

function wav(pcm: Buffer, rate: number): Buffer {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
