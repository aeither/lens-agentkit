import { type Chain, PluginBase } from "@goat-sdk/core";
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { LensService } from "./lens.service";

export class LensPlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        super("lens", [new LensService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm";
}

export function lens() {
    return new LensPlugin();
}
