// import { account } from '@lens-protocol/metadata';
import dotenv from "dotenv";
import type { Hex } from 'viem';
import { privateKeyToAccount } from "viem/accounts";
import { client } from "../lens-protocol/publicClient";
dotenv.config()

if (!process.env.PRIVATE_KEY) throw new Error('PRIVATE_KEY not found')
const PRIVATE_KEY = process.env.PRIVATE_KEY as Hex

const signer = privateKeyToAccount(PRIVATE_KEY);

export async function getSessionClient() {
    const authenticated = await client.login({
        accountOwner: {
            account: "0xD592BDFA321d70F5835b5EEf29755d6F793aAE40",
            app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
            owner: process.env.PUBLIC_KEY,
        },
        signMessage: (message) => signer.signMessage({ message }),
    });

    if (authenticated.isErr()) {
        console.error(authenticated.error);
        throw authenticated.error;
    }

    // SessionClient: { ... }
    const sessionClient = authenticated.value;
    console.log("🚀 ~ getSessionClient ~ sessionClient:", sessionClient)
    return sessionClient;
}

// getSessionClient()