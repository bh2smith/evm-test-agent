import { Router, Request, Response } from "express";
import { Hex } from "viem";
import { SendTransactionSchema } from "../../lib/schema";
import { buildSendTransactions } from "../../lib/logic";

const ethTxHandler = Router();

ethTxHandler.get("/", async (req: Request, res: Response) => {
  const search = new URLSearchParams(req.url);
  console.log("sendTransaction/", search);
  const { numFail, numSuccess, evmAddress, callData } =
    SendTransactionSchema.parse(Object.fromEntries(search.entries()));
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
