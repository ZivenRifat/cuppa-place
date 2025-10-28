"use client";

import { useState } from "react";
import Image from "next/image";
import Slideshow from "@/components/SlideShow";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="flex min-h-screen relative">
      {/* Bagian Kiri (Form Login) */}
      <div className="w-full md:w-[40%] bg-[#2b210a] flex flex-col justify-center items-center px-10 py-12 text-white z-10 relative">
        <div className="w-full max-w-sm space-y-6">
          {/* Judul Sign In */}
          <h1 className="text-4xl font-bold text-center mb-6 -mt-10">
            Sign In
          </h1>

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-md bg-[#4d4020] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Masukkan email"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-md bg-[#4d4020] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Masukkan password"
                required
              />
            </div>

            <div className="flex justify-between text-sm font-medium">
              <a href="#" className="hover:underline">
                Lupa Password
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1b1405] py-3 rounded-md font-bold hover:bg-[#3a2f12] transition"
            >
              Login
            </button>

            <p className="text-center text-sm">
              Tidak punya akun?{" "}
              <a href="/register" className="font-semibold hover:underline">
                Buat Akun
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* Bagian Kanan (Gambar + Teks Sambutan) */}
      <div className="hidden md:flex flex-col justify-center w-[60%] relative overflow-hidden">
        {/* Gambar Background */}
        <div className="absolute inset-0">
          <Image
            src="/img/login/LoginPage.jpg"
            alt="Coffeeshop"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Teks Sambutan */}
        <div className="relative z-10 px-12">
          <h2 className="text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
            Hello, <br /> Selamat Datang!
          </h2>
          <p className="text-white text-base max-w-md drop-shadow-md">
            CuppaPlace menghubungkan pecinta kopi dengan coffeeshop terbaik yang
            telah bermitra.
          </p>
        </div>
      </div>

      {/* Slideshow di bawah dan selalu terlihat */}
      <div className="fixed bottom-0 left-0 w-full bg-[#2b210a]/90 z-50">
        <Slideshow />
      </div>
    </div>
  );
}
