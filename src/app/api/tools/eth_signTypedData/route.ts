import { NextResponse } from "next/server";
import { SEPOLIA_CHAIN_ID } from "@/src/app/config";
import { SignMessageSchema } from "../../schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { evmAddress } = SignMessageSchema.parse(
      Object.fromEntries(searchParams.entries()),
    );

    const dataString = JSON.stringify({
      domain: {
        name: "Bitte Test EVM Agent",
        version: "1",
        chainId: SEPOLIA_CHAIN_ID,
        verifyingContract: "0x0000000000000000000000000000000000000000",
      },
      types: {
        Access: [
          { name: "user", type: "address" },
          { name: "action", type: "string" },
          { name: "expires", type: "uint256" },
          { name: "note", type: "string" },
        ],
      },
      primaryType: "Access",
      message: {
        user: evmAddress,
        action: "DEMO SIGNATURE — NOT USABLE",
        expires: 0,
        note: "This signature is expired and only for testing/demo purposes.",
      },
    });
    return NextResponse.json(
      {
        transaction: {
          method: "eth_signTypedData_v4",
          params: [evmAddress, dataString],
        },
        meta: `Sign Dummy Typed Data.`,
      },
      { status: 200 },
    );
  } catch (error) {
    const publicMessage = "Error generating eth_signTypedData payload:";
    console.error(publicMessage, error);
    return NextResponse.json({ error: publicMessage }, { status: 500 });
  }
}
