"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Coins,
  Save,
  Check,
  Copy,
  X,
  EyeOff,
  Receipt,
  Send,
  Plus,
  Trash2,
  Layers,
  BookOpen,
  PhoneCall,
  ExternalLink,
} from "lucide-react";
import {
  ADDON_CATALOG,
  DEFAULT_RUNDOWN_TEMPLATE,
  RundownItem,
  PAYMENT_METHODS,
} from "@/lib/constants";

// Safe Storage helper resilient against iPadOS / iOS Safari Private Browsing quota restrictions
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Storage blocked or Private Browsing
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Storage blocked or Private Browsing
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Storage blocked or Private Browsing
    }
  },
};

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

type AdminTab =
  | "overview"
  | "client"
  | "invoice"
  | "rundown"
  | "addons"
  | "analytic"
  | "log"
  | "form-edit"
  | "report";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
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

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Client Filter & Search
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<{
    dateStr: string;
    dayNum: number;
    items: BookingItem[];
  } | null>(null);

  // Invoice Workspace State
  const [selectedInvoiceBookingId, setSelectedInvoiceBookingId] = useState<string>("");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [sendingInvoiceWa, setSendingInvoiceWa] = useState(false);
  const [invoiceWaStatus, setInvoiceWaStatus] = useState<string | null>(null);

  // Rundown Workspace State
  const [selectedRundownBookingId, setSelectedRundownBookingId] = useState<string>("");
  const [rundownList, setRundownList] = useState<RundownItem[]>(DEFAULT_RUNDOWN_TEMPLATE);
  const [newRundownTime, setNewRundownTime] = useState("");
  const [newRundownActivity, setNewRundownActivity] = useState("");
  const [newRundownPic, setNewRundownPic] = useState("");
  const [newRundownNotes, setNewRundownNotes] = useState("");
  const [sendingRundownWa, setSendingRundownWa] = useState(false);
  const [rundownWaStatus, setRundownWaStatus] = useState<string | null>(null);

  // Quick WhatsApp Modal State & Fonnte Gateway
  const [waModalBooking, setWaModalBooking] = useState<BookingItem | null>(null);
  const [waTemplateKey, setWaTemplateKey] = useState<"hold" | "confirmed" | "proof_issue" | "consult">("hold");
  const [waMessageText, setWaMessageText] = useState("");
  const [waCopiedToast, setWaCopiedToast] = useState(false);
  const [sendingFonnteWa, setSendingFonnteWa] = useState(false);
  const [fonnteResultStatus, setFonnteResultStatus] = useState<{ success: boolean; message: string } | null>(null);

  // CMS Form Edit State
  const [cmsSavedToast, setCmsSavedToast] = useState(false);
  const [cmsConfig, setCmsConfig] = useState({
    driveVideoStep1: "1-sample-drive-step-1",
    driveVideoStep2: "1-sample-drive-step-2",
    driveVideoStep3: "1-sample-drive-step-3",
    driveVideoStep4: "1-sample-drive-step-4",
    driveVideoStep5: "1-sample-drive-step-5",
    narrative1: "Isi data singkat kalian agar kami bisa menyiapkan dokumentasi yang sesuai.",
    narrative2: "Witing tresna jalaran soko kulino, witing mulyo jalaran wani rekoso...",
    narrative3: "Dua cerita dan dua akar pohon kini menyatu, menjelma menjadi rindang keteduhan yang baru...",
    narrative4: "Karya ini kelak menjadi warisan rasa. Kami menahan hari bahagia ini khusus untuk kalian...",
    narrative5: "Satu langkah lagi untuk mengamankan tanggal kalian...",
  });

  // Selected Booking for Invoice View
  const activeInvoiceBooking = useMemo(() => {
    if (selectedInvoiceBookingId) {
      return bookings.find((b) => b.id === selectedInvoiceBookingId) || bookings[0] || null;
    }
    return bookings[0] || null;
  }, [selectedInvoiceBookingId, bookings]);

  // Selected Booking for Rundown View
  const activeRundownBooking = useMemo(() => {
    if (selectedRundownBookingId) {
      return bookings.find((b) => b.id === selectedRundownBookingId) || bookings[0] || null;
    }
    return bookings[0] || null;
  }, [selectedRundownBookingId, bookings]);

  // Calculate Invoice Breakdown
  const invoiceCalculation = useMemo(() => {
    if (!activeInvoiceBooking) return null;
    const basePrice = Number(activeInvoiceBooking.totalPrice) || 0;
    const addonsTotal = selectedAddonIds.reduce((sum, addonId) => {
      const found = ADDON_CATALOG.find((a) => a.id === addonId);
      return sum + (found ? found.price : 0);
    }, 0);
    const discount = Math.max(0, invoiceDiscount || 0);
    const grandTotal = Math.max(0, basePrice + addonsTotal - discount);
    const dpPaid = activeInvoiceBooking.status === "CONFIRMED" ? activeInvoiceBooking.downPayment : 0;
    const remainingBalance = Math.max(0, grandTotal - dpPaid);

    return {
      basePrice,
      addonsTotal,
      discount,
      grandTotal,
      dpPaid,
      remainingBalance,
    };
  }, [activeInvoiceBooking, selectedAddonIds, invoiceDiscount]);

  // Load PIN from storage if previously stored
  useEffect(() => {
    const savedPin = safeStorage.getItem("bylumenia_admin_pin");
    if (savedPin) {
      const trimmed = savedPin.trim();
      setPin(trimmed);
      fetchDashboardData(trimmed);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(false);
    fetchDashboardData(pin);
  };

  const fetchDashboardData = async (authPin: string) => {
    const cleanPin = (authPin || "").trim();
    if (!cleanPin) {
      setPinError(true);
      return;
    }

    setLoading(true);
    setPinError(false);
    try {
      const res = await fetch(`/api/admin/bookings?pin=${encodeURIComponent(cleanPin)}&_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        safeStorage.setItem("bylumenia_admin_pin", cleanPin);
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
        if (data.bookings && data.bookings.length > 0) {
          if (!selectedInvoiceBookingId) setSelectedInvoiceBookingId(data.bookings[0].id);
          if (!selectedRundownBookingId) setSelectedRundownBookingId(data.bookings[0].id);
        }
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
    const label = action === "CONFIRM" ? "Menyetujui DP" : action === "REJECT" ? "Menolak Bukti" : "Melepaskan Slot";
    if (!confirm(`Konfirmasi tindakan: ${label} untuk reservasi ini?`)) return;

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, action }),
      });

      if (res.ok) {
        fetchDashboardData(pin);
        if (selectedCalendarDay) {
          // Refresh open drawer bookings
          const updatedBookings = bookings.map((b) => {
            if (b.id === id) {
              return { ...b, status: action === "CONFIRM" ? ("CONFIRMED" as const) : ("REJECTED" as const) };
            }
            return b;
          });
          const dayItems = updatedBookings.filter((b) => b.eventDate === selectedCalendarDay.dateStr);
          setSelectedCalendarDay({ ...selectedCalendarDay, items: dayItems });
        }
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
    link.target = "_blank";
    link.setAttribute("download", `Laporan_Reservasi_Bylumenia_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleLogout = () => {
    safeStorage.removeItem("bylumenia_admin_pin");
    setIsAuthenticated(false);
    setPin("");
  };

  // WhatsApp Templates Generator
  const getWaTemplateContent = (booking: BookingItem, key: "hold" | "confirmed" | "proof_issue" | "consult") => {
    const dpFormatted = `Rp ${(booking.downPayment || 1000000).toLocaleString("id-ID")}`;
    switch (key) {
      case "hold":
        return `Halo Kak ${booking.coupleName}, salam dari Studio Lumenia ✨\n\nTanggal *${booking.eventDate}* untuk paket *${booking.packageName}* sedang kami tahan untuk Kakak.\n\nWaktu penahanan slot (hold) 30 menit akan segera berakhir. Jika Kakak telah siap, mohon unggah bukti transfer tanda jadi (DP) agar tanggal ini resmi terkunci untuk Kakak.\n\nJika ada pertanyaan mengenai paket atau rundown, jangan ragu membalas pesan ini ya Kak. Terima kasih! 🙏`;
      case "confirmed":
        return `Halo Kak ${booking.coupleName}! 🎉\n\nPembayaran tanda jadi (DP) sebesar *${dpFormatted}* untuk paket *${booking.packageName}* pada tanggal *${booking.eventDate}* telah berhasil kami verifikasi.\n\nJadwal Kakak kini resmi terkunci secara eksklusif. Kami hanya menerima 1 pasangan per hari untuk menjaga kualitas dan fokus penuh tim dokumentasi.\n\nTim kami akan segera menghubungi Kakak untuk sesi konsultasi konsep visual dan rundown teknis. Terima kasih telah mempercayakan momen berharga ini kepada Studio Lumenia! 🤍`;
      case "proof_issue":
        return `Halo Kak ${booking.coupleName}, salam dari Studio Lumenia 🙏\n\nTerima kasih atas reservasi untuk tanggal *${booking.eventDate}*.\n\nMohon maaf, bukti transfer yang kami terima kurang jelas atau terpotong sehingga belum dapat diverifikasi oleh bagian keuangan kami. Mohon kesediaan Kakak untuk mengirimkan foto atau tangkapan layar bukti transfer yang lebih jelas melalui chat ini ya Kak.\n\nTerima kasih banyak atas kerja samanya!`;
      case "consult":
        return `Halo Kak ${booking.coupleName}, salam hangat dari Studio Lumenia ✨\n\nKami sangat antusias menyambut hari bahagia Kakak pada tanggal *${booking.eventDate}* di ${booking.eventLocation || "Semarang"}.\n\nApakah Kakak memiliki referensi visual, susunan keluarga, atau detail acara yang ingin dibahas bersama tim kreatif kami? Silakan beri tahu kami lewat chat ini ya Kak. Terima kasih! 🌿`;
    }
  };

  const handleOpenWaModal = (booking: BookingItem, defaultKey?: "hold" | "confirmed" | "proof_issue" | "consult") => {
    const key = defaultKey || (booking.status === "CONFIRMED" ? "confirmed" : booking.status === "PENDING_VERIFY" ? "proof_issue" : "hold");
    setWaModalBooking(booking);
    setWaTemplateKey(key);
    setWaMessageText(getWaTemplateContent(booking, key));
    setWaCopiedToast(false);
    setFonnteResultStatus(null);
  };

  const handleSelectWaTemplate = (key: "hold" | "confirmed" | "proof_issue" | "consult") => {
    if (!waModalBooking) return;
    setWaTemplateKey(key);
    setWaMessageText(getWaTemplateContent(waModalBooking, key));
  };

  const handleSendWaManual = () => {
    if (!waModalBooking) return;
    const cleanNumber = waModalBooking.whatsapp.replace(/^0/, "62").replace(/[^0-9]/g, "");
    const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(waMessageText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Kirim WhatsApp Otomatis via Gateway Fonnte
  const handleSendWaViaFonnte = async () => {
    if (!waModalBooking) return;
    setSendingFonnteWa(true);
    setFonnteResultStatus(null);
    try {
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          target: waModalBooking.whatsapp,
          message: waMessageText,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFonnteResultStatus({
          success: true,
          message: "Pesan berhasil dikirim via Fonnte WhatsApp Gateway!",
        });
      } else {
        setFonnteResultStatus({
          success: false,
          message: data.message || "Gagal mengirim pesan via Fonnte.",
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setFonnteResultStatus({
        success: false,
        message: error.message || "Terjadi kendala jaringan saat menghubungi Fonnte.",
      });
    } finally {
      setSendingFonnteWa(false);
    }
  };

  const handleCopyWaText = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(waMessageText);
        setWaCopiedToast(true);
        setTimeout(() => setWaCopiedToast(false), 2000);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = waMessageText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setWaCopiedToast(true);
        setTimeout(() => setWaCopiedToast(false), 2000);
      }
    } catch {
      // Clipboard fallback
    }
  };

  // Kirim Invoice via WhatsApp Fonnte
  const handleSendInvoiceViaFonnte = async () => {
    if (!activeInvoiceBooking || !invoiceCalculation) return;
    setSendingInvoiceWa(true);
    setInvoiceWaStatus(null);
    try {
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          action: "INVOICE",
          booking: {
            coupleName: activeInvoiceBooking.coupleName,
            whatsapp: activeInvoiceBooking.whatsapp,
            eventDate: activeInvoiceBooking.eventDate,
            packageName: activeInvoiceBooking.packageName,
            bookingCode: activeInvoiceBooking.bookingCode,
          },
          invoice: {
            invoiceNumber: `INV-${activeInvoiceBooking.bookingCode}`,
            totalAmount: invoiceCalculation.grandTotal,
            downPaymentPaid: invoiceCalculation.dpPaid,
            remainingBalance: invoiceCalculation.remainingBalance,
            dueDate: activeInvoiceBooking.eventDate,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInvoiceWaStatus("Invoice digital berhasil dikirim ke WhatsApp klien via Fonnte!");
      } else {
        setInvoiceWaStatus("Gagal mengirim invoice via Fonnte: " + (data.message || "Error server"));
      }
    } catch (err: unknown) {
      const error = err as Error;
      setInvoiceWaStatus("Terjadi kendala saat mengirim: " + error.message);
    } finally {
      setSendingInvoiceWa(false);
    }
  };

  // Kirim Rundown via WhatsApp Fonnte
  const handleSendRundownViaFonnte = async () => {
    if (!activeRundownBooking) return;
    setSendingRundownWa(true);
    setRundownWaStatus(null);
    try {
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          action: "RUNDOWN",
          booking: {
            coupleName: activeRundownBooking.coupleName,
            whatsapp: activeRundownBooking.whatsapp,
            eventDate: activeRundownBooking.eventDate,
            packageName: activeRundownBooking.packageName,
          },
          rundown: {
            timeline: rundownList.map((r) => `${r.time} • ${r.activity} (PIC: ${r.pic})`).join("\n"),
            notes: "Mohon tim dokumentasi hadir 30 menit sebelum jadwal makeup dimulai.",
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRundownWaStatus("Rundown acara berhasil dikirim ke WhatsApp klien via Fonnte!");
      } else {
        setRundownWaStatus("Gagal mengirim rundown: " + (data.message || "Error server"));
      }
    } catch (err: unknown) {
      const error = err as Error;
      setRundownWaStatus("Terjadi kendala saat mengirim: " + error.message);
    } finally {
      setSendingRundownWa(false);
    }
  };

  // Add Rundown Item Handler
  const handleAddRundownItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRundownTime || !newRundownActivity) {
      alert("Harap isi waktu dan nama kegiatan.");
      return;
    }
    const newItem: RundownItem = {
      id: `rd-custom-${Date.now()}`,
      time: newRundownTime,
      activity: newRundownActivity,
      pic: newRundownPic || "Tim Dokumentasi",
      notes: newRundownNotes || undefined,
    };
    setRundownList([...rundownList, newItem]);
    setNewRundownTime("");
    setNewRundownActivity("");
    setNewRundownPic("");
    setNewRundownNotes("");
  };

  const handleRemoveRundownItem = (id: string) => {
    setRundownList(rundownList.filter((item) => item.id !== id));
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

  // Login Gate - Light Mode Styled
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-700">
            <KeyRound className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-700 block mb-1">
            Studio Lumenia Backoffice
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 font-semibold mb-2">
            Masuk Ruang Admin
          </h1>
          <p className="text-xs text-slate-500 font-normal mb-8">
            Gunakan PIN admin untuk mengelola jadwal pernikahan, invoice, dan komunikasi WhatsApp.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="current-password"
                placeholder="Masukkan PIN Admin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3.5 pr-12 rounded-xl bg-slate-50 border border-slate-300 focus:border-amber-600 focus:bg-white focus:outline-none text-center font-mono tracking-widest text-slate-900 text-lg placeholder-slate-400 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                title={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                tabIndex={-1}
              >
                {showPin ? (
                  <EyeOff className="w-4 h-4 text-amber-600" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {pinError && (
              <p className="text-xs text-rose-600 font-medium">
                PIN tidak sesuai. Silakan periksa kembali.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Buka Dasbor Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5 font-medium"
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
    <main className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Print-only CSS injection */}
      <style jsx global>{`
        @media print {
          header, aside, nav, .no-print {
            display: none !important;
          }
          .print-area {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Top Header Bar (Light Mode) */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-serif text-2xl font-bold tracking-widest uppercase text-slate-900 hover:text-amber-700 transition-colors"
            >
              Bylumenia
            </Link>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Fonnte WA Gateway Aktif
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchDashboardData(pin)}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 transition-colors"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs text-emerald-800 font-medium transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-xs text-rose-800 font-medium transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-28 lg:pb-6 flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR NAVIGATION - DESKTOP & TABLET */}
        <aside className="hidden lg:block w-64 shrink-0 no-print">
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs sticky top-20 space-y-1">
            <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-100 mb-2">
              Menu Ruang Admin
            </div>

            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-500/40 font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-600" />
              <span>1. Overview & Kalender</span>
            </button>

            <button
              onClick={() => setActiveTab("client")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "client"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-500/40 font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4 text-amber-600" />
              <div className="flex-1 flex items-center justify-between">
                <span>2. CRM Klien & DP</span>
                {metrics.pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("invoice")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "invoice"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-500/40 font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Receipt className="w-4 h-4 text-amber-600" />
              <span>3. Ringkasan & Invoice</span>
            </button>

            <button
              onClick={() => setActiveTab("rundown")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "rundown"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-500/40 font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>4. Rundown Hari-H</span>
            </button>

            <button
              onClick={() => setActiveTab("addons")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "addons"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-500/40 font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4 text-amber-600" />
              <span>5. Katalog Add-on & HPP</span>
            </button>

            <button
              onClick={() => setActiveTab("analytic")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "analytic"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-500/40 font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <span>6. Analytic Konversi</span>
            </button>

            <button
              onClick={() => setActiveTab("log")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "log"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-500/40 font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <History className="w-4 h-4 text-amber-600" />
              <span>7. Log Audit Trail</span>
            </button>

            <button
              onClick={() => setActiveTab("form-edit")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "form-edit"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-500/40 font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <FileEdit className="w-4 h-4 text-amber-600" />
              <span>8. CMS Pengaturan Form</span>
            </button>

            <button
              onClick={() => setActiveTab("report")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "report"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-500/40 font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>9. Laporan Pembukuan</span>
            </button>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0">

          {/* TAB 1: OVERVIEW & KALENDER BULANAN */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Reservasi</span>
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-serif text-slate-900 font-semibold">{metrics.totalBookings}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-amber-800 font-semibold">Pending Verifikasi</span>
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  </div>
                  <div className="text-2xl font-serif text-amber-900 font-semibold">{metrics.pendingCount}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-emerald-800 font-semibold">Terkonfirmasi (DP)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-serif text-emerald-900 font-semibold">{metrics.confirmedCount}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">DP Masuk</span>
                    <Coins className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xl font-serif text-slate-900 font-semibold">
                    Rp {(metrics.totalRevenueConfirmed || 0).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              {/* Kalender Bulanan Interaktif */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-amber-700 font-bold">
                      Jadwal Tanggal Pernikahan
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl text-slate-900 font-semibold mt-0.5">
                      {calendarDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Klik tanggal mana saja untuk membuka kartu rincian setengah halaman.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Bulan Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCalendarDate(new Date())}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      Hari Ini
                    </button>
                    <button
                      onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Bulan Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
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
                      return <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-xl bg-slate-50/50" />;
                    }

                    const hasConfirmed = item.bookings.some((b) => b.status === "CONFIRMED");
                    const hasPending = item.bookings.some((b) => b.status === "PENDING_VERIFY");
                    const hasHold = item.bookings.some((b) => b.status === "HOLD");

                    return (
                      <div
                        key={item.dateStr}
                        onClick={() => setSelectedCalendarDay({ dateStr: item.dateStr, dayNum: item.day, items: item.bookings })}
                        className={`h-20 sm:h-24 p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          item.bookings.length > 0
                            ? hasConfirmed
                              ? "bg-amber-50 border-amber-400 shadow-xs hover:border-amber-600"
                              : hasPending
                              ? "bg-blue-50 border-blue-400 hover:border-blue-600"
                              : hasHold
                              ? "bg-purple-50 border-purple-400 hover:border-purple-600"
                              : "bg-slate-50 border-slate-300"
                            : "bg-white border-slate-200 hover:border-amber-400 hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-700">{item.day}</span>
                          {item.bookings.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                          )}
                        </div>

                        {item.bookings.length > 0 ? (
                          <div className="space-y-1">
                            {item.bookings.map((b) => (
                              <div
                                key={b.id}
                                className={`text-[10px] truncate px-1.5 py-0.5 rounded font-semibold ${
                                  b.status === "CONFIRMED"
                                    ? "bg-amber-600 text-white"
                                    : b.status === "PENDING_VERIFY"
                                    ? "bg-blue-600 text-white"
                                    : "bg-purple-600 text-white"
                                }`}
                                title={`${b.coupleName} - ${b.status}`}
                              >
                                {b.coupleName.split("&")[0]}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">Tersedia</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRM KLIEN & VERIFIKASI */}
          {activeTab === "client" && (
            <div className="space-y-6">
              {/* Search & Filter Header */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama, kode, WhatsApp..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
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
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider">
                        <th className="p-4 font-bold">Kode & Pasangan</th>
                        <th className="p-4 font-bold">Tanggal & Lokasi</th>
                        <th className="p-4 font-bold">Paket & Mood</th>
                        <th className="p-4 font-bold">DP / Total</th>
                        <th className="p-4 font-bold">Bukti Transfer</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            Tidak ditemukan data reservasi yang sesuai.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-4">
                              <span className="font-mono text-[11px] text-amber-700 font-bold block mb-0.5">{b.bookingCode}</span>
                              <div className="font-semibold text-slate-900 text-sm">{b.coupleName}</div>
                              <button
                                type="button"
                                onClick={() => handleOpenWaModal(b)}
                                className="text-[11px] text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mt-1 text-left font-medium"
                                title="Kirim Pesan WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                <span>{b.whatsapp}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono ml-0.5">Kirim WA</span>
                              </button>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-slate-900 block">{b.eventDate}</span>
                              <span className="text-[11px] text-slate-500 truncate max-w-[180px] block">{b.eventLocation}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-900 font-medium block">{b.packageName}</span>
                              <span className="text-[11px] text-amber-700 italic">{b.aestheticMood}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-emerald-800 block">Rp {b.downPayment.toLocaleString("id-ID")}</span>
                              <span className="text-[11px] text-slate-500">Total: Rp {b.totalPrice.toLocaleString("id-ID")}</span>
                            </td>
                            <td className="p-4">
                              {b.proofFileUrl ? (
                                <button
                                  onClick={() => setSelectedProofUrl(b.proofFileUrl)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-300 flex items-center gap-1 transition-colors font-medium"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Lihat Bukti</span>
                                </button>
                              ) : (
                                <span className="text-slate-400 italic">Belum diunggah</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase inline-block ${
                                  b.status === "CONFIRMED"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : b.status === "PENDING_VERIFY"
                                    ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                                    : b.status === "HOLD"
                                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                                    : "bg-rose-100 text-rose-800 border border-rose-300"
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedInvoiceBookingId(b.id);
                                    setActiveTab("invoice");
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
                                  title="Buka Invoice"
                                >
                                  <Receipt className="w-4 h-4 text-slate-700" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedRundownBookingId(b.id);
                                    setActiveTab("rundown");
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
                                  title="Buka Rundown Acara"
                                >
                                  <BookOpen className="w-4 h-4 text-slate-700" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenWaModal(b)}
                                  className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 transition-colors"
                                  title="Template Pesan WhatsApp Cepat"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                                {b.status === "PENDING_VERIFY" && (
                                  <>
                                    <button
                                      onClick={() => handleAction(b.id, "CONFIRM")}
                                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                                      title="Setujui Tanda Jadi"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleAction(b.id, "REJECT")}
                                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
                                      title="Tolak Bukti"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                {b.status === "HOLD" && (
                                  <button
                                    onClick={() => handleAction(b.id, "RELEASE")}
                                    className="p-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 transition-colors"
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

          {/* TAB 3: RINGKASAN & INVOICE DIGITAL */}
          {activeTab === "invoice" && (
            <div className="space-y-6">
              {/* Pasangan Selector */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-1">
                    Invoice Digital &amp; Tagihan Acara
                  </span>
                  <h3 className="font-serif text-xl text-slate-900 font-bold">
                    Pilih Reservasi Pasangan
                  </h3>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={activeInvoiceBooking?.id || ""}
                    onChange={(e) => setSelectedInvoiceBookingId(e.target.value)}
                    className="w-full md:w-80 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-600"
                  >
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.coupleName} ({b.eventDate} - {b.packageName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeInvoiceBooking && invoiceCalculation ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Interactive Add-ons & Discount Modifier */}
                  <div className="space-y-4 no-print">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-amber-600" />
                        <span>Katalog Add-on Layanan</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Centang layanan tambahan yang diminta klien untuk dimasukkan ke dalam invoice.
                      </p>

                      <div className="space-y-2">
                        {ADDON_CATALOG.map((addon) => {
                          const isSelected = selectedAddonIds.includes(addon.id);
                          return (
                            <label
                              key={addon.id}
                              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-amber-50/80 border-amber-400"
                                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAddonIds([...selectedAddonIds, addon.id]);
                                  } else {
                                    setSelectedAddonIds(selectedAddonIds.filter((id) => id !== addon.id));
                                  }
                                }}
                                className="mt-1 rounded text-amber-600 focus:ring-amber-500"
                              />
                              <div className="flex-1 text-xs">
                                <div className="font-semibold text-slate-900">{addon.name}</div>
                                <div className="text-[11px] text-slate-500">{addon.description}</div>
                                <div className="font-bold text-amber-800 mt-1">
                                  + Rp {addon.price.toLocaleString("id-ID")}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      {/* Diskon / Potongan */}
                      <div className="pt-3 border-t border-slate-200">
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Potongan / Diskon Khusus (IDR)
                        </label>
                        <input
                          type="number"
                          value={invoiceDiscount}
                          onChange={(e) => setInvoiceDiscount(Number(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    {/* Quick WhatsApp Send Card */}
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                        <MessageSquare className="w-4 h-4 text-emerald-700" />
                        <span>Kirim Invoice via WhatsApp Fonnte</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Kirimkan rincian tagihan resmi ini langsung ke nomor WhatsApp pengantin: <strong>{activeInvoiceBooking.whatsapp}</strong> melalui server Fonnte.
                      </p>

                      {invoiceWaStatus && (
                        <div className="p-2.5 rounded-lg bg-white border border-emerald-300 text-[11px] text-emerald-900 font-medium">
                          {invoiceWaStatus}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleSendInvoiceViaFonnte}
                        disabled={sendingInvoiceWa}
                        className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        {sendingInvoiceWa ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim Rincian Tagihan ke Klien</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>Cetak / Simpan PDF Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: The Digital Invoice Preview (Printable Area) */}
                  <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 print-area">
                      {/* Invoice Header */}
                      <div className="flex items-start justify-between border-b border-slate-200 pb-6 gap-4">
                        <div>
                          <div className="font-serif text-2xl font-bold tracking-widest uppercase text-slate-900">
                            BYLUMENIA
                          </div>
                          <div className="text-[11px] text-slate-500 uppercase tracking-widest mt-0.5">
                            Cinematic Wedding &amp; Visual Storyteller
                          </div>
                          <div className="text-xs text-slate-600 mt-2 leading-relaxed">
                            Semarang, Jawa Tengah &bull; Instagram: @bylumenia<br />
                            WhatsApp: +62 877-7735-7373
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs uppercase tracking-widest font-bold text-amber-700 block">
                            INVOICE RESMI
                          </span>
                          <span className="font-mono text-base font-bold text-slate-900 block mt-1">
                            INV-{activeInvoiceBooking.bookingCode}
                          </span>
                          <span className="text-xs text-slate-500 block mt-1">
                            Tanggal: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
                          </span>
                          <span className="text-xs font-semibold text-rose-700 block mt-0.5">
                            Jatuh Tempo: {activeInvoiceBooking.eventDate} (H-7 Acara)
                          </span>
                        </div>
                      </div>

                      {/* Client Details Banner */}
                      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Ditagihkan Kepada:</span>
                          <div className="font-bold text-slate-900 text-sm">{activeInvoiceBooking.coupleName}</div>
                          <div className="text-slate-600">{activeInvoiceBooking.whatsapp}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Jadwal &amp; Lokasi Acara:</span>
                          <div className="font-semibold text-slate-900">{activeInvoiceBooking.eventDate}</div>
                          <div className="text-slate-600">{activeInvoiceBooking.eventLocation || "Semarang"}</div>
                        </div>
                      </div>

                      {/* Invoice Line Items Table */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                              <th className="p-3">Deskripsi Layanan Dokumentasi</th>
                              <th className="p-3 text-right">Biaya (IDR)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr>
                              <td className="p-3">
                                <div className="font-semibold text-slate-900">Paket Dokumentasi: {activeInvoiceBooking.packageName}</div>
                                <div className="text-[11px] text-slate-500">
                                  Konsep: {activeInvoiceBooking.aestheticMood} &bull; Termasuk kru foto &amp; video lengkap, retouch pilihan, dan flashdisk eksklusif.
                                </div>
                              </td>
                              <td className="p-3 text-right font-medium text-slate-800">
                                Rp {invoiceCalculation.basePrice.toLocaleString("id-ID")}
                              </td>
                            </tr>

                            {selectedAddonIds.map((addonId) => {
                              const addon = ADDON_CATALOG.find((a) => a.id === addonId);
                              if (!addon) return null;
                              return (
                                <tr key={addon.id}>
                                  <td className="p-3">
                                    <div className="font-semibold text-slate-900">+ {addon.name}</div>
                                    <div className="text-[11px] text-slate-500">{addon.description}</div>
                                  </td>
                                  <td className="p-3 text-right font-medium text-slate-800">
                                    Rp {addon.price.toLocaleString("id-ID")}
                                  </td>
                                </tr>
                              );
                            })}

                            {invoiceCalculation.discount > 0 && (
                              <tr className="bg-rose-50/50">
                                <td className="p-3 font-semibold text-rose-800">
                                  Potongan / Diskon Khusus
                                </td>
                                <td className="p-3 text-right font-bold text-rose-700">
                                  - Rp {invoiceCalculation.discount.toLocaleString("id-ID")}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Invoice Summary Calculation */}
                      <div className="flex justify-end">
                        <div className="w-72 space-y-2 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>Subtotal Layanan:</span>
                            <span className="font-medium">
                              Rp {(invoiceCalculation.basePrice + invoiceCalculation.addonsTotal).toLocaleString("id-ID")}
                            </span>
                          </div>
                          {invoiceCalculation.discount > 0 && (
                            <div className="flex justify-between text-rose-700">
                              <span>Diskon:</span>
                              <span className="font-medium">
                                - Rp {invoiceCalculation.discount.toLocaleString("id-ID")}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                            <span>Total Tagihan:</span>
                            <span>Rp {invoiceCalculation.grandTotal.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-emerald-800 font-semibold">
                            <span>DP Tanda Jadi Terbayar:</span>
                            <span>Rp {invoiceCalculation.dpPaid.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-amber-900 pt-2 border-t border-amber-300 bg-amber-50 p-2 rounded-lg">
                            <span>Sisa Pelunasan (H-7):</span>
                            <span>Rp {invoiceCalculation.remainingBalance.toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Account Details */}
                      <div className="pt-4 border-t border-slate-200 text-xs space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                          Informasi Pembayaran Rekening Resmi:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="font-bold text-slate-800 block">{PAYMENT_METHODS.bankBca.bankName}</span>
                            <span className="font-mono text-sm font-bold text-amber-800 block mt-0.5">
                              {PAYMENT_METHODS.bankBca.accountNumber}
                            </span>
                            <span className="text-[11px] text-slate-500">a.n. {PAYMENT_METHODS.bankBca.accountHolder}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="font-bold text-slate-800 block">{PAYMENT_METHODS.bankMandiri.bankName}</span>
                            <span className="font-mono text-sm font-bold text-amber-800 block mt-0.5">
                              {PAYMENT_METHODS.bankMandiri.accountNumber}
                            </span>
                            <span className="text-[11px] text-slate-500">a.n. {PAYMENT_METHODS.bankMandiri.accountHolder}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 italic mt-2">
                          * Pelunasan sisa tagihan dilakukan maksimal H-7 sebelum hari pelaksanaan acara pernikahan. Bukti pelunasan dapat dikirimkan ke WhatsApp resmi Studio Lumenia.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                  Belum ada data reservasi untuk membuat invoice.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WORKSPACE & RUNDOWN HARI-H */}
          {activeTab === "rundown" && (
            <div className="space-y-6">
              {/* Header & Selector */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-1">
                    Event Workspace &amp; Timeline Dokumentasi
                  </span>
                  <h3 className="font-serif text-xl text-slate-900 font-bold">
                    Rundown Acara Hari-H
                  </h3>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={activeRundownBooking?.id || ""}
                    onChange={(e) => setSelectedRundownBookingId(e.target.value)}
                    className="w-full md:w-80 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-600"
                  >
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.coupleName} ({b.eventDate} - {b.eventLocation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeRundownBooking ? (
                <div className="space-y-6">
                  {/* Context Bar */}
                  <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">
                        Dokumentasi Pernikahan: {activeRundownBooking.coupleName}
                      </span>
                      <span className="text-[11px] text-amber-800">
                        {activeRundownBooking.eventDate} &bull; {activeRundownBooking.eventLocation} &bull; Paket: {activeRundownBooking.packageName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 no-print">
                      <button
                        type="button"
                        onClick={handleSendRundownViaFonnte}
                        disabled={sendingRundownWa}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        {sendingRundownWa ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim Rundown ke WA Klien</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>Cetak Rundown</span>
                      </button>
                    </div>
                  </div>

                  {rundownWaStatus && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-medium">
                      {rundownWaStatus}
                    </div>
                  )}

                  {/* Rundown Timeline List */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print-area">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                        Susunan Jadwal &amp; Catatan Tim Dokumentasi
                      </span>
                      <button
                        type="button"
                        onClick={() => setRundownList(DEFAULT_RUNDOWN_TEMPLATE)}
                        className="text-[11px] text-amber-800 hover:text-amber-950 font-semibold no-print"
                      >
                        Reset ke Template Standar
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                      {rundownList.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-24 shrink-0 font-mono font-bold text-amber-800">
                              {item.time}
                            </div>
                            <div className="space-y-1">
                              <div className="font-bold text-slate-900 text-sm">{item.activity}</div>
                              <div className="text-[11px] text-slate-600 font-medium">
                                PIC: <span className="text-slate-800">{item.pic}</span>
                              </div>
                              {item.notes && (
                                <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-200/60 mt-1">
                                  Shot list / Catatan: {item.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveRundownItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 no-print transition-colors"
                            title="Hapus Kegiatan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add New Rundown Item Form */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs no-print space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-amber-600" />
                      <span>Tambah Sesi Acara Baru</span>
                    </h4>

                    <form onSubmit={handleAddRundownItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Waktu (e.g. 11:30 - 12:30)</label>
                        <input
                          type="text"
                          value={newRundownTime}
                          onChange={(e) => setNewRundownTime(e.target.value)}
                          placeholder="08:00 - 09:00"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Kegiatan</label>
                        <input
                          type="text"
                          value={newRundownActivity}
                          onChange={(e) => setNewRundownActivity(e.target.value)}
                          placeholder="Akad Nikah / Kirab Pengantin"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Penanggung Jawab (PIC)</label>
                        <input
                          type="text"
                          value={newRundownPic}
                          onChange={(e) => setNewRundownPic(e.target.value)}
                          placeholder="Tim Video & Lead Photo"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Catatan Khusus (Shot List)</label>
                        <input
                          type="text"
                          value={newRundownNotes}
                          onChange={(e) => setNewRundownNotes(e.target.value)}
                          placeholder="Close-up cincin & mata haru"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambahkan ke Rundown</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                  Belum ada data reservasi untuk membuat rundown.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: KATALOG ADD-ON & ESTIMASI HPP */}
          {activeTab === "addons" && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-1">
                  Handler Class Model &bull; Service Catalog
                </span>
                <h3 className="font-serif text-2xl text-slate-900 font-bold mb-2">
                  Katalog Layanan Tambahan (Add-on) &amp; Estimasi HPP
                </h3>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Daftar layanan add-on yang dapat ditawarkan saat konsultasi atau revisi paket. Dilengkapi dengan estimasi biaya operasional tim (HPP) untuk acuan profitabilitas studio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ADDON_CATALOG.map((addon) => {
                  // Estimasi HPP ~40-50% dari harga jual
                  const estimatedHpp = Math.round(addon.price * 0.45);
                  const grossProfit = addon.price - estimatedHpp;
                  const marginPercent = Math.round((grossProfit / addon.price) * 100);

                  return (
                    <div key={addon.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {addon.category}
                          </span>
                          <h4 className="font-bold text-slate-900 text-base mt-2">{addon.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">{addon.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">Harga Jual Klien</span>
                          <span className="font-bold text-slate-900 block mt-0.5">
                            Rp {addon.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">Estimasi HPP Tim</span>
                          <span className="font-medium text-slate-600 block mt-0.5">
                            Rp {estimatedHpp.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">Margin Studio</span>
                          <span className="font-bold text-emerald-700 block mt-0.5">
                            {marginPercent}% (Rp {grossProfit.toLocaleString("id-ID")})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: ANALYTIC KONVERSI */}
          {activeTab === "analytic" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs uppercase tracking-widest text-amber-700 font-bold">Funnel Konversi</span>
                <h3 className="font-serif text-2xl text-slate-900 font-bold mt-1 mb-6">
                  Tingkat Penyelesaian Formulir (5 Langkah)
                </h3>

                <div className="space-y-4">
                  {[
                    { babak: "Langkah 1 • Data & Tanggal", rate: 100, drop: "Titik Masuk" },
                    { babak: "Langkah 2 • Suasana", rate: 94, drop: "Drop -6%" },
                    { babak: "Langkah 3 • Paket & Lokasi", rate: 86, drop: "Drop -8%" },
                    { babak: "Langkah 4 • Tanda Jadi (Hold 30m)", rate: 78, drop: "Drop -8%" },
                    { babak: "Langkah 5 • Unggah Bukti & Selesai", rate: 70, drop: "Konversi Akhir 70%" },
                  ].map((f, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-800">{f.babak}</span>
                        <span className="text-slate-500">{f.drop}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-500"
                          style={{ width: `${f.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mood Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">Khidmat</span>
                  <div className="text-3xl font-serif text-slate-900 font-bold">45%</div>
                  <p className="text-xs text-slate-500 mt-2">Restu keluarga &amp; suasana hening</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">Elegan &amp; Adat</span>
                  <div className="text-3xl font-serif text-slate-900 font-bold">35%</div>
                  <p className="text-xs text-slate-500 mt-2">Tradisi Jawa &amp; sentuhan editorial</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">Candid &amp; Santai</span>
                  <div className="text-3xl font-serif text-slate-900 font-bold">20%</div>
                  <p className="text-xs text-slate-500 mt-2">Spontan bersama sahabat terdekat</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: AUDIT TRAIL LOG */}
          {activeTab === "log" && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-1">
                  Sistem Audit &bull; Security Log
                </span>
                <h3 className="font-serif text-2xl text-slate-900 font-bold">
                  Riwayat Aktivitas &amp; Log Perubahan
                </h3>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="divide-y divide-slate-100 text-xs">
                  {logs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">Belum ada catatan log aktivitas.</div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="font-semibold text-slate-900">{log.actionType}</span>
                          <span className="text-slate-500 ml-2">oleh {log.executedBy}</span>
                          {log.booking && (
                            <div className="text-[11px] text-amber-800 font-mono mt-0.5">
                              {log.booking.coupleName} ({log.booking.bookingCode})
                            </div>
                          )}
                          {log.notes && <div className="text-[11px] text-slate-500 mt-0.5">{log.notes}</div>}
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">
                          {new Date(log.loggedAt).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CMS PENGATURAN FORM */}
          {activeTab === "form-edit" && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-1">
                  Konten &amp; Narasi
                </span>
                <h3 className="font-serif text-2xl text-slate-900 font-bold">
                  Pengaturan Formulir Reservasi Publik
                </h3>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                {cmsSavedToast && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-medium">
                    Perubahan konfigurasi tersimpan secara lokal.
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Narasi Langkah 1 (Awal)</label>
                    <input
                      type="text"
                      value={cmsConfig.narrative1}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, narrative1: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Narasi Langkah 2 (Suasana)</label>
                    <input
                      type="text"
                      value={cmsConfig.narrative2}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, narrative2: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Narasi Langkah 4 (Hold 30m)</label>
                    <input
                      type="text"
                      value={cmsConfig.narrative4}
                      onChange={(e) => setCmsConfig({ ...cmsConfig, narrative4: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setCmsSavedToast(true);
                      setTimeout(() => setCmsSavedToast(false), 2500);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Pengaturan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: LAPORAN PEMBUKUAN */}
          {activeTab === "report" && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-1">
                    Finance &amp; Reporting
                  </span>
                  <h3 className="font-serif text-2xl text-slate-900 font-bold">
                    Rekapitulasi Pembukuan Studio
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintReport}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Lembar Rekap</span>
                  </button>
                  <button
                    onClick={handleExportCsv}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh CSV</span>
                  </button>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                    Uang Muka Terverifikasi
                  </span>
                  <div className="text-2xl font-serif text-emerald-800 font-bold">
                    Rp {(metrics.totalRevenueConfirmed || 0).toLocaleString("id-ID")}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                    Total Kontrak Berjalan
                  </span>
                  <div className="text-2xl font-serif text-slate-900 font-bold">
                    Rp {bookings.reduce((sum, b) => (b.status === "CONFIRMED" ? sum + b.totalPrice : sum), 0).toLocaleString("id-ID")}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                    Sisa Piutang Pelunasan (H-7)
                  </span>
                  <div className="text-2xl font-serif text-amber-800 font-bold">
                    Rp {bookings.reduce((sum, b) => (b.status === "CONFIRMED" ? sum + (b.totalPrice - b.downPayment) : sum), 0).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* HALF-PAGE SLIDE-OVER DRAWER (CLICKED CALENDAR DAY) */}
      {selectedCalendarDay && (
        <div className="fixed inset-0 z-50 overflow-hidden no-print animate-fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedCalendarDay(null)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over Card (Half Page) */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto animate-slide-left">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700 block">
                      Rincian Jadwal Tanggal
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl text-slate-900 font-bold mt-0.5">
                      {new Date(selectedCalendarDay.dateStr).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedCalendarDay(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content Body */}
              <div className="p-6 space-y-6 flex-1">
                {selectedCalendarDay.items.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
                      <Check className="w-7 h-7" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-slate-800">
                      Slot Bebas / Tersedia
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Belum ada pemesanan yang mengunci tanggal ini. Calon pengantin di website publik dapat memilih tanggal ini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedCalendarDay.items.map((b) => (
                      <div
                        key={b.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
                      >
                        {/* Status Badge & Code */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-amber-700">
                            {b.bookingCode}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                              b.status === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : b.status === "PENDING_VERIFY"
                                ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                                : "bg-blue-100 text-blue-800 border border-blue-300"
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>

                        {/* Couple Info */}
                        <div>
                          <h4 className="font-serif text-lg font-bold text-slate-900">{b.coupleName}</h4>
                          <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{b.whatsapp}</span>
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-slate-200 text-xs">
                          <div>
                            <span className="text-[10px] uppercase text-slate-400 font-bold block">Paket Pilihan</span>
                            <span className="font-semibold text-slate-800 block mt-0.5">{b.packageName}</span>
                            <span className="text-[11px] text-amber-700 italic">{b.aestheticMood}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-slate-400 font-bold block">Lokasi Acara</span>
                            <span className="font-semibold text-slate-800 block mt-0.5">{b.eventLocation || "Semarang"}</span>
                          </div>
                        </div>

                        {/* Financial Snapshot */}
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                          <div className="flex justify-between text-slate-600">
                            <span>Total Paket:</span>
                            <span className="font-semibold text-slate-900">Rp {b.totalPrice.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-emerald-800">
                            <span>Uang Muka (DP):</span>
                            <span className="font-bold">Rp {b.downPayment.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-amber-900 pt-1.5 border-t border-slate-100 font-semibold">
                            <span>Sisa Pelunasan:</span>
                            <span>Rp {(b.totalPrice - b.downPayment).toLocaleString("id-ID")}</span>
                          </div>
                        </div>

                        {/* Proof of Transfer Preview */}
                        {b.proofFileUrl && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase text-slate-400 font-bold block">Slip Bukti Transfer:</span>
                            <div
                              onClick={() => setSelectedProofUrl(b.proofFileUrl)}
                              className="relative h-28 rounded-xl overflow-hidden border border-slate-300 cursor-pointer group"
                            >
                              <img
                                src={b.proofFileUrl}
                                alt="Bukti Transfer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                Perbesar Bukti
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quick Actions in Drawer */}
                        <div className="space-y-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCalendarDay(null);
                              handleOpenWaModal(b);
                            }}
                            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Kirim Pesan WhatsApp (Fonnte)</span>
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInvoiceBookingId(b.id);
                                setActiveTab("invoice");
                                setSelectedCalendarDay(null);
                              }}
                              className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Receipt className="w-3.5 h-3.5 text-slate-600" />
                              <span>Buka Invoice</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRundownBookingId(b.id);
                                setActiveTab("rundown");
                                setSelectedCalendarDay(null);
                              }}
                              className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                              <span>Buka Rundown</span>
                            </button>
                          </div>

                          {b.status === "PENDING_VERIFY" && (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleAction(b.id, "CONFIRM")}
                                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Setujui DP</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAction(b.id, "REJECT")}
                                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak Bukti</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>Studio Lumenia Booking Management</span>
                <button
                  onClick={() => setSelectedCalendarDay(null)}
                  className="font-semibold text-slate-700 hover:text-slate-900"
                >
                  Tutup Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE / TABLET BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 no-print shadow-lg">
        <div className="flex items-center justify-around overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === "overview" ? "text-amber-700 font-bold bg-amber-50" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("client")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
              activeTab === "client" ? "text-amber-700 font-bold bg-amber-50" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Klien</span>
            {metrics.pendingCount > 0 && (
              <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("invoice")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === "invoice" ? "text-amber-700 font-bold bg-amber-50" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Receipt className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Invoice</span>
          </button>

          <button
            onClick={() => setActiveTab("rundown")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === "rundown" ? "text-amber-700 font-bold bg-amber-50" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Rundown</span>
          </button>

          <button
            onClick={() => setActiveTab("addons")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === "addons" ? "text-amber-700 font-bold bg-amber-50" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Add-on</span>
          </button>

          <button
            onClick={() => setActiveTab("report")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === "report" ? "text-amber-700 font-bold bg-amber-50" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Report</span>
          </button>
        </div>
      </nav>

      {/* Proof Lightbox Modal */}
      {selectedProofUrl && (
        <div
          onClick={() => setSelectedProofUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in no-print"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <span className="text-xs uppercase tracking-wider text-slate-800 font-bold">
                Pratinjau Slip Bukti Transfer
              </span>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
              >
                Tutup [ESC]
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden flex items-center justify-center bg-slate-900 rounded-lg">
              <img
                src={selectedProofUrl}
                alt="Bukti Transfer"
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick WhatsApp & Fonnte Gateway Modal */}
      {waModalBooking && (
        <div
          onClick={() => setWaModalBooking(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kirim Pesan WhatsApp (Fonnte Gateway)</h3>
                  <p className="text-[11px] text-slate-500">
                    Tujuan: <span className="text-emerald-800 font-bold">{waModalBooking.coupleName}</span> ({waModalBooking.whatsapp})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWaModalBooking(null)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector Chips */}
            <div className="mb-3">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">
                Pilih Skenario Pesan Cepat:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectWaTemplate("hold")}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold text-left transition-all border ${
                    waTemplateKey === "hold"
                      ? "bg-amber-100 border-amber-400 text-amber-900 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  ⏱️ Pengingat Hold
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectWaTemplate("confirmed")}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold text-left transition-all border ${
                    waTemplateKey === "confirmed"
                      ? "bg-emerald-100 border-emerald-400 text-emerald-900 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  🎉 Konfirmasi DP
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectWaTemplate("proof_issue")}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold text-left transition-all border ${
                    waTemplateKey === "proof_issue"
                      ? "bg-rose-100 border-rose-400 text-rose-900 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  📄 Slip Buram
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectWaTemplate("consult")}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold text-left transition-all border ${
                    waTemplateKey === "consult"
                      ? "bg-blue-100 border-blue-400 text-blue-900 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  💬 Sapaan Konsep
                </button>
              </div>
            </div>

            {/* Editable Text Area */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  Isi Pesan (Dapat Disesuaikan):
                </span>
                {waCopiedToast && (
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 animate-fade-in">
                    <Check className="w-3 h-3" /> Teks tersalin!
                  </span>
                )}
              </div>
              <textarea
                rows={6}
                value={waMessageText}
                onChange={(e) => setWaMessageText(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white focus:outline-none text-xs text-slate-800 leading-relaxed font-sans resize-none transition-all"
              />
            </div>

            {fonnteResultStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold mb-4 ${
                  fonnteResultStatus.success
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
                    : "bg-rose-50 text-rose-900 border border-rose-300"
                }`}
              >
                {fonnteResultStatus.message}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopyWaText}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs text-slate-700 font-semibold transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Salin Teks</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendWaManual}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  title="Buka WhatsApp Web atau App"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Manual (wa.me)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendWaViaFonnte}
                  disabled={sendingFonnteWa}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  {sendingFonnteWa ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim via Fonnte</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
