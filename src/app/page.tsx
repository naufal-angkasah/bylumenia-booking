"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GallerySection from "@/components/GallerySection";
import PhilosophySection from "@/components/PhilosophySection";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import ScrollToTop from "@/components/ScrollToTop";
import WelcomeScreen from "@/components/WelcomeScreen";
import { PackageItem } from "@/lib/constants";

export default function Home() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handleEnter = () => {
    setHasEntered(true);
    setIsMuted(false);
  };

  const handleOpenBooking = () => {
    setSelectedPackage(null);
    setBookingModalOpen(true);
  };

  const handleToggleAudio = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <main className="min-h-screen bg-obsidian-950 text-white selection:bg-gold-400 selection:text-black">
      {/* Cinematic Welcome Screen Gate (Opsi A) — Membuka Audio Penuh Seketika */}
      {!hasEntered && <WelcomeScreen onEnter={handleEnter} />}

      {/* Floating Capsule Navbar with Integrated Audio Controller */}
      <Navbar
        onOpenBooking={handleOpenBooking}
        isMuted={isMuted}
        onToggleAudio={handleToggleAudio}
      />

      {/* Hero Section with Looped Teaser Video */}
      <HeroSection
        onOpenBooking={handleOpenBooking}
        isPaused={bookingModalOpen}
        isMuted={isMuted}
        hasEntered={hasEntered}
        onToggleMute={handleToggleAudio}
        onAudioChange={setIsMuted}
      />

      {/* Modul "Kisah Kami" — Slider Otomatis Portofolio Asli 4 Detik & Galeri */}
      <GallerySection />

      {/* Filosofi Butik & Restu Waktu yang Terjaga */}
      <PhilosophySection />

      {/* Footer */}
      <Footer />

      {/* Alur Reservasi Sinematik 5 Babak */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preSelectedPackage={selectedPackage}
      />

      {/* Floating Auto Scroll-to-Top Button */}
      <ScrollToTop />
    </main>
  );
}
