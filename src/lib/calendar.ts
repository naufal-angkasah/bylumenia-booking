export interface CalendarEventParams {
  title: string;
  description: string;
  location: string;
  dateStr: string; // YYYY-MM-DD
}

export function getGoogleCalendarUrl({
  title,
  description,
  location,
  dateStr,
}: CalendarEventParams): string {
  // Full day event or 08:00 to 22:00
  const cleanDate = dateStr.replace(/-/g, "");
  const startParam = `${cleanDate}T080000`;
  const endParam = `${cleanDate}T220000`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startParam}/${endParam}`,
    details: description,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsContent({
  title,
  description,
  location,
  dateStr,
}: CalendarEventParams): string {
  const cleanDate = dateStr.replace(/-/g, "");
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bylumenia Visual Studio//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:bylumenia-${cleanDate}-${Date.now()}@bylumenia.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${cleanDate}T080000`,
    `DTEND:${cleanDate}T220000`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(params: CalendarEventParams) {
  const icsContent = generateIcsContent(params);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", `bylumenia-wedding-${params.dateStr}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
