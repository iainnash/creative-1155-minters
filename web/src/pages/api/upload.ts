import buffer from "buffer";
import type { NextApiRequest, NextApiResponse } from "next";
import fsPromises from "fs/promises";
import { NFTStorage } from "nft.storage";

type ResponseData = {
  webpage: string;
  metadata: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { title, description, code } = req.body;
  // const result = TEMPLATE(title, code);
  const file = await fsPromises.readFile("public/p5js/p5-all.min.js");
  // const codeWithLib = code.replace(
  //   '<script src="/p5js/p5-all.min.js"></script>',
  //   `<script>${file.toString("utf-8")}</script>`
  // );
  const codeWithLib = code.replace(
    '<script src="/p5js/p5-all.min.js"></script>',
    `
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.js" crossorigin=""></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/addons/p5.sound.min.js" crossorigin=""></script>
  `
  );
  console.log({ code, codeWithLib });
  const lib = new buffer.File([file], "/p5js/p5-all.min.js");
  const html = new buffer.File([codeWithLib], "/index.html");
  const storage = new NFTStorage({
    token: process.env.SERVER_NFT_STORAGE_API_KEY!,
  });
  const webpage = await storage.storeDirectory([lib, html]);

  let previewImage;
  if (req.body.previewImage) {
    const data = req.body.previewImage.split(",")[1];
    const input = Buffer.from(data, "base64url");
    const previewImageBlob = new Blob([input], { type: "image/png" });
    previewImage = await storage.storeBlob(previewImageBlob);
  }
  const metadata = await storage.storeBlob(
    new Blob([
      JSON.stringify({
        title,
        description,
        content: { uri: `ipfs://${webpage}`, type: "text/html" },
        animationURL: `ipfs://${webpage}`,
        image: previewImage ? `ipfs://${previewImage}` : undefined,
      }),
    ])
  );
  return res.json({ webpage, metadata });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
