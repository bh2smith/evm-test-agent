import { NextResponse } from "next/server";
import { toHex } from "viem";
import { SEPOLIA_CHAIN_ID } from "@/src/app/config";
import { SignMessageSchema } from "../../schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("eth_sign/", searchParams);

    const input = SignMessageSchema.parse(
      Object.fromEntries(searchParams.entries()),
    );
    const { evmAddress, message = "Default Message" } = input;

    return NextResponse.json(
      {
        transaction: {
          chainId: SEPOLIA_CHAIN_ID,
          method: "eth_sign",
          params: [evmAddress, toHex(message)],
        },
        meta: `Sign message "${message}" with ${evmAddress}`,
      },
      { status: 200 },
    );
  } catch (error) {
    const publicMessage = "Error generating eth_sign payload:";
    console.error(publicMessage, error);
    return NextResponse.json({ error: publicMessage }, { status: 500 });
  }
}
