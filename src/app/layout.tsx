import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
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
  title: "Bylumenia • Butik Visual Pernikahan & Prewedding",
  description:
    "Merekam kedalaman emosi, gestur mikro, dan keabadian rasa di atas sekadar kuantitas. Sistem reservasi sinematik dan galeri visual Semarang & Luar Kota.",
  icons: {
    icon: "/favicon.ico",
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
      </body>
    </html>
  );
}
