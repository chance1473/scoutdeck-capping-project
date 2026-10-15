import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type WriterAccessDecision, writerAccessDecision } from "@/lib/writer-token";

export const WRITER_COOKIE = "scoutdeck_writer";

export class WriterAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WriterAccessError";
  }
}

async function currentDecision(): Promise<WriterAccessDecision> {
  const jar = await cookies();
  return writerAccessDecision(process.env.SCOUTDECK_ACCESS_SECRET, jar.get(WRITER_COOKIE)?.value);
}

export async function isWriter(): Promise<boolean> {
  return (await currentDecision()) === "allow";
}

/**
 * Authorization gate for every mutating server action. Call it before reading
 * input or touching the database. Signed-out callers are sent to /access
 * (redirect throws, so the action stops); a deployment without a writer secret
 * fails closed with an error instead.
 */
export async function requireWriter(): Promise<void> {
  const decision = await currentDecision();
  if (decision === "unconfigured") {
    throw new WriterAccessError("Writer access is not configured: SCOUTDECK_ACCESS_SECRET is unset.");
  }
  if (decision !== "allow") {
    redirect("/access");
  }
}
