import { Client, cacheExchange, fetchExchange, gql } from "urql";

const ENDPOINT = "https://api.testnet.lens.dev/graphql";

const client = new Client({
    url: ENDPOINT,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    },
});

const query = gql`
query {
  accounts(
    request: {
      filter: {
        searchBy: {
          localNameQuery: "john.doe.1735342542408"

          # Optional. Defaults to lens/* namespace.
          # namespace: EvmAddress
        }
      }
      orderBy: ACCOUNT_SCORE # other options: ALPHABETICAL, BEST_MATCH
    }
  ) {
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
    "request": {
        "pageSize": "TEN",
    }
}

async function main() {
    const result = await client.query(query, variables).toPromise();
    console.log(result.data);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
