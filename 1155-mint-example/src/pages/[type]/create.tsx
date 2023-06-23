import Editor from "@monaco-editor/react";

export default function CreatePage() {
  return (
    <>
      <div>
        <button>code</button>
        <button>preview</button>
      </div>
      <Editor
        height="50vh"
        theme="vs-light"
        path={"/main"}
        defaultLanguage={"html"}
        defaultValue=""
      />
      <iframe height="50vh" width="100vw" src=""></iframe>
    </>
  );
}
