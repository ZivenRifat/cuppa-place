// src/app/mitra/manajemen-cafe/informasi/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGetMyCafe, apiUpdateCafe } from "@/lib/api";
import type { Cafe } from "@/types/domain";

type TimeRange = { start: string; end: string }; // "HH:MM"
type DayHours = { open: boolean; allDay?: boolean; ranges: TimeRange[] };
type OpeningHours = {
  mon: DayHours; tue: DayHours; wed: DayHours; thu: DayHours;
  fri: DayHours; sat: DayHours; sun: DayHours;
};

const DAY_LABELS: { key: keyof OpeningHours; label: string }[] = [
  { key: "mon", label: "Senin" },
  { key: "tue", label: "Selasa" },
  { key: "wed", label: "Rabu" },
  { key: "thu", label: "Kamis" },
  { key: "fri", label: "Jumat" },
  { key: "sat", label: "Sabtu" },
  { key: "sun", label: "Minggu" },
];

const DEFAULT_DAY: DayHours = { open: true, allDay: false, ranges: [{ start: "08:00", end: "22:00" }] };
const DEFAULT_HOURS: OpeningHours = {
  mon: { ...DEFAULT_DAY },
  tue: { ...DEFAULT_DAY },
  wed: { ...DEFAULT_DAY },
  thu: { ...DEFAULT_DAY },
  fri: { ...DEFAULT_DAY },
  sat: { open: true, allDay: false, ranges: [{ start: "08:00", end: "23:00" }] },
  sun: { open: true, allDay: false, ranges: [{ start: "08:00", end: "23:00" }] },
};

const tz = "Asia/Jakarta";

// ---- helpers ----
const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
};

type ValidationResult = { ok: true; s: number; e: number } | { ok: false; msg: string };

function rangesValid(ranges: TimeRange[]): string | null {
  // basic checks: HH:MM valid, start < end, no overlap
  const parsed = ranges.map((r, idx) => {
    const s = toMin(r.start);
    const e = toMin(r.end);
    if (Number.isNaN(s) || Number.isNaN(e)) return { ok: false, msg: `Format jam tidak valid pada rentang #${idx + 1}` };
    if (s >= e) return { ok: false, msg: `Jam mulai harus < jam selesai pada rentang #${idx + 1}` };
    return { ok: true, s, e };
  });

  for (const p of parsed) {
    if (!p.ok) return p.msg ?? "Terjadi kesalahan validasi";
  }

  // overlap
  const sorted = (parsed as { ok: true; s: number; e: number }[]).sort((a, b) => a.s - b.s);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].s < sorted[i - 1].e) {
      return `Rentang #${i} bertabrakan dengan rentang #${i}`;
    }
  }
  return null;
}

function nowJakarta(): { dayKey: keyof OpeningHours; minutes: number; label: string } {
  // ambil HH:MM & weekday di Asia/Jakarta
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = Object.fromEntries(f.formatToParts(new Date()).map(p => [p.type, p.value]));
  const hh = parseInt(parts.hour ?? "0", 10);
  const mm = parseInt(parts.minute ?? "0", 10);
  const wd = (parts.weekday ?? "Mon").slice(0, 3);
  const map: Record<string, keyof OpeningHours> = {
    Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat", Sun: "sun",
  };
  return { dayKey: map[wd] || "mon", minutes: hh * 60 + mm, label: `${parts.weekday}, ${parts.hour}:${parts.minute} WIB` };
}

function isOpenNow(hours: OpeningHours): { open: boolean; until?: string } {
  const { dayKey, minutes } = nowJakarta();
  const day = hours[dayKey];
  if (!day.open) return { open: false };
  if (day.allDay) return { open: true, until: "23:59" };
  const rs = day.ranges ?? [];
  for (const r of rs) {
    const s = toMin(r.start);
    const e = toMin(r.end);
    if (minutes >= s && minutes < e) return { open: true, until: r.end };
  }
  return { open: false };
}

