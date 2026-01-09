"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { ArrowLeft, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { apiListCafes } from "@/lib/api";
import type { Cafe } from "@/types/domain";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type UiCafeCard = {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  img: string;
  gallery: string[];
};

function pickImage(cafe: Cafe): string {
  let gallery_urls = (cafe as unknown as { gallery_urls?: string[] }).gallery_urls ?? null;

  if (!gallery_urls || gallery_urls.length === 0) {
    const rawPhotos = (cafe as unknown as { photos?: Array<{ url?: string }> }).photos ?? [];
    const photoUrls = rawPhotos.filter(p => p.url).map(p => p.url as string);
    if (photoUrls.length > 0) {
      gallery_urls = photoUrls;
    }
  }

  if (gallery_urls && gallery_urls.length > 0 && gallery_urls[0]) {
    return gallery_urls[0];
  }
  const cover = (cafe as unknown as { cover_url?: string | null }).cover_url ?? null;
  const logo = (cafe as unknown as { logo_url?: string | null }).logo_url ?? null;
  return cover || logo || "/img/home/bg-section.jpg";
}

function resolveImageUrl(url: string | null): string {
  if (!url) return "/img/home/bg-section.jpg";
  if (url.startsWith("http")) return url;
  return url;
}

export default function CoffeeShopPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }> | { search?: string };
}) {
  const router = useRouter();
  const [items, setItems] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Gallery states - { cafeId: currentIndex }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [galleryStates, setGalleryStates] = useState<Record<number, number>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const intervalRefs = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const stopSlide = (cafeId: number) => {
    const interval = intervalRefs.current.get(cafeId);
    if (interval) {
      clearInterval(interval);
      intervalRefs.current.delete(cafeId);
    }
  };

  const startSlide = (cafeId: number, galleryLength: number) => {
    stopSlide(cafeId);
    const interval = setInterval(() => {
      setGalleryStates(prev => ({
        ...prev,
        [cafeId]: (prev[cafeId] ?? 0 + 1) % galleryLength,
      }));
    }, 4000);
    intervalRefs.current.set(cafeId, interval);
  };

  const handlePrevGallery = (cafeId: number, galleryLength: number) => {
    setGalleryStates(prev => ({
      ...prev,
      [cafeId]: (prev[cafeId] ?? 0 - 1 + galleryLength) % galleryLength,
    }));
  };

  const handleNextGallery = (cafeId: number, galleryLength: number) => {
    setGalleryStates(prev => ({
      ...prev,
      [cafeId]: (prev[cafeId] ?? 0 + 1) % galleryLength,
    }));
  };

  const handleGalleryHover = (cafeId: number, galleryLength: number, isHovering: boolean) => {
    if (isHovering) {
      stopSlide(cafeId);
    } else {
      startSlide(cafeId, galleryLength);
    }
  };

  // Clear all intervals on unmount
  useEffect(() => {
    return () => {
      intervalRefs.current.forEach(interval => clearInterval(interval));
      intervalRefs.current.clear();
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Get search query from searchParams
        let searchValue = "";
        if (searchParams) {
          const params = "then" in searchParams ? await searchParams : searchParams;
          searchValue = params?.search || "";
          setSearchQuery(searchValue);
        }

        const res = await apiListCafes({
          search: searchValue || undefined,
          limit: 100,
          offset: 0,
        });
        if (!active) return;
        const data = res.data ?? [];
        setItems(data);
      } catch (e: unknown) {
        if (active) {
          const msg =
            typeof e === "object" && e !== null && "message" in e
              ? String((e as { message?: string }).message ?? "")
              : "";
          setError(msg || "Gagal memuat daftar coffeeshop.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [searchParams]);

  const cards: UiCafeCard[] = useMemo(() => {
    return (items ?? []).map((c) => {
      let gallery_urls = (c as unknown as { gallery_urls?: string[] }).gallery_urls ?? [];

      if (gallery_urls.length === 0) {
        const rawPhotos = (c as unknown as { photos?: Array<{ url?: string }> }).photos ?? [];
        gallery_urls = rawPhotos.filter(p => p.url).map(p => p.url as string);
      }

      return {
        id: Number(c.id),
        name: c.name ?? "Coffeeshop",
        location: (c.address ?? "Alamat belum diisi").toString(),
        rating: Number((c as unknown as { avg_rating?: number }).avg_rating ?? 0),
        reviews: Number((c as unknown as { review_count?: number }).review_count ?? 0),
        img: pickImage(c),
        gallery: gallery_urls,
      };
    });
  }, [items]);

  // Start auto slide for all cards with multiple photos when cards load
  useEffect(() => {
    cards.forEach(shop => {
      if (shop.gallery.length > 1) {
        startSlide(shop.id, shop.gallery.length);
      }
    });

    // Cleanup: clear intervals when cards change
    return () => {
      intervalRefs.current.forEach((interval, cafeId) => {
        const stillExists = cards.some((c) => c.id === cafeId);
        if (!stillExists) {
          clearInterval(interval);
          intervalRefs.current.delete(cafeId);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.map(c => c.id).join(',')]);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 max-w-7xl mx-auto w-full px-6 md:px-12">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="hover:bg-gray-100 p-1 rounded-full transition">
            <ArrowLeft size={28} className="text-[#2b210a]" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#2b210a]">
              Semua Daftar Coffeeshop
            </h1>
            {searchQuery && (
              <p className="text-gray-500 mt-1">
                Hasil pencarian untuk: <span className="font-semibold text-[#2b210a]">"{searchQuery}"</span>
              </p>
            )}
          </div>
        </div>

        {/* LISTING */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">Memuat...</div>
        ) : error ? (
          <div className="py-20">
            <p className="text-center text-red-600">{error}</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            {searchQuery ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg">Tidak ada coffeeshop ditemukan untuk</p>
                <p className="font-semibold text-[#2b210a]">"{searchQuery}"</p>
                <p className="text-sm mt-2">Yuk, bantu kami dengan menambahkan coffeeshop baru!</p>
                <a
                  href="/mitra/daftar"
                  className="mt-4 inline-block bg-[#271F01] text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition shadow-lg"
                >
                  Daftar coffeeshop
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p>Tidak ada coffeeshop ditemukan.</p>
                <a
                  href="/mitra/daftar"
                  className="mt-4 inline-block bg-[#271F01] text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition shadow-lg"
                >
                  Daftar coffeeshop
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 mb-20">
            {cards.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col md:flex-row p-6 md:p-8 gap-8 transition-transform hover:scale-[1.01]"
              >
                {/* Image Slider Container */}
                <div className="relative w-full md:w-[320px] h-[200px] rounded-3xl overflow-hidden flex-shrink-0 bg-gray-100">
                  {shop.gallery.length > 0 ? (
                    <div
                      className="w-full h-full relative"
                      onMouseEnter={() => handleGalleryHover(shop.id, shop.gallery.length, true)}
                      onMouseLeave={() => handleGalleryHover(shop.id, shop.gallery.length, false)}
                    >
                      <Image
                        src={resolveImageUrl(shop.gallery[galleryStates[shop.id] ?? 0])}
                        alt={`${shop.name} - Gallery ${(galleryStates[shop.id] ?? 0) + 1}`}
                        fill
                        className="object-cover"
                        priority
                      />

                      {/* Navigation arrows */}
                      {shop.gallery.length > 1 && (
                        <>
                          <button
                            onClick={() => handlePrevGallery(shop.id, shop.gallery.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-lg transition z-10 cursor-pointer"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            onClick={() => handleNextGallery(shop.id, shop.gallery.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-lg transition z-10 cursor-pointer"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </>
                      )}

                      {/* Dots indicator */}
                      {shop.gallery.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                          {shop.gallery.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setGalleryStates(prev => ({ ...prev, [shop.id]: idx }));
                              }}
                              className={`w-1.5 h-1.5 rounded-full transition ${idx === (galleryStates[shop.id] ?? 0) ? "bg-white" : "bg-white/50"
                                }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Image
                      src={resolveImageUrl(shop.img)}
                      alt={shop.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const el = e.currentTarget;
                        if (el.src.includes("/img/home/bg-section.jpg")) return;
                        el.src = "/img/home/bg-section.jpg";
                      }}
                    />
                  )}
                </div>

                {/* Content Container */}
                <div className="flex flex-col justify-center gap-3">
                  <h2 className="text-3xl font-bold text-[#2b210a]">{shop.name}</h2>

                  <div className="flex items-start gap-2 text-gray-500">
                    <MapPin size={18} className="mt-1 flex-shrink-0" />
                    <p className="text-sm leading-relaxed max-w-xl">{shop.location}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[#2b210a]">{shop.rating > 0 ? shop.rating.toFixed(1) : "-"}</span>
                    <span className="text-gray-400">({shop.reviews} Ulasan)</span>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/pengguna/coffeeshop/${shop.id}`}
                      className="inline-block bg-[#271F01] text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition shadow-lg"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

