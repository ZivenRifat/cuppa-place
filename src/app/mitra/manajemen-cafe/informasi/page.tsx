"use client";

export default function InformasiCafePage() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#1b1405]">
      {/* About */}
      <div className="bg-white p-6 rounded-lg border border-gray-300/40 shadow-md hover:shadow-lg">
        <h3 className="text-xl font-bold mb-2">About</h3>
        <p className="text-sm mb-4">Ceritakan tentang coffeeshop anda disini!</p>
        <textarea
          className="w-full p-3 border border-gray-300/80 rounded-md bg-[#FFFFFF] focus:outline-none"
          rows={4}
          defaultValue="Renjana Coffee adalah tempat nongkrong nyaman dengan suasana industrial modern..."
        />
        <div className="flex gap-3 justify-end mt-3">
          <button className="bg-[#2b210a] text-white px-4 py-2 rounded-md">Submit</button>
          <button className="bg-gray-200 px-4 py-2 rounded-md">Batalkan</button>
        </div>
      </div>

      {/* Jam Operasional */}
      <div className="bg-white p-6 rounded-lg border border-gray-300/40 shadow-md hover:shadow-lg">
        <h3 className="text-xl font-bold mb-2">Jam Operasional</h3>
        <p className="text-sm mb-3">Masukan jam operasional cafe anda disini!</p>

        <div className="flex items-center gap-4 mb-4">
          <span className="flex items-center gap-2 text-green-600 font-semibold">
            <span className="w-3 h-3 bg-green-500 rounded-full" /> Sedang Buka
          </span>
        </div>

        <div className="flex gap-6 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">Jam Buka</label>
            <input type="time" defaultValue="08:00" className="border border-gray-300/80 p-2 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jam Tutup</label>
            <input type="time" defaultValue="22:00" className="border border-gray-300/80 p-2 rounded-md" />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <button className="bg-[#2b210a] text-white px-4 py-2 rounded-md">Submit</button>
          <button className="bg-gray-200 px-4 py-2 rounded-md">Batalkan</button>
        </div>
      </div>

      {/* Alamat Cafe */}
      <div className="bg-white p-6 rounded-lg border border-gray-300/40 shadow-md hover:shadow-lg">
        <h3 className="text-xl font-bold mb-2">Alamat Cafe</h3>
        <p className="text-sm mb-3">Masukan alamat cafe anda disini!</p>
        <textarea
          className="w-full p-3 border border-gray-300/80 rounded-md bg-[#FFFFFF] focus:outline-none"
          rows={2}
          defaultValue="Jl. Depok, Kembangan Kidul, Kembangan Tengah, Kota Semarang, Jawa Tengah"
        />
        <div className="flex gap-3 justify-end mt-3">
          <button className="bg-[#2b210a] text-white px-4 py-2 rounded-md">Submit</button>
          <button className="bg-gray-200 px-4 py-2 rounded-md">Batalkan</button>
        </div>
      </div>
    </section>
  );
}
