"use client";
import { Crossing } from "../types";

type Props = {
  crossing: Crossing | null;
  allCrossings: Crossing[];
  onSelect: (crossing: Crossing) => void;
  onDownload: () => void;
  stats: any;
};

const riskColors: Record<string, string> = {
  Low: "#4ADE80",
  Medium: "#FBBF24",
  High: "#EF4444",
};

const statusColors: Record<string, string> = {
  Active: "#38BDF8",
  Restricted: "#EF4444",
  Seasonal: "#FBBF24",
};

export default function Sidebar({ crossing, allCrossings, onSelect, onDownload, stats }: Props) {
  return (
    <div className="flex flex-col gap-4 p-4">

      {/* SECTION A - Title & High Level Metrics */}
      <div
        className="rounded-2xl p-5"
        style={{ border: "1px solid #1F2937", background: "#0B1117" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-bold"
            style={{ background: "#38BDF822", color: "#38BDF8", border: "1px solid #38BDF8" }}
          >
            LIVE
          </span>
          <h2 className="text-sm font-bold text-white">
            Border Intelligence
          </h2>
        </div>

        {/* High Level Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Crossings", value: stats?.total ?? "-", color: "#38BDF8" },
            { label: "Active", value: stats?.active ?? "-", color: "#4ADE80" },
            { label: "Avg Wait Time", value: stats ? `${stats.avg_wait_time}m` : "-", color: "#FBBF24" },
            { label: "High Risk", value: stats?.high_risk ?? "-", color: "#EF4444" },
            { label: "Total Volume", value: stats ? `${(stats.total_throughput / 1000).toFixed(0)}K/day` : "-", color: "#818CF8" },
            { label: "Restricted", value: stats?.restricted ?? "-", color: "#EF4444" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-3"
              style={{ background: "#030712", border: "1px solid #1F2937" }}
            >
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className="text-lg font-bold" style={{ color: item.color }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Download Button */}
        <button
          onClick={onDownload}
          className="w-full mt-3 rounded-xl py-2 text-xs font-medium transition"
          style={{ border: "1px solid #38BDF8", color: "#38BDF8" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#38BDF8";
            e.currentTarget.style.color = "#000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#38BDF8";
          }}
        >
          ⬇ Download Sample Data
        </button>
      </div>

      {/* Selected Crossing Details */}
      {crossing && (
        <div
          className="rounded-2xl p-5"
          style={{ border: "1px solid #1F2937", background: "#0B1117" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-cyan-400">
              {crossing.name}
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-lg font-semibold"
              style={{
                border: `1px solid ${statusColors[crossing.status]}`,
                color: statusColors[crossing.status],
              }}
            >
              {crossing.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            {crossing.country} · {crossing.type}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Wait Time", value: `${crossing.wait_time} min`, color: "#FBBF24" },
              { label: "Throughput", value: `${crossing.throughput.toLocaleString()}/day`, color: "#4ADE80" },
              { label: "Commodity", value: crossing.commodity, color: "#fff" },
              { label: "Risk Level", value: crossing.risk_level, color: riskColors[crossing.risk_level] },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-3"
                style={{ border: "1px solid #1F2937", background: "#030712" }}
              >
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-bold" style={{ color: item.color }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION B - Why This Matters */}
      <div
        className="rounded-2xl p-5"
        style={{ border: "1px solid #1F2937", background: "#0B1117" }}
      >
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">
          Why This Matters
        </h3>
        <p className="text-xs text-gray-300 leading-5">
          Border crossings are critical choke points in global supply chains.
          Every hour of delay at a high-volume crossing cascades into inventory
          shortfalls, price volatility, and logistics re-routing costs. For
          allocators and trade analysts, crossing friction is a leading indicator
          of commodity flow disruption.
        </p>
      </div>

      {/* SECTION C - Who Controls The Rail */}
      <div
        className="rounded-2xl p-5"
        style={{ border: "1px solid #1F2937", background: "#0B1117" }}
      >
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">
          Who Controls The Rail
        </h3>
        <p className="text-xs text-gray-300 leading-5 mb-3">
          Customs authorities, bilateral trade agreements, and national
          border agencies govern crossing operations. Political tensions,
          trade disputes, and regulatory changes directly impact throughput
          and access levels at each node.
        </p>
        <div className="space-y-2">
          {[
            { entity: "CBDT (India)", role: "Customs & Tax Authority" },
            { entity: "US CBP", role: "Customs & Border Protection" },
            { entity: "HMRC (UK)", role: "Revenue & Customs" },
            { entity: "WCO", role: "World Customs Organization" },
          ].map((item) => (
            <div
              key={item.entity}
              className="flex items-center justify-between text-xs p-2 rounded-lg"
              style={{ background: "#030712" }}
            >
              <span className="text-cyan-400 font-medium">{item.entity}</span>
              <span className="text-gray-500">{item.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION D - Data Source Status */}
      <div
        className="rounded-2xl p-5"
        style={{ border: "1px solid #1F2937", background: "#0B1117" }}
      >
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">
          Data Source Status
        </h3>
        <div className="space-y-2">
          {[
            { label: "OpenStreetMap Overpass", status: "Live", color: "#4ADE80" },
            { label: "UN Comtrade", status: "Synthetic", color: "#FBBF24" },
            { label: "US Census Bureau", status: "Synthetic", color: "#FBBF24" },
            { label: "Wait Time Events", status: "Synthetic", color: "#FBBF24" },
            { label: "Throughput Data", status: "Synthetic", color: "#FBBF24" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-gray-400">{s.label}</span>
              <span
                className="px-2 py-0.5 rounded-lg"
                style={{ border: `1px solid ${s.color}`, color: s.color }}
              >
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Select */}
      <div
        className="rounded-2xl p-5"
        style={{ border: "1px solid #1F2937", background: "#0B1117" }}
      >
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">
          Quick Select
        </h3>
        <div className="space-y-1">
          {allCrossings.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelect(c)}
              className="flex items-center justify-between cursor-pointer rounded-xl px-3 py-2 transition"
              style={{
                background: crossing?.id === c.id ? "#1F2937" : "transparent",
                border: crossing?.id === c.id
                  ? "1px solid #38BDF8"
                  : "1px solid transparent",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: riskColors[c.risk_level],
                    flexShrink: 0,
                  }}
                />
                <span className="text-xs text-white">{c.name}</span>
              </div>
              <span
                className="text-xs font-bold"
                style={{ color: riskColors[c.risk_level] }}
              >
                {c.wait_time}m
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}