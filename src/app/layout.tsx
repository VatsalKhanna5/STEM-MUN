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
  openGraph: {
    title: "STEM MUN Live Dashboard",
    description: "Experience real-time scoring and live rankings in a premium STEM MUN environment",
    url: "https://stem-mun-2026.vercel.app/",
    siteName: "STEM MUN",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "STEM MUN Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STEM MUN Live Dashboard",
    description: "Experience real-time scoring and live rankings in a premium STEM MUN environment",
    images: ["/og-image.png"],
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
