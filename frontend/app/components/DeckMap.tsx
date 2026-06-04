"use client";
import { useEffect, useRef } from "react";
import { Crossing } from "../types";

export default function DeckOverlay({ crossings }: { crossings: Crossing[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const riskColors: Record<string, string> = {
      Low: "#4ADE80", Medium: "#FBBF24", High: "#EF4444",
    };

    function project(lat: number, lon: number) {
      return {
        x: ((lon + 180) / 360) * canvas!.width,
        y: ((90 - lat)  / 180) * canvas!.height,
      };
    }

    let frame = 0;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame += 0.5;

      crossings.forEach((from, i) => {
        crossings.forEach((to, j) => {
  if (i >= j) return;
  if (!from.lat || !from.lon || !to.lat || !to.lon) return;  
  const fp = project(from.lat, from.lon);
          const tp = project(to.lat,   to.lon   ?? to.lng   ?? 0);
          const dist = Math.hypot(fp.x - tp.x, fp.y - tp.y);
          if (dist > 300) return;

          const midX = (fp.x + tp.x) / 2;
          const midY = (fp.y + tp.y) / 2 - dist * 0.3;
          const opacity = 0.08 + 0.08 * Math.sin((frame + i * 10) * 0.05);
          const isHigh = from.risk_level === "High" || to.risk_level === "High";
          const isMed  = from.risk_level === "Medium" || to.risk_level === "Medium";
          const color  = isHigh ? `rgba(239,68,68,${opacity})` : isMed ? `rgba(251,191,36,${opacity})` : `rgba(56,189,248,${opacity})`;

          ctx.beginPath();
          ctx.moveTo(fp.x, fp.y);
          ctx.quadraticCurveTo(midX, midY, tp.x, tp.y);
          ctx.strokeStyle = color;
          ctx.lineWidth = isHigh ? 2 : 1;
          ctx.stroke();

          const t  = ((frame * 0.01) + i * 0.1) % 1;
          const px = (1-t)*(1-t)*fp.x + 2*(1-t)*t*midX + t*t*tp.x;
          const py = (1-t)*(1-t)*fp.y + 2*(1-t)*t*midY + t*t*tp.y;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = riskColors[from.risk_level];
          ctx.fill();
        });
      });

      crossings.forEach((c) => {
        const pos = project(c.lat, c.lon ?? c.lng ?? 0);
        const color = riskColors[c.risk_level];
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.05);

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = color + "22";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [crossings]);

  return (
    <div className="h-full flex flex-col" style={{ background: "#0B1117" }}>
      <div className="px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: "1px solid #1F2937" }}>
        <div>
          <h3 className="text-xs uppercase tracking-widest text-gray-500">✨ deck.gl Style — Trade Flow</h3>
          <p className="text-xs text-gray-600 mt-0.5">Animated arc flows between border crossings</p>
        </div>
        <div className="flex gap-3 text-xs">
          {[{ label: "Low", color: "#4ADE80" }, { label: "Medium", color: "#FBBF24" }, { label: "High", color: "#EF4444" }].map((item) => (
            <span key={item.label} className="flex items-center gap-1 text-gray-400">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, display: "inline-block" }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ flex: 1, width: "100%", background: "#030712", display: "block" }} />

      <div className="grid grid-cols-3 gap-3 p-4 flex-shrink-0" style={{ borderTop: "1px solid #1F2937" }}>
        {[
          { label: "Total Crossings", value: crossings.length,                                   color: "#38BDF8" },
          { label: "High Risk Nodes", value: crossings.filter((c) => c.risk_level === "High").length, color: "#EF4444" },
          { label: "Active Flows",    value: crossings.filter((c) => c.status === "Active").length,   color: "#4ADE80" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "#030712" }}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
