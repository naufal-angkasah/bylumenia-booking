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
    title: "Tangis Haru & Doa Syahdu",
    subtitle: "Detik hening saat doa dipanjatkan di hadapan semesta",
    category: "Akad & Resepsi",
    aspect: "tall",
    imageUrl: "/images/Wedding/IMG_9060.PNG",
  },
  {
    id: "gal-2",
    title: "Kisah Kasual di Padang Terbuka",
    subtitle: "Tawa lepas berdua di bawah langit cerah tanpa rekayasa",
    category: "Prewedding",
    aspect: "tall",
    imageUrl: "/images/Prewedding/IMG_9033.PNG",
  },
  {
    id: "gal-3",
    title: "Anggun dalam Balutan Adat",
    subtitle: "Kebaya renda putih berpadu kemegahan ronce melati",
    category: "Adat & Budaya",
    aspect: "tall",
    imageUrl: "/images/Wedding/IMG_9064.PNG",
  },
  {
    id: "gal-4",
    title: "Temaram Beludru Sinematik",
    subtitle: "Nuansa studio hangat berpadu keanggunan busana modern",
    category: "Prewedding",
    aspect: "tall",
    imageUrl: "/images/Prewedding/IMG_9052.PNG",
  },
  {
    id: "gal-5",
    title: "Mozaik Detail & Makna",
    subtitle: "Rangkaian simbol, cincin, wewangian, dan corak adat",
    category: "Editorial",
    aspect: "square",
    imageUrl: "/images/Wedding/IMG_9062.PNG",
  },
  {
    id: "gal-6",
    title: "Lembaran Cerita Awal",
    subtitle: "Tiga bingkai senyum manis mengawali babak baru",
    category: "Prewedding",
    aspect: "tall",
    imageUrl: "/images/Prewedding/IMG_9045.PNG",
  },
  {
    id: "gal-7",
    title: "Siluet & Karakter Editorial",
    subtitle: "Sorot cahaya dramatis yang menonjolkan lekuk keanggunan",
    category: "Editorial",
    aspect: "tall",
    imageUrl: "/images/Wedding/IMG_9065.PNG",
  },
  {
    id: "gal-8",
    title: "Keindahan Payet & Melati",
    subtitle: "Ketelitian setiap detail busana adat pengantin Jawa",
    category: "Adat & Budaya",
    aspect: "tall",
    imageUrl: "/images/Wedding/IMG_9068.PNG",
  },
  {
    id: "gal-9",
    title: "Mozaik Hari Bahagia",
    subtitle: "Rangkuman tawa, sungkeman, dan dekap hangat keluarga",
    category: "Akad & Resepsi",
    aspect: "square",
    imageUrl: "/images/Wedding/IMG_9069.PNG",
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
