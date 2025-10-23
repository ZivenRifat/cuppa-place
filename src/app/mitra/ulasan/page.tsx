"use client";

import { Star } from "lucide-react";

export default function ReviewsPage() {
  const reviews = [
    {
      id: 1,
      name: "Ngasdi",
      rating: 5,
      date: "2025-11-30",
      text: "Kopinya enak banget, tempatnya recommended buat nugas — cozy banget!!!",
    },
    {
      id: 2,
      name: "Topik",
      rating: 5,
      date: "2025-11-30",
      text: "Rasa kopinya mantap dan pelayanannya cepat. Tempatnya juga nyaman.",
    },
    {
      id: 3,
      name: "Roki Hermawan",
      rating: 4,
      date: "2025-11-30",
      text: "Tempatnya keren, tapi kadang agak ramai di jam sore. Overall good!",
    },
    {
      id: 4,
      name: "Alya",
      rating: 5,
      date: "2025-11-30",
      text: "Baristanya ramah dan hasil latte art-nya keren banget 😍.",
    },
  ];

  return (
    <section className="p-8 text-[#1b1405] space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-300/40 rounded-xl p-6 shadow-md">
        <h1 className="text-xl font-bold mb-3">Ulasan Pelanggan</h1>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Star size={30} className="fill-[#2b210a] text-[#2b210a]" />
            <p className="text-2xl font-bold">
              4.5 <span className="text-base font-normal">/ 5.0</span>
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                className="border border-[#2b210a]/20 rounded-md px-3 py-1 text-sm flex items-center gap-2 
                           hover:bg-[#f9f8f6] hover:shadow-sm transition-all duration-150"
              >
                <Star size={14} className="fill-[#2b210a] text-[#2b210a]" /> {star}{" "}
                bintang
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List Reviews */}
      <div className="bg-white border border-gray-300/40 rounded-xl p-6 shadow-md space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-300/40 pb-4 last:border-none"
          >
            <div className="flex gap-4 items-start">
              {/* Avatar */}
              <div className="bg-[#f5f3f0] rounded-full p-3 w-12 h-12 flex items-center justify-center text-[#2b210a] text-xl font-bold shadow-sm">
                <span>👤</span>
              </div>

              {/* Review Content */}
              <div className="flex-1">
                <p className="font-bold">{review.name}</p>
                <div className="flex items-center text-yellow-500 mb-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 mb-2">{review.date}</p>
                <p className="leading-relaxed text-[#2b210a]/90">{review.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
