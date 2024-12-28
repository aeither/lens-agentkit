import { chains } from "@lens-network/sdk/viem";
import dotenv from "dotenv";
import { createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
dotenv.config()

const account = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);

export const walletClient = createWalletClient({
    account,
    chain: chains.testnet,
    transport: http(),
});
