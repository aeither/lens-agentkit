import { Client, cacheExchange, fetchExchange, gql } from "urql";

const ENDPOINT = "https://api-v2.lens.dev";

const client = new Client({
    url: ENDPOINT,
    exchanges: [cacheExchange, fetchExchange],
});

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
    "request": {
        "where": {
            "publicationTypes": ["POST"]
        },
        "orderBy": "LATEST",
        "limit": "Ten"
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
