import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import RadarChart, { RadarMetric } from "@/components/RadarChart";
import { getGradeLabel } from "@/lib/scouting";
import { 
  ArrowLeft, 
  Printer, 
  FileEdit, 
  Calendar, 
  MapPin, 
  Trophy, 
  Activity, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from "lucide-react";
import PrintButton from "@/components/PrintButton";

interface ProspectPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function ProspectDetailPage({ params }: ProspectPageProps) {
  const { id } = await params;

  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: {
      reports: {
        orderBy: { date: "desc" },
      },
      statLines: {
        orderBy: { season: "desc" },
      },
    },
  });

  if (!prospect) {
    notFound();
  }

  const isPitcher = ["P", "SP", "RP", "RHP", "LHP"].includes(prospect.position);
  const ofpInfo = getGradeLabel(prospect.ofpScore);
  const liveStats = prospect.statLines.map((line) => ({
    ...line,
    stats: JSON.parse(line.statsJson) as Record<string, string | number>,
  }));

  // Construct radar metrics
  let radarMetrics: RadarMetric[] = [];
  if (isPitcher) {
    radarMetrics = [
      { name: "Fastball", present: prospect.fastballPresent ?? 45, future: prospect.fastballFuture ?? 60 },
      { name: "Slider", present: prospect.sliderPresent ?? 45, future: prospect.sliderFuture ?? 55 },
      { name: "Curve", present: prospect.curveballPresent ?? 40, future: prospect.curveballFuture ?? 50 },
      { name: "Changeup", present: prospect.changeupPresent ?? 40, future: prospect.changeupFuture ?? 55 },
      { name: "Command", present: prospect.commandPresent ?? 45, future: prospect.commandFuture ?? 60 },
    ];
  } else {
    radarMetrics = [
      { name: "Hit", present: prospect.hitPresent, future: prospect.hitFuture },
      { name: "Power", present: prospect.powerPresent, future: prospect.powerFuture },
      { name: "Run", present: prospect.runPresent, future: prospect.runFuture },
      { name: "Arm", present: prospect.armPresent, future: prospect.armFuture },
      { name: "Field", present: prospect.fieldPresent, future: prospect.fieldFuture },
    ];
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scouting Board</span>
        </Link>

        <div className="flex items-center gap-3">
          <PrintButton />
          <Link
            href={`/reports/new?prospectId=${prospect.id}`}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Log Scouting Report</span>
          </Link>
        </div>
      </div>

      {/* Prospect Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden print-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-lg font-black text-sm bg-emerald-500 text-slate-950">
                {prospect.position}
                {prospect.secondaryPosition ? ` / ${prospect.secondaryPosition}` : ""}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                {prospect.schoolType === "PROFESSIONAL"
                  ? `${prospect.currentTeamName || prospect.school} · ${prospect.rosterStatus || "MLB roster"}`
                  : `${prospect.schoolType === "HIGH_SCHOOL" ? "High School" : "College"} · Class of '${prospect.gradYear.toString().slice(2)}`}
              </span>
              {prospect.status && (
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 text-xs font-bold border border-slate-700">
                  {prospect.status.replace("_", " ")}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{prospect.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {prospect.currentTeamName || prospect.school}
              </span>
              <span>&bull;</span>
              <span>B/T: <strong className="text-slate-200 font-mono">{prospect.bats}/{prospect.throws}</strong></span>
              <span>&bull;</span>
              <span>Measurements: <strong className="text-slate-200 font-mono">{prospect.height}, {prospect.weight} lbs</strong></span>
              {prospect.commitment && (
                <>
                  <span>&bull;</span>
                  <span>Commit: <strong className="text-emerald-400">{prospect.commitment}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Overall Future Potential (OFP) Card */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 md:px-6 md:py-4 shadow-inner">
            <div className="text-right">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Performance Grade</div>
              <div className="text-xs font-semibold text-emerald-400">{ofpInfo.label}</div>
              <div className="text-[10px] text-slate-500">Derived from current MLB season stats</div>
            </div>
            <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl font-black ${ofpInfo.badgeBg}`}>
              {prospect.ofpScore}
            </div>
          </div>
        </div>

        {/* Pro Comp Banner */}
        {prospect.proComp && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Pro Archetype & Comp:</span>
            <span className="px-3 py-1 rounded-lg bg-emerald-950/40 text-emerald-300 font-bold border border-emerald-800/60">
              {prospect.proComp}
            </span>
            {prospect.draftProjection && (
              <span className="px-3 py-1 rounded-lg bg-slate-800/60 text-slate-300 font-semibold border border-slate-700/60 ml-auto">
                Projection: {prospect.draftProjection}
              </span>
            )}
          </div>
        )}

        {/* Executive Summary */}
        {prospect.summary && (
          <p className="mt-4 text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
            {prospect.summary}
          </p>
        )}
      </div>

      {liveStats.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live MLB Season Statistics</h2>
            </div>
            <span className="text-xs text-slate-500">Last synced {prospect.mlbSyncedAt?.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveStats.map((line) => {
              const preferred = line.group.toLowerCase() === "pitching"
                ? ["wins", "losses", "era", "gamesPlayed", "gamesStarted", "inningsPitched", "strikeOuts", "whip"]
                : ["gamesPlayed", "atBats", "runs", "hits", "homeRuns", "rbi", "avg", "ops"];
              return (
                <div key={line.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <h3 className="font-bold capitalize text-emerald-400">{line.season} {line.group}</h3>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {preferred.filter((key) => line.stats[key] !== undefined).map((key) => (
                      <div key={key}>
                        <div className="text-[9px] text-slate-500 uppercase truncate">{key.replace(/([A-Z])/g, " $1")}</div>
                        <div className="text-lg font-black text-white">{String(line.stats[key])}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid: 20-80 Tool Radar Chart + Tool Grades Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Radar Chart */}
        <div className="lg:col-span-5 flex flex-col">
          <RadarChart
            metrics={radarMetrics}
            title={isPitcher ? "Pitch Arsenal & Command" : "5-Tool Scouting Radar"}
            size={320}
          />
        </div>

        {/* Right Column: Detailed Tool Cards Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-wide uppercase text-xs flex items-center gap-2">
              <span>{isPitcher ? "Pitch Arsenal Evaluation" : "20-80 Position Tool Grades"}</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">Present / Future</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {radarMetrics.map((tool) => {
              const futureInfo = getGradeLabel(tool.future);
              const presentInfo = tool.present ? getGradeLabel(tool.present) : null;

              return (
                <div
                  key={tool.name}
                  className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">{tool.name}</span>
                    <div className="flex items-center gap-2 font-mono">
                      {tool.present && (
                        <span className="text-xs text-slate-400" title="Present Grade">
                          P: {tool.present}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${futureInfo.badgeBg}`} title="Future Grade">
                        F: {tool.future}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar visualizer */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 relative">
                    {/* MLB 50 marker */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-sky-500/50 z-10" title="50 = MLB Avg" />
                    {/* Bar */}
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full"
                      style={{ width: `${((tool.future - 20) / 60) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>{futureInfo.label}</span>
                    <span>Max: 80</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Private professional evaluation metrics */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Professional Evaluation Metrics</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Scout-entered measurements</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {isPitcher ? (
            <>
              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-400">FB Peak Velocity</div>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {prospect.fastballVeloPeak ? `${prospect.fastballVeloPeak} mph` : "N/A"}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Top recorded laser velo</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-400">FB Sitting Velocity</div>
                <div className="text-2xl font-black text-slate-200 mt-1">
                  {prospect.fastballVeloSit ? `${prospect.fastballVeloSit} mph` : "N/A"}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Average game operating range</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-400">Spin Rate (RPM)</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {prospect.spinRate ? `${prospect.spinRate} rpm` : "N/A"}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Peak Trackman spin</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-400">Pitch Delivery</div>
                <div className="text-xl font-bold text-slate-300 mt-1">Repeatable 3/4</div>
                <div className="text-[10px] text-slate-500 mt-0.5">High extension &amp; deception</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-400">Exit Velocity (Max)</div>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {prospect.exitVelocityMax ? `${prospect.exitVelocityMax} mph` : "N/A"}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Trackman BP / In-game max</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-400">60-Yard Dash</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {prospect.sixtyTime ? `${prospect.sixtyTime}s` : "N/A"}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Laser-timed sprint</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-400">Catcher Pop Time</div>
                <div className="text-2xl font-black text-sky-400 mt-1">
                  {prospect.popTime ? `${prospect.popTime}s` : "N/A"}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Release-to-glove at 2B</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-400">Physical Projection</div>
                <div className="text-xl font-bold text-slate-200 mt-1">High Floor</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Room to add strength</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Field Scouting Reports Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileEdit className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Scouting Reports on File ({prospect.reports.length})
            </h2>
          </div>
          <Link
            href={`/reports/new?prospectId=${prospect.id}`}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 no-print"
          >
            + File New Evaluation
          </Link>
        </div>

        {prospect.reports.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
            No field reports filed yet for this prospect. Be the first to log an evaluation!
          </div>
        ) : (
          <div className="space-y-4">
            {prospect.reports.map((report) => (
              <div
                key={report.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4 print-card"
              >
                {/* Report Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div>
                    <div className="font-bold text-white text-base">{report.eventName}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Filed by <strong>{report.scoutName}</strong></span>
                      <span>&bull;</span>
                      <span>{new Date(report.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                  {report.grade && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 font-bold text-xs">
                      Report Grade: {report.grade} OFP
                    </span>
                  )}
                </div>

                {/* Summary */}
                <p className="text-sm text-slate-200 leading-relaxed">{report.summary}</p>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Key Strengths</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-normal">{report.strengths}</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Areas for Development</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-normal">{report.weaknesses}</p>
                  </div>
                </div>

                {/* Video Link */}
                {report.videoUrl && (
                  <div className="pt-2 text-xs no-print">
                    <a
                      href={report.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Film / Video Breakdown</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
