import { ACCOUNT_ID, PLUGIN_URL } from "../config";
import {
  chainIdParam,
  addressParam,
  SignRequestResponse200,
  AddressSchema,
  MetaTransactionSchema,
  SignRequestSchema,
} from "@bitte-ai/agent-sdk";

const manifest = {
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
          Specifically, the success responses for tool sendTransaction, eth_sign, personal_sign and eth_signTypedData should trigger generate-evm-tx.
          After a message or typed data is signed, pass the message, evmAddress and signature back into the validate tool.
          To validate a signature, you must provide three pieces of information: 
          1) REQUIRED: the original message/data that was signed, 
          2) REQUIRED: the Ethereum address that allegedly created the signature, and 
          3) REQUIRED: the signature itself (65-byte hex string starting with 0x). 
          Only validate signatures once unless explicitly requested to try again.
        `,
      tools: [{ type: "generate-evm-tx" }],
      chainIds: [11155111],
    },
  },
  paths: {
    "/api/tools/sendTransaction": {
      get: {
        summary: "returns non-trivial sendTransaction payloads",
        description: "Constructs non-trivial, zero-valued transactions to self",
        operationId: "sendTransaction",
        parameters: [
          { $ref: "#/components/parameters/numSuccess" },
          { $ref: "#/components/parameters/numFail" },
          { $ref: "#/components/parameters/callData" },
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
        description: "Constructs signable (expired) eth_signTypedData payload.",
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
        description: `
            Verifies that a cryptographic signature was created by the specified Ethereum address for the given message or typed data. 
            Returns true if the signature is valid and was created by the provided address, false otherwise. 
            This endpoint supports both plain text messages and EIP-712 structured data.
            All input parameters are required: message, evmAddress and signature!
          `,
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
      callData: {
        name: "callData",
        in: "query",
        required: false,
        description:
          "Hex String with even length representing transaction call data.",
        schema: { type: "string" },
        example: "0x80081E5",
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
      }
    },
  },
};

export default manifest;
