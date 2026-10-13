"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Upload,
  AlertCircle,
  FileCheck,
  Send,
  Heart,
  MapPin,
  Phone,
  User,
  Download,
  Volume2,
  VolumeX,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  PACKAGES,
  PackageItem,
  MOOD_OPTIONS,
  PAYMENT_METHODS,
} from "@/lib/constants";
import { getGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar";

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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [coupleName, setCoupleName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("Semarang");
  const [venueName, setVenueName] = useState("");

  const [selectedMood, setSelectedMood] = useState<string>("teduh");
  const [selectedPackage, setSelectedPackage] = useState<PackageItem>(
    preSelectedPackage || PACKAGES[1] // Default: Hari Penyatuan Janji
  );

  // Real-time Date Availability State
  const [checkingDate, setCheckingDate] = useState(false);
  const [dateStatus, setDateStatus] = useState<{
    available: boolean;
    message: string;
  } | null>(null);

  // Hold Slot & Payment State
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [downPaymentAmount, setDownPaymentAmount] = useState<number>(0);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1800); // 30 mins

  // File Upload State
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [curatorWaUrl, setCuratorWaUrl] = useState<string | null>(null);

  // Copy Feedback
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Video Ref for Section Switches
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (preSelectedPackage) {
      setSelectedPackage(preSelectedPackage);
    }
  }, [preSelectedPackage]);

  // Handle Video Transition per Step
  const stepVideos: Record<number, { src: string; quote: string; title: string }> = {
    1: {
      src: "/videos/story-01-heritage.mp4",
      title: "Babak I • Titik Temu & Skenario Semesta",
      quote:
        "“Segala skenario semesta menuntun kita pada satu titik temu. Dari dua dunia yang berbeda, dua hati yang saling mencari, hingga akhirnya kita berlabuh dalam dekap restu yang sama.”",
    },
    2: {
      src: "/videos/story-02-mazi.mp4",
      title: "Babak II • Menenun Rasa & Keteduhan Baru",
      quote:
        "“Witing tresna jalaran soko kulino, witing mulyo jalaran wani rekoso. Di hadapan dua keluarga, bagaimana kalian ingin keteduhan ini diabadikan?”",
    },
    3: {
      src: "/videos/hero-teaser.mp4",
      title: "Babak III • Mengunci Komitmen & Tanda Jadi",
      quote:
        "“Kami hanya menerima satu pasangan dalam satu hari agar fokus semesta kami utuh. Hari bahagia ini kami tahan untuk kalian selama 30 menit.”",
    },
    4: {
      src: "/videos/story-01-heritage.mp4",
      title: "Ikrar Tersemat • Babak Abadi Dimulai",
      quote:
        "“Bismillah, kita mulai merangkai semesta kita sendiri, selamanya.”",
    },
  };

  const [videoMuted, setVideoMuted] = useState(false);

  // Play video with audio immediately when modal opens and on all steps
  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }

    if (videoRef.current) {
      const video = videoRef.current;
      video.muted = videoMuted;
      video.volume = 0.75;
      video.load();

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Modal unmuted autoplay blocked by browser:", err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            setVideoMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      }
    }
  }, [step, isOpen]);

  const toggleModalAudio = () => {
    if (videoRef.current) {
      const nextMuted = !videoMuted;
      videoRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoRef.current.volume = 0.75;
      }
      setVideoMuted(nextMuted);
    }
  };

  // Check date when eventDate changes
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
        if (isMounted) {
          setDateStatus({
            available: true,
            message: "Semesta merestui hari itu, pintu jadwal kami masih terbuka luas.",
          });
          setCheckingDate(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [eventDate]);

  // 30-minute Countdown Timer in Step 3
  useEffect(() => {
    if (step !== 3 || !holdExpiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((holdExpiresAt.getTime() - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        clearInterval(interval);
        setErrorMessage("Waktu penahanan 30 menit telah berakhir. Mari perbarui jadwal kalian kembali.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, holdExpiresAt]);

  if (!isOpen) return null;

  // Handle Step 1 to Step 2 validation
  const handleProceedToStep2 = () => {
    if (!coupleName.trim()) {
      setErrorMessage("Mari tuliskan nama sepasang pengantin yang akan berbahagia.");
      return;
    }
    if (!whatsapp.trim() || whatsapp.length < 9) {
      setErrorMessage("Mohon sematkan nomor WhatsApp aktif agar kurator kami dapat menyapa.");
      return;
    }
    if (!eventDate) {
      setErrorMessage("Silakan tentukan tanggal pernikahan yang direncanakan.");
      return;
    }
    if (dateStatus && !dateStatus.available) {
      setErrorMessage("Mohon pilih tanggal alternatif karena hari tersebut telah dikunci.");
      return;
    }

    setErrorMessage(null);
    setStep(2);
  };

  // Handle Step 2 to Step 3 (Trigger Hold Slot)
  const handleProceedToStep3 = async () => {
    setErrorMessage(null);
    setUploading(true);

    try {
      const fullLocation = venueName.trim()
        ? `${eventLocation} — ${venueName.trim()}`
        : eventLocation;

      const chosenMoodObj = MOOD_OPTIONS.find((m) => m.id === selectedMood);

      const res = await fetch("/api/bookings/create-hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupleName,
          whatsapp,
          eventDate,
          eventLocation: fullLocation,
          aestheticMood: chosenMoodObj?.title || "Teduh dan Khidmat",
          packageName: selectedPackage.name,
          totalPrice: selectedPackage.price,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Terjadi jeda sejenak. Mari coba ketuk kembali.");
        setUploading(false);
        return;
      }

      setBookingId(data.booking.id);
      setBookingCode(data.booking.bookingCode);
      setDownPaymentAmount(data.booking.downPayment);
      setHoldExpiresAt(new Date(data.expiresAt));
      setUploading(false);
      setStep(3);
    } catch {
      setErrorMessage("Terjadi kendala jaringan saat mengunci komitmen. Mari coba lagi.");
      setUploading(false);
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran berkas melebihi 5 MB. Mari sematkan foto yang lebih ringkas.");
      return;
    }

    setProofFile(file);
    setErrorMessage(null);

    // Pratinjau gambar jika tipe gambar
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  // Handle Step 3 Submit (Upload Proof)
  const handleSubmitReservation = async () => {
    if (!proofFile) {
      setErrorMessage("Foto tanda bukti belum terbaca jelas, mari coba sematkan sekali lagi.");
      return;
    }
    if (!bookingId) {
      setErrorMessage("Tanda identitas komitmen belum terhubung. Mari muat ulang sesi.");
      return;
    }

    setUploading(true);
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
        setErrorMessage(data.message || "Foto tanda bukti belum terbaca jelas, mari coba sematkan sekali lagi.");
        setUploading(false);
        return;
      }

      setCuratorWaUrl(data.curatorWaUrl);
      setUploading(false);
      setStep(4);

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#D4AF37", "#FFFFFF", "#C29B68"],
      });
    } catch {
      setErrorMessage("Foto tanda bukti belum terbaca jelas, mari coba sematkan sekali lagi.");
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(key);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 md:p-6 animate-fade-in">
      <div className="relative w-full max-w-5xl h-full sm:h-auto sm:max-h-[92vh] glass-panel border border-white/10 sm:rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 text-neutral-300 hover:text-white hover:bg-black/90 transition-all border border-white/10"
          aria-label="Tutup Reservasi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Cinematic Video Stream & Storytelling Quotes */}
        <div className="relative w-full lg:w-5/12 h-48 sm:h-64 lg:h-auto overflow-hidden shrink-0 flex flex-col justify-end p-6 lg:p-8 bg-obsidian-950">
          <video
            ref={videoRef}
            src={stepVideos[step].src}
            autoPlay
            loop
            muted={videoMuted}
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover filter brightness-70 contrast-105 transition-opacity duration-700"
          />

          {/* Vignette & Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent" />
          <div className="absolute inset-0 bg-black/30" />

          {/* Sound Toggle for Modal Video — Larger & More Visible */}
          <button
            onClick={toggleModalAudio}
            type="button"
            className={`absolute top-4 left-4 z-20 p-2.5 rounded-full border backdrop-blur-sm transition-all flex items-center gap-2 text-[11px] font-medium tracking-wide ${
              videoMuted
                ? "bg-black/60 border-white/20 text-neutral-300 hover:border-gold-400/50 hover:text-gold-300"
                : "bg-gold-400/20 border-gold-400/50 text-gold-400 shadow-[0_0_12px_rgba(212,175,55,0.3)]"
            }`}
            title={videoMuted ? "Putar Audio" : "Senyapkan Audio"}
          >
            {videoMuted ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">Ketuk untuk Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span className="hidden sm:inline">Audio Aktif ♪</span>
              </>
            )}
          </button>

          {/* Story Quote & Section Chapter */}
          <div className="relative z-10 text-white">
            <span className="inline-block text-[10px] tracking-widest uppercase text-gold-400 font-semibold px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-gold-400/20 mb-2">
              {stepVideos[step].title}
            </span>
            <p className="font-serif italic text-xs sm:text-sm lg:text-base text-neutral-200/95 font-light leading-relaxed">
              {stepVideos[step].quote}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Form Content */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-y-auto bg-obsidian-900/90 max-h-[calc(100vh-12rem)] lg:max-h-[92vh]">
          {/* Progress Indicator */}
          {step < 4 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span className="uppercase tracking-widest text-[11px] text-gold-400 font-medium">
                  Sesi {step} dari 3
                </span>
                <span className="text-[11px]">
                  {step === 1 && "Titik Temu & Jadwal"}
                  {step === 2 && "Rasa Visual & Paket"}
                  {step === 3 && "Kunci Komitmen & Tanda Jadi"}
                </span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-400 to-gold-300 transition-all duration-500 rounded-full"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error / Alert Message (Poetic & Humanized) */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-gold-400/10 border border-gold-400/30 text-gold-200 text-xs flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-gold-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ================= STEP 1: Titik Temu & Jadwal ================= */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal mb-1">
                  Membuka Lembaran Kisah Kalian
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-light">
                  Sematkan nama dan hari bahagia agar kami dapat memeriksa buku jadwal.
                </p>
              </div>

              {/* Couple Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold-400" />
                  <span>Nama Lengkap Pasangan</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Aristia & Ivan"
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-gold-400 focus:outline-none text-white text-sm placeholder-neutral-500 transition-colors"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gold-400" />
                  <span>Nomor WhatsApp Aktif</span>
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-gold-400 focus:outline-none text-white text-sm placeholder-neutral-500 transition-colors"
                />
              </div>

              {/* Event Date with Real-time Check */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-400" />
                  <span>Tanggal Hari Pernikahan</span>
                </label>
                <input
                  type="date"
                  value={eventDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-gold-400 focus:outline-none text-white text-sm transition-colors [color-scheme:dark]"
                />

                {/* Availability status badge */}
                {checkingDate && (
                  <p className="mt-2 text-xs text-neutral-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-gold-400 animate-spin" />
                    <span>Sedang memeriksa buku jadwal semesta...</span>
                  </p>
                )}
                {dateStatus && !checkingDate && (
                  <div
                    className={`mt-2 p-3 rounded-lg text-xs border ${
                      dateStatus.available
                        ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-950/30 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    <p className="flex items-center gap-1.5 font-light">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{dateStatus.message}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Location & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold-400" />
                    <span>Kota Acara</span>
                  </label>
                  <select
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-obsidian-850 border border-white/10 focus:border-gold-400 focus:outline-none text-white text-sm transition-colors"
                  >
                    <option value="Semarang">Semarang</option>
                    <option value="Solo / Surakarta">Solo / Surakarta</option>
                    <option value="Yogyakarta">Yogyakarta</option>
                    <option value="Salatiga & Magelang">Salatiga & Magelang</option>
                    <option value="Luar Kota / Destinasi Lain">Luar Kota / Destinasi Lain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">
                    Nama Gedung / Tempat (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Delman Resto / Ballroom"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-gold-400 focus:outline-none text-white text-sm placeholder-neutral-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: Rasa Visual & Paket ================= */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal mb-1">
                  Menenun Rasa & Memilih Paket
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-light">
                  Bagaimana kalian membayangkan keteduhan hari itu diabadikan?
                </p>
              </div>

              {/* Mood Visual Selector */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold-400 font-medium mb-3">
                  Pilih Suasana Visual (Mood):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MOOD_OPTIONS.map((mood) => {
                    const active = selectedMood === mood.id;
                    return (
                      <div
                        key={mood.id}
                        onClick={() => setSelectedMood(mood.id)}
                        className={`p-4 rounded-xl cursor-pointer border transition-all ${
                          active
                            ? "glass-panel-active border-gold-400 text-white"
                            : "glass-panel border-white/10 text-neutral-300 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-serif text-sm font-medium">
                            {mood.title}
                          </span>
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              active ? "border-gold-400 bg-gold-400" : "border-neutral-500"
                            }`}
                          >
                            {active && <Check className="w-2.5 h-2.5 text-black" />}
                          </span>
                        </div>
                        <p className="text-[10px] text-gold-400/90 mb-1">{mood.subTitle}</p>
                        <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                          {mood.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Package Selector */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold-400 font-medium mb-3">
                  Pilihan Paket Dokumentasi:
                </label>
                <div className="space-y-3">
                  {PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-4 rounded-xl cursor-pointer border transition-all flex items-center justify-between gap-4 ${
                          isSelected
                            ? "glass-panel-active border-gold-400/80 bg-gold-400/[0.08]"
                            : "glass-panel border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium text-white">
                              {pkg.name}
                            </span>
                            {pkg.recommended && (
                              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30">
                                Populer
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 font-light truncate">
                            {pkg.tagline}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-serif text-base sm:text-lg text-gold-300 font-medium">
                            {pkg.priceFormatted}
                          </span>
                          <p className="text-[10px] text-neutral-500">DP 30%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: Kunci Komitmen & Tanda Jadi ================= */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
                    Mengunci Komitmen Jadwal
                  </h3>
                  {/* Countdown Timer */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400/15 border border-gold-400/30 text-gold-300 text-xs">
                    <Clock className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
                    <span className="font-mono font-medium">
                      {formatCountdown(remainingSeconds)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 font-light">
                  Slot tanggal {eventDate} telah kami tahan sementara untuk kalian.
                </p>
              </div>

              {/* Summary Card with 30% DP Calculation */}
              <div className="glass-panel p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between text-xs text-neutral-300 pb-2.5 mb-2.5 border-b border-white/10">
                  <div>
                    <span className="font-medium text-white">{selectedPackage.name}</span>
                    <span className="text-neutral-400"> &bull; {eventDate}</span>
                  </div>
                  <span className="font-serif text-sm text-neutral-300">
                    {selectedPackage.priceFormatted}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gold-400 font-medium uppercase tracking-wider block">
                      Tanda Jadi (DP 30% + Kode Unik):
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Termasuk 3 digit acak agar verifikasi otomatis
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-xl sm:text-2xl text-gold-300 font-semibold tracking-wide">
                      Rp {downPaymentAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Channels: Bank Transfer & QRIS */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Saluran Pembayaran Resmi:
                </p>

                {/* Bank BCA */}
                <div className="glass-panel p-3.5 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-blue-300 text-xs font-bold">
                      BCA
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">BCA &bull; a.n. {PAYMENT_METHODS.bankBca.accountHolder}</p>
                      <p className="font-mono text-sm text-white font-medium">
                        {PAYMENT_METHODS.bankBca.accountNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(PAYMENT_METHODS.bankBca.accountNumber, "bca")
                    }
                    className="p-2 rounded-lg bg-white/5 hover:bg-gold-400/20 text-neutral-300 hover:text-gold-300 transition-colors flex items-center gap-1 text-xs"
                  >
                    {copiedAccount === "bca" ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="text-[11px]">Salin</span>
                  </button>
                </div>

                {/* Bank Mandiri */}
                <div className="glass-panel p-3.5 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-900/40 border border-amber-500/30 flex items-center justify-center text-amber-300 text-xs font-bold">
                      MDR
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">Mandiri &bull; a.n. {PAYMENT_METHODS.bankMandiri.accountHolder}</p>
                      <p className="font-mono text-sm text-white font-medium">
                        {PAYMENT_METHODS.bankMandiri.accountNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(PAYMENT_METHODS.bankMandiri.accountNumber, "mandiri")
                    }
                    className="p-2 rounded-lg bg-white/5 hover:bg-gold-400/20 text-neutral-300 hover:text-gold-300 transition-colors flex items-center gap-1 text-xs"
                  >
                    {copiedAccount === "mandiri" ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="text-[11px]">Salin</span>
                  </button>
                </div>
              </div>

              {/* Upload Payment Slip */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium mb-2 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-gold-400" />
                  <span>Sematkan Foto Tanda Bukti Transfer (.jpg, .png, .pdf max 5 MB)</span>
                </label>

                <div className="relative border-2 border-dashed border-white/15 hover:border-gold-400/40 rounded-xl p-4 text-center cursor-pointer transition-colors bg-white/[0.01]">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {proofFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-gold-300">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium truncate max-w-xs">{proofFile.name}</span>
                      <span className="text-[10px] text-neutral-400">
                        ({(proofFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="py-2">
                      <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-1.5" />
                      <p className="text-xs text-neutral-300 font-light">
                        Ketuk untuk memilih foto slip transfer dari perangkat
                      </p>
                    </div>
                  )}
                </div>

                {proofPreview && (
                  <div className="mt-2.5 max-h-24 w-32 rounded-lg overflow-hidden border border-white/10 mx-auto">
                    <img
                      src={proofPreview}
                      alt="Pratinjau Slip"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 4: Success Confirmation Screen ================= */}
          {step === 4 && (
            <div className="py-6 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-gold-400/20 border border-gold-400/40 mx-auto flex items-center justify-center text-gold-400">
                <Heart className="w-8 h-8 fill-gold-400 text-gold-400" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-gold-400 font-medium">
                  Kode Reservasi: {bookingCode}
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-white font-normal mt-2 mb-4">
                  Terima Kasih, {coupleName}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed max-w-lg mx-auto">
                  Terima kasih sudah mempercayakan hari paling berharga kalian kepada kami.
                  Lembaran cerita kalian sudah tersimpan aman di buku catatan kami. Tim kami sedang
                  meninjau tanda jadi ini dan akan segera menyapa kalian lewat WhatsApp dalam hitungan jam
                  untuk mulai mengobrol santai soal konsep visual nanti.
                </p>
              </div>

              {/* Calendar Sync Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={getGoogleCalendarUrl({
                    title: `Hari Bahagia ${coupleName} • Bylumenia`,
                    description: `Paket: ${selectedPackage.name}\nKode Reservasi: ${bookingCode}\nBylumenia Studio`,
                    location: eventLocation,
                    dateStr: eventDate,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Simpan ke Google Calendar</span>
                </a>

                <button
                  onClick={() =>
                    downloadIcsFile({
                      title: `Hari Bahagia ${coupleName} • Bylumenia`,
                      description: `Paket: ${selectedPackage.name}\nKode Reservasi: ${bookingCode}\nBylumenia Studio`,
                      location: eventLocation,
                      dateStr: eventDate,
                    })
                  }
                  className="px-5 py-2.5 rounded-full bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 text-xs flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File Kalender (.ics)</span>
                </button>
              </div>

              {/* Direct WhatsApp button to curator */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                {curatorWaUrl && (
                  <a
                    href={curatorWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gold-gradient-btn px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-lg"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Sapa Kurator Bylumenia di WhatsApp</span>
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="glass-panel px-6 py-3 rounded-full text-xs text-neutral-300 hover:text-white uppercase tracking-wider"
                >
                  Tutup Jendela
                </button>
              </div>
            </div>
          )}

          {/* Bottom Action Navigation */}
          {step < 4 && (
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                  disabled={uploading}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
              ) : (
                <span />
              )}

              {step === 1 && (
                <button
                  onClick={handleProceedToStep2}
                  className="gold-gradient-btn px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Langkah Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 2 && (
                <button
                  onClick={handleProceedToStep3}
                  disabled={uploading}
                  className="gold-gradient-btn px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  {uploading ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Tahan Jadwal 30 Menit</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={handleSubmitReservation}
                  disabled={uploading || !proofFile}
                  className={`px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
                    proofFile && !uploading
                      ? "gold-gradient-btn shadow-glow hover:scale-105 active:scale-95"
                      : "bg-white/10 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Lembaran...</span>
                    </>
                  ) : (
                    <>
                      <span>Ikrarkan Jadwal &amp; Kirim Cerita Kami</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
