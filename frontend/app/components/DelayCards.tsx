"use client";
import { Crossing } from "../types";

const DELAY_COLOR = { Normal: "#4ADE80", Moderate: "#FBBF24", High: "#EF4444", Critical: "#DC2626" };
const RISK_COLOR  = { Low: "#4ADE80", Medium: "#FBBF24", High: "#EF4444" };

export default function DelayCards({ crossings }: { crossings: Crossing[] }) {
  const sorted = [...crossings].sort((a, b) => b.wait_time - a.wait_time);
  const critical = sorted.filter((c) => c.delay_label === "Critical");
  const high     = sorted.filter((c) => c.delay_label === "High");
  const rest     = sorted.filter((c) => !["Critical","High"].includes(c.delay_label));

  const Card = ({ c }: { c: Crossing }) => (
    <div className="rounded-xl p-4 transition-all hover:scale-[1.01]"
      style={{ border: `1px solid ${DELAY_COLOR[c.delay_label]}40`, background: "#030712" }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-bold text-white">{c.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{c.country} · {c.type}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-lg font-semibold flex-shrink-0"
          style={{ background: `${DELAY_COLOR[c.delay_label]}18`, color: DELAY_COLOR[c.delay_label], border: `1px solid ${DELAY_COLOR[c.delay_label]}` }}>
          {c.delay_label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Wait",      value: `${c.wait_time}m`,                  color: DELAY_COLOR[c.delay_label] },
          { label: "vs Avg",    value: `${c.wait_vs_avg > 0 ? "+" : ""}${c.wait_vs_avg}%`, color: c.wait_vs_avg > 0 ? "#EF4444" : "#4ADE80" },
          { label: "Throughput",value: `${(c.throughput/1000).toFixed(1)}K`, color: "#4ADE80" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg p-2 text-center"
            style={{ background: "#0B1117", border: "1px solid #1F2937" }}>
            <p className="text-xs font-bold" style={{ color: item.color }}>{item.value}</p>
            <p className="text-gray-600 mt-0.5" style={{ fontSize: "9px" }}>{item.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-500">{c.commodity}</span>
        <span className="font-semibold" style={{ color: RISK_COLOR[c.risk_level] }}>{c.risk_level} Risk</span>
      </div>
      <div className="mt-2 w-full rounded-full" style={{ height: 3, background: "#1F2937" }}>
        <div style={{ width: `${Math.min((c.wait_time / 200) * 100, 100)}%`, height: 3, background: DELAY_COLOR[c.delay_label], borderRadius: 9999 }} />
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white">Delay Exposure Cards</h2>
        <div className="flex gap-2 text-xs">
          <span style={{ color: "#DC2626" }}>● {critical.length} Critical</span>
          <span style={{ color: "#EF4444" }}>● {high.length} High</span>
        </div>
      </div>
      {critical.length > 0 && (
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#DC2626", fontSize: "9px" }}>Critical Delays</p>
          <div className="grid grid-cols-2 gap-3">{critical.map((c) => <Card key={c.id} c={c} />)}</div>
        </div>
      )}
      {high.length > 0 && (
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#EF4444", fontSize: "9px" }}>High Delays</p>
          <div className="grid grid-cols-2 gap-3">{high.map((c) => <Card key={c.id} c={c} />)}</div>
        </div>
      )}
      {rest.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest mb-2 text-gray-600" style={{ fontSize: "9px" }}>Normal / Moderate</p>
          <div className="grid grid-cols-2 gap-3">{rest.map((c) => <Card key={c.id} c={c} />)}</div>
        </div>
      )}
    </div>
  );
}
