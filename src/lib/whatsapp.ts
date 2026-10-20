export interface SendWhatsAppParams {
  target: string;
  message: string;
  url?: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  response?: unknown;
  error?: string;
}

/**
 * Send WhatsApp message via Fonnte API Gateway
 */
export async function sendWhatsAppMessage({
  target,
  message,
  url,
}: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  const token = (process.env.FONNTE_TOKEN || "").trim();

  if (!token) {
    console.warn("FONNTE_TOKEN belum dikonfigurasi. Pengiriman WhatsApp dilewati.");
    return { success: false, error: "Token Fonnte belum dikonfigurasi" };
  }

  // Clean target number (remove spaces, dashes, parentheses)
  let cleanNumber = target.replace(/[^0-9]/g, "");
  if (cleanNumber.startsWith("0")) {
    cleanNumber = "62" + cleanNumber.slice(1);
  } else if (cleanNumber.startsWith("8")) {
    cleanNumber = "62" + cleanNumber;
  }

  if (cleanNumber.length < 9) {
    return { success: false, error: "Nomor WhatsApp tidak valid" };
  }

  try {
    const formData = new FormData();
    formData.append("target", cleanNumber);
    formData.append("message", message);
    formData.append("countryCode", "62");
    if (url) {
      formData.append("url", url);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("Fonnte API responded with error:", data);
      return { success: false, response: data, error: data?.reason || `HTTP ${res.status}` };
    }

    return { success: true, response: data };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error sending WhatsApp message via Fonnte:", err.message || err);
    return { success: false, error: err.message || String(error) };
  }
}

/**
 * Template: Notifikasi Hold Jadwal Baru ke Calon Pengantin
 */
export async function sendClientHoldConfirmation(booking: {
  coupleName: string;
  whatsapp: string;
  eventDate: string;
  packageName: string;
  bookingCode: string;
  totalPrice?: number;
  downPayment?: number;
}) {
  const dpAmount = booking.downPayment || 2000000;
  const message =
    `*KONFIRMASI RESERVASI JADWAL — STUDIO LUMENIA*\n\n` +
    `Halo Kak *${booking.coupleName}*,\n` +
    `Terima kasih telah memilih Studio Lumenia untuk mengabadikan momen istimewa kalian.\n\n` +
    `Jadwal acara kalian telah berhasil kami tahan sementara:\n` +
    `• *Tanggal Acara*: ${booking.eventDate}\n` +
    `• *Paket Pilihan*: ${booking.packageName}\n` +
    `• *Kode Booking*: ${booking.bookingCode}\n` +
    `• *Nilai Tanda Jadi (DP)*: Rp ${dpAmount.toLocaleString("id-ID")}\n\n` +
    `*Instruksi Pembayaran Transfer Bank:*\n` +
    `1. Bank BCA: *8030588219* a.n. Ivan / Bylumenia Studio\n` +
    `2. Bank Mandiri: *1360018829102* a.n. Ivan / Bylumenia Studio\n\n` +
    `Slot tanggal ini ditahan selama *30 menit*. Silakan selesaikan pembayaran dan unggah bukti transfer di website agar tanggal kalian resmi terkunci di kalender kami.\n\n` +
    `Jika ada pertanyaan, Kakak bisa langsung membalas pesan ini. Terima kasih! ✨`;

  return sendWhatsAppMessage({ target: booking.whatsapp, message });
}

/**
 * Template: Notifikasi Booking Baru Masuk ke WhatsApp Owner/Admin
 */
