import { NextResponse } from "next/server";
import { toHex } from "viem";
import { SEPOLIA_CHAIN_ID } from "@/src/app/config";
import { SignMessageSchema } from "../../schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("personal_sign/", searchParams);
    const input = SignMessageSchema.parse(
      Object.fromEntries(searchParams.entries()),
    );
    const { evmAddress, message = "Default Message" } = input;

    return NextResponse.json(
      {
        transaction: {
          chainId: SEPOLIA_CHAIN_ID,
          method: "personal_sign",
          params: [toHex(message), evmAddress], // NOTE: param order matters
        },
        meta: `Sign personal message: "${message}"`,
      },
      { status: 200 },
    );
  } catch (error) {
    const publicMessage = "Error generating personal_sign payload:";
    console.error(publicMessage, error);
    return NextResponse.json({ error: publicMessage }, { status: 500 });
  }
}
