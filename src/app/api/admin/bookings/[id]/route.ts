import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { pin, action, notes } = body; // action: "CONFIRM" | "REJECT" | "RELEASE" | "EXTEND"
    const expectedPin = process.env.ADMIN_PIN || "1928";

    if (pin !== expectedPin) {
      return NextResponse.json(
        { success: false, message: "Kunci akses kurator tidak sah." },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Catatan booking tidak ditemukan." },
        { status: 404 }
      );
    }

    let newStatus = booking.status;
    let actionLogType = "ADMIN_UPDATE";

    if (action === "CONFIRM") {
      newStatus = "CONFIRMED";
      actionLogType = "CONFIRMED_BY_CURATOR";
    } else if (action === "REJECT") {
      newStatus = "REJECTED";
      actionLogType = "REJECTED_BY_CURATOR";
    } else if (action === "RELEASE") {
      newStatus = "EXPIRED";
      actionLogType = "MANUALLY_RELEASED";
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: newStatus,
      },
    });

    await prisma.systemLog.create({
      data: {
        bookingId: id,
        actionType: actionLogType,
        executedBy: "CURATOR_ADMIN",
        notes: notes || `Kurator memperbarui status menjadi ${newStatus}`,
      },
    });

    return NextResponse.json({
      success: true,
      booking: updated,
      message: `Status berhasil diubah menjadi ${newStatus}`,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memperbarui status." },
      { status: 500 }
    );
  }
}
