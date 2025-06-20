import { NextResponse } from "next/server";
import { toHex } from "viem";
import { SEPOLIA_CHAIN_ID } from "@/src/app/config";
import { SignMessageSchema } from "../../schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("eth_sign/", searchParams);

    const input = SignMessageSchema.parse(Object.fromEntries(searchParams.entries()));
    const { evmAddress, message = "Default Message" } = input;

    const fullMessage = [
      "\x19Bitte Agent Signed Message:",
      `Chain ID: ${SEPOLIA_CHAIN_ID}`,
      `Message: ${message}`,
    ].join("\n");
    const messageHex = toHex(fullMessage); // Viem handles UTF-8 encoding and hex conversion

    return NextResponse.json(
      {
        transaction: {
          method: "eth_sign",
          params: [evmAddress, messageHex],
        },
        meta: `Sign message "${fullMessage}" with ${evmAddress}`,
      },
      { status: 200 },
    );
  } catch (error) {
    const publicMessage = "Error generating eth_sign payload:";
    console.error(publicMessage, error);
    return NextResponse.json(
      { error: publicMessage },
      { status: 500 },
    );
  }
}
