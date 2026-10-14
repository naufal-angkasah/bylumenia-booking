"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { smoothScrollTo } from "@/lib/scroll";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setVisible(scrollY > 280);

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(1, Math.max(0, scrollY / docHeight)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    smoothScrollTo(0, 0);
  };

  // SVG circular progress calculation (radius: 20, center: 24, 24)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-500 ease-out transform ${
        visible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-6 scale-90 pointer-events-none"
      }`}
    >
      <button
        onClick={handleClick}
        type="button"
        aria-label="Kembali ke atas"
        className="relative flex items-center justify-center w-12 h-12 rounded-full glass-panel border border-gold-400/35 text-gold-300 hover:text-white hover:border-gold-400 shadow-[0_8px_30px_rgba(0,0,0,0.7)] hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] active:scale-90 transition-all duration-300 bg-obsidian-950/90 backdrop-blur-xl group touch-manipulation"
      >
        {/* Subtle Ambient Glow Behind Button on Hover */}
        <div className="absolute inset-0 rounded-full bg-gold-400/0 group-hover:bg-gold-400/10 transition-colors duration-300 pointer-events-none" />

        {/* Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 48 48"
        >
          {/* Background track circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="2"
          />
          {/* Animated golden progress stroke */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="transparent"
            stroke="rgba(212, 175, 55, 0.9)"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-150 ease-out"
          />
        </svg>

        <ChevronUp className="w-5 h-5 text-gold-300 group-hover:text-white transition-all duration-300 group-hover:-translate-y-0.5 group-active:translate-y-0" />
      </button>
    </div>
  );
}
