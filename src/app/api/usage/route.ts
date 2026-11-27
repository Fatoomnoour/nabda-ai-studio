import { peekUsage } from "@/lib/server/ai-provider";

export const dynamic = "force-dynamic";

// Read-only: how much of today's trial allowance this visitor has left. Does not count as a generation.
export async function GET(request: Request) {
  return Response.json(await peekUsage(request, "gen"), { headers: { "cache-control": "no-store" } });
}
