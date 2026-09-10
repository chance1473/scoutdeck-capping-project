import Link from "next/link";
import { Database, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";
import { importMlbPlayerAction, syncMlbTeamRosterAction } from "@/app/actions";
import { getMlbRoster, getMlbTeams, searchMlbPlayers } from "@/lib/mlb";
import { prisma } from "@/lib/prisma";
import ClearImportedPlayersButton from "@/components/ClearImportedPlayersButton";

export const dynamic = "force-dynamic";

export default async function MlbPlayersPage({ searchParams }: { searchParams: Promise<{ team?: string; player?: string; cleared?: string }> }) {
  const { team, player, cleared } = await searchParams;
  const teams = await getMlbTeams();
  const requestedId = Number(team);
  const selectedTeam = teams.find((item) => item.id === requestedId) || teams[0];
  const roster = selectedTeam ? await getMlbRoster(selectedTeam.id) : [];
  const playerQuery = player?.trim() || "";
  const searchResults = playerQuery.length >= 2 ? await searchMlbPlayers(playerQuery) : [];
  const visibleMlbIds = Array.from(new Set([
    ...roster.map((entry) => entry.person.id),
    ...searchResults.map((result) => result.id),
  ]));
  const imported = await prisma.prospect.findMany({
    where: { mlbId: { in: visibleMlbIds } },
    select: { id: true, mlbId: true },
  });
  const importedByMlbId = new Map(imported.map((player) => [player.mlbId, player.id]));
  const importedPlayerCount = await prisma.prospect.count({ where: { mlbId: { not: null } } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Database className="w-4 h-4" /> MLB Stats API
          </div>
          <h1 className="text-3xl font-black text-white mt-2">Live MLB Player Directory</h1>
          <p className="text-sm text-slate-400 mt-1">Browse a current 40-man roster and bring players into ScoutDeck for private evaluation.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> External data is validated server-side
          </div>
          <ClearImportedPlayersButton count={importedPlayerCount} />
        </div>
      </div>

      {cleared === "true" && (
        <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 px-4 py-3 text-sm font-semibold text-emerald-300">
          Imported MLB players, synchronized statistics, and attached reports were cleared.
        </div>
      )}

      <form className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-900/60 rounded-2xl p-5">
        {selectedTeam && <input type="hidden" name="team" value={selectedTeam.id} />}
        <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Find a specific MLB player</label>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input name="player" defaultValue={playerQuery} minLength={2} placeholder="Enter a player name, e.g. Shohei Ohtani" className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white" />
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl px-5 py-2.5 text-sm">Search MLB</button>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">Searches active Major League players across all organizations.</p>
      </form>

      {playerQuery.length >= 2 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="font-bold text-white">Player search results</h2>
            <p className="text-xs text-slate-500">{searchResults.length} {searchResults.length === 1 ? "match" : "matches"} for “{playerQuery}”</p>
          </div>
          {searchResults.length === 0 ? <div className="p-8 text-center text-sm text-slate-400">No active MLB players matched that name.</div> : (
            <div className="divide-y divide-slate-800/80">{searchResults.map((result) => {
              const scoutDeckId = importedByMlbId.get(result.id);
              return <div key={result.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-white">{result.fullName}</div>
                  <div className="text-xs font-semibold text-emerald-400 mt-0.5">{result.currentTeam?.name || "Team unavailable"}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{result.primaryPosition?.name || result.primaryPosition?.abbreviation || "Player"} · Age {result.currentAge || "—"} · {result.batSide?.code || "—"}/{result.pitchHand?.code || "—"} · MLB ID {result.id}</div>
                </div>
                {scoutDeckId ? <div className="flex items-center gap-2">
                  <Link href={`/prospects/${scoutDeckId}`} className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold text-slate-200">View dossier</Link>
                  <form action={importMlbPlayerAction}><input type="hidden" name="mlbId" value={result.id} /><button className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 text-xs font-black">Refresh data</button></form>
                </div> : <form action={importMlbPlayerAction}><input type="hidden" name="mlbId" value={result.id} /><button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black">Import player</button></form>}
              </div>;
            })}</div>
          )}
        </div>
      )}

      <form className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
        <label className="flex-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Organization
          <select name="team" defaultValue={selectedTeam?.id} className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white">
            {teams.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl px-5 py-2.5 text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Load roster
        </button>
      </form>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div><h2 className="font-bold text-white">{selectedTeam?.name}</h2><p className="text-xs text-slate-500">40-man roster · {roster.length} players</p></div>
          {selectedTeam && <form action={syncMlbTeamRosterAction}>
            <input type="hidden" name="teamId" value={selectedTeam.id} /><input type="hidden" name="teamName" value={selectedTeam.name} />
            <button className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black flex items-center gap-2"><Users className="w-4 h-4" /> Sync entire roster</button>
          </form>}
        </div>
        <div className="divide-y divide-slate-800/80">
          {roster.map((entry) => {
            const scoutDeckId = importedByMlbId.get(entry.person.id);
            return <div key={entry.person.id} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-slate-800/30">
              <div className="min-w-0">
                <div className="flex items-center gap-2"><span className="font-bold text-white truncate">{entry.person.fullName}</span><span className="text-xs font-black text-emerald-400">{entry.position.abbreviation}</span></div>
                <p className="text-xs text-slate-500">#{entry.jerseyNumber || "—"} · {entry.status.description} · MLB ID {entry.person.id}</p>
              </div>
              {scoutDeckId ? (
                <Link href={`/prospects/${scoutDeckId}`} className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold text-slate-200 hover:border-emerald-500">View report</Link>
              ) : (
                <form action={importMlbPlayerAction}>
                  <input type="hidden" name="mlbId" value={entry.person.id} />
                  <input type="hidden" name="rosterStatus" value={entry.status.description} />
                  <button className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black hover:bg-emerald-400">Import player</button>
                </form>
              )}
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
