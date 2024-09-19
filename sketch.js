let chatReader;
let messages = [];
// let groupData = require('./groupData');

//------ chat assets ------
let chatBgImage;
let barColors;
let textColor;
let font;
let topBarHeight = 100;
let bottomBarHeight = 80;

let chatBoxBgColor;
let textWidth = 200;
let endOfChatYPos = 10;
let startOfChatYPos = 10;
let scrollAmount = 10;
const fontSize = 14;
let distanceBetweenUsernameAndMessage =12 ;
let distanceBetweenTimeAndMessage =20 ;
let distanceBetweenMessages =20 ;

// -----------------------

//------ chat data ------
let chat;
let currentTime;
let currentDate;
//-----------------------

//------ auto play ------
let autoPlayInterval;
let isAutoPlaying = false;
const autoPlayDelay = 1000; // 1 second delay

//-----------------------

function preload() {
  chatBgImage = loadImage('Assets/Images/whatsapp_bg.jpg'); // Load the WhatsApp background image
  barColors = "#fcfbf9";
  chatBoxBgColor = "#fcfbf9";
  textColor = color(0, 0, 0);
  startOfChatYPos = topBarHeight + 10;
}

function setup() {
  createCanvas((windowHeight * 9) / 16, windowHeight);
  endOfChatYPos = height - bottomBarHeight-30;

  if (typeof WhatsAppReader !== 'undefined') {
    chatReader = new WhatsAppReader();
    console.log('WhatsAppReader is defined');

    chat = groups.tweeters;
    loadChat(chat); // Load the chat directly with its Hebrew name
  } else {
    console.error('WhatsAppReader is not defined. Make sure whatsappReader.js is loaded correctly.');
  }
  let autoPlayButton = createButton('Auto Play');
  autoPlayButton.position(10, 10);
  autoPlayButton.mousePressed(toggleAutoPlay);
}

///----- Draw Functions -----

function drawUI() {
  drawTopBar();
  drawTimeTicker();
  drawBottomBar();
}

function drawTopBar() {
  push();
  //bar
  stroke("#dadada")
  fill(barColors);
  rect(0, 0, width, 90);

  //group name
  fill("black");
  textSize(18);
  textAlign(CENTER, TOP);
  //console.log(chat.title);
  text(chat.title, width/2, topBarHeight/2);
  //group icon
  pop();
}

function drawTimeTicker() {
  push();
  const tickerbackground = "black";
  let date = "7 באוקטובר";
  let time = "19:37:02";
  const tickerTextColor = "white";
  const tickerFontSize = 18;
  const tickerX = width / 2;
  const tickerY = topBarHeight / 4;

  rectMode(CENTER)

  fill(tickerbackground);
  rect(tickerX, tickerY, textWidth, tickerFontSize * 2, 300, 300, 300, 300);
  fill(tickerTextColor);
  text(date, tickerX - date.length * tickerFontSize / 2, tickerY);
  text(time, tickerX + date.length * tickerFontSize / 2, tickerY);
  pop();
}

function drawBottomBar() {
  push();
  stroke("#dadada")
  fill(barColors);
  rect(0, height - 80, width, 80);
  // Draw input field and icons here

  pop();
}

function draw() {
  background(chatBgImage); // Use the loaded image as background
  displayMessages();
  drawUI();
}


async function loadChat(chat) {
  let success = await chatReader.loadChat(chat.englishName);
  if (success) {
    console.log(`Loaded chat: ${chat.englishName}`);
    messages = chatReader.getAllMessages(); 
    setMessageYPositions();
    // updateDisplayedMessages();
  } else {
    console.error(`Failed to load chat: ${chat.englishName}`);
  }
}


function setMessageYPositions() {
  for (let i = 0; i < messages.length; i++) {
    messages[i].y = startOfChatYPos + i * 100;
  }
}

function displayMessages() {
  push();
  textAlign(RIGHT, TOP);
 // let y = startOfChatYPos;
  let messageXOffset = 30;
  let timeXOffset = 90;
  //let messageWidth =-200 ;
  for (let message of messages) {
    message.height = calculateMessageHeight(message);
    
    // Display message
    fill('red');
    text(':שם משתמש', width, message.y);
   // rectMode(CORNERS)
   
    text(message.message + '\u200F', width - messageXOffset, message.y + distanceBetweenUsernameAndMessage);
    text(message.time, width - timeXOffset, message.y + distanceBetweenUsernameAndMessage + distanceBetweenTimeAndMessage);
    
  }
  pop();
}


// function getTotalMessagesHeight() {
//   return messages.reduce((total, msg) => total + calculateMessageHeight(msg) + distanceBetweenMessages, 0);
// }

// function getAverageMessageHeight() {
//   // You might want to calculate this once and cache it
//   return getTotalMessagesHeight() / messages.length;
// }

function calculateMessageHeight(message) {
  // Calculate the number of lines in the message
  let lines = message.message.split('\n').length;
  // Adjust the height based on the number of lines
  let messageHeight = lines * fontSize;
  // Add extra space for username and time
  return (fontSize * 2 )+messageHeight + distanceBetweenUsernameAndMessage + distanceBetweenTimeAndMessage;
}



function mouseWheel(event) {
    //block up scrolling before the first message
  if(messages[0].y-(event.delta)>startOfChatYPos){
    return;
  }
  //block down scrolling before the last message
  if(messages[messages.length-1].y-(event.delta)<endOfChatYPos-100){
    return;
  }
  for (let i=0;i<messages.length;i++) {
  
  
    messages[i].y = messages[i].y-(event.delta);
  }
  return false; // Prevent default scrolling
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

function toggleAutoPlay() {
  if (isAutoPlaying) {
    clearInterval(autoPlayInterval);
    isAutoPlaying = false;
  } else {
    autoPlayInterval = setInterval(loadNextMessage, autoPlayDelay);
    isAutoPlaying = true;
  }
}
