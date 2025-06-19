# Bitte EVM Test Agent

This agent exposes tools to generate EVM signature request payloads for testing, simulation, and integration with the [Bitte Agent Framework](https://docs.bitte.ai).

Supported signature types:

- [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction) — zero-value, non-trivial txs to a specified address
- [`eth_sign`](https://eips.ethereum.org/EIPS/eip-191) — EIP-191-style messages with embedded chain ID
- [`personal_sign`](https://github.com/MetaMask/metamask-extension/issues/3763) — raw user messages with chain and timestamp context
- [`eth_signTypedData`](https://eips.ethereum.org/EIPS/eip-712) — structured data for permission grants and agent intents

Each route is stateless, signs only what is shown, and includes expiry or other anti-replay context to ensure safety.

> For demo/testing only — all signature requests are non-authoritative and expire quickly or immediately.

The agent only produces payloads for Sepolia Testnet (chainId 11155111).
