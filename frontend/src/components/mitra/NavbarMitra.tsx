"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Home, Coffee, Store, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function NavbarMitra({ title }: { title: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Check login status
  useEffect(() => {
    const token = window.localStorage.getItem("cuppa_token") ||
      document.cookie.split("; ").find(row => row.startsWith("cuppa_token="))?.split("=")[1];
    setIsLoggedIn(!!token);
  }, []);

  const isPlainPage = pathname === "/mitra/daftar" || pathname === "/mitra/profil";
  const isMitraPage = pathname.startsWith("/mitra");

  const handleLogout = () => {
    window.localStorage.removeItem("cuppa_token");
    window.dispatchEvent(new Event("auth-update"));
    router.push("/login");
  };

  const containerClass = isPlainPage
    ? "fixed top-0 left-0 w-full z-50 shadow-md"
    : "w-full";

  const baseStyle = isMitraPage && !isPlainPage
    ? "bg-[#2b210a] text-white border-b border-[#3b2f00]"
    : isMitraPage
      ? "bg-[#2b210a] text-white"
      : "bg-white text-[#2b210a] shadow-md";

  const buttonStyle = isMitraPage && !isPlainPage
    ? "bg-[#3b2f00] hover:bg-[#4a3e20]"
    : "bg-[#f4f4f4] text-[#2b210a]";

  return (
    <header
      className={`flex items-center justify-between px-8 py-4 ${containerClass} ${baseStyle}`}
    >
      {/* Title Only - Larger Size */}
      <h1 className="text-2xl font-bold">
        {title}
      </h1>

      {/* Right Side - User Menu */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center gap-3 px-4 py-3 rounded-full cursor-pointer ${buttonStyle}`}
            >
              <User size={22} />
              <span className="hidden md:inline text-base font-semibold">
                {user?.name || "Mitra"}
              </span>
              <ChevronDown size={18} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-[#2b210a] rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                {/* Profile Section */}
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                  <p className="font-bold text-lg">{user?.name || "Mitra"}</p>
                  <p className="text-sm text-gray-500 capitalize">{user?.role || "mitra"}</p>
                </div>

                {/* Mode Switch */}
                <div className="py-3 border-b border-gray-200">
                  <p className="px-5 py-2 text-xs font-semibold text-gray-500 uppercase">Mode</p>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      router.push("/mitra/profil");
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-100 ${pathname === "/mitra/profil" ? "bg-amber-50" : ""}`}
                  >
                    <Store size={20} />
                    <span className="font-medium text-base">Mode Mitra</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      router.push("/pengguna/profil");
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-100 ${pathname === "/pengguna/profil" ? "bg-amber-50" : ""}`}
                  >
                    <User size={20} />
                    <span className="font-medium text-base">Mode Pengguna</span>
                  </button>
                </div>

                {/* Quick Links */}
                <div className="py-3 border-b border-gray-200">
                  <p className="px-5 py-2 text-xs font-semibold text-gray-500 uppercase">Quick Links</p>
                  <Link
                    href="/mitra/dashboard"
                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Home size={20} />
                    <span className="text-base">Dashboard Mitra</span>
                  </Link>
                  <Link
                    href="/pengguna/home"
                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Coffee size={20} />
                    <span className="text-base">Halaman Pengguna</span>
                  </Link>
                </div>

                {/* Logout */}
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-4 px-5 py-4 text-red-600 hover:bg-red-50"
                >
                  <LogOut size={20} />
                  <span className="font-semibold text-base">Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <button className="bg-[#f4f4f4] text-[#2b210a] px-6 py-3 rounded-full font-semibold text-lg hover:bg-white transition-colors">
              Masuk
            </button>
          </Link>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-4 rounded-full ${buttonStyle}`}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full px-6 pb-6 space-y-3 bg-[#2b210a] border-t border-[#3b2f00] pt-6">
          <Link href="/mitra/dashboard" className="block py-3 text-lg font-medium hover:text-amber-400" onClick={() => setMenuOpen(false)}>
            Dashboard Mitra
          </Link>
          <Link href="/mitra/profil" className="block py-3 text-lg font-medium hover:text-amber-400" onClick={() => setMenuOpen(false)}>
            Profil Mitra
          </Link>
          <hr className="border-[#3b2f00] my-3" />
          <Link href="/pengguna/home" className="block py-3 text-lg font-medium hover:text-amber-400" onClick={() => setMenuOpen(false)}>
            Halaman Pengguna
          </Link>
        </div>
      )}
    </header>
  );
}

