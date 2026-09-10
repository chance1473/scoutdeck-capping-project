import { PrismaClient } from "@prisma/client";
import { getMlbPlayer } from "../src/lib/mlb";
import { calculatePerformanceGrade } from "../src/lib/performance";

const prisma = new PrismaClient();

async function refreshPlayer(record: { id: string; mlbId: number | null; position: string }) {
  if (!record.mlbId) return;
  const currentSeason = new Date().getFullYear();
  let season = currentSeason;
  let player = await getMlbPlayer(record.mlbId, season);
  if (!player.stats?.some((group) => group.splits.length)) {
    season -= 1;
    player = await getMlbPlayer(record.mlbId, season);
  }
  const position = player.primaryPosition?.abbreviation || record.position;
  await prisma.prospect.update({
    where: { id: record.id },
    data: { position, ofpScore: calculatePerformanceGrade(position, player.stats), mlbSyncedAt: new Date() },
  });
  for (const group of player.stats || []) {
    const stat = group.splits[0]?.stat;
    if (!stat) continue;
    await prisma.mlbStatLine.upsert({
      where: { prospectId_season_group: { prospectId: record.id, season, group: group.group.displayName } },
      create: { prospectId: record.id, season, group: group.group.displayName, statsJson: JSON.stringify(stat) },
      update: { statsJson: JSON.stringify(stat), syncedAt: new Date() },
    });
  }
}

async function main() {
  const players = await prisma.prospect.findMany({ where: { mlbId: { not: null } }, select: { id: true, mlbId: true, position: true } });
  for (let index = 0; index < players.length; index += 5) {
    await Promise.all(players.slice(index, index + 5).map(refreshPlayer));
    console.log(`Refreshed ${Math.min(index + 5, players.length)} of ${players.length}`);
  }
}

main().finally(async () => prisma.$disconnect());
