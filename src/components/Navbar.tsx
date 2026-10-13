"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Menu, X, ShieldCheck } from "lucide-react";

interface NavbarProps {
  onOpenBooking: () => void;
}

export default function Navbar({ onOpenBooking }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 pt-4 sm:pt-6 transition-all duration-300">
      <nav
        className={`max-w-6xl mx-auto rounded-full px-5 py-3 sm:px-7 sm:py-3.5 flex items-center justify-between transition-all duration-500 ${
          scrolled
            ? "glass-nav shadow-glow border border-gold-400/20"
            : "bg-obsidian-900/60 backdrop-blur-md border border-white/10"
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-serif text-2xl sm:text-3xl tracking-widest text-white group-hover:text-gold-300 transition-colors uppercase font-light">
            Bylumenia
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400 shadow-[0_0_8px_#D4AF37] animate-pulse"></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-neutral-300 font-medium">
          <a
            href="#galeri"
            className="hover:text-gold-300 transition-colors"
          >
            Kisah Kamu
          </a>
          <a
            href="#paket"
            className="hover:text-gold-300 transition-colors"
          >
            Paket Cerita
          </a>
          <a
            href="#filosofi"
            className="hover:text-gold-300 transition-colors"
          >
            Filosofi
          </a>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-neutral-400 hover:text-gold-400 transition-colors"
            title="Ruang Kurator Internal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400/70" />
            <span>Kurator</span>
          </Link>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBooking}
            className="gold-gradient-btn px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reservasi</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-300 hover:text-white"
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
              className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-gold-300 transition-colors"
            >
              Kisah Kamu (Galeri)
            </a>
            <a
              href="#paket"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-gold-300 transition-colors"
            >
              Paket Cerita
            </a>
            <a
              href="#filosofi"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-gold-300 transition-colors"
            >
              Filosofi Kami
            </a>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-gold-400 transition-colors flex items-center gap-2 text-gold-300"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ruang Kurator Admin</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
