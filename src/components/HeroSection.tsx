"use client";

import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, ArrowDown } from "lucide-react";
import { smoothScrollTo } from "@/lib/scroll";

interface HeroSectionProps {
  onOpenBooking: () => void;
  isPaused?: boolean;
  isMuted?: boolean;
  hasEntered?: boolean;
  onToggleMute?: () => void;
  onAudioChange?: (muted: boolean) => void;
}

export default function HeroSection({
  onOpenBooking,
  isPaused,
  isMuted: propIsMuted,
  hasEntered,
  onToggleMute,
  onAudioChange,
}: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [internalMuted, setInternalMuted] = useState(true);

  const isMuted = propIsMuted !== undefined ? propIsMuted : internalMuted;
  const setIsMuted = (val: boolean) => {
    setInternalMuted(val);
    onAudioChange?.(val);
  };

  // Sync external isMuted changes to video element
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = isMuted;
    if (!isMuted && !isPaused) {
      videoRef.current.volume = 0.85;
      videoRef.current.play().catch(() => {});
    }
  }, [isMuted, isPaused]);

  // When welcome screen is clicked to enter: immediately unlock audio and play!
  useEffect(() => {
    if (hasEntered && videoRef.current && !isPaused) {
      videoRef.current.muted = false;
      videoRef.current.volume = 0.85;
      videoRef.current.play().catch(() => {});
    }
  }, [hasEntered, isPaused]);

  // Pause hero background video when booking modal is open to avoid audio clashing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPaused) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [isPaused]);

  // Direct Autoplay visually rolling immediately without hesitation
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Guaranteed visual playback immediately on load
    video.muted = true;
    video.defaultMuted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }

    // Unlock audio seamlessly on very first user gesture anywhere on screen
    const unlockAudio = () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.muted = false;
        videoRef.current.volume = 0.75;
        videoRef.current.play().catch(() => {});
        setIsMuted(false);
      }
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("scroll", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };

    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });
    window.addEventListener("scroll", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("scroll", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = () => {
    if (onToggleMute) {
      onToggleMute();
      return;
    }
    if (videoRef.current) {
      const next = !isMuted;
      videoRef.current.muted = next;
      if (!next) {
        videoRef.current.volume = 0.75;
        videoRef.current.play().catch(() => {});
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
          src="/videos/hero-teaser.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80"
          className="w-full h-full object-cover scale-105 filter brightness-[0.96] contrast-105 saturate-105 transition-transform duration-1000 ease-out"
        >
          {/* Fallback image if video fails */}
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80"
            alt="Bylumenia Wedding"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Minimal Soft Vignette so video is 100% crisp and clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 pt-28 pb-16 text-center flex flex-col items-center">
        {/* Main Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-white tracking-tight leading-[1.12] sm:leading-[1.08] mb-10 max-w-4xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
          Where every detail of your moment shines with{" "}
          <span className="italic font-normal gold-gradient-text block sm:inline mt-1 sm:mt-0 drop-shadow-[0_2px_16px_rgba(212,175,55,0.4)]">
            timeless beauty &amp; joy.
          </span>
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
          <button
            onClick={onOpenBooking}
            className="gold-gradient-btn w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-full text-xs sm:text-sm font-semibold tracking-widest uppercase flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all group"
          >
            <span>Reserve</span>
            <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
          </button>

          <button
            type="button"
            onClick={() => smoothScrollTo("#galeri", 80)}
            className="glass-panel glass-panel-hover w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-full text-xs sm:text-sm text-neutral-200 tracking-widest uppercase font-medium flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer touch-manipulation"
          >
            <span>Kisah Kamu</span>
          </button>
        </div>
      </div>

      {/* Audio Controller Icon Only — Bottom-Left */}
      <button
        onClick={toggleMute}
        className={`fixed sm:absolute bottom-6 left-6 z-30 flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 shadow-xl active:scale-90 border backdrop-blur-md ${
          isMuted
            ? "bg-black/60 border-white/20 text-neutral-400 hover:text-white hover:border-gold-400/50 hover:scale-105"
            : "bg-black/70 border-gold-400/60 text-gold-400 shadow-[0_0_18px_rgba(212,175,55,0.45)] hover:scale-105"
        }`}
        title={isMuted ? "Putar Musik" : "Senyapkan Musik"}
        aria-label="Audio Toggle"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-neutral-300" />
        ) : (
          <Volume2 className="w-5 h-5 text-gold-400 animate-pulse" />
        )}
      </button>

      {/* Scroll Down Indicator */}
      <a
        href="#galeri"
        onClick={(e) => {
          e.preventDefault();
          smoothScrollTo("#galeri", 80);
        }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-neutral-400 hover:text-gold-300 transition-colors animate-bounce cursor-pointer touch-manipulation"
        aria-label="Gulir ke bawah"
      >
        <ArrowDown className="w-4 h-4" />
      </a>
    </section>
  );
}
