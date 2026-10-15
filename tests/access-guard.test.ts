import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { writerAccessDecision, writerToken } from "../src/lib/writer-token.ts";

test("writer access fails closed without a configured secret", () => {
  assert.equal(writerAccessDecision(undefined, undefined), "unconfigured");
  assert.equal(writerAccessDecision("", writerToken("anything")), "unconfigured");
});

test("writer access sends callers without a valid session to sign in", () => {
  const secret = "test-secret-value";
  assert.equal(writerAccessDecision(secret, undefined), "sign_in");
  assert.equal(writerAccessDecision(secret, "forged.token"), "sign_in");
  assert.equal(writerAccessDecision(secret, writerToken("other-secret")), "sign_in");
});

test("writer access allows a current session signed with the configured secret", () => {
  const secret = "test-secret-value";
  assert.equal(writerAccessDecision(secret, writerToken(secret)), "allow");
});

test("every mutating server action checks writer access before doing anything else", () => {
  const source = readFileSync(new URL("../src/app/actions.ts", import.meta.url), "utf8");
  const actions = [...source.matchAll(/export async function (\w+)\([^)]*\)\s*\{\s*([^\n]*)/g)];
  assert.deepEqual(
    actions.map(([, name]) => name),
    [
      "createProspectAction",
      "createReportAction",
      "importMlbPlayerAction",
      "syncMlbTeamRosterAction",
      "clearImportedMlbPlayersAction",
    ],
  );
  for (const [, name, firstStatement] of actions) {
    assert.equal(firstStatement.trim(), "await requireWriter();", `${name} must start with await requireWriter();`);
  }
});
