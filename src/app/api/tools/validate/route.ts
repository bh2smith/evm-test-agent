import { NextResponse } from "next/server";
import { SignatureValidationSchema } from "../../schema";
import {
  recoverAddress,
  hashMessage,
  recoverTypedDataAddress,
  type Address,
} from "viem";
import { isAddressEqual } from "viem/utils";
import { normalizeSignature } from "../../logic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("validate/", searchParams);
    const { evmAddress, messageData, signature } =
      SignatureValidationSchema.parse(
        Object.fromEntries(searchParams.entries()),
      );
    const hexSignature = normalizeSignature(signature);
    let signer: Address;
    if (typeof messageData === "string") {
      signer = await recoverAddress({
        hash: hashMessage(messageData as string),
        signature: hexSignature,
      });
    } else {
      signer = await recoverTypedDataAddress({
        ...messageData,
        signature: hexSignature,
      });
    }
    return NextResponse.json(
      { valid: isAddressEqual(signer, evmAddress) },
      { status: 200 },
    );
  } catch (error) {
    const publicMessage = "Error validating payload:";
    console.error(publicMessage, error);
    return NextResponse.json({ error: publicMessage }, { status: 500 });
  }
}
