// Fallback In-Memory Store for Serverless environments (Vercel) when DATABASE_URL is not yet connected
// This ensures the live prototype is 100% testable and never crashes on demo days!

export interface StoreBooking {
  id: string;
  bookingCode: string;
  coupleName: string;
  whatsapp: string;
  eventDate: string; // YYYY-MM-DD
  eventLocation: string;
  aestheticMood: string;
  packageName: string;
  totalPrice: number;
  downPayment: number;
  proofFileUrl?: string | null;
  status: "HOLD" | "PENDING_VERIFY" | "CONFIRMED" | "REJECTED" | "EXPIRED";
  holdExpiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  logs?: StoreLog[];
}

export interface StoreLog {
  id: number;
  bookingId: string | null;
  actionType: string;
  executedBy: string;
  notes: string | null;
  loggedAt: Date;
  booking?: {
    bookingCode: string;
    coupleName: string;
  } | null;
}

const initialBookings: StoreBooking[] = [
  {
    id: "demo-booking-1",
    bookingCode: "LMN-2611-101",
    coupleName: "Aristia & Ivan",
    whatsapp: "087777357373",
    eventDate: "2026-11-20",
    eventLocation: "Plataran Heritage Borobudur, Magelang",
    aestheticMood: "Anggun Berbalut Cerita",
    packageName: "Perjalanan Utuh (Complete Journey)",
    totalPrice: 22000000,
    downPayment: 6600582,
    proofFileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    status: "CONFIRMED",
    holdExpiresAt: new Date(Date.now() + 86400000 * 30),
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: "demo-booking-2",
    bookingCode: "LMN-2612-402",
    coupleName: "Nadia & Dimas",
    whatsapp: "081234567890",
    eventDate: "2026-12-15",
    eventLocation: "Gedung De Tjolomadoe, Solo",
    aestheticMood: "Teduh & Khidmat",
    packageName: "Hari Penyatuan Janji (Wedding Day)",
    totalPrice: 15000000,
    downPayment: 4500318,
    proofFileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    status: "PENDING_VERIFY",
    holdExpiresAt: new Date(Date.now() + 86400000 * 10),
    createdAt: new Date(Date.now() - 3600000 * 4),
    updatedAt: new Date(Date.now() - 3600000 * 3),
  },
];

const initialLogs: StoreLog[] = [
  {
    id: 1,
    bookingId: "demo-booking-1",
    actionType: "CONFIRMED_BY_CURATOR",
    executedBy: "CURATOR_ADMIN",
    notes: "Tanda jadi diverifikasi sah oleh kurator. Kalender terpatri.",
    loggedAt: new Date(Date.now() - 86400000),
    booking: {
      bookingCode: "LMN-2611-101",
      coupleName: "Aristia & Ivan",
    },
  },
  {
    id: 2,
    bookingId: "demo-booking-2",
    actionType: "PROOF_UPLOADED",
    executedBy: "CLIENT",
    notes: "Klien menyematkan slip transfer DP. Menunggu verifikasi kurator.",
    loggedAt: new Date(Date.now() - 3600000 * 3),
    booking: {
      bookingCode: "LMN-2612-402",
      coupleName: "Nadia & Dimas",
    },
  },
];

// Attach to globalThis for warmth persistence in serverless environments
const globalStore = globalThis as unknown as {
  __BYLUMENIA_BOOKINGS__?: StoreBooking[];
  __BYLUMENIA_LOGS__?: StoreLog[];
};

if (!globalStore.__BYLUMENIA_BOOKINGS__) {
  globalStore.__BYLUMENIA_BOOKINGS__ = [...initialBookings];
}

if (!globalStore.__BYLUMENIA_LOGS__) {
  globalStore.__BYLUMENIA_LOGS__ = [...initialLogs];
}

