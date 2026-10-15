import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { writerTokenMatches } from "@/lib/writer-token";

export const WRITER_COOKIE = "scoutdeck_writer";

export class WriterAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WriterAccessError";
  }
}

export async function isWriter(): Promise<boolean> {
  const secret = process.env.SCOUTDECK_ACCESS_SECRET;
  if (!secret) return false;
  const jar = await cookies();
  return writerTokenMatches(secret, jar.get(WRITER_COOKIE)?.value);
}

/**
 * Authorization gate for every mutating server action. Call it before reading
 * input or touching the database. Signed-out callers are sent to /access
 * (redirect throws, so the action stops); a deployment without a writer secret
 * fails closed with an error instead.
 */
export async function requireWriter(): Promise<void> {
  if (!process.env.SCOUTDECK_ACCESS_SECRET) {
    throw new WriterAccessError("Writer access is not configured: SCOUTDECK_ACCESS_SECRET is unset.");
  }
  if (!(await isWriter())) {
    redirect("/access");
  }
}
