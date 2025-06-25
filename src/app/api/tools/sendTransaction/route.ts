import { NextResponse } from "next/server";
import { buildSendTransactions } from "../../logic";
import { SendTransactionSchema } from "../../schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("sendTransaction/", searchParams);
    const { numFail, numSuccess, evmAddress: self } = SendTransactionSchema.parse(Object.fromEntries(searchParams.entries()));
    return NextResponse.json(buildSendTransactions(self, numSuccess, numFail), { status: 200 });
  } catch (error) {
    const publicMessage = "Error generating EVM transaction:";
    console.error(publicMessage, error);
    return NextResponse.json(
      { error: publicMessage },
      { status: 500 },
    );
  }
}
