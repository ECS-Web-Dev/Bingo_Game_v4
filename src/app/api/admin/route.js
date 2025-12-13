// src/app/api/admin/route.js
import { NextResponse } from 'next/server';
import redis from '@/utils/redis';
import { resolveActiveDay } from '@/utils/day';

// Make sure this route is always dynamic (no static caching)
export const dynamic = 'force-dynamic';

function requireAuth(request) {
  const hdr = request.headers.get('authorization') || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(request) {
  try {
    const override = await redis.get('day:override');
    console.log('GET /api/admin -> override from redis:', override);

    const { day, source } = await resolveActiveDay(redis, undefined);
    console.log('GET /api/admin -> resolveActiveDay =>', { day, source });

    return NextResponse.json(
      { day, source, override: override || null },
      {
        // belt & suspenders: ensure no HTTP cache
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch (e) {
    console.error('GET /api/admin error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const authErr = requireAuth(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    console.log('POST /api/admin body:', body);

    const { day } = body;

    if (day !== 'day1' && day !== 'day2') {
      return NextResponse.json(
        { error: 'day must be "day1" or "day2"' },
        { status: 400 }
      );
    }

    await redis.set('day:override', day);
    console.log('POST /api/admin -> set day:override =', day);

    return NextResponse.json({ ok: true, override: day });
  } catch (e) {
    console.error('POST /api/admin error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const authErr = requireAuth(request);
  if (authErr) return authErr;

  try {
    await redis.del('day:override');
    console.log('DELETE /api/admin -> del day:override');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/admin error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
