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
    "Merekam kedalaman emosi, gestur mikro, dan keabadian rasa di atas sekadar kuantitas. Sistem reservasi sinematik dan galeri visual Semarang & Luar Kota.",
  openGraph: {
    title: "Bylumenia • Butik Visual Pernikahan & Prewedding",
    description:
      "Bukan dimana kita menemukan, tapi bagaimana kita menenun rasa. Sistem reservasi sinematik dan arsip portofolio Semarang & Luar Kota.",
    url: "https://bylumenia-booking.vercel.app",
    siteName: "Bylumenia Studio",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Bylumenia • Butik Visual Pernikahan & Prewedding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bylumenia • Butik Visual Pernikahan & Prewedding",
    description:
      "Bukan dimana kita menemukan, tapi bagaimana kita menenun rasa. Sistem reservasi sinematik dan arsip portofolio Semarang & Luar Kota.",
    images: ["/images/og-image.svg"],
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
