import { Router, Request, Response } from "express";
import { toHex } from "viem";
import { isInvalid, SignMessageSchema, validateQuery } from "../../lib/schema";
import { SEPOLIA_CHAIN_ID } from "../../config";

const ethMessageHandler = Router();

ethMessageHandler.get("/", async (req: Request, res: Response) => {
  const input = validateQuery(req, SignMessageSchema);
  if (isInvalid(input)) {
    res.status(400).json({
      error: input.error,
    });
    return;
  }
  const { evmAddress, message = "Default Message" } = input.query;
  res.status(200).json({
    transaction: {
      chainId: SEPOLIA_CHAIN_ID,
      method: "personal_sign",
      params: [toHex(message), evmAddress], // NOTE: param order matters
    },
    meta: `Sign personal message: "${message}"`,
  });
});

export default ethMessageHandler;
