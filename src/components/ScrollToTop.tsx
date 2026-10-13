"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className="fixed bottom-6 right-6 z-40 p-3 sm:p-3.5 rounded-full glass-panel border border-gold-400/40 text-gold-300 hover:text-white hover:border-gold-400 hover:shadow-glow active:scale-90 transition-all duration-300 bg-obsidian-900/80 backdrop-blur-md shadow-2xl animate-fade-in group"
    >
      <ChevronUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}
