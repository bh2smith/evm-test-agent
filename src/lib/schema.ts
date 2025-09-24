import { z } from "zod";
import { Address, isAddress, toHex } from "viem";

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
    .refine((sig) => /^0x[0-9a-fA-F]*$/.test(sig), {
      message: "Invalid hex signature format",
    })
    .optional(),
  evmAddress: evmAddressSchema,
});

// Accept either a full 65-byte hex string or separate r/s/v
const signatureSchema = z
  .string()
  .startsWith("0x")
  .refine((sig) => /^0x[0-9a-fA-F]{130}$/.test(sig), {
    message: "Invalid hex signature format",
  })
  .transform((x) => toHex(x));

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

export type ValidationResult<T> =
  | { ok: true; query: T }
  | { ok: false; error: object };

export function validateQuery<T extends z.ZodType>(
  req: { url: string },
  schema: T,
): ValidationResult<z.infer<T>> {
  console.log("Raw request", req.url);
  if (req.url.startsWith("/?")) {
    req.url = req.url.slice(2);
  }
  const params = new URLSearchParams(req.url);
  console.log("params", params);
  const result = schema.safeParse(Object.fromEntries(params.entries()));
  console.log("parsed query", result);
  if (!result.success) {
    return { ok: false as const, error: z.treeifyError(result.error) };
  }
  return { ok: true as const, query: result.data };
}

export function isInvalid<T>(
  result: ValidationResult<T>,
): result is { ok: false; error: object } {
  return result.ok === false;
}
