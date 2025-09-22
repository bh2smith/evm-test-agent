import { Router, Request, Response } from "express";
import { toHex } from "viem";
import { SignMessageSchema } from "../../lib/schema";
import { SEPOLIA_CHAIN_ID } from "../../config";

const ethMessageHandler = Router();

ethMessageHandler.get("/", async (req: Request, res: Response) => {
  const search = new URLSearchParams(req.url);
  console.log("personal_sign/", search);
  const input = SignMessageSchema.parse(Object.fromEntries(search.entries()));
  const { evmAddress, message = "Default Message" } = input;
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
