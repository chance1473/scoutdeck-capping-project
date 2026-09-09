"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { calculateHitterOFP, calculatePitcherOFP } from "@/lib/scouting";

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
  const isPitcher = ["RHP", "LHP"].includes(data.position);

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
