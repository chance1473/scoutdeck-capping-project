import { prisma } from "@/lib/prisma";
import CompareClient from "@/components/CompareClient";

export const dynamic = "force-dynamic";

interface ComparePageProps {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { a, b } = await searchParams;

  const prospects = await prisma.prospect.findMany({
    where: { mlbId: { not: null } },
    orderBy: [
      { ofpScore: "desc" },
      { name: "asc" },
    ],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Head-to-Head MLB Player Comparison
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Compare live professional players using private 20–80 evaluations and synced performance data.
        </p>
      </div>

      <CompareClient
        prospects={prospects}
        initialPlayerAId={a}
        initialPlayerBId={b}
      />
    </div>
  );
}
