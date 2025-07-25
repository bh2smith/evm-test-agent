import { getPricePlan } from "@/src/x402-config";
import { NextResponse } from "next/server";
import { toJsonSafe } from "x402/shared";

export async function GET(req: Request) {
  const baseUrl = new URL(req.url).origin;
  const pricePlan = getPricePlan(baseUrl);
  return NextResponse.json(toJsonSafe(pricePlan));
}
