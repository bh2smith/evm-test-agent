import { signRequestFor } from "@bitte-ai/agent-sdk";
import { SEPOLIA_CHAIN_ID } from "../config";
import {
  recoverAddress,
  hashMessage,
  recoverTypedDataAddress,
  maxUint256,
  toHex,
  Hex,
  serializeSignature,
  type Address,
  isAddressEqual,
  isHex,
  hexToString,
} from "viem";
import { type MessageData } from "./schema";

export const normalizeSignature = (
  sig: string | { r: string; s: string; v: number | string },
): Hex => {
  if (typeof sig === "string") return sig as Hex;
  return serializeSignature({
    r: sig.r as Hex,
    s: sig.s as Hex,
    v: BigInt(typeof sig.v === "string" ? parseInt(sig.v, 16) : sig.v),
  });
};

type SignRequest = ReturnType<typeof signRequestFor>;

export function buildSendTransactions(
  to: Address,
  numSuccess: number,
  numFail: number = 0,
  callData: Hex | null,
): {
  transaction: SignRequest;
  meta: string;
} {
  const successfullTxs = Array.from({ length: numSuccess }, (_, i) => {
    const index = i + 1;
    return {
      to,
      value: toHex("0"),
      data: callData ?? toHex(index),
    };
  });
  const failingTxs = Array.from({ length: numFail }, (_, i) => {
    const index = i + 1;
    return {
      to, // Sending to Self (so no funds lost).
      value: toHex(maxUint256),
      data: callData ?? toHex(index),
    };
  });
  return {
    transaction: signRequestFor({
      chainId: SEPOLIA_CHAIN_ID,
      metaTransactions: successfullTxs.concat(failingTxs),
    }),
    meta: `${numSuccess + numFail} non-trivial transactions to ${to} with ${numSuccess} succeeding & ${numFail} failing.`,
  };
}

export async function verifySignature(
  evmAddress: Address,
  messageData: MessageData,
  signature: Hex,
): Promise<boolean> {
  let signer: Address;
  if (typeof messageData === "string") {
    // TODO: Add typeguard for EIP712 typed data.
    try {
      // Just incase the message is typed data...
      const messageObject = JSON.parse(messageData);
      signer = await recoverTypedDataAddress({
        ...messageObject,
        signature,
      });
    } catch {
      signer = await recoverAddress({
        hash: hashMessage(
          isHex(messageData)
            ? hexToString(messageData)
            : (messageData as string),
        ),
        signature,
      });
    }
  } else {
    signer = await recoverTypedDataAddress({
      ...messageData,
      signature,
    });
  }
  return isAddressEqual(signer, evmAddress);
}
