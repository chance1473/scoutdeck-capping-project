import { z } from "zod";
import { CLEAR_IMPORTED_CONFIRMATION, GRADE_MAX, GRADE_MIN, WEIGHT_MAX, WEIGHT_MIN } from "./limits.ts";

const grade = () => z.coerce.number().min(GRADE_MIN).max(GRADE_MAX);

export const ProspectSchema = z.object({
  name: z.string().min(2, "Player name is required"),
  position: z.string().min(1, "Position is required"),
  secondaryPosition: z.string().optional().nullable(),
  bats: z.enum(["R", "L", "S"]),
  throws: z.enum(["R", "L"]),
  height: z.string().min(2, "Height is required (e.g. 6'2\")"),
  weight: z.coerce.number().min(WEIGHT_MIN).max(WEIGHT_MAX),
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
  hitPresent: grade().default(30),
  hitFuture: grade().default(50),
  powerPresent: grade().default(30),
  powerFuture: grade().default(50),
  runPresent: grade().default(50),
  runFuture: grade().default(50),
  armPresent: grade().default(50),
  armFuture: grade().default(50),
  fieldPresent: grade().default(45),
  fieldFuture: grade().default(55),

  // Pitcher Tools
  fastballPresent: grade().optional().nullable(),
  fastballFuture: grade().optional().nullable(),
  sliderPresent: grade().optional().nullable(),
  sliderFuture: grade().optional().nullable(),
  curveballPresent: grade().optional().nullable(),
  curveballFuture: grade().optional().nullable(),
  changeupPresent: grade().optional().nullable(),
  changeupFuture: grade().optional().nullable(),
  commandPresent: grade().optional().nullable(),
  commandFuture: grade().optional().nullable(),
});

export const ReportSchema = z.object({
  prospectId: z.string().min(1, "Prospect ID is required"),
  scoutName: z.string().min(2, "Scout name is required"),
  eventName: z.string().min(2, "Event / Tournament name is required"),
  date: z.string().default(() => new Date().toISOString()),
  summary: z.string().min(5, "Scouting summary is required"),
  strengths: z.string().min(3, "Key strengths are required"),
  weaknesses: z.string().min(3, "Areas for improvement are required"),
  videoUrl: z.string().optional().nullable(),
  grade: grade().optional().nullable(),
});

export const ClearImportedSchema = z.object({
  confirm: z.literal(CLEAR_IMPORTED_CONFIRMATION, {
    errorMap: () => ({ message: `Type ${CLEAR_IMPORTED_CONFIRMATION} to confirm` }),
  }),
});
