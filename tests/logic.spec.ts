import { buildSendTransactions, verifySignature } from "@/src/app/api/logic";
import { SignRequestSchema } from "@bitte-ai/agent-sdk";
import { randomBytes } from "crypto";
import {
  createWalletClient,
  Hex,
  http,
  hexToBigInt,
  toHex,
  recoverTransactionAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

interface EthTransactionParams {
  from: Hex;
  to: Hex;
  gas?: Hex;
  value?: Hex;
  data?: Hex;
}

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
    SignRequestSchema;
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

  it("builds transaction with default values", async () => {
    const { transaction } = buildSendTransactions(account.address, 1);
    SignRequestSchema;
    const transactions = transaction.params as EthTransactionParams[];
    expect(transactions).toStrictEqual([
      {
        data: "0x1",
        from: "0x0000000000000000000000000000000000000000",
        to: account.address,
        value: "0x00",
      },
    ]);
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

  it("signMessage: Hello", async () => {
    const evmAddress = "0xB00b4C1e371DEe4F6F32072641430656D3F7c064";
    const message = "0x68656c6c6f";
    const signature =
      "0x20be843ed0fff5e493b9f72a852b8b9b46b14818f9189596233393807d122f4a05ed462315a192ebffa2b771b37f18be2ab9fbf53e0f45b824c50d9ac10c01361b";
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

  it("CoW: signTypedData", async () => {
    const message =
      '{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Order":[{"name":"sellToken","type":"address"},{"name":"buyToken","type":"address"},{"name":"receiver","type":"address"},{"name":"sellAmount","type":"uint256"},{"name":"buyAmount","type":"uint256"},{"name":"validTo","type":"uint32"},{"name":"appData","type":"bytes32"},{"name":"feeAmount","type":"uint256"},{"name":"kind","type":"string"},{"name":"partiallyFillable","type":"bool"},{"name":"sellTokenBalance","type":"string"},{"name":"buyTokenBalance","type":"string"}]},"domain":{"name":"Gnosis Protocol","version":"v2","chainId":100,"verifyingContract":"0x9008D19f58AAbD9eD0D60971565AA8510560ab41"},"primaryType":"Order","message":{"sellToken":"0x9c58bacc331c9aa871afd802db6379a98e80cedb","buyToken":"0x177127622c4a00f3d409b75571e12cb3c8973d3c","receiver":"0x7f01d9b227593e033bf8d6fc86e634d27aa85568","sellAmount":"9999999999996911424","buyAmount":"3989346271524365385328","validTo":1751464539,"appData":"0x0000000000000000000000000000000000000000000000000000000000000000","feeAmount":"3088576","kind":"sell","partiallyFillable":false,"sellTokenBalance":"erc20","buyTokenBalance":"erc20","signingScheme":"eip712"}}';
    const valid = await verifySignature(
      "0x7f01D9b227593E033bf8d6FC86e634d27aa85568",
      message,
      "0x68a014d8a9a48229b4e34e52e55239664fdc688ee0b60f1c5358a0575148e43c6f5c60547dabe0e1b5aa3c1cfc0115442957fb5ac6b14004f1e438c7577b05261b",
    );
    expect(valid).toBe(true);
  });
});
