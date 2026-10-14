"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Menu, X, ShieldCheck, Volume2, VolumeX } from "lucide-react";

interface NavbarProps {
  onOpenBooking: () => void;
  isMuted?: boolean;
  onToggleAudio?: () => void;
}

export default function Navbar({ onOpenBooking, isMuted = true, onToggleAudio }: NavbarProps) {
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
          <a
            href="#galeri"
            className="hover:text-gold-300 transition-colors py-1"
          >
            Kisah Kamu
          </a>
          <a
            href="#filosofi"
            className="hover:text-gold-300 transition-colors py-1"
          >
            Filosofi
          </a>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-gold-400/15 text-neutral-300 hover:text-gold-300 border border-white/10 hover:border-gold-400/40 transition-all text-xs touch-manipulation shrink-0"
            title="Ruang Kurator Internal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span>Kurator</span>
          </Link>
        </div>

        {/* Action Button & Audio Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Integrated Audio Control Pill */}
          {onToggleAudio && (
            <button
              onClick={onToggleAudio}
              type="button"
              className={`p-2 sm:px-3 sm:py-1.5 rounded-full border transition-all duration-300 flex items-center gap-1.5 text-xs ${
                isMuted
                  ? "bg-white/5 border-white/15 text-neutral-400 hover:text-white hover:border-white/30"
                  : "bg-gold-400/20 border-gold-400/50 text-gold-400 shadow-[0_0_12px_rgba(212,175,55,0.4)]"
              }`}
              title={isMuted ? "Putar Musik Latar" : "Senyapkan Musik"}
              aria-label="Audio Toggle"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              )}
              <span className="hidden lg:inline text-[10px] tracking-wider uppercase font-medium">
                {isMuted ? "Musik" : "Musik ♪"}
              </span>
            </button>
          )}

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
        <div className="md:hidden mt-2 max-w-sm mx-auto glass-panel rounded-2xl p-4 border border-white/10 animate-fade-in shadow-2xl">
          <div className="flex flex-col gap-3 text-sm tracking-wide text-neutral-300">
            <a
              href="#galeri"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-gold-300 transition-colors touch-manipulation"
            >
              Kisah Kamu (Galeri)
            </a>
            <a
              href="#filosofi"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-gold-300 transition-colors touch-manipulation"
            >
              Filosofi Kami
            </a>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl bg-gold-400/10 hover:bg-gold-400/20 text-gold-300 border border-gold-400/25 transition-colors flex items-center gap-2 text-xs font-medium touch-manipulation"
            >
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Ruang Kurator Admin</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
