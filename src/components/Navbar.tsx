"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, X, Filter } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();

  // ✅ Deteksi halaman coffee-shop
  const isCoffeeShopPage = pathname.startsWith("/coffee-shop");

  // ✅ Scroll hanya aktif di halaman selain coffee-shop
  useEffect(() => {
    if (isCoffeeShopPage) return; // tidak jalankan event scroll di coffee-shop

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight * 0.8;
      setIsScrolled(scrollY > heroHeight - 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isCoffeeShopPage]);

  // Fokus input saat search dibuka
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  // ✅ Warna dasar navbar
  const baseStyle = isCoffeeShopPage
    ? "bg-white text-[#2b210a]"
    : isScrolled
    ? "bg-white text-[#2b210a]"
    : "bg-[#2b210a] text-white";

  // ✅ Warna tombol & ikon (disesuaikan)
  const iconButtonStyle = isCoffeeShopPage
    ? "bg-[#f4f4f4] text-[#2b210a] hover:bg-[#2b210a] hover:text-white"
    : isScrolled
    ? "bg-[#f4f4f4] text-[#2b210a] hover:bg-[#2b210a] hover:text-white"
    : "bg-[#3b2f00] hover:bg-white hover:text-[#2b210a]";

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 flex items-center px-6 md:px-10 py-4 transition-all duration-500 shadow-md ${baseStyle}`}
    >
      {/* Logo kiri */}
      <div className="flex items-center mr-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
          CuppaPlace
        </h1>
      </div>

      {/* Menu Tengah */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence>
          {!searchOpen && (
            <motion.nav
              key="menu"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="hidden md:flex gap-10 text-lg font-medium"
            >
              <a href="#" className="hover:text-yellow-600 transition-colors duration-300">
                Home
              </a>
              <a
                href="#coffeeshop"
                className="hover:text-yellow-600 transition-colors duration-300"
              >
                Coffeeshop
              </a>
              <a href="#" className="hover:text-yellow-600 transition-colors duration-300">
                Artikel
              </a>
              <a href="#" className="hover:text-yellow-600 transition-colors duration-300">
                Tentang Kami
              </a>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 md:gap-4 relative">
        {/* Search Icon + Expand */}
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
                className="absolute right-0 top-1/2 -translate-y-1/2 w-[80vw] md:w-[720px] lg:w-[1100px] z-30"
              >
                <div className="flex items-center gap-3">
                  {/* Tombol Close */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchOpen(false)}
                    className={`p-3 rounded-full shadow-md transition-colors ${
                      isCoffeeShopPage
                        ? "bg-[#2b210a] text-white hover:bg-[#4b3b09]"
                        : isScrolled
                        ? "bg-[#2b210a] text-white hover:bg-[#4b3b09]"
                        : "bg-white text-[#2b210a] hover:bg-[#3b2f00] hover:text-white"
                    }`}
                    aria-label="Tutup"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>

                  {/* Input */}
                  <div
                    className={`flex items-center rounded-full shadow-md flex-1 overflow-hidden border transition-colors duration-300 ${
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
                      className={`flex-1 px-6 py-3 rounded-full focus:outline-none text-base ${
                        isCoffeeShopPage
                          ? "text-[#2b210a]"
                          : isScrolled
                          ? "text-white placeholder-gray-300"
                          : "text-[#2b210a]"
                      }`}
                    />

                    {/* Tombol Filter */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowFilter(!showFilter)}
                      className={`p-3 rounded-full transition ${
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

                    {/* Tombol Search */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className={`relative p-3 rounded-full transition-colors ${
                        isCoffeeShopPage
                          ? "bg-[#2b210a] text-white hover:bg-[#4b3b09]"
                          : isScrolled
                          ? "bg-white text-[#2b210a] hover:bg-gray-200"
                          : "bg-[#2b210a] text-white hover:bg-[#4b3b09]"
                      }`}
                      aria-label="Cari"
                    >
                      <Search className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tombol Search utama */}
          {!searchOpen && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              className={`p-3 rounded-full transition z-40 ${iconButtonStyle}`}
            >
              <Search className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        {/* User Icon */}
        <button className={`p-3 rounded-full transition ${iconButtonStyle}`}>
          <User className="w-6 h-6" />
        </button>
      </div>

      {/* Popup Filter */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute top-full right-10 mt-3 bg-white text-[#2b210a] shadow-lg rounded-xl p-4 w-64 z-50"
          >
            <h4 className="font-semibold mb-2">Filter Coffeeshop</h4>
            <ul className="space-y-2 text-sm">
              <li><input type="checkbox" /> WiFi</li>
              <li><input type="checkbox" /> Outdoor</li>
              <li><input type="checkbox" /> Buka 24 jam</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
