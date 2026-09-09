import { prisma } from "@/lib/prisma";
import CompareClient from "@/components/CompareClient";

export const dynamic = "force-dynamic";

interface ComparePageProps {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { a, b } = await searchParams;

  const prospects = await prisma.prospect.findMany({
    orderBy: [
      { ofpScore: "desc" },
      { name: "asc" },
    ],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Head-to-Head Prospect Comparison
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Direct side-by-side evaluation of 20–80 tool projections, radar shapes, and verified combine metrics.
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
