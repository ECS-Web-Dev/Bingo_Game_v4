// src/app/api/leaderboard/route.js
import { NextResponse } from "next/server";
import redis from "@/utils/redis";
import fs from "fs";
import path from "path";

const LEADERBOARD_KEY = "prompt-clicks";
const GRID_SIZE = 5;

function buildPromptLookup(promptsData) {
  const lookup = {};

  for (const [dayKey, promptsArray] of Object.entries(promptsData)) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const idx = r * GRID_SIZE + c;
        const text = promptsArray[idx];
        if (!text) continue;

        const boxId = `r${r + 1}c${c + 1}`;
        const promptId = `${dayKey}:${boxId}`;

        lookup[promptId] = text;
      }
    }
  }

  return lookup;
}

export async function GET() {
  try {
    // 1) Read prompts.json from /public
    const filePath = path.join(process.cwd(), "public", "prompts.json");
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const promptsData = JSON.parse(fileContents);

    const promptLookup = buildPromptLookup(promptsData);

    // 2) Get top N from Redis with scores
    const raw = await redis.zRangeWithScores(LEADERBOARD_KEY, 0, 9, {
      REV: true,
    });

    // raw = [ { value: "day1:r3c4", score: 2 }, ... ]
    const leaderboard = raw.map(({ value, score }) => ({
      promptId: value,
      promptText: promptLookup[value] ?? null,
      clicks: score,
    }));

    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error("Error in /api/leaderboard:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
