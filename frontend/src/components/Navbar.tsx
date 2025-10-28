"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, X, Filter, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();

  const isCoffeeShopPage = pathname.startsWith("/coffee-shop");

  // Scroll effect
  useEffect(() => {
    if (isCoffeeShopPage) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isCoffeeShopPage]);

  // Focus search input
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  // Close filter when search closed
  useEffect(() => {
    if (!searchOpen && showFilter) setShowFilter(false);
  }, [searchOpen, showFilter]);

  // Warna dasar
  const baseStyle = isCoffeeShopPage
    ? "bg-white text-[#2b210a]"
    : isScrolled
    ? "bg-white text-[#2b210a]"
    : "bg-[#2b210a] text-white";

  const dropdownBg = isCoffeeShopPage
    ? "bg-white text-[#2b210a]"
    : isScrolled
    ? "bg-white text-[#2b210a]"
    : "bg-[#2b210a] text-white";

  const iconButtonStyle = isCoffeeShopPage
    ? "bg-[#f4f4f4] text-[#2b210a] hover:bg-[#2b210a] hover:text-white"
    : isScrolled
    ? "bg-[#f4f4f4] text-[#2b210a] hover:bg-[#2b210a] hover:text-white"
    : "bg-[#3b2f00] hover:bg-white hover:text-[#2b210a]";

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-10 py-4 transition-all duration-500 ease-in-out ${baseStyle} shadow-md`}
      style={{ border: "none" }}
    >
      {/* Logo kiri */}
      <div className="flex items-center">
        <Link
          href="/"
          className="text-2xl md:text-3xl font-extrabold tracking-wide hover:opacity-80 transition-all duration-300"
        >
          CuppaPlace
        </Link>
      </div>

      {/* Menu tengah (desktop) */}
      <div className="hidden md:flex flex-1 justify-center transition-all duration-500 ease-in-out">
        <AnimatePresence>
          {!searchOpen && (
            <motion.nav
              key="menu"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex gap-10 text-lg font-medium"
            >
              <Link
                href="/pengguna/home"
                className="hover:text-yellow-600 transition-colors duration-300"
              >
                Home
              </Link>
              <Link
                href="/pengguna/coffeeshop"
                className="hover:text-yellow-600 transition-colors duration-300"
              >
                Coffeeshop
              </Link>
              <Link
                href="/pengguna/kategori"
                className="hover:text-yellow-600 transition-colors duration-300"
              >
                Kategori
              </Link>
              <Link
                href="/pengguna/tentang-kami"
                className="hover:text-yellow-600 transition-colors duration-300"
              >
                Tentang Kami
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* Menu kanan */}
      <div className="flex items-center gap-3 md:gap-4 relative">
        {/* Search Section */}
        <div className="relative flex items-center">
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                key="expanded"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 25 }}
                style={{ transformOrigin: "right center" }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-[75vw] sm:w-[80vw] md:w-[720px] lg:w-[1100px] z-30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center rounded-full shadow-md flex-1 overflow-hidden border transition-all duration-300 ${
                      isCoffeeShopPage
                        ? "bg-white border-gray-300"
                        : isScrolled
                        ? "bg-[#3b2f00] border-[#5b4a1a]"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Cari Coffeeshop..."
                      className={`flex-1 px-5 py-2 sm:py-3 rounded-full focus:outline-none text-base transition-all duration-300 ${
                        isCoffeeShopPage
                          ? "text-[#2b210a]"
                          : isScrolled
                          ? "text-white placeholder-gray-300"
                          : "text-[#2b210a]"
                      }`}
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowFilter(!showFilter)}
                      className={`p-3 rounded-full transition-colors ${
                        isCoffeeShopPage
                          ? "text-[#2b210a] hover:bg-gray-100"
                          : isScrolled
                          ? "text-white hover:bg-[#4b3b09]"
                          : "text-[#2b210a] hover:bg-gray-100"
                      }`}
                      aria-label="Filter"
                    >
                      <Filter className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSearchOpen(false)}
                      className={`relative p-3 rounded-full transition-colors ${
                        isCoffeeShopPage
                          ? "bg-[#2b210a] text-white hover:bg-[#4b3b09]"
                          : isScrolled
                          ? "bg-white text-[#2b210a] hover:bg-gray-200"
                          : "bg-[#2b210a] text-white hover:bg-[#4b3b09]"
                      }`}
                      aria-label="Tutup"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tombol Search utama */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSearchOpen((prev) => !prev)}
            className={`p-3 rounded-full transition z-40 ${iconButtonStyle}`}
          >
            {searchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* User Icon */}
        <Link
          href="/pengguna/profil"
          className={`p-3 rounded-full transition-all duration-300 ${iconButtonStyle} hover:scale-105 active:scale-95`}
        >
          <User className="w-6 h-6" />
        </Link>

        {/* Tombol Menu Mobile */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-3 rounded-full transition-all duration-300 ${iconButtonStyle}`}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`absolute top-full left-0 w-full py-5 flex flex-col items-center space-y-4 text-lg font-medium md:hidden shadow-lg border-t-0 transition-all duration-500 ease-in-out ${dropdownBg}`}
          >
            <Link href="/pengguna/home" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/pengguna/coffeeshop" onClick={() => setMenuOpen(false)}>
              Coffeeshop
            </Link>
            <Link href="/pengguna/kategori" onClick={() => setMenuOpen(false)}>
              Kategori
            </Link>
            <Link href="/pengguna/tentang-kami" onClick={() => setMenuOpen(false)}>
              Tentang Kami
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
