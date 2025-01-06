import { createAccountWithUsername, fetchAccount } from '@lens-protocol/client/actions';
import { handleWith } from '@lens-protocol/client/viem';
import { account } from '@lens-protocol/metadata';
// import { account } from '@lens-protocol/metadata';
import { StorageClient, testnet as storageTestnet } from '@lens-protocol/storage-node-client';
import dotenv from "dotenv";
import type { Hex } from 'viem';
import { privateKeyToAccount } from "viem/accounts";
import { client } from "../lens-protocol/publicClient";
import { walletClient } from './walletClient';
dotenv.config()

if (!process.env.PRIVATE_KEY) throw new Error('PRIVATE_KEY not found')
const PRIVATE_KEY = process.env.PRIVATE_KEY as Hex

const signer = privateKeyToAccount(PRIVATE_KEY);

async function main() {
    const authenticated = await client.login({
        onboardingUser: {
            app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
            wallet: signer.address,
        },
        signMessage: (message) => signer.signMessage({ message }),
    });

    if (authenticated.isErr()) {
        console.error(authenticated.error);
        return;
    }

    // SessionClient: { ... }
    const sessionClient = authenticated.value;

    const storageClient = StorageClient.create(storageTestnet);

    const metadata = account({
        name: 'John Doe',
    });

    const { uri } = await storageClient.uploadFile(
        new File([JSON.stringify(metadata)], 'metadata.json', { type: 'application/json' }),
    );

    const created = await createAccountWithUsername(sessionClient, {
        metadataUri: uri,
        username: {
            localName: `john.doe.${Date.now()}`,
        },
    })
        .andThen(handleWith(walletClient))
        .andThen(sessionClient.waitForTransaction)
        .andThen((txHash) => fetchAccount(sessionClient, { txHash }))
        .match(
            (result) => result,
            (error) => {
                throw error;
            },
        );
    console.log("🚀 ~ main ~ created:", created)
}

main();
