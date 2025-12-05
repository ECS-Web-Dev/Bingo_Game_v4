'use client';

function Rules() {
  return (
    <main className="pb-10 px-5">
      <h3 className ="m-0 py-5 text-center font-bold text-2xl underline">
        How to Play
      </h3>
      <ul className="mx-auto w-full max-w-xl list-disc pl-6 space-y-5">
        <li>Each square contains a conversation-starter or activity to help break the ice with other attendees.</li>
        <li>Use the prompts as inspiration for networking with professionals and peers.</li>
        <li>When you complete a prompt, mark it as complete by clicking to tapping the square.</li>
        <li>If a prompt is cut off, <strong>Press and hold</strong> any square to view the
          complete text in a popup. Click anywhere to dismiss it</li>
        <li> When you get Bingo, show your device at the entry table to claim your prize.</li>
        <li>Want to keep going? You can reset the board and challenge yourself to meet even more people.</li>
      </ul>
    </main>
  );
}

export default Rules;