import { Address, Chain, getAddress } from "viem";
import { Network } from "x402-next";
import {
  FacilitatorConfig,
  PaywallConfig,
  RouteConfig,
  PaymentRequirementsSchema,
} from "x402/types";
import { facilitator } from "@coinbase/x402";
import { toJsonSafe, processPriceToAtomicAmount } from "x402/shared";
import { NextResponse } from "next/server";
import {
  base,
  baseSepolia,
  avalanche,
  avalancheFuji,
  iotex,
} from "viem/chains";
import { randomBytes } from "crypto";
import { EthSignTypedDataRequest, SignRequest } from "@bitte-ai/types";

const useCdpFacilitator = process.env.USE_CDP_FACILITATOR === "true";
// TODO: Use wallet here (PK) for refund issuance.
const payTo = (process.env.ADDRESS ||
  "0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA") as Address;
const network = (process.env.NETWORK || "base") as Network;

// Configure facilitator
const facilitatorConfig = useCdpFacilitator ? facilitator : undefined;

interface X402Config {
  payTo: Address;
  // Note that x402 Routes Config is not well-defined.
  routes: Record<string, RouteConfig>;
  facilitatorConfig?: FacilitatorConfig;
  paywall?: PaywallConfig;
}

export const paywallConfig: X402Config = {
  payTo,
  routes: {
    "/api/tools/protected/cheap": {
      price: "$0.001",
      network,
      config: {
        description: "Protected API endpoint",
      },
    },
    "/api/tools/protected/spensiv": {
      price: "$0.01",
      network,
      config: {
        description: "Protected API endpoint",
      },
    },
  },
  facilitatorConfig,
  paywall: {
    appName: "x402 Protected Route",
    appLogo: "/x402-icon-blue.png",
  },
};

export function getPricePlan(): NextResponse {
  const { payTo, routes } = paywallConfig;
  const accepts: Record<string, object> = {};

  Object.entries(routes).map(([path, { network, price }]) => {
    const atomicAmount = processPriceToAtomicAmount(price, network);
    if ("error" in atomicAmount) {
      return NextResponse.json({ error: atomicAmount.error }, { status: 500 });
    }
    const { maxAmountRequired, asset } = atomicAmount;
    accepts[path] = {
      scheme: "exact",
      network,
      maxAmountRequired,
      resource: path,
      description: "Protected API endpoint",
      mimeType: "application/json",
      payTo: getAddress(payTo),
      maxTimeoutSeconds: 300,
      asset: getAddress(asset.address),
      extra: asset.eip712,
    };
  });
  return NextResponse.json({
    x402Version: 1,
    accepts: toJsonSafe(accepts),
  });
}

interface PaymentAccept {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra: {
    name: string;
    version: string;
    [key: string]: unknown; // In case extra can have more fields
  };
}

export interface PaymentRequiredResponse {
  x402Version: number;
  error: string;
  accepts: PaymentAccept[];
}

const x402TypedData = {
  types: {
    TransferWithAuthorization: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  },
  primaryType: "TransferWithAuthorization" as const,
};

// // Currently supported x402 networks. https://docs.cdp.coinbase.com/get-started/supported-networks
const chainMap: Record<Network, Chain> = {
  ["base"]: base,
  ["base-sepolia"]: baseSepolia,
  ["avalanche"]: avalanche,
  ["avalanche-fuji"]: avalancheFuji,
  ["iotex"]: iotex,
};

export function encodeTransferWithAuthorizationFor(
  from: Address,
  paymentRequiredResponse: PaymentRequiredResponse,
): { signRequest: EthSignTypedDataRequest; network: Network; chain: Chain } {
  // TODO(bh2smith): Handle accepts.length > 1!
  const { network, payTo, maxAmountRequired, maxTimeoutSeconds, extra, asset } =
    PaymentRequirementsSchema.parse(paymentRequiredResponse.accepts[0]);
  const chain = chainMap[network];

  // Encode TypedData for TransferWithAuthorization (i.e. x402-Permit)
  const typedData = {
    ...x402TypedData,
    domain: {
      name: extra?.name,
      version: extra?.version,
      chainId: chain.id,
      verifyingContract: getAddress(asset),
    },
    message: {
      from,
      to: getAddress(payTo),
      value: BigInt(maxAmountRequired),
      validAfter: BigInt("0"),
      validBefore: BigInt(
        Math.floor(Date.now() / 1000 + maxTimeoutSeconds).toString(),
      ),
      nonce: `0x${randomBytes(32).toString("hex")}`,
    },
  } as const;

  const signRequest: EthSignTypedDataRequest = {
    method: "eth_signTypedData",
    chainId: chain.id,
    params: [from, JSON.stringify(toJsonSafe(typedData))],
  };
  return { signRequest, network, chain };
}
