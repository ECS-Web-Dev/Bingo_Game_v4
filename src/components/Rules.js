'use client';

function Rules() {
  return (
    <main className="pb-10 px-5">
      <h3 className="rules-heading">
        How to Play
      </h3>

      <ul className="rules-list">
        <li>
          Each bingo square contains a conversation-starter or activity to help break the ice with other attendees.
          Use these prompts as inspiration to network with professionals and peers.
          To see the most popular prompts chosen by other attendees, select the <b>View Leaderboard</b> button.
        </li>
        <li>If text is cut off, tap the bingo square once to expand the full prompt.</li>
        <li>
          When you complete a prompt:
          <ol className="rules-steps">
            <li>Tap the bingo square.</li>
            <li>Enter the name of the person you met who helped you fulfill the criteria. <b>If no name is needed, enter <span>&quot;N/A.&quot;</span></b></li>
            <li>Select the <b>Submit</b> button.</li>
            <li>The square will be marked as complete.</li>
          </ol>
        </li>
          
        <li>
          After your first Bingo Win, show your device at the entry table to claim your prize.
        </li>
        
        <li>
          Reset the board to continue playing and challenge yourself to meet even more people.
        </li>

      </ul>
    </main>
  );
}

export default Rules;