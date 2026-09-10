import { NextResponse } from "next/server";
import { getDailyPuzzle } from "@/lib/data/puzzles-data";

export async function GET() {
  const daily = getDailyPuzzle();
  return NextResponse.json({
    success: true,
    data: daily,
    date: new Date().toISOString().split("T")[0],
  });
}
