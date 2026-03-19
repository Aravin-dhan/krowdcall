import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth?verified=invalid", url));
  }

  const result = await verifyEmailToken(token);
  const destination = result.ok ? "/auth?verified=success" : "/auth?verified=invalid";

  return NextResponse.redirect(new URL(destination, url));
}
