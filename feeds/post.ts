
import { textOnly } from "@lens-protocol/metadata";
import { StorageClient, testnet as storageTestnet } from '@lens-protocol/storage-node-client';


async function main() {
    const metadata = textOnly({
        content: "GM! GM!",
    });

    const storageClient = StorageClient.create(storageTestnet);

    const { uri } = await storageClient.uploadAsJson(metadata);

    console.log(uri); // e.g., lens://4f91ca…
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
