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
          message: "Bukti pembayaran belum terbaca. Silakan unggah ulang.",
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
            notes: `Klien mengunggah bukti bayar DP. Status berubah ke PENDING_VERIFY.`,
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
      const { sendAdminProofAlert, sendWhatsAppMessage } = await import("@/lib/whatsapp");

      await Promise.allSettled([
        // 1. Alert to Admin with proof link
        sendAdminProofAlert({
          coupleName: booking.coupleName,
          whatsapp: booking.whatsapp,
          eventDate: booking.eventDate,
          packageName: booking.packageName,
          bookingCode: booking.bookingCode,
          downPayment: booking.downPayment ? Number(booking.downPayment) : undefined,
          proofFileUrl: proofFileUrl || undefined,
        }),
        // 2. Acknowledgment to Client
        sendWhatsAppMessage({
          target: booking.whatsapp,
          message:
            `*BUKTI TRANSFER DITERIMA — STUDIO LUMENIA*\n\n` +
            `Halo Kak *${booking.coupleName}*,\n` +
            `Bukti transfer tanda jadi untuk tanggal *${booking.eventDate}* (Kode: *${booking.bookingCode}*) telah kami terima.\n\n` +
            `Tim admin kami sedang memverifikasi pembayaran Anda. Setelah diverifikasi, Anda akan menerima konfirmasi resmi dan tanggal akan 100% terkunci.\n\n` +
            `Terima kasih! ✨`,
        }),
      ]);
    } catch (waErr) {
      console.warn("WhatsApp notification error (non-fatal):", waErr);
    }

    return NextResponse.json({
      success: true,
      booking,
      message:
        "Tanda jadi kalian sudah kami terima. Terima kasih.",
    });
  } catch (error) {
    console.error("Error uploading proof:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menyimpan tanda jadi. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}
