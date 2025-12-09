// frontend/src/components/Navbar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, X, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isCoffeeShopPage = pathname.startsWith("/pengguna/listCoffeeShop");

  // Detect token saat pertama kali render
  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(!!Cookies.get("token"));
  }, []);

  // Listener agar Navbar auto update setelah login/logout
  useEffect(() => {
    const handleAuthUpdate = () => {
      setIsLoggedIn(!!Cookies.get("token"));
    };

    window.addEventListener("auth-update", handleAuthUpdate);

    return () => window.removeEventListener("auth-update", handleAuthUpdate);
  }, []);

  // Style scroll behavior
  useEffect(() => {
    if (isCoffeeShopPage) return;

    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [isCoffeeShopPage]);

  if (!mounted) return null;

  const baseStyle =
    isCoffeeShopPage || isScrolled
      ? "bg-white text-[#2b210a]"
      : "bg-[#2b210a] text-white";

  const iconButtonStyle =
    isCoffeeShopPage || isScrolled
      ? "bg-[#f4f4f4] text-[#2b210a] hover:bg-[#2b210a] hover:text-white"
      : "bg-[#3b2f00] hover:bg-white hover:text-[#2b210a]";

  // 🔥 Logout Function
  const handleLogout = () => {
    Cookies.remove("token");
    window.dispatchEvent(new Event("auth-update")); // update navbar
    router.push("/login");
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-10 py-4 transition-all duration-500 ease-in-out shadow-md ${baseStyle}`}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl md:text-2xl font-semibold tracking-wide">
          CuppaPlace
        </span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-1 justify-center">
        {!searchOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex gap-10 text-lg font-medium"
          >
            <Link href="/" className="hover:text-yellow-600 transition">
              Home
            </Link>
            <Link
              href="/pengguna/listCoffeeShop"
              className="hover:text-yellow-600 transition"
            >
              Coffeeshop
            </Link>
            <Link
              href="/pengguna/kategori"
              className="hover:text-yellow-600 transition"
            >
              Kategori
            </Link>
            <Link
              href="/pengguna/tentang-kami"
              className="hover:text-yellow-600 transition"
            >
              Tentang Kami
            </Link>
          </motion.nav>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search Button */}
        <motion.button
          onClick={() => setSearchOpen((prev) => !prev)}
          className={`p-3 rounded-full transition ${iconButtonStyle}`}
          whileTap={{ scale: 0.9 }}
        >
          {searchOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Search className="w-6 h-6" />
          )}
        </motion.button>

        {/* 🔥 Login / Profile Logic */}
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <Link href="/pengguna/profil">
              <Image
                src="/img/profile.png"
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full cursor-pointer"
              />
            </Link>
          </div>
        ) : (
          <Link href="/login">
            <button className="hover:bg-[#e1ded2] bg-[#FFFCEF] text-[#460D0D] font-semibold rounded-full px-5 py-2">
              Masuk
            </button>
          </Link>
        )}

        {/* Mobile Menu */}
        <motion.button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-3 rounded-full transition-all duration-300 ${iconButtonStyle}`}
          whileTap={{ scale: 0.9 }}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute top-full left-0 w-full py-5 flex flex-col items-center gap-4 md:hidden transition-all ${baseStyle}`}
        >
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link
            href="/pengguna/listCoffeeShop"
            onClick={() => setMenuOpen(false)}
          >
            Coffeeshop
          </Link>
          <Link href="/pengguna/kategori" onClick={() => setMenuOpen(false)}>
            Kategori
          </Link>
          <Link
            href="/pengguna/tentang-kami"
            onClick={() => setMenuOpen(false)}
          >
            Tentang Kami
          </Link>
        </motion.div>
      )}
    </header>
  );
}
