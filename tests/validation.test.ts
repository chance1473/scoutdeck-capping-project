import assert from "node:assert/strict";
import test from "node:test";
import { GRADE_MAX, GRADE_MIN } from "../src/lib/limits.ts";
import { ProspectSchema, ReportSchema } from "../src/lib/validation.ts";

const prospect = {
  name: "Test Player",
  position: "SS",
  bats: "R",
  throws: "R",
  height: "6'1\"",
  weight: "190",
  school: "Test Club",
  schoolType: "COLLEGE",
  gradYear: "2026",
};

const report = {
  prospectId: "p1",
  scoutName: "Scout",
  eventName: "Showcase",
  summary: "Quick hands, plus arm.",
  strengths: "Arm",
  weaknesses: "Pitch selection",
};

test("report grade accepts the 20-80 bounds and rejects values outside them", () => {
  assert.equal(ReportSchema.safeParse({ ...report, grade: String(GRADE_MIN) }).success, true);
  assert.equal(ReportSchema.safeParse({ ...report, grade: String(GRADE_MAX) }).success, true);
  assert.equal(ReportSchema.safeParse({ ...report, grade: "19" }).success, false);
  assert.equal(ReportSchema.safeParse({ ...report, grade: "81" }).success, false);
});

test("prospect tool grades are held to the 20-80 scale", () => {
  assert.equal(ProspectSchema.safeParse({ ...prospect, hitFuture: "80" }).success, true);
  assert.equal(ProspectSchema.safeParse({ ...prospect, hitFuture: "95" }).success, false);
  assert.equal(ProspectSchema.safeParse({ ...prospect, armPresent: "10" }).success, false);
  assert.equal(ProspectSchema.safeParse({ ...prospect, fastballFuture: "120" }).success, false);
});

test("prospect weight is held to 100-350", () => {
  assert.equal(ProspectSchema.safeParse({ ...prospect, weight: "99" }).success, false);
  assert.equal(ProspectSchema.safeParse({ ...prospect, weight: "351" }).success, false);
});
