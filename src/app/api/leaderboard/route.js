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
  
    // Create a lookup for prompt texts
    const promptLookup = buildPromptLookupForDay(promptsData, day);

    // 3) Get all entries from Redis first
    const raw = await redis.zRangeWithScores(LEADERBOARD_KEY, 0, -1);
    // raw = [ { value: "day1:r3c4", score: 2 }, ... ]

    // New -- convert redis array to a map 
    const scoreMap = {};
    raw.forEach(({ value, score }) => {
      scoreMap[value] = score;
    });

    // 4) CHANGE: Map over the promptLookup keys (the 24/25 boxes)
    // instead of mapping over the Redis results.
    const leaderboard = Object.keys(promptLookup)
      .filter(promptId => !promptId.endsWith(":r3c3")) // Exclude Free Space
      .map((promptId) => ({
        promptId: promptId,
        promptText: promptLookup[promptId],
        // Default to 0 if the ID isn't in Redis
        clicks: scoreMap[promptId] || 0, 
      }))
      // Sort by clicks descending
      .sort((a, b) => b.clicks - a.clicks);

    return NextResponse.json({ leaderboard, day });
  } catch (err) {
    console.error("Error in /api/leaderboard:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
