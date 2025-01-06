import { type AddAccountManagerRequest, evmAddress } from "@lens-protocol/client";
import { addAccountManager, enableSignless } from "@lens-protocol/client/actions";
import { getSessionClient } from "./owner";



async function main() {
    const sessionClient = await getSessionClient()

    const request: AddAccountManagerRequest = {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        address: evmAddress(process.env.PUBLIC_KEY!),
        permissions: { canExecuteTransactions: true, canSetMetadataUri: true, canTransferNative: true, canTransferTokens: true }
    }
    // const addAccountManagerResult = await sessionClient.mutation(AddAccountManagerMutation, { request });
    // console.log("🚀 ~ main ~ addAccountManagerResult:", addAccountManagerResult)
    const addAccountManageResult = await addAccountManager(sessionClient, request)
    
    const result = await enableSignless(sessionClient);
    console.log("🚀 ~ main ~ result:", result)

    if (result.isErr()) {
        return console.error(result.error);
    }

    const session = result.value;
    console.log("🚀 ~ main ~ session:", session)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
