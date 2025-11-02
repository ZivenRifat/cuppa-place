import type {
  AuthResp,
  MeResp,
  ListCafesResp,
  MitraDashboardResp,
  Cafe,
  MenuItem,
  Review,
} from "@/types/domain";

// ===== Base URL =====
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/+$/, "");

// ===== Token helpers (localStorage; aman untuk SSR karena guarded typeof window) =====
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cuppa_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("cuppa_token", token);
  else localStorage.removeItem("cuppa_token");
}

export function clearToken() {
  setToken(null);
}

// ===== HTTP core =====
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOpts = RequestInit & {
  auth?: boolean;
  timeoutMs?: number;
};

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {

const url = `${API_BASE}${path}`;

  // AbortController untuk timeout optional
  const ac = typeof AbortController !== "undefined" ? new AbortController() : undefined;
  let timeout: NodeJS.Timeout | undefined;
  if (opts.timeoutMs && ac) {
    timeout = setTimeout(() => ac.abort(), opts.timeoutMs);
  }

  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string>),
  };

  // default Content-Type untuk body JSON
  if (opts.body && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (opts.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: (opts.method as HttpMethod) ?? "GET",
    headers,
    body: opts.body as BodyInit | null | undefined,
    signal: ac?.signal,
    credentials: "omit",
  }).catch((e) => {
    if (timeout) clearTimeout(timeout);
    throw e;
  });

  if (timeout) clearTimeout(timeout);

  // auto-clear token jika 401
  if (res.status === 401) {
    clearToken();
  }

  if (!res.ok) {
    // coba ambil pesan error dari JSON atau text
    const ct = res.headers.get("content-type") || "";
    let msg = `HTTP ${res.status}`;
    try {
      if (ct.includes("application/json")) {
        const j = await res.json().catch(() => ({} as Record<string, unknown>));
        if (typeof j === "object" && j !== null) {
          const obj = j as Record<string, unknown>;
          if (typeof obj.message === "string") msg = obj.message;
          else if (typeof obj.error === "string") msg = obj.error;
        } else if (typeof j === "string") {
          msg = j;
        }
      } else {
        const t = await res.text();
        if (t) msg = t;
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  // 204 No Content → undefined as any
  if (res.status === 204) return undefined as unknown as T;

  // parse JSON hanya jika content-type json
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }
  // kalau bukan JSON, kembalikan text sebagai apapun (jarang dipakai di API JSON)
  const text = await res.text();
  return text as unknown as T;
}

/** Multipart helper (FormData). Jangan set Content-Type manual—browser yang set boundary. */
async function requestMultipart<T>(
  path: string,
  form: FormData,
  opts: Omit<RequestOpts, "headers" | "body"> & { headers?: Record<string, string> } = {}
): Promise<T> {
  const { headers = {}, ...rest } = opts;
  // Hapus Content-Type agar boundary otomatis
  const safeHeaders = { ...headers };
  delete (safeHeaders as Record<string, string>)["Content-Type"];
  return request<T>(path, {
    ...rest,
    method: rest.method ?? "POST",
    headers: safeHeaders,
    body: form,
  });
}

// =================== AUTH ===================

export async function apiLogin(payload: { email: string; password: string }) {
  return request<AuthResp>(`/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiRegister(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  return request<AuthResp>(`/api/auth/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiMe() {
  return request<MeResp>(`/api/auth/me`, { auth: true });
}

/** Opsional—kalau backend-mu menyediakan endpoint logout */
export async function apiLogout() {
  try {
    await request<void>(`/api/auth/logout`, { method: "POST", auth: true });
  } finally {
    clearToken();
  }
}

// =================== OTP (untuk Step Verifikasi) ===================

/** Kirim OTP ke email.
 *  Menerima string email atau object { email, reason }.
 *  Akan mengirim ke /api/auth/send-otp lalu fallback ke /api/otp/send bila 404.
 */
export async function apiSendOtp(payload: { email: string; reason?: string } | string) {
  const body =
    typeof payload === "string"
      ? { email: payload, reason: "register" }
      : { email: payload.email, reason: payload.reason ?? "register" };

  try {
    return await request<{ ok: true }>(`/api/auth/send-otp`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("HTTP 404") || /not\s*found/i.test(msg)) {
      return request<{ ok: true }>(`/api/otp/send`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    }
    throw e;
  }
}

/** Verifikasi OTP.
 *  Terima berbagai bentuk (code|otp, reason|purpose|kind) dan normalisasi jadi { email, code, reason }.
 */
export async function apiVerifyOtp(payload: {
  email: string;
  code?: string;
  otp?: string;
  reason?: string;
  purpose?: string;
  kind?: string;
}) {
  const body = {
    email: payload.email,
    code: payload.code ?? payload.otp ?? "", // backend kamu baca 'code'
    reason: payload.reason ?? payload.purpose ?? payload.kind ?? "register",
  };

  try {
    return await request<{ ok: true }>(`/api/auth/verify-otp`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("HTTP 404") || /not\s*found/i.test(msg)) {
      return request<{ ok: true }>(`/api/otp/verify`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    }
    throw e;
  }
}




// =================== REGISTER MITRA ===================

/**
 * Register Mitra
 * Tetap mempertahankan path lama (/api/mitra/register).
 * Jika 404, fallback ke /api/auth/mitra/register.
 * Sekarang mendukung `opening_hours` (opsional) agar sinkron dengan UI jam operasional.
 */
export async function apiRegisterMitra(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cafe_name: string;
  address?: string;
  lat?: number;
  lng?: number;
  instagram?: string;
  // Opening hours wire format—biarkan fleksibel; backend bisa tentukan bentuk pasti.
  opening_hours?: unknown;
}) {
  try {
    return await request<AuthResp>(`/api/mitra/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("HTTP 404") || /not\s*found/i.test(msg)) {
      return request<AuthResp>(`/api/auth/mitra/register`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
    throw e;
  }
}

// =================== DASHBOARD MITRA ===================

export async function apiMitraDashboard() {
  return request<MitraDashboardResp>(`/api/mitra/dashboard`, { auth: true });
}

// =================== CAFES & REVIEWS ===================

export async function apiListCafes(params?: {
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number; // meter
  limit?: number;
  offset?: number;
}) {
  const q = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) q.set(k, String(v));
    });
  }
  const qs = q.toString();
  return request<ListCafesResp>(`/api/cafes${qs ? `?${qs}` : ""}`);
}

export async function apiCafeDetail(id: number | string) {
  return request(`/api/cafes/${id}`);
}

export async function apiCafeReviews(
  cafeId: number | string,
  params?: { rating?: number; limit?: number; offset?: number; status?: "published" | "pending" }
) {
  const q = new URLSearchParams();
  if (params?.rating) q.set("rating", String(params.rating));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.offset) q.set("offset", String(params.offset));
  if (params?.status) q.set("status", params.status);

  const qs = q.toString();
  return request<{ total: number; data: Review[]; avg?: number; counts?: Record<number, number> }>(
    `/api/cafes/${cafeId}/reviews${qs ? `?${qs}` : ""}`,
    { auth: true }
  );
}

export async function apiCafeMenu(id: number | string) {
  // sebagian backend return {data:[...]}, sebagian langsung array.
  return request<MenuItem[] | { data: MenuItem[] }>(`/api/cafes/${id}/menu`);
}

/** Cafe milik user (mitra) */
export async function apiMyCafes() {
  // Tetap gunakan endpoint yang sudah kamu pakai
  return request<{ data: Cafe[] }>(`/api/users/me/cafes`, { auth: true });
}

// =================== MENU CRUD ===================

// Create
export async function apiCreateMenuItem(payload: {
  cafe_id: number;
  name: string;
  category?: string;
  price: number;
  description?: string;
  photo_url?: string;
  is_available?: boolean;
}) {
  return request<MenuItem>(`/api/menus`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

// Update
export async function apiUpdateMenuItem(
  id: number,
  patch: Partial<{
    name: string;
    category?: string;
    price: number;
    description?: string;
    photo_url?: string;
    is_available?: boolean;
  }>
) {
  return request<MenuItem>(`/api/menus/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(patch),
  });
}

// Delete
export async function apiDeleteMenuItem(id: number) {
  return request<{ ok: true }>(`/api/menus/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

// =================== UPDATE CAFE (termasuk jam operasional) ===================

export async function apiUpdateCafe(
  id: number | string,
  patch: Partial<{
    name: string;
    description: string;
    address: string;
    lat: number;
    lng: number;
    instagram: string;
    // Ganti ke tipe opening_hours yang kamu pakai di backend;
    // untuk kompatibilitas pakai unknown di sini.
    opening_hours: unknown;
    cover_url: string;
    phone: string;
  }>
) {
  return request<Cafe>(`/api/cafes/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(patch),
  });
}

// =================== LAPORAN MITRA ===================

export async function apiMitraReport(
  cafeId: number | string,
  params: { period: "daily" | "monthly" | "yearly" }
) {
  const q = new URLSearchParams();
  q.set("period", params.period);
  const qs = q.toString();
  // auth: true → hanya mitra/admin
  return request<{ series: { name: string; value: number }[]; total?: number }>(
    `/api/cafes/${cafeId}/reports${qs ? `?${qs}` : ""}`,
    { auth: true }
  );
}

// =================== FAVORITES (USER) ===================

export async function apiMyFavorites() {
  return request(`/api/users/me/favorites`, { auth: true });
}

export async function apiAddFavorite(cafeId: number | string) {
  return request(`/api/users/me/favorites/${cafeId}`, {
    method: "POST",
    auth: true,
  });
}

export async function apiRemoveFavorite(cafeId: number | string) {
  return request<{ ok: true }>(`/api/users/me/favorites/${cafeId}`, {
    method: "DELETE",
    auth: true,
  });
}

// =================== UPLOAD MEDIA (logo & galeri) ===================

/**
 * Upload satu file ke storage (temp) → balikkan URL.
 * Fallback beberapa path umum agar fleksibel dengan backend-mu.
 */
export async function apiUploadTempImage(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  try {
    return await requestMultipart<{ url: string }>(`/api/uploads/image`, fd, { auth: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("HTTP 404") || /not\s*found/i.test(msg)) {
      try {
        return await requestMultipart<{ url: string }>(`/api/uploads`, fd, { auth: true });
      } catch {
        return await requestMultipart<{ url: string }>(`/api/files/upload`, fd, { auth: true });
      }
    }
    throw e;
  }
}

/**
 * Upload logo & beberapa foto suasana ke kafe tertentu.
 * Backend umum:
 *  - POST /api/cafes/:id/media  (fields: logo?, gallery[]?)
 * Fallback:
 *  - POST /api/cafes/:id/photos
 *  - POST /api/cafes/:id/gallery
 */
export async function apiUploadCafeMedia(
  cafeId: number,
  files: { logo?: File | null; gallery?: File[] }
): Promise<{ logo_url?: string; gallery_urls?: string[] }> {
  const fd = new FormData();
  if (files.logo) fd.append("logo", files.logo);
  (files.gallery ?? []).forEach((f) => fd.append("gallery[]", f));

  const tryPaths = [
    `/api/cafes/${cafeId}/media`,
    `/api/cafes/${cafeId}/photos`,
    `/api/cafes/${cafeId}/gallery`,
  ];

  let lastErr: unknown;
  for (const p of tryPaths) {
    try {
      return await requestMultipart<{ logo_url?: string; gallery_urls?: string[] }>(p, fd, {
        auth: true,
      });
    } catch (e) {
      lastErr = e;
      // lanjut ke path berikutnya
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Upload gagal");
}
