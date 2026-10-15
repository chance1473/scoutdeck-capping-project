import { createHmac, timingSafeEqual } from "node:crypto";

export const WRITER_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;
const CLOCK_SKEW_MS = 60 * 1000;

function sign(secret: string, issuedAt: number): string {
  return createHmac("sha256", secret).update(`scoutdeck-writer-v2.${issuedAt}`).digest("base64url");
}

export function writerToken(secret: string, issuedAt: number = Date.now()): string {
  return `${issuedAt}.${sign(secret, issuedAt)}`;
}

export function secretMatches(secret: string, submitted: string): boolean {
  const expected = Buffer.from(secret);
  const actual = Buffer.from(submitted);
  if (expected.length === 0 || expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function writerTokenMatches(
  secret: string,
  token: string | undefined,
  now: number = Date.now(),
): boolean {
  if (!secret || !token) return false;
  const [issuedPart, signature, ...rest] = token.split(".");
  if (rest.length > 0 || !issuedPart || !signature || !/^\d+$/.test(issuedPart)) return false;
  const issuedAt = Number(issuedPart);
  if (issuedAt > now + CLOCK_SKEW_MS) return false;
  if (now - issuedAt > WRITER_SESSION_MAX_AGE_SECONDS * 1000) return false;
  const expected = Buffer.from(sign(secret, issuedAt));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export type WriterAccessDecision = "allow" | "sign_in" | "unconfigured";

export function writerAccessDecision(
  secret: string | undefined,
  token: string | undefined,
  now: number = Date.now(),
): WriterAccessDecision {
  if (!secret) return "unconfigured";
  return writerTokenMatches(secret, token, now) ? "allow" : "sign_in";
}
