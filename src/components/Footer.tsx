"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Heart, ShieldCheck } from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-obsidian-950 border-t border-white/10 pt-16 pb-12 px-5 text-neutral-400 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        {/* Brand */}
        <div className="text-center md:text-left">
          <Link href="/" className="inline-block font-serif text-2xl text-white tracking-widest uppercase mb-2">
            Bylumenia
          </Link>
          <p className="font-light text-neutral-400 max-w-sm leading-relaxed">
            Butik visual pernikahan & prewedding. Mengabadikan kedalaman emosi dan gestur mikro sepasang kekasih.
          </p>
          <div className="mt-3 flex items-center justify-center md:justify-start gap-1.5 text-gold-400 text-[11px]">
            <MapPin className="w-3.5 h-3.5" />
            <span>Semarang &bull; Solo &bull; Yogyakarta &bull; Luar Kota</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-widest text-neutral-300">
          <a
            href="https://www.instagram.com/bylumenia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-gold-300 transition-colors"
          >
            <InstagramIcon className="w-4 h-4 text-gold-400" />
            <span>@bylumenia</span>
          </a>
          <a
            href="https://www.instagram.com/hai_ivaan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-gold-300 transition-colors"
          >
            <InstagramIcon className="w-4 h-4 text-gold-400" />
            <span>@hai_ivaan</span>
          </a>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 hover:text-gold-300 transition-colors text-gold-400/80"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Dasbor Kurator</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
        <p>
          &copy; {new Date().getFullYear()} Bylumenia Studio. Hak Cipta Dilindungi.
        </p>
        <p className="flex items-center gap-1">
          Dirancang dengan <Heart className="w-3 h-3 text-gold-400 fill-gold-400" /> oleh{" "}
          <span className="text-neutral-300">Outlook Universe (OUNERS)</span>
        </p>
      </div>
    </footer>
  );
}
