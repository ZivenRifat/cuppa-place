"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { coffeeShops } from "@/data/coffeeShops";
import { Star, MapPin, ArrowLeft, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ReviewList } from "@/components/ReviewList";

export default function CoffeeShopPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const shop = coffeeShops.find((c) => c.slug === params.slug);

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-[#2b210a]">
        Coffee shop tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#2b210a]">
      <Navbar />

      {/* Tombol Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-[#2b210a] text-sm pt-24 px-6 py-4 hover:underline"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Gambar utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-6 md:px-10">
        <div className="md:col-span-1 relative aspect-[3/2] rounded-lg overflow-hidden">
          <Image src={shop.images[0]} alt={shop.name} fill className="object-cover" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {shop.images.slice(1).map((src, i) => (
            <div key={i} className="relative aspect-[3/2] rounded-lg overflow-hidden">
              <Image src={src} alt={`${shop.name} ${i + 2}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="px-6 md:px-10 mt-8">
        <h1 className="text-2xl font-bold">{shop.name}</h1>

        {/* Rating, Jam, Lokasi */}
        <div className="flex flex-wrap items-center gap-6 mt-3 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <Star className="text-yellow-500 fill-yellow-500 w-5 h-5" />
            <span>{shop.rating}/5 Rating</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{shop.hours}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{shop.address}</span>
          </div>
        </div>

        {/* Tombol Google Maps */}
        <a
          href={shop.maps}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#2b210a] text-white px-4 py-2 mt-4 rounded-xl font-semibold hover:bg-[#4b3b09] transition"
        >
          <MapPin size={18} /> Open in Google Maps
        </a>
      </div>

      {/* About + Menu + Reviews */}
      <div className="px-6 md:px-10 mt-10 pb-16">
        {/* About */}
        <h2 className="text-xl font-bold mb-3">About</h2>
        <p className="text-gray-700 text-sm leading-relaxed mb-8">{shop.about}</p>

        {/* Menu */}
        {Object.entries(shop.menus).map(([category, items]) => (
          <div key={category} className="mb-10">
            <h2 className="text-lg font-bold mb-4">{category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {items.map((item) => (
                <div
                  key={item.name}
                  className="relative bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition"
                >
                  <div className="relative aspect-[4/5] w-full">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-4" />
                    <div className="absolute top-2 right-2 bg-[#2b210a] text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {item.price}
                    </div>
                  </div>
                  <p className="text-center font-semibold text-sm mb-3">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Reviews */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Reviews</h2>
          <ReviewList reviews={shop.reviews} />
        </div>
      </div>
    </div>
  );
}
