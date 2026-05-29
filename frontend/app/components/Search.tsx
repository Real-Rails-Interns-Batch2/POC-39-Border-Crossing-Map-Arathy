"use client";
import { useState, useRef, useEffect } from "react";
import { Crossing } from "../types";

type Props = {
  crossings: Crossing[];
  onSelect: (crossing: Crossing) => void;
  onFilter: (filtered: Crossing[]) => void;
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

export default function SmartSearch({ crossings, onSelect, onFilter }: Props) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.trim()
    ? crossings.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase()) ||
        c.commodity.toLowerCase().includes(query.toLowerCase()) ||
        c.risk_level.toLowerCase().includes(query.toLowerCase()) ||
        c.status.toLowerCase().includes(query.toLowerCase()) ||
        c.type.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (query.trim()) {
      onFilter(results);
    } else {
      onFilter(crossings);
    }
  }, [query, crossings]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      clearSearch();
    }
  }

  function handleSelect(crossing: Crossing) {
    setQuery(crossing.name);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onSelect(crossing);
    onFilter([crossing]);
  }

  function clearSearch() {
    setQuery("");
    setShowDropdown(false);
    setSelectedIndex(-1);
    onFilter(crossings);
    inputRef.current?.focus();
  }

  function highlight(text: string, q: string) {
    if (!q.trim()) return <>{text}</>;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} style={{ background: "#38BDF822", color: "#38BDF8", borderRadius: 2, padding: "0 1px" }}>
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">

      {/* ── Input bar ── */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
        style={{
          background: "#0B1117",
          border: focused ? "1px solid #38BDF8" : "1px solid #1F2937",
          boxShadow: focused ? "0 0 0 3px #38BDF814" : "none",
        }}
      >
        {/* Search icon */}
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke={focused ? "#38BDF8" : "#6B7280"} strokeWidth="2"
          className="flex-shrink-0 transition-colors"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            setFocused(true);
            if (query.trim()) setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search by name, country, commodity, risk..."
          className="flex-1 text-sm text-white placeholder-gray-600 outline-none bg-transparent min-w-0"
          style={{ caretColor: "#38BDF8" }}
        />

        {/* Result count badge */}
        {query.trim() && (
          <span
            className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
            style={{ background: "#1F2937", color: "#6B7280" }}
          >
            {results.length}
          </span>
        )}

        {/* Clear button */}
        {query && (
          <button
            onClick={clearSearch}
            className="flex-shrink-0 text-gray-600 hover:text-white transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && query.trim() && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 rounded-xl z-50 overflow-hidden"
          style={{
            border: "1px solid #1F2937",
            background: "#0B1117",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            maxHeight: "320px",
            overflowY: "auto",
          }}
        >
          {results.length === 0 ? (
            <div className="px-4 py-4 text-xs text-gray-500 text-center">
              No crossings match <span className="text-white">"{query}"</span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div
                className="px-4 py-2 text-xs text-gray-600 uppercase tracking-widest"
                style={{ borderBottom: "1px solid #1F2937" }}
              >
                {results.length} result{results.length !== 1 ? "s" : ""}
              </div>

              {/* Results */}
              {results.map((crossing, index) => (
                <div
                  key={crossing.id}
                  onClick={() => handleSelect(crossing)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors"
                  style={{
                    background: index === selectedIndex ? "#1F2937" : "transparent",
                    borderBottom: "1px solid #0d1520",
                  }}
                >
                  {/* Left: dot + name + subtitle */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex-shrink-0"
                      style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: riskColors[crossing.risk_level],
                        boxShadow: `0 0 6px ${riskColors[crossing.risk_level]}88`,
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {highlight(crossing.name, query)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {highlight(crossing.country, query)} · {highlight(crossing.commodity, query)}
                      </p>
                    </div>
                  </div>

                  {/* Right: status badge + wait time */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        border: `1px solid ${statusColors[crossing.status]}`,
                        color: statusColors[crossing.status],
                        background: `${statusColors[crossing.status]}14`,
                      }}
                    >
                      {crossing.status}
                    </span>
                    <span
                      className="text-xs font-bold w-8 text-right"
                      style={{
                        color: crossing.wait_time > 60 ? "#EF4444"
                             : crossing.wait_time > 30 ? "#FBBF24"
                             : "#4ADE80",
                      }}
                    >
                      {crossing.wait_time}m
                    </span>
                  </div>
                </div>
              ))}

              {/* Quick filters footer */}
              <div
                className="px-4 py-2 flex items-center gap-2 flex-wrap"
                style={{ borderTop: "1px solid #1F2937" }}
              >
                <span className="text-xs text-gray-600">Quick:</span>
                {["High", "Low", "Active", "Restricted"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setQuery(tag); setShowDropdown(true); }}
                    className="text-xs px-2 py-0.5 rounded-lg transition-all"
                    style={{ border: "1px solid #1F2937", color: "#6B7280" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#38BDF8";
                      e.currentTarget.style.color = "#38BDF8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#1F2937";
                      e.currentTarget.style.color = "#6B7280";
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
