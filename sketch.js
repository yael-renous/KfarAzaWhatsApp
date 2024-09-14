let chatReader;
let messages = [];
let font;
let canvasWidth = 360;  // Typical width of a narrow smartphone screen
let canvasHeight = 640; // Height based on 16:9 aspect ratio

let lastMessageY =10;
let scrollOffset = 0;
let targetScrollOffset = 0;
const scrollSpeed = 0.1; // Adjust this value to change the scroll speed

const textHeight =14;

function preload() {
  //font = loadFont('path/to/your/font.ttf'); // Load a font that supports Hebrew
}

function setup() {
  createCanvas((windowHeight*9)/16, windowHeight);
  textSize(textHeight);

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
  // Smoothly update the scroll offset
  scrollOffset = lerp(scrollOffset, targetScrollOffset, scrollSpeed);

  let y = 10 - scrollOffset;
  let distanceBetweenMessages = 80;
  let distanceBetweenUsernameAndMessage = 20;
  let distanceBetweenTimeAndMessage = 40;
  let messageXOffset = 30;
  let timeXOffset = 190;
  textAlign(RIGHT, TOP);
  for (let i = 0; i < messages.length; i++) {
      let message = messages[i];

      message.y = 
      //censored username
      text(':שם משתמש', canvasWidth, message.y);
      //message
      text(message.message, canvasWidth-messageXOffset, message.y+distanceBetweenUsernameAndMessage);
      //time
      text(message.time, canvasWidth-timeXOffset, message.y+distanceBetweenTimeAndMessage);
    y += distanceBetweenMessages;
  }
}
