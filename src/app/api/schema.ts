import { z } from "zod";
import { Address, isAddress } from "viem";

const evmAddressSchema = z.custom<Address>(
  (val) => {
    return typeof val === "string" && isAddress(val, { strict: false });
  },
  {
    message: "Invalid EVM address",
  },
);

export const SignMessageSchema = z.object({
  evmAddress: evmAddressSchema,
  message: z.string().optional(),
});

export const SendTransactionSchema = z.object({
  numSuccess: z.coerce.number().int().min(1, "numTxs must be at least 1"),
  numFail: z.coerce
    .number()
    .int()
    .min(0, "numTxs must be at least 0")
    .default(0),
  callData: z
    .string()
    .startsWith("0x")
    .refine((sig) => /^0x[0-9a-fA-F]{130}$/.test(sig), {
      message: "Invalid hex signature format",
    })
    .optional(),
  evmAddress: evmAddressSchema,
});

// Accept either a full 65-byte hex string or separate r/s/v
const signatureSchema = z.union([
  z
    .string()
    .startsWith("0x")
    .refine((sig) => /^0x[0-9a-fA-F]{130}$/.test(sig), {
      message: "Invalid hex signature format",
    }),
  z.object({
    r: z.string().startsWith("0x").length(66),
    s: z.string().startsWith("0x").length(66),
    v: z.union([
      z.number().int().min(27).max(28),
      z.string().startsWith("0x").length(4), // e.g. "0x1b" or "0x1c"
    ]),
  }),
]);

// Message data: either a plain string or EIP-712 object
const messageDataSchema = z.union([
  z.string(), // plain message
  z.object({
    domain: z.record(z.string(), z.unknown()),
    types: z.record(z.string(), z.any()),
    message: z.record(z.string(), z.unknown()),
    primaryType: z.string(),
  }),
]);

// Full payload
export const SignatureValidationSchema = z.object({
  evmAddress: evmAddressSchema,
  signature: signatureSchema,
  message: messageDataSchema,
});

export type MessageData = z.infer<typeof messageDataSchema>;
