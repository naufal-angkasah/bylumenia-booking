"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard runtime error:", error);
  }, [error]);

  return (
    <main className="min-h-[100dvh] bg-obsidian-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6 text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <span className="text-xs uppercase tracking-widest text-rose-400 font-medium">
          Kendala Tampilan Dasbor
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-light text-white mt-1 mb-3">
          Perangkat Membutuhkan Penyegaran
        </h1>
        <p className="text-xs text-neutral-400 leading-relaxed mb-8">
          Sistem mendeteksi kendala pada memori peramban atau mode privasi tablet. Silakan segarkan halaman untuk melanjutkan.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="gold-gradient-btn w-full py-3.5 rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg touch-manipulation"
          >
            <RefreshCw className="w-4 h-4 text-obsidian-950" />
            <span>Muat Ulang Dasbor</span>
          </button>

          <Link
            href="/"
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 hover:text-white transition-colors flex items-center justify-center gap-2 touch-manipulation"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Utama</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
