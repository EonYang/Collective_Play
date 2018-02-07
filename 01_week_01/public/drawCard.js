let cards = [];
let username = '';
let choice;
let localResults = [];
let resultsAreReady = 0;
let img;
let textResult = '';
let resultTitile = '';

let abcd = ['1', '2', '3', '4'];

let playerNameSetted = 0;
let playerDidChoose = 0;

let socket = io();

function preload() {
  imgCardBack = loadImage('card_back_black.png')
}

function setup() {
  imageMode(CENTER);
  rectMode(CENTER);
  frameRate(30);
  createCanvas(windowWidth, windowHeight);
  background(255);

  // Select input and listen for changes
  select("#username").input(usernameChanged);

  // Listen for confirmation of connection
  socket.on('connect', function() {
    console.log("Connected");
  });

  // Receive results from server
  socket.on('results',
    function(results) {
      console.log(results);
      localResults = results;
      ShowResults(localResults);
    }
  );

  for (var i = 0; i < 4; i++) {
    cards.push(new Card(i));
  }
}

function draw() {
  background(255);
  if ((frameCount % 60) == 1) {
    console.log(cards[1]);
    console.log(playerNameSetted, playerDidChoose);
  }

  ShowInstruction();

  if (playerNameSetted == 1 && playerDidChoose == 0) {
    for (var i = 0; i < cards.length; i++) {
      cards[i].show();
    }
  }

  if ((frameCount - timeClick) >= 60) {
    playerDidChoose = 1;
  }
}

class Card {
  constructor(number) {
    this.number = number;

    this.stage = 1;
    this.x = ((this.number + 1) * 2 - 1) * windowWidth / 8;
    this.y = windowHeight / 2;
    this.w = windowWidth / 6;
    this.h = windowWidth / 4;

    this.sub = 0;
  }

  show() {
    if (this.stage == 1) {
      image(imgCardBack, this.x, this.y, this.w, this.h);
    }
    if (this.stage == 2 && this.sub < this.w) {
      this.sub += this.w / 10.1;
      image(imgCardBack, this.x, this.y, this.w - this.sub, this.h);
      if (this.sub >= this.w) {
        this.stage = 3;
      }
    }
    if (this.stage == 3 && this.sub >= 0) {
      this.sub -= this.w / 10.1;
      stroke(0);
      fill(255);
      rect(this.x, this.y, this.w - this.sub, this.h);
      if (this.sub <= 0) {
        this.stage = 4;
      }
    }
    if (this.stage == 4) {
      stroke(0);
      fill(255);
      rect(this.x, this.y, this.w, this.h)
      textAlign(CENTER);
      textSize(32);
      fill(0);
      text(abcd[this.number], this.x, this.y);
      FlipOtherCards();
    }
  }
}


function mouseReleased() {
  if (playerDidChoose == 0) {
    for (var i = 0; i < 4; i++) {
      let card = cards[i];
      choice = i;
      rectButton(card.x, card.y, card.w, card.h, EmitChoice);
    }
  }
}

function usernameChanged() {
  playerNameSetted = 1;
  username = this.value();
  socket.emit('username', this.value());
}


function rectButton(x, y, w, h, callback) {
  var hit = false;

  hit = collidePointRect(mouseX, mouseY, x - w / 2, y - h / 2, w, h); //see if the mouse is in the rect

  if (hit) { //if its inside fire the callback
    callback(hit);
  }
}

function EmitChoice(callbackData) {
  console.log('emit function called');
  FlipChoosenCard(choice);
  socket.emit('data', choice);
  console.log(choice);
}

function ShowInstruction() {
  if (playerNameSetted == 0) {
    console.log("waiting to set username");
    fill(0);
    textAlign(CENTER);
    textSize(32);
    text("Please Enter Your Name To Start", width / 2, height / 2);
  }

  if (playerNameSetted == 1 && playerDidChoose == 0) {

    fill(0);
    textAlign(CENTER);
    textSize(32);
    text("Now, " + username + ", \n Please Choose One Card Instinctually", width / 2, height / 5);
    // text(" Please Choose One Card Instinctually", width/2, height/4);
  }

  if (playerNameSetted && resultsAreReady && playerDidChoose) {
    fill(0);
    textAlign(LEFT);
    textSize(32);
    text(resultTitile, 20, height / 8, );
    textSize(14);
    text(textResult, 20, height / 5, );
    textSize(24);
    text("When you see some touch question in a examnation, \n I guess you will make the same choice as today you do.\n" +
      "Are you curious about what will other people choose? \n" +
      "Please share this page to them, \n so the data would be more interesting.", 20, height / 1.8, );

    // let finalResult = createP(textResult);
    // finalResult.style('width', width - 80)
    // noLoop();
  }
}


function ShowResults(localResults) {

  if (playerDidChoose && playerNameSetted) {

    let percents = [];
    let totalPeople = 0;

    for (var i = 0; i < 4; i++) {
      totalPeople += localResults[i].length;
    }
    console.log("totalPeople  ", totalPeople);

    for (var i = 0; i < 4; i++) {
      percents.push(
        str(floor(localResults[i].length * 10000 / totalPeople) / 100) + "%"
      )
    }
    console.log("percents: ", percents);

    resultTitile = str(localResults[choice].length) + " people(" + str(percents[choice]) + " ) did the same choice with you.";
    textResult = percents[0] + " of people like choosing the first item, they are:\n  " + str(localResults[0]) + "\n \n " +
      percents[1] + " of people like choosing the 2nd item, they are:\n " + str(localResults[1]) + "\n \n " +
      percents[2] + " of people like choosing the 3rd item, they are: \n " + str(localResults[2]) + "\n \n " +
      percents[3] + " of people like choosing the 4th item, they are: \n " + str(localResults[3]) + "\n \n ";

    resultsAreReady = 1;
  }
}

let timeClick;

function FlipChoosenCard(choice) {
  timeClick = frameCount;
  cards[choice].stage = 2;
}

function FlipOtherCards() {
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].stage == 1) {
      cards[i].stage = 2;
    }
  }
}
