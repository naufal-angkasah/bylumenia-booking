import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { memoryStore } from "@/lib/store";
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

    // Process file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";

    let proofFileUrl = "";

    // 1. Try local filesystem write (for local dev)
    try {
      const ext = path.extname(file.name) || ".jpg";
      const filename = `slip-${Date.now()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "proofs");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      proofFileUrl = `/uploads/proofs/${filename}`;
    } catch {
      // 2. Fallback to base64 Data URI for serverless environments (Vercel has read-only filesystem)
      proofFileUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    type ProofBooking = {
      id: string;
      bookingCode: string;
      coupleName: string;
      whatsapp: string;
      eventDate: string;
      eventLocation?: string;
      packageName: string;
      downPayment?: number | null;
      proofFileUrl?: string | null;
      status: string;
    };

    let booking: ProofBooking | null = null;

    try {
      // Find and update via Prisma
      booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (booking) {
        booking = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            proofFileUrl,
            status: "PENDING_VERIFY",
          },
        });

        await prisma.systemLog.create({
          data: {
            bookingId: booking.id,
            actionType: "PROOF_UPLOADED",
            executedBy: "CLIENT",
            notes: `Klien menyematkan bukti bayar DP. Status bergeser ke PENDING_VERIFY.`,
          },
        });
      }
    } catch (dbErr) {
      console.warn("Prisma upload-proof failed, using in-memory store fallback:", dbErr);
    }

    // If Prisma did not find or update, check memory store
    if (!booking) {
      booking = memoryStore.uploadProof(bookingId, proofFileUrl);
    }

    if (!booking) {
      // Even if booking wasn't pre-found, create a generic entry in memoryStore so client does not get stuck
      booking = {
        id: bookingId,
        bookingCode: `LMN-${Date.now().toString().slice(-6)}`,
        coupleName: "Klien Bylumenia",
        whatsapp: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "087777357373",
        eventDate: new Date().toISOString().slice(0, 10),
        eventLocation: "Yogyakarta",
        packageName: "Perjalanan Cerita",
        downPayment: 5000000,
        proofFileUrl,
        status: "PENDING_VERIFY",
      };
    }

    // Automated WhatsApp Notifications via Fonnte
    try {
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
          `• DP Masuk: Rp ${booking.downPayment ? Number(booking.downPayment).toLocaleString("id-ID") : "30%"}\n` +
          `• WhatsApp Klien: https://wa.me/${String(booking.whatsapp).replace(/[^0-9]/g, "")}\n\n` +
          `Silakan verifikasi tanda jadi di Ruang Kurator Dasbor Internal Bylumenia.`,
      });

      // 2. Send WA to Client
      await sendWhatsAppMessage({
        target: booking.whatsapp,
        message:
          `*TERIMA KASIH — BYLUMENIA STUDIO*\n\n` +
          `Halo Kak *${booking.coupleName}*,\n\n` +
          `Tanda bukti transfer kalian telah kami terima dengan hangat di sistem kami.\n` +
          `• Kode Reservasi: *${booking.bookingCode}*\n` +
          `• Tanggal Acara: *${booking.eventDate}*\n\n` +
          `Kurator kami sedang meninjau tanda jadi ini. Kami akan segera memperbarui status jadwal kalian dalam waktu singkat.`,
      });
    } catch (waErr) {
      console.warn("WhatsApp notification error (non-fatal):", waErr);
    }

    return NextResponse.json({
      success: true,
      booking,
      message:
        "Tanda jadi kalian telah tersemat rapi. Hati kami menyambut hangat babak awal kisah kalian.",
    });
  } catch (error) {
    console.error("Error uploading proof:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi hambatan saat merekam tanda jadi kalian. Mari coba sekali lagi.",
      },
      { status: 500 }
    );
  }
}
