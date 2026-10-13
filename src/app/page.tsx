"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GallerySection from "@/components/GallerySection";
import PackagesSection from "@/components/PackagesSection";
import PhilosophySection from "@/components/PhilosophySection";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import ScrollToTop from "@/components/ScrollToTop";
import { PackageItem } from "@/lib/constants";

export default function Home() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);

  const handleOpenBooking = () => {
    setSelectedPackage(null);
    setBookingModalOpen(true);
  };

  const handleSelectPackage = (pkg: PackageItem) => {
    setSelectedPackage(pkg);
    setBookingModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-obsidian-950 text-white selection:bg-gold-400 selection:text-black">
      {/* Floating Capsule Navbar */}
      <Navbar onOpenBooking={handleOpenBooking} />

      {/* Hero Section with Looped Teaser Video */}
      <HeroSection onOpenBooking={handleOpenBooking} />

      {/* Galeri "Kisah Kamu" (Adaptive to Instagram Feed) */}
      <GallerySection />

      {/* Curated Packages */}
      <PackagesSection onSelectPackage={handleSelectPackage} />

      {/* Boutique Philosophy & Anti-Collision Engine */}
      <PhilosophySection />

      {/* Footer */}
      <Footer />

      {/* Interactive 3-Stage Cinematic Booking Popup */}
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
