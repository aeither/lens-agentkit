import { chains } from "@lens-network/sdk/viem";
import { createPublicClient, http } from "viem";

export const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(),
});