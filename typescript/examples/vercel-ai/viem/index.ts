import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { lens } from "@goat-sdk/plugin-lens";

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
        plugins: [lens()],
    });

    const result = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        tools: tools,
        maxSteps: 5,
        // prompt: `Fetch available Lens Protocol accounts for ${process.env.PUBLIC_KEY}`,
        prompt: `Create a new Lens Protocol account with name "Test User" and username "testuser${Date.now()}" with private key PRIVATE_KEY`,
        // prompt: `Search for Lens Protocol accounts with username containing "lens"`,
        // prompt: `Fetch posts from Lens Protocol author 0xD592BDFA321d70F5835b5EEf29755d6F793aAE40`,
        // prompt: `Create a new Lens Protocol post with content "Testing the Lens Protocol API integration" with private key PRIVATE_KEY`,
        // prompt: `Explore the latest posts on Lens Protocol`,
        onStepFinish({ toolCalls }) {
            console.log("toolCalls : ", toolCalls);
        },
    });

    console.log(result.text);
})();
