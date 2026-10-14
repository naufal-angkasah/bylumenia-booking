export interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Prewedding" | "Akad & Resepsi" | "Adat & Budaya" | "Editorial";
  aspect: "tall" | "wide" | "square";
  imageUrl: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Doa Orang Tua",
    subtitle: "Momen doa dan restu sebelum prosesi",
    category: "Akad & Resepsi",
    aspect: "tall",
    imageUrl: "/images/Wedding/IMG_9060.webp",
  },
  {
    id: "gal-2",
    title: "Prewedding Outdoor",
    subtitle: "Sesi candid berdua di lokasi terbuka",
    category: "Prewedding",
    aspect: "tall",
    imageUrl: "/images/Prewedding/IMG_9033.webp",
  },
  {
    id: "gal-3",
    title: "Busana Adat Jawa",
    subtitle: "Kebaya renda putih dengan ronce melati",
    category: "Adat & Budaya",
    aspect: "tall",
    imageUrl: "/images/Wedding/IMG_9064.webp",
  },
  {
    id: "gal-4",
    title: "Prewedding Studio",
    subtitle: "Studio dengan pencahayaan hangat dan busana modern",
    category: "Prewedding",
    aspect: "tall",
    imageUrl: "/images/Prewedding/IMG_9052.webp",
  },
  {
    id: "gal-5",
    title: "Detail Pernikahan",
    subtitle: "Cincin, rangkaian bunga, dan detail adat",
    category: "Editorial",
    aspect: "square",
    imageUrl: "/images/Wedding/IMG_9062.webp",
  },
  {
    id: "gal-6",
    title: "Sesi Pertama",
    subtitle: "Tiga potret dari sesi prewedding",
    category: "Prewedding",
    aspect: "tall",
    imageUrl: "/images/Prewedding/IMG_9045.webp",
  },
  {
    id: "gal-7",
    title: "Potret Editorial",
    subtitle: "Pencahayaan dramatis untuk potret editorial",
    category: "Editorial",
    aspect: "tall",
    imageUrl: "/images/Wedding/IMG_9065.webp",
  },
  {
    id: "gal-8",
    title: "Detail Busana Adat",
    subtitle: "Detail payet dan melati pada busana pengantin Jawa",
    category: "Adat & Budaya",
    aspect: "tall",
    imageUrl: "/images/Wedding/IMG_9068.webp",
  },
  {
    id: "gal-9",
    title: "Hari Pernikahan",
    subtitle: "Kumpulan momen bersama keluarga",
    category: "Akad & Resepsi",
    aspect: "square",
    imageUrl: "/images/Wedding/IMG_9069.webp",
  },
];

export interface PackageItem {
  id: string;
  name: string;
  tier: "Prewedding" | "Wedding Day" | "Complete Package";
  price: number;
  priceFormatted: string;
  priceRange: string;
  tagline: string;
  features: string[];
  recommended?: boolean;
}

export const PACKAGES: PackageItem[] = [
  {
    id: "pkg-prewedding",
    name: "Prewedding",
    tier: "Prewedding",
    price: 3500000,
    priceFormatted: "Rp 3.500.000",
    priceRange: "Rp 2.500.000 – Rp 4.500.000",
    tagline: "Sesi foto dan video berdua sebelum hari pernikahan",
    features: [
      "1 Hari Sesi (Outdoor / Studio)",
      "2 Fotografer & 1 Videografer Sinematik",
      "Semua File Foto High-Resolution dalam Flashdisk",
      "40 Foto Pilihan & Retouch",
      "1 Teaser Video (1 Menit) & Video Reels",
      "1 Cetak Canvas 40x60 cm Berbingkai Minimalis",
    ],
  },
  {
    id: "pkg-wedding",
    name: "Wedding Day",
    tier: "Wedding Day",
    price: 7500000,
    priceFormatted: "Rp 7.500.000",
    priceRange: "Rp 5.000.000 – Rp 8.500.000",
    tagline: "Dokumentasi lengkap dari akad hingga resepsi",
    recommended: true,
    features: [
      "Full Day Coverage (Akad, Temu Adat, & Resepsi)",
      "3 Fotografer Senior + 2 Videografer Sinematik",
      "100+ Foto Pilihan Hasil Retouch",
      "1 Album Linen Handmade (30 Halaman)",
      "Film Pendek Sinematik (3-5 Menit) 4K",
      "Same Day Edit Teaser untuk Instagram Story",
      "Flashdisk Kaca dalam Kotak Kayu",
    ],
  },
  {
    id: "pkg-complete",
    name: "Complete Package",
    tier: "Complete Package",
    price: 12000000,
    priceFormatted: "Rp 12.000.000",
    priceRange: "Rp 9.000.000 – Rp 15.000.000",
    tagline: "Paket lengkap dari prewedding hingga resepsi",
    features: [
      "Paket Lengkap: Prewedding + Akad + Resepsi",
      "Tim Lengkap (4 Fotografer & 3 Videografer)",
      "2 Wedding Book Linen & Leather",
      "1 Film Dokumenter (10-15 Menit)",
      "2 Teaser Sinematik (1 Menit) Vertikal & Horizontal",
      "Semua File Mentah (RAW) & Master Edit 4K Disertakan",
      "Konsultasi Moodboard & Arahan Gaya",
    ],
  },
];

export interface MoodOption {
  id: string;
  title: string;
  subTitle: string;
  description: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "teduh",
    title: "Khidmat",
    subTitle: "Tenang & Haru",
    description:
      "Fokus pada doa orang tua, restu keluarga, dan prosesi yang berlangsung khidmat.",
  },
  {
    id: "anggun",
    title: "Elegan & Tradisional",
    subTitle: "Adat & Editorial",
    description:
      "Busana adat, kain tradisional, dan gaya foto editorial yang rapi.",
  },
  {
    id: "riuh",
    title: "Santai & Ceria",
    subTitle: "Candid & Natural",
    description:
      "Momen spontan bersama keluarga dan sahabat, dengan suasana yang santai.",
  },
];

export const PAYMENT_METHODS = {
  bankBca: {
    bankName: "BCA (Bank Central Asia)",
    accountNumber: "8035198271",
    accountHolder: "Bylumenia Visual Studio",
  },
  bankMandiri: {
    bankName: "Bank Mandiri",
    accountNumber: "1360019283712",
    accountHolder: "Bylumenia Visual Studio",
  },
  qris: {
    label: "QRIS All Payment (GoPay, OVO, Dana, BCA Mobile, ShopeePay)",
    mockQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126570014ID.LINKAJA.WWW0118936009110021008453021500000000000000000303UMI51440014ID.CO.QRIS.WWW0215ID10200210084530303UMI5204581253033605802ID5916BYLUMENIA%20STUDIO6008SEMARANG61055013462070703A016304E5F6",
  },
};
