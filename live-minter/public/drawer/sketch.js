let port;
let connectBtn;

let stringInput = "";
let curveAmount = 4;
let strokeColorLine;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255, 0, 200);
  console.log("setup");
  background(220);
  
  strokeColorLine = color("blue");

  connectBtn = createButton("Connect");
  connectBtn.position(0, 0);
  connectBtn.mousePressed(connectBtnClick);
  port = createSerial();
  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    port.open(usedPorts[0], 19200);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // this makes received text scroll up
  
  //copy(0, 0, width, height, 0, -1, width, height);
  if (port) {
    
    // reads in complete lines and prints them at the
    // bottom of the canvas
    let string = port.readUntil("\n");
    stringInput = string;
    if (string.length > 0) {
      fill(color("gray"));
      rect(width, 10, height - 20, 0);
      text(string, 10, height - 20);
    }
    // changes button label based on connection status
    if (!port.opened() && connectBtn) {
      connectBtn.html("Connect");
    } else {
      connectBtn.html("Disconnect");
    }
  } else {
    stringInput = '';
  }
  
  if (stringInput.includes("left")) {
    curveAmount += 2;
    if (curveAmount > width) {
      curveAmount = width - 20;
    }
    strokeColorLine = color(random(10, 200), random(0, 255), random(0, 100));
  }
  if (stringInput.includes("forward")) {
    curveAmount -= 2;
    if (curveAmount < 5) {
      curveAmount = 15;
    }
    strokeColorLine = color(random(10, 200), random(0, 255), random(0, 100));
  }
  
  background(255, 255, 255, 2);
  
  
  for (var i = 0; i < width; i += width / 38) {
    noFill();
    stroke(strokeColorLine);
    strokeWeight(1);
    //x1, y1, x2, y2, x3, y3, x4, y4
    bezier(i, 30, i, height - width / 4, i + (width - curveAmount * 2), 10, i - curveAmount, height - 40);
  }
  for (var i = 0 ; i < width; i += width / 38) {
    noFill();
    stroke(strokeColorLine);
    strokeWeight(1);
    //x1, y1, x2, y2, x3, y3, x4, y4
    bezier(i, 30, i, height - width / 4, i - (width - curveAmount * 2), 10, i + curveAmount, height - 40);
  }
  
  
  

}

function connectBtnClick() {
  if (!port.opened()) {
    port.open("Arduino", 57600);
  } else {
    port.close();
  }
}
