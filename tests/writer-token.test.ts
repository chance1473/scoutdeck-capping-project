import assert from "node:assert/strict";
import test from "node:test";
import { calculateHitterOFP, calculatePitcherOFP } from "../src/lib/scouting.ts";
import {
  WRITER_SESSION_MAX_AGE_SECONDS,
  secretMatches,
  writerToken,
  writerTokenMatches,
} from "../src/lib/writer-token.ts";

test("writer token matches only the token derived from the configured secret", () => {
  const secret = "test-secret-value";
  const token = writerToken(secret);
  assert.equal(writerTokenMatches(secret, token), true);
  assert.equal(writerTokenMatches(secret, "not-the-token"), false);
  assert.equal(writerTokenMatches("other-secret", token), false);
  assert.equal(writerTokenMatches(secret, undefined), false);
});

test("writer token expires after the session lifetime and rejects tampering", () => {
  const secret = "test-secret-value";
  const issuedAt = 1_700_000_000_000;
  const token = writerToken(secret, issuedAt);
  const maxAgeMs = WRITER_SESSION_MAX_AGE_SECONDS * 1000;
  assert.equal(writerTokenMatches(secret, token, issuedAt + maxAgeMs), true);
  assert.equal(writerTokenMatches(secret, token, issuedAt + maxAgeMs + 1), false);
  assert.equal(writerTokenMatches(secret, writerToken(secret, issuedAt + 10 * 60 * 1000), issuedAt), false);

  const signature = token.split(".")[1];
  assert.equal(writerTokenMatches(secret, `${issuedAt + 1000}.${signature}`, issuedAt + 2000), false);
  assert.equal(writerTokenMatches(secret, signature, issuedAt), false);
  assert.equal(writerTokenMatches(secret, `${token}.extra`, issuedAt), false);
});

test("submitted secret must match the configured secret exactly", () => {
  assert.equal(secretMatches("test-secret-value", "test-secret-value"), true);
  assert.equal(secretMatches("test-secret-value", "test-secret-valuE"), false);
  assert.equal(secretMatches("test-secret-value", ""), false);
});

test("hitter and pitcher OFP composites round to the 20-80 scale", () => {
  assert.equal(calculateHitterOFP({ hit: 60, power: 60, run: 50, arm: 50, field: 50 }), 55);
  assert.equal(
    calculatePitcherOFP({ fastball: 70, primaryBreaking: 60, secondaryOffspeed: 50, command: 55 }),
    60,
  );
});
