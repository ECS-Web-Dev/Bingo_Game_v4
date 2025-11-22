// src/app/api/leaderboard/route.js
import { NextResponse } from "next/server";
import redis from "@/utils/redis";

const LEADERBOARD_KEY = "prompt-clicks";

export async function GET() {
  try {
    // Get top 10 sorted by score descending
    const raw = await redis.zRange(LEADERBOARD_KEY, 0, 9, {
      REV: true,
      WITHSCORES: true,
    });

    const leaderboard = [];
    for (let i = 0; i < raw.length; i += 2) {
      leaderboard.push({
        promptId: raw[i],
        clicks: Number(raw[i + 1]),
      });
    }

    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error("Error in /api/leaderboard:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
