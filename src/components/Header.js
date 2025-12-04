'use client';
import { Geist } from 'next/font/google'; // testing how it's like to add geist an already imported font

const geist = Geist({ subsets: ['latin'] });

function Header() {
  return (
    <main>
      <h1 className={`${geist.className} mt-8 py-2 text-center text-4xl text-orange-600 font-bold`}>
      ECS Diversity and Leadership Summit
      </h1>
        <h2 className ="m-0 py-2 text-center text-3xl text-orange-600 font-bold">Bingo</h2>
    </main>
  )
}

export default Header;