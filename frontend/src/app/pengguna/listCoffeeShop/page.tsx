"use client";

import Navbar from "@/components/Navbar";
import Carousel from "@/components/SlideShow";
import { Coffee } from "lucide-react";
import CoffeeShopCard from "@/components/CoffeeShopCard";
import SlideShow from "@/components/SlideShow";

const coffeeShops = [
  {
    id: 1,
    name: "Terikat Kopi",
    location: "Sriwijaya, Kota Semarang",
    rating: 4.9,
    reviews: 1530,
    category: "Favorite",
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200",
  },
  {
    id: 2,
    name: "Toko Kopi Djuara",
    location: "Gajahmada, Kota Semarang",
    rating: 4.8,
    reviews: 980,
    category: "Nyaman Buat Kerja",
    img: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200",
  },
];

export default function CoffeeShopPage() {
  return (
    <div className="bg-[#F7F5F2] min-h-screen flex flex-col">

      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* CONTENT */}
      <main className="flex-1 pt-[115px] max-w-6xl mx-auto w-full px-4">
        <h1 className="text-3xl font-semibold text-[#2b210a] flex items-center gap-2">
          <Coffee className="text-[#5a452b]" /> Daftar Coffee Shop
        </h1>

        <p className="text-gray-500 text-sm mt-1 mb-6">
          Temukan coffee shop terbaik yang kamu inginkan!!!
        </p>

        <div className="space-y-6 mb-10">
          {coffeeShops.map((shop) => (
            <CoffeeShopCard key={shop.id} {...shop} />
          ))}
        </div>
      </main>

      {/* SLIDESHOW FULL WIDTH DI PALING BAWAH */}
      <div>
        <SlideShow />
      </div>
    </div>
  );
}
