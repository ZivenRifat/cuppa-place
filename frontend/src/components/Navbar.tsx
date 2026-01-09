"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Menu, User, ArrowRightLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMitraMode, setIsMitraMode] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const isCoffeeShopPage = pathname.startsWith("/pengguna/listCoffeeShop");

  // localStorage key yang sama dengan api.ts
  const TOKEN_KEY = "cuppa_token";

  const getToken = () => {
    if (typeof window === "undefined") return null;
    // First try localStorage
    const localToken = window.localStorage.getItem(TOKEN_KEY);
    if (localToken) return localToken;
    // Fallback to cookie
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((row) => row.startsWith(TOKEN_KEY + "="));
    if (tokenCookie) {
      return tokenCookie.split("=")[1];
    }
    return null;
  };

  const syncAuth = () => {
    setIsLoggedIn(!!getToken());
  };

  useEffect(() => {
    setMounted(true);
    syncAuth();
  }, []);

  useEffect(() => {
    window.addEventListener("auth-update", syncAuth);
    return () => window.removeEventListener("auth-update", syncAuth);
  }, []);

  useEffect(() => {
    if (isCoffeeShopPage) return;
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isCoffeeShopPage]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/pengguna/listCoffeeShop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Close search when clicking outside
  const handleSearchBlur = () => {
    // Small delay to allow click on search button
    setTimeout(() => {
      if (!searchQuery.trim()) {
        setSearchOpen(false);
      }
    }, 200);
  };

  if (!mounted) return null;

  const baseStyle =
    isCoffeeShopPage || isScrolled
      ? "bg-white text-[#2b210a]"
      : "bg-[#2b210a] text-white";

  const iconButtonStyle =
    isCoffeeShopPage || isScrolled
      ? "bg-[#f4f4f4] text-[#2b210a]"
      : "bg-[#3b2f00]";

  const handleLogout = () => {
    window.localStorage.removeItem("cuppa_token");
    window.dispatchEvent(new Event("auth-update"));
    router.push("/login");
  };

  const goToProfile = () => {
    router.push("/pengguna/profil");
  };

  const handleToggleMode = () => {
    if (isMitraMode) {
      setIsMitraMode(false);
      router.push("/pengguna/home");
    } else {
      setIsMitraMode(true);
      router.push("/mitra/dashboard");
    }
  };

  const isMitraUser = user?.role === "mitra";

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 flex items-center px-4 md:px-8 py-5 ${baseStyle}`}
    >
      {/* Logo - Fixed width, won't shrink */}
      <div className="flex-shrink-0 w-40">
        <Link href="/" className="text-2xl font-semibold">
          CuppaPlace
        </Link>
      </div>

      {/* Navigation Links - Takes all remaining space, centered */}
      <nav className="flex-1 flex justify-center">
        <div className="hidden md:flex gap-8 font-medium">
          <Link href="/">Home</Link>
          <Link href="/pengguna/listCoffeeShop">Coffeeshop</Link>
          <Link href="/pengguna/kategori">Kategori</Link>
          <Link href="/pengguna/tentang-kami">Tentang Kami</Link>
        </div>
      </nav>

      {/* Right side - Search + Profile, Fixed width */}
      <div className="flex-shrink-0 flex items-center gap-3">
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            {/* Search button next to profile - expands left */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    onSubmit={handleSearch}
                    className="relative flex items-center"
                  >
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={handleSearchBlur}
                      placeholder="Cari..."
                      className="w-48 md:w-64 px-10 py-2 rounded-full bg-white text-[#2b210a] text-sm outline-none focus:ring-2 focus:ring-amber-500"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </motion.form>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSearchOpen(true)}
                    className={`p-2 rounded-full ${iconButtonStyle}`}
                  >
                    <Search size={24} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Profile avatar */}
            <div className="relative group">
              <div
                onClick={goToProfile}
                className={`p-2 rounded-full cursor-pointer ${isCoffeeShopPage || isScrolled
                  ? "bg-[#f4f4f4] text-[#2b210a]"
                  : "bg-[#3b2f00] text-white"
                  }`}
              >
                <User size={24} />
              </div>

              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition z-50">
                {/* Mode Switch for Mitra Users */}
                {isMitraUser && (
                  <button
                    onClick={handleToggleMode}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                  >
                    <ArrowRightLeft size={16} />
                    <span>{isMitraMode ? "Mode Pengguna" : "Mode Mitra"}</span>
                  </button>
                )}
                <button
                  onClick={goToProfile}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  <User size={16} />
                  Profil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Search button next to login - expands left */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    onSubmit={handleSearch}
                    className="relative flex items-center"
                  >
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={handleSearchBlur}
                      placeholder="Cari..."
                      className="w-48 md:w-64 px-10 py-2 rounded-full bg-white text-[#2b210a] text-sm outline-none focus:ring-2 focus:ring-amber-500"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </motion.form>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSearchOpen(true)}
                    className={`p-2 rounded-full ${iconButtonStyle}`}
                  >
                    <Search size={24} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <Link href="/login">
              <button className="bg-[#f4f4f4] text-[#2b210a] px-5 py-2 rounded-full font-semibold">
                Masuk
              </button>
            </Link>
          </div>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-3 rounded-full ${iconButtonStyle}`}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

