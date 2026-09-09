"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Layers, 
  LayoutGrid, 
  List, 
  ArrowUpRight, 
  Gauge, 
  Sparkles, 
  Trophy, 
  Zap, 
  MapPin, 
  GraduationCap,
  Calendar
} from "lucide-react";
import { getGradeLabel } from "@/lib/scouting";

interface ProspectSummary {
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
  ofpScore: number;
  _count: {
    reports: number;
  };
}

interface DraftBoardClientProps {
  initialProspects: ProspectSummary[];
}

export default function DraftBoardClient({ initialProspects }: DraftBoardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const filteredProspects = useMemo(() => {
    return initialProspects.filter((p) => {
      // Search filter
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.proComp && p.proComp.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.position.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Position filter
      if (positionFilter !== "ALL") {
        if (positionFilter === "PITCHERS" && !["RHP", "LHP"].includes(p.position)) return false;
        if (positionFilter === "INFIELD" && !["1B", "2B", "3B", "SS"].includes(p.position)) return false;
        if (positionFilter === "OUTFIELD" && !["LF", "CF", "RF", "OF"].includes(p.position)) return false;
        if (positionFilter === "CATCHERS" && p.position !== "C") return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;

      // Class year filter
      if (classFilter !== "ALL" && p.gradYear.toString() !== classFilter) return false;

      return true;
    });
  }, [initialProspects, searchQuery, positionFilter, statusFilter, classFilter]);

  // High-level analytics
  const totalCount = initialProspects.length;
  const eliteCount = initialProspects.filter((p) => p.ofpScore >= 60).length;
  const highSchoolCount = initialProspects.filter((p) => p.schoolType === "HIGH_SCHOOL").length;
  const collegeCount = initialProspects.filter((p) => p.schoolType === "COLLEGE").length;

  return (
    <div className="space-y-8">
      {/* Analytics KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Board Total</div>
          <div className="text-3xl font-black text-white mt-1">{totalCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Active prospects under evaluation</p>
          <div className="absolute top-3 right-3 text-slate-800">
            <Trophy className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Plus Grades (60+ OFP)</div>
          <div className="text-3xl font-black text-emerald-400 mt-1">{eliteCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Projected MLB everyday regulars / aces</p>
          <div className="absolute top-3 right-3 text-emerald-950/60">
            <Zap className="w-8 h-8 text-emerald-500/20" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Prep (High School)</div>
          <div className="text-3xl font-black text-sky-400 mt-1">{highSchoolCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Class of &apos;25 & &apos;26 high school talent</p>
          <div className="absolute top-3 right-3 text-sky-950/60">
            <GraduationCap className="w-8 h-8 text-sky-500/20" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">College Draft-Eligible</div>
          <div className="text-3xl font-black text-purple-400 mt-1">{collegeCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">NCAA performers &amp; fast-track arms</p>
          <div className="absolute top-3 right-3 text-purple-950/60">
            <Layers className="w-8 h-8 text-purple-500/20" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by prospect name, school, position, or comp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* View mode toggle and quick link */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === "cards" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === "table" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Draft Board Table View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Board</span>
              </button>
            </div>

            <Link
              href="/compare"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Compare Prospects</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Position:</span>
          </div>
          {[
            { id: "ALL", label: "All Positions" },
            { id: "PITCHERS", label: "Pitchers (RHP/LHP)" },
            { id: "INFIELD", label: "Infielders" },
            { id: "OUTFIELD", label: "Outfielders" },
            { id: "CATCHERS", label: "Catchers" },
          ].map((pos) => (
            <button
              key={pos.id}
              onClick={() => setPositionFilter(pos.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                positionFilter === pos.id
                  ? "bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-950"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80"
              }`}
            >
              {pos.label}
            </button>
          ))}

          <div className="hidden lg:block w-px h-4 bg-slate-800 mx-2" />

          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mr-1">
            <span>Class:</span>
          </div>
          {["ALL", "2025", "2026"].map((yr) => (
            <button
              key={yr}
              onClick={() => setClassFilter(yr)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                classFilter === yr
                  ? "bg-slate-700 text-white font-semibold"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80"
              }`}
            >
              {yr === "ALL" ? "All Years" : `'${yr.slice(2)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Prospects Display */}
      {filteredProspects.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center space-y-3">
          <p className="text-slate-400 text-sm">No prospects match your active filters or search query.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setPositionFilter("ALL");
              setStatusFilter("ALL");
              setClassFilter("ALL");
            }}
            className="text-xs text-emerald-400 hover:underline font-medium"
          >
            Reset all filters
          </button>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProspects.map((prospect) => {
            const gradeInfo = getGradeLabel(prospect.ofpScore);
            const isPitcher = ["RHP", "LHP"].includes(prospect.position);

            return (
              <div
                key={prospect.id}
                className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-emerald-950/10 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Position & OFP Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg font-black text-xs bg-slate-800 text-slate-200 border border-slate-700">
                        {prospect.position}
                        {prospect.secondaryPosition ? ` / ${prospect.secondaryPosition}` : ""}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {prospect.bats}/{prospect.throws} &bull; {prospect.height}, {prospect.weight} lbs
                      </span>
                    </div>

                    {/* 20-80 OFP Pill */}
                    <div className={`px-2 py-0.5 rounded-full border text-xs font-bold ${gradeInfo.badgeBg} flex items-center gap-1`}>
                      <span className="text-[10px] text-slate-400">OFP</span>
                      <span>{prospect.ofpScore}</span>
                    </div>
                  </div>

                  {/* Player Name & School */}
                  <Link href={`/prospects/${prospect.id}`} className="block group-hover:text-emerald-400 transition-colors">
                    <h3 className="text-lg font-bold text-white tracking-tight">{prospect.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{prospect.school}</span>
                    <span>&bull;</span>
                    <span className="text-slate-300 font-medium">&apos;{prospect.gradYear.toString().slice(2)}</span>
                  </div>

                  {/* Pro Comp & Draft Projection */}
                  <div className="mt-3 space-y-1 text-xs">
                    {prospect.proComp && (
                      <div className="text-slate-300 flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Pro Comp:</span>
                        <span className="text-emerald-300 font-semibold">{prospect.proComp}</span>
                      </div>
                    )}
                    {prospect.draftProjection && (
                      <div className="text-slate-400 flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Projection:</span>
                        <span className="text-slate-300">{prospect.draftProjection}</span>
                      </div>
                    )}
                  </div>

                  {/* Statcast / Showcase Highlights */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    {isPitcher ? (
                      <>
                        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                          <div className="text-[10px] text-slate-500 uppercase font-medium">FB Peak</div>
                          <div className="text-sm font-black text-amber-400">
                            {prospect.fastballVeloPeak ? `${prospect.fastballVeloPeak} mph` : "—"}
                          </div>
                        </div>
                        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                          <div className="text-[10px] text-slate-500 uppercase font-medium">Arsenal</div>
                          <div className="text-sm font-semibold text-slate-300">4-Pitch Mix</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                          <div className="text-[10px] text-slate-500 uppercase font-medium">Exit Velo (Max)</div>
                          <div className="text-sm font-black text-amber-400">
                            {prospect.exitVelocityMax ? `${prospect.exitVelocityMax} mph` : "—"}
                          </div>
                        </div>
                        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                          <div className="text-[10px] text-slate-500 uppercase font-medium">
                            {prospect.position === "C" ? "Pop Time" : "60-Yard Dash"}
                          </div>
                          <div className="text-sm font-black text-emerald-400">
                            {prospect.position === "C"
                              ? prospect.popTime ? `${prospect.popTime}s` : "—"
                              : prospect.sixtyTime ? `${prospect.sixtyTime}s` : "—"}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tags */}
                  {prospect.tags && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {prospect.tags.split(",").map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-300 border border-slate-700/60"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {prospect._count.reports} {prospect._count.reports === 1 ? "report" : "reports"} on file
                  </span>
                  <Link
                    href={`/prospects/${prospect.id}`}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Full Scouting Dossier</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-3.5">Prospect</th>
                  <th className="px-4 py-3.5">Pos</th>
                  <th className="px-4 py-3.5">B/T</th>
                  <th className="px-4 py-3.5">School / Team</th>
                  <th className="px-4 py-3.5">Class</th>
                  <th className="px-4 py-3.5">OFP Grade</th>
                  <th className="px-4 py-3.5">Showcase Metric</th>
                  <th className="px-4 py-3.5">Pro Comp</th>
                  <th className="px-4 py-3.5 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProspects.map((p) => {
                  const grade = getGradeLabel(p.ofpScore);
                  const isPitcher = ["RHP", "LHP"].includes(p.position);
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">
                        <Link href={`/prospects/${p.id}`} className="hover:text-emerald-400">
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono font-bold">
                          {p.position}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        {p.bats}/{p.throws}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">{p.school}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-300">&apos;{p.gradYear.toString().slice(2)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${grade.badgeBg}`}>
                          {p.ofpScore} &bull; {grade.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        {isPitcher
                          ? p.fastballVeloPeak ? <span className="text-amber-400">{p.fastballVeloPeak} mph FB</span> : "—"
                          : p.exitVelocityMax ? <span className="text-amber-400">{p.exitVelocityMax} mph EV</span> : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-emerald-400 font-medium">{p.proComp ?? "—"}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/prospects/${p.id}`}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <span>View</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
