import { NextResponse } from "next/server";
import { getGlobalStats, getLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export async function GET() {
  const [leaderboard, stats] = await Promise.all([getLeaderboard(50), getGlobalStats()]);
  return NextResponse.json(
    { leaderboard, stats, ts: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
