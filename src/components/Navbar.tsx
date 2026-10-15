"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Menu, X } from "lucide-react";
import { smoothScrollTo } from "@/lib/scroll";

interface NavbarProps {
  onOpenBooking: () => void;
  isMuted?: boolean;
  onToggleAudio?: () => void;
}

export default function Navbar({ onOpenBooking }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-4 left-0 right-0 z-40 px-3 sm:px-6 transition-all duration-300 pointer-events-none">
      <nav
        className={`max-w-6xl mx-auto rounded-full px-4 py-2 sm:px-6 sm:py-2.5 flex items-center justify-between transition-all duration-500 pointer-events-auto ${
          scrolled
            ? "glass-nav shadow-glow border border-gold-400/25 bg-obsidian-950/85 backdrop-blur-xl"
            : "bg-obsidian-900/75 backdrop-blur-md border border-white/10 shadow-lg"
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="font-serif text-xl sm:text-3xl tracking-widest text-white group-hover:text-gold-300 transition-colors uppercase font-light">
            Bylumenia
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400 shadow-[0_0_8px_#D4AF37] animate-pulse"></span>
        </Link>

        {/* Desktop & Tablet Links */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8 text-xs uppercase tracking-widest text-neutral-300 font-medium shrink-0">
          <button
            type="button"
            onClick={() => smoothScrollTo("#galeri", 80)}
            className="hover:text-gold-300 transition-colors py-1 cursor-pointer touch-manipulation"
          >
            Kisah Kamu
          </button>
          <button
            type="button"
            onClick={() => smoothScrollTo("#filosofi", 80)}
            className="hover:text-gold-300 transition-colors py-1 cursor-pointer touch-manipulation"
          >
            Tentang Kami
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 sm:gap-3">

          <button
            onClick={onOpenBooking}
            className="gold-gradient-btn px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 sm:gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Reservasi</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-300 hover:text-white active:scale-90 transition-transform touch-manipulation"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-sm mx-auto glass-panel rounded-2xl p-3 sm:p-4 border border-gold-400/25 bg-obsidian-950/95 backdrop-blur-2xl animate-fade-in shadow-[0_12px_40px_rgba(0,0,0,0.85)] pointer-events-auto">
          <div className="flex flex-col gap-1.5 text-sm tracking-wide text-neutral-300">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                smoothScrollTo("#galeri", 80);
              }}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 hover:text-gold-300 active:bg-white/15 transition-all touch-manipulation cursor-pointer flex items-center justify-between group"
            >
              <span className="font-medium">Kisah Kamu (Galeri)</span>
              <span className="text-gold-400 text-xs transition-transform group-hover:translate-x-1">&rarr;</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                smoothScrollTo("#filosofi", 80);
              }}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 hover:text-gold-300 active:bg-white/15 transition-all touch-manipulation cursor-pointer flex items-center justify-between group"
            >
              <span className="font-medium">Tentang Kami</span>
              <span className="text-gold-400 text-xs transition-transform group-hover:translate-x-1">&rarr;</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
