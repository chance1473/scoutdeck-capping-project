"use client";

import React from "react";

export interface RadarMetric {
  name: string;
  present?: number; // 20-80
  future: number;   // 20-80
}

interface RadarChartProps {
  metrics: RadarMetric[];
  title?: string;
  size?: number;
  compareMetrics?: RadarMetric[];
  compareLabel?: string;
  primaryLabel?: string;
  showLegend?: boolean;
}

export default function RadarChart({
  metrics,
  title,
  size = 320,
  compareMetrics,
  compareLabel = "Player B",
  primaryLabel = "Player A",
  showLegend = true,
}: RadarChartProps) {
  const center = size / 2;
  const radius = (size - 70) / 2;
  const minVal = 20;
  const maxVal = 80;
  const valRange = maxVal - minVal;

  const count = metrics.length;
  const angleStep = (Math.PI * 2) / count;

  // Function to calculate (x, y) coordinates for a given metric index and value
  const getCoordinates = (index: number, value: number) => {
    // clamp value between 20 and 80
    const clamped = Math.max(minVal, Math.min(maxVal, value));
    const normalized = (clamped - minVal) / valRange; // 0 to 1
    const r = normalized * radius;
    // Start at top (rotate -90 deg / -PI/2)
    const angle = index * angleStep - Math.PI / 2;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate background rings (20, 30, 40, 50, 60, 70, 80)
  const rings = [30, 40, 50, 60, 70, 80];

  // Helper to construct polygon path string
  const makePolygon = (values: (number | undefined)[]) => {
    return values
      .map((val, idx) => {
        const { x, y } = getCoordinates(idx, val ?? 20);
        return `${x},${y}`;
      })
      .join(" ");
  };

  const presentValues = metrics.map((m) => m.present);
  const futureValues = metrics.map((m) => m.future);
  const hasPresent = metrics.some((m) => m.present !== undefined && m.present > 0);

  const compareFutureValues = compareMetrics?.map((m) => m.future);

  return (
    <div className="flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-inner">
      {title && (
        <div className="text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase flex items-center gap-2">
          <span>{title}</span>
          <span className="text-[10px] text-slate-400 font-normal lowercase">(20-80 pro scale)</span>
        </div>
      )}

      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Radar concentric rings */}
        {rings.map((ringVal) => {
          const r = ((ringVal - minVal) / valRange) * radius;
          const is50 = ringVal === 50; // MLB average
          return (
            <g key={ringVal}>
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={is50 ? "#38bdf8" : "#334155"}
                strokeWidth={is50 ? "1.5" : "0.75"}
                strokeDasharray={is50 ? "3,3" : undefined}
                opacity={is50 ? 0.7 : 0.4}
              />
              {/* Ring scale label along vertical axis */}
              <text
                x={center + 3}
                y={center - r + 3}
                fill={is50 ? "#38bdf8" : "#64748b"}
                fontSize="9"
                fontWeight={is50 ? "bold" : "normal"}
              >
                {ringVal}
              </text>
            </g>
          );
        })}

        {/* Radial spoke lines and metric labels */}
        {metrics.map((m, idx) => {
          const angle = idx * angleStep - Math.PI / 2;
          const lineX = center + radius * Math.cos(angle);
          const lineY = center + radius * Math.sin(angle);

          // Label placement offset
          const labelDist = radius + 22;
          const labelX = center + labelDist * Math.cos(angle);
          const labelY = center + labelDist * Math.sin(angle);

          return (
            <g key={m.name}>
              <line
                x1={center}
                y1={center}
                x2={lineX}
                y2={lineY}
                stroke="#334155"
                strokeWidth="1"
                opacity="0.6"
              />
              <text
                x={labelX}
                y={labelY + 4}
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="11"
                fontWeight="600"
                className="font-mono tracking-tight"
              >
                {m.name}
              </text>
            </g>
          );
        })}

        {/* If compare mode: render Compare Player polygon in Amber */}
        {compareFutureValues && (
          <>
            <polygon
              points={makePolygon(compareFutureValues)}
              fill="rgba(245, 158, 11, 0.25)"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            {compareFutureValues.map((val, idx) => {
              const { x, y } = getCoordinates(idx, val ?? 20);
              return <circle key={idx} cx={x} cy={y} r="4" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.5" />;
            })}
          </>
        )}

        {/* Present (Current) Tool polygon - Slate / Blue outline */}
        {hasPresent && !compareMetrics && (
          <>
            <polygon
              points={makePolygon(presentValues)}
              fill="rgba(59, 130, 246, 0.15)"
              stroke="#60a5fa"
              strokeWidth="2"
              strokeDasharray="4,3"
            />
            {presentValues.map((val, idx) => {
              if (!val) return null;
              const { x, y } = getCoordinates(idx, val);
              return <circle key={idx} cx={x} cy={y} r="3.5" fill="#60a5fa" stroke="#0f172a" strokeWidth="1" />;
            })}
          </>
        )}

        {/* Future (Projected) Tool polygon - Emerald green */}
        <polygon
          points={makePolygon(futureValues)}
          fill={compareMetrics ? "rgba(16, 185, 129, 0.25)" : "rgba(16, 185, 129, 0.3)"}
          stroke="#10b981"
          strokeWidth="2.5"
        />
        {futureValues.map((val, idx) => {
          const { x, y } = getCoordinates(idx, val);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="4.5"
              fill="#10b981"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>

      {/* Chart Legend */}
      {showLegend && (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs font-medium text-slate-300">
          {compareMetrics ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>{primaryLabel} (Future)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>{compareLabel} (Future)</span>
              </div>
            </>
          ) : (
            <>
              {hasPresent && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 border-t-2 border-dashed border-blue-400"></span>
                  <span className="text-blue-300">Present Grade</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                <span className="text-emerald-300">Future (Projected) Grade</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-sky-400"></span>
                <span className="text-sky-400">50 = MLB Avg</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
