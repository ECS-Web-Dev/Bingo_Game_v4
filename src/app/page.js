'use client';
import { useState, useRef } from 'react';
import Header from '@/components/Header';
import Card from '@/components/Card';
// import Rules from '@/components/Rules';
// import Names from '@/components/Names';
// import ResetCardButton from '@/components/ui/ResetCardButton';
// import LeaderboardButton from '@/components/ui/LeaderboardButton';

import { Geist } from 'next/font/google';

const geist = Geist({ subsets: ['latin'] });

function HomePage() {
  const [hasEverWon, setHasEverWon] = useState(false);
  const [showWinProof, setShowWinProof] = useState(false); // controls WinButton popover
  
  const resetCardRef = useRef(null);

  return (
    <main className={geist.className}>
      <Header />
      <Card
        onFirstWin={() => setHasEverWon(true)}
        disablePopover={showWinProof}
        onResetReady={(resetFn) => {
          resetCardRef.current = resetFn;
        }}
      />
{/* 
      <LeaderboardButton />

      <ResetCardButton 
        onConfirm={() => resetCardRef.current?.()}
      />

      <Rules />

      <Names /> */}
    </main>
  )
}

export default HomePage;
