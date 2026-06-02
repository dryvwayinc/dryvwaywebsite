import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Serif is now used exclusively for the decorative italic accents, so we only
// load the italic 400 cut.
const sourceSerif = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dryvwayinc.com";
const DESCRIPTION =
  "List your driveway in five minutes and earn every time someone parks. Or find a spot near the stadium, the airport, the office — and skip the circling.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Dryvway — Your driveway. Their destination.",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Dryvway",
    title: "Dryvway — Your driveway. Their destination.",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Dryvway — Your driveway. Their destination.",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}
