export const POSITIONS = [
  "RHP",
  "LHP",
  "C",
  "1B",
  "2B",
  "3B",
  "SS",
  "LF",
  "CF",
  "RF",
  "DH",
] as const;

export const POSITION_GROUPS = {
  PITCHERS: ["RHP", "LHP"],
  CATCHERS: ["C"],
  INFIELD: ["1B", "2B", "3B", "SS"],
  OUTFIELD: ["LF", "CF", "RF"],
};

export const RECRUIT_STATUSES = [
  { id: "TOP_TARGET", label: "Top Target", color: "emerald" },
  { id: "OFFERED", label: "Offer Extended", color: "blue" },
  { id: "WATCHLIST", label: "Watchlist", color: "amber" },
  { id: "COMMITTED", label: "Committed", color: "purple" },
  { id: "SIGNED", label: "Signed / Pro", color: "cyan" },
] as const;

export function getGradeLabel(grade: number): { label: string; color: string; badgeBg: string; textClass: string } {
  if (grade >= 75) return { label: "Elite (80)", color: "text-purple-400", badgeBg: "bg-purple-950/80 border-purple-600 text-purple-300", textClass: "text-purple-400" };
  if (grade >= 65) return { label: "Plus-Plus (70)", color: "text-blue-400", badgeBg: "bg-blue-950/80 border-blue-600 text-blue-300", textClass: "text-blue-400" };
  if (grade >= 58) return { label: "Plus (60)", color: "text-emerald-400", badgeBg: "bg-emerald-950/80 border-emerald-600 text-emerald-300", textClass: "text-emerald-400" };
  if (grade >= 53) return { label: "Above Avg (55)", color: "text-teal-400", badgeBg: "bg-teal-950/80 border-teal-600 text-teal-300", textClass: "text-teal-400" };
  if (grade >= 48) return { label: "MLB Avg (50)", color: "text-amber-400", badgeBg: "bg-amber-950/80 border-amber-600 text-amber-300", textClass: "text-amber-400" };
  if (grade >= 43) return { label: "Fringe (45)", color: "text-orange-400", badgeBg: "bg-orange-950/80 border-orange-600 text-orange-300", textClass: "text-orange-400" };
  if (grade >= 35) return { label: "Below Avg (40)", color: "text-rose-400", badgeBg: "bg-rose-950/80 border-rose-600 text-rose-300", textClass: "text-rose-400" };
  return { label: "Poor (20-30)", color: "text-red-500", badgeBg: "bg-red-950/80 border-red-700 text-red-400", textClass: "text-red-500" };
}

export function calculateHitterOFP(futureGrades: {
  hit: number;
  power: number;
  run: number;
  arm: number;
  field: number;
}): number {
  // Classic pro weighting: Hit (30%), Power (30%), Field (15%), Arm (10%), Run (15%)
  const weighted =
    futureGrades.hit * 0.3 +
    futureGrades.power * 0.3 +
    futureGrades.field * 0.15 +
    futureGrades.arm * 0.1 +
    futureGrades.run * 0.15;
  return Math.round(weighted / 5) * 5; // round to nearest 5 (e.g. 50, 55, 60)
}

export function calculatePitcherOFP(futureGrades: {
  fastball: number;
  primaryBreaking: number;
  secondaryOffspeed: number;
  command: number;
}): number {
  // Fastball (35%), Primary breaking (25%), Secondary offspeed (15%), Command (25%)
  const weighted =
    futureGrades.fastball * 0.35 +
    futureGrades.primaryBreaking * 0.25 +
    futureGrades.secondaryOffspeed * 0.15 +
    futureGrades.command * 0.25;
  return Math.round(weighted / 5) * 5;
}
