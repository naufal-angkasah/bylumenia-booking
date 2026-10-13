"use client";

import React from "react";
import { PACKAGES, PackageItem } from "@/lib/constants";
import { Check, Sparkles, ArrowRight } from "lucide-react";

interface PackagesSectionProps {
  onSelectPackage: (pkg: PackageItem) => void;
}

export default function PackagesSection({ onSelectPackage }: PackagesSectionProps) {
  return (
    <section id="paket" className="relative py-28 px-5 bg-obsidian-900 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-gold-400 text-xs tracking-widest uppercase font-medium">
            Investasi Rasa & Kisah
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-white font-light mt-3 mb-4">
            Katalog Paket Cerita
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
            Dari tatap mata berdua hingga perayaan besar di hadapan keluarga.
            Setiap paket dirancang agar kalian dapat menapaki proses ini dengan tenang.
          </p>
        </div>

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-8 sm:p-9 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 ${
                pkg.recommended
                  ? "glass-panel-active border-gold-400/50 shadow-glow bg-gradient-to-b from-white/[0.07] to-transparent ring-1 ring-gold-400/30"
                  : "glass-panel border-white/10 hover:border-white/20"
              }`}
            >
              {pkg.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold-400 text-obsidian-950 text-[10px] font-bold tracking-widest uppercase shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Pilihan Paling Diminati</span>
                </div>
              )}

              <div>
                <span className="text-xs uppercase tracking-widest text-gold-400 font-medium">
                  {pkg.tier}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal mt-2 mb-2">
                  {pkg.name}
                </h3>
                <p className="text-neutral-300/80 text-xs sm:text-sm font-light mb-6 min-h-[40px]">
                  {pkg.tagline}
                </p>

                {/* Pricing */}
                <div className="pb-6 mb-6 border-b border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl sm:text-4xl text-white font-medium">
                      {pkg.priceFormatted}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 tracking-wider">
                    Rentang: {pkg.priceRange}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-3.5 mb-8">
                  <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                    Ruang Lingkup Termasuk:
                  </p>
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300 font-light">
                      <div className="mt-0.5 p-0.5 rounded-full bg-gold-400/20 text-gold-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectPackage(pkg)}
                className={`w-full py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  pkg.recommended
                    ? "gold-gradient-btn shadow-lg hover:scale-105 active:scale-95"
                    : "glass-panel glass-panel-hover text-white hover:text-gold-300 border-white/20 hover:border-gold-400/50"
                }`}
              >
                <span>Pilih & Mulai Reservasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
