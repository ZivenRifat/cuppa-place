"use client";

import Sidebar from "@/components/mitra/SideBarMitra";
import Navbar from "@/components/mitra/NavbarMitra";

export default function KelolaMenuPage() {
  return (
    <div className="flex min-h-screen bg-[#f9f8f6] text-[#1b1405]">
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Content */}
        <section className="p-8 space-y-6">
          {/* Header Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-300/40 flex justify-between items-center shadow-md hover:shadow-lg">
            <div>
              <h3 className="text-xl font-bold">Kelola Menu</h3>
              <p className="text-sm text-gray-600">
                Kelola menu yang ingin anda tampilkan di halaman coffeeshop!
              </p>
            </div>
            <button className="bg-[#2b210a] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#423614] transition">
              + Tambah Menu
            </button>
          </div>

          {/* Table Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-300/40 shadow-md hover:shadow-lg">
            <h3 className="text-xl font-bold mb-4">Daftar Menu</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-100/40 border-b border-gray-300/40">
                    <th className="p-3 border-b border-gray-300/70">
                      Nama Menu
                    </th>
                    <th className="p-3 border-b border-gray-300/70">Harga</th>
                    <th className="p-3 border-b border-gray-300/70">
                      Deskripsi
                    </th>
                    <th className="p-3 border-b border-gray-300/70">Foto</th>
                    <th className="p-3 border-b border-gray-300/70 text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(6)].map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-300/70 hover:bg-gray-50 transition h-12"
                    >
                      <td className="p-3">—</td>
                      <td className="p-3">—</td>
                      <td className="p-3">—</td>
                      <td className="p-3">—</td>
                      <td className="p-3 text-center space-x-2">
                        <button className="text-blue-600 hover:underline text-sm">
                          Edit
                        </button>
                        <button className="text-red-600 hover:underline text-sm">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
