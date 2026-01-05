// frontend/src/app/pengguna/listCoffeeShop/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import SlideShow from "@/components/SlideShow";
import { Coffee, Search } from "lucide-react";
import CoffeeShopCard from "@/components/CoffeeShopCard";
import { apiListCafes } from "@/lib/api";
import type { Cafe } from "@/types/domain";

type UiCafeCard = {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  category: string;
  img: string;
};

function pickImage(cafe: Cafe): string {
  // prioritas cover -> logo -> fallback
  const cover = (cafe as unknown as { cover_url?: string | null }).cover_url ?? null;
  const logo = (cafe as unknown as { logo_url?: string | null }).logo_url ?? null;
  return cover || logo || "/img/home/bg-section.jpg";
}

export default function CoffeeShopPage() {
  const [items, setItems] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiListCafes({
          search: search.trim() ? search.trim() : undefined,
          limit: 50,
          offset: 0,
        });

        if (!active) return;
        setItems(res.data ?? []);
      } catch (e: unknown) {
        if (!active) return;
        const msg =
          typeof e === "object" && e !== null && "message" in e
            ? String((e as { message?: string }).message ?? "")
            : "";
        setError(msg || "Gagal memuat daftar coffeeshop.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [search]);

  const cards: UiCafeCard[] = useMemo(() => {
    return (items ?? []).map((c) => {
      const address = (c.address ?? "").toString();
      return {
        id: Number(c.id),
        name: c.name ?? "Coffeeshop",
        location: address || "Alamat belum diisi",
        // kalau backend kamu belum ada rating/reviews di table cafe, set default
        rating: Number((c as unknown as { avg_rating?: number }).avg_rating ?? 0),
        reviews: Number((c as unknown as { review_count?: number }).review_count ?? 0),
        category: "Coffee Shop",
        img: pickImage(c),
      };
    });
  }, [items]);

  return (
    <div className="bg-[#F7F5F2] min-h-screen flex flex-col">
      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      <main className="flex-1 pt-[115px] max-w-6xl mx-auto w-full px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#2b210a] flex items-center gap-2">
              <Coffee className="text-[#5a452b]" /> Daftar Coffee Shop
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Temukan coffee shop terbaik yang kamu inginkan!!!
            </p>
          </div>
          <div className="w-full md:w-[360px]">
            <label className="text-xs text-gray-600 mb-1 block">Cari coffeeshop</label>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Contoh: Semarang / nama cafe..."
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="py-10">
            <p className="text-center text-sm text-gray-500">Memuat daftar coffeeshop...</p>
          </div>
        ) : error ? (
          <div className="py-10">
            <p className="text-center text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl py-3 px-4">
              {error}
            </p>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-10">
            <p className="text-center text-sm text-gray-600">
              Tidak ada coffeeshop ditemukan.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mb-10 mt-6">
            {cards.map((shop) => (
              <CoffeeShopCard key={shop.id} {...shop} />
            ))}
          </div>
        )}
      </main>
      <div>
        <SlideShow />
      </div>
    </div>
  );
}
