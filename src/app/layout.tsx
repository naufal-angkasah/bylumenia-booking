import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bylumenia-booking.vercel.app"),
  title: "Studio Lumenia | Wedding & Prewedding",
  description:
    "Where every detail of your moment shines with timeless beauty & joy. Foto dan video pernikahan di Semarang, Solo, Jogja, & Luar Kota.",
  keywords: [
    "bylumenia",
    "wedding photography",
    "prewedding semarang",
    "studio lumenia",
    "fotografer pernikahan solo",
    "cinematic wedding",
  ],
  authors: [{ name: "Bylumenia Studio", url: "https://bylumenia-booking.vercel.app" }],
  creator: "Bylumenia",
  publisher: "Outlook Universe (OUNERS)",
  openGraph: {
    title: "Studio Lumenia | Wedding & Prewedding",
    description:
      "Where every detail of your moment shines with timeless beauty & joy. Foto dan video pernikahan di Semarang, Solo, Yogyakarta, & Luar Kota.",
    url: "https://bylumenia-booking.vercel.app",
    siteName: "Bylumenia Studio",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "https://bylumenia-booking.vercel.app/images/og-image.jpg",
        secureUrl: "https://bylumenia-booking.vercel.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Studio Lumenia | Wedding & Prewedding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio Lumenia | Wedding & Prewedding",
    description:
      "Where every detail of your moment shines with timeless beauty & joy. Foto dan video pernikahan di Semarang & Luar Kota.",
    images: ["https://bylumenia-booking.vercel.app/images/og-image.jpg"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth dark">
      <head>
        <title>Studio Lumenia | Wedding & Prewedding</title>
        <meta name="description" content="Where every detail of your moment shines with timeless beauty & joy. Foto dan video pernikahan di Semarang, Solo, Jogja, &amp; Luar Kota." />
        <meta property="og:title" content="Studio Lumenia | Wedding & Prewedding" />
        <meta property="og:description" content="Where every detail of your moment shines with timeless beauty & joy. Foto dan video pernikahan di Semarang, Solo, Yogyakarta, &amp; Luar Kota." />
        <meta property="og:url" content="https://bylumenia-booking.vercel.app/" />
        <meta property="og:site_name" content="Bylumenia Studio" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://bylumenia-booking.vercel.app/images/og-image.jpg" />
        <meta property="og:image:secure_url" content="https://bylumenia-booking.vercel.app/images/og-image.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Studio Lumenia | Wedding & Prewedding" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Studio Lumenia | Wedding & Prewedding" />
        <meta name="twitter:description" content="Where every detail of your moment shines with timeless beauty & joy. Foto dan video pernikahan di Semarang &amp; Luar Kota." />
        <meta name="twitter:image" content="https://bylumenia-booking.vercel.app/images/og-image.jpg" />
      </head>
      <body
        className={`${cormorant.variable} ${jakarta.variable} font-sans bg-obsidian-900 text-neutral-200 min-h-screen antialiased selection:bg-gold-400 selection:text-obsidian-950`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
