let chatReader;
let messages = [];
let font;
let canvasWidth = 360;  // Typical width of a narrow smartphone screen
let canvasHeight = 640; // Height based on 16:9 aspect ratio
let textWidth = 200;

let lastMessageY =10;
let scrollOffset = 0;
let targetScrollOffset = 0;
const scrollSpeed = 0.1; // Adjust this value to change the scroll speed
let shouldScroll = false;
let scrollAmount = 10; 
const fontSize =14;

let autoPlayInterval;
let isAutoPlaying = false;
const autoPlayDelay = 1000; // 1 second delay

function preload() {
  //font = loadFont('path/to/your/font.ttf'); // Load a font that supports Hebrew
}

function setup() {
  createCanvas((windowHeight*9)/16, windowHeight);
  // textSize(fontSize);
  // textWrap(WORD);

  if (typeof WhatsAppReader !== 'undefined') {
    chatReader = new WhatsAppReader();
    console.log('WhatsAppReader is defined');
    loadChat('bulgaria'); // Load the chat directly with its Hebrew name
  } else {
    console.error('WhatsAppReader is not defined. Make sure whatsappReader.js is loaded correctly.');
  }
  //TODO: remove this button
  let autoPlayButton = createButton('Auto Play');
  autoPlayButton.position(10, 10);
  autoPlayButton.mousePressed(toggleAutoPlay);

}

function drawUI(){


  // drawTopBar();
  // drawChatArea();
  drawBottomBar();  
}

function drawTopBar() {
  fill(0);
  rect(0, 0, canvasWidth, 50);
  fill(255);
  textAlign(LEFT, CENTER);
  text("19:37:02 7 באוקטובר", 10, 25);
  textAlign(RIGHT, CENTER);
  text("Group Chat Name", canvasWidth - 10, 25);
}

// function drawChatArea() {
//   // Your existing chat display logic goes here
// }

function drawBottomBar() {
  fill('red');
  // rectMode(BOTTOM);
  rect(0, canvasHeight-10, canvasWidth, 10);
  // Draw input field and icons here
}


function toggleAutoPlay() {
  isAutoPlaying = !isAutoPlaying;
  if (isAutoPlaying) {
    autoPlayInterval = setInterval(loadNextMessage, autoPlayDelay);
  } else {
    clearInterval(autoPlayInterval);
  }
}

function draw() {
  background('black');
  drawUI();
  displayMessages();
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    loadNextMessage();
  }
}

async function loadChat(chatName) {
  let success = await chatReader.loadChat(chatName);
  if (success) {
    console.log(`Loaded chat: ${chatName}`);
    loadNextMessage();
  } else {
    console.error(`Failed to load chat: ${chatName}`);
  }
}

function loadNextMessage() {
  let message = chatReader.getNextMessage();
  if (message) {
    messages.push(message);
    if (messages.length > 20) {
      messages.shift(); // Remove the oldest message if we have more than 20
    }
  } else {
    console.log('No more messages');
  }
}

function displayMessages() {
  fill('white');
  let distanceBetweenMessages = 10;
  let distanceBetweenUsernameAndMessage = 20;
  let distanceBetweenTimeAndMessage = 40;
  let messageXOffset = 30;
  let timeXOffset = 190;

  textAlign(RIGHT, TOP);
  for (let i = 0; i < messages.length; i++) {
      let message = messages[i];
      message.height = fontSize*3 + distanceBetweenUsernameAndMessage + distanceBetweenTimeAndMessage;
      if(i>0){
        message.y = messages[i-1].y + messages[i-1].height + distanceBetweenMessages;
      }
      if(message.y+message.height>=canvasHeight-lastMessageY){
        scrollMessages();
      }
      //censored username
      text(':שם משתמש', canvasWidth, message.y);
      //message
      text(message.message, canvasWidth-messageXOffset, message.y+distanceBetweenUsernameAndMessage);
      //time
      text(message.time, canvasWidth-timeXOffset, message.y+distanceBetweenUsernameAndMessage+distanceBetweenTimeAndMessage);
  }
}

function scrollMessages(){
  for (let message of messages) {
    message.y -= scrollAmount;
  }
}

function textHeight(text, maxWidth) {
  var words = text.split(' ');
  var line = '';
  var h = this._textLeading;

  for (var i = 0; i < words.length; i++) {
      var testLine = line + words[i] + ' ';
      var testWidth = drawingContext.measureText(testLine).width;

      if (testWidth > maxWidth && i > 0) {
          line = words[i] + ' ';
          h += this._textLeading;
      } else {
          line = testLine;
      }
  }

  return h;
}
