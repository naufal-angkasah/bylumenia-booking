"use client";

import React from "react";
import { HeartHandshake, ShieldCheck, Film, Compass } from "lucide-react";

export default function PhilosophySection() {
  const pillars = [
    {
      icon: Film,
      title: "Gestur Mikro & Emosi Nyata",
      description:
        "Bukan sekadar senyum yang diarahkan, melainkan detak jemari yang menggenggam erat, heningnya doa orang tua, dan getaran haru yang tulus.",
    },
    {
      icon: HeartHandshake,
      title: "Satu Pasangan, Satu Hari",
      description:
        "Kami menolak sistem produksi massal. Dalam satu tanggal kalender, seluruh fokus, kurator, dan energi kami hanya dipersembahkan untuk satu ikatan.",
    },
    {
      icon: ShieldCheck,
      title: "Restu Waktu yang Terjaga",
      description:
        "Setiap tanggal yang kalian pilih kami kunci secara hening dan eksklusif khusus untuk cerita kalian, memastikan ketenangan penuh tanpa tumpang tindih waktu.",
    },
    {
      icon: Compass,
      title: "Semarang & Seluruh Semesta",
      description:
        "Berakar dari keelokan tradisi Jawa di Semarang dan siap melangkah menemani perjalanan kalian ke berbagai sudut destinasi luar kota.",
    },
  ];

  return (
    <section id="filosofi" className="relative py-28 px-5 bg-obsidian-950">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mb-16">
          <span className="text-gold-400 text-xs tracking-widest uppercase font-medium">
            Landasan & Jiwa Bylumenia
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-white font-light mt-3 mb-6 leading-tight">
            Menghargai Keabadian Rasa di Atas Sekadar Kuantitas.
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
            Pernikahan adalah simpul sakral dari dua pohon keluarga yang menyatu. Kami hadir bukan sekadar menekan tombol rana kamera,
            melainkan menjadi saksi yang merajut kembali setiap detik bahagia ke dalam lembaran kenangan yang dapat diwariskan selamanya.
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
