"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import RadarChart, { RadarMetric } from "@/components/RadarChart";
import { getGradeLabel } from "@/lib/scouting";
import { ArrowLeft, GitCompare, Trophy, Zap, ArrowUpRight, Award } from "lucide-react";

interface ProspectDetail {
  id: string;
  name: string;
  position: string;
  secondaryPosition: string | null;
  bats: string;
  throws: string;
  height: string;
  weight: number;
  school: string;
  schoolType: string;
  gradYear: number;
  status: string;
  commitment: string | null;
  draftProjection: string | null;
  proComp: string | null;
  summary: string | null;
  tags: string | null;
  exitVelocityMax: number | null;
  sixtyTime: number | null;
  popTime: number | null;
  fastballVeloPeak: number | null;
  fastballVeloSit: number | null;
  spinRate: number | null;
  hitPresent: number;
  hitFuture: number;
  powerPresent: number;
  powerFuture: number;
  runPresent: number;
  runFuture: number;
  armPresent: number;
  armFuture: number;
  fieldPresent: number;
  fieldFuture: number;
  fastballPresent: number | null;
  fastballFuture: number | null;
  sliderPresent: number | null;
  sliderFuture: number | null;
  curveballPresent: number | null;
  curveballFuture: number | null;
  changeupPresent: number | null;
  changeupFuture: number | null;
  commandPresent: number | null;
  commandFuture: number | null;
  ofpScore: number;
}

interface CompareClientProps {
  prospects: ProspectDetail[];
  initialPlayerAId?: string;
  initialPlayerBId?: string;
}

