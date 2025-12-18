'use client';
import { Geist } from 'next/font/google'; // testing how it's like to add geist an already imported font

const geist = Geist({ subsets: ['latin'] });

function Header() {
  return (
    <main>
      <h1 className={`${geist.className} heading-main`}>
        ECS Diversity and Leadership Summit
      </h1>
      <h2 className ="heading-sub">
        Bingo
      </h2>
    </main>
  );
}

export default Header;