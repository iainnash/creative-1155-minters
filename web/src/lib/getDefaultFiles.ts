import { DEFAULT_P5JS_SKETCH, DEFAULT_HTML_FILE } from "@/templates/p5-js";
import {
  BLANK_JAVASCRIPT_SCRIPT,
  PLAIN_CSS_STYLES,
  PLAIN_HTML_FILE,
} from "@/templates/vanilla";

export function getDefaultFiles(path: string) {
  if (path === "p5js") {
    return [
      { path: "index.html", content: DEFAULT_HTML_FILE },
      { path: "sketch.js", content: DEFAULT_P5JS_SKETCH },
    ];
  }

  // vanilla default
  return [
    { path: "index.html", content: PLAIN_HTML_FILE },
    { path: "script.js", content: BLANK_JAVASCRIPT_SCRIPT },
    { path: "styles.css", content: PLAIN_CSS_STYLES },
  ];
}
