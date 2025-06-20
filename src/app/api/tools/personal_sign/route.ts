import { NextResponse } from "next/server";
import { addressField, FieldParser, validateInput } from "@bitte-ai/agent-sdk";
import { Address, toHex } from "viem";
import { SEPOLIA_CHAIN_ID } from "@/src/app/config";

interface Input {
  evmAddress: Address;
}

const parsers: FieldParser<Input> = {
  evmAddress: addressField,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("personal_sign/", searchParams);
    const { evmAddress } = validateInput<Input>(searchParams, parsers);
    const message = searchParams.get("message") || "Default Message";
    const fullMessage = [
      `Bitte Agent Personal Sign`,
      `Chain ID: ${SEPOLIA_CHAIN_ID}`,
      `Message: ${message}`,
      `Timestamp: ${new Date().toISOString()}`, // Optional but strongly recommended
    ].join("\n");
    const messageHex = toHex(fullMessage); // Raw UTF-8 encoding → hex

    return NextResponse.json(
      {
        transaction: {
          method: "personal_sign",
          params: [messageHex, evmAddress], // NOTE: param order matters
        },
        meta: `Sign personal message: "${message}"`,
      },
      { status: 200 },
    );
  } catch (error) {
    const publicMessage = "Error generating personal_sign payload:";
    console.error(publicMessage, error);
    return NextResponse.json(
      { error: publicMessage },
      { status: 500 },
    );
  }
}
