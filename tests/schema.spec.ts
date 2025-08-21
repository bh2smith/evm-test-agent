import { normalizeSignature } from "@/src/app/api/logic";
import { SendTransactionSchema, SignatureValidationSchema } from "@/src/app/api/schema";

describe("verifySignature", () => {
  it("signMessage", async () => {
    const params = {
      evmAddress: "0x8d99F8b2710e6A3B94d9bf465A98E5273069aCBd",
      signature:
        "0x9847aa89433081329c2187cc0194af48bd228aa612795a6a147fada2c5a12cdc0c885f70b321b1d44337b79ce885b78150324b5875e774e12a39932e986f318b1b",
      message: "beer",
    };
    SignatureValidationSchema.parse(params);
  });

    it("sendTransaction", async () => {
    const params = {
      evmAddress: "0x8d99F8b2710e6A3B94d9bf465A98E5273069aCBd",
      numSuccess: 2,
      numFail: 0,
      callData: "0x",
    };
    SendTransactionSchema.parse(params);
  });
});
