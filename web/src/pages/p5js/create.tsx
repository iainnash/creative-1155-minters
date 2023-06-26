import Editor from "@monaco-editor/react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useDebounce } from "usehooks-ts";
import { DEFAULT_P5JS_SKETCH, TEMPLATE } from "@/templates/p5-js";
import { useRouter } from "next/router";
import { getType } from "mime";
import { FileContent } from "@/lib/filesUtils";

const DEFAULT_HTML_FILE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="/p5js/p5-all.min.js"></script>
    <meta charset="utf-8" />

  </head>
  <body>
    <main>
    </main>
    <script src="sketch.js"></script>
  </body>
</html>

`;

function getLanguageForPath(path: string) {
  if (path.endsWith(".html") || path.endsWith(".htm")) {
    return "html";
  }
  if (path.endsWith(".js")) {
    return "javascript";
  }
  if (path.endsWith(".css")) {
    return "css";
  }
}

const FileItem = ({
  index,
  active,
  path,
  setActiveFileIndex,
  updateFile,
}: {
  index: number;
  active: boolean;
  path: string;
  setActiveFileIndex: (index: number) => void;
  updateFile: (index: number, result: string | null) => void;
}) => {
  return (
    <button
      onClick={() => setActiveFileIndex(index)}
      onDoubleClick={() => {
        const question = prompt("new filename?");
        updateFile(index, question);
      }}
      className={`block ${active ? "font-bold" : ""}`}
    >
      {path}
    </button>
  );
};

// const debouncedFiles = useDebounce(files, 1000);
// useEffect(() => {
//   (window as any).localStorage.write(JSON.stringify(debouncedFiles));
// })

function makeDataURIFromFile(file: FileContent) {
  return makeDataURI(getType(file.path) || 'text/plain', file.content);
}

function makeDataURI(mime: string, data: string) {
  const uriData = Buffer.from(data, "utf-8").toString("base64");
  return `data:${mime};base64,${uriData}`;
}

export default function CreatePage() {
  const [files, setFiles] = useState<FileContent[]>([
    { path: "index.html", content: DEFAULT_HTML_FILE },
    { path: "sketch.js", content: DEFAULT_P5JS_SKETCH },
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const code = useMemo(() => {
    return files[activeFileIndex].content || "";
  }, [files, activeFileIndex]);
  const setCode = useCallback(
    (newContent: string) => {
      const newFiles = [...files];
      newFiles[activeFileIndex].content = newContent;
      setFiles(newFiles);
    },
    [files, setFiles, activeFileIndex]
  );
  const addFile = useCallback(() => {
    const path = prompt("file path?");
    if (!path) {
      return;
    }
    const newFiles = [...files];
    newFiles.push({ path, content: "" });
    setFiles(newFiles);
  }, [setFiles, files]);

  const updateFile = useCallback(
    (index: number, newName: string | null) => {
      let newFiles = [...files];
      if (newName) {
        newFiles[index].path = newName;
      } else {
        newFiles = newFiles.filter((_, atIndex) => atIndex !== index);
        setActiveFileIndex(0);
      }
      setFiles(newFiles);
    },
    [setFiles, files, setActiveFileIndex]
  );
  const [productionContent, setProductionContent] = useState('');
  const debouncedCode = useDebounce(code, 1000);
  const preview = useRef<HTMLIFrameElement>(null);
  const [autoRun, setAutoRun] = useState(false);
  const { push } = useRouter();

  const update = useCallback(() => {
    const mainIndex = files.findIndex((file) => file.path === "index.html");
    const paths = files.map((file) => file.path);
    const newFilesContent = files.map((file, index) => ({...file, index}));
    if (mainIndex !== -1) {
      const processFile = (file: any) => {
        const newIndex = newFilesContent.findIndex((newFile) => newFile.index === file.index);

        let content = file.content;
        for (let i = 0; i < paths.length; i++) {
          console.log({content, paths})
          const search = `"${paths[i]}`;
          const replacement = newFilesContent.find((newFileItem) => newFileItem.index === i);
          if (content.indexOf(search) !== 0) {
            content = content.replaceAll(search, `"${makeDataURIFromFile(replacement!)}`);
          }
          const search2 = `'${paths[i]}`;
          if (content.indexOf(search) !== 0) {
            console.log('replacing');
            content = content.replaceAll(search2, `'${makeDataURIFromFile(replacement!)}`);
          }
        }
        console.log('new content', content);
        newFilesContent[newIndex].content = content;
      }

      newFilesContent.reverse().map(processFile);


        const main = newFilesContent.find((file) => file.index === mainIndex);
      if (preview.current && main?.content) {
        setProductionContent(main.content);
        preview.current.srcdoc = main.content;
      }
    }
  }, [preview, code, files, setProductionContent]);

  console.log({productionContent})
  useEffect(() => {
    if (autoRun && debouncedCode) {
      update();
    }
  }, [debouncedCode, autoRun, update]);

  const mint = useCallback(() => {
    const mintCode = JSON.stringify({ code: productionContent, type: "p5js" });
    console.log({mintCode});
    window.localStorage.setItem("mint", mintCode);
    push("/mint");
  }, [code, productionContent]);

  return (
    <>
      <div className="flex">
        <button className="p-3" onClick={update}>
          run
        </button>
        <label>
          autorun:{" "}
          <input
            type="checkbox"
            onChange={(e) => setAutoRun(e.target.checked)}
            checked={autoRun}
          />
        </label>
        <button onClick={mint}>mint</button>
      </div>
      <div className="flex">
        <div className="flex row">
          <div className="tabs pl-2">
            {files.map((file, index) => (
              <FileItem
                key={file.path}
                index={index}
                active={activeFileIndex === index}
                path={file.path}
                setActiveFileIndex={setActiveFileIndex}
                updateFile={updateFile}
              />
            ))}
            <button onClick={addFile}>New +</button>
          </div>
          <Editor
            height="100vh"
            width="50vw"
            theme="vs-light"
            language={getLanguageForPath(files[activeFileIndex].path)}
            path={files[activeFileIndex].path}
            defaultLanguage={"javascript"}
            onChange={(data) => setCode(data || "")}
            value={code}
          />
        </div>
        <iframe
          ref={preview}
          style={{
            height: "100vh",
            width: "49vw",
          }}
          src=""
        ></iframe>
        {/* <EmbedP5JSFrame isPlaying={true} files={files} /> */}
      </div>
    </>
  );
}
