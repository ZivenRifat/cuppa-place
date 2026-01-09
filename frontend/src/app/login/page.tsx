"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Slideshow from "@/components/SlideShow";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { canAccess, routeForRole } from "@/lib/roles";
import type { Role } from "@/types/domain";

import { apiLogin, setAuthToken, API_BASE } from "@/lib/api";

type LoginRespLike = {
  token?: string;
  access_token?: string;
  data?: { token?: string; access_token?: string };
  user?: { role?: Role | string };
  message?: string;
};

function extractToken(resp: LoginRespLike): string | undefined {
  return (
    resp.token ??
    resp.access_token ??
    resp.data?.token ??
    resp.data?.access_token
  );
}

function normalizeRole(raw: Role | string | undefined): Role | undefined {
  // Sesuaikan ini kalau Role di domain punya value lain
  if (raw === "user" || raw === "mitra" || raw === "admin") return raw;
  return undefined;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPath, setNextPath] = useState<string>("/");

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    setNextPath(qs.get("next") || "/");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!API_BASE) {
        throw new Error(
          "NEXT_PUBLIC_API_BASE belum di-set. Harusnya: https://cuppaplace.web.id"
        );
      }

      const resp = (await apiLogin({
        email: email.trim(),
        password,
      })) as unknown as LoginRespLike;

      const token = extractToken(resp);
      if (!token) throw new Error("Token tidak ditemukan dari response login.");

      setAuthToken(token);

      // Set cookie - remove Secure flag for localhost development
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const cookieOptions = isLocalhost
        ? 'path=/; max-age=86400; SameSite=Lax'
        : 'path=/; max-age=86400; SameSite=Lax; Secure';
      document.cookie = `cuppa_token=${token}; ${cookieOptions}`;

      window.dispatchEvent(new Event("auth-update"));

      const role = normalizeRole(resp.user?.role);
      const preferred = nextPath || "/";

      const allowedPath =
        role === "user" && canAccess(role, preferred)
          ? preferred
          : routeForRole(role);

      router.replace(allowedPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal. Coba lagi.");
    }
  };

  return (
    <div className="flex min-h-screen relative">
      {/* LEFT – LOGIN FORM */}
      <div className="w-full md:w-[40%] bg-[#2b210a] flex flex-col justify-center items-center px-10 py-12 text-white z-10 relative">
        <div className="w-full max-w-sm space-y-6">
          <h1 className="text-4xl font-bold text-center mb-6 -mt-10">
            Sign In
          </h1>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-md bg-[#4d4020] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Masukkan email"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-10 rounded-md bg-[#4d4020] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between text-sm font-medium">
              <Link href="/lupa-password" className="hover:underline">
                Lupa Password
              </Link>
            </div>

            {error && (
              <div className="text-sm bg-red-50 border border-red-200 text-red-900 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#1b1405] py-3 rounded-md font-bold hover:bg-[#3a2f12] transition"
            >
              Login
            </button>

            <p className="text-center text-sm">
              Tidak punya akun?{" "}
              <Link href="/register" className="font-semibold hover:underline">
                Buat Akun
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT – BRAND PANEL */}
      <div className="hidden md:flex flex-col justify-center w-[60%] relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/img/login/LoginPage.jpg"
            alt="Coffeeshop"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 px-12">
          <h2 className="text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
            Hello, <br /> Selamat Datang!
          </h2>
          <p className="text-white text-base max-w-md drop-shadow-md">
            CuppaPlace menghubungkan pecinta kopi dengan coffeeshop terbaik yang
            bermitra.
          </p>
        </div>
      </div>

      {/* SLIDESHOW */}
      <div className="fixed bottom-0 left-0 w-full bg-[#2b210a]/90 z-50">
        <Slideshow />
      </div>
    </div>
  );
}
