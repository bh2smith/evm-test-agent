import { z } from "zod";
import { Address, isAddress } from "viem";

const evmAddressSchema = z.string().refine(
  (val): val is Address => isAddress(val, {strict: false}),
  { message: "Invalid EVM address" }
);

export const SignMessageSchema = z.object({
  evmAddress: evmAddressSchema,
  message: z.string().optional(),
});

export const SendTransactionSchema = z.object({
  numTxs: z.coerce.number().int().min(1, "numTxs must be at least 1"),
  evmAddress: evmAddressSchema,
});

