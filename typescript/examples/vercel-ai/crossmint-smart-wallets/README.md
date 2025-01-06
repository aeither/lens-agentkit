# Vercel AI with Crossmint Smart Wallets Example



## Setup

Copy the `.env.template` and populate with your values.

```
cp .env.template .env
```

## Usage

1. Create a smart wallet with your EOA as the admin signer.

```
npx ts-node create-smart-wallet.ts
```

2. Get the smart wallet address and add it to the `.env` file.
```
SMART_WALLET_ADDRESS=<your smart wallet address>
```

3. Run the example.
```
npx ts-node index.ts
```
