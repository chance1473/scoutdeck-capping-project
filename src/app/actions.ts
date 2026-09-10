"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { calculateHitterOFP, calculatePitcherOFP } from "@/lib/scouting";
import { getMlbPlayer, getMlbRoster } from "@/lib/mlb";
import { calculatePerformanceGrade } from "@/lib/performance";

const ProspectSchema = z.object({
  name: z.string().min(2, "Player name is required"),
  position: z.string().min(1, "Position is required"),
  secondaryPosition: z.string().optional().nullable(),
  bats: z.enum(["R", "L", "S"]),
  throws: z.enum(["R", "L"]),
  height: z.string().min(2, "Height is required (e.g. 6'2\")"),
  weight: z.coerce.number().min(100).max(350),
  school: z.string().min(2, "School / Team is required"),
  schoolType: z.enum(["HIGH_SCHOOL", "COLLEGE"]),
  gradYear: z.coerce.number().min(2024).max(2030),
  status: z.string().default("WATCHLIST"),
  commitment: z.string().optional().nullable(),
  draftProjection: z.string().optional().nullable(),
  proComp: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),

  // Showcase metrics
  exitVelocityMax: z.coerce.number().optional().nullable(),
  sixtyTime: z.coerce.number().optional().nullable(),
  popTime: z.coerce.number().optional().nullable(),
  fastballVeloPeak: z.coerce.number().optional().nullable(),
  fastballVeloSit: z.coerce.number().optional().nullable(),
  spinRate: z.coerce.number().optional().nullable(),

  // Position Player Tools
  hitPresent: z.coerce.number().default(30),
  hitFuture: z.coerce.number().default(50),
  powerPresent: z.coerce.number().default(30),
  powerFuture: z.coerce.number().default(50),
  runPresent: z.coerce.number().default(50),
  runFuture: z.coerce.number().default(50),
  armPresent: z.coerce.number().default(50),
  armFuture: z.coerce.number().default(50),
  fieldPresent: z.coerce.number().default(45),
  fieldFuture: z.coerce.number().default(55),

  // Pitcher Tools
  fastballPresent: z.coerce.number().optional().nullable(),
  fastballFuture: z.coerce.number().optional().nullable(),
  sliderPresent: z.coerce.number().optional().nullable(),
  sliderFuture: z.coerce.number().optional().nullable(),
  curveballPresent: z.coerce.number().optional().nullable(),
  curveballFuture: z.coerce.number().optional().nullable(),
  changeupPresent: z.coerce.number().optional().nullable(),
  changeupFuture: z.coerce.number().optional().nullable(),
  commandPresent: z.coerce.number().optional().nullable(),
  commandFuture: z.coerce.number().optional().nullable(),
});

export async function createProspectAction(formData: FormData) {
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

const ReportSchema = z.object({
  prospectId: z.string().min(1, "Prospect ID is required"),
  scoutName: z.string().min(2, "Scout name is required"),
  eventName: z.string().min(2, "Event / Tournament name is required"),
  date: z.string().default(() => new Date().toISOString()),
  summary: z.string().min(5, "Scouting summary is required"),
  strengths: z.string().min(3, "Key strengths are required"),
  weaknesses: z.string().min(3, "Areas for improvement are required"),
  videoUrl: z.string().optional().nullable(),
  grade: z.coerce.number().min(20).max(80).optional().nullable(),
});

export async function createReportAction(formData: FormData) {
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

export async function clearImportedMlbPlayersAction() {
  await prisma.prospect.deleteMany({
    where: { mlbId: { not: null } },
  });

  revalidatePath("/");
  revalidatePath("/mlb");
  revalidatePath("/compare");
  revalidatePath("/reports/new");
  redirect("/mlb?cleared=true");
}
