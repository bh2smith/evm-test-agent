import { Router, Request, Response } from "express";
import {
  SignatureValidationSchema,
  validateQuery,
  isInvalid,
} from "../../lib/schema";
import { verifySignature } from "../../lib/logic";

const ethMessageHandler = Router();

ethMessageHandler.get("/", async (req: Request, res: Response) => {
  const input = validateQuery(req, SignatureValidationSchema);
  if (isInvalid(input)) {
    res.status(400).json({
      error: input.error,
    });
    return;
  }
  const { evmAddress, message, signature } = input.query;
  const valid = await verifySignature(evmAddress, message, signature);
  res.status(200).json({ valid });
});

export default ethMessageHandler;
