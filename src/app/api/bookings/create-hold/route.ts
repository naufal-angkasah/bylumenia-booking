import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { memoryStore } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      coupleName,
      whatsapp,
      eventDate,
      eventLocation,
      aestheticMood,
      packageName,
      totalPrice,
    } = body;

    if (!coupleName || !whatsapp || !eventDate || !packageName || !totalPrice) {
      return NextResponse.json(
        { success: false, message: "Mohon lengkapi untaian data agar cerita kalian dapat terangkum utuh." },
        { status: 400 }
      );
    }

    const now = new Date();

    // Generate unique booking code e.g. LMN-2610-849
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const dateFormatted = eventDate.replace(/-/g, "").slice(2, 6);
    const bookingCode = `LMN-${dateFormatted}-${randomSuffix}`;

    // Down payment: 30% + random unique 3-digit code (100 - 999)
    const baseDownPayment = Math.round(Number(totalPrice) * 0.3);
    const uniqueDigits = Math.floor(100 + Math.random() * 899);
    const downPayment = baseDownPayment + uniqueDigits;

    // 30 minutes hold
    const holdExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    type HoldBooking = {
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
      status: string;
      holdExpiresAt: Date;
    };

    let booking: HoldBooking | null = null;

    try {
      // 1. Verify date is not locked via Prisma
      const existing = await prisma.booking.findFirst({
        where: {
          eventDate,
          status: {
            in: ["HOLD", "PENDING_VERIFY", "CONFIRMED"],
          },
        },
      });

      if (existing) {
        if (existing.status === "HOLD" && new Date(existing.holdExpiresAt) < now) {
          // Auto-expire previous hold
          await prisma.booking.update({
            where: { id: existing.id },
            data: { status: "EXPIRED" },
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              message:
                "Tanggal tersebut baru saja dipesan pasangan lain. Silakan pilih tanggal alternatif atau hubungi tim kami.",
            },
            { status: 409 }
          );
        }
      }

      booking = await prisma.booking.create({
        data: {
          bookingCode,
          coupleName,
          whatsapp,
          eventDate,
          eventLocation: eventLocation || "Semarang",
          aestheticMood: aestheticMood || "Khidmat",
          packageName,
          totalPrice: Number(totalPrice),
          downPayment,
          status: "HOLD",
          holdExpiresAt,
        },
      });

      await prisma.systemLog.create({
        data: {
          bookingId: booking.id,
          actionType: "SLOT_HELD_30_MINUTES",
          executedBy: "CLIENT",
          notes: `Pasangan ${coupleName} menahan slot untuk tanggal ${eventDate}. DP Rp ${downPayment.toLocaleString("id-ID")}`,
        },
      });
    } catch (dbErr) {
      console.warn("Prisma write failed, using in-memory fallback store:", dbErr);
      booking = memoryStore.createHold({
        bookingCode,
        coupleName,
        whatsapp,
        eventDate,
        eventLocation: eventLocation || "Semarang",
        aestheticMood: aestheticMood || "Khidmat",
        packageName,
        totalPrice: Number(totalPrice),
        downPayment,
        proofFileUrl: null,
      });
    }

    // Try sending WhatsApp hold reminder if Fonnte is connected
    try {
      const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
      await sendWhatsAppMessage({
        target: whatsapp,
        message:
          `*KOMITMEN PENAHANAN JADWAL — BYLUMENIA STUDIO*\n\n` +
          `Halo Kak *${coupleName}*,\n` +
          `Slot perayaan kalian untuk tanggal *${eventDate}* telah kami tahan selama *30 menit*.\n\n` +
          `• Kode Booking: *${bookingCode}*\n` +
          `• Pilihan Paket: ${packageName}\n` +
          `• Nominal Tanda Jadi (DP 30%): *Rp ${downPayment.toLocaleString("id-ID")}*\n\n` +
          `Silakan selesaikan penyematan bukti transfer sebelum slot waktu berakhir agar hari bahagia ini terkunci sempurna.`,
      });
    } catch (waErr) {
      console.warn("WhatsApp dispatch warning (non-fatal):", waErr);
    }

    return NextResponse.json({
      success: true,
      booking,
      expiresAt: holdExpiresAt.toISOString(),
      message: "Hari bahagia ini kami tahan untuk kalian selama 30 menit ke depan dengan penuh kehangatan.",
    });
  } catch (error) {
    console.error("Error creating hold:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat reservasi. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
