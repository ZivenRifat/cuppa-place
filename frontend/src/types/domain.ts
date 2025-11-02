// src/types/domain.ts

export type Role = "user" | "mitra" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar_url?: string | null;
}

export interface AuthResp {
  token: string;
  user: User;
}

export interface Cafe {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  // Sequelize DECIMAL kadang balik string → izinkan number|string|null
  lat?: number | string | null;
  lng?: number | string | null;
  phone?: string | null;
  instagram?: string | null;
  opening_hours?: Record<string, string> | null;
  cover_url?: string | null;
  owner?: Pick<User, "id" | "name">;
  distance_m?: number; // ditambahkan saat query nearby
}

export interface MenuItem {
  id: number;
  cafe_id: number;
  name: string;
  category?: string | null;
  price: number;           // IDR
  photo_url?: string | null;
  is_available: boolean;
  description?: string | null;
}

export interface Review {
  id: number;
  cafe_id: number;
  user_id: number;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string | null;
  photos?: unknown;
  status: "published" | "pending";
  author?: Pick<User, "id" | "name">;
  created_at: string;
}

export interface ListReviewsResp {
  total: number;
  data: Review[];
  avg?: number;
  counts?: Record<number, number>; // {5:12, 4:3, ...}
}


/** ====== API responses ====== */
export interface AuthResp { token: string; user: User; }
export interface MeResp { user: User; }
export interface ListCafesResp { total: number; data: Cafe[]; }

/** ====== Mitra Dashboard ====== */
export interface MitraDashboardResp {
  cards: {
    daily_sales: number;
    monthly_sales: number;
    avg_rating: number;
    review_count: number;
    favorites_count: number;
  };
  visitors: { name: string; value: number }[];
  recommendations: string[];
}
export interface ReportSeriesPoint { name: string; value: number; }
export interface ReportResp { series: ReportSeriesPoint[]; total?: number; }
