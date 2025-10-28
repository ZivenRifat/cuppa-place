"use client";

import { useState } from "react";
import FormButton from "./FormButton";

interface Props {
  onBack: () => void;
  onVerify: () => void;
}

export default function StepVerifikasi({ onBack, onVerify }: Props) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOtp = () => {
    if (!email) {
      alert("Mohon isi email terlebih dahulu sebelum mengirim kode OTP.");
      return;
    }
    alert(`Kode OTP telah dikirim ke ${email}`);
  };

  return (
    <div className="flex flex-col justify-between min-h-[520px]">
      {/* Bagian konten atas */}
      <div className="space-y-6">
        <p className="text-lg font-semibold">Verifikasi Akun Mitra</p>

        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          Masukkan alamat email yang sama seperti pada langkah pertama.
          Setelah itu, kirimkan kode OTP untuk memverifikasi akunmu.
        </p>

        {/* Kolom Email + Tombol Kirim OTP */}
        <div className="space-y-3">
          <label className="font-semibold">Alamat Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contoh: coffeetime@gmail.com"
            className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#271F01]"
          />

          {/* Tombol Kirim Kode OTP */}
          <button
            type="button"
            onClick={handleSendOtp}
            className="w-full bg-[#271F01] text-white font-semibold py-2 rounded-md hover:bg-[#3b2f00] transition"
          >
            Kirim Kode OTP
          </button>
        </div>

        {/* Kolom OTP */}
        <div className="pt-4">
          <label className="font-semibold">Kode OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Masukkan 6 digit kode OTP"
            maxLength={6}
            className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 text-center tracking-widest text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#271F01]"
          />
        </div>

        {/* Pesan resend */}
        <p className="text-sm text-gray-500 text-center">
          Tidak menerima kode?{" "}
          <button
            onClick={() => alert("Kode OTP baru telah dikirim ke email kamu.")}
            className="text-blue-600 hover:underline"
          >
            Kirim ulang kode
          </button>
        </p>
      </div>

      {/* Tombol navigasi bawah */}
      <div className="flex justify-between pt-6">
        <FormButton label="Kembali" onClick={onBack} secondary />
        <FormButton label="Verifikasi Sekarang" onClick={onVerify} />
      </div>
    </div>
  );
}
