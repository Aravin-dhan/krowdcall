import { NextResponse } from "next/server";
import { getCuratedNewsForQuestion } from "@/lib/news";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const items = await getCuratedNewsForQuestion(slug);

  return NextResponse.json({ items });
}
