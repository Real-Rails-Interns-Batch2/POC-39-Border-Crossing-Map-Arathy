
"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Crossing } from "../types";

export default function Charts({ crossings }: { crossings: Crossing[] }) {
  const waitData = [...crossings]
    .sort((a, b) => b.wait_time - a.wait_time)
    .slice(0, 10)
    .map((c) => ({
      name: c.name.length > 14 ? c.name.slice(0, 14) + "..." : c.name,
      wait_time: c.wait_time,
    }));

  const throughputData = [...crossings]
    .sort((a, b) => b.throughput - a.throughput)
    .slice(0, 10)
    .map((c) => ({
      name: c.name.length > 14 ? c.name.slice(0, 14) + "..." : c.name,
      throughput: c.throughput,
    }));

  const commodityMap: Record<string, number> = {};
  crossings.forEach((c) => {
    const key = c.commodity || "Unknown";
    commodityMap[key] = (commodityMap[key] || 0) + c.throughput;
  });
  const commodityData = Object.entries(commodityMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ["#38BDF8","#4ADE80","#FBBF24","#EF4444","#A78BFA","#F472B6","#34D399","#FB923C"];

  return (
    <div className="h-full overflow-y-auto p-5 space-y-6">
      <div className="rounded-2xl p-5" style={{ border: "1px solid #1F2937", background: "#0B1117" }}>
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">⏱️ Wait Time by Crossing (minutes)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={waitData} margin={{ top: 4, right: 8, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0B1117", border: "1px solid #1F2937", borderRadius: 8, color: "#fff" }} />
            <Bar dataKey="wait_time" fill="#38BDF8" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl p-5" style={{ border: "1px solid #1F2937", background: "#0B1117" }}>
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">📦 Throughput by Crossing (per day)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={throughputData} margin={{ top: 4, right: 8, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip contentStyle={{ background: "#0B1117", border: "1px solid #1F2937", borderRadius: 8, color: "#fff" }} />
            <Bar dataKey="throughput" fill="#818CF8" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl p-5" style={{ border: "1px solid #1F2937", background: "#0B1117" }}>
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">🏷️ Commodity Flow Distribution</h3>
        {commodityData.length === 0 ? (
          <p className="text-gray-600 text-xs text-center py-10">No commodity data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={commodityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {commodityData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0B1117", border: "1px solid #1F2937", borderRadius: 8, color: "#fff" }} formatter={(v: number) => v.toLocaleString()} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#6B7280" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

