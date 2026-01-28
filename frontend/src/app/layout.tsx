import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IKS - Indian Knowledge Systems",
  description: "Digital archive and research platform for Indian Knowledge Systems. Explore, preserve, and advance traditional wisdom through modern research methodologies.",
  keywords: ["Indian knowledge", "research", "manuscripts", "digital archive", "traditional wisdom"],
  authors: [{ name: "IKS Research Platform" }],
  openGraph: {
    title: "IKS - Indian Knowledge Systems",
    description: "Digital archive and research platform for Indian Knowledge Systems",
    type: "website",
  },
  icons: {
    icon: '/assets/iks.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
