import { Router, Request, Response } from "express";
import { toHex } from "viem";
import { SignMessageSchema } from "../../lib/schema";
import { SEPOLIA_CHAIN_ID } from "../../config";

const ethSignHandler = Router();

ethSignHandler.get("/", async (req: Request, res: Response) => {
  const search = new URLSearchParams(req.url);
  console.log("eth_sign/", search);
  const input = SignMessageSchema.parse(Object.fromEntries(search.entries()));
  const { evmAddress, message = "Default Message" } = input;
  res.status(200).json({
    transaction: {
      chainId: SEPOLIA_CHAIN_ID,
      method: "eth_sign",
      params: [evmAddress, toHex(message)],
    },
    meta: `Sign message "${message}" with ${evmAddress}`,
  });
});

export default ethSignHandler;
