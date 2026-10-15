import { NextResponse } from "next/server";
import {
  sendWhatsAppMessage,
  sendClientBookingConfirmed,
  sendClientInvoice,
  sendClientRundown,
} from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin, action, target, message, booking, invoice, rundown } = body;

    const expectedPin = (process.env.ADMIN_PIN || "1928").trim();
    if (String(pin || "").trim() !== expectedPin) {
      return NextResponse.json(
        { success: false, message: "PIN admin tidak sah." },
        { status: 401 }
      );
    }

    if (action === "INVOICE" && booking && invoice) {
      const result = await sendClientInvoice(booking, invoice);
      return NextResponse.json({ success: result.success, response: result.response, error: result.error });
    }

    if (action === "CONFIRMED" && booking) {
      const result = await sendClientBookingConfirmed(booking);
      return NextResponse.json({ success: result.success, response: result.response, error: result.error });
    }

    if (action === "RUNDOWN" && booking && rundown) {
      const result = await sendClientRundown(booking, rundown);
      return NextResponse.json({ success: result.success, response: result.response, error: result.error });
    }

    if (!target || !message) {
      return NextResponse.json(
        { success: false, message: "Nomor target dan pesan harus diisi." },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage({ target, message });
    return NextResponse.json({
      success: result.success,
      response: result.response,
      error: result.error,
      message: result.success ? "Pesan WhatsApp berhasil dikirim via Fonnte." : "Gagal mengirim via Fonnte.",
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Admin WhatsApp Send Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Gagal memproses pesan WhatsApp." },
      { status: 500 }
    );
  }
}
