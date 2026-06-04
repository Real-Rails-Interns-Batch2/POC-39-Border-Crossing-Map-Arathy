"use client";
import { useState } from "react";
import { Crossing } from "../types";

const RISK_COLOR  = { Low: "#4ADE80", Medium: "#FBBF24", High: "#EF4444" };
const DELAY_COLOR = { Normal: "#4ADE80", Moderate: "#FBBF24", High: "#EF4444", Critical: "#DC2626" };

export default function ComparePanel({ crossings }: { crossings: Crossing[] }) {
  const [idA, setIdA] = useState<number>(crossings[0]?.id ?? 0);
  const [idB, setIdB] = useState<number>(crossings[1]?.id ?? 0);

  const a = crossings.find((c) => c.id === idA);
  const b = crossings.find((c) => c.id === idB);

  const fields: { label: string; key: keyof Crossing; format?: (v: any) => string }[] = [
    { label: "Country",         key: "country" },
    { label: "Type",            key: "type" },
    { label: "Commodity",       key: "commodity" },
    { label: "Wait Time",       key: "wait_time",      format: (v) => `${v} min` },
    { label: "vs. Average",     key: "wait_vs_avg",    format: (v) => `${v > 0 ? "+" : ""}${v}%` },
    { label: "Throughput",      key: "throughput",     format: (v) => v.toLocaleString() },
    { label: "Throughput Tier", key: "throughput_tier" },
    { label: "Delay Status",    key: "delay_label" },
    { label: "Risk Level",      key: "risk_level" },
    { label: "Status",          key: "status" },
  ];

  return (
    <div className="h-full overflow-y-auto p-5">
      <h2 className="text-sm font-bold text-white mb-1">Crossing Comparison</h2>
      <p className="text-xs text-gray-500 mb-4">Select two crossings to compare intelligence side-by-side</p>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[{ val: idA, set: setIdA, label: "Crossing A" }, { val: idB, set: setIdB, label: "Crossing B" }].map((sel, i) => (
          <div key={i}>
            <p className="text-xs text-gray-500 mb-1">{sel.label}</p>
            <div className="relative">
              <select value={sel.val} onChange={(e) => sel.set(Number(e.target.value))}
                className="w-full appearance-none rounded-xl pl-3 pr-7 py-2 text-xs text-white outline-none"
                style={{ background: "#0B1117", border: "1px solid #1F2937" }}>
                {crossings.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▾</span>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      {a && b && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1F2937" }}>
          {/* Header */}
          <div className="grid grid-cols-3 text-xs font-semibold"
            style={{ background: "#030712", borderBottom: "1px solid #1F2937" }}>
            <div className="px-3 py-2 text-gray-500">Metric</div>
            <div className="px-3 py-2 text-cyan-400 truncate">{a.name}</div>
            <div className="px-3 py-2 text-indigo-400 truncate">{b.name}</div>
          </div>
          {fields.map((f, i) => {
            const av = f.format ? f.format(a[f.key]) : String(a[f.key]);
            const bv = f.format ? f.format(b[f.key]) : String(b[f.key]);
            const aColor = f.key === "risk_level" ? RISK_COLOR[a.risk_level as keyof typeof RISK_COLOR]
             : f.key === "delay_label" ? DELAY_COLOR[(a.delay_label ?? "Normal") as keyof typeof DELAY_COLOR]
             : f.key === "wait_vs_avg" ? ((a.wait_vs_avg ?? 0) > 0 ? "#EF4444" : "#4ADE80")
             : "#e2e8f0";
            const bColor = f.key === "risk_level" ? RISK_COLOR[b.risk_level as keyof typeof RISK_COLOR]
             : f.key === "delay_label" ? DELAY_COLOR[(b.delay_label ?? "Normal") as keyof typeof DELAY_COLOR]
             : f.key === "wait_vs_avg" ? ((b.wait_vs_avg ?? 0) > 0 ? "#EF4444" : "#4ADE80")
             : "#e2e8f0";
            return (
              <div key={f.key} className="grid grid-cols-3 text-xs"
                style={{ background: i % 2 === 0 ? "transparent" : "#0B111720", borderBottom: "1px solid #0d1520" }}>
                <div className="px-3 py-2.5 text-gray-500">{f.label}</div>
                <div className="px-3 py-2.5 font-semibold" style={{ color: aColor }}>{av}</div>
                <div className="px-3 py-2.5 font-semibold" style={{ color: bColor }}>{bv}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
