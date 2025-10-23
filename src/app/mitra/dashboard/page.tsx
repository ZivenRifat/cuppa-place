"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Star } from "lucide-react";

const data = [
  { name: "Senin", value: 30 },
  { name: "Selasa", value: 50 },
  { name: "Rabu", value: 35 },
  { name: "Kamis", value: 55 },
  { name: "Jumat", value: 45 },
  { name: "Sabtu", value: 60 },
  { name: "Minggu", value: 60 },
];

export default function MitraDashboard() {
  return (
    <section className="p-8 grid grid-cols-3 gap-6 text-[#1b1405] bg-[#faf9f7]">
      {/* Cards */}
      {[
        { title: "Total Penjualan Harian", value: "120" },
        { title: "Total Penjualan Bulanan", value: "450" },
        {
          title: "AVG Rating",
          value: (
            <span className="flex items-center gap-2">
              <Star className="fill-yellow-400 text-yellow-400" size={22} /> 4.5
            </span>
          ),
        },
        { title: "Jumlah Ulasan", value: "320" },
        { title: "Jumlah Favorit", value: "89" },
      ].map((card, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <p className="font-semibold mb-1">{card.title}</p>
          <p className="text-3xl font-bold">{card.value}</p>
        </div>
      ))}

      <div></div>

      {/* Grafik Pengunjung */}
      <div className="col-span-2 bg-white p-6 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
        <p className="font-semibold mb-4">Grafik Pengunjung Harian</p>
        <div className="h-72 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 40, bottom: 15, left: 25, right: 25 }}
            >
              <XAxis
                dataKey="name"
                tickMargin={10}
                tick={{ fill: "#1b1405", fontSize: 12 }}
                padding={{ left: 30, right: 30 }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2b210a"
                strokeWidth={3}
                dot={false}
                connectNulls
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Menu Rekomendasi */}
      <div className="bg-white p-6 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <p className="font-semibold">Menu Rekomendasi</p>
          <button className="bg-[#2b210a] text-white px-3 py-1 rounded-md text-sm hover:bg-[#443716] transition">
            Edit
          </button>
        </div>
        <ul className="space-y-2">
          {[
            "Kopi Susu Aren",
            "Matcha Latte",
            "Americano",
            "Kopi Susu Irish",
            "Mocktail Coffee",
          ].map((menu, i) => (
            <li
              key={i}
              className="px-3 py-2 bg-[#f5f5f5] rounded-md hover:bg-[#ebe7e3] transition"
            >
              {menu}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
