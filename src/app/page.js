'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Rules from '@/components/Rules';
import WinButton from "@/components/ui/WinButton";
import LeaderboardButton from '@/components/ui/LeaderboardButton';

import { Geist } from 'next/font/google';

const geist = Geist({ subsets: ['latin'] });

function HomePage() {
  const [hasEverWon, setHasEverWon] = useState(false);
  const [showWinProof, setShowWinProof] = useState(false); // controls WinButton popover

  return (
    <main className={geist.className}>
      <Header />
      <Card
        onFirstWin={() => setHasEverWon(true)}
        disablePopover={showWinProof}
      />

      <LeaderboardButton />

      {hasEverWon && (
        <WinButton
          open={showWinProof}
          onOpenChange={setShowWinProof}
          buttonText="Winner!"
          proofText={"I've won Bingo!"}
        />
      )}

      <Rules />
    </main>
  )
}

export default HomePage;
