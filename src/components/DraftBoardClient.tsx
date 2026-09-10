"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Filter, LayoutGrid, List, Search, ShieldCheck, Users } from "lucide-react";
import { getGradeLabel } from "@/lib/scouting";

interface PlayerSummary {
  id: string; mlbId: number | null; name: string; position: string; bats: string; throws: string;
  height: string; weight: number; currentTeamName: string | null; rosterStatus: string | null;
  age: number | null; active: boolean; ofpScore: number; mlbSyncedAt: Date | null;
  _count: { reports: number }; statLines: { season: number; group: string; statsJson: string }[];
}

const pitcherPositions = ["P", "SP", "RP", "RHP", "LHP"];

function statSnapshot(player: PlayerSummary) {
  const preferredGroup = pitcherPositions.includes(player.position) ? "pitching" : "hitting";
  const line = player.statLines.find((item) => item.group.toLowerCase() === preferredGroup) || player.statLines[0];
  if (!line) return [];
  const stats = JSON.parse(line.statsJson) as Record<string, string | number>;
  const keys = line.group.toLowerCase() === "pitching"
    ? [["era", "ERA"], ["strikeOuts", "SO"], ["whip", "WHIP"]]
    : [["avg", "AVG"], ["homeRuns", "HR"], ["ops", "OPS"]];
  return keys.filter(([key]) => stats[key] !== undefined).map(([key, label]) => ({ label, value: stats[key] }));
}

export default function DraftBoardClient({ initialProspects }: { initialProspects: PlayerSummary[] }) {
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState("ALL");
  const [position, setPosition] = useState("ALL");
  const [view, setView] = useState<"cards" | "table">("cards");
  const teams = useMemo(() => Array.from(new Set(initialProspects.map((p) => p.currentTeamName).filter(Boolean) as string[])).sort(), [initialProspects]);
  const players = useMemo(() => initialProspects.filter((player) => {
    const query = search.toLowerCase();
    if (query && !`${player.name} ${player.currentTeamName} ${player.position}`.toLowerCase().includes(query)) return false;
    if (team !== "ALL" && player.currentTeamName !== team) return false;
    if (position === "PITCHERS" && !pitcherPositions.includes(player.position)) return false;
    if (position === "INFIELD" && !["1B", "2B", "3B", "SS"].includes(player.position)) return false;
    if (position === "OUTFIELD" && !["LF", "CF", "RF", "OF"].includes(player.position)) return false;
    if (position === "CATCHERS" && player.position !== "C") return false;
    return true;
  }), [initialProspects, position, search, team]);
  const reportCount = initialProspects.reduce((sum, player) => sum + player._count.reports, 0);
  const statsCount = initialProspects.filter((player) => player.statLines.length > 0).length;

  if (initialProspects.length === 0) return <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">
    <Users className="w-10 h-10 text-emerald-400 mx-auto" /><h2 className="text-xl font-black text-white mt-4">Your MLB scouting board is ready</h2>
    <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">Choose an organization, sync its live 40-man roster, and start adding private evaluations to current professional players.</p>
    <Link href="/mlb" className="inline-flex mt-6 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm">Browse MLB rosters</Link>
  </div>;

  return <div className="space-y-7">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[["MLB Players", initialProspects.length, "Synced to ScoutDeck"], ["Organizations", teams.length, "Represented on board"], ["Live Stat Lines", statsCount, "Players with season data"], ["Scout Reports", reportCount, "Private evaluations"]].map(([label, value, note]) => <div key={String(label)} className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">{label}</div><div className="text-3xl font-black text-white mt-1">{value}</div><div className="text-[11px] text-slate-500">{note}</div></div>)}</div>
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
      <div className="flex flex-col lg:flex-row gap-3"><div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search player, team, or position" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm" /></div><select value={team} onChange={(e) => setTeam(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm"><option value="ALL">All organizations</option>{teams.map((name) => <option key={name}>{name}</option>)}</select><div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1"><button onClick={() => setView("cards")} className={`p-2 rounded-lg ${view === "cards" ? "bg-slate-800 text-emerald-400" : "text-slate-500"}`}><LayoutGrid className="w-4 h-4" /></button><button onClick={() => setView("table")} className={`p-2 rounded-lg ${view === "table" ? "bg-slate-800 text-emerald-400" : "text-slate-500"}`}><List className="w-4 h-4" /></button></div></div>
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-800 pt-3"><Filter className="w-4 h-4 text-slate-500" />{[["ALL","All players"],["PITCHERS","Pitchers"],["INFIELD","Infield"],["OUTFIELD","Outfield"],["CATCHERS","Catchers"]].map(([id,label]) => <button key={id} onClick={() => setPosition(id)} className={`px-3 py-1 rounded-lg text-xs font-bold ${position === id ? "bg-emerald-500 text-slate-950" : "bg-slate-950 text-slate-400 border border-slate-800"}`}>{label}</button>)}</div>
    </div>
    {players.length === 0 ? <div className="text-center p-10 text-slate-400">No MLB players match those filters.</div> : view === "cards" ? <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{players.map((player) => { const grade = getGradeLabel(player.ofpScore); const stats = statSnapshot(player); return <div key={player.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5"><div className="flex justify-between"><span className="px-2 py-1 rounded-lg bg-slate-800 text-xs font-black">{player.position}</span><span className={`px-2 py-1 rounded-full border text-xs font-bold ${grade.badgeBg}`}>PERF {player.ofpScore}</span></div><Link href={`/prospects/${player.id}`}><h3 className="text-lg font-black text-white hover:text-emerald-400 mt-3">{player.name}</h3></Link><div className="text-xs text-slate-400 mt-1">{player.currentTeamName} · Age {player.age || "—"} · {player.bats}/{player.throws}</div><div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-2"><ShieldCheck className="w-3 h-3" /> MLB ID {player.mlbId} · {player.rosterStatus || "Active roster"}</div><div className="grid grid-cols-3 gap-2 mt-4">{stats.length ? stats.map((stat) => <div key={stat.label} className="bg-slate-950 rounded-lg p-2"><div className="text-[9px] text-slate-500">{stat.label}</div><div className="font-black text-white">{String(stat.value)}</div></div>) : <div className="col-span-3 text-xs text-slate-500 bg-slate-950 rounded-lg p-3">Season statistics will appear after refresh.</div>}</div><div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-500"><span>{player._count.reports} reports</span><Link href={`/prospects/${player.id}`} className="text-emerald-400 font-bold flex items-center gap-1">Player dossier <ArrowUpRight className="w-3 h-3" /></Link></div></div>; })}</div> : <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-950 text-xs uppercase text-slate-500"><tr>{["Player","Team","Pos","Age","B/T","Performance","Reports",""].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-800">{players.map((p) => <tr key={p.id}><td className="px-4 py-3 font-bold text-white">{p.name}</td><td className="px-4 py-3">{p.currentTeamName}</td><td className="px-4 py-3">{p.position}</td><td className="px-4 py-3">{p.age || "—"}</td><td className="px-4 py-3">{p.bats}/{p.throws}</td><td className="px-4 py-3 font-bold">{p.ofpScore}</td><td className="px-4 py-3">{p._count.reports}</td><td className="px-4 py-3"><Link href={`/prospects/${p.id}`} className="text-emerald-400">View</Link></td></tr>)}</tbody></table></div>}
  </div>;
}
