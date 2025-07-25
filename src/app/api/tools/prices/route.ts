import { getPricePlan } from "@/src/x402-config";

export async function GET(req: Request) {
  return getPricePlan();
}
