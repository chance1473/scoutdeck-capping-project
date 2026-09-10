import { prisma } from "@/lib/prisma";
import DraftBoardClient from "@/components/DraftBoardClient";
import Link from "next/link";
import { Database } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const prospects = await prisma.prospect.findMany({
    where: { mlbId: { not: null } },
    orderBy: [
      { ofpScore: "desc" },
      { gradYear: "asc" },
    ],
    include: {
      statLines: { orderBy: { season: "desc" }, take: 2 },
      _count: {
        select: { reports: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* War Room Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Professional Scouting Board
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Current MLB players, standardized 20–80 grading, performance data, and private evaluation reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mlb"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            <span>Sync MLB Rosters</span>
          </Link>
        </div>
      </div>

      {/* Main Draft Board Content */}
      <DraftBoardClient initialProspects={prospects} />
    </div>
  );
}
