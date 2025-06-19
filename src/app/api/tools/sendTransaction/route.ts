import { NextResponse } from "next/server";
import {
  addressField,
  FieldParser,
  numberField,
  signRequestFor,
  validateInput,
} from "@bitte-ai/agent-sdk";
import { Address, toHex } from "viem";
import { SEPOLIA_CHAIN_ID } from "@/src/app/config";

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
    const { searchParams } = new URL(request.url);
    console.log("sendTransaction/", searchParams);
    const { numTxs, evmAddress: self } = validateInput<Input>(
      searchParams,
      parsers,
    );

    const metaTransactions = Array.from({ length: numTxs }, (_, i) => {
      const index = i + 1;
      return {
        to: self,
        value: "0x00",
        data: toHex(index),
      };
    });

    return NextResponse.json(
      {
        evmSignRequest: signRequestFor({
          chainId: SEPOLIA_CHAIN_ID,
          metaTransactions,
        }),
        meta: `${numTxs} non-trivial transactions to ${self} with no value.`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error generating EVM transaction:", error);
    return NextResponse.json(
      { error: "Failed to generate EVM transaction" },
      { status: 500 },
    );
  }
}
