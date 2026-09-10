import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ScoutDeck is intentionally not seeded with fictional players. Current MLB
  // players enter the database through the live roster synchronization screen.
  console.log("ScoutDeck database ready. Sync a current MLB roster from /mlb.");
}

main()
  .finally(async () => prisma.$disconnect());
