export const TEMPLATE = (title: string, sketch: string) => `
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body {
        padding: 0;
        margin: 0;
        background-color: #1b1b1b;
      }
    </style>
    <script src="/p5js/p5-all.min.js"></script>
    <script>
      ${sketch}
    </script>
  </head>

  <body>
    <main></main>
  </body>
</html>
`;

export const DEFAULT_HTML_FILE = `<!DOCTYPE html>
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


export const DEFAULT_P5JS_SKETCH = `
function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    background(220);
    fill(color('red'));
    circle(width/2, height/2, width/4);
}
`;
