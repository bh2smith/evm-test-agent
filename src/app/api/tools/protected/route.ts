import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      message: "Thanks for your payment!",
    },
    {
      status: 200,
    },
  );
}
