"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function CafeSection() {
  const cafes = [
    {
      name: "SATUPERLIMA",
      address:
        "Jl. Depok, Kembangsari, Kec. Semarang Tengah, Kota Semarang, Jawa Tengah 50133",
      images: [
        "/img/satuperlima/1.jpg",
        "/img/satuperlima/2.jpg",
        "/img/satuperlima/3.jpg",
      ],
      maps: "https://www.google.com/maps?q=SATUPERLIMA+Semarang",
    },
    {
      name: "RENJANA",
      address:
        "Jl. Depok, Kembangsari, Kec. Semarang Tengah, Kota Semarang Tengah, Kota Semarang, Jawa Tengah, 50133",
      images: [
        "/img/renjana/1.jpg",
        "/img/renjana/2.jpg",
        "/img/renjana/3.jpg",
      ],
      maps: "https://www.google.com/maps?q=RENJANA+Semarang",
    },
    {
      name: "TERIKAT",
      address:
        "Jl. Depok, Kembangsari, Kec. Semarang Tengah, Kota Semarang Tengah, Kota Semarang, Jawa Tengah, 50133",
      images: [
        "/img/terikat/1.jpg",
        "/img/terikat/2.jpg",
        "/img/terikat/3.jpg",
      ],
      maps: "https://www.google.com/maps?q=TERIKAT+Semarang",
    },
  ];

  return (
    <section
      id="coffeeshop"
      className="bg-white text-[#2b210a] py-20 px-6 md:px-16"
    >
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12">
        Rekomendasi untuk Kamu
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20 justify-items-center">
        {cafes.map((cafe, index) => (
          <CafeCard key={index} cafe={cafe} />
        ))}
      </div>

      <div className="flex justify-center mt-14">
        <button className="bg-[#4b3b09] text-white px-8 py-4 rounded-2xl text-lg font-medium hover:bg-[#2b210a] transition">
          Lihat Semua Daftar Coffeeshop
        </button>
      </div>
    </section>
  );
}

/* ---------- CafeCard ---------- */
function CafeCard({ cafe }: { cafe: any }) {
  const [idx, setIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [hoverImage, setHoverImage] = useState(false);

  const slideRef = useRef<HTMLDivElement | null>(null);
  const original = cafe.images;
  const imagesExtended = [...original, original[0]];
  const slideCount = imagesExtended.length;

  const intervalMs = 3000;
  const transitionMs = 700;

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((prev) => prev + 1);
      setIsTransitioning(true);
    }, intervalMs);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (idx === original.length) {
      const endTimer = setTimeout(() => {
        setIsTransitioning(false);
        setIdx(0);
        setTimeout(() => setIsTransitioning(true), 20);
      }, transitionMs + 20);
      return () => clearTimeout(endTimer);
    }
  }, [idx, original.length, transitionMs]);

  const slideWidthPercent = 100 / slideCount;

  return (
    <div className="relative w-[280px] sm:w-[300px] md:w-[350px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all bg-white border border-gray-200 group">
      {/* ===== Gambar + Overlay ===== */}
      <div
        className="relative w-full h-[380px] overflow-hidden cursor-pointer"
        onMouseEnter={() => setHoverImage(true)}
        onMouseLeave={() => setHoverImage(false)}
      >
        {/* Carousel Slide */}
        <div
          ref={slideRef}
          className={`flex ${isTransitioning ? "transition-transform" : ""}`}
          style={{
            width: `${slideCount * 100}%`,
            transitionDuration: isTransitioning ? `${transitionMs}ms` : "0ms",
            transform: `translateX(-${idx * slideWidthPercent}%)`,
          }}
        >
          {imagesExtended.map((src: string, i: number) => (
            <div
              key={i}
              style={{ width: `${slideWidthPercent}%` }}
              className="relative h-[380px] flex-shrink-0"
            >
              <Image
                src={src}
                alt={`${cafe.name}-${i}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* ===== Overlay teks animasi ===== */}
        <div
          className={`absolute bottom-0 left-0 w-full bg-white/20 backdrop-blur-sm text-white flex flex-col items-center justify-end transition-all duration-700 ease-in-out ${
            hoverImage ? "h-full" : "h-[60px]"
          }`}
        >
          <div
            className={`flex flex-col items-center transition-all duration-700 ease-in-out ${
              hoverImage ? "translate-y-[-120px]" : "translate-y-[40px]"
            }`}
          >
            <p className="text-2xl font-bold tracking-wide text-center">
              {cafe.name}
            </p>

            <button
              className={`mt-4 bg-white text-[#2b210a] font-semibold px-5 py-2 rounded-full shadow-sm transition-all duration-700 ease-in-out ${
                hoverImage
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              } hover:bg-[#4b3b09] hover:text-white`}
            >
              Lihat Selengkapnya
            </button>
          </div>
        </div>
      </div>

      {/* ===== Alamat ===== */}
      <div className="p-4 text-center bg-white">
        <a
          href={cafe.maps}
          target="_blank"
          rel="noopener noreferrer"
          className="group/location relative flex items-center justify-center gap-2 w-full transition-all duration-500"
        >
          {/* Wrapper untuk transisi background */}
          <div className="absolute inset-0 rounded-xl bg-transparent group-hover/location:bg-[#271F01] transition-all duration-500"></div>

          {/* Icon Lokasi */}
          <MapPin className="w-20 h-20 text-[#4b3b09] z-10 transition-all duration-500 group-hover/location:translate-x-9 group-hover/location:text-white" />

          {/* Alamat normal */}
          <span className="z-10 text-gray-700 text-sm font-medium transition-all duration-500 opacity-100 group-hover/location:opacity-0">
            {cafe.address}
          </span>

          {/* Teks saat hover */}
          <span className="absolute z-10 text-white font-bold text-[16px] opacity-0 group-hover/location:opacity-100 transition-all duration-500 translate-y-2 group-hover/location:translate-y-0">
            Buka di Google Maps
          </span>
        </a>
      </div>
    </div>
  );
}
