"use client";

import React, { useRef, useState } from "react";
import { Sparkles, Volume2, VolumeX, ArrowDown } from "lucide-react";

interface HeroSectionProps {
  onOpenBooking: () => void;
}

export default function HeroSection({ onOpenBooking }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          className="w-full h-full object-cover scale-105 filter brightness-75 contrast-105 transition-transform duration-1000 ease-out"
        >
          <source src="/videos/hero-teaser.mp4" type="video/mp4" />
          {/* Fallback image if video fails */}
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80"
            alt="Bylumenia Wedding"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Cinematic Overlays (Vignette & Obsidian Gradient) */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-900/60 to-obsidian-950/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,10,0.85)_100%)]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 pt-28 pb-16 text-center flex flex-col items-center">
        {/* Boutique Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-gold-400/30 text-gold-300 text-xs tracking-widest uppercase mb-8 shadow-glow animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>Butik Visual Pernikahan &bull; Semarang & Luar Kota</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white tracking-tight leading-[1.08] mb-6 max-w-4xl">
          Bukan Dimana Kita Menemukan, Tapi{" "}
          <span className="italic font-normal gold-gradient-text">
            Bagaimana Kita Menenun Rasa.
          </span>
        </h1>

        {/* Poetic Subheadline */}
        <p className="max-w-2xl text-sm sm:text-base md:text-lg text-neutral-300/90 font-light leading-relaxed mb-10 tracking-wide">
          Bylumenia merekam kedalaman emosi, gestur mikro, dan keabadian cinta di atas sekadar kuantitas.
          Kami hanya menerima <span className="text-gold-300 font-normal">satu pasangan dalam satu hari</span> agar fokus semesta kami utuh untuk kalian.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onOpenBooking}
            className="gold-gradient-btn w-full sm:w-auto px-8 py-4 rounded-full text-xs sm:text-sm font-semibold tracking-widest uppercase flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all group"
          >
            <span>Ikrarkan Jadwal Kami</span>
            <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
          </button>

          <a
            href="#galeri"
            className="glass-panel glass-panel-hover w-full sm:w-auto px-8 py-4 rounded-full text-xs sm:text-sm text-neutral-200 tracking-widest uppercase font-medium flex items-center justify-center gap-2"
          >
            <span>Kisah Kamu</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-12 pt-8 border-t border-white/10 text-neutral-400 text-xs sm:text-sm tracking-wider uppercase">
          <div>
            <p className="text-white font-serif text-lg sm:text-xl font-normal text-gold-300">1 Pasangan</p>
            <p className="text-[11px] text-neutral-400">Komitmen Fokus Per Hari</p>
          </div>
          <div>
            <p className="text-white font-serif text-lg sm:text-xl font-normal text-gold-300">Sinematik</p>
            <p className="text-[11px] text-neutral-400">Editorial & Gestur Mikro</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-white font-serif text-lg sm:text-xl font-normal text-gold-300">Anti-Tabrakan</p>
            <p className="text-[11px] text-neutral-400">Kunci Jadwal 30 Menit</p>
          </div>
        </div>
      </div>

      {/* Floating Sound Toggle */}
      <button
        onClick={toggleMute}
        className="absolute bottom-6 right-6 z-20 p-3 rounded-full glass-panel border border-white/10 text-neutral-300 hover:text-gold-300 transition-colors shadow-lg"
        title={isMuted ? "Putar Audio Teaser" : "Senyapkan Audio"}
        aria-label="Audio Toggle"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-gold-400" />}
      </button>

      {/* Scroll Down Indicator */}
      <a
        href="#galeri"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-neutral-400 hover:text-gold-300 transition-colors animate-bounce"
        aria-label="Gulir ke bawah"
      >
        <ArrowDown className="w-4 h-4" />
      </a>
    </section>
  );
}
