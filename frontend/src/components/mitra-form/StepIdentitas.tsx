import FormButton from "./FormButton";
import Link from "next/link";

interface Props {
  onNext: () => void;
}

export default function StepIdentitas({ onNext }: Props) {
  return (
    <div className="flex flex-col justify-between min-h-[520px]">
      {/* Bagian form utama */}
      <p className="text-lg font-semibold">Identitas Coffee Shop</p>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-sm">Nama Coffeeshop</label>
            <input className="w-full border border-gray-400 rounded-md px-3 py-1.5 mt-1 text-sm" />
          </div>
          <div>
            <label className="font-semibold text-sm">Alamat</label>
            <input className="w-full border border-gray-400 rounded-md px-3 py-1.5 mt-1 text-sm" />
          </div>
          <div>
            <label className="font-semibold text-sm">Nomor HP</label>
            <input className="w-full border border-gray-400 rounded-md px-3 py-1.5 mt-1 text-sm" />
          </div>
          <div>
            <label className="font-semibold text-sm">Email</label>
            <input type="email" className="w-full border border-gray-400 rounded-md px-3 py-1.5 mt-1 text-sm" />
          </div>
          <div>
            <label className="font-semibold text-sm">Nomor Induk Berusaha (NIB)</label>
            <input className="w-full border border-gray-400 rounded-md px-3 py-1.5 mt-1 text-sm" />
          </div>
          <div>
            <label className="font-semibold text-sm">Jam Operasional</label>
            <input className="w-full border border-gray-400 rounded-md px-3 py-1.5 mt-1 text-sm" />
          </div>
        </div>

        {/* Upload foto */}
        <div>
          <p className="font-semibold text-sm mb-1">Unggah Foto</p>
          <div className="flex gap-3 flex-wrap">
            <div className="w-32 h-32 border border-gray-300 rounded-lg flex flex-col justify-center items-center bg-gray-100">
              📷 <p className="text-xs text-gray-600">Logo Coffeeshop</p>
            </div>
            <div className="w-32 h-32 border border-gray-300 rounded-lg flex flex-col justify-center items-center bg-gray-100">
              📸 <p className="text-xs text-gray-600">Foto Suasana</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tombol navigasi */}
      <div className="flex justify-between pt-4">
        {/* Tombol kembali ke landing page */}
        <Link
          href="/"
          className="bg-gray-200 text-[#271F01] px-6 py-2 rounded-md font-semibold hover:bg-gray-300 transition"
        >
          Kembali ke Halaman Utama
        </Link>

        {/* Tombol selanjutnya */}
        <FormButton label="Selanjutnya" onClick={onNext} />
      </div>
    </div>
  );
}
