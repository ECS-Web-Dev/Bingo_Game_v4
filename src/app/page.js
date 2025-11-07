'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Rules from '@/components/Rules';
import WinButton from "@/components/ui/WinButton";


import { Geist } from 'next/font/google'; // I added this

const geist = Geist({ subsets: ['latin'] }); // I added this


function HomePage() {
  const [hasEverWon, setHasEverWon] = useState(false);
  const [showWinProof, setShowWinProof] = useState(false); // controls WinButton popover

  return (
    <main>
      <Header />
      <Card 
        onFirstWin={() => setHasEverWon(true)}
        disablePopover={showWinProof}
      />
      
      {hasEverWon && (
        <WinButton 
          open={showWinProof}
          onOpenChange={setShowWinProof}
          buttonText="Winner!"
          proofTExt={"I've won Bingo!"}
        />
      )}

      <Rules />
    </main>
  )
}

export default HomePage;