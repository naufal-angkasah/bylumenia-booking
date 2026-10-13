"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  KeyRound,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  Search,
  Eye,
  RefreshCw,
} from "lucide-react";

interface BookingItem {
  id: string;
  bookingCode: string;
  coupleName: string;
  whatsapp: string;
  eventDate: string;
  eventLocation: string;
  aestheticMood: string;
  packageName: string;
  totalPrice: number;
  downPayment: number;
  proofFileUrl: string | null;
  status: "HOLD" | "PENDING_VERIFY" | "CONFIRMED" | "REJECTED" | "EXPIRED";
  holdExpiresAt: string;
  createdAt: string;
}

interface SystemLogItem {
  id: number;
  bookingId: string | null;
  actionType: string;
  executedBy: string;
  notes: string | null;
  loggedAt: string;
  booking?: {
    bookingCode: string;
    coupleName: string;
  } | null;
}

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [logs, setLogs] = useState<SystemLogItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    confirmedCount: 0,
    pendingCount: 0,
    activeHoldCount: 0,
    totalRevenueConfirmed: 0,
  });

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bookings" | "logs">("bookings");

  // Load PIN from localStorage if previously stored
  useEffect(() => {
    const savedPin = localStorage.getItem("bylumenia_admin_pin");
    if (savedPin) {
      setPin(savedPin);
      fetchDashboardData(savedPin);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(false);
    fetchDashboardData(pin);
  };

  const fetchDashboardData = async (authPin: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings?pin=${encodeURIComponent(authPin)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        localStorage.setItem("bylumenia_admin_pin", authPin);
        setBookings(data.bookings || []);
        setLogs(data.logs || []);
        setMetrics(
          data.metrics || {
            totalBookings: 0,
            confirmedCount: 0,
            pendingCount: 0,
            activeHoldCount: 0,
            totalRevenueConfirmed: 0,
          }
        );
      } else {
        setPinError(true);
        setIsAuthenticated(false);
      }
    } catch {
      setPinError(true);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "CONFIRM" | "REJECT" | "RELEASE") => {
    if (!confirm(`Konfirmasi tindakan ${action} untuk reservasi ini?`)) return;

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, action }),
      });

      if (res.ok) {
        fetchDashboardData(pin);
      }
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bylumenia_admin_pin");
    setIsAuthenticated(false);
    setPin("");
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesFilter =
      filterStatus === "ALL" || b.status === filterStatus;
    const matchesSearch =
      b.coupleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.whatsapp.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  // Login Gate Screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center mx-auto mb-6 text-gold-400">
            <KeyRound className="w-7 h-7" />
          </div>

          <span className="text-xs uppercase tracking-widest text-gold-400 font-medium">
            Ruang Kurasi Internal
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1 mb-2">
            Dasbor Kurator Bylumenia
          </h1>
          <p className="text-xs text-neutral-400 font-light mb-8">
            Sematkan kunci akses (PIN) kurator untuk mengelola jadwal dan tanda jadi.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Masukkan PIN (Default: 1928)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-gold-400 focus:outline-none text-center font-mono tracking-widest text-white text-lg placeholder-neutral-600 transition-colors"
            />

            {pinError && (
              <p className="text-xs text-rose-400 animate-fade-in">
                Kunci akses kurator tidak sesuai. Mari periksa kembali.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="gold-gradient-btn w-full py-3.5 rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Buka Ruang Kurator</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <Link
              href="/"
              className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Publik</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian-950 text-neutral-200">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-obsidian-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-serif text-2xl text-white tracking-widest uppercase hover:text-gold-300 transition-colors"
            >
              Bylumenia
            </Link>
            <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30">
              Ruang Kurator
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchDashboardData(pin)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-gold-400" : ""}`} />
            </button>
            <Link
              href="/"
              className="text-xs text-neutral-400 hover:text-gold-300 flex items-center gap-1 transition-colors hidden sm:flex"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Web</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-950/40 border border-white/10 text-xs text-neutral-300 hover:text-rose-300 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Total Reservasi
            </span>
            <p className="font-serif text-3xl text-white font-normal mt-2">
              {metrics.totalBookings}
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-gold-400/30 bg-gold-400/[0.03]">
            <span className="text-xs uppercase tracking-wider text-gold-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Menunggu Verifikasi
            </span>
            <p className="font-serif text-3xl text-gold-300 font-normal mt-2">
              {metrics.pendingCount}
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/[0.1]">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Jadwal Terkunci Sah
            </span>
            <p className="font-serif text-3xl text-emerald-300 font-normal mt-2">
              {metrics.confirmedCount}
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              DP Terkonfirmasi
            </span>
            <p className="font-serif text-2xl sm:text-3xl text-white font-normal mt-2 truncate">
              Rp {metrics.totalRevenueConfirmed.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Tab Selection & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/10 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-medium transition-colors ${
                activeTab === "bookings"
                  ? "bg-gold-400 text-obsidian-950 font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Daftar Reservasi ({filteredBookings.length})
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-medium transition-colors ${
                activeTab === "logs"
                  ? "bg-gold-400 text-obsidian-950 font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Jejak Waktu & Log ({logs.length})
            </button>
          </div>

          {activeTab === "bookings" && (
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Filter Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-neutral-300 focus:outline-none focus:border-gold-400"
              >
                <option value="ALL">Semua Status</option>
                <option value="PENDING_VERIFY">Menunggu Verifikasi</option>
                <option value="CONFIRMED">Terkunci (Confirmed)</option>
                <option value="HOLD">Sedang Ditahan (Hold)</option>
                <option value="EXPIRED">Kedaluwarsa (Expired)</option>
              </select>

              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, kode, atau WA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Bookings Table */}
        {activeTab === "bookings" && (
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-4">Kode &amp; Tanggal</th>
                    <th className="px-5 py-4">Nama Pasangan &amp; WA</th>
                    <th className="px-5 py-4">Paket &amp; Mood</th>
                    <th className="px-5 py-4">Tanda Jadi (DP)</th>
                    <th className="px-5 py-4">Bukti Slip</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Aksi Kurator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 font-light">
                        Belum ada catatan reservasi pada filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const cleanPhone = b.whatsapp.replace(/[^0-9]/g, "");
                      const waLink = `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
                        `Halo Kak ${b.coupleName}, salam hangat dari tim kurator Bylumenia.\n\n` +
                        `Mengenai reservasi hari bahagia Kakak pada tanggal ${b.eventDate} (${b.packageName}), ` +
                        `kami ingin menyapa dan mengobrol santai mengenai konsep visual nanti.`
                      )}`;

                      return (
                        <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Kode & Tanggal */}
                          <td className="px-5 py-4">
                            <span className="font-mono text-gold-300 font-medium block">
                              {b.bookingCode}
                            </span>
                            <span className="text-neutral-400 text-[11px] flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-gold-400" />
                              {b.eventDate}
                            </span>
                          </td>

                          {/* Pasangan & WA */}
                          <td className="px-5 py-4">
                            <span className="font-medium text-white block text-sm">
                              {b.coupleName}
                            </span>
                            <span className="text-neutral-400 text-[11px] block mt-0.5">
                              {b.eventLocation}
                            </span>
                          </td>

                          {/* Paket & Mood */}
                          <td className="px-5 py-4">
                            <span className="text-white block font-medium">
                              {b.packageName}
                            </span>
                            <span className="text-gold-400/80 text-[10px] block mt-0.5">
                              {b.aestheticMood}
                            </span>
                          </td>

                          {/* DP */}
                          <td className="px-5 py-4">
                            <span className="font-serif text-sm text-gold-300 font-medium block">
                              Rp {b.downPayment.toLocaleString("id-ID")}
                            </span>
                            <span className="text-neutral-500 text-[10px]">
                              Total Rp {b.totalPrice.toLocaleString("id-ID")}
                            </span>
                          </td>

                          {/* Slip Upload */}
                          <td className="px-5 py-4">
                            {b.proofFileUrl ? (
                              <button
                                onClick={() => setSelectedProofUrl(b.proofFileUrl)}
                                className="px-2.5 py-1 rounded-lg bg-gold-400/10 hover:bg-gold-400/25 border border-gold-400/30 text-gold-300 text-[11px] flex items-center gap-1 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Lihat Slip</span>
                              </button>
                            ) : (
                              <span className="text-neutral-600 text-[11px] italic">
                                Belum terunggah
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                                b.status === "CONFIRMED"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : b.status === "PENDING_VERIFY"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                                  : b.status === "HOLD"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : "bg-neutral-800 text-neutral-400"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>

                          {/* Aksi */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Direct WhatsApp link */}
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 transition-colors"
                                title="Sapa Klien di WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>

                              {/* Confirm Button */}
                              {b.status !== "CONFIRMED" && (
                                <button
                                  onClick={() => handleAction(b.id, "CONFIRM")}
                                  className="p-1.5 rounded-lg bg-gold-400/20 hover:bg-gold-400/40 text-gold-300 border border-gold-400/30 transition-colors"
                                  title="Konfirmasi Tanda Jadi"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Reject Button */}
                              {b.status !== "REJECTED" && (
                                <button
                                  onClick={() => handleAction(b.id, "REJECT")}
                                  className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-500/30 transition-colors"
                                  title="Tolak / Batalkan"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: System Logs */}
        {activeTab === "logs" && (
          <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h3 className="font-serif text-xl text-white mb-4">
              Jejak Audit &amp; Waktu Sistem (Anti-Tabrakan)
            </h3>
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-neutral-500 text-xs italic">Belum ada jejak audit tersimpan.</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-gold-400 font-semibold">
                          [{log.actionType}]
                        </span>
                        <span className="text-neutral-400 text-[11px]">
                          Oleh: {log.executedBy}
                        </span>
                        {log.booking && (
                          <span className="text-white text-[11px]">
                            &bull; {log.booking.bookingCode} ({log.booking.coupleName})
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-300 font-light">{log.notes}</p>
                    </div>
                    <span className="text-[10px] text-neutral-500 shrink-0 font-mono">
                      {new Date(log.loggedAt).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Slip Zoom Modal */}
      {selectedProofUrl && (
        <div
          onClick={() => setSelectedProofUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl w-full glass-panel rounded-2xl overflow-hidden border border-gold-400/40 p-4 bg-obsidian-900"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="text-xs uppercase tracking-wider text-gold-400 font-medium">
                Pratinjau Bukti Transfer
              </span>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-lg bg-black flex items-center justify-center">
              <img
                src={selectedProofUrl}
                alt="Bukti Transfer"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="pt-3 text-right">
              <a
                href={selectedProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-lg bg-white/10 hover:bg-gold-400/20 text-xs text-white hover:text-gold-300 transition-colors"
              >
                Buka di Tab Baru
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
