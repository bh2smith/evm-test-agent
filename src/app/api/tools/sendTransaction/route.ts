import { NextResponse } from "next/server";
import { buildSendTransactions } from "../../logic";
import { SendTransactionSchema } from "../../schema";
import { Hex } from "viem";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("sendTransaction/", searchParams);
    const { numFail, numSuccess, evmAddress, callData } =
      SendTransactionSchema.parse(Object.fromEntries(searchParams.entries()));
    const result = buildSendTransactions(
      evmAddress,
      numSuccess,
      numFail,
      (callData as Hex) || null,
    );
    console.log("Response", JSON.stringify(result));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const publicMessage = "Error generating EVM transaction:";
    console.error(publicMessage, error);
    return NextResponse.json({ error: publicMessage }, { status: 500 });
  }
}