export async function sendAdminNewHoldAlert(booking: {
  coupleName: string;
  whatsapp: string;
  eventDate: string;
  packageName: string;
  bookingCode: string;
  eventLocation?: string;
  downPayment?: number;
}) {
  const adminNumber = process.env.FONNTE_ADMIN_PHONE || process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6287777357373";
  const dpAmount = booking.downPayment || 2000000;
  const message =
    `🔔 *NOTIFIKASI: RESERVASI BARU MASUK*\n\n` +
    `Ada calon pengantin baru yang melakukan hold jadwal di website Studio Lumenia:\n\n` +
    `• *Pasangan*: ${booking.coupleName}\n` +
    `• *Tanggal Acara*: ${booking.eventDate}\n` +
    `• *Paket*: ${booking.packageName}\n` +
    `• *Lokasi*: ${booking.eventLocation || "Semarang & Sekitarnya"}\n` +
    `• *Kode Booking*: ${booking.bookingCode}\n` +
    `• *Nominal DP*: Rp ${dpAmount.toLocaleString("id-ID")}\n` +
    `• *Kontak WA Klien*: https://wa.me/${booking.whatsapp.replace(/[^0-9]/g, "")}\n\n` +
    `Status saat ini: *Menunggu Unggah Slip Transfer (Hold 30 Menit)*.`;

  return sendWhatsAppMessage({ target: adminNumber, message });
}

/**
 * Template: Notifikasi Bukti Transfer Diunggah ke Admin
 */
export async function sendAdminProofAlert(booking: {
  coupleName: string;
  whatsapp: string;
  eventDate: string;
  packageName: string;
  bookingCode: string;
  downPayment?: number;
  proofFileUrl?: string | null;
}) {
  const adminNumber = process.env.FONNTE_ADMIN_PHONE || process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6287777357373";
  const message =
    `📸 *BUKTI TRANSFER DP DITERIMA*\n\n` +
    `Pasangan *${booking.coupleName}* baru saja mengunggah slip bukti transfer tanda jadi:\n\n` +
    `• *Kode Booking*: ${booking.bookingCode}\n` +
    `• *Tanggal Acara*: ${booking.eventDate}\n` +
    `• *Paket*: ${booking.packageName}\n` +
    `• *WhatsApp Klien*: https://wa.me/${booking.whatsapp.replace(/[^0-9]/g, "")}\n\n` +
    `Silakan buka Dasbor Admin untuk memverifikasi dan mengunci tanggal resmi.`;

  return sendWhatsAppMessage({ target: adminNumber, message, url: booking.proofFileUrl || undefined });
}

/**
 * Template: Konfirmasi Resmi Tanggal Terkunci (DP Terverifikasi) ke Klien
 */
export async function sendClientBookingConfirmed(booking: {
  coupleName: string;
  whatsapp: string;
  eventDate: string;
  packageName: string;
  bookingCode: string;
  eventLocation?: string;
  totalPrice?: number;
  downPayment?: number;
}) {
  const total = booking.totalPrice || 6500000;
  const dp = booking.downPayment || 2000000;
  const sisa = Math.max(0, total - dp);

  const message =
    `🎉 *TANGGAL RESMI TERKUNCI — STUDIO LUMENIA*\n\n` +
    `Halo Kak *${booking.coupleName}*,\n` +
    `Pembayaran tanda jadi (DP) kalian telah berhasil kami verifikasi secara resmi.\n\n` +
    `*Ringkasan Jadwal & Reservasi:*\n` +
    `• *Kode SPK*: ${booking.bookingCode}\n` +
    `• *Tanggal Acara*: ${booking.eventDate}\n` +
    `• *Paket*: ${booking.packageName}\n` +
    `• *Lokasi*: ${booking.eventLocation || "Semarang"}\n` +
    `• *Total Kontrak*: Rp ${total.toLocaleString("id-ID")}\n` +
    `• *DP Diterima*: Rp ${dp.toLocaleString("id-ID")}\n` +
    `• *Sisa Pelunasan*: Rp ${sisa.toLocaleString("id-ID")} (Jatuh tempo H-7 acara)\n\n` +
    `Jadwal kalian kini 100% terkunci eksklusif. Tim kami hanya melayani satu acara di hari tersebut untuk memastikan hasil karya terbaik.\n\n` +
    `Tim kami akan segera menghubungi untuk koordinasi konsep dan rundown. Terima kasih atas kepercayaan Kakak kepada Studio Lumenia! ✨`;

  return sendWhatsAppMessage({ target: booking.whatsapp, message });
}

