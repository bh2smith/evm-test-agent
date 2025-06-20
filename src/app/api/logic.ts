import { Address, toHex } from "viem";
import { signRequestFor } from "@bitte-ai/agent-sdk";
import { SEPOLIA_CHAIN_ID } from "../config";


type SignRequest = ReturnType<typeof signRequestFor>;

export function buildSendTransactions(to: Address, numTxs: number): {
  evmSignRequest: SignRequest, meta: string} {
      const metaTransactions = Array.from({ length: numTxs }, (_, i) => {
        const index = i + 1;
        return {
          to,
          value: "0x00",
          data: toHex(index),
        };
      });
      return {
        evmSignRequest: signRequestFor({
          chainId: SEPOLIA_CHAIN_ID,
          metaTransactions,
        }),
        meta: `${numTxs} non-trivial transactions to ${to} with no value.`,
      }
}