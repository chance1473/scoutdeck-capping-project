import { createHmac, timingSafeEqual } from "node:crypto";

export function writerToken(secret: string): string {
  return createHmac("sha256", secret).update("scoutdeck-writer-v1").digest("base64url");
}

export function secretMatches(secret: string, submitted: string): boolean {
  const expected = Buffer.from(secret);
  const actual = Buffer.from(submitted);
  if (expected.length === 0 || expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function writerTokenMatches(secret: string, token: string | undefined): boolean {
  if (!secret || !token) return false;
  const expected = Buffer.from(writerToken(secret));
  const actual = Buffer.from(token);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
