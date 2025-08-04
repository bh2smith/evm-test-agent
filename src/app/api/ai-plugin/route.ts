import { NextResponse } from "next/server";
import { ACCOUNT_ID, PLUGIN_URL } from "../../config";
import {
  chainIdParam,
  addressParam,
  SignRequestResponse200,
  AddressSchema,
  MetaTransactionSchema,
  SignRequestSchema,
} from "@bitte-ai/agent-sdk";

export async function GET() {
  const pluginData = {
    openapi: "3.0.0",
    info: {
      title: "Test EVM Signature Schemes Agent",
      description: "API producing EVM signature request payloads",
      version: "1.0.0",
    },
    servers: [
      {
        url: PLUGIN_URL,
      },
    ],
    "x-mb": {
      "account-id": ACCOUNT_ID,
      assistant: {
        name: "Test EVM Transaction Agent",
        description:
          "An agent that constructs EVM signature requests and validates cryptographic signatures. Use the generate-evm-tx primitive to create signature requests for transactions, personal messages, or EIP-712 typed data. After a user signs a request, offer to validate the signature using the validate tool to verify authenticity.",
        instructions: `
          You create EVM transactions and signature requests using the generate-evm-tx primitive. 
          All signature requests are for test purposes only on Sepolia testnet. 
          When a user provides a signature, ALWAYS offer to validate it using the validate tool. 
          To validate a signature, you must provide three pieces of information: 
          1) REQUIRED: the original message/data that was signed, 
          2) REQUIRED: the Ethereum address that allegedly created the signature, and 
          3) REQUIRED: the signature itself (65-byte hex string starting with 0x). 
          ALWAYS DISPLAY the meta data field returned by the agent. 
        `,
        tools: [{ type: "generate-evm-tx" }],
        chainIds: [11155111],
      },
    },
    paths: {
      "/api/tools/sendTransaction": {
        get: {
          summary: "returns non-trivial sendTransaction payloads",
          description:
            "Constructs non-trivial, zero-valued transactions to self",
          operationId: "sendTransaction",
          parameters: [
            { $ref: "#/components/parameters/numSuccess" },
            { $ref: "#/components/parameters/numFail" },
            { $ref: "#/components/parameters/evmAddress" },
          ],
          responses: {
            "200": { $ref: "#/components/responses/SignRequestResponse200" },
          },
        },
      },
      "/api/tools/eth_sign": {
        get: {
          summary: "returns non-trivial eth_sign request",
          description:
            "Constructs eth_sign payload based on user's input message (to sign).",
          operationId: "eth_sign",
          parameters: [
            { $ref: "#/components/parameters/message" },
            { $ref: "#/components/parameters/evmAddress" },
          ],
          responses: {
            "200": { $ref: "#/components/responses/SignRequestResponse200" },
          },
        },
      },
      "/api/tools/personal_sign": {
        get: {
          summary: "returns non-trivial eth_sign request",
          description:
            "Constructs personal_sign payload based on user's input message (to sign).",
          operationId: "personal_sign",
          parameters: [
            { $ref: "#/components/parameters/message" },
            { $ref: "#/components/parameters/evmAddress" },
          ],
          responses: {
            "200": { $ref: "#/components/responses/SignRequestResponse200" },
          },
        },
      },
      "/api/tools/eth_signTypedData": {
        get: {
          summary: "returns non-trivial eth_signTypedData request.",
          description:
            "Constructs signable (expired) eth_signTypedData payload.",
          operationId: "eth_signTypedData",
          parameters: [{ $ref: "#/components/parameters/evmAddress" }],
          responses: {
            "200": { $ref: "#/components/responses/SignRequestResponse200" },
          },
        },
      },
      "/api/tools/validate": {
        get: {
          summary: "Validates EVM signature authenticity",
          description:
            "Verifies that a cryptographic signature was created by the specified Ethereum address for the given message or typed data. Returns true if the signature is valid and was created by the provided address, false otherwise. This endpoint supports both plain text messages and EIP-712 structured data.",
          operationId: "validate",
          parameters: [
            {
              name: "message",
              in: "query",
              required: true,
              description:
                "The original message or data that was signed. For plain text messages, provide a string. For EIP-712 typed data, provide a JSON object with 'domain', 'types', 'message', and 'primaryType' fields. This must be the exact same data that was originally signed.",
              schema: {
                oneOf: [
                  { type: "string" },
                  { $ref: "#/components/schemas/TypedData" },
                ],
              },
            },
            { $ref: "#/components/parameters/evmAddress" },
            {
              name: "signature",
              in: "query",
              required: true,
              description:
                "The cryptographic signature to validate. Must be a 65-byte hex string starting with '0x' (e.g., '0x1234...'). This signature should have been created by signing the provided message with the private key corresponding to the evmAddress.",
              schema: {
                type: "string",
                pattern: "^0x[a-fA-F0-9]+$",
              },
            },
          ],
          responses: {
            "200": {
              description: "Validation result",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      valid: { type: "boolean" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/cow-quote": {
        get: {
          summary: "Returns CoW Swap Quote Data",
          description: "",
          operationId: "cow-quote",
          parameters: [],
          responses: {
            "200": { $ref: "#/components/responses/QuoteResponse200" },
          },
        },
      },
    },
    components: {
      parameters: {
        chainId: chainIdParam,
        numSuccess: {
          ...chainIdParam,
          name: "numSuccess",
          description: "Number of successful transactions",
        },
        numFail: {
          ...chainIdParam,
          required: false,
          name: "numFail",
          description: "Number of failing transactions",
        },
        message: {
          name: "message",
          in: "query",
          required: false,
          description: "any text message",
          schema: { type: "string" },
          example: "Hello Bitte",
        },
        evmAddress: { ...addressParam, name: "evmAddress" },
        signature: { ...addressParam, name: "signature" },
      },
      responses: {
        SignRequestResponse200,
        QuoteResponse200: {
          description: "Quote response including metadata and transaction",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  meta: {
                    type: "object",
                    properties: {
                      quote: {
                        $ref: "#/components/schemas/OrderQuoteResponse",
                      },
                      ui: { $ref: "#/components/schemas/SwapFTData" },
                    },
                    required: ["quote", "ui"],
                  },
                  transaction: { $ref: "#/components/schemas/SignRequest" },
                },
                required: ["meta", "transaction"],
              },
            },
          },
        },
      },
      schemas: {
        Address: AddressSchema,
        MetaTransaction: MetaTransactionSchema,
        SignRequest: SignRequestSchema,
        SwapFTData: {
          type: "object",
          description: "UI data for swap widget",
          additionalProperties: true,
        },
        TypedData: {
          type: "object",
          description: "EIP-712 TypedData object",
          required: ["types", "primaryType", "domain", "message"],
          properties: {
            types: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: {
                  type: "object",
                  required: ["name", "type"],
                  properties: {
                    name: { type: "string" },
                    type: { type: "string" },
                  },
                },
              },
            },
            primaryType: { type: "string" },
            domain: { type: "object" },
            message: { type: "object" },
          },
        },
        OrderParameters: {
          description: "Order parameters.",
          type: "object",
          properties: {
            sellToken: {
              description: "ERC-20 token to be sold.",
              allOf: [{ $ref: "#/components/schemas/Address" }],
            },
            buyToken: {
              description: "ERC-20 token to be bought.",
              allOf: [{ $ref: "#/components/schemas/Address" }],
            },
            receiver: {
              description:
                "An optional Ethereum address to receive the proceeds of the trade instead of the owner (i.e. the order signer).",
              allOf: [{ $ref: "#/components/schemas/Address" }],
              nullable: true,
            },
            sellAmount: {
              description: "Amount of `sellToken` to be sold in atoms.",
              allOf: [{ $ref: "#/components/schemas/TokenAmount" }],
            },
            buyAmount: {
              description: "Amount of `buyToken` to be bought in atoms.",
              allOf: [{ $ref: "#/components/schemas/TokenAmount" }],
            },
            validTo: {
              description:
                "Unix timestamp (`uint32`) until which the order is valid.",
              type: "integer",
            },
            appData: {
              $ref: "#/components/schemas/AppDataHash",
            },
            feeAmount: {
              description: "feeRatio * sellAmount + minimal_fee in atoms.",
              allOf: [{ $ref: "#/components/schemas/TokenAmount" }],
            },
            kind: {
              description: "The kind is either a buy or sell order.",
              allOf: [{ $ref: "#/components/schemas/OrderKind" }],
            },
            partiallyFillable: {
              description: "Is the order fill-or-kill or partially fillable?",
              type: "boolean",
            },
            sellTokenBalance: {
              allOf: [{ $ref: "#/components/schemas/SellTokenSource" }],
              default: "erc20",
            },
            buyTokenBalance: {
              allOf: [{ $ref: "#/components/schemas/BuyTokenDestination" }],
              default: "erc20",
            },
            signingScheme: {
              allOf: [{ $ref: "#/components/schemas/SigningScheme" }],
              default: "eip712",
            },
          },
          required: [
            "sellToken",
            "buyToken",
            "sellAmount",
            "buyAmount",
            "validTo",
            "appData",
            "feeAmount",
            "kind",
            "partiallyFillable",
          ],
        },
        AppData: {
          description:
            "The string encoding of a JSON object representing some `appData`. The format of the JSON expected in the `appData` field is defined [here](https://github.com/cowprotocol/app-data).",
          type: "string",
          example: '{"version":"0.9.0","metadata":{}}',
        },
        AppDataHash: {
          description:
            "32 bytes encoded as hex with `0x` prefix. It's expected to be the hash of the stringified JSON object representing the `appData`.",
          type: "string",
        },
        SellTokenSource: {
          description: "Where should the `sellToken` be drawn from?",
          type: "string",
          enum: ["erc20", "internal", "external"],
        },
        BuyTokenDestination: {
          description: "Where should the `buyToken` be transferred to?",
          type: "string",
          enum: ["erc20", "internal"],
        },
        PriceQuality: {
          description:
            "How good should the price estimate be?\n\nFast: The price estimate is chosen among the fastest N price estimates.\nOptimal: The price estimate is chosen among all price estimates.\nVerified: The price estimate is chosen among all verified/simulated price estimates.\n\n**NOTE**: Orders are supposed to be created from `verified` or `optimal` price estimates.",
          type: "string",
          enum: ["fast", "optimal", "verified"],
        },
        OrderPostError: {
          type: "object",
          properties: {
            errorType: {
              type: "string",
              enum: [
                "DuplicatedOrder",
                "QuoteNotFound",
                "QuoteNotVerified",
                "InvalidQuote",
                "MissingFrom",
                "WrongOwner",
                "InvalidEip1271Signature",
                "InsufficientBalance",
                "InsufficientAllowance",
                "InvalidSignature",
                "SellAmountOverflow",
                "TransferSimulationFailed",
                "ZeroAmount",
                "IncompatibleSigningScheme",
                "TooManyLimitOrders",
                "TooMuchGas",
                "UnsupportedBuyTokenDestination",
                "UnsupportedSellTokenSource",
                "UnsupportedOrderType",
                "InsufficientValidTo",
                "ExcessiveValidTo",
                "InvalidNativeSellToken",
                "SameBuyAndSellToken",
                "UnsupportedToken",
                "InvalidAppData",
                "AppDataHashMismatch",
                "AppdataFromMismatch",
                "OldOrderActivelyBidOn",
              ],
            },
            description: {
              type: "string",
            },
          },
          required: ["errorType", "description"],
        },
        SigningScheme: {
          description: "How was the order signed?",
          type: "string",
          enum: ["eip712", "ethsign", "presign", "eip1271"],
        },
        EcdsaSigningScheme: {
          description: "How was the order signed?",
          type: "string",
          enum: ["eip712", "ethsign"],
        },
        Signature: {
          description: "A signature.",
          oneOf: [
            { $ref: "#/components/schemas/EcdsaSignature" },
            { $ref: "#/components/schemas/PreSignature" },
          ],
        },
        EcdsaSignature: {
          description:
            "65 bytes encoded as hex with `0x` prefix. `r || s || v` from the spec.",
          type: "string",
          example:
            "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        },
        PreSignature: {
          description: 'Empty signature bytes. Used for "presign" signatures.',
          type: "string",
          example: "0x",
        },
        OrderQuoteRequest: {
          description: "Request fee and price quote.",
          allOf: [
            { $ref: "#/components/schemas/OrderQuoteSide" },
            { $ref: "#/components/schemas/OrderQuoteValidity" },
            {
              type: "object",
              properties: {
                sellToken: {
                  description: "ERC-20 token to be sold",
                  allOf: [{ $ref: "#/components/schemas/Address" }],
                },
                buyToken: {
                  description: "ERC-20 token to be bought",
                  allOf: [{ $ref: "#/components/schemas/Address" }],
                },
                receiver: {
                  description:
                    "An optional address to receive the proceeds of the trade instead of the `owner` (i.e. the order signer).",
                  allOf: [{ $ref: "#/components/schemas/Address" }],
                  nullable: true,
                },
                appData: {
                  description:
                    "AppData which will be assigned to the order. Expects either a string JSON doc as defined on [AppData](https://github.com/cowprotocol/app-data) or a hex encoded string for backwards compatibility. When the first format is used, it's possible to provide the derived appDataHash field.",
                  oneOf: [
                    { $ref: "#/components/schemas/AppData" },
                    { $ref: "#/components/schemas/AppDataHash" },
                  ],
                },
                appDataHash: {
                  description:
                    "The hash of the stringified JSON appData doc. If present, `appData` field must be set with the aforementioned data where this hash is derived from. In case they differ, the call will fail.",
                  anyOf: [{ $ref: "#/components/schemas/AppDataHash" }],
                },
                sellTokenBalance: {
                  allOf: [{ $ref: "#/components/schemas/SellTokenSource" }],
                  default: "erc20",
                },
                buyTokenBalance: {
                  allOf: [{ $ref: "#/components/schemas/BuyTokenDestination" }],
                  default: "erc20",
                },
                from: { $ref: "#/components/schemas/Address" },
                priceQuality: {
                  allOf: [{ $ref: "#/components/schemas/PriceQuality" }],
                  default: "verified",
                },
                signingScheme: {
                  allOf: [{ $ref: "#/components/schemas/SigningScheme" }],
                  default: "eip712",
                },
                onchainOrder: {
                  description:
                    "Flag to signal whether the order is intended for on-chain order placement. Only valid for non ECDSA-signed orders.",
                  default: false,
                },
                network: {
                  description:
                    "The network on which the order is to be placed.",
                  type: "string",
                  enum: ["mainnet", "xdai", "arbitrum_one"],
                },
              },
              required: ["sellToken", "buyToken", "from"],
            },
          ],
        },
        OrderQuoteResponse: {
          type: "object",
          description: "Response for Quote from CoW Orderbook API",
          properties: {
            quote: { $ref: "#/components/schemas/OrderParameters" },
            from: { $ref: "#/components/schemas/Address" },
            expiration: {
              description:
                "Expiration date of the offered fee. Order service might not accept the fee after this expiration date. Encoded as ISO 8601 UTC.",
              type: "string",
              example: "1985-03-10T18:35:18.814523Z",
            },
            id: {
              description:
                "Quote ID linked to a quote to enable providing more metadata when analysing order slippage.",
              type: "integer",
            },
            verified: {
              description:
                "Whether it was possible to verify that the quoted amounts are accurate using a simulation.",
              type: "boolean",
            },
          },
          required: ["quote", "expiration", "verified"],
        },
        PriceEstimationError: {
          type: "object",
          properties: {
            errorType: {
              type: "string",
              enum: [
                "QuoteNotVerified",
                "UnsupportedToken",
                "ZeroAmount",
                "UnsupportedOrderType",
              ],
            },
            description: { type: "string" },
          },
          required: ["errorType", "description"],
        },
        OrderKind: {
          description: "Is this order a buy or sell?",
          type: "string",
          enum: ["buy", "sell"],
        },
        OrderCreation: {
          description: "Data a user provides when creating a new order.",
          type: "object",
          properties: {
            sellToken: {
              description: "see `OrderParameters::sellToken`",
              allOf: [{ $ref: "#/components/schemas/Address" }],
            },
            buyToken: {
              description: "see `OrderParameters::buyToken`",
              allOf: [{ $ref: "#/components/schemas/Address" }],
            },
            receiver: {
              description: "see `OrderParameters::receiver`",
              allOf: [{ $ref: "#/components/schemas/Address" }],
              nullable: true,
            },
            sellAmount: {
              description: "see `OrderParameters::sellAmount`",
              allOf: [{ $ref: "#/components/schemas/TokenAmount" }],
            },
            buyAmount: {
              description: "see `OrderParameters::buyAmount`",
              allOf: [{ $ref: "#/components/schemas/TokenAmount" }],
            },
            validTo: {
              description: "see `OrderParameters::validTo`",
              type: "integer",
            },
            feeAmount: {
              description: "see `OrderParameters::feeAmount`",
              allOf: [{ $ref: "#/components/schemas/TokenAmount" }],
            },
            kind: {
              description: "see `OrderParameters::kind`",
              allOf: [{ $ref: "#/components/schemas/OrderKind" }],
            },
            partiallyFillable: {
              description: "see `OrderParameters::partiallyFillable`",
              type: "boolean",
            },
            sellTokenBalance: {
              description: "see `OrderParameters::sellTokenBalance`",
              allOf: [{ $ref: "#/components/schemas/SellTokenSource" }],
              default: "erc20",
            },
            buyTokenBalance: {
              description: "see `OrderParameters::buyTokenBalance`",
              allOf: [{ $ref: "#/components/schemas/BuyTokenDestination" }],
              default: "erc20",
            },
            signingScheme: {
              $ref: "#/components/schemas/SigningScheme",
            },
            signature: {
              $ref: "#/components/schemas/Signature",
            },
            from: {
              description: "Ensures the decoded signer matches this address",
              allOf: [{ $ref: "#/components/schemas/Address" }],
              nullable: true,
            },
            quoteId: {
              description: "Optional quote ID for slippage analysis.",
              type: "integer",
              nullable: true,
            },
            appData: {
              description:
                "Arbitrary app-specific metadata; must be valid JSON string.",
              anyOf: [
                {
                  title: "Full App Data",
                  allOf: [{ $ref: "#/components/schemas/AppData" }],
                  description:
                    "A JSON string that gets hashed and signed. Use '{}' and match hash when unsure.",
                  type: "string",
                },
                { $ref: "#/components/schemas/AppDataHash" },
              ],
            },
            appDataHash: {
              description: "Optional hash of appData for verification.",
              allOf: [{ $ref: "#/components/schemas/AppDataHash" }],
              nullable: true,
            },
          },
          required: [
            "sellToken",
            "buyToken",
            "sellAmount",
            "buyAmount",
            "validTo",
            "appData",
            "feeAmount",
            "kind",
            "partiallyFillable",
            "signingScheme",
            "signature",
          ],
        },
        OrderQuoteSide: {
          description: "The buy or sell side when quoting an order.",
          oneOf: [
            {
              type: "object",
              description:
                "Quote a sell order given the final total `sellAmount` including fees.",
              properties: {
                kind: {
                  allOf: [
                    {
                      $ref: "#/components/schemas/OrderQuoteSideKindSell",
                    },
                  ],
                },
                sellAmountBeforeFee: {
                  description:
                    "The total amount that is available for the order. From this value, the fee is deducted and the buy amount is calculated.",
                  allOf: [
                    {
                      $ref: "#/components/schemas/TokenAmount",
                    },
                  ],
                },
              },
              required: ["kind", "sellAmountBeforeFee"],
            },
            {
              type: "object",
              description: "Quote a sell order given the `sellAmount`.",
              properties: {
                kind: {
                  allOf: [
                    {
                      $ref: "#/components/schemas/OrderQuoteSideKindSell",
                    },
                  ],
                },
                sellAmountAfterFee: {
                  description: "The `sellAmount` for the order.",
                  allOf: [
                    {
                      $ref: "#/components/schemas/TokenAmount",
                    },
                  ],
                },
              },
              required: ["kind", "sellAmountAfterFee"],
            },
            {
              type: "object",
              description: "Quote a buy order given an exact `buyAmount`.",
              properties: {
                kind: {
                  allOf: [
                    {
                      $ref: "#/components/schemas/OrderQuoteSideKindBuy",
                    },
                  ],
                },
                buyAmountAfterFee: {
                  description: "The `buyAmount` for the order.",
                  allOf: [
                    {
                      $ref: "#/components/schemas/TokenAmount",
                    },
                  ],
                },
              },
              required: ["kind", "buyAmountAfterFee"],
            },
          ],
        },
        OrderQuoteSideKindSell: {
          type: "string",
          enum: ["sell"],
        },
        OrderQuoteSideKindBuy: {
          type: "string",
          enum: ["buy"],
        },
        TokenAmount: {
          description: "Amount of a token. `uint256` encoded in decimal.",
          type: "string",
          example: "1234567890",
        },
        OrderQuoteValidity: {
          description: "The validity for the order.",
          oneOf: [
            {
              type: "object",
              description: "Absolute validity.",
              properties: {
                validTo: {
                  description:
                    "Unix timestamp (`uint32`) until which the order is valid.",
                  type: "integer",
                },
              },
            },
            {
              type: "object",
              description: "Relative validity",
              properties: {
                validFor: {
                  description:
                    "Number (`uint32`) of seconds that the order should be valid for.",
                  type: "integer",
                },
              },
            },
          ],
        },
      },
    },
  };

  return NextResponse.json(pluginData);
}
