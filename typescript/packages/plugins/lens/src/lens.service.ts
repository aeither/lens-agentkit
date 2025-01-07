import { Tool, createToolParameters } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { chains } from "@lens-network/sdk/viem";
import { Ok, PublicClient, testnet } from "@lens-protocol/client";
import { createAccountWithUsername, fetchAccount, fetchAccountsAvailable, post } from "@lens-protocol/client/actions";
import { handleWith } from "@lens-protocol/client/viem";
import { account, textOnly } from "@lens-protocol/metadata";
import { StorageClient, testnet as storageTestnet } from "@lens-protocol/storage-node-client";
import { Client, cacheExchange, fetchExchange, gql } from "urql";
import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
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
) {}

class CreateLensAccountParameters extends createToolParameters(
    z.object({
        name: z.string().describe("The name for the Lens account"),
        username: z.string().describe("The username for the Lens account"),
        privateKey: z.string().describe("The private key to access the wallet"),
        appId: z
            .string()
            .default("0xe5439696f4057aF073c0FB2dc6e5e755392922e1")
            .describe("The app ID for the Lens account"),
    }),
) {}

class SearchLensAccountsParameters extends createToolParameters(
    z.object({
        localNameQuery: z.string().describe("The username to search for"),
        pageSize: z.enum(["TEN", "FIFTY"]).optional().default("TEN").describe("Number of results per page"),
    }),
) {}

class GetLensPostsParameters extends createToolParameters(
    z.object({
        authors: z.array(z.string()).describe("Array of author addresses to filter posts by"),
    }),
) {}

class CreateLensPostParameters extends createToolParameters(
    z.object({
        content: z.string().describe("The text content of the post"),
        privateKey: z.string().describe("The private key to access the wallet"),
        appId: z
            .string()
            .default("0xe5439696f4057aF073c0FB2dc6e5e755392922e1")
            .describe("The app ID for the Lens post"),
    }),
) {}

class ExploreLensPublicationsParameters extends createToolParameters(
    z.object({
        publicationTypes: z
            .array(z.enum(["POST"]))
            .default(["POST"])
            .describe("Types of publications to explore"),
        orderBy: z.enum(["LATEST"]).default("LATEST").describe("How to order the publications"),
    }),
) {}

export class LensService {
    private urqlClient: Client;

    constructor() {
        this.urqlClient = new Client({
            url: LENS_API_ENDPOINT,
            exchanges: [cacheExchange, fetchExchange],
            fetchOptions: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
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
                        },
                    },
                    orderBy: "ACCOUNT_SCORE",
                    pageSize: parameters.pageSize,
                },
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
        const signer = privateKeyToAccount(parameters.privateKey as `0x${string}`);
        const walletClient2 = createWalletClient({
            account: signer,
            chain: chains.testnet,
            transport: http(),
        });

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
                signMessage: (message) => signer.signMessage({ message }),
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
                new File([JSON.stringify(metadata)], "metadata.json", { type: "application/json" }),
            );

            const created = await createAccountWithUsername(sessionClient, {
                metadataUri: uri,
                username: {
                    localName: parameters.username,
                },
            })
                .andThen(handleWith(walletClient2))
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

    @Tool({
        description: "Fetch posts from specific Lens Protocol authors",
    })
    async getLensPosts(parameters: GetLensPostsParameters) {
        try {
            const query = gql`
            query GetPosts($request: PostsRequest!) {
                posts(request: $request) {
                    items {
                        ... on Post {
                            id
                            timestamp
                            slug
                        }
                    }
                }
            }
        `;

            const variables = {
                request: {
                    filter: {
                        authors: parameters.authors,
                    },
                    pageSize: "TEN",
                },
            };

            const result = await this.urqlClient.query(query, variables).toPromise();

            if (result.error) {
                throw new Error(`Query failed: ${result.error.message}`);
            }

            return result.data.posts.items;
        } catch (error) {
            throw Error(`Failed to fetch Lens posts: ${error}`);
        }
    }

    @Tool({
        description: "Create a new text post on Lens Protocol",
    })
    async createLensPost(walletClient: EVMWalletClient, parameters: CreateLensPostParameters) {
        const signer = privateKeyToAccount(parameters.privateKey as `0x${string}`);
        const walletClient2 = createWalletClient({
            account: signer,
            chain: chains.testnet,
            transport: http(),
        });
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
                signMessage: (message) => signer.signMessage({ message }),
            });

            if (authenticated.isErr()) {
                throw new Error(`Authentication failed: ${authenticated.error}`);
            }

            const sessionClient = authenticated.value;
            const storageClient = StorageClient.create(storageTestnet);

            const metadata = textOnly({
                content: parameters.content,
            });

            const { uri } = await storageClient.uploadAsJson(metadata);

            const result = await post(sessionClient, { contentUri: uri })
                .andThen(handleWith(walletClient2))
                .match(
                    (result) => result,
                    (error) => {
                        throw error;
                    },
                );

            return result;
        } catch (error) {
            throw Error(`Failed to create Lens post: ${error}`);
        }
    }

    @Tool({
        description: "Explore latest publications on Lens Protocol",
    })
    async exploreLensPublications(parameters: ExploreLensPublicationsParameters) {
        try {
            const query = gql`
            query ExplorePublications($request: ExplorePublicationRequest!) {
                explorePublications(request: $request) {
                    items {
                        ... on Post {
                            id
                            publishedOn {
                                id
                            }
                            by {
                                id
                                handle {
                                    fullHandle
                                }
                                metadata {
                                    displayName
                                    picture {
                                        ... on ImageSet {
                                            optimized {
                                                uri
                                            }
                                        }
                                    }
                                }
                            }
                            metadata {
                                ... on TextOnlyMetadataV3 {
                                    id
                                    content
                                    locale
                                }
                                ... on ImageMetadataV3 {
                                    id
                                    content
                                    asset {
                                        image {
                                            optimized {
                                                uri
                                            }
                                        }
                                    }
                                }
                            }
                            stats {
                                comments
                                mirrors
                                quotes
                                reactions
                                bookmarks
                            }
                            operations {
                                hasReacted
                                hasMirrored
                                hasBookmarked
                            }
                            createdAt
                        }
                    }
                    pageInfo {
                        next
                        prev
                    }
                }
            }
        `;

            const variables = {
                request: {
                    where: {
                        publicationTypes: parameters.publicationTypes,
                    },
                    orderBy: parameters.orderBy,
                },
            };

            const result = await this.urqlClient.query(query, variables).toPromise();

            if (result.error) {
                throw new Error(`Query failed: ${result.error.message}`);
            }

            return result.data.explorePublications.items;
        } catch (error) {
            throw Error(`Failed to explore Lens publications: ${error}`);
        }
    }
}
