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
  Film,
  Camera,
  Sparkles,
  PieChart,
  Sliders,
  Truck,
} from "lucide-react";
import {
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

interface DynamicAddOn {
  id: string;
  name: string;
  category: "Video" | "Photo" | "Streaming" | "Output" | "Lainnya";
  price: number;
  hpp: number;
  description: string;
  components?: Array<{ name: string; cost: number }>;
}

interface ProductionProgress {
  backupStatus: "Selesai" | "Sedang Berjalan" | "Belum";
  driveLink: string;
  photoSelectionStatus: "40 Foto Siap Retouch" | "Menunggu Pilihan Klien" | "Belum Mulai";
  photoEditStatus: "Selesai 100%" | "Proses Retouch (50%)" | "Dalam Antrean";
  videoEditStatus: "Selesai 100%" | "Color Grading & Audio" | "Rough Cut" | "Dalam Antrean";
  videoPreviewLink: string;
  albumStatus: "Siap Kirim" | "Sedang Dicetak" | "Masuk Antrean Cetak" | "Belum Mulai";
  shippingResi: string;
  notes: string;
}

type AdminTab =
  | "overview"
  | "client"
  | "invoice"
  | "rundown"
  | "postprod"
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

  // Status Editing Foto & Video (Post-Production Tracker) State
  const [selectedPostProdBookingId, setSelectedPostProdBookingId] = useState<string>("");
  const [productionProgressMap, setProductionProgressMap] = useState<Record<string, ProductionProgress>>({
    default: {
      backupStatus: "Selesai",
      driveLink: "https://drive.google.com/drive/folders/sample-bylumenia-raw",
      photoSelectionStatus: "40 Foto Siap Retouch",
      photoEditStatus: "Proses Retouch (50%)",
      videoEditStatus: "Color Grading & Audio",
      videoPreviewLink: "https://youtu.be/sample-teaser-preview",
      albumStatus: "Sedang Dicetak",
      shippingResi: "JNE-REG-882910283",
      notes: "Sesi retouch gaun pengantin dan grading warna film khidmat berjalan lancar.",
    },
  });
  const [sendingPostProdWa, setSendingPostProdWa] = useState(false);
  const [postProdWaStatus, setPostProdWaStatus] = useState<string | null>(null);

  // Add-on Catalog & Simulator Interactive State
  const [addonsList, setAddonsList] = useState<DynamicAddOn[]>([
    {
      id: "addon-drone",
      name: "Drone Cinematic 4K Highlight",
      category: "Video",
      price: 1500000,
      hpp: 700000,
      description: "Pilot drone berlisensi & sudut pandang udara spektakuler venue pernikahan.",
      components: [
        { name: "Honor Pilot Drone Berlisensi", cost: 500000 },
        { name: "Sewa Baterai & Unit Drone 4K", cost: 200000 },
      ],
    },
    {
      id: "addon-live",
      name: "Live Streaming YouTube 2 Kamera Full HD",
      category: "Streaming",
      price: 3500000,
      hpp: 1700000,
      description: "Broadcaster pro, audio mixer digital, & overlay nama pengantin.",
      components: [
        { name: "Fee Operator Video Switcher", cost: 600000 },
        { name: "Fee 2 Kameramen Broadcast", cost: 800000 },
        { name: "Kuota Modem Bonding 5G", cost: 300000 },
      ],
    },
    {
      id: "addon-sde",
      name: "Same Day Edit (SDE Teaser Malam Resepsi)",
      category: "Video",
      price: 2000000,
      hpp: 1000000,
      description: "Video teaser 1 menit langsung tayang di proyektor resepsi & IG Reels.",
      components: [
        { name: "Fee Video Editor On-site Hari-H", cost: 800000 },
        { name: "Sewa Transmitter HDMI Wireless", cost: 200000 },
      ],
    },
    {
      id: "addon-album",
      name: "Album Linen Handmade Eksklusif Tambahan",
      category: "Output",
      price: 1200000,
      hpp: 600000,
      description: "Ukuran 20x30 cm (30 halaman) dengan boks kayu ukir grafir nama.",
      components: [
        { name: "Biaya Cetak Lab Foto Premium", cost: 450000 },
        { name: "Boks Kayu Ukir Grafir Laser", cost: 150000 },
      ],
    },
  ]);

  // Simulator Modal State
  const [selectedSimulatorAddon, setSelectedSimulatorAddon] = useState<DynamicAddOn | null>(null);
  const [simPrice, setSimPrice] = useState<number>(0);
  const [simHpp, setSimHpp] = useState<number>(0);
  const [isAddAddonModalOpen, setIsAddAddonModalOpen] = useState(false);
  const [newAddonForm, setNewAddonForm] = useState({
    name: "",
    category: "Video" as DynamicAddOn["category"],
    price: 1000000,
    hpp: 450000,
    description: "",
  });

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

  // Selected Booking for Post-Production View
  const activePostProdBooking = useMemo(() => {
    if (selectedPostProdBookingId) {
      return bookings.find((b) => b.id === selectedPostProdBookingId) || bookings[0] || null;
    }
    return bookings[0] || null;
  }, [selectedPostProdBookingId, bookings]);

  // Active Post-Production Progress Object
  const currentPostProdProgress = useMemo(() => {
    if (!activePostProdBooking) return productionProgressMap.default;
    return productionProgressMap[activePostProdBooking.id] || productionProgressMap.default;
  }, [activePostProdBooking, productionProgressMap]);

  // Calculate Invoice Breakdown
  const invoiceCalculation = useMemo(() => {
    if (!activeInvoiceBooking) return null;
    const basePrice = Number(activeInvoiceBooking.totalPrice) || 0;
    const addonsTotal = selectedAddonIds.reduce((sum, addonId) => {
      const found = addonsList.find((a) => a.id === addonId);
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
  }, [activeInvoiceBooking, selectedAddonIds, invoiceDiscount, addonsList]);

  // Load PIN & storage
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
          if (!selectedPostProdBookingId) setSelectedPostProdBookingId(data.bookings[0].id);
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

  // Kirim Rundown via WhatsApp Fonnte (FIXED: Resilient Array Payload)
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
            items: rundownList,
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

  // Kirim Update Status Editing Foto & Video via Fonnte
  const handleSendPostProdViaFonnte = async () => {
    if (!activePostProdBooking) return;
    setSendingPostProdWa(true);
    setPostProdWaStatus(null);
    try {
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          action: "PRODUCTION_UPDATE",
          booking: {
            coupleName: activePostProdBooking.coupleName,
            whatsapp: activePostProdBooking.whatsapp,
            eventDate: activePostProdBooking.eventDate,
            packageName: activePostProdBooking.packageName,
          },
          progress: currentPostProdProgress,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPostProdWaStatus("Laporan status editing foto & video berhasil dikirim ke WhatsApp klien via Fonnte!");
      } else {
        setPostProdWaStatus("Gagal mengirim laporan: " + (data.message || "Error server"));
      }
    } catch (err: unknown) {
      const error = err as Error;
      setPostProdWaStatus("Terjadi kendala saat mengirim: " + error.message);
    } finally {
      setSendingPostProdWa(false);
    }
  };

  const handleUpdateCurrentPostProd = (field: keyof ProductionProgress, value: string) => {
    if (!activePostProdBooking) return;
    const existing = productionProgressMap[activePostProdBooking.id] || productionProgressMap.default;
    const updated = { ...existing, [field]: value };
    setProductionProgressMap({
      ...productionProgressMap,
      [activePostProdBooking.id]: updated,
    });
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

  // Simulator Modal Handler
  const handleOpenSimulator = (addon: DynamicAddOn) => {
    setSelectedSimulatorAddon(addon);
    setSimPrice(addon.price);
    setSimHpp(addon.hpp);
  };

  const handleSaveSimulatorChanges = () => {
    if (!selectedSimulatorAddon) return;
    const updated = addonsList.map((a) =>
      a.id === selectedSimulatorAddon.id ? { ...a, price: simPrice, hpp: simHpp } : a
    );
    setAddonsList(updated);
    setSelectedSimulatorAddon(null);
  };

  const handleCreateNewAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddonForm.name) {
      alert("Harap isi nama add-on.");
      return;
    }
    const newAddon: DynamicAddOn = {
      id: `addon-custom-${Date.now()}`,
      name: newAddonForm.name,
      category: newAddonForm.category,
      price: Number(newAddonForm.price) || 0,
      hpp: Number(newAddonForm.hpp) || 0,
      description: newAddonForm.description || "Layanan tambahan kustom Studio Lumenia.",
    };
    setAddonsList([...addonsList, newAddon]);
    setIsAddAddonModalOpen(false);
    setNewAddonForm({
      name: "",
      category: "Video",
      price: 1000000,
      hpp: 450000,
      description: "",
    });
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

  // Helper Chart Data Calculations
  const chartData = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
    const pending = bookings.filter((b) => b.status === "PENDING_VERIFY").length;
    const hold = bookings.filter((b) => b.status === "HOLD").length;
    const expired = bookings.filter((b) => b.status === "EXPIRED" || b.status === "REJECTED").length;
    const total = Math.max(1, confirmed + pending + hold + expired);

    // Donut Segments (circumference = 314.159 for r=50)
    const c = 2 * Math.PI * 50;
    const pConfirmed = (confirmed / total) * c;
    const pPending = (pending / total) * c;
    const pHold = (hold / total) * c;
    const pExpired = (expired / total) * c;

    // Package Distribution
    const pkgPrewed = bookings.filter((b) => b.packageName.toLowerCase().includes("prewedding")).length;
    const pkgVows = bookings.filter((b) => b.packageName.toLowerCase().includes("vow")).length;
    const pkgRoyal = bookings.filter((b) => b.packageName.toLowerCase().includes("royal") || b.packageName.toLowerCase().includes("complete")).length;
    const maxPkgCount = Math.max(1, pkgPrewed, pkgVows, pkgRoyal);

    return {
      status: { confirmed, pending, hold, expired, total },
      donut: { c, pConfirmed, pPending, pHold, pExpired },
      packages: {
        prewed: { count: pkgPrewed, pct: Math.round((pkgPrewed / maxPkgCount) * 100) },
        vows: { count: pkgVows, pct: Math.round((pkgVows / maxPkgCount) * 100) },
        royal: { count: pkgRoyal, pct: Math.round((pkgRoyal / maxPkgCount) * 100) },
      },
    };
  }, [bookings]);

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
              <span>1. Overview & Diagram</span>
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
              onClick={() => setActiveTab("postprod")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "postprod"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-500/40 font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Film className="w-4 h-4 text-amber-600" />
              <span>5. Status Editing Foto & Video</span>
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
              <span>6. Katalog Add-on & HPP</span>
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
              <span>7. Analytic Konversi</span>
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
              <span>8. Log Audit Trail</span>
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
              <span>9. CMS Pengaturan Form</span>
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
              <span>10. Laporan Pembukuan</span>
            </button>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0">

          {/* TAB 1: OVERVIEW & DIAGRAM */}
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

              {/* OVERVIEW CHARTS ROW: DIAGRAM DONAT & DIAGRAM BATANG */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. DIAGRAM DONAT: Status Reservasi */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block">
                        Visualisasi Pipeline
                      </span>
                      <h4 className="font-serif text-lg text-slate-900 font-bold">
                        Diagram Donat: Status Reservasi
                      </h4>
                    </div>
                    <PieChart className="w-5 h-5 text-amber-600" />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
                    {/* SVG Donut */}
                    <div className="relative w-36 h-36 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        {/* Background Ring */}
                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
                        
                        {/* Confirmed Segment (Emerald) */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="transparent"
                          stroke="#10b981"
                          strokeWidth="18"
                          strokeDasharray={`${chartData.donut.pConfirmed} ${chartData.donut.c}`}
                          strokeDashoffset="0"
                          className="transition-all duration-700"
                        />
                        {/* Pending Segment (Amber) */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="transparent"
                          stroke="#f59e0b"
                          strokeWidth="18"
                          strokeDasharray={`${chartData.donut.pPending} ${chartData.donut.c}`}
                          strokeDashoffset={`-${chartData.donut.pConfirmed}`}
                          className="transition-all duration-700"
                        />
                        {/* Hold Segment (Indigo) */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="transparent"
                          stroke="#8b5cf6"
                          strokeWidth="18"
                          strokeDasharray={`${chartData.donut.pHold} ${chartData.donut.c}`}
                          strokeDashoffset={`-${chartData.donut.pConfirmed + chartData.donut.pPending}`}
                          className="transition-all duration-700"
                        />
                      </svg>
                      {/* Center Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold font-serif text-slate-900">{chartData.status.total}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total</span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-2 text-xs flex-1 w-full">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="font-semibold text-emerald-950">Terkonfirmasi DP</span>
                        </div>
                        <span className="font-bold text-emerald-800">{chartData.status.confirmed}</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="font-semibold text-amber-950">Pending Slip</span>
                        </div>
                        <span className="font-bold text-amber-800">{chartData.status.pending}</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50 border border-purple-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                          <span className="font-semibold text-purple-950">Hold 30 Menit</span>
                        </div>
                        <span className="font-bold text-purple-800">{chartData.status.hold}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DIAGRAM BATANG: Peminatan Kategori Paket */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block">
                        Popularitas Paket
                      </span>
                      <h4 className="font-serif text-lg text-slate-900 font-bold">
                        Diagram Batang: Paket Pilihan
                      </h4>
                    </div>
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-800">Prewedding (Photo &amp; Video)</span>
                        <span className="text-amber-800">{chartData.packages.prewed.count} Pasangan</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700"
                          style={{ width: `${Math.max(12, chartData.packages.prewed.pct)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-800">Wedding Day (The Vows)</span>
                        <span className="text-amber-800">{chartData.packages.vows.count} Pasangan</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-700 transition-all duration-700"
                          style={{ width: `${Math.max(12, chartData.packages.vows.pct)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-800">Complete Package (Royal Legacy)</span>
                        <span className="text-amber-800">{chartData.packages.royal.count} Pasangan</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-800 transition-all duration-700"
                          style={{ width: `${Math.max(12, chartData.packages.royal.pct)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 mt-3">
                      <span>Paket terfavorit saat ini:</span>
                      <span className="font-bold text-amber-700">The Royal Legacy (Complete)</span>
                    </div>
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
                        <th className="p-4 font-bold">Kode &amp; Pasangan</th>
                        <th className="p-4 font-bold">Tanggal &amp; Lokasi</th>
                        <th className="p-4 font-bold">Paket &amp; Mood</th>
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
                                  onClick={() => {
                                    setSelectedPostProdBookingId(b.id);
                                    setActiveTab("postprod");
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
                                  title="Status Editing Foto & Video"
                                >
                                  <Film className="w-4 h-4 text-slate-700" />
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
                        {addonsList.map((addon) => {
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
                              const addon = addonsList.find((a) => a.id === addonId);
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
                    <div className={`p-3 rounded-xl text-xs font-semibold ${
                      rundownWaStatus.includes("berhasil") ? "bg-emerald-50 text-emerald-900 border border-emerald-300" : "bg-rose-50 text-rose-900 border border-rose-300"
                    }`}>
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
                          placeholder="Tim Video &amp; Lead Photo"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Catatan Khusus (Shot List)</label>
                        <input
                          type="text"
                          value={newRundownNotes}
                          onChange={(e) => setNewRundownNotes(e.target.value)}
                          placeholder="Close-up cincin &amp; mata haru"
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

          {/* TAB 5: STATUS EDITING FOTO & VIDEO (POST-PRODUCTION TRACKER) */}
          {activeTab === "postprod" && (
            <div className="space-y-6 animate-fade-in">
              {/* Header & Couple Picker */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-1">
                    Post-Production Tracker &bull; Alur Karya
                  </span>
                  <h3 className="font-serif text-xl text-slate-900 font-bold">
                    Status Editing Foto &amp; Video Klien
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Perbarui tahapan editing karya dan kirimkan laporan progres langsung ke WhatsApp pengantin.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={activePostProdBooking?.id || ""}
                    onChange={(e) => setSelectedPostProdBookingId(e.target.value)}
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

              {activePostProdBooking ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-amber-900 block text-base">
                        Karya Dokumentasi: {activePostProdBooking.coupleName}
                      </span>
                      <span className="text-xs text-amber-800">
                        Tanggal Acara: {activePostProdBooking.eventDate} &bull; Paket: {activePostProdBooking.packageName} &bull; WA: {activePostProdBooking.whatsapp}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendPostProdViaFonnte}
                      disabled={sendingPostProdWa}
                      className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
                    >
                      {sendingPostProdWa ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirim Laporan Progres ke WA Klien</span>
                        </>
                      )}
                    </button>
                  </div>

                  {postProdWaStatus && (
                    <div className={`p-3 rounded-xl text-xs font-semibold ${
                      postProdWaStatus.includes("berhasil") ? "bg-emerald-50 text-emerald-900 border border-emerald-300" : "bg-rose-50 text-rose-900 border border-rose-300"
                    }`}>
                      {postProdWaStatus}
                    </div>
                  )}

                  {/* 8-Stage Editing Workflow Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Stage 1: Backup RAW */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-amber-600" />
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">1. Backup File Mentah (RAW)</h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          currentPostProdProgress.backupStatus === "Selesai" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {currentPostProdProgress.backupStatus}
                        </span>
                      </div>
                      <select
                        value={currentPostProdProgress.backupStatus}
                        onChange={(e) => handleUpdateCurrentPostProd("backupStatus", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-600"
                      >
                        <option value="Selesai">Selesai (Dual Backup SSD &amp; Cloud)</option>
                        <option value="Sedang Berjalan">Sedang Proses Transfer</option>
                        <option value="Belum">Belum Mulai</option>
                      </select>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tautan Google Drive RAW / Preview</label>
                        <input
                          type="text"
                          value={currentPostProdProgress.driveLink}
                          onChange={(e) => handleUpdateCurrentPostProd("driveLink", e.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    {/* Stage 2: Seleksi 40 Foto Klien */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">2. Seleksi Foto Klien</h4>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {currentPostProdProgress.photoSelectionStatus}
                        </span>
                      </div>
                      <select
                        value={currentPostProdProgress.photoSelectionStatus}
                        onChange={(e) => handleUpdateCurrentPostProd("photoSelectionStatus", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-600"
                      >
                        <option value="40 Foto Siap Retouch">40 Foto Sudah Dipilih Klien</option>
                        <option value="Menunggu Pilihan Klien">Menunggu Klien Memilih Foto</option>
                        <option value="Belum Mulai">Tautan Seleksi Belum Dikirim</option>
                      </select>
                      <p className="text-[11px] text-slate-500">
                        Klien memilih 40 foto favorit melalui drive/galeri untuk dipoles secara eksklusif.
                      </p>
                    </div>

                    {/* Stage 3: Retouch & Color Grading Foto */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">3. Retouch &amp; Color Grading Foto</h4>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {currentPostProdProgress.photoEditStatus}
                        </span>
                      </div>
                      <select
                        value={currentPostProdProgress.photoEditStatus}
                        onChange={(e) => handleUpdateCurrentPostProd("photoEditStatus", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-600"
                      >
                        <option value="Selesai 100%">Selesai 100% (High-Res Ready)</option>
                        <option value="Proses Retouch (50%)">Sedang Proses Retouch (50%)</option>
                        <option value="Dalam Antrean">Dalam Antrean Editor Foto</option>
                      </select>
                      <p className="text-[11px] text-slate-500">
                        Polesan kulit natural, pencahayaan sinematik, dan tone warna khas Studio Lumenia.
                      </p>
                    </div>

                    {/* Stage 4: Video Editing Teaser & Film */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Film className="w-4 h-4 text-amber-600" />
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">4. Video Editing Teaser &amp; Film</h4>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {currentPostProdProgress.videoEditStatus}
                        </span>
                      </div>
                      <select
                        value={currentPostProdProgress.videoEditStatus}
                        onChange={(e) => handleUpdateCurrentPostProd("videoEditStatus", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-600"
                      >
                        <option value="Selesai 100%">Selesai 100% (Teaser &amp; Full Movie)</option>
                        <option value="Color Grading &amp; Audio">Color Grading &amp; Penataan Musik Audio</option>
                        <option value="Rough Cut">Pemotongan Skenario Kasar (Rough Cut)</option>
                        <option value="Dalam Antrean">Dalam Antrean Video Editor</option>
                      </select>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tautan Pratinjau Video (YouTube/Drive)</label>
                        <input
                          type="text"
                          value={currentPostProdProgress.videoPreviewLink}
                          onChange={(e) => handleUpdateCurrentPostProd("videoPreviewLink", e.target.value)}
                          placeholder="https://youtu.be/..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    {/* Stage 5: Cetak Album Linen */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-600" />
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">5. Cetak Album &amp; Boks Kayu</h4>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          {currentPostProdProgress.albumStatus}
                        </span>
                      </div>
                      <select
                        value={currentPostProdProgress.albumStatus}
                        onChange={(e) => handleUpdateCurrentPostProd("albumStatus", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-600"
                      >
                        <option value="Siap Kirim">Siap Kirim / Di Studio</option>
                        <option value="Sedang Dicetak">Sedang Dicetak di Lab Cetak</option>
                        <option value="Masuk Antrean Cetak">Layout Selesai, Masuk Antrean</option>
                        <option value="Belum Mulai">Menunggu Final Retouch</option>
                      </select>
                      <p className="text-[11px] text-slate-500">
                        Album linen handmade 20x30 cm dengan kertas foto lustre anti-sidik jari.
                      </p>
                    </div>

                    {/* Stage 6: Pengiriman Paket & Resi */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-amber-600" />
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">6. Pengiriman Paket &amp; Resi</h4>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Kurir &amp; Nomor Resi</label>
                        <input
                          type="text"
                          value={currentPostProdProgress.shippingResi}
                          onChange={(e) => handleUpdateCurrentPostProd("shippingResi", e.target.value)}
                          placeholder="JNE / Lion Parcel / Paxel: 882910..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Catatan Tambahan untuk Pasangan</label>
                        <input
                          type="text"
                          value={currentPostProdProgress.notes}
                          onChange={(e) => handleUpdateCurrentPostProd("notes", e.target.value)}
                          placeholder="Flashdisk kayu dikemas dengan segel lilin..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                  Belum ada data reservasi untuk melacak status editing foto dan video.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: KATALOG ADD-ON & ESTIMASI HPP (INTERAKTIF & BISA DIKLIK) */}
          {activeTab === "addons" && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-1">
                    Handler Class Model &bull; Service Catalog &amp; Margin Simulator
                  </span>
                  <h3 className="font-serif text-2xl text-slate-900 font-bold mb-1">
                    Katalog Layanan Tambahan (Add-on) &amp; Estimasi HPP
                  </h3>
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    Setiap kartu dapat <strong>diklik</strong> untuk membuka simulator margin laba, mengedit harga jual, dan melihat rincian biaya kru operasional.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddAddonModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Tambah Layanan Add-on</span>
                </button>
              </div>

              {/* Add-on Interactive Clickable Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addonsList.map((addon) => {
                  const grossProfit = addon.price - addon.hpp;
                  const marginPercent = addon.price > 0 ? Math.round((grossProfit / addon.price) * 100) : 0;

                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleOpenSimulator(addon)}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 cursor-pointer group hover:border-amber-500 hover:shadow-md transition-all relative overflow-hidden"
                    >
                      {/* Top Action Prompt */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {addon.category}
                            </span>
                            <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-1 group-hover:underline">
                              <Sliders className="w-3 h-3" />
                              <span>Klik untuk Simulasi &amp; Edit</span>
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-base mt-2 group-hover:text-amber-800 transition-colors">
                            {addon.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">{addon.description}</p>
                        </div>
                      </div>

                      {/* Financial Metrics Strip */}
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
                            Rp {addon.hpp.toLocaleString("id-ID")}
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

          {/* TAB 7: ANALYTIC KONVERSI (DIAGRAM BATANG & DIAGRAM DONAT) */}
          {activeTab === "analytic" && (
            <div className="space-y-6">
              
              {/* 1. DIAGRAM BATANG VERTIKAL: Funnel Konversi 5 Langkah Reservasi */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-amber-700 font-bold">
                      Funnel Analytics
                    </span>
                    <h3 className="font-serif text-2xl text-slate-900 font-bold mt-0.5">
                      Diagram Batang: Tingkat Penyelesaian Formulir (5 Langkah)
                    </h3>
                  </div>
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Grafik konversi perjalanan calon pengantin mulai dari memilih tanggal hingga mengunggah bukti transfer tanda jadi.
                </p>

                {/* Vertical Visual Bar Funnel */}
                <div className="grid grid-cols-5 gap-2 sm:gap-4 items-end h-64 pt-8 pb-4 border-b border-slate-200 px-2 sm:px-6">
                  {[
                    { label: "1. Data & Tanggal", rate: 100, drop: "Masuk 100%" },
                    { label: "2. Suasana", rate: 94, drop: "Drop -6%" },
                    { label: "3. Paket & Lokasi", rate: 86, drop: "Drop -8%" },
                    { label: "4. Hold 30m", rate: 78, drop: "Drop -8%" },
                    { label: "5. Slip DP", rate: 70, drop: "Closing 70%" },
                  ].map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center h-full justify-end group">
                      {/* Top Percentage Badge */}
                      <span className="text-xs font-bold text-slate-800 mb-2 group-hover:scale-110 transition-transform">
                        {step.rate}%
                      </span>
                      {/* The Bar */}
                      <div className="w-full max-w-[54px] rounded-t-xl bg-slate-100 flex items-end overflow-hidden h-full">
                        <div
                          className="w-full rounded-t-xl bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-700 group-hover:to-amber-500 transition-all duration-700 shadow-sm"
                          style={{ height: `${step.rate}%` }}
                        />
                      </div>
                      {/* Step Name */}
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-2 text-center truncate max-w-full">
                        {step.label}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">{step.drop}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. DIAGRAM DONAT: Distribusi Preferensi Suasana Visual (Mood) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-amber-700 font-bold">
                      Aesthetic Mood Analytics
                    </span>
                    <h3 className="font-serif text-2xl text-slate-900 font-bold mt-0.5">
                      Diagram Donat: Preferensi Konsep Visual Pasangan
                    </h3>
                  </div>
                  <PieChart className="w-6 h-6 text-amber-600" />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-4">
                  {/* SVG Donut Ring */}
                  <div className="relative w-44 h-44 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      {/* Background Track */}
                      <circle cx="60" cy="60" r="48" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                      
                      {/* Khidmat: 45% (45% of 301.59 = 135.7) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="transparent"
                        stroke="#b45309"
                        strokeWidth="20"
                        strokeDasharray="135.7 301.59"
                        strokeDashoffset="0"
                        className="transition-all duration-700"
                      />
                      {/* Elegan & Adat: 35% (35% of 301.59 = 105.5) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="20"
                        strokeDasharray="105.5 301.59"
                        strokeDashoffset="-135.7"
                        className="transition-all duration-700"
                      />
                      {/* Candid & Santai: 20% (20% of 301.59 = 60.3) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray="60.3 301.59"
                        strokeDashoffset="-241.2"
                        className="transition-all duration-700"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-2xl font-serif font-bold text-slate-900">45%</span>
                      <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Khidmat</span>
                    </div>
                  </div>

                  {/* Donut Legend Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full text-xs">
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-300">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-amber-700" />
                        <span className="font-bold text-amber-950">Khidmat &bull; 45%</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Fokus pada restu orang tua, doa keluarga, dan heningnya prosesi ijab kabul.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="font-bold text-amber-900">Elegan &amp; Adat &bull; 35%</span>
                      </div>
                      <p className="text-[11px] text-amber-700">
                        Busana adat Jawa, kain tradisional, serta pose editorial yang megah.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="font-bold text-emerald-950">Candid &amp; Santai &bull; 20%</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Tawa lepas, interaksi natural, dan momen spontan bersama sahabat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: AUDIT TRAIL LOG */}
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

          {/* TAB 9: CMS PENGATURAN FORM */}
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

          {/* TAB 10: LAPORAN PEMBUKUAN */}
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
          <div
            onClick={() => setSelectedCalendarDay(null)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto animate-slide-left">
              
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

                        <div>
                          <h4 className="font-serif text-lg font-bold text-slate-900">{b.coupleName}</h4>
                          <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{b.whatsapp}</span>
                          </div>
                        </div>

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

                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInvoiceBookingId(b.id);
                                setActiveTab("invoice");
                                setSelectedCalendarDay(null);
                              }}
                              className="py-2 px-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Receipt className="w-3.5 h-3.5 text-slate-600" />
                              <span>Invoice</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRundownBookingId(b.id);
                                setActiveTab("rundown");
                                setSelectedCalendarDay(null);
                              }}
                              className="py-2 px-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                              <span>Rundown</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPostProdBookingId(b.id);
                                setActiveTab("postprod");
                                setSelectedCalendarDay(null);
                              }}
                              className="py-2 px-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Film className="w-3.5 h-3.5 text-slate-600" />
                              <span>Editing</span>
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

      {/* MODAL SIMULATOR HPP & MARGIN LABA (INTERAKTIF SAAT KLIK ADD-ON) */}
      {selectedSimulatorAddon && (
        <div
          onClick={() => setSelectedSimulatorAddon(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Simulator Margin &amp; Biaya: {selectedSimulatorAddon.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSimulatorAddon(null)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Profit Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Harga Jual</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    Rp {simPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimasi HPP</span>
                  <span className="font-semibold text-slate-600 text-sm mt-0.5 block">
                    Rp {simHpp.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Laba Bersih</span>
                  <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
                    Rp {(simPrice - simHpp).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Margin Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Margin Keuntungan Studio:</span>
                  <span className="text-emerald-700">
                    {simPrice > 0 ? Math.round(((simPrice - simHpp) / simPrice) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, simPrice > 0 ? ((simPrice - simHpp) / simPrice) * 100 : 0))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sliders / Inputs to Modify */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Harga Jual ke Klien (IDR)</span>
                  <span className="font-bold text-amber-800">Rp {simPrice.toLocaleString("id-ID")}</span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="10000000"
                  step="100000"
                  value={simPrice}
                  onChange={(e) => setSimPrice(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Estimasi Biaya HPP Tim/Alat (IDR)</span>
                  <span className="font-bold text-slate-800">Rp {simHpp.toLocaleString("id-ID")}</span>
                </div>
                <input
                  type="range"
                  min="200000"
                  max="8000000"
                  step="50000"
                  value={simHpp}
                  onChange={(e) => setSimHpp(Number(e.target.value))}
                  className="w-full accent-slate-800 cursor-pointer"
                />
              </div>

              {/* Breakdown Components */}
              {selectedSimulatorAddon.components && selectedSimulatorAddon.components.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Rincian Komponen Biaya HPP:
                  </span>
                  {selectedSimulatorAddon.components.map((c, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                      <span>• {c.name}</span>
                      <span className="font-mono font-medium">Rp {c.cost.toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedSimulatorAddon(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSimulatorChanges}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
              >
                Simpan Penyesuaian Harga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH ADD-ON BARU */}
      {isAddAddonModalOpen && (
        <div
          onClick={() => setIsAddAddonModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Tambah Layanan Add-on Baru</h3>
              <button onClick={() => setIsAddAddonModalOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewAddon} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Layanan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Photobooth Unlimited 3 Jam"
                  value={newAddonForm.name}
                  onChange={(e) => setNewAddonForm({ ...newAddonForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kategori</label>
                <select
                  value={newAddonForm.category}
                  onChange={(e) => setNewAddonForm({ ...newAddonForm, category: e.target.value as DynamicAddOn["category"] })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-600"
                >
                  <option value="Video">Video</option>
                  <option value="Photo">Photo</option>
                  <option value="Streaming">Streaming</option>
                  <option value="Output">Output / Cetak</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Harga Jual Klien (IDR)</label>
                  <input
                    type="number"
                    step="50000"
                    value={newAddonForm.price}
                    onChange={(e) => setNewAddonForm({ ...newAddonForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estimasi HPP (IDR)</label>
                  <input
                    type="number"
                    step="50000"
                    value={newAddonForm.hpp}
                    onChange={(e) => setNewAddonForm({ ...newAddonForm, hpp: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat fitur yang didapat..."
                  value={newAddonForm.description}
                  onChange={(e) => setNewAddonForm({ ...newAddonForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddAddonModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Tambah Add-on
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE / TABLET BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 no-print shadow-lg">
        <div className="flex items-center justify-around overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              activeTab === "overview" ? "text-amber-700 font-bold bg-amber-50" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("client")}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
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
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              activeTab === "invoice" ? "text-amber-700 font-bold bg-amber-50" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Receipt className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Invoice</span>
          </button>

          <button
            onClick={() => setActiveTab("rundown")}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              activeTab === "rundown" ? "text-amber-700 font-bold bg-amber-50" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Rundown</span>
          </button>

          <button
            onClick={() => setActiveTab("postprod")}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              activeTab === "postprod" ? "text-amber-700 font-bold bg-amber-50" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Film className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Editing</span>
          </button>

          <button
            onClick={() => setActiveTab("addons")}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              activeTab === "addons" ? "text-amber-700 font-bold bg-amber-50" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Add-on</span>
          </button>

          <button
            onClick={() => setActiveTab("analytic")}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              activeTab === "analytic" ? "text-amber-700 font-bold bg-amber-50" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Analytic</span>
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
