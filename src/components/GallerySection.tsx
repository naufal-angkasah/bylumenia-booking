"use client";

import React, { useState } from "react";
import { GALLERY_ITEMS, GalleryItem } from "@/lib/constants";
import { Maximize2, X, Eye } from "lucide-react";

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

export default function GallerySection() {
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  return (
    <section id="galeri" className="relative py-24 px-5 bg-obsidian-950">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold-400 text-xs tracking-widest uppercase font-medium">
            Arsip Portofolio Terkurasi
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-white font-light mt-3 mb-4">
            Galeri &ldquo;Kisah Kamu&rdquo;
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
            Siluet gaun putih, cincin di batuan alam, kebaya beludru adat marun, hingga tawa kasual di padang terbuka.
            Setiap bingkai dikurasi untuk mengunci standar estetika abadi.
          </p>
        </div>

        {/* Dynamic Gallery Grid */}
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
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 filter brightness-90 group-hover:brightness-100"
                />
              </div>

              {/* Gradient Overlay & Details */}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="inline-block text-[10px] tracking-widest uppercase text-gold-400 font-medium mb-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-gold-400/20">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-white font-normal mb-1">
                    {item.title}
                  </h3>
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

        {/* Instagram Attribution */}
        <div className="mt-12 text-center">
          <a
            href="https://www.instagram.com/bylumenia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass-panel glass-panel-hover text-xs uppercase tracking-widest text-neutral-300 hover:text-gold-300"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-gold-400" />
            <span>Jelajahi Lebih Banyak Cerita di @bylumenia &bull; @hai_ivaan</span>
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full glass-panel rounded-2xl overflow-hidden border border-gold-400/30"
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:text-gold-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-black">
              <img
                src={activeImage.imageUrl}
                alt={activeImage.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>

            <div className="p-6 bg-obsidian-900 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gold-400 text-xs uppercase tracking-widest">
                  {activeImage.category}
                </span>
                <span className="text-neutral-400 text-xs">Arsip Bylumenia</span>
              </div>
              <h3 className="font-serif text-2xl text-white mb-1">
                {activeImage.title}
              </h3>
              <p className="text-neutral-300 text-sm font-light">
                {activeImage.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
