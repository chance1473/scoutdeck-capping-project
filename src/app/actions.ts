"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { calculateHitterOFP, calculatePitcherOFP } from "@/lib/scouting";
import { getMlbPlayer, getMlbRoster } from "@/lib/mlb";
import { calculatePerformanceGrade } from "@/lib/performance";
import { requireWriter } from "@/lib/access";
import { ClearImportedSchema, ProspectSchema, ReportSchema } from "@/lib/validation";

export async function createProspectAction(formData: FormData) {
  await requireWriter();
  const rawData: Record<string, any> = {};
  formData.forEach((val, key) => {
    if (val !== "") {
      rawData[key] = val;
    }
  });

  const parsed = ProspectSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(`Validation failed: ${parsed.error.errors.map((e) => e.message).join(", ")}`);
  }

  const data = parsed.data;
  const isPitcher = ["P", "SP", "RP", "RHP", "LHP"].includes(data.position);

  let calculatedOfp = 50;
  if (isPitcher) {
    calculatedOfp = calculatePitcherOFP({
      fastball: data.fastballFuture ?? 50,
      primaryBreaking: data.sliderFuture ?? 50,
      secondaryOffspeed: data.changeupFuture ?? 50,
      command: data.commandFuture ?? 50,
    });
  } else {
    calculatedOfp = calculateHitterOFP({
      hit: data.hitFuture,
      power: data.powerFuture,
      run: data.runFuture,
      arm: data.armFuture,
      field: data.fieldFuture,
    });
  }

  const newProspect = await prisma.prospect.create({
    data: {
      ...data,
      ofpScore: calculatedOfp,
    },
  });

  revalidatePath("/");
  revalidatePath("/compare");
  redirect(`/prospects/${newProspect.id}`);
}

export async function createReportAction(formData: FormData) {
  await requireWriter();
  const rawData: Record<string, any> = {};
  formData.forEach((val, key) => {
    if (val !== "") {
      rawData[key] = val;
    }
  });

  const parsed = ReportSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(`Validation failed: ${parsed.error.errors.map((e) => e.message).join(", ")}`);
  }

  const data = parsed.data;

  const prospect = await prisma.prospect.findUnique({
    where: { id: data.prospectId },
    select: { id: true },
  });
  if (!prospect) {
    throw new Error("Prospect not found");
  }

  await prisma.scoutingReport.create({
    data: {
      prospectId: data.prospectId,
      scoutName: data.scoutName,
      eventName: data.eventName,
      date: new Date(data.date),
      summary: data.summary,
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      videoUrl: data.videoUrl || null,
      grade: data.grade || null,
    },
  });

  revalidatePath(`/prospects/${data.prospectId}`);
  revalidatePath("/");
  redirect(`/prospects/${data.prospectId}`);
}

const MlbImportSchema = z.object({
  mlbId: z.coerce.number().int().positive(),
  rosterStatus: z.string().max(80).optional(),
});

async function syncMlbPlayerRecord(mlbId: number, rosterStatus?: string, fallbackTeam?: { id: number; name: string }) {
  const currentSeason = new Date().getFullYear();
  let player = await getMlbPlayer(mlbId, currentSeason);
  let statsSeason = currentSeason;
  if (!player.stats?.some((group) => group.splits.length > 0)) {
    statsSeason = currentSeason - 1;
    player = await getMlbPlayer(mlbId, statsSeason);
  }
  const position = player.primaryPosition?.abbreviation || "UTIL";
  const bats = player.batSide?.code;
  const throws = player.pitchHand?.code;
  const team = player.currentTeam || fallbackTeam;
  const performanceGrade = calculatePerformanceGrade(position, player.stats);
  const prospect = await prisma.prospect.upsert({
    where: { mlbId: player.id },
    create: {
      mlbId: player.id, name: player.fullName, position,
      bats: bats === "L" || bats === "S" ? bats : "R", throws: throws === "L" ? "L" : "R",
      height: player.height || "N/A", weight: player.weight || 200, school: team?.name || "MLB",
      schoolType: "PROFESSIONAL", gradYear: currentSeason, status: "WATCHLIST", ofpScore: performanceGrade,
      currentTeamId: team?.id, currentTeamName: team?.name, rosterStatus,
      birthDate: player.birthDate, age: player.currentAge, debutDate: player.mlbDebutDate,
      active: player.active ?? true, dataSource: "MLB_STATS_API", mlbSyncedAt: new Date(),
      summary: "Current MLB player with a data-derived performance grade. Scout-authored evaluation pending.",
    },
    update: {
      name: player.fullName, position, bats: bats === "L" || bats === "S" ? bats : "R",
      throws: throws === "L" ? "L" : "R", height: player.height || "N/A", weight: player.weight || 200,
      school: team?.name || "MLB", currentTeamId: team?.id, currentTeamName: team?.name,
      rosterStatus, birthDate: player.birthDate, age: player.currentAge, debutDate: player.mlbDebutDate,
      active: player.active ?? true, dataSource: "MLB_STATS_API", mlbSyncedAt: new Date(), ofpScore: performanceGrade,
    },
  });
  for (const statGroup of player.stats || []) {
    const stat = statGroup.splits[0]?.stat;
    if (!stat) continue;
    await prisma.mlbStatLine.upsert({
      where: { prospectId_season_group: { prospectId: prospect.id, season: statsSeason, group: statGroup.group.displayName } },
      create: { prospectId: prospect.id, season: statsSeason, group: statGroup.group.displayName, statsJson: JSON.stringify(stat) },
      update: { statsJson: JSON.stringify(stat), syncedAt: new Date() },
    });
  }
  return prospect;
}

export async function importMlbPlayerAction(formData: FormData) {
  await requireWriter();
  const input = MlbImportSchema.parse({
    mlbId: formData.get("mlbId"),
    rosterStatus: formData.get("rosterStatus") || undefined,
  });
  const prospect = await syncMlbPlayerRecord(input.mlbId, input.rosterStatus);
  revalidatePath("/");
  revalidatePath("/mlb");
  revalidatePath(`/prospects/${prospect.id}`);
  redirect(`/prospects/${prospect.id}`);
}

export async function syncMlbTeamRosterAction(formData: FormData) {
  await requireWriter();
  const teamId = z.coerce.number().int().positive().parse(formData.get("teamId"));
  const teamName = z.string().min(1).max(100).parse(formData.get("teamName"));
  const roster = await getMlbRoster(teamId);
  for (let index = 0; index < roster.length; index += 5) {
    await Promise.all(roster.slice(index, index + 5).map((entry) => syncMlbPlayerRecord(
      entry.person.id, entry.status.description, { id: teamId, name: teamName },
    )));
  }


  revalidatePath("/");
  revalidatePath("/mlb");
  redirect("/");
}

export async function clearImportedMlbPlayersAction(formData: FormData) {
  await requireWriter();
  const confirmation = ClearImportedSchema.safeParse({ confirm: formData.get("confirm") });
  if (!confirmation.success) {
    throw new Error(confirmation.error.errors[0]?.message ?? "Confirmation required");
  }
  await prisma.prospect.deleteMany({
    where: { mlbId: { not: null } },
  });

  revalidatePath("/");
  revalidatePath("/mlb");
  revalidatePath("/compare");
  revalidatePath("/reports/new");
  redirect("/mlb?cleared=true");
}
