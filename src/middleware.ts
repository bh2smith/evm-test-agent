import { Address } from "viem";
import { paymentMiddleware, Network } from "x402-next";
import { facilitator } from "@coinbase/x402";

const useCdpFacilitator = process.env.USE_CDP_FACILITATOR === "true";
const payTo = (process.env.ADDRESS ||
  "0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA") as Address;
const network = (process.env.NETWORK || "base") as Network;

// Configure facilitator
const facilitatorConfig = useCdpFacilitator ? facilitator : undefined;

export const middleware = paymentMiddleware(
  payTo,
  {
    "/api/tools/protected": {
      price: "$0.001",
      network,
      config: {
        description: "Protected API endpoint",
      },
    },
  },
  facilitatorConfig,
  {
    appName: "x402 Protected Route",
    appLogo: "/x402-icon-blue.png",
  },
);

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/tools/protected/:path*"],
  runtime: "nodejs", // TEMPORARY: Only needed until Edge runtime support is added
};
