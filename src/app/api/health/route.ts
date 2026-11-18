import { activeProvider, ttsAvailable } from "@/lib/server/ai-provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const provider = activeProvider();
  return Response.json(
    { ok: provider !== null, provider, tts: ttsAvailable() },
    { headers: { "cache-control": "no-store" } },
  );
}
