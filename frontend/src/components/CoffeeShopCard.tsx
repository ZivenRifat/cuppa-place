// frontend/src/components/CoffeeShopCard.tsx
"use client";

import { MapPin, Star } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  id: number | string;
  name: string;
  img: string;
  location: string;
  rating: number;
  reviews: number;
  category: string;
};

export default function CoffeeShopCard({
  id,
  name,
  img,
  location,
  rating,
  reviews,
  category,
}: Props) {
  const router = useRouter();

  const goDetail = () => {
    router.push(`/pengguna/coffeeshop/${id}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex overflow-hidden">
      {/* IMAGE */}
      <img
        src={img}
        alt={name}
        className="w-[320px] h-[190px] object-cover"
        loading="lazy"
        onError={(e) => {
          // fallback kalau url gambar error
          const el = e.currentTarget;
          if (el.src.includes("/img/home/bg-section.jpg")) return;
          el.src = "/img/home/bg-section.jpg";
        }}
      />

      {/* CONTENT */}
      <div className="flex flex-col justify-between p-5 w-full">
        <div>
          <h2 className="text-xl font-semibold text-[#2b210a]">{name}</h2>

          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin size={16} /> {location}
          </div>

          <div className="flex items-center gap-3 text-sm mt-3">
            <span className="flex items-center gap-1 text-yellow-500 font-medium">
              <Star size={16} /> {Number.isFinite(rating) ? rating : 0}
            </span>
            <span className="text-gray-600">{category}</span>
            <span className="text-gray-500">{reviews} Ulasan</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={goDetail}
            className="px-5 py-2 rounded-full border bg-[#2b210a] text-white hover:bg-[#3C3110] transition"
          >
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  );
}