/**
 * Template: Pengiriman Lembar Invoice & Tagihan ke Klien
 */
export async function sendClientInvoice(
  booking: {
    coupleName: string;
    whatsapp: string;
    eventDate: string;
    packageName: string;
    bookingCode: string;
  },
  invoice: {
    invoiceNo?: string;
    invoiceNumber?: string;
    totalAmount: number;
    paidAmount?: number;
    downPaymentPaid?: number;
    remainingAmount?: number;
    remainingBalance?: number;
    dueDate?: string;
    items?: Array<{ name: string; price: number }>;
  }
) {
  const invNo = invoice.invoiceNo || invoice.invoiceNumber || `INV-${booking.bookingCode}`;
  const paid = invoice.paidAmount ?? invoice.downPaymentPaid ?? 0;
  const remaining =
    invoice.remainingAmount ??
    invoice.remainingBalance ??
    Math.max(0, invoice.totalAmount - paid);
  const due = invoice.dueDate || `${booking.eventDate} (H-7 Acara)`;

  let itemList = "";
  if (Array.isArray(invoice.items) && invoice.items.length > 0) {
    invoice.items.forEach((item, idx) => {
      itemList += `${idx + 1}. ${item.name} — Rp ${item.price.toLocaleString("id-ID")}\n`;
    });
  } else {
    itemList = `1. Paket Dokumentasi: ${booking.packageName} — Rp ${invoice.totalAmount.toLocaleString("id-ID")}\n`;
  }

  const message =
    `📄 *INVOICE TAGIHAN RESMI — STUDIO LUMENIA*\n` +
    `No: *${invNo}*\n\n` +
    `Yth. Kak *${booking.coupleName}*,\n` +
    `Berikut adalah rincian tagihan dokumentasi pernikahan Anda:\n\n` +
    `*Rincian Layanan:*\n` +
    `${itemList}\n` +
    `• *Total Biaya*: Rp ${invoice.totalAmount.toLocaleString("id-ID")}\n` +
    `• *Telah Dibayar (DP)*: Rp ${paid.toLocaleString("id-ID")}\n` +
    `• *Sisa Tagihan*: *Rp ${remaining.toLocaleString("id-ID")}*\n` +
    `• *Jatuh Tempo*: ${due}\n\n` +
    `*Rekening Pembayaran Resmi:*\n` +
    `• Bank BCA: *8030588219* a.n. Ivan / Bylumenia Studio\n` +
    `• Bank Mandiri: *1360018829102* a.n. Ivan / Bylumenia Studio\n\n` +
    `Silakan konfirmasi ke admin jika pelunasan telah dilakukan. Terima kasih! ✨`;

  return sendWhatsAppMessage({ target: booking.whatsapp, message });
}

/**
 * Template: Pengiriman Rundown Acara Hari-H ke Klien / Tim
 */
