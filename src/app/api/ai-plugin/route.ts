import { NextResponse } from "next/server";
import { pluginData } from "./data";
export async function GET() {
  return NextResponse.json(pluginData);
}
