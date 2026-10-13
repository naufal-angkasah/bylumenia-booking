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
  title: "Bylumenia • Butik Visual Pernikahan & Prewedding",
  description:
    "Merekam kedalaman emosi, gestur mikro, dan keabadian rasa di atas sekadar kuantitas. Sistem reservasi sinematik dan galeri visual Semarang, Solo, Jogja, & Luar Kota.",
  keywords: [
    "bylumenia",
    "wedding photography",
    "prewedding semarang",
    "butik visual",
    "fotografer pernikahan solo",
    "cinematic wedding",
  ],
  authors: [{ name: "Bylumenia Studio", url: "https://bylumenia-booking.vercel.app" }],
  creator: "Bylumenia",
  publisher: "Outlook Universe (OUNERS)",
  openGraph: {
    title: "Bylumenia • Butik Visual Pernikahan & Prewedding",
    description:
      "Bukan dimana kita menemukan, tapi bagaimana kita menenun rasa. Sistem reservasi sinematik dan arsip portofolio Semarang, Solo, Yogyakarta, & Luar Kota.",
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
        alt: "Bylumenia • Butik Visual Pernikahan & Prewedding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bylumenia • Butik Visual Pernikahan & Prewedding",
    description:
      "Bukan dimana kita menemukan, tapi bagaimana kita menenun rasa. Sistem reservasi sinematik dan arsip portofolio Semarang & Luar Kota.",
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
        <title>Bylumenia • Butik Visual Pernikahan &amp; Prewedding</title>
        <meta name="description" content="Merekam kedalaman emosi, gestur mikro, dan keabadian rasa di atas sekadar kuantitas. Sistem reservasi sinematik dan galeri visual Semarang, Solo, Jogja, &amp; Luar Kota." />
        <meta property="og:title" content="Bylumenia • Butik Visual Pernikahan &amp; Prewedding" />
        <meta property="og:description" content="Bukan dimana kita menemukan, tapi bagaimana kita menenun rasa. Sistem reservasi sinematik &amp; arsip portofolio Semarang, Solo, Yogyakarta, &amp; Luar Kota." />
        <meta property="og:url" content="https://bylumenia-booking.vercel.app/" />
        <meta property="og:site_name" content="Bylumenia Studio" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://bylumenia-booking.vercel.app/images/og-image.jpg" />
        <meta property="og:image:secure_url" content="https://bylumenia-booking.vercel.app/images/og-image.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Bylumenia • Butik Visual Pernikahan &amp; Prewedding" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bylumenia • Butik Visual Pernikahan &amp; Prewedding" />
        <meta name="twitter:description" content="Merekam kedalaman emosi, gestur mikro, dan keabadian rasa di atas sekadar kuantitas. Sistem reservasi sinematik Semarang &amp; Luar Kota." />
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
