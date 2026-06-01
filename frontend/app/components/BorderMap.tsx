"use client";
import { useEffect, useRef } from "react";
import { Crossing } from "../types";

const RISK_COLOR = { Low: "#4ADE80", Medium: "#FBBF24", High: "#EF4444" };
const TYPE_COLOR = { Rail: "#A78BFA", Sea: "#60A5FA", Land: null };

type Props = {
  crossings: Crossing[];
  selected: Crossing | null;
  onSelect: (c: Crossing) => void;
};

export default function BorderMap({ crossings, selected, onSelect }: Props) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers     = useRef<any[]>([]);
  const lines       = useRef<any[]>([]);   // ← NEW: store lines here
  const initialized = useRef(false);

  // Init map once
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || initialized.current) return;
    initialized.current = true;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!, {
        center: [20, 10],
        zoom: 2,
        zoomControl: true,
        preferCanvas: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CartoDB",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;
    })();
  }, []);

  // Render markers + connecting lines whenever crossings or selected changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = setInterval(async () => {
      if (!mapInstance.current) return;
      clearInterval(interval);

      const L = (await import("leaflet")).default;

      // Remove old markers
      markers.current.forEach((m) => m.remove());
      markers.current = [];

      // ↓ NEW: Remove old lines before drawing new ones
      lines.current.forEach((l) => l.remove());
      lines.current = [];

      // ↓ NEW: Draw connecting lines between all crossings that have lat/lon
      // We connect each crossing to its nearest neighbours by type
      const validCrossings = crossings.filter((c) => c.lat && c.lon);

      // Group crossings by type and connect them in sequence
      const typeGroups: Record<string, Crossing[]> = {};
      validCrossings.forEach((c) => {
        if (!typeGroups[c.type]) typeGroups[c.type] = [];
        typeGroups[c.type].push(c);
      });

      Object.entries(typeGroups).forEach(([type, group]) => {
        // Connect each point to the next point of the same type
        for (let i = 0; i < group.length - 1; i++) {
          const from = group[i];
          const to   = group[i + 1];

          const color =
            type === "Rail" ? "#A78BFA" :
            type === "Sea"  ? "#60A5FA" :
            "#4ADE80"; // Land default

          const line = L.polyline(
            [[from.lat!, from.lon!], [to.lat!, to.lon!]],
            {
              color,
              weight: 1.5,
              opacity: 0.45,
              // Rail = dashed line, Sea = solid, Land = dotted
              dashArray:
                type === "Rail" ? "8, 5" :
                type === "Land" ? "2, 6" :
                undefined,
            }
          ).addTo(mapInstance.current);

          lines.current.push(line);
        }
      });

      // Draw markers on top of lines
      crossings.forEach((c) => {
        if (!c.lat || !c.lon) return;

        const isSelected = selected?.id === c.id;
        const color = TYPE_COLOR[c.type] ?? RISK_COLOR[c.risk_level];
        const size  = isSelected ? 16 : 9;

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:${color};
            border:${isSelected ? "2px solid #fff" : "1px solid " + color + "99"};
            box-shadow:0 0 ${isSelected ? 14 : 6}px ${color}${isSelected ? "ee" : "77"};
          "></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([c.lat, c.lon], { icon });

        marker.bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:190px">
            <p style="color:#38BDF8;font-weight:700;font-size:13px;margin:0 0 3px">${c.name}</p>
            <p style="color:#9CA3AF;font-size:11px;margin:0 0 8px">${c.country} · ${c.type}</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:8px">
              <div style="background:#030712;border:1px solid #1F2937;border-radius:8px;padding:6px">
                <p style="color:#6B7280;font-size:9px;text-transform:uppercase;margin:0 0 2px">Wait</p>
                <p style="color:${color};font-weight:700;font-size:15px;margin:0">${c.wait_time}m</p>
              </div>
              <div style="background:#030712;border:1px solid #1F2937;border-radius:8px;padding:6px">
                <p style="color:#6B7280;font-size:9px;text-transform:uppercase;margin:0 0 2px">Throughput</p>
                <p style="color:#4ADE80;font-weight:700;font-size:15px;margin:0">${c.throughput.toLocaleString()}</p>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="color:#6B7280;font-size:10px">${c.commodity}</span>
              <span style="color:${color};font-size:11px;font-weight:600;padding:2px 6px;border:1px solid ${color}44;border-radius:6px">${c.delay_label}</span>
            </div>
          </div>
        `, { maxWidth: 260 });

        marker.on("mouseover", () => marker.openPopup());
        marker.on("mouseout",  () => marker.closePopup());
        marker.on("click",     () => onSelect(c));

        marker.addTo(mapInstance.current);
        markers.current.push(marker);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [crossings, selected]);

  // Pan to selected
  useEffect(() => {
    if (!mapInstance.current || !selected?.lat || !selected?.lon) return;
    mapInstance.current.setView(
      [selected.lat, selected.lon],
      Math.max(mapInstance.current.getZoom(), 4),
      { animate: true }
    );
  }, [selected]);

  return (
    <div ref={mapRef} style={{ width: "100%", height: "100%", background: "#0B1117" }} />
  );
}
