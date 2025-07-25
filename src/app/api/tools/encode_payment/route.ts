import {
  encodeTransferWithAuthorizationFor,
  getPricePlan,
} from "@/src/x402-config";
import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { pluginData } from "../../ai-plugin/data";

const paths = pluginData.paths;

// Map: path -> operationId
const pathToOperationId: Record<string, string> = {};
// Map: operationId -> path
const operationIdToPath: Record<string, string> = {};

for (const [path, methods] of Object.entries(paths)) {
  if (methods.get?.operationId) {
    const opId = methods.get.operationId;
    pathToOperationId[path] = opId;
    operationIdToPath[opId] = path;
  }
}

function resolveToolPath(tool: string): string | undefined {
  // If tool is a valid full path
  if (tool.startsWith("/") && pathToOperationId[tool]) {
    return tool;
  }

  // Otherwise assume it's an operationId
  return operationIdToPath[tool];
}

export async function GET(req: Request) {
  const { origin: baseUrl, searchParams } = new URL(req.url);
  const requestedTool = searchParams.get("tool");
  console.log("Encode", req.url);
  if (!requestedTool) {
    console.error("missing tool call.");
    return NextResponse.json({ error: "Missing Tool Call" }, { status: 400 });
  }
  const from = searchParams.get("evmAddress");
  if (!from || !isAddress(from, { strict: false })) {
    console.error("invalid address");
    return NextResponse.json(
      { error: `Invalid evmAddress: ${from}` },
      { status: 400 },
    );
  }
  const pricePlan = getPricePlan(baseUrl);
  const path = resolveToolPath(requestedTool);
  if (!path || !(path in pricePlan)) {
    const message = `Invalid Tool Requested: "${requestedTool}"`;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  try {
    const data = pricePlan[path];
    const { signRequest } = encodeTransferWithAuthorizationFor(from, data);
    return NextResponse.json(
      {
        transaction: signRequest,
        // TODO: Maybe return HTML
        meta: { data },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
