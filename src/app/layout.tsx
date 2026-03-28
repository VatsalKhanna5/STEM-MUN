import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STEM MUN | Scoring System",
  description: "Real-time scoring system for STEM Model United Nations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
