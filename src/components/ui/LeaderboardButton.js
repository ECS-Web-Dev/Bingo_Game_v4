'use client';
import Link from 'next/link';

export default function LeaderboardButton() {
  return (
    <div className="py-3 relative flex justify-center my-4">

      <Link
        href="/leaderboard"
        className ="btn btn-emerald"
      >
        View Leaderboard
      </Link>
    </div>
  );
} 
