
![lensai](https://github.com/user-attachments/assets/c2b12d4a-686b-4889-be84-006c6da95bac)

# Lens Protocol AgentKit for Building AI Agents

A comprehensive AI-powered SDK for seamless interaction with Lens Protocol through natural language processing, built as a GOAT plugin for universal AI agent framework compatibility.

## Demo

https://youtu.be/Mxo_4tHSUeA

## Instruction

```sh
cd typescript && pnpm i
```

```sh
pnpm build
```

```sh
cd typescript/examples/vercel-ai/viem && pnpm i
```

Copy the `.env.template` and populate with your values.

```
cp .env.template .env
```

```
npx ts-node index.ts
```

## Problem
* Complex integration requirements for Lens Protocol
* High technical barrier for new developers
* Time-consuming implementation of basic social features
* Difficult user onboarding for non-technical users
* Limited accessibility to web3 social features
* Fragmented ecosystem across different AI frameworks and blockchain tools

## Solution
A comprehensive SDK that:
  • Provides AI-powered tools to interact with Lens Protocol
  • Simplifies complex operations into natural language commands
  • Integrates seamlessly with existing web3 infrastructure
  • Offers type-safe implementations using TypeScript
  • Supports both development and production environments
  • Works with all major AI frameworks through GOAT integration

## Core Features

**Account Management**
- Create new Lens Protocol accounts with custom profiles
- Search accounts via natural language queries
- Retrieve account details and metadata

**Content Management**
- Create and publish content 
- Fetch author-specific posts
- Browse publications with advanced filtering

Support Major AI Frameworks: Langchain, Vercel's Al SDK, Eliza...

## Technical Architecture

**SDK Foundation**
- TypeScript/JavaScript implementation
- Integration with web3 libraries (viem, wagmi)
- AI-powered natural language processing
- Type-safe implementations with Zod validation
- URQL for GraphQL queries

**Tech Stack**
- TypeScript
- Lens Protocol SDK
- GROQ AI Integration
- GOAT Framework

## Implementation

Example with vercel ai

```ts
import { lens } from "@goat-sdk/plugin-lens";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
// Initialize the SDK
const tools = await getOnChainTools({
wallet: viem(walletClient),
plugins: [lens()],
});
// Use natural language to interact with Lens Protocol
const result = await generateText({
model: groq("llama-3.3-70b-versatile"),
tools: tools,
prompt: "Create a new post saying 'Hello Web3 Social!'"
});
```

More Prompts

```ts
const prompts = [
    `Fetch available Lens Protocol accounts for ${process.env.PUBLIC_KEY}`,
    `Create a new Lens Protocol account with name "Test User" and username "testuser${Date.now()}"`,
    `Search for Lens Protocol accounts with username containing "lens"`,
    `Fetch posts from Lens Protocol author ${process.env.PUBLIC_KEY}`,
    `Create a new Lens Protocol post with content "Testing the Lens Protocol API integration"`,
    `Explore the latest posts on Lens Protocol`,
];
```

## Use Cases

**Social Integration**
- Web3 social platform development
- Programmatic content management
- Streamlined user onboarding
- Profile and account management
- Content discovery systems
- AI agent interactions

## Development Roadmap

- Extended Lens Protocol feature support
- Enhanced AI capabilities
- Performance optimizations
- Expanded GOAT plugin ecosystem
- Advanced AI agent functionality

The SDK addresses key challenges including complex integration requirements, high technical barriers, and limited accessibility to web3 social features through a wallet-agnostic implementation that works seamlessly with major AI frameworks.

## Screenshot

![screenshot1](https://github.com/user-attachments/assets/a1079aa5-e51a-4ce5-8564-aaf1763e6015)

Create wallet https://block-explorer.testnet.lens.dev/tx/0x45e5d75d2ea0cb9a1d2c1306b390e6495e38797b1050663266af18918a87d494

![screenshot2](https://github.com/user-attachments/assets/a107e997-b9d1-4041-9bfe-f6f6d913511a)
