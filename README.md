# Lens AI AgentKit

test

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


# Lens Protocol AI Tools SDK

A comprehensive AI-powered SDK for seamless interaction with Lens Protocol through natural language processing, built as a GOAT plugin for universal AI agent framework compatibility.

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
