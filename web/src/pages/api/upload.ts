import buffer from "buffer";
import type { NextApiRequest, NextApiResponse } from "next";
import fsPromises from "fs/promises";
import { NFTStorage } from "nft.storage";
import path from "path";

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
  // const file = await fsPromises.readFile("public/p5js/p5-all.min.js");
  const file = path.join(process.cwd(), "public", "p5js", "p5-all.min.js");
  const lib = await fsPromises.readFile(file);

  const codeWithLib = code.replace(
    '<script src="/p5js/p5-all.min.js"></script>',
    '<script src="p5js/p5-all.min.js"></script>'
  );
  // const codeWithLib = code.replace(
  //   '<script src="/p5js/p5-all.min.js"></script>',
  //   '<script src="p5js/p5-all.min.js"></script>',
  // );

  // const lib = new buffer.File([p5js], "/p5js/p5-all.min.js");
  const html = new buffer.File([codeWithLib], "/index.html");
  const p5jslib = new buffer.File([lib], "/p5js/p5-all.min.js");
  const storage = new NFTStorage({
    token: process.env.SERVER_NFT_STORAGE_API_KEY!,
  });
  const webpage = await storage.storeDirectory([html, p5jslib]);

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
        animation_url: `ipfs://${webpage}`,
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
