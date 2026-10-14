import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { writerTokenMatches } from "@/lib/writer-token";

export const WRITER_COOKIE = "scoutdeck_writer";

export async function requireWriter(): Promise<void> {
  const secret = process.env.SCOUTDECK_ACCESS_SECRET;
  const jar = await cookies();
  const token = jar.get(WRITER_COOKIE)?.value;
  if (!secret || !writerTokenMatches(secret, token)) {
    redirect("/access");
  }
}
