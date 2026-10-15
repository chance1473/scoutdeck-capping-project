"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WRITER_COOKIE } from "@/lib/access";
import { WRITER_SESSION_MAX_AGE_SECONDS, secretMatches, writerToken } from "@/lib/writer-token";

export async function signInAction(formData: FormData) {
  const secret = process.env.SCOUTDECK_ACCESS_SECRET;
  const submitted = String(formData.get("secret") ?? "");
  if (!secret || !secretMatches(secret, submitted)) {
    redirect("/access?error=1");
  }

  const jar = await cookies();
  jar.set(WRITER_COOKIE, writerToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WRITER_SESSION_MAX_AGE_SECONDS,
  });
  redirect("/");
}

export async function signOutAction() {
  const jar = await cookies();
  jar.delete(WRITER_COOKIE);
  redirect("/access");
}
