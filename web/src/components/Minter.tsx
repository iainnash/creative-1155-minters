import { useCallback, useEffect, useState } from "react";
import { MintComponent } from "./MintComponent";
import { TEMPLATE } from "@/templates/p5-js";

function waitForElm(doc: Document, selector: string) {
  return new Promise((resolve) => {
    if (doc.querySelector(selector)) {
      return resolve(doc.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (doc.querySelector(selector)) {
        resolve(doc.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(doc.body, {
      childList: true,
      subtree: true,
    });
  });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Minter() {
  const [project, setProject] = useState<any>();
  useEffect(() => {
    setProject(JSON.parse((window as any).localStorage.getItem("mint")));
  }, [setProject]);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [mintingStatus, setMintingStatus] = useState("");
  const [uploadedId, setUploadedId] = useState();
  const [isUploading, setIsUploading] = useState(false);

  const [previewImage, setPreviewImage] = useState<string>();

  const renderProject = useCallback(() => {
    if (project) {
      console.log("has project");
      const frame = document.createElement("iframe");
      frame.style.opacity = "0";
      frame.width = "400";
      frame.height = "400";
      frame.srcdoc = TEMPLATE("", project.code);
      frame.addEventListener("load", async () => {
        await waitForElm(frame.contentDocument!, "#defaultCanvas0");
        await delay(1000);
        const canvas = frame.contentDocument?.getElementById("defaultCanvas0");
        const previewImage = (canvas as HTMLCanvasElement).toDataURL(
          "image/png"
        );
        setPreviewImage(previewImage);
      });
      document.body.appendChild(frame);
    }
  }, [project, setPreviewImage]);

  useEffect(() => {
    renderProject();
  }, [project, renderProject]);

  const uploadAndMint = useCallback(async () => {
    setIsUploading(true);
    setMintingStatus("Uploading...");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          previewImage,
          title,
          description,
          code: project.code,
          type: project.type,
        }),
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
      });
      const json = await res.json();
      setMintingStatus("Minting...");
      setUploadedId(json);
    } catch (err: any) {
      setMintingStatus(`Error: ${err.toString()}`);
    }
  }, [
    project,
    title,
    previewImage,
    description,
    setUploadedId,
    setIsUploading,
  ]);

  if (!project) {
    return <>loading...</>;
  }

  return (
    <div className="p-10">
      <h2>Mint</h2>
      <h5>Type: {project.type}</h5>
      <h5>
        Code: <textarea value={project.code}></textarea>
      </h5>
      <h5>
        Preview:{" "}
        {previewImage ? (
          <img className="block" width="400" height="400" src={previewImage} />
        ) : (
          "Preview rendering"
        )}
      </h5>
      <div>
        <label>
          <strong>Title:</strong>{" "}
          <input
            className="block color-red"
            type="text"
            placeholder="title here"
            disabled={uploadedId}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          <strong>Description</strong>: (optional) <br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploadedId}
          ></textarea>
        </label>
      </div>
      <div>
        <div>{mintingStatus}</div>
        <button disabled={isUploading} onClick={uploadAndMint}>
          Upload
        </button>
        {uploadedId ? (
          <MintComponent type={project.type} metadata={uploadedId} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