export async function sendClientRundown(
  booking: {
    coupleName: string;
    whatsapp: string;
    eventDate: string;
    packageName: string;
  },
  rundown:
    | Array<{ time: string; activity: string; pic?: string; notes?: string }>
    | {
        timeline?: string;
        items?: Array<{ time: string; activity: string; pic?: string; notes?: string }>;
        notes?: string;
      }
) {
  let timeline = "";

  if (Array.isArray(rundown)) {
    rundown.forEach((item) => {
      const picStr = item.pic ? ` (PIC: ${item.pic})` : "";
      const noteStr = item.notes ? `\n   ↳ Catatan: ${item.notes}` : "";
      timeline += `⏰ *${item.time}* — ${item.activity}${picStr}${noteStr}\n`;
    });
  } else if (rundown && typeof rundown === "object") {
    if (Array.isArray(rundown.items) && rundown.items.length > 0) {
      rundown.items.forEach((item) => {
        const picStr = item.pic ? ` (PIC: ${item.pic})` : "";
        const noteStr = item.notes ? `\n   ↳ Catatan: ${item.notes}` : "";
        timeline += `⏰ *${item.time}* — ${item.activity}${picStr}${noteStr}\n`;
      });
    } else if (typeof rundown.timeline === "string" && rundown.timeline.trim()) {
      timeline = rundown.timeline;
    }
  }

  if (!timeline) {
    timeline = "Timeline acara sedang disiapkan oleh tim dokumentasi Studio Lumenia.";
  }

  const customNotes =
    (!Array.isArray(rundown) && rundown?.notes) ||
    "• Kru dokumentasi hadir 30 menit sebelum jadwal makeup.\n• Dresscode kru: Serba Hitam Rapi & Bersepatu.\n• Untuk koordinasi di venue dapat langsung menghubungi admin Studio Lumenia.";

  const message =
    `📋 *RUNDOWN TIM DOKUMENTASI — STUDIO LUMENIA*\n` +
    `Acara: *${booking.coupleName}*\n` +
    `Tanggal: *${booking.eventDate}*\n` +
    `Paket: *${booking.packageName}*\n\n` +
    `*Susunan Timeline Dokumentasi:*\n` +
    `${timeline}\n\n` +
    `*Catatan Khusus Tim:*\n` +
    `${customNotes}\n\n` +
    `Semoga seluruh rangkaian acara berjalan khidmat, lancar, dan penuh kebahagiaan! Terima kasih! ✨`;

  return sendWhatsAppMessage({ target: booking.whatsapp, message });
}

/**
 * Template: Pengiriman Update Progres Produksi Foto & Video ke Klien
 */
export async function sendClientProductionUpdate(
  booking: {
    coupleName: string;
    whatsapp: string;
    eventDate: string;
    packageName: string;
  },
  progress: {
    backupStatus: string;
    photoSelectionStatus: string;
    photoEditStatus: string;
    videoEditStatus: string;
    albumStatus: string;
    driveLink?: string;
    videoPreviewLink?: string;
    shippingResi?: string;
    notes?: string;
  }
) {
  let message =
    `🎬 *UPDATE PROGRES KARYA DOKUMENTASI — STUDIO LUMENIA*\n\n` +
    `Halo Kak *${booking.coupleName}*,\n` +
    `Berikut adalah laporan progres pasca-produksi karya dokumentasi pernikahan kalian (*${booking.eventDate}*):\n\n` +
    `📸 *Status Foto:*\n` +
    `• Backup File Mentah (RAW): ${progress.backupStatus}\n` +
    `• Seleksi 40 Foto Terbaik: ${progress.photoSelectionStatus}\n` +
    `• Color Grading & Retouching: ${progress.photoEditStatus}\n\n` +
    `🎥 *Status Video:*\n` +
    `• Editing Video Teaser & Cinematic Film: ${progress.videoEditStatus}\n\n` +
    `📦 *Status Cetak & Pengiriman:*\n` +
    `• Album Linen & Kotak Kayu Eksklusif: ${progress.albumStatus}\n`;

  if (progress.shippingResi && progress.shippingResi.trim()) {
    message += `• Nomor Resi Pengiriman: *${progress.shippingResi.trim()}*\n`;
  }
  if (progress.driveLink && progress.driveLink.trim()) {
    message += `\n🔗 *Tautan Galeri Foto (Google Drive):*\n${progress.driveLink.trim()}\n`;
  }
  if (progress.videoPreviewLink && progress.videoPreviewLink.trim()) {
    message += `\n🎬 *Tautan Pratinjau Video (YouTube/Drive):*\n${progress.videoPreviewLink.trim()}\n`;
  }
  if (progress.notes && progress.notes.trim()) {
    message += `\n📝 *Catatan Tim Kreatif:*\n${progress.notes.trim()}\n`;
  }

  message += `\nTerima kasih atas kesabarannya menanti karya abadi ini. Jika ada pertanyaan, Kakak bisa langsung membalas pesan ini ya! ✨`;

  return sendWhatsAppMessage({ target: booking.whatsapp, message });
}
