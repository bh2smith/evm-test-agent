import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json(
      {
        message: "Thanks for your small payment!",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    // TODO: Issue refund
    console.error(error);
    return;
  }
}
