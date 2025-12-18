'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [day, setDay] = useState('day1');              // active day
  const [dayLoading, setDayLoading] = useState(true);  // loading /api/day

  //Fetch current active day from /api/day
  useEffect(() => {
    let cancelled = false;

    async function fetchDay() {
      try {
        const res = await fetch('/api/day', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Failed to fetch day: ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled && (data.day === 'day1' || data.day === 'day2')) {
          setDay(data.day);
        }
      } catch (err) {
        console.error('Error fetching current day for leaderboard:', err);
        // If this fails, we just stick with the default "day1"
      } finally {
        if (!cancelled) {
          setDayLoading(false);
        }
      }
    }
    fetchDay();
    return () => {
      cancelled = true;
    };
  }, []);

  //Fetch leaderboard rows from current day
  useEffect(() => {
    // resolve data first, then load leaderboard
    if (dayLoading) return;
    let cancelled = false;

    async function loadLeaderboard() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`/api/leaderboard?day=${day}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data = await res.json();
        if(!cancelled)
          setRows(data.leaderboard || []);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        if(!cancelled)
          setError(err.message || 'Unknown error');
      } finally {
        if(!cancelled)
          setLoading(false);
      }
    }

    loadLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [day, dayLoading]);

  // max clicks for bar width calculation
  const maxClicks =
    rows.length > 0 ? Math.max(...rows.map((r) => r.clicks)) : 0;

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="heading-sub">
              Bingo Leaderboard
            </h1>
            <p className="text-md text-orange-600 mt-1">
              {dayLoading
                ? 'Loading current day…'
                : `Most-clicked prompts for ${day === 'day1' ? 'Day 1' : 'Day 2'}`}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            ← Back to Bingo
          </Link>
        </div>

        {/* Loading / error / empty states */}
        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Loading leaderboard…
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Error: {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            No clicks recorded yet. Play a round of Bingo to populate the
            leaderboard!
          </div>
        )}

        {/* Leaderboard table */}
        {!loading && !error && rows.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-100/80">
                <tr>
                  <th className="py-2 pl-4 pr-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rank
                  </th>
                  <th className="py-2 px-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Prompt
                  </th>
                  <th className="py-2 px-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Clicks
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...rows]
                  .sort((a, b) => b.clicks - a.clicks) // sort most → least
                  .map((row, idx) => {
                    const isTop1 = idx === 0;
                    const isTop2 = idx === 1;
                    const isTop3 = idx === 2;
                    const barWidth =
                      maxClicks > 0 ? (row.clicks / maxClicks) * 100 : 0;

                    return (
                      <tr
                        key={row.promptId}
                        className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Rank + medal */}
                        <td className="py-2 pl-4 pr-2 align-top">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">
                              #{idx + 1}
                            </span>
                            {isTop1 && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                                🥇 Top prompt
                              </span>
                            )}
                            {isTop2 && !isTop1 && (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                🥈
                              </span>
                            )}
                            {isTop3 && !isTop1 && !isTop2 && (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                🥉
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Prompt text + bar */}
                        <td className="py-3 px-2 align-top">
                          <div className="text-sm font-medium text-slate-900">
                            {row.promptText ?? 'Unknown prompt'}
                          </div>
                          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                            <div
                              className="h-1.5 rounded-full bg-emerald-400"
                              style={{
                                width: `${Math.max(barWidth, 8)}%`, // min width so low counts still show
                              }}
                            />
                          </div>
                        </td>

                        {/* Click count */}
                        <td className="py-3 pr-4 pl-2 align-top text-right">
                          <div className="text-sm font-semibold text-slate-900">
                            {row.clicks}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            clicks
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
