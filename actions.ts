import { getL1Balance, getL1ChainId } from "viem/zksync";

import { publicClient } from "./publicClient";


const main = async () => {
    console.log("hello world");
    const chainId = await getL1ChainId(publicClient);
    console.log("🚀 ~ main ~ chainId:", chainId.toString())

    const balance = await getL1Balance(publicClient, {
        account: "ADDRESS_HERE",
    });
    console.log("🚀 ~ main ~ balance:", balance)
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

