export interface SendWhatsAppParams {
  target: string;
  message: string;
}

export async function sendWhatsAppMessage({
  target,
  message,
}: SendWhatsAppParams): Promise<{ success: boolean; response?: unknown; error?: string }> {
  const token = process.env.FONNTE_TOKEN;

  if (!token) {
    console.warn("FONNTE_TOKEN not set in environment variables. Skipping auto-message.");
    return { success: false, error: "Token not configured" };
  }

  // Clean target number (remove spaces, dashes)
  let cleanNumber = target.replace(/[^0-9]/g, "");
  if (cleanNumber.startsWith("0")) {
    cleanNumber = "62" + cleanNumber.slice(1);
  }

  try {
    const formData = new FormData();
    formData.append("target", cleanNumber);
    formData.append("message", message);
    formData.append("countryCode", "62");

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const data = await res.json();
    return { success: res.ok, response: data };
  } catch (error) {
    console.error("Error sending WhatsApp message via Fonnte:", error);
    return { success: false, error: String(error) };
  }
}
