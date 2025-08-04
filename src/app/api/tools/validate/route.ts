import { NextResponse } from "next/server";
import { SignatureValidationSchema } from "../../schema";
import { normalizeSignature, verifySignature } from "../../logic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("validate/", searchParams);
    const { evmAddress, message, signature } = SignatureValidationSchema.parse(
      Object.fromEntries(searchParams.entries()),
    );
    const valid = await verifySignature(
      evmAddress,
      message,
      normalizeSignature(signature),
    );
    return NextResponse.json({ valid }, { status: 200 });
  } catch (error) {
    const publicMessage = `Error validating payload: ${error}`;
    console.error(publicMessage, error);
    return NextResponse.json({ error: publicMessage }, { status: 500 });
  }
}
