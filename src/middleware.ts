import { paymentMiddleware } from "x402-next";
import { paywallConfig } from "./x402-config";

const { payTo, routes, facilitatorConfig, paywall } = paywallConfig;

export const middleware = paymentMiddleware(
  payTo,
  routes,
  facilitatorConfig,
  paywall,
);

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/tools/protected/:path*"],
  runtime: "nodejs", // TEMPORARY: Only needed until Edge runtime support is added
};
