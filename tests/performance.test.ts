import assert from "node:assert/strict";
import test from "node:test";
import { calculatePerformanceGrade } from "../src/lib/performance.ts";
import { GRADE_MAX, GRADE_MIN } from "../src/lib/limits.ts";

const group = (displayName: string, stat: Record<string, unknown>) => ({
  group: { displayName },
  splits: [{ stat }],
});

test("league-average stat lines grade as 50", () => {
  assert.equal(calculatePerformanceGrade("SS", [group("hitting", { ops: 0.75, avg: 0.25, slg: 0.4 })]), 50);
  assert.equal(
    calculatePerformanceGrade("RHP", [group("pitching", { era: 4.2, whip: 1.3, strikeoutsPer9Inn: 8.5 })]),
    50,
  );
});

test("missing stats for the player's role fall back to 40", () => {
  assert.equal(calculatePerformanceGrade("CF"), 40);
  assert.equal(calculatePerformanceGrade("LHP", [group("hitting", { ops: 1.2 })]), 40);
});

test("extreme stat lines are clamped to the 20-80 scale", () => {
  assert.equal(calculatePerformanceGrade("1B", [group("hitting", { ops: 2.5, avg: 0.6, slg: 1.5 })]), GRADE_MAX);
  assert.equal(calculatePerformanceGrade("1B", [group("hitting", { ops: 0, avg: 0, slg: 0 })]), GRADE_MIN);
  assert.equal(
    calculatePerformanceGrade("RP", [group("pitching", { era: 20, whip: 4, strikeoutsPer9Inn: 1 })]),
    GRADE_MIN,
  );
});
