"use client";

import NavbarAdmin from "@/components/mitra/NavbarMitra";
import AdminSidebar from "@/components/mitra/SideBarMitra";
import { usePathname } from "next/navigation";

export default function MitraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Menentukan judul halaman berdasarkan route
  const getPageTitle = () => {
    if (pathname === "/mitra/dashboard") return "Dashboard";
    if (pathname === "/mitra/manajemen-cafe/informasi") return "Informasi Cafe";
    if (pathname === "/mitra/manajemen-cafe/menu") return "Kelola Menu";
    if (pathname === "/mitra/reviews") return "Reviews";
    if (pathname === "/mitra/laporan") return "Laporan";
    return "CuppaPlace Admin";
  };

  return (
    <div className="flex h-screen bg-[#FFFFFF]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <NavbarAdmin title={getPageTitle()} />

        {/* Isi Halaman */}
        <main className="flex-1 overflow-y-auto p-2">{children}</main>
      </div>
    </div>
  );
}
