// src/app/api/click/route.js
import { NextResponse } from "next/server";
import redis from "@/utils/redis";

const LEADERBOARD_KEY = "prompt-clicks";

export async function POST(request) {
  try {
    const body = await request.json();
    const promptId = body?.promptId;

    if (!promptId) {
      return NextResponse.json(
        { error: "Missing promptId" },
        { status: 400 }
      );
    }

    // ZINCRBY prompt-clicks 1 <promptId>
    const newScore = await redis.zIncrBy(
      LEADERBOARD_KEY,
      1,
      String(promptId)
    );

    return NextResponse.json({
      promptId,
      clicks: Number(newScore),
    });
  } catch (err) {
    console.error("Error in /api/click:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
