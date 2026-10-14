"use client";

import React, { useState } from "react";
import { Volume2 } from "lucide-react";

interface WelcomeScreenProps {
  onEnter: () => void;
}

export default function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [fading, setFading] = useState(false);

  const handleStart = () => {
    // Immediately call onEnter during the click event to guarantee audio permission in browser
    onEnter();
    setFading(true);
  };

  return (
    <div
      onClick={handleStart}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-obsidian-950/95 backdrop-blur-2xl transition-all duration-700 cursor-pointer ${
        fading ? "opacity-0 pointer-events-none scale-105" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Soft Gold Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gold-400/[0.08] blur-[140px] pointer-events-none rounded-full" />

      <div
        onClick={(e) => {
          e.stopPropagation();
          handleStart();
        }}
        className="relative max-w-lg w-full text-center p-8 sm:p-12 rounded-3xl glass-panel border border-gold-400/35 shadow-[0_0_80px_rgba(0,0,0,0.95)] animate-fade-in"
      >
        <h1 className="font-serif text-3xl sm:text-5xl text-white font-light tracking-wide mb-4">
          Bylumenia
        </h1>

        {/* Poetic Quote */}
        <p className="font-serif italic text-neutral-300/90 text-sm sm:text-base leading-relaxed mb-8">
          “Where every detail of your moment shines with timeless beauty & joy.”
        </p>

        {/* Primary Interactive Entrance Button */}
        <button
          onClick={handleStart}
          className="gold-gradient-btn w-full py-4 px-8 rounded-full text-xs sm:text-sm font-semibold tracking-widest uppercase flex items-center justify-center gap-3 shadow-[0_0_24px_rgba(212,175,55,0.5)] hover:scale-105 active:scale-95 transition-all group"
        >
          <Volume2 className="w-4 h-4 animate-pulse text-obsidian-950" />
          <span>Buka Lembaran Kisah</span>
        </button>
      </div>
    </div>
  );
}
