import { NextResponse } from "next/server";
import { buildPublicMarketSnapshots, splitBoardMarkets } from "@/lib/data";

export async function GET() {
  const markets = await buildPublicMarketSnapshots();

  return NextResponse.json({
    markets,
    ...splitBoardMarkets(markets)
  });
}
