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
const hits = new Map<string, number>();
export function overLimit(req: Request, bucket: string): boolean {
  const limit = Number(process.env.DAILY_LIMIT_PER_IP || 80);
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const key = `${bucket}:${ip}:${new Date().toISOString().slice(0, 10)}`;
  const n = (hits.get(key) || 0) + 1;
  hits.set(key, n);
  return n > limit;
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
    const model =
      tier === "quick"
        ? process.env.GEMINI_MODEL_QUICK || process.env.GEMINI_MODEL || "gemini-3.8-flash"
        : process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const upstream = await fetch(
      `${GEMINI_BASE}/v1beta/models/${model}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 4096,
            // Gemini 2.5 supports a zero thinking budget (faster); newer models use their defaults.
            ...(model.startsWith("gemini-2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
          },
        }),
      },
    );
    if (!upstream.ok) return upstreamError(upstream);
    return textResponse(
      sseToText(upstream, ev => {
        const parts = (ev as { candidates?: { content?: { parts?: { text?: string }[] } }[] }).candidates?.[0]
          ?.content?.parts;
        return parts?.map(p => p.text || "").join("");
      }),
    );
  }
  if (provider === "anthropic") {
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
    );
  }
  return Response.json({ error: "INTEGRATION_NOT_CONFIGURED" }, { status: 503 });
}

function textResponse(body: ReadableStream<Uint8Array>): Response {
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}

async function upstreamError(upstream: Response): Promise<Response> {
  const detail = (await upstream.text()).slice(0, 300);
  return Response.json({ error: "UPSTREAM_ERROR", status: upstream.status, detail }, { status: 502 });
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
