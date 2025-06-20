import { NextResponse } from "next/server";
import {
  addressField,
  FieldParser,
  numberField,
  validateInput,
} from "@bitte-ai/agent-sdk";
import { Address} from "viem";
import { buildSendTransactions } from "../../logic";

interface Input {
  numTxs: number;
  evmAddress: Address;
}

const parsers: FieldParser<Input> = {
  numTxs: numberField,
  evmAddress: addressField,
};

export async function GET(request: Request) {
  try {
    const { searchParams: search } = new URL(request.url);
    console.log("sendTransaction/", search);
    const { numTxs, evmAddress: self } = validateInput<Input>(search,parsers);
    return NextResponse.json(buildSendTransactions(self, numTxs), { status: 200 });
  } catch (error) {
    const publicMessage = "Error generating EVM transaction:";
    console.error(publicMessage, error);
    return NextResponse.json(
      { error: publicMessage },
      { status: 500 },
    );
  }
}
