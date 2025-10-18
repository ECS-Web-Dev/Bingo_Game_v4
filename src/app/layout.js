import "./globals.css";

export const metadata = { title: "Bingo", description: "MERN Bingo" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
