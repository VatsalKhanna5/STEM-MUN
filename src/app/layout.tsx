import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STEM MUN Live Dashboard",
  description: "A real-time evaluation platform for STEM Model United Nations, showcasing live rankings, delegate performance, and judging insights.",
  keywords: ["STEM MUN", "Model UN", "live leaderboard", "debate scoring", "real-time dashboard"],
  authors: [{ name: "Archive Adjudication Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-accent/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
