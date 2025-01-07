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
            authors: ["0xD592BDFA321d70F5835b5EEf29755d6F793aAE40"]
        },
        pageSize: "TEN"
    }
};


async function main() {
    const result = await client.query(query, variables).toPromise();
    console.log(result.data.posts.items);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
