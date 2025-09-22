import { Router, Request, Response } from "express";
import { SignMessageSchema } from "../../lib/schema";
import { SEPOLIA_CHAIN_ID } from "../../config";

const ethTypedData = Router();

ethTypedData.get("/", async (req: Request, res: Response) => {
  const search = new URLSearchParams(req.url);
  console.log("eth_signTypedData/", search);
  const { evmAddress } = SignMessageSchema.parse(
    Object.fromEntries(search.entries()),
  );

  const dataString = JSON.stringify({
    domain: {
      name: "Bitte Test EVM Agent",
      version: "1",
      chainId: SEPOLIA_CHAIN_ID,
      verifyingContract: "0x0000000000000000000000000000000000000000",
    },
    types: {
      Access: [
        { name: "user", type: "address" },
        { name: "action", type: "string" },
        { name: "expires", type: "uint256" },
        { name: "note", type: "string" },
      ],
    },
    primaryType: "Access",
    message: {
      user: evmAddress,
      action: "DEMO SIGNATURE — NOT USABLE",
      expires: 0,
      note: "This signature is expired and only for testing/demo purposes.",
    },
  });
  res.status(200).json({
    transaction: {
      chainId: SEPOLIA_CHAIN_ID,
      method: "eth_signTypedData_v4",
      params: [evmAddress, dataString],
    },
    meta: `Sign Dummy Typed Data.`,
  });
});

export default ethTypedData;
