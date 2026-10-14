"use client";

import React from "react";
import { HeartHandshake, ShieldCheck, Film, Compass } from "lucide-react";

export default function PhilosophySection() {
  const pillars = [
    {
      icon: Film,
      title: "Momen Apa Adanya",
      description:
        "Kami lebih memilih momen spontan daripada pose yang kaku: genggaman tangan, doa orang tua, dan ekspresi haru yang sebenarnya.",
    },
    {
      icon: HeartHandshake,
      title: "Satu Pasangan, Satu Hari",
      description:
        "Kami hanya menerima satu acara dalam sehari, sehingga seluruh tim dan perhatian kami tertuju pada acara kalian.",
    },
    {
      icon: ShieldCheck,
      title: "Tanggal Terjamin",
      description:
        "Tanggal yang sudah kalian pilih kami kunci setelah tanda jadi diterima, jadi tidak akan bentrok dengan jadwal lain.",
    },
    {
      icon: Compass,
      title: "Semarang & Luar Kota",
      description:
        "Berbasis di Semarang dan siap meliput di Solo, Yogyakarta, maupun kota lainnya.",
    },
  ];

  return (
    <section id="filosofi" className="relative py-28 px-5 bg-obsidian-950 scroll-mt-20 sm:scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mb-16">
          <span className="text-gold-400 text-xs tracking-widest uppercase font-medium">
            Tentang Kami
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-white font-light mt-3 mb-6 leading-tight">
            Kualitas di Atas Kuantitas.
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
            Pernikahan adalah salah satu hari terpenting dalam hidup. Kami tidak hanya mengambil foto,
            tetapi merekam setiap momen penting agar bisa kalian kenang dan wariskan kepada keluarga.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-7 rounded-2xl border border-white/10 hover:border-gold-400/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-gold-400/10 text-gold-400 flex items-center justify-center mb-6">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-xl text-white font-normal mb-3">
                    {item.title}
                  </h3>
                  <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
