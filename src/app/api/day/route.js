// GET /api/day -> { "day": "day1" } or day2
// respects admin override and time-based logic

import { NextResponse } from 'next/server';
import redis from '@/utils/redis';
import { resolveActiveDay } from '@/utils/day';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { day } = await resolveActiveDay(redis, undefined);
    return NextResponse.json({ day });
  } catch (e) {
    console.error('GET /api/day error:', e);
    // Fallback to day1 if something goes wrong
    return NextResponse.json({ day: 'day1', error: e.message }, { status: 500 });
  }
}
