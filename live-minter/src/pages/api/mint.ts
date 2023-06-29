import type { NextApiRequest, NextApiResponse } from "next";
import { NFTStorage } from "nft.storage";
import {
  encodeFunctionData,
  createPublicClient,
  createWalletClient,
  http,
  Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { zoraCreator1155ImplABI } from "@zoralabs/zora-1155-contracts";
import { zoraTestnet } from "@wagmi/chains";

type ResponseData = {
  ok: boolean;
};

type RequestData = {
  png: string;
};

function dataURItoBlob(dataURI: string) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(",")[1]);

  // separate out the mime component
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], { type: mimeString });
  return blob;
}

const address = process.env.NEXT_PUBLIC_MINTER_TARGET_CONTRACT as Address;
const token = process.env.NFT_STORAGE_TOKEN as string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { png } = req.body;

  const image = dataURItoBlob(png);

  const saver = new NFTStorage({ token  });
  const imageCID = await saver.storeBlob(image);
  const metadataCID = await saver.storeBlob(
    new Blob([
      JSON.stringify({
        name: new Date().toISOString(),
        description: "~ ~ ~\n\nmade at nft camp",
        image: `ipfs://${imageCID}`,
      }),
    ], {type: 'application/json'})
  );

  const account = privateKeyToAccount(
    process.env.MINTER_PRIVATE_KEY as `0x${string}`
  );
  const walletClient = createWalletClient({
    chain: zoraTestnet,
    transport: http(),
    account,
  });
  const publicClient = createPublicClient({
    chain: zoraTestnet,
    transport: http(),
  });

  const nextTokenId = await publicClient.readContract({
    abi: zoraCreator1155ImplABI,
    functionName: "nextTokenId",
    address,
  });

  const setupToken = [
    encodeFunctionData({
      abi: zoraCreator1155ImplABI,
      functionName: "setupNewToken",
      args: [`ipfs://${metadataCID}`, BigInt("18446744073709552000")],
    }),
    encodeFunctionData({
      abi: zoraCreator1155ImplABI,
      functionName: "adminMint",
      args: [account.address, nextTokenId!, BigInt(1), "0x"],
    }),
  ];

  const { request } = await publicClient.simulateContract({
    account,
    address,
    abi: zoraCreator1155ImplABI,
    functionName: "multicall",
    args: [setupToken],
  });

  await walletClient.writeContract(request);

    return res.json({ ok: true });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
