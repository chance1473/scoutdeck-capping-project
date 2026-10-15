import { z } from "zod";
import { CLEAR_IMPORTED_CONFIRMATION, GRADE_MAX, GRADE_MIN, WEIGHT_MAX, WEIGHT_MIN } from "./limits.ts";
import { RECRUIT_STATUSES } from "./scouting.ts";

const grade = () => z.coerce.number().min(GRADE_MIN).max(GRADE_MAX);

type RecruitStatus = (typeof RECRUIT_STATUSES)[number]["id"];
const RECRUIT_STATUS_IDS = RECRUIT_STATUSES.map((status) => status.id) as [RecruitStatus, ...RecruitStatus[]];

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
  status: z.enum(RECRUIT_STATUS_IDS).default("WATCHLIST"),
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

export type ProspectInput = z.infer<typeof ProspectSchema>;

/**
 * Columns a writer may set on a hand-entered prospect, listed one by one.
 * MLB identity, sync and data-source columns are fixed here and never read
 * from the form; add a new form field here explicitly or it is dropped.
 */
export function toProspectCreateData(data: ProspectInput, ofpScore: number) {
  return {
    name: data.name,
    position: data.position,
    secondaryPosition: data.secondaryPosition ?? null,
    bats: data.bats,
    throws: data.throws,
    height: data.height,
    weight: data.weight,
    school: data.school,
    schoolType: data.schoolType,
    gradYear: data.gradYear,
    status: data.status,
    commitment: data.commitment ?? null,
    draftProjection: data.draftProjection ?? null,
    proComp: data.proComp ?? null,
    summary: data.summary ?? null,
    tags: data.tags ?? null,

    exitVelocityMax: data.exitVelocityMax ?? null,
    sixtyTime: data.sixtyTime ?? null,
    popTime: data.popTime ?? null,
    fastballVeloPeak: data.fastballVeloPeak ?? null,
    fastballVeloSit: data.fastballVeloSit ?? null,
    spinRate: data.spinRate ?? null,

    hitPresent: data.hitPresent,
    hitFuture: data.hitFuture,
    powerPresent: data.powerPresent,
    powerFuture: data.powerFuture,
    runPresent: data.runPresent,
    runFuture: data.runFuture,
    armPresent: data.armPresent,
    armFuture: data.armFuture,
    fieldPresent: data.fieldPresent,
    fieldFuture: data.fieldFuture,

    fastballPresent: data.fastballPresent ?? null,
    fastballFuture: data.fastballFuture ?? null,
    sliderPresent: data.sliderPresent ?? null,
    sliderFuture: data.sliderFuture ?? null,
    curveballPresent: data.curveballPresent ?? null,
    curveballFuture: data.curveballFuture ?? null,
    changeupPresent: data.changeupPresent ?? null,
    changeupFuture: data.changeupFuture ?? null,
    commandPresent: data.commandPresent ?? null,
    commandFuture: data.commandFuture ?? null,

    ofpScore,
    mlbId: null,
    currentTeamId: null,
    currentTeamName: null,
    rosterStatus: null,
    active: false,
    dataSource: "SCOUTDECK",
    mlbSyncedAt: null,
  };
}

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
