

let chatReader;
let messages = [];
let font;
let canvasWidth = 360;  // Typical width of a narrow smartphone screen
let canvasHeight = 640; // Height based on 16:9 aspect ratio


function preload() {
  //font = loadFont('path/to/your/font.ttf'); // Load a font that supports Hebrew
}

function setup() {
  createCanvas((windowHeight*9)/16, windowHeight);
  textSize(14);

  if (typeof WhatsAppReader !== 'undefined') {
    chatReader = new WhatsAppReader();
    console.log('WhatsAppReader is defined');
    loadChat('bulgaria'); // Load the chat directly with its Hebrew name


  } else {
    console.error('WhatsAppReader is not defined. Make sure whatsappReader.js is loaded correctly.');
  }

}

function draw() {
  background(240);
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
  let y = 10;
  let distanceBetweenMessages = 80;
  let distanceBetweenUsernameAndMessage = 20;
  let distanceBetweenTimeAndMessage = 40
  let messageXOffset = 30
  let timeXOffset = 190
  textAlign(RIGHT, TOP);
  for (let message of messages) {
    //censored username
    text(':שם משתמש'  , canvasWidth , y);
    //message
    text(message.message, canvasWidth-messageXOffset ,y+distanceBetweenUsernameAndMessage);
    //time
    text(message.time, canvasWidth-timeXOffset, y+distanceBetweenTimeAndMessage);
    y += distanceBetweenMessages;
    
  }
}
