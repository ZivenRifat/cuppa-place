// frontend/src/lib/api.ts
import type {
  AuthResp,
  MeResp,
  ListCafesResp,
  MitraDashboardResp,
  Cafe,
  MenuItem,
  ReportPeriod,
  ReportResp,
} from "@/types/domain";

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/+$/, "");

// =================== TOKEN HELPERS ===================
// Simpan token di localStorage (Bearer token)
const TOKEN_KEY = "cuppa_token";

export function setAuthToken(token: string | null | undefined) {
  if (typeof window === "undefined") return;
  if (!token) window.localStorage.removeItem(TOKEN_KEY);
  else window.localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

// =================== TOKEN RESPONSE TYPES (NO ANY) ===================
type TokenContainer = {
  token?: string;
  access_token?: string;
};

type AuthResponseWithToken = AuthResp & {
  token?: string;
  access_token?: string;
  data?: TokenContainer;
};

// Minimal safe object check (no any)
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function readStringProp(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key];
  return typeof v === "string" && v.length > 0 ? v : null;
}

function extractToken(resp: unknown): string | null {
  if (!isRecord(resp)) return null;

  // token / access_token di root
  const rootToken = readStringProp(resp, "token") ?? readStringProp(resp, "access_token");
  if (rootToken) return rootToken;

  // token / access_token di resp.data
  const dataVal = resp["data"];
  if (isRecord(dataVal)) {
    const dataToken =
      readStringProp(dataVal, "token") ?? readStringProp(dataVal, "access_token");
    if (dataToken) return dataToken;
  }

  return null;
}

// =================== REQUEST CORE ===================
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOpts = RequestInit & {
  timeoutMs?: number;
  auth?: boolean; // default true (kecuali endpoint public)
};

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_BASE belum di-set. Contoh: http://localhost:4000");
  }

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

  // AUTO AUTH HEADER (Bearer)
  const useAuth = opts.auth !== false; // default true
  if (useAuth) {
    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // JSON body content-type
  if (opts.body && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method: (opts.method as HttpMethod) ?? "GET",
    headers,
    body: opts.body as BodyInit | null | undefined,
    signal: ac?.signal,
    // backend kamu credentials:false dan auth via Bearer token -> OMIT cookies
    credentials: "omit",
  }).finally(() => {
    if (timeout) clearTimeout(timeout);
  });

  // 401 handling
  if (res.status === 401) {
    setAuthToken(null);
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    let msg = `HTTP ${res.status}`;

    try {
      if (ct.includes("application/json")) {
        const j: unknown = await res.json();
        if (isRecord(j)) {
          const m = readStringProp(j, "message") ?? readStringProp(j, "error");
          if (m) msg = m;
        }
      } else {
        const t = await res.text();
        if (t) msg = t;
      }
    } catch {
      // ignore parsing errors
    }

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
  const resp = await request<AuthResp>(`/api/auth/login`, {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });

  // extract token (tanpa any)
  const token = extractToken(resp);
  if (token) setAuthToken(token);

  return resp;
}

export async function apiRegister(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const resp = await request<AuthResp>(`/api/auth/register`, {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });

  const token = extractToken(resp);
  if (token) setAuthToken(token);

  return resp;
}

export async function apiMe() {
  return request<MeResp>(`/api/auth/me`, { method: "GET", auth: true });
}

// Backend kamu pakai Bearer token, jadi logout cukup clear token di client.
export async function apiLogout() {
  setAuthToken(null);
  return { ok: true };
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
    auth: false,
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
    auth: false,
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
  const resp = await request<AuthResp>(`/api/mitra/register`, {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });

  const token = extractToken(resp);
  if (token) setAuthToken(token);

  return resp;
}

export async function apiMitraDashboard() {
  return request<MitraDashboardResp>(`/api/mitra/dashboard`, {
    method: "GET",
    auth: true,
  });
}

export async function apiMitraReport(
  cafeId: number | string,
  params?: { period?: ReportPeriod }
): Promise<ReportResp> {
  const q = new URLSearchParams();
  if (params?.period) q.set("period", params.period);

  return request<ReportResp>(
    `/api/mitra/${cafeId}/report${q.toString() ? `?${q}` : ""}`,
    { method: "GET", auth: true }
  );
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

  return request<ListCafesResp>(`/api/cafes${q.toString() ? `?${q}` : ""}`, {
    method: "GET",
    auth: false, // public
  });
}

export async function apiCafeDetail(id: number | string) {
  return request(`/api/cafes/${id}`, { method: "GET", auth: false });
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

  return request(`/api/cafes/${cafeId}/reviews${q.toString() ? `?${q}` : ""}`, {
    method: "GET",
    auth: false,
  });
}

export async function apiCreateReview(
  cafeId: number | string,
  payload: { rating: number; text?: string }
) {
  return request(`/api/cafes/${cafeId}/reviews`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function apiCafeMenu(id: number | string) {
  return request<MenuItem[] | { data: MenuItem[] }>(`/api/cafes/${id}/menu`, {
    method: "GET",
    auth: false,
  });
}

export async function apiMyCafes() {
  return request<{ data: Cafe[] }>(`/api/users/me/cafes`, {
    method: "GET",
    auth: true,
  });
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
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateMenuItem(id: number, patch: Partial<MenuItem>) {
  return request(`/api/menus/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(patch),
  });
}

export async function apiDeleteMenuItem(id: number) {
  return request(`/api/menus/${id}`, { method: "DELETE", auth: true });
}

// =================== FAVORITES ===================

export async function apiMyFavorites() {
  return request(`/api/users/me/favorites`, { method: "GET", auth: true });
}

export async function apiAddFavorite(cafeId: number | string) {
  return request(`/api/users/me/favorites/${cafeId}`, {
    method: "POST",
    auth: true,
  });
}

export async function apiRemoveFavorite(cafeId: number | string) {
  return request(`/api/users/me/favorites/${cafeId}`, {
    method: "DELETE",
    auth: true,
  });
}

// =================== UPLOAD ===================

export async function apiUploadTempImage(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  return requestMultipart(`/api/uploads/image`, fd, { auth: true });
}

// =================== PASSWORD ===================

export async function apiForgotPassword(email: string): Promise<{ message?: string }> {
  return request(`/api/auth/forgot-password`, {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email }),
  });
}

export async function apiResetPassword(
  token: string,
  password: string
): Promise<{ message?: string }> {
  return request<{ message?: string }>(`/api/auth/reset-password`, {
    method: "POST",
    auth: false,
    body: JSON.stringify({ token, password }),
  });
}
