import { buildSendTransactions, verifySignature } from "@/src/app/api/logic";
import { randomBytes } from "crypto";
import { EthTransactionParams } from "near-ca";
import {
  createWalletClient,
  http,
  hexToBigInt,
  toHex,
  recoverTransactionAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

let account: ReturnType<typeof privateKeyToAccount>;
let walletClient: ReturnType<typeof createWalletClient>;

beforeAll(() => {
  const randomPrivateKey = toHex(randomBytes(32));
  account = privateKeyToAccount(randomPrivateKey);

  walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
  });
});

describe("buildSendTransactions", () => {
  it("builds a valid sign request and signs it with a fresh private key", async () => {
    // Call the builder
    const numTxs = 3;
    const { transaction } = buildSendTransactions(account.address, numTxs);

    const transactions = transaction.params as EthTransactionParams[];
    // Sign each transaction in the request (simulate)
    const signatures = await Promise.all(
      transactions.map((tx) =>
        walletClient.signTransaction({
          chain: sepolia,
          account,
          to: tx.to,
          data: tx.data,
          value: hexToBigInt(tx.value || "0x00"),
          // Extra Required Tx Data (to Sign)
          type: "eip1559",
          maxFeePerGas: BigInt(10_000_000_000), // 10 gwei
          maxPriorityFeePerGas: BigInt(1_500_000_000), // 1.5 gwei
          gas: BigInt(25_000),
        }),
      ),
    );

    // Validate each signature by recovering the address
    const recoveredAddresses = await Promise.all(
      signatures.map((signedTx) =>
        recoverTransactionAddress({
          serializedTransaction: signedTx as `0x02${string}`,
        }),
      ),
    );

    // Assertions
    expect(transactions).toHaveLength(numTxs);
    expect(recoveredAddresses.every((a) => a === account.address)).toBe(true);
  });
});

describe("verifySignature", () => {
  it("signMessage", async () => {
    const evmAddress = account.address;
    const message = "Hello Joe";
    const signature = await account.signMessage({ message });
    const valid = await verifySignature(evmAddress, message, signature);
    expect(valid).toBe(true);
  });

  it("signTypedData", async () => {
    const typedData = {
      types: {
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "string" },
        ],
      },
      primaryType: "Mail",
      domain: {
        name: "Ether Mail",
        version: "1",
        chainId: 1,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      },
      message: {
        from: {
          name: "Cow",
          wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        },
        to: {
          name: "Bob",
          wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        },
        contents: "Hello, Bob!",
      },
    } as const;
    const signature = await account.signTypedData(typedData);
    const valid = await verifySignature(account.address, typedData, signature);
    expect(valid).toBe(true);
  });
});
