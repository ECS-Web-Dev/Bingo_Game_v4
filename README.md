# Bingo Game v.3.0

This is an updated version of a bingo game I created for Cal State Fullerton's 2025 Coding Bootcamp. 

This updated version has a more streamlined folder structure, is optimized for mobile devices, and has updated game logic. 
Tips for new contributors can be found here: [Project Guide](https://github.com/eliO160/BingoGame_v3/blob/main/PROJECT_GUIDE.md)

## Project Objective
***Bingo Game v.3*** is created for use in conventions as an ice-breaker game. The project goal is to create a simple webpage that participants could load onto their phones and interact with during the duration of a weekend-long convention. Each box on the 5x5 grid contains 25 conversation starters or conversation takeaways that encourage players to network with other attendees. If a participant completed a prompt, they can tap on a box to mark it as complete. 5 complete squares in a row prompts the game to alert the participant that they have won the game and where to go to claim their prize. 

The game persists after the participant wins Bingo in order to continue to inspire attendees to network throughout the event. 


## Future Work
These features will be added to v.4.0:
1. Increase the size of the Win Popover for readability
2. Adapt the front end design to the convention branding
3. Move the in-code prompts and Box data model into a database. The db should then seed the Box components with the prompts.
4. Add a schema to the Box Component and in the db to track the number of times a certain Box was clicked by different participants.
5. Create a second page that displays the Box prompts in order of frequency (how often different participants click on a certain Box). This second page acts as a Leader Board that shows the popularity of prompts from highest to lowest. 


## Tech Stack
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). I used the library, TailwindCSS, to subsidize component design.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
