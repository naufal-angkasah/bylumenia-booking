"use client";

import React, { useState, useEffect, useRef } from "react";
import { GALLERY_ITEMS, GalleryItem } from "@/lib/constants";
import { Maximize2, X, Eye, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from "lucide-react";

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

// 4 Authentic Bylumenia Portfolio Slides from v3 Technical Brief
interface PortfolioSlide {
  id: number;
  coupleTitle: string;
  category: string;
  storyQuote: string;
  theme: string;
  imageUrl: string;
}

const PORTFOLIO_SLIDES: PortfolioSlide[] = [
  {
    id: 1,
    coupleTitle: "Pernikahan Tradisi Klasik",
    category: "Pernikahan Tradisi Klasik",
    theme: "Kebaya Renda & Ronce Melati",
    storyQuote:
      "“Dari dua dunia yang berbeda, dua hati yang saling mencari, hingga berlabuh dalam dekap restu yang sama.”",
    imageUrl: "/images/Wedding/IMG_9064.PNG",
  },
  {
    id: 2,
    coupleTitle: "Tangis Haru & Doa Restu",
    category: "Ritual Sakral Adat",
    theme: "Sungkeman & Tetes Air Mata Bahagia",
    storyQuote:
      "“Tetes air mata haru di hadapan orang tua, mengawali langkah baru seumur hidup.”",
    imageUrl: "/images/Wedding/IMG_9060.PNG",
  },
  {
    id: 3,
    coupleTitle: "Dhiyaa & Nadiya",
    category: "Prewedding Sinematik",
    theme: "Padang Terbuka & Tawa Lepas Alami",
    storyQuote:
      "“Langkah santai berdua di bawah semesta, tawa lepas tanpa rekayasa.”",
    imageUrl: "/images/Prewedding/IMG_9033.PNG",
  },
  {
    id: 4,
    coupleTitle: "Purnalita & Nico",
    category: "Editorial Studio",
    theme: "Sorot Beludru Merah & Nuansa Hangat",
    storyQuote:
      "“Keanggunan sinematik dalam balutan pencahayaan temaram yang abadi.”",
    imageUrl: "/images/Prewedding/IMG_9052.PNG",
  },
];

export default function GallerySection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeImage, setActiveImage] = useState<GalleryItem | PortfolioSlide | null>(null);

  const SLIDE_DURATION = 4000; // 4 seconds per slide as specified in v3
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play carousel logic: 4s infinite loop
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    const stepTime = 50; // update progress bar every 50ms
    const totalSteps = SLIDE_DURATION / stepTime;
    let currentStep = 0;

    progressIntervalRef.current = setInterval(() => {
      currentStep += 1;
      setProgress(Math.min(100, (currentStep / totalSteps) * 100));
    }, stepTime);

    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % PORTFOLIO_SLIDES.length);
      setProgress(0);
      currentStep = 0;
    }, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [activeSlide, isPaused]);

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + PORTFOLIO_SLIDES.length) % PORTFOLIO_SLIDES.length);
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % PORTFOLIO_SLIDES.length);
  };

  const currentSlide = PORTFOLIO_SLIDES[activeSlide];

  return (
    <section id="galeri" className="relative py-28 px-4 sm:px-6 bg-obsidian-950 overflow-hidden">
      {/* Background Subtle Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gold-400/[0.03] blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold-400 text-xs tracking-widest uppercase font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Koleksi Cerita</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-white font-light mt-3 mb-4">
            Momen yang Terabadikan
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
            Setiap tawa, tatapan haru, dan sentuhan tulus kami rekam apa adanya.
            Inilah cerita mereka yang telah mempercayakan momen bahagianya bersama Bylumenia.
          </p>
        </div>

        {/* 1. AUTO-PLAY CAROUSEL (4 DETIK, SMOOTH CROSS-FADE 800MS) */}
        <div
          className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl mb-16 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Slide Stage */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden bg-obsidian-900">
            {PORTFOLIO_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-[800ms] ease-in-out ${
                  idx === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.coupleTitle}
                  className="w-full h-full object-cover scale-105 filter brightness-[0.78] contrast-105 transition-transform duration-1000"
                />

                {/* Cinematic Vignettes */}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950/80 via-transparent to-obsidian-950/30" />
              </div>
            ))}

            {/* Slide Content Overlay (Poetic Narrative & Author Tag) */}
            <div className="absolute inset-0 z-20 p-6 sm:p-10 lg:p-14 flex flex-col justify-end pointer-events-none">
              <div className="max-w-2xl transform translate-y-0 transition-all duration-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30 backdrop-blur-md">
                    {currentSlide.category}
                  </span>
                  <span className="text-[11px] text-neutral-400 tracking-wider hidden sm:inline">
                    {currentSlide.theme}
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-4xl text-white font-light tracking-wide mb-3">
                  {currentSlide.coupleTitle}
                </h3>

                <p className="font-serif italic text-base sm:text-xl text-neutral-200/95 leading-relaxed drop-shadow-md">
                  {currentSlide.storyQuote}
                </p>
              </div>
            </div>

            {/* Top-Right Lightbox Zoom Button */}
            <button
              onClick={() => setActiveImage(currentSlide)}
              className="absolute top-4 right-4 z-30 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-gold-300 transition-all border border-white/10 backdrop-blur-md shadow-lg"
              title="Perbesar Bingkai Penuh"
              aria-label="Lihat Layar Penuh"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-4 z-30 flex items-center">
              <button
                onClick={handlePrev}
                className="p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-gold-300 transition-all border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95"
                aria-label="Kisah Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-4 z-30 flex items-center">
              <button
                onClick={handleNext}
                className="p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-gold-300 transition-all border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95"
                aria-label="Kisah Berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* 4-Second Dynamic Progress Bar */}
            <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/10">
              <div
                className="h-full bg-gold-400 transition-all duration-75 ease-linear shadow-[0_0_8px_#D4AF37]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Carousel Footer Bar: Dots & Play/Pause */}
          <div className="p-4 sm:p-5 bg-obsidian-900/90 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
            {/* Slide Selector Indicators */}
            <div className="flex items-center gap-2">
              {PORTFOLIO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setActiveSlide(idx);
                    setProgress(0);
                  }}
                  className={`px-3 py-1 rounded-full text-xs transition-all duration-300 flex items-center gap-1.5 ${
                    idx === activeSlide
                      ? "bg-gold-400 text-obsidian-950 font-bold shadow-md scale-105"
                      : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <span>0{idx + 1}</span>
                  <span className="hidden sm:inline">{slide.coupleTitle.split("&")[0]}</span>
                </button>
              ))}
            </div>

            {/* Play/Pause & Autoplay Status */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-neutral-400 hidden md:inline">
                {isPaused ? "Dijeda saat kursor berada di atas" : "Berganti otomatis setiap 4 detik"}
              </span>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-gold-300 transition-colors"
                title={isPaused ? "Lanjutkan Putar Otomatis" : "Jeda Sementara"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 2. ARSIP BINGKAI LENGKAP (GRID GALLERY) */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div>
              <span className="text-xs uppercase tracking-widest text-gold-400 font-medium">
                Portofolio
              </span>
              <h3 className="font-serif text-2xl text-white font-light mt-1">
                Koleksi Karya
              </h3>
            </div>
            <a
              href="https://www.instagram.com/bylumenia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-300 hover:text-gold-300 transition-colors"
            >
              <InstagramIcon className="w-4 h-4 text-gold-400" />
              <span className="hidden sm:inline">Instagram @bylumenia</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GALLERY_ITEMS.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setActiveImage(item)}
                className={`group relative overflow-hidden rounded-2xl glass-panel border border-white/10 cursor-pointer transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-400/40 hover:shadow-glow ${
                  index === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-obsidian-850">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("photo-1519741497674")) {
                        target.src =
                          "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80";
                      }
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 filter brightness-90 group-hover:brightness-100"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-block text-[10px] tracking-widest uppercase text-gold-400 font-medium mb-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-gold-400/20">
                      {item.category}
                    </span>
                    <h4 className="font-serif text-xl sm:text-2xl text-white font-normal mb-1">
                      {item.title}
                    </h4>
                    <p className="text-neutral-300/80 text-xs line-clamp-2 font-light">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-2 border-t border-white/10 text-xs text-gold-300">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Pratinjau Bingkai
                    </span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instagram Attribution Pill */}
        <div className="mt-14 text-center">
          <a
            href="https://www.instagram.com/bylumenia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full glass-panel glass-panel-hover text-xs uppercase tracking-widest text-neutral-300 hover:text-gold-300 shadow-xl border border-white/10 hover:border-gold-400/40"
          >
            <InstagramIcon className="w-4 h-4 text-gold-400" />
            <span>Jelajahi Lebih Banyak Cerita di @bylumenia &bull; @hai_ivaan</span>
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full glass-panel rounded-2xl overflow-hidden border border-gold-400/30 shadow-2xl"
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:text-gold-300 transition-colors border border-white/15"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-black">
              <img
                src={activeImage.imageUrl}
                alt={"title" in activeImage ? activeImage.title : activeImage.coupleTitle}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>

            <div className="p-6 bg-obsidian-900 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gold-400 text-xs uppercase tracking-widest font-medium">
                  {activeImage.category}
                </span>
                <span className="text-neutral-400 text-xs">Arsip Resmi Bylumenia</span>
              </div>
              <h4 className="font-serif text-2xl text-white mb-1">
                {"title" in activeImage ? activeImage.title : activeImage.coupleTitle}
              </h4>
              <p className="text-neutral-300 text-sm font-light">
                {"subtitle" in activeImage ? activeImage.subtitle : activeImage.storyQuote}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
