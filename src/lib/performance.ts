type StatGroup = {
  group: { displayName: string };
  splits: { stat: Record<string, unknown> }[];
};

function clampGrade(value: number) {
  return Math.max(20, Math.min(80, Math.round(value / 5) * 5));
}

export function calculatePerformanceGrade(position: string, stats: StatGroup[] = []) {
  const pitching = ["P", "SP", "RP", "RHP", "LHP"].includes(position);
  const group = stats.find((item) => item.group.displayName.toLowerCase() === (pitching ? "pitching" : "hitting"));
  const stat = group?.splits[0]?.stat;
  if (!stat) return 40;
  const number = (key: string, fallback: number) => {
    const value = Number(stat[key]);
    return Number.isFinite(value) ? value : fallback;
  };
  if (pitching) {
    const era = 50 + (4.2 - number("era", 4.2)) * 8;
    const whip = 50 + (1.3 - number("whip", 1.3)) * 35;
    const strikeouts = 50 + (number("strikeoutsPer9Inn", 8.5) - 8.5) * 3;
    return clampGrade(era * 0.45 + whip * 0.35 + strikeouts * 0.2);
  }
  const ops = 50 + (number("ops", 0.75) - 0.75) * 100;
  const average = 50 + (number("avg", 0.25) - 0.25) * 120;
  const slugging = 50 + (number("slg", 0.4) - 0.4) * 80;
  return clampGrade(ops * 0.5 + average * 0.2 + slugging * 0.3);
}
