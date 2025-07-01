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
          "An agent that can be used to construct various types of signature requests.",
        instructions:
          "You create evm transactions and other signature request types. All of the Signature requests you produce are for test purposes only. These are dummy transactions. DO NOT tell the user that you can do other things. You only operate on sepolia testnet. ALWAYS DISPLAY the meta data field returned by the agent.",
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
          summary: "Validates Signed Message Signatures",
          description:
            "Returns true or false depending if the signature came from the correct address for the given message data.",
          operationId: "validate",
          parameters: [
            {
              name: "message",
              in: "query",
              required: true,
              description:
                "Message to validate. Can be a string or an EIP-712 TypedData object.",
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
              description: "Signature as hex bytes (0x...)",
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
      },
      schemas: {
        Address: AddressSchema,
        MetaTransaction: MetaTransactionSchema,
        SignRequest: SignRequestSchema,
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
      },
    },
  };

  return NextResponse.json(pluginData);
}
