// src/app/api/leaderboard/route.js
import { NextResponse } from "next/server";
import redis from "@/utils/redis";
import fs from "fs";
import path from "path";
import { resolveActiveDay } from "@/utils/day";

const LEADERBOARD_KEY = "prompt-clicks";
const GRID_SIZE = 5;

function buildPromptLookupForDay(promptsData, dayKey) {
  const lookup = {};
  const promptsArray = promptsData[dayKey];

  if(!Array.isArray(promptsArray))
    return lookup;

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
  return lookup;
}

export async function GET(request) {
  try {
    // 1) Determine current day
    const url = new URL(request.url);
    const dayParam = url.searchParams.get("day");
    const hintDay = 
      dayParam === "day1" || dayParam === "day2" ? dayParam : undefined;

    const { day } = await resolveActiveDay(redis, hintDay);

    // 2) Read prompts.json from /public
    const filePath = path.join(process.cwd(), "public", "prompts.json");
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const promptsData = JSON.parse(fileContents);

    const promptLookup = buildPromptLookupForDay(promptsData, day);

    // 3) Get all entries from Redis with scores
    const raw = await redis.zRangeWithScores(LEADERBOARD_KEY, 0, -1);
    // raw = [ { value: "day1:r3c4", score: 2 }, ... ]

    const filteredForDay = raw
      .filter(
        ({ value }) =>
          typeof value === "string" && 
          value.startsWith(`${day}:`) && 
          !value.endsWith(":r3c3") // exclude Free Space
      )
      .sort((a, b) => b.score - a.score)

    const leaderboard = filteredForDay.map(({ value, score }) => ({
      promptId: value,
      promptText: promptLookup[value] ?? null,
      clicks: score,
    }));

    return NextResponse.json({ leaderboard, day });
  } catch (err) {
    console.error("Error in /api/leaderboard:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
