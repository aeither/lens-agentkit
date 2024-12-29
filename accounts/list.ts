import { Ok, evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";

import { client } from "../lens-protocol/publicClient";

import dotenv from "dotenv";
dotenv.config()

async function main() {
    const result = await fetchAccountsAvailable(client, {
        managedBy: evmAddress(process.env.PUBLIC_KEY),
        includeOwned: true,
    });

    if (result instanceof Ok) {
        console.log("Items:", result.value.items);
        console.log("Items:", result.value.items[1].account.metadata);
    }
}


main();