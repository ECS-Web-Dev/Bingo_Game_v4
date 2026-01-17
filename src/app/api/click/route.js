import { NextResponse } from "next/server";
import { redis } from '@/utils/redis';

function getClientId(request) {
  // Try cookie first
  const cookie = request.cookies.get("bingo_id")?.value;
  if (cookie) return cookie;

  // Fallback to IP + user-agent (good enough for soft limiting)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    "unknown-ip";

  const ua = request.headers.get("user-agent") ?? "unknown-ua";

  return `${ip}:${ua}`;
}

const LEADERBOARD_KEY = "prompt-clicks";

// Cooldown in seconds (30–60 is typical)
const COOLDOWN_SECONDS = 45;

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

    // Identify this browser/session (soft, anonymous)
    const clientId =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("user-agent") ??
      "unknown";

    // Cooldown key: prevents rapid repeat increments
    const cooldownKey = `cooldown:${promptId}:${clientId}`;

    // 1️⃣ Check cooldown
    const onCooldown = await redis.get(cooldownKey);

    if (onCooldown) {
      // Ignore the click silently
      return NextResponse.json({
        promptId,
        counted: false,
        reason: "cooldown",
      });
    }

    // 2️⃣ Increment leaderboard
    const newScore = await redis.zincrby(
      LEADERBOARD_KEY,
      1,
      String(promptId)
    );

    // 3️⃣ Set cooldown key with TTL
    await redis.set(cooldownKey, "1", {
      ex: COOLDOWN_SECONDS,
    });

    return NextResponse.json({
      promptId,
      counted: true,
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