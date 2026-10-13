"use client";

import React, { useRef, useState, useEffect } from "react";
import { Sparkles, Volume2, VolumeX, ArrowDown } from "lucide-react";

interface HeroSectionProps {
  onOpenBooking: () => void;
}

export default function HeroSection({ onOpenBooking }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set volume & attempt unmuted autoplay right away
    video.volume = 0.75;
    video.muted = false;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Unmuted autoplay succeeded!
          setIsMuted(false);
        })
        .catch(() => {
          // Browser blocked unmuted autoplay without previous interaction.
          // Fallback to muted autoplay so visual video plays immediately,
          // and automatically unmute on FIRST user interaction (tap / click / scroll).
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});

          const unlockAudio = () => {
            if (videoRef.current) {
              videoRef.current.muted = false;
              videoRef.current.volume = 0.75;
              setIsMuted(false);
            }
            window.removeEventListener("click", unlockAudio);
            window.removeEventListener("touchstart", unlockAudio);
            window.removeEventListener("scroll", unlockAudio);
          };

          window.addEventListener("click", unlockAudio, { once: true });
          window.addEventListener("touchstart", unlockAudio, { once: true });
          window.addEventListener("scroll", unlockAudio, { once: true });
        });
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      const next = !isMuted;
      videoRef.current.muted = next;
      if (!next) {
        videoRef.current.volume = 0.75;
      }
      setIsMuted(next);
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
          poster="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80"
          className="w-full h-full object-cover scale-105 filter brightness-[0.88] contrast-110 saturate-110 transition-transform duration-1000 ease-out"
        >
          {/* Primary MP4 source with full AAC audio track */}
          <source src="/videos/hero-teaser.mp4" type="video/mp4" />
          {/* Fallback image if video fails */}
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80"
            alt="Bylumenia Wedding"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Cinematic Overlays — Lighter so hero video is clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-900/35 to-obsidian-950/25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(10,10,10,0.6)_100%)]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 pt-28 pb-16 text-center flex flex-col items-center">
        {/* Boutique Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-gold-400/30 text-gold-300 text-xs tracking-widest uppercase mb-8 shadow-glow animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>Butik Visual Pernikahan &bull; Semarang & Luar Kota</span>
        </div>

        {/* Main Headline — Crisp with glow & shadow */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-white tracking-tight leading-[1.12] sm:leading-[1.08] mb-5 max-w-4xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
          Bukan Dimana Kita Menemukan, Tapi{" "}
          <span className="italic font-normal gold-gradient-text block sm:inline mt-1 sm:mt-0 drop-shadow-[0_2px_16px_rgba(212,175,55,0.4)]">
            Bagaimana Kita Menenun Rasa.
          </span>
        </h1>

        {/* Poetic Subheadline */}
        <p className="max-w-2xl text-xs sm:text-base md:text-lg text-neutral-200/95 font-light leading-relaxed mb-8 sm:mb-10 tracking-wide px-2 sm:px-0 drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
          Bylumenia merekam kedalaman emosi, gestur mikro, dan keabadian cinta di atas sekadar kuantitas.
          Kami hanya menerima <span className="text-gold-300 font-normal">satu pasangan dalam satu hari</span> agar fokus semesta kami utuh untuk kalian.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
          <button
            onClick={onOpenBooking}
            className="gold-gradient-btn w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-full text-xs sm:text-sm font-semibold tracking-widest uppercase flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all group"
          >
            <span>Ikrarkan Jadwal Kami</span>
            <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
          </button>

          <a
            href="#galeri"
            className="glass-panel glass-panel-hover w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-full text-xs sm:text-sm text-neutral-200 tracking-widest uppercase font-medium flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>Kisah Kamu</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-12 pt-6 sm:pt-8 border-t border-white/10 text-neutral-400 text-xs sm:text-sm tracking-wider uppercase w-full">
          <div>
            <p className="text-white font-serif text-base sm:text-xl font-normal text-gold-300">1 Pasangan</p>
            <p className="text-[10px] sm:text-[11px] text-neutral-400">Fokus Penuh Per Hari</p>
          </div>
          <div>
            <p className="text-white font-serif text-base sm:text-xl font-normal text-gold-300">Sinematik</p>
            <p className="text-[10px] sm:text-[11px] text-neutral-400">Editorial &amp; Gestur</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-white font-serif text-base sm:text-xl font-normal text-gold-300">Anti-Tabrakan</p>
            <p className="text-[10px] sm:text-[11px] text-neutral-400">Kunci Jadwal 30 Menit</p>
          </div>
        </div>
      </div>

      {/* Prominent Audio Toggle — Bottom-Left */}
      <button
        onClick={toggleMute}
        className="fixed sm:absolute bottom-6 left-6 z-30 flex items-center gap-2.5 rounded-full transition-all shadow-lg active:scale-90"
        title={isMuted ? "Putar Audio Teaser" : "Senyapkan Audio"}
        aria-label="Audio Toggle"
      >
        {/* Circular icon button */}
        <span
          className={`p-3.5 rounded-full border backdrop-blur-md transition-all duration-300 ${
            isMuted
              ? "bg-obsidian-900/80 border-white/20 text-neutral-300 hover:border-gold-400/50 hover:text-gold-300"
              : "bg-gold-400/20 border-gold-400/50 text-gold-400 shadow-[0_0_16px_rgba(212,175,55,0.4)]"
          }`}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
        </span>

        {/* Status text */}
        <span
          className={`px-3 py-1.5 rounded-full border text-[11px] tracking-wide backdrop-blur-md transition-all ${
            isMuted
              ? "bg-obsidian-900/90 border-white/15 text-neutral-300"
              : "bg-gold-400/15 border-gold-400/40 text-gold-300"
          }`}
        >
          {isMuted ? "Audio Hening (Ketuk untuk Dengar)" : "Audio Sinematik Aktif ♪"}
        </span>
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
