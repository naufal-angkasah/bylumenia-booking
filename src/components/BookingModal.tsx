"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Volume2,
  VolumeX,
  Heart,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Copy,
  Clock,
  ExternalLink,
  Download,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { PACKAGES, MOOD_OPTIONS, PAYMENT_METHODS, PackageItem } from "@/lib/constants";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedPackage?: PackageItem | null;
}

export default function BookingModal({
  isOpen,
  onClose,
  preSelectedPackage,
}: BookingModalProps) {
  // Babak 1 to 5 per v3 Product Engineering Specification
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Babak I: Data Pasangan
  const [coupleName, setCoupleName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [checkingDate, setCheckingDate] = useState(false);
  const [dateStatus, setDateStatus] = useState<{
    available: boolean;
    message: string;
  } | null>(null);

  // Babak II: Suasana yang Diinginkan (Mood)
  const [selectedMood, setSelectedMood] = useState<string>("teduh");

  // Babak III: Paket & Lokasi (Paket & Lokasi)
  const [selectedPackage, setSelectedPackage] = useState<PackageItem>(
    preSelectedPackage || PACKAGES[1] // Default: Wedding Day
  );
  const [eventCity, setEventCity] = useState("Kota Semarang");
  const [venueName, setVenueName] = useState("");

  // Babak IV: Komitmen & Timer Minimalis (Payment Info & Hold)
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [downPaymentAmount, setDownPaymentAmount] = useState<number>(0);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState<"qris" | "bca" | "mandiri">("qris");
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1800); // 30 mins (29:59 countdown)
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Babak V: Unggah Bukti
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [curatorWaUrl, setCuratorWaUrl] = useState<string | null>(null);

  // Video Background & Sound State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoMuted, setVideoMuted] = useState(false);

  useEffect(() => {
    if (preSelectedPackage) {
      setSelectedPackage(preSelectedPackage);
    }
  }, [preSelectedPackage]);

  // Video & Quote mapping for the 5 Babak
  const stepVideos: Record<number, { src: string; chapter: string; title: string; quote: string }> = {
    1: {
      src: "/videos/story-01-heritage.mp4",
      chapter: "Langkah 1",
      title: "Data Pasangan",
      quote:
        "“Isi data singkat kalian agar kami bisa menyiapkan dokumentasi yang sesuai.”",
    },
    2: {
      src: "/videos/story-02-mazi.mp4",
      chapter: "Langkah 2",
      title: "Suasana yang Diinginkan",
      quote:
        "“Pilih suasana yang paling menggambarkan hari kalian.”",
    },
    3: {
      src: "/videos/hero-teaser.mp4",
      chapter: "Langkah 3",
      title: "Paket & Lokasi",
      quote:
        "“Pilih paket dokumentasi dan lokasi acara.”",
    },
    4: {
      src: "/videos/story-01-heritage.mp4",
      chapter: "Langkah 4",
      title: "Pembayaran Tanda Jadi",
      quote:
        "“Tanggal kalian kami tahan selama 30 menit. Selesaikan pembayaran tanda jadi sebelum waktu habis.”",
    },
    5: {
      src: "/videos/story-02-mazi.mp4",
      chapter: "Langkah 5",
      title: "Unggah Bukti",
      quote:
        "“Satu langkah lagi untuk mengamankan tanggal kalian.”",
    },
  };

  // Video Autoplay & Sound on Mount / Step Change
  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current) videoRef.current.pause();
      return;
    }

    if (videoRef.current) {
      const video = videoRef.current;
      video.muted = videoMuted;
      video.volume = 0.75;
      video.play().catch(() => {
        // Fallback to muted if browser restricted
        video.muted = true;
        setVideoMuted(true);
        video.play().catch(() => {});
      });
    }
  }, [step, isOpen, videoMuted]);

  const toggleModalAudio = () => {
    if (videoRef.current) {
      const next = !videoMuted;
      videoRef.current.muted = next;
      if (!next) videoRef.current.volume = 0.75;
      setVideoMuted(next);
    }
  };

  // Check eventDate availability in Babak I
  useEffect(() => {
    if (!eventDate) {
      setDateStatus(null);
      return;
    }

    let isMounted = true;
    setCheckingDate(true);
    setErrorMessage(null);

    fetch(`/api/bookings/check-date?date=${eventDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setDateStatus({
            available: data.available,
            message: data.message,
          });
          setCheckingDate(false);
        }
      })
      .catch(() => {
        if (isMounted) setCheckingDate(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventDate]);

  // 30-minute Countdown Timer (Babak IV & V)
  useEffect(() => {
    if (step < 4 || !holdExpiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((holdExpiresAt.getTime() - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, holdExpiresAt]);

  const formatTimerDigits = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToStep2 = () => {
    if (!coupleName.trim()) {
      setErrorMessage("Mohon isi nama pasangan.");
      return;
    }
    if (!whatsapp.trim() || whatsapp.length < 9) {
      setErrorMessage("Mohon isi nomor WhatsApp aktif agar tim kami dapat menghubungi kalian.");
      return;
    }
    if (!eventDate) {
      setErrorMessage("Silakan tentukan tanggal pernikahan yang direncanakan.");
      return;
    }
    if (dateStatus && !dateStatus.available) {
      setErrorMessage("Tanggal tersebut sudah dipesan. Mohon pilih tanggal lain.");
      return;
    }

    setErrorMessage(null);
    setStep(2);
  };

  // Step 2 Validation -> Proceed to Step 3
  const handleProceedToStep3 = () => {
    setErrorMessage(null);
    setStep(3);
  };

  // Step 3 Validation & Trigger Backend Silent Hold -> Proceed to Step 4
  const handleProceedToStep4 = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const fullLocation = venueName.trim()
        ? `${eventCity} — ${venueName.trim()}`
        : eventCity;

      const chosenMoodObj = MOOD_OPTIONS.find((m) => m.id === selectedMood);

      const res = await fetch("/api/bookings/create-hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupleName,
          whatsapp,
          eventDate,
          eventLocation: fullLocation,
          aestheticMood: chosenMoodObj?.title || "Khidmat",
          packageName: selectedPackage.name,
          totalPrice: selectedPackage.price,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Gagal mengamankan jadwal. Silakan coba lagi.");
        setIsSubmitting(false);
        return;
      }

      setBookingId(data.booking.id);
      setBookingCode(data.booking.bookingCode);
      setDownPaymentAmount(data.booking.downPayment);
      setHoldExpiresAt(new Date(data.expiresAt));
      setIsSubmitting(false);
      setStep(4);
    } catch {
      setErrorMessage("Terjadi kendala jaringan. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  // Step 4 Validation -> Proceed to Step 5 (Unggah Bukti)
  const handleProceedToStep5 = () => {
    setErrorMessage(null);
    setStep(5);
  };

  // Step 5 File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran berkas melebihi 5 MB. Mohon unggah file yang lebih kecil.");
      return;
    }

    setProofFile(file);
    setErrorMessage(null);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  // Final Step 5 Submit (Upload Proof & Complete)
  const handleSubmitReservation = async () => {
    if (!proofFile) {
      setErrorMessage("Mohon unggah bukti pembayaran tanda jadi.");
      return;
    }
    if (!bookingId) {
      setErrorMessage("Sesi belum terhubung. Silakan muat ulang halaman.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("bookingId", bookingId);
      formData.append("proofFile", proofFile);

      const res = await fetch("/api/bookings/upload-proof", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Bukti pembayaran belum terbaca. Silakan unggah ulang.");
        setIsSubmitting(false);
        return;
      }

      setCuratorWaUrl(data.curatorWaUrl);
      setIsSubmitting(false);
      setIsCompleted(true);

      // Gold & Champagne Confetti Celebration!
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#D4AF37", "#FFFFFF", "#C29B68"],
      });
    } catch {
      setErrorMessage("Bukti pembayaran belum terbaca. Silakan unggah ulang.");
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleDownloadQr = () => {
    const link = document.createElement("a");
    link.href = PAYMENT_METHODS.qris.mockQrUrl;
    link.download = `QRIS-Bylumenia-${bookingCode || "Booking"}.png`;
    link.target = "_blank";
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden glass-panel border border-gold-400/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row max-h-[94vh] lg:max-h-[90vh]">
        
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-black/60 text-neutral-300 hover:text-white hover:bg-black/90 transition-all border border-white/10"
          aria-label="Tutup Reservasi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Clean Video Showcase (100% UTUH TANPA TERTUTUP TEKS) */}
        <div className="relative w-full lg:w-5/12 h-[45vh] lg:h-auto overflow-hidden shrink-0 bg-obsidian-950 flex items-center justify-center">
          <video
            ref={videoRef}
            src={stepVideos[step].src}
            autoPlay
            loop
            muted={videoMuted}
            playsInline
            preload="auto"
            className="w-full h-full object-cover filter brightness-100 contrast-100 transition-opacity duration-700"
          />

          {/* Minimal Audio Toggle at Top-Left */}
          <button
            onClick={toggleModalAudio}
            type="button"
            className={`absolute top-4 left-4 z-30 p-2 sm:px-3 sm:py-1.5 rounded-full border backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-medium tracking-wide ${
              videoMuted
                ? "bg-black/60 border-white/20 text-neutral-300 hover:border-gold-400/50 hover:text-gold-300"
                : "bg-gold-400/20 border-gold-400/50 text-gold-400 shadow-[0_0_12px_rgba(212,175,55,0.4)]"
            }`}
            title={videoMuted ? "Putar Audio" : "Senyapkan Audio"}
          >
            {videoMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ketuk Suara</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">Audio Aktif ♪</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Interactive Step Form Content & Narrative Card */}
        <div className="w-full lg:w-7/12 flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-obsidian-900/95">
          <div>
            {/* Step Progress Indicators */}
            {!isCompleted && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-gold-400 tracking-wider font-semibold uppercase">
                    Langkah {step} dari 5
                  </span>
                  <span className="text-neutral-400 text-[11px]">
                    {step === 1 && "Identitas & Tanggal"}
                    {step === 2 && "Suasana Visual"}
                    {step === 3 && "Ruang Lingkup & Lokasi"}
                    {step === 4 && "Komitmen Jadwal"}
                    {step === 5 && "Tanda Jadi & Konfirmasi"}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-full transition-all duration-500 rounded-full ${
                        i <= step ? "bg-gold-400 shadow-[0_0_8px_#D4AF37]" : "bg-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Poetic Narrative Card (Di kartu bawah/kanan agar video di atas tidak tertutup) */}
            {!isCompleted && (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-gold-400/25 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] tracking-widest uppercase text-gold-400 font-semibold px-2.5 py-0.5 rounded-full bg-gold-400/10 border border-gold-400/25">
                    {stepVideos[step].chapter}
                  </span>
                  <span className="text-xs text-neutral-300 font-medium tracking-wide">
                    {stepVideos[step].title}
                  </span>
                </div>
                <p className="font-serif italic text-xs sm:text-sm text-neutral-200/95 leading-relaxed">
                  {stepVideos[step].quote}
                </p>
              </div>
            )}

            {/* Error Message Toast */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
                <span className="mt-0.5 text-red-400">&bull;</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* COMPLETED SUCCESS SCREEN (WAJIB PERSIS DENGAN V3) */}
            {isCompleted ? (
              <div className="py-6 sm:py-8 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-gold-400/20 text-gold-400 border border-gold-400/40 flex items-center justify-center mx-auto mb-5 shadow-[0_0_24px_rgba(212,175,55,0.3)]">
                  <Heart className="w-8 h-8 fill-gold-400" />
                </div>

                <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold mb-2 block">
                  Reservasi Diterima
                </span>

                <h3 className="font-serif text-2xl sm:text-3xl text-white font-light mb-4">
                  Cerita Kalian Telah Aman Bersama Kami
                </h3>

                {/* EXACT V3 SPECIFICATION CONFIRMATION TEXT */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-gold-400/25 mb-6 text-left">
                  <p className="font-serif text-sm sm:text-base text-neutral-200 leading-relaxed italic">
                    “Terima kasih sudah mempercayakan hari penting kalian kepada kami. Data reservasi sudah kami terima. Tim kami akan memeriksa bukti pembayaran dan menghubungi kalian lewat WhatsApp dalam beberapa jam untuk membahas konsep.”
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {curatorWaUrl ? (
                    <a
                      href={curatorWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto gold-gradient-btn px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all"
                    >
                      <span>Hubungi Kami via WhatsApp</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      onClick={onClose}
                      className="w-full sm:w-auto gold-gradient-btn px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl"
                    >
                      Selesai & Tutup Jendela
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-3 rounded-full text-xs uppercase tracking-wider text-neutral-300 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* BABAK I: TITIK TEMU & SKENARIO SEMESTA */}
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <h3 className="font-serif text-2xl text-white font-light mb-1">
                        Data Pasangan
                      </h3>
                      <p className="text-neutral-400 text-xs sm:text-sm font-light">
                        Tuliskan nama sepasang pengantin dan tanggal rencana pernikahan kalian.
                      </p>
                    </div>

                    <div className="space-y-3.5 pt-2">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                          Nama Lengkap Sepasang Pengantin <span className="text-gold-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={coupleName}
                          onChange={(e) => setCoupleName(e.target.value)}
                          placeholder="contoh: Ruth & Mas Nafi'i"
                          className="w-full px-4 py-3 rounded-xl bg-obsidian-950 border border-white/15 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-gold-400/60 focus:ring-1 focus:ring-gold-400/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                          Nomor WhatsApp Aktif <span className="text-gold-400">*</span>
                        </label>
                        <input
                          type="tel"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="contoh: 081234567890"
                          className="w-full px-4 py-3 rounded-xl bg-obsidian-950 border border-white/15 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-gold-400/60 focus:ring-1 focus:ring-gold-400/50"
                        />
                        <span className="text-[11px] text-neutral-400 mt-1 block">
                          Tim kami akan menghubungi kalian lewat nomor ini.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                          Pilih Tanggal Pernikahan <span className="text-gold-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-4 py-3 rounded-xl bg-obsidian-950 border border-white/15 text-white text-sm focus:outline-none focus:border-gold-400/60 focus:ring-1 focus:ring-gold-400/50 [color-scheme:dark]"
                          />
                        </div>

                        {/* Date Status Feedback (v3 Human Tone) */}
                        {checkingDate && (
                          <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping" />
                            <span>Mengecek ketersediaan tanggal...</span>
                          </div>
                        )}

                        {dateStatus && !checkingDate && (
                          <div
                            className={`mt-2 p-3 rounded-xl border text-xs leading-relaxed ${
                              dateStatus.available
                                ? "bg-gold-400/10 border-gold-400/40 text-gold-300"
                                : "bg-neutral-900 border-neutral-700 text-neutral-300"
                            }`}
                          >
                            {dateStatus.available ? (
                              <div className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                                <span>
                                  <strong>Tanggal tersedia.</strong> Jadwal kami masih terbuka untuk hari kalian.
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                                <span>
                                  Tanggal tersebut sudah dipesan pasangan lain. Silakan pilih tanggal alternatif.
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* BABAK II: MENENUN RASA & KETEDUHAN BARU (MOOD) */}
                {step === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <h3 className="font-serif text-2xl text-white font-light mb-1">
                        Pilihan Suasana Visual
                      </h3>
                      <p className="text-neutral-400 text-xs sm:text-sm font-light">
                        Bagaimana kalian membayangkan keteduhan dan keabadian hari bahagia ini?
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {MOOD_OPTIONS.map((mood) => {
                        const isSelected = selectedMood === mood.id;
                        return (
                          <div
                            key={mood.id}
                            onClick={() => setSelectedMood(mood.id)}
                            className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                              isSelected
                                ? "bg-gold-400/15 border-gold-400/60 shadow-[0_0_16px_rgba(212,175,55,0.2)]"
                                : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "border-gold-400 bg-gold-400 text-obsidian-950 font-bold"
                                  : "border-white/30"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-baseline justify-between mb-1">
                                <h4 className="font-serif text-lg text-white font-medium">
                                  {mood.title}
                                </h4>
                                <span className="text-[11px] text-gold-400/90 uppercase tracking-wider font-medium">
                                  {mood.subTitle}
                                </span>
                              </div>
                              <p className="text-neutral-300/80 text-xs font-light leading-relaxed">
                                {mood.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* BABAK III: RUANG LINGKUP & TEMPAT MERAJUT KASIH (PAKET & LOKASI) */}
                {step === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <h3 className="font-serif text-2xl text-white font-light mb-1">
                        Paket & Lokasi
                      </h3>
                      <p className="text-neutral-400 text-xs sm:text-sm font-light">
                        Pilih paket dokumentasi dan lokasi acara.
                      </p>
                    </div>

                    {/* Curated Package Scope Options */}
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                        Paket & Harga (Pasar Semarang)
                      </label>
                      <div className="grid grid-cols-1 gap-2.5">
                        {PACKAGES.map((pkg) => {
                          const isSelected = selectedPackage.id === pkg.id;
                          return (
                            <div
                              key={pkg.id}
                              onClick={() => setSelectedPackage(pkg)}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start justify-between gap-3 ${
                                isSelected
                                  ? "bg-gold-400/15 border-gold-400/60 shadow-[0_0_16px_rgba(212,175,55,0.2)]"
                                  : "bg-white/[0.02] border-white/10 hover:border-white/20"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? "border-gold-400 bg-gold-400 text-obsidian-950 font-bold"
                                      : "border-white/30"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <div>
                                  <h4 className="font-serif text-base text-white font-medium">
                                    {pkg.name}
                                  </h4>
                                  <p className="text-neutral-400 text-xs font-light mb-1">
                                    {pkg.tagline}
                                  </p>
                                  <span className="text-[11px] text-gold-400 font-mono">
                                    Rentang: {pkg.priceRange}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-serif text-lg text-white font-medium block">
                                  {pkg.priceFormatted}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Venue & City Location Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1">
                          Kota Pelaksanaan Acara
                        </label>
                        <select
                          value={eventCity}
                          onChange={(e) => setEventCity(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-obsidian-950 border border-white/15 text-white text-sm focus:outline-none focus:border-gold-400/60 [color-scheme:dark]"
                        >
                          <option value="Kota Semarang">Kota Semarang</option>
                          <option value="Kabupaten Semarang (Ungaran / Ambarawa)">Kab. Semarang (Ungaran / Ambarawa)</option>
                          <option value="Solo / Surakarta">Solo / Surakarta</option>
                          <option value="Yogyakarta / Magelang">Yogyakarta / Magelang</option>
                          <option value="Luar Kota Lainnya">Luar Kota Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1">
                          Nama Gedung / Ruang Perayaan
                        </label>
                        <input
                          type="text"
                          value={venueName}
                          onChange={(e) => setVenueName(e.target.value)}
                          placeholder="contoh: Plataran Heritage, Gumaya, atau Rumah"
                          className="w-full px-4 py-3 rounded-xl bg-obsidian-950 border border-white/15 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-gold-400/60"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* BABAK IV: KOMITMEN & TIMER MINIMALIS 29:59 */}
                {step === 4 && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <h3 className="font-serif text-2xl text-white font-light mb-1">
                        Komitmen & Tanda Jadi
                      </h3>
                      <p className="text-neutral-400 text-xs sm:text-sm font-light">
                        Tanggal ini kami khususkan untuk kalian.
                      </p>
                    </div>

                    {/* PURE DIGIT COUNTDOWN TIMER ONLY (V3 DIRECTIVE: ANGKA MURNI MENIT & DETIK SAJA) */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-gold-400/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-5 h-5 text-gold-400 animate-pulse" />
                        <span className="text-xs uppercase tracking-widest text-neutral-300 font-medium">
                          Waktu Tersisa
                        </span>
                      </div>
                      <div className="font-mono text-3xl sm:text-4xl font-bold tracking-widest text-gold-300 drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]">
                        {formatTimerDigits(remainingSeconds)}
                      </div>
                    </div>

                    {/* DP Amount Box with 3-digit unique code */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-obsidian-950 border border-white/15">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-xs uppercase tracking-wider text-neutral-400">
                          Tanda Komitmen Awal (DP 30%)
                        </span>
                        {bookingCode && (
                          <span className="text-[11px] font-mono text-gold-400/90 bg-gold-400/10 px-2 py-0.5 rounded-full border border-gold-400/20">
                            {bookingCode}
                          </span>
                        )}
                      </div>
                      <div className="font-serif text-3xl sm:text-4xl text-white font-bold my-1">
                        Rp {downPaymentAmount.toLocaleString("id-ID")}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-normal">
                        Termasuk 3 digit unik untuk mempercepat verifikasi pembayaran.
                      </p>
                    </div>

                    {/* Payment Channel Tabs: QRIS & Bank Transfer */}
                    <div>
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentTab("qris")}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                            selectedPaymentTab === "qris"
                              ? "bg-gold-400 text-obsidian-950 shadow-md"
                              : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                          }`}
                        >
                          QRIS Instan
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentTab("bca")}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                            selectedPaymentTab === "bca"
                              ? "bg-gold-400 text-obsidian-950 shadow-md"
                              : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                          }`}
                        >
                          BCA
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentTab("mandiri")}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                            selectedPaymentTab === "mandiri"
                              ? "bg-gold-400 text-obsidian-950 shadow-md"
                              : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                          }`}
                        >
                          Mandiri
                        </button>
                      </div>

                      {/* QRIS View */}
                      {selectedPaymentTab === "qris" && (
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center gap-4">
                          <div className="w-32 h-32 bg-white p-2 rounded-xl shrink-0 flex items-center justify-center">
                            <img
                              src={PAYMENT_METHODS.qris.mockQrUrl}
                              alt="QRIS Bylumenia"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <span className="text-xs uppercase tracking-wider text-gold-400 font-semibold block mb-1">
                              QRIS Seluruh Aplikasi
                            </span>
                            <p className="text-neutral-300 text-xs mb-3 font-light">
                              Pindai melalui GoPay, OVO, Dana, BCA Mobile, Livin, atau ShopeePay.
                            </p>
                            <button
                              type="button"
                              onClick={handleDownloadQr}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all border border-white/15"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh Gambar QR</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* BCA View */}
                      {selectedPaymentTab === "bca" && (
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5">
                              {PAYMENT_METHODS.bankBca.bankName}
                            </span>
                            <div className="font-mono text-xl text-white font-bold tracking-wider">
                              {PAYMENT_METHODS.bankBca.accountNumber}
                            </div>
                            <span className="text-xs text-neutral-300">
                              a.n. {PAYMENT_METHODS.bankBca.accountHolder}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(PAYMENT_METHODS.bankBca.accountNumber, "BCA")}
                            className="px-4 py-2 rounded-xl bg-gold-400/20 hover:bg-gold-400/30 text-gold-300 border border-gold-400/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedAccount === "BCA" ? "Disalin!" : "Salin Rekening"}</span>
                          </button>
                        </div>
                      )}

                      {/* Mandiri View */}
                      {selectedPaymentTab === "mandiri" && (
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5">
                              {PAYMENT_METHODS.bankMandiri.bankName}
                            </span>
                            <div className="font-mono text-xl text-white font-bold tracking-wider">
                              {PAYMENT_METHODS.bankMandiri.accountNumber}
                            </div>
                            <span className="text-xs text-neutral-300">
                              a.n. {PAYMENT_METHODS.bankMandiri.accountHolder}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(PAYMENT_METHODS.bankMandiri.accountNumber, "Mandiri")}
                            className="px-4 py-2 rounded-xl bg-gold-400/20 hover:bg-gold-400/30 text-gold-300 border border-gold-400/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedAccount === "Mandiri" ? "Disalin!" : "Salin Rekening"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* BABAK V: PENUTUP RESMI & UNGGAH BUKTI */}
                {step === 5 && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <h3 className="font-serif text-2xl text-white font-light mb-1">
                        Unggah Bukti Pembayaran
                      </h3>
                      <p className="text-neutral-400 text-xs sm:text-sm font-light">
                        Unggah tangkapan layar atau slip pembayaran untuk diverifikasi tim kami.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-obsidian-950 border border-white/15">
                      <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-3">
                        Unggah Bukti Pembayaran (.jpg, .png, .pdf maks 5 MB) <span className="text-gold-400">*</span>
                      </label>

                      <div className="relative border-2 border-dashed border-white/20 hover:border-gold-400/50 rounded-2xl p-6 text-center transition-all bg-white/[0.01]">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {proofPreview ? (
                          <div className="flex flex-col items-center">
                            <img
                              src={proofPreview}
                              alt="Pratinjau Bukti"
                              className="max-h-36 rounded-lg object-contain mb-2 border border-white/20"
                            />
                            <span className="text-xs text-gold-300">
                              {proofFile?.name} (Ketuk untuk ganti)
                            </span>
                          </div>
                        ) : proofFile ? (
                          <div className="flex flex-col items-center">
                            <span className="text-sm text-gold-300 font-medium mb-1">
                              Dokumen Terlampir: {proofFile.name}
                            </span>
                            <span className="text-xs text-neutral-400">Ketuk untuk mengganti file</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-gold-400 mb-2 stroke-[1.5]" />
                            <span className="text-xs sm:text-sm text-neutral-300 font-medium">
                              Ketuk atau seret slip transfer ke sini
                            </span>
                            <span className="text-[11px] text-neutral-500 mt-1">
                              Format: JPG, PNG, atau PDF (maksimal 5 MB)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gold-400/10 border border-gold-400/30 text-gold-300 text-xs leading-relaxed flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                      <span>
                        Tanda jadi kalian akan segera diverifikasi oleh tim kami, lalu kami menghubungi kalian lewat WhatsApp untuk membahas konsep.
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* FOOTER BUTTONS PER STEP */}
          {!isCompleted && (
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setStep((prev) => (Math.max(1, prev - 1) as 1 | 2 | 3 | 4 | 5));
                  }}
                  className="px-4 sm:px-5 py-2.5 rounded-full text-xs uppercase tracking-wider text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
              ) : (
                <div />
              )}

              {step === 1 && (
                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="gold-gradient-btn px-6 sm:px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all ml-auto"
                >
                  <span>Lanjutkan ke Suasana Visual</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={handleProceedToStep3}
                  className="gold-gradient-btn px-6 sm:px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all ml-auto"
                >
                  <span>Lanjutkan ke Ruang Lingkup Cerita</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={handleProceedToStep4}
                  disabled={isSubmitting}
                  className="gold-gradient-btn px-6 sm:px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all ml-auto disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Mengamankan Jadwal..." : "Kunci Jadwal & Menuju Komitmen"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 4 && (
                <button
                  type="button"
                  onClick={handleProceedToStep5}
                  className="gold-gradient-btn px-6 sm:px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all ml-auto"
                >
                  <span>AMANKAN HARI BAHAGIA KALIAN →</span>
                </button>
              )}

              {step === 5 && (
                <button
                  type="button"
                  onClick={handleSubmitReservation}
                  disabled={isSubmitting}
                  className="gold-gradient-btn px-6 sm:px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all ml-auto disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Memproses..." : "KIRIM RESERVASI"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
