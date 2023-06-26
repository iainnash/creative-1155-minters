import { createBlob, createObjectURL, revokeObjectURL } from "blob-util";
import mime from "mime";
import { PLAINTEXT_FILE_REGEX } from "./fileUtils";

export type FileContent = {
  path: string;
  content: string;
  blobUrl?: string;
  url?: string;
};

export function createBlobUrl(file: FileContent) {
  if (file.blobUrl) {
    revokeObjectURL(file.blobUrl);
  }

  const mimeType = mime.getType(file.path) || "text/plain";
  console.log(mimeType);

  const fileBlob = createBlob([file.content], { type: mimeType });
  const blobURL = createObjectURL(fileBlob);
  return blobURL;
}

export function createBlobUrls(files: FileContent[]) {
  return files.map((file) => {
    if (file.path.match(PLAINTEXT_FILE_REGEX)) {
      const blobUrl = createBlobUrl(file);
      return { ...file, blobUrl };
    }
    return file;
  });
}
