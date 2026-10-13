import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const bookingId = formData.get("bookingId") as string;
    const file = formData.get("proofFile") as File | null;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Tanda identitas reservasi tidak ditemukan." },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Foto tanda bukti belum terbaca jelas, mari coba sematkan sekali lagi.",
        },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Catatan reservasi tidak ditemukan di buku jadwal kami." },
        { status: 404 }
      );
    }

    // Process file upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".jpg";
    const filename = `slip-${booking.bookingCode}-${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "proofs");

    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const proofFileUrl = `/uploads/proofs/${filename}`;

    // Update booking status to PENDING_VERIFY
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        proofFileUrl,
        status: "PENDING_VERIFY",
      },
    });

    // Record system log
    await prisma.systemLog.create({
      data: {
        bookingId: booking.id,
        actionType: "PROOF_UPLOADED",
        executedBy: "CLIENT",
        notes: `Klien menyematkan bukti bayar DP: ${filename}. Status bergeser ke PENDING_VERIFY.`,
      },
    });

    // Automated WhatsApp Notifications via Fonnte
    const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
    const curatorNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "087777357373";

    // 1. Send WA to Curator
    await sendWhatsAppMessage({
      target: curatorNumber,
      message:
        `*NOTIFIKASI RESERVASI MASUK — BYLUMENIA*\n\n` +
        `Ada tanda jadi baru dari pasangan *${booking.coupleName}*!\n\n` +
        `• Kode: *${booking.bookingCode}*\n` +
        `• Tanggal: *${booking.eventDate}*\n` +
        `• Paket: ${booking.packageName}\n` +
        `• Lokasi: ${booking.eventLocation}\n` +
        `• DP Masuk: Rp ${booking.downPayment.toLocaleString("id-ID")}\n` +
        `• WhatsApp Klien: https://wa.me/${booking.whatsapp.replace(/[^0-9]/g, "")}\n\n` +
        `Silakan verifikasi tanda jadi di Ruang Kurator Dasbor Internal.`,
    });

    // 2. Send WA to Client (Calon Pengantin)
    await sendWhatsAppMessage({
      target: booking.whatsapp,
      message:
        `Halo Kak *${booking.coupleName}*, salam hangat dari Bylumenia ✨\n\n` +
        `Terima kasih sudah mempercayakan hari paling berharga kalian kepada kami. ` +
        `Lembaran cerita dan bukti tanda jadi kalian untuk tanggal *${booking.eventDate}* (${booking.packageName}) ` +
        `sudah tersimpan aman di buku catatan kami.\n\n` +
        `Tim kurator kami sedang meninjau tanda jadi ini dan akan segera menyapa kalian ` +
        `untuk mulai mengobrol santai soal konsep visual nanti.\n\n` +
        `Kode Reservasi: *${booking.bookingCode}*\n` +
        `Salam cinta,\nTim Bylumenia Studio`,
    });

    // Prepare fallback manual WhatsApp curator link
    const waText = encodeURIComponent(
      `Halo Kurator Bylumenia,\n\nAda komitmen tanda jadi baru dari pasangan *${booking.coupleName}*!\n\n` +
      `• Kode: ${booking.bookingCode}\n` +
      `• Tanggal: ${booking.eventDate}\n` +
      `• Paket: ${booking.packageName}\n` +
      `• Lokasi: ${booking.eventLocation}\n` +
      `• DP Masuk: Rp ${booking.downPayment.toLocaleString("id-ID")}\n` +
      `• WhatsApp Klien: https://wa.me/${booking.whatsapp.replace(/[^0-9]/g, "")}`
    );
    const curatorWaUrl = `https://wa.me/${curatorNumber}?text=${waText}`;

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      curatorWaUrl,
      message:
        "Terima kasih sudah mempercayakan hari paling berharga kalian kepada kami. Lembaran cerita kalian sudah tersimpan aman di buku catatan kami. Tim kami sedang meninjau tanda jadi ini dan akan segera menyapa kalian lewat WhatsApp dalam hitungan jam untuk mulai mengobrol santai soal konsep visual nanti.",
    });
  } catch (error) {
    console.error("Error uploading proof:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Foto tanda bukti belum terbaca jelas, mari coba sematkan sekali lagi.",
      },
      { status: 500 }
    );
  }
}
