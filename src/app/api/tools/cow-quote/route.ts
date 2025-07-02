import { NextRequest, NextResponse } from "next/server";

const result = {
  result: {
    meta: {
      quote: {
        quote: {
          sellToken: "0x9c58bacc331c9aa871afd802db6379a98e80cedb",
          buyToken: "0x177127622c4a00f3d409b75571e12cb3c8973d3c",
          receiver: "0x7f01d9b227593e033bf8d6fc86e634d27aa85568",
          sellAmount: "9999999999996987356",
          buyAmount: "3992939402962133657771",
          validTo: 1751451861,
          appData:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          feeAmount: "3012644",
          kind: "sell",
          partiallyFillable: false,
          sellTokenBalance: "erc20",
          buyTokenBalance: "erc20",
          signingScheme: "eip712",
        },
        from: "0x7f01d9b227593e033bf8d6fc86e634d27aa85568",
        expiration: "2025-07-02T09:56:21.872098656Z",
        id: 158209022,
        verified: true,
      },
      ui: {
        network: { name: "Gnosis", icon: "" },
        type: "swap",
        fee: "3012644",
        tokenIn: {
          contractAddress: "0x9c58bacc331c9aa871afd802db6379a98e80cedb",
          amount: "9.999999999996987356",
          usdValue: 0,
          name: "GNO",
          address: "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb",
          decimals: 18,
          symbol: "GNO",
        },
        tokenOut: {
          contractAddress: "0x177127622c4a00f3d409b75571e12cb3c8973d3c",
          amount: "3992.939402962133657771",
          usdValue: 0,
          name: "COW",
          address: "0x177127622c4A00F3d409B75571e12cB3c8973d3c",
          decimals: 18,
          symbol: "COW",
        },
      },
    },
    transaction: {
      method: "eth_signTypedData_v4",
      chainId: 100,
      params: [
        "0x7f01D9b227593E033bf8d6FC86e634d27aa85568",
        '{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Order":[{"name":"sellToken","type":"address"},{"name":"buyToken","type":"address"},{"name":"receiver","type":"address"},{"name":"sellAmount","type":"uint256"},{"name":"buyAmount","type":"uint256"},{"name":"validTo","type":"uint32"},{"name":"appData","type":"bytes32"},{"name":"feeAmount","type":"uint256"},{"name":"kind","type":"string"},{"name":"partiallyFillable","type":"bool"},{"name":"sellTokenBalance","type":"string"},{"name":"buyTokenBalance","type":"string"}]},"domain":{},"primaryType":"Order","message":{"sellToken":"0x9c58bacc331c9aa871afd802db6379a98e80cedb","buyToken":"0x177127622c4a00f3d409b75571e12cb3c8973d3c","receiver":"0x7f01d9b227593e033bf8d6fc86e634d27aa85568","sellAmount":"9999999999996987356","buyAmount":"3992939402962133657771","validTo":1751451861,"appData":"0x0000000000000000000000000000000000000000000000000000000000000000","feeAmount":"3012644","kind":"sell","partiallyFillable":false,"sellTokenBalance":"erc20","buyTokenBalance":"erc20","signingScheme":"eip712"}}',
      ],
    },
  },
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  console.log("quote/", req.url);
  return NextResponse.json(result);
}
