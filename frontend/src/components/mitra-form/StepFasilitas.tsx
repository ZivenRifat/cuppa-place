"use client";

import Image from "next/image";
import FormButton from "./FormButton";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const fasilitas = [
  "Wi-Fi", "Indoor", "Outdoor", "Meeting Room", "Smoking Area",
  "Toilet", "Qris", "Cash", "Live Musik", "Colokan Listrik",
];

export default function StepFasilitas({ onNext, onBack }: Props) {
  return (
    <div className="flex flex-col justify-between min-h-[520px]">
      <div className="flex flex-col gap-8">
        <p className="font-semibold text-lg">Fasilitas & Layanan</p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {fasilitas.map((item) => (
            <label key={item} className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
              <input type="checkbox" className="accent-[#271F01] w-4 h-4" />
              <span className="font-medium">{item}</span>
            </label>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
          <div className="flex justify-center md:justify-start md:w-1/3">
            <Image
              src="/img/mitra/fasilitas.png"
              alt="Ilustrasi fasilitas cafe"
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
          <div className="md:w-2/3 text-base font-semibold text-[#271F01] leading-relaxed">
            <p>
              Pilih semua fasilitas dan layanan yang tersedia di coffeeshop Anda agar pelanggan tahu kenyamanan yang Anda tawarkan.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <FormButton label="Kembali" onClick={onBack} secondary />
        <FormButton label="Selanjutnya" onClick={onNext} />
      </div>
    </div>
  );
}
