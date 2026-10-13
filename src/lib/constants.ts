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
    title: "Siluet & Veil Panjang",
    subtitle: "Keanggunan gaun putih melayang dalam heningnya ruang",
    category: "Editorial",
    aspect: "tall",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gal-2",
    title: "Simbol Keabadian",
    subtitle: "Dua lingkaran janji suci berpadu tekstur batuan alam",
    category: "Prewedding",
    aspect: "square",
    imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gal-3",
    title: "Kebaya Beludru & Gebyok",
    subtitle: "Kemegahan adat Jawa, marun keemasan dalam dekap restu leluhur",
    category: "Adat & Budaya",
    aspect: "tall",
    imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gal-4",
    title: "Harum Rangkaian Melati",
    subtitle: "Tetes air siraman, senyum syahdu pembersih jiwa",
    category: "Adat & Budaya",
    aspect: "tall",
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "gal-5",
    title: "Kisah Kasual di Padang Terbuka",
    subtitle: "Tawa lepas tanpa rekayasa di bawah langit lepas",
    category: "Prewedding",
    aspect: "wide",
    imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "gal-6",
    title: "Tatapan Menuju Pintu Semesta",
    subtitle: "Ketika dua cerita berlabuh dalam janji suci seumur hidup",
    category: "Akad & Resepsi",
    aspect: "square",
    imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80",
  },
];

export interface PackageItem {
  id: string;
  name: string;
  tier: "Babak Awal" | "Hari Penyatuan Janji" | "Perjalanan Utuh";
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
    name: "Babak Awal",
    tier: "Babak Awal",
    price: 3500000,
    priceFormatted: "Rp 3.500.000",
    priceRange: "Rp 2.500.000 – Rp 4.500.000",
    tagline: "Dokumentasi tatap mata berdua sebelum hari besar tiba",
    features: [
      "1 Hari Sesi Eksklusif (Outdoor / Studio)",
      "2 Fotografer & 1 Videografer Sinematik",
      "Semua File Foto High-Resolution dalam Flashdisk Kayu",
      "40 Foto Terkurasi & Retouched Masterpiece",
      "1 Teaser Video Sinematik (1 Menit) & Video Reels",
      "1 Cetak Canvas 40x60 cm Berbingkai Minimalis",
    ],
  },
  {
    id: "pkg-wedding",
    name: "Hari Penyatuan Janji",
    tier: "Hari Penyatuan Janji",
    price: 7500000,
    priceFormatted: "Rp 7.500.000",
    priceRange: "Rp 5.000.000 – Rp 8.500.000",
    tagline: "Rekam jejak fajar akad suci hingga pesta resepsi usai",
    recommended: true,
    features: [
      "Full Day Coverage (Akad, Temu Adat, & Resepsi)",
      "3 Fotografer Senior + 2 Videografer Sinematik",
      "Koleksi 100+ Foto Editorial Pilihan Kurator",
      "1 Exclusive Handmade Linen Album (30 Halaman)",
      "Film Pendek Sinematik (3-5 Menit) 4K Ultra HD",
      "Same Day Edit Teaser Video untuk Instagram Story",
      "Flashdisk Kaca Eksklusif dalam Kotak Kayu Ukir",
    ],
  },
  {
    id: "pkg-complete",
    name: "Perjalanan Utuh",
    tier: "Perjalanan Utuh",
    price: 12000000,
    priceFormatted: "Rp 12.000.000",
    priceRange: "Rp 9.000.000 – Rp 15.000.000",
    tagline: "Rangkaian utuh kisah cinta dari prewedding hingga hari resepsi",
    features: [
      "Paket Lengkap: Prewedding + Akad + Resepsi",
      "Tim Kurator Lengkap (4 Fotografer & 3 Videografer)",
      "2 Buah Exclusive Linen & Leather Wedding Book",
      "1 Film Sinematik Dokumenter Panjang (10-15 Menit)",
      "2 Teaser Sinematik (1 Menit) Vertikal & Horizontal",
      "Semua File Mentah (RAW) & Master Edit 4K Disertakan",
      "Akses Konsultasi Moodboard & Pengarah Gaya Pribadi",
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
    title: "Teduh dan Khidmat",
    subTitle: "Hening, Haru & Restu",
    description:
      "Menangkap getaran doa orang tua, restu keluarga, dan heningnya janji suci tanpa kilau bising.",
  },
  {
    id: "anggun",
    title: "Anggun Berbalut Cerita",
    subTitle: "Tradisi & Editorial Abadi",
    description:
      "Keindahan kain tradisional, siluet megah kebaya adat, dan visual editorial yang tak lekang zaman.",
  },
  {
    id: "riuh",
    title: "Riuh Penuh Tawa",
    subTitle: "Candid, Hangat & Alami",
    description:
      "Pelukan hangat sahabat, tawa lepas tanpa rekayasa, dan selebrasi bahagia yang mengalir alami.",
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
