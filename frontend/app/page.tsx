"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Crossing, Stats } from "./types";
import Sidebar from "./components/Sidebar";
import DelayCards from "./components/DelayCards";
import Charts from "./components/Charts";
import Compare from "./components/Compare";
import DataTable from "./components/Table";
import Analytics from "./components/Analytics";
import TradeData from "./components/TradeData";
import CensusData from "./components/Census";
import DistanceCalculator from "./components/DistanceCalculator";
import DeckOverlay from "./components/DeckMap";
import SmartSearch from "./components/Search";

const BorderMap = dynamic(() => import("./components/BorderMap"), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Tab = "map"|"delays"|"compare"|"chart"|"table"|"analytics"|"trade"|"census"|"distance"|"deck";

export default function Home() {
  const [crossings, setCrossings]       = useState<Crossing[]>([]);
  const [filtered, setFiltered]         = useState<Crossing[]>([]);
  const [selected, setSelected]         = useState<Crossing | null>(null);
  const [stats, setStats]               = useState<Stats | null>(null);
  const [activeTab, setActiveTab]       = useState<Tab>("map");
  const [riskFilter, setRiskFilter]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter]     = useState("All");
  const [loading, setLoading]           = useState(true);
  const [isMock, setIsMock]             = useState(false);

  // ── Mock fallback per manifesto guardrail ──────────────────────────────────
  async function fetchData() {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        fetch(`${API}/api/crossings`, { signal: AbortSignal.timeout(5000) }),
        fetch(`${API}/api/stats`,     { signal: AbortSignal.timeout(5000) }),
      ]);
      if (!cRes.ok || !sRes.ok) throw new Error();
      const cData = await cRes.json();
      const sData = await sRes.json();
      setCrossings(cData.data);
      setFiltered(cData.data);
      setStats(sData);
      if (cData.data.length > 0) setSelected(cData.data[0]);
      setIsMock(false);
    } catch {
      const mock = await fetch("/mock_crossings.json");
      const data = await mock.json();
      setCrossings(data.crossings);
      setFiltered(data.crossings);
      setStats(data.stats);
      if (data.crossings.length > 0) setSelected(data.crossings[0]);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let r = crossings;
    if (riskFilter   !== "All") r = r.filter((c) => c.risk_level === riskFilter);
    if (statusFilter !== "All") r = r.filter((c) => c.status     === statusFilter);
    if (typeFilter   !== "All") r = r.filter((c) => c.type       === typeFilter);
    setFiltered(r);
  }, [riskFilter, statusFilter, typeFilter, crossings]);

  function downloadCSV() {
    const rows = [
      "ID,Name,Country,Type,Commodity,WaitTime,WaitVsAvg,Throughput,ThroughputTier,Status,RiskLevel,DelayLabel",
      ...crossings.map((c) =>
        `${c.id},"${c.name}","${c.country}",${c.type},"${c.commodity}",${c.wait_time},${c.wait_vs_avg}%,${c.throughput},${c.throughput_tier},${c.status},${c.risk_level},${c.delay_label}`
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "border_crossings_poc39.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ background: "#030712" }}>
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-cyan-400 text-sm uppercase tracking-widest">Loading Border Intelligence...</p>
        <p className="text-gray-600 text-xs mt-2">POC 39 · Real Rails Intelligence Library</p>
      </div>
    </div>
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "map",      label: "🗺️ Map" },
    { id: "delays",   label: "🚨 Delays" },
    { id: "compare",  label: "⚖️ Compare" },
    { id: "chart",    label: "📊 Charts" },
    { id: "table",    label: "📋 Table" },
    { id: "analytics",label: "🧠 Analytics" },
    { id: "trade",    label: "🌍 Trade" },
    { id: "census",   label: "🏛️ Census" },
    { id: "distance", label: "📏 Distance" },
    { id: "deck",     label: "✨ deck.gl" },
  ];

  return (
    <main style={{ background: "#030712" }} className="text-white h-screen flex flex-col overflow-hidden">

      {/* ══ HEADER ══ */}
      <header className="flex-shrink-0 px-6 py-3 flex items-center justify-between gap-4"
        style={{ background: "#0B1117", borderBottom: "1px solid #1F2937" }}>

        {/* Title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#0d1f35", border: "1px solid #38BDF830" }}>
            🗺️
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight whitespace-nowrap">
              Border Crossing Activity Map
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs px-1.5 rounded font-medium"
                style={{ background: isMock ? "#FBBF2414" : "#38BDF814", color: isMock ? "#FBBF24" : "#38BDF8", border: `1px solid ${isMock ? "#FBBF2430" : "#38BDF830"}` }}>
                {isMock ? "MOCK" : "LIVE"}
              </span>
              <span className="text-xs text-gray-600 whitespace-nowrap">
                InfoCreon Internship · Real Rails · POC 39 · Data & Intelligence Rail
              </span>
            </div>
          </div>
        </div>



        <button onClick={fetchData}
          className="flex-shrink-0 rounded-xl px-3 py-2 text-xs transition-all"
          style={{ border: "1px solid #1F2937", color: "#6B7280" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor="#38BDF8"; e.currentTarget.style.color="#38BDF8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor="#1F2937"; e.currentTarget.style.color="#6B7280"; }}>
          ↺ Refresh
        </button>
      </header>

      {/* ══ TAB + SEARCH + FILTER BAR ══ */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 overflow-x-auto"
        style={{ background: "#0B1117", borderBottom: "1px solid #1F2937" }}>

        {/* Tabs */}
        <div className="flex gap-1 flex-shrink-0">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
              style={{
                background: activeTab === tab.id ? "#38BDF8" : "transparent",
                color:      activeTab === tab.id ? "#000"    : "#6B7280",
                border:     activeTab === tab.id ? "1px solid #38BDF8" : "1px solid transparent",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 flex-shrink-0" style={{ background: "#1F2937" }} />

        {/* Smart Search */}
        <div className="flex-1" style={{ minWidth: "180px", maxWidth: "280px" }}>
          <SmartSearch crossings={crossings} onSelect={setSelected} onFilter={setFiltered} />
        </div>

        {/* Filter dropdowns */}
        {[
          { value: riskFilter,   onChange: setRiskFilter,   options: ["All","Low","Medium","High"],            label: "Risk" },
          { value: statusFilter, onChange: setStatusFilter, options: ["All","Active","Restricted","Seasonal"], label: "Status" },
          { value: typeFilter,   onChange: setTypeFilter,   options: ["All","Land","Rail","Sea"],              label: "Type" },
        ].map((f) => (
          <div key={f.label} className="relative flex-shrink-0">
            <select value={f.value} onChange={(e) => f.onChange(e.target.value)}
              className="appearance-none rounded-lg pl-2 pr-6 py-1.5 text-xs text-white outline-none cursor-pointer"
              style={{ background: "#030712", border: "1px solid #1F2937", minWidth: "95px" }}>
              {f.options.map((o) => (
                <option key={o} value={o}>{o === "All" ? `All ${f.label}` : o}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500"
              style={{ fontSize: "9px" }}>▾</span>
          </div>
        ))}

        <span className="text-xs text-gray-600 whitespace-nowrap flex-shrink-0">
          {filtered.length}/{crossings.length}
        </span>
      </div>

      {/* ══ MAIN — 70 / 30 ══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT STAGE 70% */}
        <section className="flex flex-col p-4 overflow-hidden"
          style={{ width: "70%", borderRight: "1px solid #1F2937" }}>

          {/* Legend — each item has whitespace-nowrap + gap */}
          <div className="flex gap-4 mb-3 text-xs flex-shrink-0">
            {[
              { label: "Low Risk",    color: "#4ADE80" },
              { label: "Medium Risk", color: "#FBBF24" },
              { label: "High Risk",   color: "#EF4444" },
              { label: "Sea",         color: "#60A5FA" },
              { label: "Rail",        color: "#A78BFA" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-xs" style={{ color: item.color }}>{item.label}</span>
              </div>
            ))}
            <span className="text-xs text-gray-600 ml-auto whitespace-nowrap">
              {filtered.length} of {crossings.length}
            </span>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden rounded-2xl"
            style={{ border: "1px solid #1F2937", background: "#0B1117" }}>
            {activeTab === "map" && <BorderMap crossings={filtered} selected={selected} onSelect={setSelected} />}
            {activeTab === "delays"   && <DelayCards crossings={filtered} />}
            {activeTab === "compare"  && <Compare crossings={filtered} />}
            {activeTab === "chart"    && <Charts crossings={filtered} />}
            {activeTab === "table"    && <DataTable crossings={filtered} />}
            {activeTab === "analytics"&& <Analytics />}
            {activeTab === "trade"    && <TradeData />}
            {activeTab === "census"   && <CensusData />}
            {activeTab === "distance" && <DistanceCalculator crossings={crossings} />}
            {activeTab === "deck"     && <DeckOverlay crossings={filtered} />}
          </div>
        </section>

        {/* RIGHT INTELLIGENCE SIDEBAR 30% */}
        <aside className="overflow-y-auto flex-shrink-0"
          style={{ width: "30%", background: "#030712" }}>
          <Sidebar
            crossing={selected}
            allCrossings={crossings}
            stats={stats}
            onSelect={setSelected}
            onDownload={downloadCSV}
          />
        </aside>
      </div>
    </main>
  );
}
