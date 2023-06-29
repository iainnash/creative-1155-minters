import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const mints = await fetch(
    "https://api.goldsky.com/api/public/project_clhk16b61ay9t49vm6ntn4mkz/subgraphs/zora-create-zora-testnet/stable/gn",
    {
      credentials: "include",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0",
        Accept: "application/json, multipart/mixed",
        "Accept-Language": "en-US,en;q=0.5",
        "content-type": "application/json",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      },
      referrer:
        "https://api.goldsky.com/api/public/project_clhk16b61ay9t49vm6ntn4mkz/subgraphs/zora-create-zora-testnet/stable/gn",
      body: '{"query":"query ($contract:Bytes){\\n  zoraCreateTokens (\\n    where: {address: $contract}, orderBy:timestamp, \\n orderDirection:desc \\n  ) {\\n    timestamp\\n uri\\n   metadata {\\n      image\\n    }\\n  }\\n}","variables":{"contract":"0x69bED30fEed05E34375fC5574f5Dc0011AbE00A6"}}',
      method: "POST",
      mode: "cors",
    }
  );
  const data = await mints.json();
  const tokens = data.data.zoraCreateTokens;
  for (var i = 0; i < 3; i++) {
    if (!tokens[i].metadata) {
      const r = await fetch(
        tokens[i].uri.replace("ipfs://", "https://ipfs.io/ipfs/")
      );
      tokens[i].metadata = await r.json();
    }
  }
  return res.json(tokens);
}
