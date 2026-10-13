import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { memoryStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pin = searchParams.get("pin");
    const expectedPin = process.env.ADMIN_PIN || "1928";

    if (pin !== expectedPin) {
      return NextResponse.json(
        { success: false, message: "Kunci akses kurator tidak sesuai." },
        { status: 401 }
      );
    }

    let bookings: Array<{
      id: string;
      bookingCode: string;
      coupleName: string;
      whatsapp: string;
      eventDate: string;
      eventLocation: string;
      aestheticMood?: string;
      packageName: string;
      totalPrice?: number;
      downPayment: number;
      proofFileUrl?: string | null;
      status: string;
      holdExpiresAt?: Date;
      createdAt?: Date;
      updatedAt?: Date;
      logs?: unknown[];
    }> = [];

    let logs: Array<{
      id: number;
      bookingId?: string | null;
      actionType: string;
      executedBy: string;
      notes?: string | null;
      loggedAt: Date;
      booking?: {
        bookingCode: string;
        coupleName: string;
      } | null;
    }> = [];

    try {
      // Auto-expire any stale holds via Prisma
      const now = new Date();
      await prisma.booking.updateMany({
        where: {
          status: "HOLD",
          holdExpiresAt: {
            lt: now,
          },
        },
        data: {
          status: "EXPIRED",
        },
      });

      bookings = await prisma.booking.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          logs: {
            orderBy: { loggedAt: "desc" },
            take: 5,
          },
        },
      });

      logs = await prisma.systemLog.findMany({
        orderBy: { loggedAt: "desc" },
        take: 50,
        include: {
          booking: {
            select: {
              bookingCode: true,
              coupleName: true,
            },
          },
        },
      });
    } catch (dbErr) {
      console.warn("Prisma admin fetch failed, falling back to in-memory store:", dbErr);
      bookings = memoryStore.getBookings();
      logs = memoryStore.getLogs();
    }

    // Metrics calculations
    const totalBookings = bookings.length;
    const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
    const pendingCount = bookings.filter((b) => b.status === "PENDING_VERIFY").length;
    const activeHoldCount = bookings.filter((b) => b.status === "HOLD").length;

    const totalRevenueConfirmed = bookings
      .filter((b) => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + (Number(b.downPayment) || 0), 0);

    return NextResponse.json({
      success: true,
      bookings,
      logs,
      metrics: {
        totalBookings,
        confirmedCount,
        pendingCount,
        activeHoldCount,
        totalRevenueConfirmed,
      },
    });
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat catatan kurasi." },
      { status: 500 }
    );
  }
}
