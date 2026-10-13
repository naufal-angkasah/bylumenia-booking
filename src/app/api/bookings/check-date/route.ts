import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { memoryStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // Format: YYYY-MM-DD

    if (!date) {
      return NextResponse.json(
        { available: false, message: "Mari tentukan tanggal hari bahagia kalian terlebih dahulu." },
        { status: 400 }
      );
    }

    const now = new Date();

    // Check existing booking for the given date via Prisma DB
    try {
      const existing = await prisma.booking.findFirst({
        where: {
          eventDate: date,
          status: {
            in: ["HOLD", "PENDING_VERIFY", "CONFIRMED"],
          },
        },
      });

      if (!existing) {
        return NextResponse.json({
          available: true,
          status: "AVAILABLE",
          message: "Semesta merestui hari itu, pintu jadwal kami masih terbuka luas untuk kalian.",
        });
      }

      // If existing has HOLD status, check if expired
      if (existing.status === "HOLD") {
        if (new Date(existing.holdExpiresAt) < now) {
          // Expired hold, auto-release!
          await prisma.booking.update({
            where: { id: existing.id },
            data: { status: "EXPIRED" },
          });

          await prisma.systemLog.create({
            data: {
              bookingId: existing.id,
              actionType: "AUTO_RELEASED",
              executedBy: "SYSTEM",
              notes: "Slot waktu 30 menit kedaluwarsa. Tanggal dibuka kembali untuk publik.",
            },
          });

          return NextResponse.json({
            available: true,
            status: "AVAILABLE",
            message: "Semesta merestui hari itu, pintu jadwal kami masih terbuka luas untuk kalian.",
          });
        } else {
          const remainingMinutes = Math.max(
            1,
            Math.ceil((new Date(existing.holdExpiresAt).getTime() - now.getTime()) / 60000)
          );
          return NextResponse.json({
            available: false,
            status: "HOLD",
            message: `Hari tersebut sedang dalam dekap penahanan sementara oleh pasangan lain (tersisa ${remainingMinutes} menit). Jika komitmen mereka terlepas, pintu akan kembali terbuka.`,
          });
        }
      }

      // Confirmed or Pending Verify
      return NextResponse.json({
        available: false,
        status: existing.status,
        message:
          "Pada hari bahagia tersebut, fokus lensa kami telah sepenuhnya dipersembahkan untuk satu pasangan lain. Kami mengundang kalian untuk memilih tanggal alternatif agar cerita kalian kami abadikan dengan utuh.",
      });
    } catch (dbErr) {
      console.warn("Prisma query failed, falling back to in-memory store:", dbErr);
      const fallbackResult = memoryStore.checkDate(date);
      return NextResponse.json(fallbackResult);
    }
  } catch (error) {
    console.error("Error checking date:", error);
    return NextResponse.json(
      { available: false, message: "Terjadi jeda sejenak saat memeriksa buku jadwal. Mari coba ketuk kembali." },
      { status: 500 }
    );
  }
}
