export interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Prewedding" | "Akad & Resepsi" | "Adat & Budaya" | "Editorial";
  aspect: "tall" | "wide" | "square";
  imageUrl: string;
  images: string[];
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Doa Orang Tua",
    subtitle: "Momen doa dan restu sebelum prosesi",
    category: "Akad & Resepsi",
    aspect: "tall",
    imageUrl: "/images/Wedding/IMG_9060.webp",
    images: [
      "/images/Wedding/IMG_9060.webp",
      "/images/Wedding/IMG_9061.webp",
      "/images/Wedding/IMG_9062.webp",
      "/images/Wedding/IMG_9063.webp",
    ],
  },
  {
    id: "gal-2",
    title: "Prewedding Outdoor",
    subtitle: "Sesi candid berdua di lokasi terbuka",
    category: "Prewedding",
    aspect: "tall",
    imageUrl: "/images/Prewedding/IMG_9033.webp",
    images: [
      "/images/Prewedding/IMG_9033.webp",
      "/images/Prewedding/IMG_9034.webp",
      "/images/Prewedding/IMG_9035.webp",
      "/images/Prewedding/IMG_9036.webp",
    ],
  },
  {
    id: "gal-3",
    title: "Busana Adat Jawa",
    subtitle: "Kebaya renda putih dengan ronce melati",
    category: "Adat & Budaya",
    aspect: "tall",
    imageUrl: "/images/Wedding/IMG_9064.webp",
    images: [
      "/images/Wedding/IMG_9064.webp",
      "/images/Wedding/IMG_9065.webp",
      "/images/Wedding/IMG_9066.webp",
    ],
  },
  {
    id: "gal-4",
    title: "Prewedding Studio",
    subtitle: "Studio dengan pencahayaan hangat dan busana modern",
    category: "Prewedding",
    aspect: "tall",
    imageUrl: "/images/Prewedding/IMG_9052.webp",
    images: [
      "/images/Prewedding/IMG_9052.webp",
      "/images/Prewedding/IMG_9053.webp",
      "/images/Prewedding/IMG_9054.webp",
      "/images/Prewedding/IMG_9055.webp",
    ],
  },
  {
    id: "gal-5",
    title: "Detail Pernikahan",
    subtitle: "Cincin, rangkaian bunga, dan detail adat",
    category: "Editorial",
    aspect: "square",
    imageUrl: "/images/Wedding/IMG_9062.webp",
    images: [
      "/images/Wedding/IMG_9062.webp",
      "/images/Wedding/IMG_9067.webp",
      "/images/Wedding/IMG_9068.webp",
    ],
  },
  {
    id: "gal-6",
    title: "Sesi Pertama",
    subtitle: "Tiga potret dari sesi prewedding",
    category: "Prewedding",
    aspect: "tall",
    imageUrl: "/images/Prewedding/IMG_9045.webp",
    images: [
      "/images/Prewedding/IMG_9045.webp",
      "/images/Prewedding/IMG_9046.webp",
      "/images/Prewedding/IMG_9047.webp",
      "/images/Prewedding/IMG_9048.webp",
    ],
  },
  {
    id: "gal-7",
    title: "Potret Editorial",
    subtitle: "Pencahayaan dramatis untuk potret editorial",
    category: "Editorial",
    aspect: "tall",
    imageUrl: "/images/Wedding/IMG_9065.webp",
    images: [
      "/images/Wedding/IMG_9065.webp",
      "/images/Wedding/IMG_9068.webp",
      "/images/Wedding/IMG_9069.webp",
    ],
  },
  {
    id: "gal-8",
    title: "Detail Busana Adat",
    subtitle: "Detail payet dan melati pada busana pengantin Jawa",
    category: "Adat & Budaya",
    aspect: "tall",
    imageUrl: "/images/Wedding/IMG_9068.webp",
    images: [
      "/images/Wedding/IMG_9068.webp",
      "/images/Wedding/IMG_9064.webp",
      "/images/Wedding/IMG_9060.webp",
    ],
  },
  {
    id: "gal-9",
    title: "Hari Pernikahan",
    subtitle: "Kumpulan momen bersama keluarga",
    category: "Akad & Resepsi",
    aspect: "square",
    imageUrl: "/images/Wedding/IMG_9069.webp",
    images: [
      "/images/Wedding/IMG_9069.webp",
      "/images/Wedding/IMG_9063.webp",
      "/images/Wedding/IMG_9066.webp",
    ],
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

export interface AddOnItem {
  id: string;
  name: string;
  category: "Video" | "Photo" | "Streaming" | "Output";
  price: number;
  description: string;
}

export const ADDON_CATALOG: AddOnItem[] = [
  {
    id: "addon-drone",
    name: "Drone Cinematic 4K Highlight",
    category: "Video",
    price: 1500000,
    description: "Pilot drone berlisensi & sudut pandang udara spektakuler venue pernikahan.",
  },
  {
    id: "addon-live",
    name: "Live Streaming YouTube 2 Kamera Full HD",
    category: "Streaming",
    price: 3500000,
    description: "Broadcaster pro, audio mixer digital, & overlay nama pengantin.",
  },
  {
    id: "addon-sde",
    name: "Same Day Edit (SDE Teaser Malam Resepsi)",
    category: "Video",
    price: 2000000,
    description: "Video teaser 1 menit langsung tayang di proyektor resepsi & IG Reels.",
  },
  {
    id: "addon-album",
    name: "Album Linen Handmade Eksklusif Tambahan",
    category: "Output",
    price: 1200000,
    description: "Ukuran 20x30 cm (30 halaman) dengan boks kayu ukir grafir nama.",
  },
];

export interface RundownItem {
  id: string;
  time: string;
  activity: string;
  pic: string;
  notes?: string;
}

export const DEFAULT_RUNDOWN_TEMPLATE: RundownItem[] = [
  {
    id: "rd-1",
    time: "06:00 - 08:00",
    activity: "Persiapan & Makeup Pengantin (Beauty & Detail Shot)",
    pic: "Lead Photographer & Videographer",
    notes: "Pengambilan detail cincin, gaun, sepatu, undangan, dan flatlay.",
  },
  {
    id: "rd-2",
    time: "08:00 - 08:30",
    activity: "Kedatangan Calon Pengantin Pria & Rombongan Keluarga",
    pic: "Tim Liputan & WO",
    notes: "Sesi sambutan keluarga dan penyerahan seserahan.",
  },
  {
    id: "rd-3",
    time: "08:30 - 09:30",
    activity: "Akad Nikah / Ijab Qabul & Doa Bersama",
    pic: "Seluruh Tim (Kamera 1, 2, 3)",
    notes: "Momen sakral khidmat: ijab kabul, buku nikah, tukar cincin, sungkeman orang tua.",
  },
  {
    id: "rd-4",
    time: "09:30 - 10:30",
    activity: "Prosesi Adat (Panggih / Temu Manten / Balangan Suruh)",
    pic: "Tim Foto & Video Adat",
    notes: "Fokus pada detail tradisi adat Jawa dan ekspresi haru orang tua.",
  },
  {
    id: "rd-5",
    time: "10:30 - 11:30",
    activity: "Sesi Foto Bersama Keluarga Inti & VIP",
    pic: "Lead Photographer",
    notes: "Urutan foto keluarga sesuai daftar susunan WO.",
  },
  {
    id: "rd-6",
    time: "12:00 - 14:00",
    activity: "Resepsi Pernikahan, Lempar Hand Bouquet & Ramah Tamah",
    pic: "Seluruh Tim Dokumentasi",
    notes: "Liputan suasana resepsi, candid tamu undangan, dan momen ceria.",
  },
];
