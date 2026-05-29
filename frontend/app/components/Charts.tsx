"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Crossing } from "../types";

export default function Charts({ crossings }: { crossings: Crossing[] }) {
  const waitData = [...crossings]
    .sort((a, b) => b.wait_time - a.wait_time)
    .slice(0, 10)
    .map((c) => ({
      name: c.name.length > 14 ? c.name.slice(0, 14) + "…" : c.name,
      wait_time: c.wait_time,
      fill: c.risk_level === "High" ? "#EF4444" : c.risk_level === "Medium" ? "#FBBF24" : "#4ADE80",
    }));

  const throughputData = [...crossings]
    .sort((a, b) => b.throughput - a.throughput)
    .slice(0, 10)
    .map((c) => ({
      name: c.name.length > 14 ? c.name.slice(0, 14) + "…" : c.name,
      throughput: c.throughput,
    }));

  return (
    <div className="h-full overflow-y-auto p-5 space-y-6">
      <div className="rounded-2xl p-5" style={{ border: "1px solid #1F2937", background: "#0B1117" }}>
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
          ⏱️ Wait Time by Crossing (minutes)
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={waitData} margin={{ top: 4, right: 8, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0B1117", border: "1px solid #1F2937", borderRadius: 8, color: "#fff" }} />
            <Bar dataKey="wait_time" radius={[4, 4, 0, 0]} maxBarSize={32}
              fill="#38BDF8"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl p-5" style={{ border: "1px solid #1F2937", background: "#0B1117" }}>
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
          📦 Throughput by Crossing (per day)
        </h3>
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
    </div>
  );
}
