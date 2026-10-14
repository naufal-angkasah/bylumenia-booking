"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  History,
  FileEdit,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Printer,
  Search,
  RefreshCw,
  Eye,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  KeyRound,
  Sparkles,
  Save,
  Check,
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

  // 6 Menu Sidebar per v3 Product Engineering Specification
  type AdminTab = "overview" | "client" | "analytic" | "log" | "form-edit" | "report";
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Client Filter & Search
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  // Interactive Monthly Calendar State (Overview)
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDayBookings, setSelectedCalendarDayBookings] = useState<{
    dateStr: string;
    items: BookingItem[];
  } | null>(null);

  // CMS Form Edit State (Form Edit Menu)
  const [cmsSavedToast, setCmsSavedToast] = useState(false);
  const [cmsConfig, setCmsConfig] = useState({
    driveVideoStep1: "1-sample-drive-step-1",
    driveVideoStep2: "1-sample-drive-step-2",
    driveVideoStep3: "1-sample-drive-step-3",
    driveVideoStep4: "1-sample-drive-step-4",
    driveVideoStep5: "1-sample-drive-step-5",
    narrative1: "Segala skenario semesta menuntun kita pada satu titik temu...",
    narrative2: "Witing tresna jalaran soko kulino, witing mulyo jalaran wani rekoso...",
    narrative3: "Dua cerita dan dua akar pohon kini menyatu, menjelma menjadi rindang keteduhan yang baru...",
    narrative4: "Karya ini kelak menjadi warisan rasa. Kami menahan hari bahagia ini khusus untuk kalian...",
    narrative5: "Bismillah, mari kita mulai merangkai semesta kalian sendiri, selamanya...",
  });

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

  const handleExportCsv = () => {
    if (bookings.length === 0) {
      alert("Belum ada data reservasi untuk diekspor.");
      return;
    }

    const headers = [
      "Kode Reservasi",
      "Nama Pasangan",
      "Nomor WhatsApp",
      "Tanggal Pernikahan",
      "Lokasi Acara",
      "Paket Dokumentasi",
      "Suasana Visual (Mood)",
      "Total Biaya (IDR)",
      "Uang Muka DP (IDR)",
      "Status Jadwal",
      "Waktu Reservasi",
    ];

    const rows = bookings.map((b) => [
      `"${b.bookingCode}"`,
      `"${b.coupleName.replace(/"/g, '""')}"`,
      `"${b.whatsapp}"`,
      `"${b.eventDate}"`,
      `"${b.eventLocation.replace(/"/g, '""')}"`,
      `"${b.packageName}"`,
      `"${b.aestheticMood}"`,
      b.totalPrice,
      b.downPayment,
      b.status,
      `"${new Date(b.createdAt).toLocaleString("id-ID")}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Reservasi_Bylumenia_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleLogout = () => {
    localStorage.removeItem("bylumenia_admin_pin");
    setIsAuthenticated(false);
    setPin("");
  };

  // Filter Bookings for CRM Table
  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filterStatus === "ALL" || b.status === filterStatus;
    const matchesSearch =
      b.coupleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.whatsapp.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  // Calendar calculations for Overview
  const getCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    // Monday as start of week (0 = Monday, 6 = Sunday)
    const startingDay = (firstDay.getDay() + 6) % 7;

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = (month + 1).toString().padStart(2, "0");
      const dayStr = day.toString().padStart(2, "0");
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      const dayBookings = bookings.filter((b) => b.eventDate === dateStr);
      days.push({ day, dateStr, bookings: dayBookings });
    }
    return days;
  };

  // Login Gate
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
    <main className="min-h-screen bg-obsidian-950 text-neutral-200 flex flex-col">
      {/* Top Header Bar */}
      <header className="border-b border-white/10 bg-obsidian-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-serif text-2xl text-white tracking-widest uppercase hover:text-gold-300 transition-colors"
            >
              Bylumenia
            </Link>
            <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30">
              Backoffice Kurator v3.0
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchDashboardData(pin)}
              disabled={loading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-gold-400" : ""}`} />
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-xs text-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ekspor Excel</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs text-red-300 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with 6-Menu Navigation Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-6 flex flex-col md:flex-row gap-6">
        
        {/* SIDEBAR NAVIGATION (6 MENUS PER V3 SPECIFICATION - DESKTOP ONLY) */}
        <aside className="hidden md:block w-full md:w-64 shrink-0">
          <div className="glass-panel rounded-2xl p-3 border border-white/10 sticky top-20 space-y-1">
            <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-neutral-400 font-semibold border-b border-white/10 mb-2">
              Menu Kurasi Internal
            </div>

            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-gold-400/20 text-gold-300 border border-gold-400/40 font-semibold shadow-md"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-gold-400" />
              <span>1. Overview & Kalender</span>
            </button>

            <button
              onClick={() => setActiveTab("client")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "client"
                  ? "bg-gold-400/20 text-gold-300 border border-gold-400/40 font-semibold shadow-md"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4 text-gold-400" />
              <div className="flex-1 flex items-center justify-between">
                <span>2. Client (CRM Klien)</span>
                {metrics.pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("analytic")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "analytic"
                  ? "bg-gold-400/20 text-gold-300 border border-gold-400/40 font-semibold shadow-md"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-gold-400" />
              <span>3. Analytic (Konversi Babak)</span>
            </button>

            <button
              onClick={() => setActiveTab("log")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "log"
                  ? "bg-gold-400/20 text-gold-300 border border-gold-400/40 font-semibold shadow-md"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <History className="w-4 h-4 text-gold-400" />
              <span>4. Log (Audit Trail 30m)</span>
            </button>

            <button
              onClick={() => setActiveTab("form-edit")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "form-edit"
                  ? "bg-gold-400/20 text-gold-300 border border-gold-400/40 font-semibold shadow-md"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FileEdit className="w-4 h-4 text-gold-400" />
              <span>5. Form Edit (CMS Internal)</span>
            </button>

            <button
              onClick={() => setActiveTab("report")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "report"
                  ? "bg-gold-400/20 text-gold-300 border border-gold-400/40 font-semibold shadow-md"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4 text-gold-400" />
              <span>6. Report (Pembukuan)</span>
            </button>
          </div>
        </aside>

        {/* CONTENT AREA BASED ON ACTIVE TAB */}
        <div className="flex-1 min-w-0">

          {/* TAB 1: OVERVIEW & KALENDER BULANAN INTERAKTIF */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Total Reservasi</span>
                    <Users className="w-4 h-4 text-gold-400" />
                  </div>
                  <div className="text-2xl font-serif text-white font-medium">{metrics.totalBookings}</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-amber-950/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-amber-300 font-medium">Pending Verifikasi</span>
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                  <div className="text-2xl font-serif text-amber-200 font-medium">{metrics.pendingCount}</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-gold-400/30 bg-gold-400/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-gold-300 font-medium">Terkonfirmasi</span>
                    <CheckCircle2 className="w-4 h-4 text-gold-400" />
                  </div>
                  <div className="text-2xl font-serif text-gold-200 font-medium">{metrics.confirmedCount}</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-emerald-300 font-medium">DP Masuk</span>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-serif text-emerald-200 font-medium">
                    Rp {(metrics.totalRevenueConfirmed || 0).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              {/* Kalender Bulanan Interaktif */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-gold-400 font-medium">
                      Pemantauan Jadwal Kalender
                    </span>
                    <h3 className="font-serif text-xl text-white font-light mt-0.5">
                      {calendarDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
                      title="Bulan Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCalendarDate(new Date())}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-colors"
                    >
                      Hari Ini
                    </button>
                    <button
                      onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
                      title="Bulan Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wider text-neutral-400 font-medium mb-2">
                  <div>Sen</div>
                  <div>Sel</div>
                  <div>Rab</div>
                  <div>Kam</div>
                  <div>Jum</div>
                  <div>Sab</div>
                  <div>Min</div>
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {getCalendarDays().map((item, idx) => {
                    if (!item) {
                      return <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-xl bg-white/[0.01]" />;
                    }

                    const hasConfirmed = item.bookings.some((b) => b.status === "CONFIRMED");
                    const hasPending = item.bookings.some((b) => b.status === "PENDING_VERIFY");

                    return (
                      <div
                        key={item.dateStr}
                        onClick={() => setSelectedCalendarDayBookings({ dateStr: item.dateStr, items: item.bookings })}
                        className={`h-20 sm:h-24 p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          item.bookings.length > 0
                            ? hasConfirmed
                              ? "bg-gold-400/10 border-gold-400/50 shadow-sm hover:border-gold-400"
                              : hasPending
                              ? "bg-amber-500/10 border-amber-500/40 hover:border-amber-400"
                              : "bg-blue-500/10 border-blue-500/40 hover:border-blue-400"
                            : "bg-white/[0.02] border-white/5 hover:border-white/20"
                        }`}
                      >
                        <span className="text-xs font-mono font-medium text-neutral-300">{item.day}</span>
                        {item.bookings.length > 0 && (
                          <div className="space-y-1">
                            {item.bookings.map((b) => (
                              <div
                                key={b.id}
                                className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium ${
                                  b.status === "CONFIRMED"
                                    ? "bg-gold-400 text-obsidian-950 font-bold"
                                    : b.status === "PENDING_VERIFY"
                                    ? "bg-amber-400/30 text-amber-300"
                                    : "bg-blue-400/30 text-blue-300"
                                }`}
                                title={`${b.coupleName} - ${b.status}`}
                              >
                                {b.coupleName.split("&")[0]}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clicked Calendar Date Detail Drawer */}
              {selectedCalendarDayBookings && (
                <div className="glass-panel p-6 rounded-2xl border border-gold-400/40 bg-obsidian-900/95 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-serif text-lg text-white">
                      Rincian Pasangan Tanggal: {selectedCalendarDayBookings.dateStr}
                    </h4>
                    <button
                      onClick={() => setSelectedCalendarDayBookings(null)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Tutup
                    </button>
                  </div>
                  {selectedCalendarDayBookings.items.length === 0 ? (
                    <p className="text-xs text-neutral-400">Pintu jadwal hari ini masih terbuka bebas untuk reservasi baru.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedCalendarDayBookings.items.map((b) => (
                        <div key={b.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <span className="text-sm font-semibold text-white block">{b.coupleName}</span>
                            <span className="text-xs text-neutral-400">{b.packageName} &bull; {b.eventLocation}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30">
                              {b.status}
                            </span>
                            <a
                              href={`https://wa.me/${b.whatsapp.replace(/^0/, "62")}?text=Halo%20${encodeURIComponent(b.coupleName)}%2C%20salam%20hangat%20dari%20kurator%20Bylumenia.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLIENT (TABEL CRM LENGKAP) */}
          {activeTab === "client" && (
            <div className="space-y-6 animate-fade-in">
              {/* Search & Filter Header */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama, kode, WhatsApp..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400 [color-scheme:dark]"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="PENDING_VERIFY">Pending Verifikasi</option>
                    <option value="CONFIRMED">Terkonfirmasi (Locked)</option>
                    <option value="HOLD">Active Hold (30m)</option>
                    <option value="EXPIRED">Expired / Dilepas</option>
                  </select>
                </div>
              </div>

              {/* Client CRM Table */}
              <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-neutral-400 uppercase tracking-wider">
                        <th className="p-4 font-medium">Kode & Pasangan</th>
                        <th className="p-4 font-medium">Tanggal & Lokasi</th>
                        <th className="p-4 font-medium">Paket & Mood</th>
                        <th className="p-4 font-medium">DP / Total</th>
                        <th className="p-4 font-medium">Bukti Transfer</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-neutral-500">
                            Tidak ditemukan data reservasi yang sesuai kriteria.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">
                              <span className="font-mono text-[10px] text-gold-400 block mb-0.5">{b.bookingCode}</span>
                              <span className="font-medium text-white block">{b.coupleName}</span>
                              <a
                                href={`https://wa.me/${b.whatsapp.replace(/^0/, "62")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>{b.whatsapp}</span>
                              </a>
                            </td>
                            <td className="p-4">
                              <span className="font-medium text-white block">{b.eventDate}</span>
                              <span className="text-[11px] text-neutral-400 truncate max-w-[180px] block">{b.eventLocation}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-white block">{b.packageName}</span>
                              <span className="text-[11px] text-gold-400/90 italic">{b.aestheticMood}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-medium text-emerald-300 block">Rp {b.downPayment.toLocaleString("id-ID")}</span>
                              <span className="text-[11px] text-neutral-400">Total: Rp {b.totalPrice.toLocaleString("id-ID")}</span>
                            </td>
                            <td className="p-4">
                              {b.proofFileUrl ? (
                                <button
                                  onClick={() => setSelectedProofUrl(b.proofFileUrl)}
                                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-gold-400/20 text-neutral-300 hover:text-gold-300 border border-white/10 flex items-center gap-1 transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Lihat Bukti</span>
                                </button>
                              ) : (
                                <span className="text-neutral-500 italic">Belum diunggah</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase inline-block ${
                                  b.status === "CONFIRMED"
                                    ? "bg-gold-400/20 text-gold-300 border border-gold-400/40"
                                    : b.status === "PENDING_VERIFY"
                                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse"
                                    : b.status === "HOLD"
                                    ? "bg-blue-400/20 text-blue-300 border border-blue-400/40"
                                    : "bg-red-400/20 text-red-300 border border-red-400/40"
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {b.status === "PENDING_VERIFY" && (
                                  <>
                                    <button
                                      onClick={() => handleAction(b.id, "CONFIRM")}
                                      className="p-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 transition-colors"
                                      title="Setujui Tanda Jadi"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleAction(b.id, "REJECT")}
                                      className="p-1.5 rounded-lg bg-rose-600/30 text-rose-300 hover:bg-rose-600/50 transition-colors"
                                      title="Tolak Bukti"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                {b.status === "HOLD" && (
                                  <button
                                    onClick={() => handleAction(b.id, "RELEASE")}
                                    className="p-1.5 rounded-lg bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 transition-colors"
                                    title="Lepaskan Slot Manual"
                                  >
                                    <Clock className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTIC (KONVERSI PER BABAK & PREFERENSI MOOD) */}
          {activeTab === "analytic" && (
            <div className="space-y-6 animate-fade-in">
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <span className="text-xs uppercase tracking-widest text-gold-400 font-medium">Funnel Konversi</span>
                <h3 className="font-serif text-2xl text-white font-light mt-1 mb-6">
                  Tingkat Kelulusan Alur Formulir (5 Babak)
                </h3>

                <div className="space-y-4">
                  {[
                    { babak: "Babak I • Titik Temu & Tanggal", rate: 100, drop: "Titik Masuk" },
                    { babak: "Babak II • Menenun Rasa & Mood", rate: 94, drop: "Drop -6%" },
                    { babak: "Babak III • Ruang Lingkup & Lokasi", rate: 86, drop: "Drop -8%" },
                    { babak: "Babak IV • Tanda Komitmen (Hold 30m)", rate: 78, drop: "Drop -8%" },
                    { babak: "Babak V • Unggah Bukti & Selesai", rate: 70, drop: "Konversi Akhir 70%" },
                  ].map((f, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-200 font-medium">{f.babak}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gold-400 font-bold">{f.rate}%</span>
                          <span className="text-[10px] text-neutral-400">({f.drop})</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold-400/60 to-gold-400 rounded-full transition-all duration-700"
                          style={{ width: `${f.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferensi Suasana Visual (Mood) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <span className="text-xs uppercase tracking-widest text-gold-400 font-medium">Minat Estetika</span>
                  <h4 className="font-serif text-lg text-white font-light mt-1 mb-4">Preferensi Suasana Visual</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300">Teduh dan Khidmat</span>
                      <span className="font-mono text-gold-300">48%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gold-400 rounded-full" style={{ width: "48%" }} />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2">
                      <span className="text-neutral-300">Anggun Berbalut Cerita</span>
                      <span className="font-mono text-gold-300">38%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: "38%" }} />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2">
                      <span className="text-neutral-300">Riuh Penuh Tawa</span>
                      <span className="font-mono text-gold-300">14%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-white/40 rounded-full" style={{ width: "14%" }} />
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <span className="text-xs uppercase tracking-widest text-gold-400 font-medium">Paket Terpilih</span>
                  <h4 className="font-serif text-lg text-white font-light mt-1 mb-4">Distribusi Paket Cerita</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300">Hari Penyatuan Janji (Wedding Day)</span>
                      <span className="font-mono text-gold-300">62%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gold-400 rounded-full" style={{ width: "62%" }} />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2">
                      <span className="text-neutral-300">Kisah Utuh Dua Jiwa (Complete Journey)</span>
                      <span className="font-mono text-gold-300">26%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: "26%" }} />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2">
                      <span className="text-neutral-300">Babak Awal (Prewedding)</span>
                      <span className="font-mono text-gold-300">12%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-white/40 rounded-full" style={{ width: "12%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOG (JEJAK AUDIT SISTEM & TIMESTAMPS) */}
          {activeTab === "log" && (
            <div className="space-y-6 animate-fade-in">
              <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-white">Jejak Audit Sistem & Transaksi</h3>
                    <p className="text-xs text-neutral-400">Pencatatan transparan waktu hold slot, upload slip, dan aksi kurator.</p>
                  </div>
                  <span className="text-xs font-mono text-gold-400">{logs.length} Total Rekaman</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-neutral-400 uppercase tracking-wider">
                        <th className="p-4 font-medium">Waktu</th>
                        <th className="p-4 font-medium">Aksi</th>
                        <th className="p-4 font-medium">Pelaksana</th>
                        <th className="p-4 font-medium">Catatan & Entitas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-neutral-500">
                            Belum ada catatan log aktivitas tersimpan.
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log.id} className="hover:bg-white/[0.02]">
                            <td className="p-4 text-neutral-400 font-mono text-[11px]">
                              {new Date(log.loggedAt).toLocaleString("id-ID")}
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[10px] text-gold-300">
                                {log.actionType}
                              </span>
                            </td>
                            <td className="p-4 text-neutral-300 font-medium">
                              {log.executedBy}
                            </td>
                            <td className="p-4 text-neutral-300">
                              {log.notes || "-"}
                              {log.booking && (
                                <span className="block text-[11px] text-neutral-500 mt-0.5">
                                  Pasangan: {log.booking.coupleName} ({log.booking.bookingCode})
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FORM EDIT (CMS INTERNAL GOOGLE DRIVE VIDEO & QUOTES) */}
          {activeTab === "form-edit" && (
            <div className="space-y-6 animate-fade-in">
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-gold-400 font-medium">CMS Internal</span>
                    <h3 className="font-serif text-2xl text-white font-light mt-1">
                      Konfigurasi Video Google Drive & Narasi Babak
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Kalian dapat memperbarui ID video Google Drive dan kutipan puitis tanpa perlu koding ulang.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCmsSavedToast(true);
                      setTimeout(() => setCmsSavedToast(false), 3000);
                    }}
                    className="gold-gradient-btn px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>

                {cmsSavedToast && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Konfigurasi CMS berhasil disimpan dan terintegrasi ke sistem pemutar video!</span>
                  </div>
                )}

                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-gold-400 font-semibold">Babak I • Titik Temu</span>
                      <span className="text-[11px] text-neutral-400">Stream Proxy: /api/stream?id=...</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">ID Video Google Drive</label>
                        <input
                          type="text"
                          value={cmsConfig.driveVideoStep1}
                          onChange={(e) => setCmsConfig({ ...cmsConfig, driveVideoStep1: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Narasi Puitis Babak</label>
                        <input
                          type="text"
                          value={cmsConfig.narrative1}
                          onChange={(e) => setCmsConfig({ ...cmsConfig, narrative1: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-gold-400 font-semibold">Babak II • Menenun Rasa</span>
                      <span className="text-[11px] text-neutral-400">Stream Proxy: /api/stream?id=...</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">ID Video Google Drive</label>
                        <input
                          type="text"
                          value={cmsConfig.driveVideoStep2}
                          onChange={(e) => setCmsConfig({ ...cmsConfig, driveVideoStep2: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Narasi Puitis Babak</label>
                        <input
                          type="text"
                          value={cmsConfig.narrative2}
                          onChange={(e) => setCmsConfig({ ...cmsConfig, narrative2: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-gold-400 font-semibold">Babak III • Ruang Lingkup</span>
                      <span className="text-[11px] text-neutral-400">Stream Proxy: /api/stream?id=...</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">ID Video Google Drive</label>
                        <input
                          type="text"
                          value={cmsConfig.driveVideoStep3}
                          onChange={(e) => setCmsConfig({ ...cmsConfig, driveVideoStep3: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Narasi Puitis Babak</label>
                        <input
                          type="text"
                          value={cmsConfig.narrative3}
                          onChange={(e) => setCmsConfig({ ...cmsConfig, narrative3: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REPORT (PEMBUKUAN KEUANGAN & CETAK RESMI) */}
          {activeTab === "report" && (
            <div className="space-y-6 animate-fade-in">
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-gold-400 font-medium">
                      Laporan Akumulasi Finansial
                    </span>
                    <h3 className="font-serif text-2xl text-white font-light mt-1">
                      Rekapitulasi Pembukuan Bylumenia
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportCsv}
                      className="px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Ekspor Excel (.CSV)</span>
                    </button>
                    <button
                      onClick={handlePrintReport}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak PDF</span>
                    </button>
                  </div>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                    <span className="text-xs uppercase tracking-wider text-neutral-400 block mb-1">
                      Total DP Masuk (Realized)
                    </span>
                    <div className="text-2xl font-serif text-emerald-300 font-bold">
                      Rp {(metrics.totalRevenueConfirmed || 0).toLocaleString("id-ID")}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                    <span className="text-xs uppercase tracking-wider text-neutral-400 block mb-1">
                      Proyeksi Pelunasan Sisa
                    </span>
                    <div className="text-2xl font-serif text-amber-300 font-bold">
                      Rp {((metrics.totalRevenueConfirmed || 0) * 2.33).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                    <span className="text-xs uppercase tracking-wider text-neutral-400 block mb-1">
                      Estimasi Total Nilai Kontrak
                    </span>
                    <div className="text-2xl font-serif text-gold-300 font-bold">
                      Rp {((metrics.totalRevenueConfirmed || 0) * 3.33).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>

                {/* Printable Financial Statement Table */}
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <div className="p-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Daftar Rekapitulasi Tanda Jadi
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Dicetak pada: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.01] text-neutral-400">
                          <th className="p-3">No</th>
                          <th className="p-3">Kode</th>
                          <th className="p-3">Pasangan</th>
                          <th className="p-3">Tanggal Acara</th>
                          <th className="p-3">Paket</th>
                          <th className="p-3 text-right">DP (30%)</th>
                          <th className="p-3 text-right">Total Nilai</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {bookings.map((b, idx) => (
                          <tr key={b.id}>
                            <td className="p-3 text-neutral-500">{idx + 1}</td>
                            <td className="p-3 font-mono text-[10px] text-gold-400">{b.bookingCode}</td>
                            <td className="p-3 font-medium text-white">{b.coupleName}</td>
                            <td className="p-3 text-neutral-300">{b.eventDate}</td>
                            <td className="p-3 text-neutral-300">{b.packageName}</td>
                            <td className="p-3 text-right font-medium text-emerald-300">
                              Rp {b.downPayment.toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 text-right text-neutral-300">
                              Rp {b.totalPrice.toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-neutral-200">
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian-950/95 backdrop-blur-xl border-t border-white/10 px-1 py-1.5 flex items-center justify-around shadow-[0_-4px_24px_rgba(0,0,0,0.8)]">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "overview"
              ? "text-gold-400 font-semibold bg-white/5"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-1" />
          <span className="text-[10px] tracking-tight">Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("client")}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "client"
              ? "text-gold-400 font-semibold bg-white/5"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4 mb-1" />
          <span className="text-[10px] tracking-tight">Client</span>
          {metrics.pendingCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-obsidian-950 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("analytic")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "analytic"
              ? "text-gold-400 font-semibold bg-white/5"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-1" />
          <span className="text-[10px] tracking-tight">Analytic</span>
        </button>

        <button
          onClick={() => setActiveTab("log")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "log"
              ? "text-gold-400 font-semibold bg-white/5"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <History className="w-4 h-4 mb-1" />
          <span className="text-[10px] tracking-tight">Log</span>
        </button>

        <button
          onClick={() => setActiveTab("form-edit")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "form-edit"
              ? "text-gold-400 font-semibold bg-white/5"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <FileEdit className="w-4 h-4 mb-1" />
          <span className="text-[10px] tracking-tight">CMS</span>
        </button>

        <button
          onClick={() => setActiveTab("report")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "report"
              ? "text-gold-400 font-semibold bg-white/5"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4 mb-1" />
          <span className="text-[10px] tracking-tight">Report</span>
        </button>
      </nav>

      {/* Proof Lightbox Modal */}
      {selectedProofUrl && (
        <div
          onClick={() => setSelectedProofUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full glass-panel p-4 rounded-2xl border border-white/20"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-xs uppercase tracking-wider text-gold-400 font-medium">
                Pratinjau Slip Bukti Transfer
              </span>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Tutup [ESC]
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden flex items-center justify-center bg-black rounded-lg">
              <img
                src={selectedProofUrl}
                alt="Bukti Transfer"
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
