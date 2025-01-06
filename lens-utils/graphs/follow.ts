import { evmAddress } from "@lens-protocol/client";
import { follow } from "@lens-protocol/client/actions";
import { getSessionClient } from "../accounts/owner";


async function main() {

    const sessionClient = await getSessionClient()
 
    // Replace with second account
    const result = await follow(sessionClient, { account: evmAddress("0x1dB2Ee3119855d6c9C2726103f8C5D2eC92132eB") })
    console.log("🚀 ~ main ~ result:", result)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
