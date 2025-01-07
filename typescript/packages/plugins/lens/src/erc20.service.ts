import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { Ok, PublicClient, testnet } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import {
    GetLensAccountsParameters
} from "./parameters";
import { Token } from "./token";

export class Erc20Service {
    private tokens: Token[];

    constructor({ tokens }: { tokens?: Token[] } = {}) {
        this.tokens = tokens ?? [];
    }

    @Tool({
        description: "Fetch available Lens Protocol accounts for a wallet address",
    })
    async getLensAccounts(walletClient: EVMWalletClient, parameters: GetLensAccountsParameters) {
        try {
            // Initialize Lens client
            const lensClient = PublicClient.create({
                environment: testnet,
                origin: "https://myappdomain.xyz",
            });

            // Resolve the wallet address
            const resolvedWalletAddress = await walletClient.resolveAddress(parameters.walletAddress);

            const result = await fetchAccountsAvailable(lensClient, {
                managedBy: resolvedWalletAddress,
                includeOwned: parameters.includeOwned ?? true,
            });

            if (!(result instanceof Ok) || !result.value) {
                throw new Error("Failed to fetch Lens accounts");
            }

            return {
                accounts: result.value.items.map((item) => ({
                    ownedBy: item.account.owner,
                    metadata: item.account.metadata,
                })),
                pageInfo: result.value.pageInfo,
            };
        } catch (error) {
            throw Error(`Failed to fetch Lens accounts: ${error}`);
        }
    }

}
