// src/app/coffee-shop/[slug]/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";
import {
  apiCafeDetail,
  apiCafeMenu,
  apiListCafes,
} from "@/lib/api";
import type { Cafe, MenuItem } from "@/types/domain";

type Props = {
  params: { slug: string };
};

export default function CafeDetailPage({ params }: Props) {
  const router = useRouter();
  const { slug } = params;

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // helper parse DECIMAL string → number | null
  const toNum = (v: number | string | null | undefined): number | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  const mapsHref = useMemo(() => {
    if (!cafe) return "#";
    const lat = toNum(cafe.lat);
    const lng = toNum(cafe.lng);
    if (lat !== null && lng !== null) return `https://www.google.com/maps?q=${lat},${lng}`;
    const q = [cafe.name, cafe.address].filter(Boolean).join(" ");
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}`;
  }, [cafe]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        // 1) Coba anggap slug valid di backend: /api/cafes/:slug
        let c: Cafe | null = null;
        try {
          c = (await apiCafeDetail(slug)) as Cafe;
        } catch {
          // 2) Fallback: cari lewat list, cocokkan slug/name → dapat id
          const res = await apiListCafes({ search: slug });
          const exact =
            res.data.find((x) => x.slug === slug) ??
            res.data.find((x) =>
              x.name?.toLowerCase().includes(slug.toLowerCase())
            ) ??
            null;
          if (exact) {
            c = (await apiCafeDetail(exact.id)) as Cafe;
          }
        }

        if (!c) {
          throw new Error("Coffeeshop tidak ditemukan.");
        }

        if (!mounted) return;
        setCafe(c);

        // Ambil menu berdasarkan id (lebih aman)
        try {
          const m = await apiCafeMenu(c.id);
          // API kamu kadang {data: []}, kadang langsung array → normalisasi
          const items = Array.isArray(m) ? m : (m as { data: MenuItem[] })?.data ?? [];
          if (!mounted) return;
          setMenu(items);
        } catch {
          if (!mounted) return;
          setMenu([]);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal memuat coffeeshop.";
        if (!mounted) return;
        setErr(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) return <SkeletonPage />;

  if (err) {
    return (
      <main className="min-h-screen bg-white text-[#2b210a]">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm border border-neutral-300 rounded-xl px-3 py-2 hover:bg-neutral-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>

          <div className="mt-10 text-center text-red-600">{err}</div>
        </div>
      </main>
    );
  }

  if (!cafe) return null;

  const cover = cafe.cover_url ?? "/img/placeholder/cafe.jpg";

  return (
    <main className="min-h-screen bg-white text-[#2b210a]">
      {/* Hero image dengan overlay simpel (clean, tidak mengubah gaya global) */}
      <section className="relative h-[320px] md:h-[420px] w-full">
        <Image
          src={cover}
          alt={cafe.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-white text-3xl md:text-5xl font-extrabold drop-shadow">
              {cafe.name}
            </h1>
            {cafe.address && (
              <p className="mt-2 text-neutral-100 max-w-3xl drop-shadow">
                {cafe.address}
              </p>
            )}
            <div className="mt-4">
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#2b210a] font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-[#4b3b09] hover:text-white transition"
              >
                <MapPin className="w-5 h-5" />
                Buka di Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Konten */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-10 space-y-10">
        {/* Deskripsi */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Tentang Coffeeshop</h2>
          <p className="text-sm leading-relaxed text-neutral-700">
            {cafe.description ?? "Belum ada deskripsi."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 text-sm">
            <InfoItem label="Instagram" value={cafe.instagram ? `@${trimAt(cafe.instagram)}` : "—"} />
            <InfoItem label="Telepon" value={cafe.phone ?? "—"} />
            <InfoItem
              label="Jam Operasional"
              value={
                cafe.opening_hours
                  ? formatOpeningHours(cafe.opening_hours)
                  : "—"
              }
            />
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Menu</h2>
          </div>

          {menu.length === 0 ? (
            <p className="text-sm text-neutral-600 mt-4">
              Belum ada menu yang ditampilkan.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {menu.map((m) => (
                <MenuCard key={m.id} item={m} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* ========== Sub Components ========== */

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  const price = formatIDR(item.price ?? 0);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition">
      {item.photo_url ? (
        // NOTE: bisa diganti ke next/image kalau kamu mau optimasi; <img> minim props biar aman
        <img
          src={item.photo_url}
          alt={item.name}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-neutral-100" />
      )}
      <div className="p-4">
        <div className="font-semibold">{item.name}</div>
        {item.category && (
          <div className="text-xs text-neutral-500 mt-0.5">{item.category}</div>
        )}
        {item.description && (
          <p className="text-sm text-neutral-700 mt-2 line-clamp-3">{item.description}</p>
        )}
        <div className="mt-3 font-bold">{price}</div>
      </div>
    </div>
  );
}

/* ========== Skeleton ========== */
function SkeletonPage() {
  return (
    <main className="min-h-screen bg-white text-[#2b210a]">
      <div className="h-[320px] md:h-[420px] w-full bg-neutral-200 animate-pulse" />
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-10 space-y-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="h-6 w-56 bg-neutral-200 rounded mb-4 animate-pulse" />
          <div className="h-4 w-full bg-neutral-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-2/3 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="h-6 w-24 bg-neutral-200 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="w-full h-40 bg-neutral-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 w-2/3 bg-neutral-200 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-1/3 bg-neutral-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ========== Utils ========== */

function formatIDR(n: number): string {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n || 0);
  } catch {
    return `Rp ${n || 0}`;
  }
}

function trimAt(v: string) {
  // "https://instagram.com/solti" → "solti", "@solti" → "solti"
  return v.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "");
}

function formatOpeningHours(oh: Record<string, string>) {
  // contoh singkat: gabungkan beberapa hari yang diisi
  const keys = Object.keys(oh);
  if (keys.length === 0) return "—";
  // tampilkan maksimal 3 entri agar ringkas
  const lines = keys.slice(0, 3).map((k) => `${capitalize(k)}: ${oh[k]}`);
  const more = keys.length > 3 ? `, +${keys.length - 3} hari` : "";
  return lines.join(", ") + more;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
