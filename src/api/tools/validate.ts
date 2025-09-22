import { Router, Request, Response } from "express";
import { SignatureValidationSchema } from "../../lib/schema";
import { verifySignature } from "../../lib/logic";

const ethMessageHandler = Router();

ethMessageHandler.get("/", async (req: Request, res: Response) => {
  const search = new URL(req.url).searchParams;
  console.log("validate/", search);
  const { evmAddress, message, signature } = SignatureValidationSchema.parse(
    Object.fromEntries(search.entries()),
  );
  const valid = await verifySignature(evmAddress, message, signature);
  res.status(200).json({ valid });
});

export default ethMessageHandler;
