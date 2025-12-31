// frontend/src/lib/api.ts

import type {
  AuthResp,
  MeResp,
  ListCafesResp,
  MitraDashboardResp,
  Cafe,
  MenuItem,
  Review,
} from "@/types/domain";

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(
  /\/+$/,
  ""
);

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOpts = RequestInit & {
  timeoutMs?: number;
};

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const url = `${API_BASE}${path}`;

  const ac =
    typeof AbortController !== "undefined" ? new AbortController() : undefined;
  let timeout: NodeJS.Timeout | undefined;

  if (opts.timeoutMs && ac) {
    timeout = setTimeout(() => ac.abort(), opts.timeoutMs);
  }

  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string>),
  };

  if (opts.body && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method: (opts.method as HttpMethod) ?? "GET",
    headers,
    body: opts.body as BodyInit | null | undefined,
    signal: ac?.signal,
    credentials: "include",
  }).finally(() => {
    if (timeout) clearTimeout(timeout);
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    let msg = `HTTP ${res.status}`;

    try {
      if (ct.includes("application/json")) {
        const j = await res.json();
        msg = j?.message || j?.error || msg;
      } else {
        const t = await res.text();
        if (t) msg = t;
      }
    } catch {}

    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }

  return (await res.text()) as unknown as T;
}

/** Multipart helper */
async function requestMultipart<T>(
  path: string,
  form: FormData,
  opts: Omit<RequestOpts, "headers" | "body"> = {}
): Promise<T> {
  return request<T>(path, {
    ...opts,
    method: opts.method ?? "POST",
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
  return request<MeResp>(`/api/auth/me`);
}

export async function apiLogout() {
  return request(`/api/auth/logout`, { method: "POST" });
}

// =================== OTP ===================

export async function apiSendOtp(
  payload: { email: string; reason?: string } | string
) {
  const body =
    typeof payload === "string"
      ? { email: payload, reason: "register" }
      : { email: payload.email, reason: payload.reason ?? "register" };

  return request(`/api/auth/send-otp`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

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
    code: payload.code ?? payload.otp ?? "",
    reason: payload.reason ?? payload.purpose ?? payload.kind ?? "register",
  };

  return request(`/api/auth/verify-otp`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// =================== MITRA ===================

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
  opening_hours?: unknown;
}) {
  return request<AuthResp>(`/api/mitra/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiMitraDashboard() {
  return request<MitraDashboardResp>(`/api/mitra/dashboard`);
}
export async function apiMitraReport(params?: Record<string, string | number | boolean>) {
  const q = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) q.set(k, String(v));
  });

  return request(`/api/mitra/report${q.toString() ? `?${q}` : ""}`);
}


// =================== CAFES ===================

export async function apiListCafes(params?: {
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
  offset?: number;
}) {
  const q = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) q.set(k, String(v));
  });

  return request<ListCafesResp>(`/api/cafes${q.toString() ? `?${q}` : ""}`);
}

export async function apiCafeDetail(id: number | string) {
  return request(`/api/cafes/${id}`);
}

export async function apiCafeReviews(
  cafeId: number | string,
  params?: {
    rating?: number;
    limit?: number;
    offset?: number;
    status?: "published" | "pending";
  }
) {
  const q = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) q.set(k, String(v));
  });

  return request(`/api/cafes/${cafeId}/reviews${q.toString() ? `?${q}` : ""}`);
}

export async function apiCreateReview(
  cafeId: number | string,
  payload: { rating: number; text?: string }
) {
  return request(`/api/cafes/${cafeId}/reviews`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiCafeMenu(id: number | string) {
  return request<MenuItem[] | { data: MenuItem[] }>(`/api/cafes/${id}/menu`);
}

export async function apiMyCafes() {
  return request<{ data: Cafe[] }>(`/api/users/me/cafes`);
}

// =================== MENU ===================

export async function apiCreateMenuItem(payload: {
  cafe_id: number;
  name: string;
  category?: string;
  price: number;
  description?: string;
  photo_url?: string;
  is_available?: boolean;
}) {
  return request(`/api/menus`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateMenuItem(id: number, patch: Partial<MenuItem>) {
  return request(`/api/menus/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

export async function apiDeleteMenuItem(id: number) {
  return request(`/api/menus/${id}`, { method: "DELETE" });
}

// =================== FAVORITES ===================

export async function apiMyFavorites() {
  return request(`/api/users/me/favorites`);
}

export async function apiAddFavorite(cafeId: number | string) {
  return request(`/api/users/me/favorites/${cafeId}`, { method: "POST" });
}

export async function apiRemoveFavorite(cafeId: number | string) {
  return request(`/api/users/me/favorites/${cafeId}`, { method: "DELETE" });
}

// =================== UPLOAD ===================

export async function apiUploadTempImage(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  return requestMultipart(`/api/uploads/image`, fd);
}

// =================== PASSWORD ===================

export async function apiForgotPassword(
  email: string
): Promise<{ message?: string }> {
  return request(`/api/auth/forgot-password`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}


export async function apiResetPassword(token: string, password: string) {
  return request(`/api/auth/reset-password`, {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}