export default function CompareClient({
  prospects,
  initialPlayerAId,
  initialPlayerBId,
}: CompareClientProps) {
  const [playerAId, setPlayerAId] = useState<string>(
    initialPlayerAId || (prospects[0]?.id ?? "")
  );
  const [playerBId, setPlayerBId] = useState<string>(
    initialPlayerBId || (prospects[1]?.id ?? "")
  );

  const playerA = useMemo(() => prospects.find((p) => p.id === playerAId), [prospects, playerAId]);
  const playerB = useMemo(() => prospects.find((p) => p.id === playerBId), [prospects, playerBId]);

  if (!playerA || !playerB) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please select at least two prospects to begin head-to-head comparison.
      </div>
    );
  }

  const isPitcherA = ["RHP", "LHP"].includes(playerA.position);
  const isPitcherB = ["RHP", "LHP"].includes(playerB.position);
  const bothPitchers = isPitcherA && isPitcherB;
  const bothHitters = !isPitcherA && !isPitcherB;

  // Radar metrics for Player A
  const metricsA: RadarMetric[] = bothPitchers
    ? [
        { name: "Fastball", future: playerA.fastballFuture ?? 50 },
        { name: "Slider", future: playerA.sliderFuture ?? 50 },
        { name: "Curve", future: playerA.curveballFuture ?? 50 },
        { name: "Changeup", future: playerA.changeupFuture ?? 50 },
        { name: "Command", future: playerA.commandFuture ?? 50 },
      ]
    : [
        { name: "Hit", future: playerA.hitFuture },
        { name: "Power", future: playerA.powerFuture },
        { name: "Run", future: playerA.runFuture },
        { name: "Arm", future: playerA.armFuture },
        { name: "Field", future: playerA.fieldFuture },
      ];

  // Radar metrics for Player B
  const metricsB: RadarMetric[] = bothPitchers
    ? [
        { name: "Fastball", future: playerB.fastballFuture ?? 50 },
        { name: "Slider", future: playerB.sliderFuture ?? 50 },
        { name: "Curve", future: playerB.curveballFuture ?? 50 },
        { name: "Changeup", future: playerB.changeupFuture ?? 50 },
        { name: "Command", future: playerB.commandFuture ?? 50 },
      ]
    : [
        { name: "Hit", future: playerB.hitFuture },
        { name: "Power", future: playerB.powerFuture },
        { name: "Run", future: playerB.runFuture },
        { name: "Arm", future: playerB.armFuture },
        { name: "Field", future: playerB.fieldFuture },
      ];

  // Table rows for attributes
  const comparisonRows = bothPitchers
    ? [
        { label: "Fastball Grade", valA: playerA.fastballFuture ?? 50, valB: playerB.fastballFuture ?? 50 },
        { label: "Slider Grade", valA: playerA.sliderFuture ?? 50, valB: playerB.sliderFuture ?? 50 },
        { label: "Curveball Grade", valA: playerA.curveballFuture ?? 50, valB: playerB.curveballFuture ?? 50 },
        { label: "Changeup Grade", valA: playerA.changeupFuture ?? 50, valB: playerB.changeupFuture ?? 50 },
        { label: "Command Grade", valA: playerA.commandFuture ?? 50, valB: playerB.commandFuture ?? 50 },
      ]
    : [
        { label: "Hit Tool", valA: playerA.hitFuture, valB: playerB.hitFuture },
        { label: "Power Tool", valA: playerA.powerFuture, valB: playerB.powerFuture },
        { label: "Run Tool", valA: playerA.runFuture, valB: playerB.runFuture },
        { label: "Arm Tool", valA: playerA.armFuture, valB: playerB.armFuture },
        { label: "Field Tool", valA: playerA.fieldFuture, valB: playerB.fieldFuture },
      ];

  const gradeA = getGradeLabel(playerA.ofpScore);
  const gradeB = getGradeLabel(playerB.ofpScore);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Draft Board</span>
        </Link>
        <div className="text-xs font-medium text-slate-400">Side-by-Side Scout Analysis</div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player A Selector */}
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 space-y-2 shadow-lg">
          <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Primary Target (Player A)
          </label>
          <select
            value={playerAId}
            onChange={(e) => setPlayerAId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {prospects.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === playerBId}>
                {p.name} ({p.position}) — OFP: {p.ofpScore} &bull; {p.school}
              </option>
            ))}
          </select>
        </div>

        {/* Player B Selector */}
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 space-y-2 shadow-lg">
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
            Comparison Target (Player B)
          </label>
          <select
            value={playerBId}
            onChange={(e) => setPlayerBId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-amber-500 transition-colors"
          >
            {prospects.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === playerAId}>
                {p.name} ({p.position}) — OFP: {p.ofpScore} &bull; {p.school}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tale of the Tape: Quick Comparison Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player A Bio Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500 text-slate-950">
              {playerA.position}
            </span>
            <div className={`px-2 py-0.5 rounded-full border text-xs font-bold ${gradeA.badgeBg}`}>
              OFP: {playerA.ofpScore}
            </div>
          </div>
          <h3 className="text-2xl font-black text-white">{playerA.name}</h3>
          <p className="text-xs text-slate-400">{playerA.school} &bull; Class of &apos;{playerA.gradYear.toString().slice(2)}</p>
          <div className="text-xs text-slate-300 font-mono">
            {playerA.bats}/{playerA.throws} &bull; {playerA.height}, {playerA.weight} lbs
          </div>
          {playerA.proComp && (
            <div className="text-xs text-emerald-300 pt-1">
              Comp: <strong>{playerA.proComp}</strong>
            </div>
          )}
          <div className="pt-2">
            <Link
              href={`/prospects/${playerA.id}`}
              className="text-xs text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>View Full Dossier</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Player B Bio Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500 text-slate-950">
              {playerB.position}
            </span>
            <div className={`px-2 py-0.5 rounded-full border text-xs font-bold ${gradeB.badgeBg}`}>
              OFP: {playerB.ofpScore}
            </div>
          </div>
          <h3 className="text-2xl font-black text-white">{playerB.name}</h3>
          <p className="text-xs text-slate-400">{playerB.school} &bull; Class of &apos;{playerB.gradYear.toString().slice(2)}</p>
          <div className="text-xs text-slate-300 font-mono">
            {playerB.bats}/{playerB.throws} &bull; {playerB.height}, {playerB.weight} lbs
          </div>
          {playerB.proComp && (
            <div className="text-xs text-amber-300 pt-1">
              Comp: <strong>{playerB.proComp}</strong>
            </div>
          )}
          <div className="pt-2">
            <Link
              href={`/prospects/${playerB.id}`}
              className="text-xs text-amber-400 hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>View Full Dossier</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Dual Radar Chart & Head-to-Head Delta Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Overlay */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          {(bothHitters || bothPitchers) ? (
            <RadarChart
              metrics={metricsA}
              compareMetrics={metricsB}
              primaryLabel={playerA.name}
              compareLabel={playerB.name}
              title="Tool Projection Overlay"
              size={320}
            />
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
              Radar overlay is optimized when comparing two position players or two pitchers.
            </div>
          )}
        </div>

        {/* Head-to-Head Metric Table with Deltas */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-emerald-400" />
              <span>Head-to-Head 20–80 Tool Comparison</span>
            </h3>
            <span className="text-[11px] text-slate-500">Projected Future Grades</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Metric / Tool</th>
                  <th className="py-2.5 px-3 text-emerald-400 font-bold">{playerA.name}</th>
                  <th className="py-2.5 px-3 text-amber-400 font-bold">{playerB.name}</th>
                  <th className="py-2.5 px-3 text-right">Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {/* OFP Row */}
                <tr className="bg-slate-950/40 font-bold">
                  <td className="py-3 px-3 text-slate-200">Overall Grade (OFP)</td>
                  <td className="py-3 px-3 text-emerald-400 text-sm">{playerA.ofpScore}</td>
                  <td className="py-3 px-3 text-amber-400 text-sm">{playerB.ofpScore}</td>
                  <td className="py-3 px-3 text-right">
                    {playerA.ofpScore > playerB.ofpScore ? (
                      <span className="text-emerald-400">+{playerA.ofpScore - playerB.ofpScore} (Player A)</span>
                    ) : playerA.ofpScore < playerB.ofpScore ? (
                      <span className="text-amber-400">+{playerB.ofpScore - playerA.ofpScore} (Player B)</span>
                    ) : (
                      <span className="text-slate-500">Even</span>
                    )}
                  </td>
                </tr>

                {/* Specific Tool Rows */}
                {comparisonRows.map((row) => {
                  const delta = row.valA - row.valB;
                  return (
                    <tr key={row.label} className="hover:bg-slate-800/20">
                      <td className="py-2.5 px-3 text-slate-300 font-medium">{row.label}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-200">{row.valA}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-200">{row.valB}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        {delta > 0 ? (
                          <span className="text-emerald-400">+{delta} ({playerA.position})</span>
                        ) : delta < 0 ? (
                          <span className="text-amber-400">+{Math.abs(delta)} ({playerB.position})</span>
                        ) : (
                          <span className="text-slate-500">Even</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* Showcase Metrics Comparison */}
                {playerA.exitVelocityMax && playerB.exitVelocityMax && (
                  <tr className="bg-slate-950/20">
                    <td className="py-2.5 px-3 text-slate-300">Exit Velo (Max)</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">{playerA.exitVelocityMax} mph</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">{playerB.exitVelocityMax} mph</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {playerA.exitVelocityMax > playerB.exitVelocityMax ? (
                        <span className="text-emerald-400">+{(playerA.exitVelocityMax - playerB.exitVelocityMax).toFixed(1)} mph</span>
                      ) : (
                        <span className="text-amber-400">+{(playerB.exitVelocityMax - playerA.exitVelocityMax).toFixed(1)} mph</span>
                      )}
                    </td>
                  </tr>
                )}

                {playerA.sixtyTime && playerB.sixtyTime && (
                  <tr className="bg-slate-950/20">
                    <td className="py-2.5 px-3 text-slate-300">60-Yard Dash (Faster is better)</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">{playerA.sixtyTime}s</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">{playerB.sixtyTime}s</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {playerA.sixtyTime < playerB.sixtyTime ? (
                        <span className="text-emerald-400">-{(playerB.sixtyTime - playerA.sixtyTime).toFixed(2)}s faster</span>
                      ) : (
                        <span className="text-amber-400">-{(playerA.sixtyTime - playerB.sixtyTime).toFixed(2)}s faster</span>
                      )}
                    </td>
                  </tr>
                )}

                {playerA.fastballVeloPeak && playerB.fastballVeloPeak && (
                  <tr className="bg-slate-950/20">
                    <td className="py-2.5 px-3 text-slate-300">Fastball Peak Velocity</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">{playerA.fastballVeloPeak} mph</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">{playerB.fastballVeloPeak} mph</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {playerA.fastballVeloPeak > playerB.fastballVeloPeak ? (
                        <span className="text-emerald-400">+{(playerA.fastballVeloPeak - playerB.fastballVeloPeak).toFixed(1)} mph</span>
                      ) : (
                        <span className="text-amber-400">+{(playerB.fastballVeloPeak - playerA.fastballVeloPeak).toFixed(1)} mph</span>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
