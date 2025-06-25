import { NextResponse } from "next/server";
import { ACCOUNT_ID, PLUGIN_URL } from "../../config";

const chainIdParam = {
  name: "chainId",
  in: "query",
  required: true,
  description: "EVM Network (aka chain ID)",
  schema: { type: "number" },
  example: 100,
};

const addressParam = {
  name: "address",
  in: "query",
  required: true,
  description: "20 byte Ethereum address with 0x prefix",
  schema: { type: "string" },
};

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
          name: "numFail",
          description: "Number of failing transactions",
        },
        message: {
          name: "message",
          in: "query",
          required: true,
          description: "any text message",
          schema: { type: "string" },
          example: "Hello Bitte",
        },
        evmAddress: { ...addressParam, name: "evmAddress" },
      },
      responses: {
        SignRequestResponse200: {
          description:
            "Transaction Payload along with some additional metadata related to the transaction bytes.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  transaction: {
                    $ref: "#/components/schemas/SignRequest",
                  },
                  meta: {
                    type: "object",
                    description:
                      "Additional metadata related to the transaction",
                    additionalProperties: true,
                    example: {
                      message: "Order submitted successfully",
                    },
                  },
                },
                required: ["transaction"],
              },
            },
          },
        },
      },
      schemas: {
        Address: {
          description:
            "20 byte Ethereum address encoded as a hex with `0x` prefix.",
          type: "string",
          example: "0x6810e776880c02933d47db1b9fc05908e5386b96",
        },
        MetaTransaction: {
          description: "Sufficient data representing an EVM transaction",
          type: "object",
          properties: {
            to: {
              $ref: "#/components/schemas/Address",
              description: "Recipient address",
            },
            data: {
              type: "string",
              description: "Transaction calldata",
              example: "0xd0e30db0",
            },
            value: {
              type: "string",
              description: "Transaction value",
              example: "0x1b4fbd92b5f8000",
            },
          },
          required: ["to", "data", "value"],
        },
        SignRequest: {
          type: "object",
          required: ["method", "chainId", "params"],
          properties: {
            method: {
              type: "string",
              enum: [
                "eth_sign",
                "personal_sign",
                "eth_sendTransaction",
                "eth_signTypedData",
                "eth_signTypedData_v4",
              ],
              description: "The signing method to be used.",
              example: "eth_sendTransaction",
            },
            chainId: {
              type: "integer",
              description:
                "The ID of the Ethereum chain where the transaction or signing is taking place.",
              example: 100,
            },
            params: {
              oneOf: [
                {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/MetaTransaction",
                  },
                  description: "An array of Ethereum transaction parameters.",
                },
                {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Parameters for personal_sign request",
                  example: [
                    "0x4578616d706c65206d657373616765",
                    "0x0000000000000000000000000000000000000001",
                  ],
                },
                {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Parameters for eth_sign request",
                  example: [
                    "0x0000000000000000000000000000000000000001",
                    "0x4578616d706c65206d657373616765",
                  ],
                },
                {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description:
                    "Parameters for signing structured data (TypedDataParams)",
                  example: [
                    "0x0000000000000000000000000000000000000001",
                    '{"data": {"types": {"EIP712Domain": [{"name": "name","type": "string"}]}}}',
                  ],
                },
              ],
            },
          },
        },
      },
    },
  };

  return NextResponse.json(pluginData);
}
