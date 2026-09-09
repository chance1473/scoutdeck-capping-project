"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, Sparkles, Activity } from "lucide-react";
import { POSITIONS, RECRUIT_STATUSES, calculateHitterOFP, calculatePitcherOFP, getGradeLabel } from "@/lib/scouting";
import { createProspectAction } from "@/app/actions";

export default function NewProspectPage() {
  const [position, setPosition] = useState("SS");
  const isPitcher = ["RHP", "LHP"].includes(position);

  // Position Player Tool state
  const [hitFuture, setHitFuture] = useState(50);
  const [powerFuture, setPowerFuture] = useState(50);
  const [runFuture, setRunFuture] = useState(50);
  const [armFuture, setArmFuture] = useState(50);
  const [fieldFuture, setFieldFuture] = useState(55);

  // Pitcher Tool state
  const [fastballFuture, setFastballFuture] = useState(60);
  const [sliderFuture, setSliderFuture] = useState(55);
  const [changeupFuture, setChangeupFuture] = useState(50);
  const [commandFuture, setCommandFuture] = useState(55);

  // Live estimated OFP
  const estimatedOfp = isPitcher
    ? calculatePitcherOFP({
        fastball: fastballFuture,
        primaryBreaking: sliderFuture,
        secondaryOffspeed: changeupFuture,
        command: commandFuture,
      })
    : calculateHitterOFP({
        hit: hitFuture,
        power: powerFuture,
        run: runFuture,
        arm: armFuture,
        field: fieldFuture,
      });

  const gradeInfo = getGradeLabel(estimatedOfp);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Draft Board</span>
        </Link>
        <div className="text-xs text-slate-400">Scout Entry Portal</div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Add New Baseball Prospect</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Register a new amateur recruit into the draft database with 20–80 tool projections and verified combine numbers.
          </p>
        </div>

        <form action={createProspectAction} className="space-y-8">
          {/* Section 1: Identity & Background */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
              1. Prospect Identity &amp; Physicals
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Player Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Jaxson Miller"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Position <span className="text-rose-400">*</span>
                </label>
                <select
                  name="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Secondary Position</label>
                <input
                  type="text"
                  name="secondaryPosition"
                  placeholder="e.g. 2B or 3B"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bats / Throws <span className="text-rose-400">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="bats"
                    defaultValue="R"
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="R">Bats: R</option>
                    <option value="L">Bats: L</option>
                    <option value="S">Bats: Switch (S)</option>
                  </select>
                  <select
                    name="throws"
                    defaultValue="R"
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="R">Throws: R</option>
                    <option value="L">Throws: L</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Height &amp; Weight <span className="text-rose-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="height"
                    required
                    placeholder="6'2&quot;"
                    defaultValue="6'2&quot;"
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    name="weight"
                    required
                    placeholder="200"
                    defaultValue="200"
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* School & Academics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  School / Team <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="school"
                  required
                  placeholder="e.g. Corona HS (CA)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Level <span className="text-rose-400">*</span>
                </label>
                <select
                  name="schoolType"
                  defaultValue="HIGH_SCHOOL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="HIGH_SCHOOL">High School (Prep)</option>
                  <option value="COLLEGE">College (NCAA / JUCO)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Graduation / Draft Class <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  name="gradYear"
                  required
                  defaultValue={2025}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Status & Commitment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Recruitment Status</label>
                <select
                  name="status"
                  defaultValue="WATCHLIST"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {RECRUIT_STATUSES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">College Commitment</label>
                <input
                  type="text"
                  name="commitment"
                  placeholder="e.g. LSU, Texas, Uncommitted"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Draft Projection</label>
                <input
                  type="text"
                  name="draftProjection"
                  placeholder="e.g. 1st Round / Top 20"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pro Player Comp</label>
                <input
                  type="text"
                  name="proComp"
                  placeholder="e.g. Gunnar Henderson / Corey Seager"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Scout Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="5-Tool Potential, Plus Power, High IQ"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Executive Scouting Summary</label>
              <textarea
                name="summary"
                rows={3}
                placeholder="High-level evaluation of player frame, swing mechanics, athleticism, and mental makeup..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 2: 20-80 Tool Grades with Live OFP Calculator */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                2. 20–80 Tool Grades &amp; Future Projections
              </h2>
              {/* Live OFP badge */}
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold">Calculated OFP:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${gradeInfo.badgeBg}`}>
                  {estimatedOfp} &bull; {gradeInfo.label}
                </span>
              </div>
            </div>

            {isPitcher ? (
              /* Pitcher Tool Inputs */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Fastball Grade (Future)</label>
                  <input
                    type="range"
                    min="30"
                    max="80"
                    step="5"
                    name="fastballFuture"
                    value={fastballFuture}
                    onChange={(e) => setFastballFuture(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Grade: {fastballFuture}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Slider / Breaking (Future)</label>
                  <input
                    type="range"
                    min="30"
                    max="80"
                    step="5"
                    name="sliderFuture"
                    value={sliderFuture}
                    onChange={(e) => setSliderFuture(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Grade: {sliderFuture}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Changeup / Split (Future)</label>
                  <input
                    type="range"
                    min="30"
                    max="80"
                    step="5"
                    name="changeupFuture"
                    value={changeupFuture}
                    onChange={(e) => setChangeupFuture(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Grade: {changeupFuture}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Command / Control (Future)</label>
                  <input
                    type="range"
                    min="30"
                    max="80"
                    step="5"
                    name="commandFuture"
                    value={commandFuture}
                    onChange={(e) => setCommandFuture(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Grade: {commandFuture}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Position Player 5-Tools */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Hit Tool (Future)</label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    name="hitFuture"
                    value={hitFuture}
                    onChange={(e) => setHitFuture(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Grade: {hitFuture}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Power Tool (Future)</label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    name="powerFuture"
                    value={powerFuture}
                    onChange={(e) => setPowerFuture(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Grade: {powerFuture}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Run Tool (Future)</label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    name="runFuture"
                    value={runFuture}
                    onChange={(e) => setRunFuture(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Grade: {runFuture}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Arm Tool (Future)</label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    name="armFuture"
                    value={armFuture}
                    onChange={(e) => setArmFuture(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Grade: {armFuture}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Field Tool (Future)</label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    name="fieldFuture"
                    value={fieldFuture}
                    onChange={(e) => setFieldFuture(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Grade: {fieldFuture}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Statcast / Showcase Metrics */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>3. Statcast &amp; Showcase Combine Data</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {isPitcher ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Fastball Peak (mph)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="fastballVeloPeak"
                      placeholder="e.g. 98.5"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Fastball Sitting (mph)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="fastballVeloSit"
                      placeholder="e.g. 94.0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Trackman Spin (RPM)</label>
                    <input
                      type="number"
                      name="spinRate"
                      placeholder="e.g. 2500"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Exit Velo Max (mph)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="exitVelocityMax"
                      placeholder="e.g. 106.5"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">60-Yard Dash (sec)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="sixtyTime"
                      placeholder="e.g. 6.55"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Catcher Pop Time (sec)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="popTime"
                      placeholder="e.g. 1.85"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-950/40"
            >
              Save Prospect to War Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
