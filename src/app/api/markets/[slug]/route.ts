import { NextResponse } from "next/server";
import { buildPublicMarketActivity } from "@/lib/data";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const activity = await buildPublicMarketActivity(slug);

  if (!activity) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(activity);
}