export const memoryStore = {
  getBookings: (): StoreBooking[] => {
    return globalStore.__BYLUMENIA_BOOKINGS__ || [];
  },

  getBookingById: (id: string): StoreBooking | undefined => {
    return (globalStore.__BYLUMENIA_BOOKINGS__ || []).find((b) => b.id === id);
  },

  checkDate: (date: string) => {
    const now = new Date();
    const bookings = globalStore.__BYLUMENIA_BOOKINGS__ || [];

    const existing = bookings.find(
      (b) =>
        b.eventDate === date &&
        ["HOLD", "PENDING_VERIFY", "CONFIRMED"].includes(b.status)
    );

    if (!existing) {
      return {
        available: true,
        status: "AVAILABLE",
        message: "Semesta merestui hari itu, pintu jadwal kami masih terbuka luas untuk kalian.",
      };
    }

    if (existing.status === "HOLD") {
      if (new Date(existing.holdExpiresAt) < now) {
        existing.status = "EXPIRED";
        return {
          available: true,
          status: "AVAILABLE",
          message: "Semesta merestui hari itu, pintu jadwal kami masih terbuka luas untuk kalian.",
        };
      }
      return {
        available: false,
        status: "HOLD",
        message: "Tanggal tersebut sedang ditahan oleh pasangan lain selama 30 menit. Silakan cek kembali beberapa saat lagi.",
      };
    }

    return {
      available: false,
      status: existing.status,
      message: "Tanggal tersebut telah terpatri untuk perayaan pasangan lain. Mari diskusikan tanggal alternatif bersama kami.",
    };
  },

  createHold: (bookingData: Omit<StoreBooking, "id" | "createdAt" | "updatedAt" | "status" | "holdExpiresAt">) => {
    const id = `book-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date();
    const holdExpiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins

    const newBooking: StoreBooking = {
      ...bookingData,
      id,
      status: "HOLD",
      holdExpiresAt,
      createdAt: now,
      updatedAt: now,
    };

    if (!globalStore.__BYLUMENIA_BOOKINGS__) {
      globalStore.__BYLUMENIA_BOOKINGS__ = [];
    }
    globalStore.__BYLUMENIA_BOOKINGS__.unshift(newBooking);

    // Add log
    memoryStore.addLog({
      bookingId: id,
      actionType: "HOLD_CREATED",
      executedBy: "CLIENT",
      notes: `Slot tanggal ${newBooking.eventDate} dikunci sementara selama 30 menit untuk pasangan ${newBooking.coupleName}.`,
      booking: {
        bookingCode: newBooking.bookingCode,
        coupleName: newBooking.coupleName,
      },
    });

    return newBooking;
  },

  uploadProof: (bookingId: string, proofUrl: string) => {
    const bookings = globalStore.__BYLUMENIA_BOOKINGS__ || [];
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return null;

    booking.proofFileUrl = proofUrl;
    booking.status = "PENDING_VERIFY";
    booking.updatedAt = new Date();

    memoryStore.addLog({
      bookingId: booking.id,
      actionType: "PROOF_UPLOADED",
      executedBy: "CLIENT",
      notes: `Klien menyematkan tanda bukti bayar DP. Status bergeser ke PENDING_VERIFY.`,
      booking: {
        bookingCode: booking.bookingCode,
        coupleName: booking.coupleName,
      },
    });

    return booking;
  },

  updateStatus: (id: string, action: string, notes?: string) => {
    const bookings = globalStore.__BYLUMENIA_BOOKINGS__ || [];
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return null;

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

    booking.status = newStatus;
    booking.updatedAt = new Date();

    memoryStore.addLog({
      bookingId: booking.id,
      actionType: actionLogType,
      executedBy: "CURATOR_ADMIN",
      notes: notes || `Kurator memperbarui status menjadi ${newStatus}`,
      booking: {
        bookingCode: booking.bookingCode,
        coupleName: booking.coupleName,
      },
    });

    return booking;
  },

  getLogs: (): StoreLog[] => {
    return globalStore.__BYLUMENIA_LOGS__ || [];
  },

  addLog: (logData: Omit<StoreLog, "id" | "loggedAt">) => {
    if (!globalStore.__BYLUMENIA_LOGS__) {
      globalStore.__BYLUMENIA_LOGS__ = [];
    }
    const newLog: StoreLog = {
      ...logData,
      id: globalStore.__BYLUMENIA_LOGS__.length + 1,
      loggedAt: new Date(),
    };
    globalStore.__BYLUMENIA_LOGS__.unshift(newLog);
    return newLog;
  },
};
