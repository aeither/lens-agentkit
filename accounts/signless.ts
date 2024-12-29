import { enableSignless } from "@lens-protocol/client/actions";
import { getSessionClient } from "./owner";




async function main() {

    const sessionClient = await getSessionClient()

    const result = await enableSignless(sessionClient);

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
