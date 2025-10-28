"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function LaporanPage() {
  const dataHarian = [
    { name: "Senin", value: 30 },
    { name: "Selasa", value: 50 },
    { name: "Rabu", value: 35 },
    { name: "Kamis", value: 55 },
    { name: "Jumat", value: 45 },
    { name: "Sabtu", value: 60 },
    { name: "Minggu", value: 60 },
  ];

  const dataBulanan = [
    { name: "Januari", value: 100 },
    { name: "Februari", value: 110 },
    { name: "Maret", value: 95 },
    { name: "April", value: 120 },
    { name: "Mei", value: 115 },
    { name: "Juni", value: 105 },
    { name: "Juli", value: 118 },
    { name: "Agustus", value: 125 },
    { name: "September", value: 110 },
    { name: "Oktober", value: 130 },
    { name: "November", value: 140 },
    { name: "Desember", value: 150 },
  ];

  const dataTahunan = [
    { name: "2020", value: 500 },
    { name: "2021", value: 700 },
    { name: "2022", value: 750 },
    { name: "2023", value: 720 },
    { name: "2024", value: 800 },
    { name: "2025", value: 850 },
    { name: "2026", value: 820 },
  ];

  return (
    <section className="p-8 text-[#1b1405] space-y-6">
      {/* Informasi Cafe */}
      <div className="bg-white border border-gray-300/40 rounded-xl p-6 shadow-md">
        <h1 className="text-xl font-bold mb-4">Informasi Cafe</h1>
        <div className="grid grid-cols-3 gap-4">
          {["Harian", "Bulanan", "Tahunan"].map((label) => (
            <div
              key={label}
              className="border border-gray-300/40 rounded-xl p-5 text-center shadow-sm bg-white"
            >
              <p className="font-semibold">{label}</p>
              <p className="text-3xl font-bold mt-2">120</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grafik Pengunjung */}
      <div className="bg-white border border-gray-300/40 rounded-xl p-6 shadow-md">
        <h2 className="text-lg font-bold mb-6">Grafik Pengunjung</h2>

        <div className="space-y-14">
          {/* Harian */}
          <div>
            <p className="font-semibold mb-2">Harian</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dataHarian}
                  margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#1b1405", fontSize: 12 }}
                    interval={0}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2b210a"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bulanan */}
          <div>
            <p className="font-semibold mb-2">Bulanan</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dataBulanan}
                  margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#1b1405", fontSize: 12 }}
                    interval={0}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2b210a"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tahunan */}
          <div>
            <p className="font-semibold mb-2">Tahunan</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dataTahunan}
                  margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#1b1405", fontSize: 12 }}
                    interval={0}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2b210a"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
