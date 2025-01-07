import { Tool, createToolParameters } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { Ok, PublicClient, testnet } from "@lens-protocol/client";
import { createAccountWithUsername, fetchAccount, fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { handleWith } from "@lens-protocol/client/viem";
import { account } from "@lens-protocol/metadata";
import { StorageClient, testnet as storageTestnet } from "@lens-protocol/storage-node-client";
import { Client, cacheExchange, fetchExchange, gql } from "urql";
import { z } from "zod";

const LENS_API_ENDPOINT = "https://api.testnet.lens.dev/graphql";

class GetLensAccountsParameters extends createToolParameters(
    z.object({
        walletAddress: z.string().describe("The wallet address to fetch Lens Protocol accounts for"),
        includeOwned: z
            .boolean()
            .optional()
            .default(true)
            .describe("Whether to include owned accounts in the response"),
    }),
) { }

class CreateLensAccountParameters extends createToolParameters(
    z.object({
        name: z.string().describe("The name for the Lens account"),
        username: z.string().describe("The username for the Lens account"),
        appId: z.string().describe("The app ID for the Lens account"),
    }),
) { }

class SearchLensAccountsParameters extends createToolParameters(
    z.object({
        localNameQuery: z.string().describe("The username to search for"),
        pageSize: z.enum(["TEN", "TWENTY", "FIFTY"]).optional().default("TEN").describe("Number of results per page"),
    }),
) { }

export class LensService {
    private urqlClient: Client;

    constructor() {
        this.urqlClient = new Client({
            url: LENS_API_ENDPOINT,
            exchanges: [cacheExchange, fetchExchange],
            fetchOptions: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            },
        });
    }


    @Tool({
        description: "Search Lens Protocol accounts by username",
    })
    async searchLensAccounts(parameters: SearchLensAccountsParameters) {
        try {
            const query = gql`
                query SearchAccounts($request: AccountsRequest!) {
                    accounts(request: $request) {
                        items {
                            address
                            username {
                                value
                            }
                            metadata {
                                name
                                picture
                            }
                        }
                        pageInfo {
                            prev
                            next
                        }
                    }
                }
            `;

            const variables = {
                request: {
                    filter: {
                        searchBy: {
                            localNameQuery: parameters.localNameQuery,
                        }
                    },
                    orderBy: "ACCOUNT_SCORE",
                    pageSize: parameters.pageSize,
                }
            };

            const result = await this.urqlClient.query(query, variables).toPromise();

            if (result.error) {
                throw new Error(`Query failed: ${result.error.message}`);
            }

            return result.data.accounts;
        } catch (error) {
            throw Error(`Failed to search Lens accounts: ${error}`);
        }
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

    @Tool({
        description: "Create a new Lens Protocol account with username",
    })
    async createLensAccount(walletClient: EVMWalletClient, parameters: CreateLensAccountParameters) {
        try {
            const lensClient = PublicClient.create({
                environment: testnet,
                origin: "https://myappdomain.xyz",
            });

            const authenticated = await lensClient.login({
                onboardingUser: {
                    app: parameters.appId,
                    wallet: await walletClient.getAddress(),
                },
                signMessage: async (message) => { return (await walletClient.signMessage(message)) as unknown as string },
            });

            if (authenticated.isErr()) {
                throw new Error(`Authentication failed: ${authenticated.error}`);
            }

            const sessionClient = authenticated.value;
            const storageClient = StorageClient.create(storageTestnet);

            const metadata = account({
                name: parameters.name,
            });

            const { uri } = await storageClient.uploadFile(
                new File([JSON.stringify(metadata)], 'metadata.json', { type: 'application/json' }),
            );

            const created = await createAccountWithUsername(sessionClient, {
                metadataUri: uri,
                username: {
                    localName: parameters.username,
                },
            })
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                .andThen(handleWith(walletClient as any))
                .andThen(sessionClient.waitForTransaction)
                .andThen((txHash) => fetchAccount(sessionClient, { txHash }))
                .match(
                    (result) => result,
                    (error) => {
                        throw error;
                    },
                );

            return created;
        } catch (error) {
            throw Error(`Failed to create Lens account: ${error}`);
        }
    }
}
