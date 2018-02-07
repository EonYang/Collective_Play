// Open and connect input socket
let socket = io('/input');

let myName;
let userStartTime;
let userCurrentRotation = [];
let zenDuration;

let input, button, divInput;

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");
});

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER);

  // push
  divInput = createDiv('');
  divInput.style('width','80%');
  divInput.style('height','240px');
  divInput.style('max-width', '320px');

  input = createInput();
  // input.position(0,0);
  input.style('margin', '4px')
  input.style('width', '65%')
  input.style('height', '48px')

  button = createButton('Submit');
  // button.position(width/2, input.y + 32);
  button.style('width', '25%')
  button.style('height', '48px')
  button.style('margin', '4px')
  button.mousePressed(ZenStart);

  divInput.child(input);
  divInput.child(button);
  divInput.center();

}

function draw() {
  background(255);
  noStroke();
  fill(0);

  showInstruction();

  showDuration();

}

function ZenStart() {
  myName = input.value();
  userStartTime = new Date().getTime();
  let nameAndStartTime = {
    name: myName,
    startTime: userStartTime,
  }
  socket.emit('newUser', nameAndStartTime);
  input.style("display", "none");
  button.style("display", "none");
}

function deviceMoved() {
  userStartTime = new Date().getTime();
  socket.emit('zenInterupted', userStartTime);
}

function showInstruction() {
  let instruction;
  if (myName == null) {
    instruction = "Submit Your Name to Join"
  } else {
    instruction = myName + ", young apprentice.\n Today you will meditate. \n Don't touch your phone, \n you will be feeling it in seconds"
  }

  push();
  translate(width / 2, height / 5);
  textAlign(CENTER);
  textSize(width/16);
  text(instruction, 0, 0);
  pop();

}

function showDuration() {
  if (userStartTime && myName != null) {
    let now = new Date().getTime();
    zenDurationSeconds = floor((now - userStartTime) / 1000);
    push();
    textAlign(CENTER);
    translate(width / 2, height / 1.2);
    textSize(96);
    let minutes = floor(zenDurationSeconds / 60);
    let seconds = zenDurationSeconds % 60;
    text(minutes + "' " + seconds + '"', 0, 0);
  }
}
