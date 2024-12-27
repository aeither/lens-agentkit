import { evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";

import { client } from "../lens-protocol/publicClient";

import dotenv from "dotenv";
dotenv.config()

async function main() {
    const result = await fetchAccountsAvailable(client, {
        managedBy: evmAddress(process.env.PUBLIC_KEY),
        includeOwned: true,
    });
    console.log("🚀 ~ main ~ result:", result)
}

main();