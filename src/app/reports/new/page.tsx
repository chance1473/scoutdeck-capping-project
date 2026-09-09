import { prisma } from "@/lib/prisma";
import NewReportClient from "@/components/NewReportClient";

export const dynamic = "force-dynamic";

interface NewReportPageProps {
  searchParams: Promise<{ prospectId?: string }>;
}

export default async function NewReportPage({ searchParams }: NewReportPageProps) {
  const { prospectId } = await searchParams;

  const prospects = await prisma.prospect.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      position: true,
      school: true,
    },
  });

  return (
    <NewReportClient
      prospects={prospects}
      defaultProspectId={prospectId}
    />
  );
}
