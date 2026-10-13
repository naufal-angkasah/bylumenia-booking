import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { memoryStore } from "@/lib/store";

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

    type BookingRecord = {
      id: string;
      coupleName: string;
      whatsapp: string;
      eventDate: string;
      packageName: string;
      bookingCode: string;
      eventLocation: string;
      status: string;
    };

    let booking: BookingRecord | null = null;
    let updatedBooking: BookingRecord | null = null;
    let newStatus = "CONFIRMED";
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

    try {
      booking = await prisma.booking.findUnique({
        where: { id },
      });

      if (booking) {
        updatedBooking = await prisma.booking.update({
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
      }
    } catch (dbErr) {
      console.warn("Prisma update failed, using in-memory store fallback:", dbErr);
    }

    if (!updatedBooking) {
      updatedBooking = memoryStore.updateStatus(id, action, notes);
      booking = updatedBooking;
    }

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, message: "Catatan booking tidak ditemukan." },
        { status: 404 }
      );
    }

    // Auto notify client if confirmed
    if (action === "CONFIRM" && booking?.whatsapp) {
      try {
        const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
        await sendWhatsAppMessage({
          target: booking.whatsapp,
          message:
            `*KABAR BAHAGIA DARI BYLUMENIA STUDIO* ✨\n\n` +
            `Halo Kak *${booking.coupleName}*,\n` +
            `Tanda jadi kalian telah berhasil diverifikasi secara sah oleh kurator kami. ` +
            `Jadwal hari pernikahan kalian pada tanggal *${booking.eventDate}* (${booking.packageName}) ` +
            `kini telah RESMI TERKUNCI di kalender semesta Bylumenia!\n\n` +
            `Kode SPK: *${booking.bookingCode}*\n` +
            `Lokasi: ${booking.eventLocation}\n\n` +
            `Sampai jumpa di hari kita menenun rasa dan mengabadikan momen abadi berdua. Terima kasih atas kepercayaan yang tulus ini.`,
        });
      } catch (waErr) {
        console.warn("WhatsApp notify error (non-fatal):", waErr);
      }
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
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
