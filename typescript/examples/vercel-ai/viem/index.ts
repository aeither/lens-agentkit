import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { PEPE, USDC, erc20 } from "@goat-sdk/plugin-lens";

import { viem } from "@goat-sdk/wallet-viem";
import { chains } from "@lens-network/sdk/viem";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(),
    chain: chains.testnet,
});

const groq = createGroq({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [erc20({ tokens: [USDC, PEPE] })],
    });

    const result = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        tools: tools,
        maxSteps: 5,
        prompt: "Fetch available Lens Protocol accounts for me",
        onStepFinish({ toolResults, usage, toolCalls }) {
            console.log("toolCalls : ", toolCalls);
        },
    });

    console.log(result.text);
})();