function parseOpeningHours(json: string | null | undefined): OpeningHours {
  if (!json) return DEFAULT_HOURS;
  try {
    const parsed = JSON.parse(json);
    // Validate structure
    const result: OpeningHours = { ...DEFAULT_HOURS };
    for (const key of DAY_LABELS) {
      if (parsed[key.key] && typeof parsed[key.key] === "object") {
        result[key.key] = {
          open: Boolean(parsed[key.key].open),
          allDay: Boolean(parsed[key.key].allDay),
          ranges: Array.isArray(parsed[key.key].ranges) ? parsed[key.key].ranges : [],
        };
      }
    }
    return result;
  } catch {
    return DEFAULT_HOURS;
  }
}

export default function InformasiCafePage() {
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------- Basic sections (Name + About + Alamat) --------
  const [cafeName, setCafeName] = useState<string>("");
  const [about, setAbout] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  // -------- Opening Hours --------
  const [hours, setHours] = useState<OpeningHours>(DEFAULT_HOURS);

  // Fetch cafe data on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cafeData = await apiGetMyCafe();
        if (!mounted) return;
        if (cafeData) {
          setCafe(cafeData);
          setCafeName(cafeData.name || "");
          setAbout(cafeData.description || "");
          setAddress(cafeData.address || "");
          setHours(parseOpeningHours(cafeData.opening_hours as unknown as string));
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to fetch cafe:", err);
          setError("Gagal memuat data cafe");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const status = useMemo(() => isOpenNow(hours), [hours]);
  const nowLabel = useMemo(() => nowJakarta().label, [hours]);

  // tick per 30s biar indikator update
  useEffect(() => {
    const id = setInterval(() => {
      setHours((h) => ({ ...h }));
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // ---- handlers opening hours ----
  const setDay = (key: keyof OpeningHours, patch: Partial<DayHours>) => {
    setHours((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const addRange = (key: keyof OpeningHours) => {
    const d = hours[key];
    const next: TimeRange = { start: "08:00", end: "22:00" };
    setDay(key, { ranges: [...(d.ranges ?? []), next], open: true, allDay: false });
  };

  const removeRange = (key: keyof OpeningHours, idx: number) => {
    const d = hours[key];
    const arr = [...(d.ranges ?? [])];
    arr.splice(idx, 1);
    setDay(key, { ranges: arr });
  };

  const updateRange = (key: keyof OpeningHours, idx: number, patch: Partial<TimeRange>) => {
    const d = hours[key];
    const arr = [...(d.ranges ?? [])];
    arr[idx] = { ...arr[idx], ...patch };
    setDay(key, { ranges: arr, allDay: false });
  };

  const toggleOpen = (key: keyof OpeningHours, open: boolean) => {
    if (!open) {
      setDay(key, { open: false, allDay: false, ranges: [] });
    } else {
      setDay(key, { open: true, allDay: false, ranges: hours[key].ranges.length ? hours[key].ranges : [{ start: "08:00", end: "22:00" }] });
    }
  };

  const setAllDay = (key: keyof OpeningHours, allDay: boolean) => {
    if (allDay) {
      setDay(key, { open: true, allDay: true, ranges: [{ start: "00:00", end: "23:59" }] });
    } else {
      setDay(key, { allDay: false, ranges: [{ start: "08:00", end: "22:00" }] });
    }
  };

  const copyToAll = (from: keyof OpeningHours) => {
    const src = hours[from];
    const payload = { open: src.open, allDay: src.allDay, ranges: [...(src.ranges ?? [])] };
    const next: OpeningHours = {
      mon: { ...payload },
      tue: { ...payload },
      wed: { ...payload },
      thu: { ...payload },
      fri: { ...payload },
      sat: { ...payload },
      sun: { ...payload },
    };
    setHours(next);
  };

  const copyToWeekdays = (from: keyof OpeningHours) => {
    const src = hours[from];
    const payload = { open: src.open, allDay: src.allDay, ranges: [...(src.ranges ?? [])] };
    setHours((prev) => ({
      ...prev,
      mon: { ...payload }, tue: { ...payload }, wed: { ...payload }, thu: { ...payload }, fri: { ...payload },
    }));
  };

  const copyToWeekend = (from: keyof OpeningHours) => {
    const src = hours[from];
    const payload = { open: src.open, allDay: src.allDay, ranges: [...(src.ranges ?? [])] };
    setHours((prev) => ({ ...prev, sat: { ...payload }, sun: { ...payload } }));
  };

  const validateAll = (): string[] => {
    const errs: string[] = [];
    DAY_LABELS.forEach(({ key, label }) => {
      const d = hours[key];
      if (!d.open) return; // closed ok
      if (d.allDay) return; // all day ok
      const msg = rangesValid(d.ranges ?? []);
      if (msg) errs.push(`${label}: ${msg}`);
    });
    return errs;
  };

  const handleSaveCafe = async () => {
    if (!cafe?.id) {
      alert("Cafe tidak ditemukan");
      return;
    }

    const errs = validateAll();
    if (errs.length) {
      alert("Periksa jam operasional:\n- " + errs.join("\n- "));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Prepare opening_hours JSON
      const openingHoursJson: Record<string, unknown> = {};
      for (const { key } of DAY_LABELS) {
        const d = hours[key];
        openingHoursJson[key] = {
          open: d.open,
          allDay: d.allDay,
          ranges: d.ranges,
        };
      }

      await apiUpdateCafe(cafe.id, {
        name: cafeName,
        description: about,
        address: address,
        opening_hours: openingHoursJson as unknown as Record<string, string>,
      });

      alert("Informasi cafe berhasil disimpan!");
    } catch (err) {
      console.error("Failed to save cafe:", err);
      setError(err instanceof Error ? err.message : "Gagal menyimpan data cafe");
      alert("Gagal menyimpan data cafe");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </section>
    );
  }

  if (!cafe) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600">
          <p>Anda belum memiliki cafe. Silakan daftar sebagai mitra terlebih dahulu.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#1b1405]">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Nama Cafe */}
      <div className="bg-white p-6 rounded-lg border border-gray-300/40 shadow-md hover:shadow-lg">
        <h3 className="text-xl font-bold mb-2">Nama Cafe</h3>
        <p className="text-sm mb-4">Ubah nama coffeeshop anda di sini!</p>
        <input
          type="text"
          className="w-full p-3 border border-gray-300/80 rounded-md bg-white focus:outline-none"
          value={cafeName}
          onChange={(e) => setCafeName(e.target.value)}
          placeholder="Nama coffeeshop..."
        />
        <div className="flex gap-3 justify-end mt-3">
          <button
            className="bg-[#2b210a] text-white px-4 py-2 rounded-md disabled:opacity-50"
            onClick={handleSaveCafe}
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Nama"}
          </button>
          <button className="bg-gray-200 px-4 py-2 rounded-md" onClick={() => setCafeName(cafe.name || "")}>
            Batalkan
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white p-6 rounded-lg border border-gray-300/40 shadow-md hover:shadow-lg">
        <h3 className="text-xl font-bold mb-2">About</h3>
        <p className="text-sm mb-4">Ceritakan tentang coffeeshop anda di sini!</p>
        <textarea
          className="w-full p-3 border border-gray-300/80 rounded-md bg-white focus:outline-none"
          rows={4}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Deskripsi coffeeshop..."
        />
        <div className="flex gap-3 justify-end mt-3">
          <button
            className="bg-[#2b210a] text-white px-4 py-2 rounded-md disabled:opacity-50"
            onClick={handleSaveCafe}
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan About"}
          </button>
          <button className="bg-gray-200 px-4 py-2 rounded-md" onClick={() => setAbout(cafe.description || "")}>
            Batalkan
          </button>
        </div>
      </div>

      {/* Jam Operasional */}
      <div className="bg-white p-6 rounded-lg border border-gray-300/40 shadow-md hover:shadow-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-xl font-bold">Jam Operasional</h3>
            <p className="text-sm text-gray-600">Atur jam buka/tutup per hari (WIB).</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-2 font-semibold ${status.open ? "text-green-600" : "text-red-600"}`}>
              <span className={`w-3 h-3 rounded-full ${status.open ? "bg-green-500" : "bg-red-500"}`} />
              {status.open ? `Sedang Buka ${status.until ? `(tutup ${status.until})` : ""}` : "Sedang Tutup"}
            </span>
            <span className="text-xs text-gray-500">Sekarang: {nowLabel}</span>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {DAY_LABELS.map(({ key, label }) => {
            const d = hours[key];
            return (
              <div key={key} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{label}</h4>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={d.open}
                        onChange={(e) => toggleOpen(key, e.target.checked)}
                      />
                      <span>{d.open ? "Buka" : "Tutup"}</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        disabled={!d.open}
                        checked={!!d.allDay}
                        onChange={(e) => setAllDay(key, e.target.checked)}
                      />
                      <span>24 Jam</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                      onClick={() => copyToAll(key)}
                      title="Salin ke semua hari"
                    >
                      Copy → Semua
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                      onClick={() => copyToWeekdays(key)}
                      title="Salin ke Sen–Jum"
                    >
                      Copy → Weekdays
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                      onClick={() => copyToWeekend(key)}
                      title="Salin ke Sab–Min"
                    >
                      Copy → Weekend
                    </button>
                  </div>
                </div>

                {d.open && !d.allDay && (
                  <div className="mt-3 space-y-3">
                    {(d.ranges ?? []).map((r, idx) => (
                      <div key={idx} className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Mulai</label>
                          <input
                            type="time"
                            value={r.start}
                            onChange={(e) => updateRange(key, idx, { start: e.target.value })}
                            className="border rounded-md px-2 py-1"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Selesai</label>
                          <input
                            type="time"
                            value={r.end}
                            onChange={(e) => updateRange(key, idx, { end: e.target.value })}
                            className="border rounded-md px-2 py-1"
                          />
                        </div>
                        <button
                          className="ml-auto px-3 py-1.5 rounded-md border text-sm text-red-600 hover:bg-red-50"
                          onClick={() => removeRange(key, idx)}
                        >
                          Hapus
                        </button>
                      </div>
                    ))}

                    <button
                      className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                      onClick={() => addRange(key)}
                    >
                      + Tambah Rentang Jam
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-end mt-5">
          <button
            className="bg-[#2b210a] text-white px-4 py-2 rounded-md disabled:opacity-50"
            onClick={handleSaveCafe}
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Jam Operasional"}
          </button>
          <button className="bg-gray-200 px-4 py-2 rounded-md" onClick={() => setHours(parseOpeningHours(cafe.opening_hours as unknown as string))}>
            Kembalikan Default
          </button>
        </div>
      </div>

      {/* Alamat Cafe */}
      <div className="bg-white p-6 rounded-lg border border-gray-300/40 shadow-md hover:shadow-lg">
        <h3 className="text-xl font-bold mb-2">Alamat Cafe</h3>
        <p className="text-sm mb-3">Masukan alamat cafe anda here!</p>
        <textarea
          className="w-full p-3 border border-gray-300/80 rounded-md bg-white focus:outline-none"
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Jl. ..."
        />
        <div className="flex gap-3 justify-end mt-3">
          <button
            className="bg-[#2b210a] text-white px-4 py-2 rounded-md disabled:opacity-50"
            onClick={handleSaveCafe}
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Alamat"}
          </button>
          <button className="bg-gray-200 px-4 py-2 rounded-md" onClick={() => setAddress(cafe.address || "")}>
            Batalkan
          </button>
        </div>
      </div>
    </section>
  );
}

