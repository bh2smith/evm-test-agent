import { Address, maxUint256, toHex } from "viem";
import { signRequestFor } from "@bitte-ai/agent-sdk";
import { SEPOLIA_CHAIN_ID } from "../config";


type SignRequest = ReturnType<typeof signRequestFor>;

export function buildSendTransactions(to: Address, numSuccess: number, numFail: number = 0): {
  transaction: SignRequest, meta: string} {
      const successfullTxs = Array.from({ length: numSuccess }, (_, i) => {
        const index = i + 1;
        return {
          to,
          value: "0x00",
          data: toHex(index),
        };
      });
      const failingTxs = Array.from({ length: numSuccess }, (_, i) => {
        const index = i + 1;
        return {
          to, // Sending to Self (so no funds lost).
          value: toHex(maxUint256),
          data: toHex(index),
        };
      });
      return {
        transaction: signRequestFor({
          chainId: SEPOLIA_CHAIN_ID,
          metaTransactions: successfullTxs.concat(failingTxs),
        }),
        meta: `${numSuccess + numFail} non-trivial transactions to ${to} with ${numSuccess} succeeding & ${numFail} failing.`,
      }
}