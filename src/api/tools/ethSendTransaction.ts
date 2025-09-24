import { Router, Request, Response } from "express";
import { Hex } from "viem";
import {
  isInvalid,
  SendTransactionSchema,
  validateQuery,
} from "../../lib/schema";
import { buildSendTransactions } from "../../lib/logic";

const ethTxHandler = Router();

ethTxHandler.get("/", async (req: Request, res: Response) => {
  const input = validateQuery(req, SendTransactionSchema);
  if (isInvalid(input)) {
    res.status(400).json({
      error: input.error,
    });
    return;
  }
  const { numFail, numSuccess, evmAddress, callData } = input.query;
  const result = buildSendTransactions(
    evmAddress,
    numSuccess,
    numFail,
    (callData as Hex) || null,
  );
  console.log("Response", JSON.stringify(result));
  res.status(200).json(result);
});

export default ethTxHandler;
