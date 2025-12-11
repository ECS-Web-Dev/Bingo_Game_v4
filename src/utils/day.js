const PT_TZ = 'America/Los_Angeles';
const FALLBACK_START_ISO = '2025-12-11T00:00:00-08:00'; 

function nowInPT() { //day calculations covert to PT regardless of server location
  return new Date(new Date().toLocaleString('en-US', { timeZone: PT_TZ }));
}

function parseStart() {
  const iso = process.env.NEXT_PUBLIC_EVENT_START || FALLBACK_START_ISO; //in .env.local

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid NEXT_PUBLIC_EVENT_START string');
  }
  return d; //returns even start time as date object
}

// ends after day 2
function dayForInstant(instant, start) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = instant.getTime() - start.getTime();
  if (diff < 0) return 'day1';
  if (diff < msPerDay) return 'day1';      // Friday 00:00–23:59 PT
  if (diff < 2 * msPerDay) return 'day2';  // Saturday 00:00–23:59 PT
  return 'day2';                            // Never advance beyond day2
}

export async function resolveActiveDay(redis, hintDay) {
  // 1) If the API caller explicitly passed a valid day, honor it
  if (hintDay === 'day1' || hintDay === 'day2') return { day: hintDay, source: 'hint' };

  // 2) Manual override stored in Redis (set via admin API below)
  //    Value should be 'day1' or 'day2'
  try {
    const override = await redis.get('day:override');
    if (override === 'day1' || override === 'day2') {
      return { day: override, source: 'override' };
    }
  } catch (_) {} //empty catch, if redis fails, just skips override and falls back to auto

  // 3) Automatic window based on PT midnight boundaries
  const start = parseStart();
  const nowPT = nowInPT();
  const autoDay = dayForInstant(nowPT, start);
  return { day: autoDay, source: 'auto' };
}