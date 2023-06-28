import request from "graphql-request";

const CONFIG_BASE =
  "https://api.goldsky.com/api/public/project_clhk16b61ay9t49vm6ntn4mkz/subgraphs";

function getSubgraph(name: string, version: string): string {
  return `${CONFIG_BASE}/${name}/${version}/gn`;
}

let SUBGRAPH_URLS: Record<number, string> = {
  1: getSubgraph("zora-create-mainnet", "stable"),
  5: getSubgraph("zora-create-goerli", "stable"),
  10: getSubgraph("zora-create-optimism", "stable"),
  420: getSubgraph("zora-create-optimism-goerli", "stable"),
  999: getSubgraph("zora-create-zora-testnet", "stable"),
  7777777: getSubgraph("zora-create-zora-mainnet", "stable"),
};

export async function getUserCollections({ queryKey }: { queryKey: any }) {
  const [_key, { user, chain }] = queryKey;
  const data = await request(
    SUBGRAPH_URLS[chain]!,
    `
  query ($user: Bytes){
    zoraCreateContracts (
      where: {owner: $user, contractStandard: "ERC1155", name_contains_nocase: "P5JS"}
    ) {
      name
      address
    }
  } 
  `,
    {
      user,
    }
  );
  return data as any;
}
