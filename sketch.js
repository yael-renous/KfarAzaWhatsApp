let chatReader;
let userData = {};
let messages = [];
let userIcons = {};
let circleMask;
let isAutoMode = false;


//------ ticker ------
let currentTickerDate;
let currentTickerTime;
//-----------------------


//------ chat assets ------
let chatBgImage;
let barColors;
let textColor;
let timestampColor;
let font;
let topBarHeight = 100;
let bottomBarHeight = 80;

let chatBoxBgColor;
let redChatBoxColor;
let yellowChatBoxColor;

// let textWidth = 200;
let endOfChatYPos = 10;
let startOfChatYPos = 10;
const messageFontSize = 18;
const timestampFontSize = 12;
let distanceBetweenUsernameAndMessage = 25;
let distanceBetweenTimeAndMessage = 10;
let distanceBetweenMessages = 50;
let messageXOffset = 30;
let timeXOffset = 10;
let wholeMessagePadding = 50;
let chatBoxYPadding = 10;
let chatBoxXPadding = 20;
const userIconSize = 30; // Diameter of the icon
const userIconXPadding = 8;
const userIconYPadding = 2;
// -----------------------

//------ chat data ------
let chat;
let currentTime;
let currentDate;
let maxNumOfCharsInLine = 30;
//-----------------------

//------ auto play ------
let autoPlayInterval;
let isAutoPlaying = true;
const autoPlayDelay = 1000; // 1 second delay

//-----------------------

function preload() {
  chatBgImage = loadImage('Assets/Images/whatsapp_bg.jpg');
  circleMask = loadImage('Assets/image-mask.png');// Load the WhatsApp background image
  barColors = "#fcfbf9";
  chatBoxBgColor = "#fcfbf9";
  redChatBoxColor = "#bd0202";
  yellowChatBoxColor = "#f5d905";
  timestampColor = "grey";
  textColor = color(0, 0, 0);
  startOfChatYPos = topBarHeight + 10;

}


function setup() {
  createCanvas((windowHeight * 9) / 16, windowHeight);

  endOfChatYPos = height - bottomBarHeight - 30;
  textFont('Arial');

  if (typeof WhatsAppReader !== 'undefined') {
    chatReader = new WhatsAppReader();
    console.log('WhatsAppReader is defined');

    chat = groups.moms;
    loadChat(chat);

  } else {
    console.error('WhatsAppReader is not defined. Make sure whatsappReader.js is loaded correctly.');
  }
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
  text(chat.title, width / 2, topBarHeight / 2);


  //group icon

  //back button

  //video icon

  //audio icon

  //info icon
  pop();
}

function drawTimeTicker() {
  push();
  rectMode(CENTER);
  fill("black");
  rect(width / 2, topBarHeight / 4, width / 2, messageFontSize, 300, 300, 300, 300);
  // const tickerbackground = "black";
  // let date = "7 באוקטובר";
  // let time = "19:37:02";
  // const tickerTextColor = "white";
  // const tickerFontSize = 18;
  // const tickerX = width / 2;
  // const tickerY = topBarHeight / 4;

  // rectMode(CENTER)

  // fill(tickerbackground);
  // rect(tickerX, tickerY, textWidth, tickerFontSize * 2, 300, 300, 300, 300);
  // fill(tickerTextColor);
  // text(date, tickerX - date.length * tickerFontSize / 2, tickerY);
  // text(time, tickerX + date.length * tickerFontSize / 2, tickerY);
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


function displayMessages() {
  for (let message of messages) {
    image(message.graphic, 0, message.y);

    //draw user icon
    let icon = userData[message.userName].img;
    const iconX = width - userIconXPadding - userIconSize; // Position X
    const iconY = message.y + message.height - 20;
    image(icon, iconX, iconY, userIconSize, userIconSize);
  }
}

function draw() {
  background(chatBgImage); // Use the loaded imagƒme as background
  displayMessages();
  drawUI();
}

//---------------------------------------
async function loadChat(chat) {
  let success = await chatReader.loadChat(chat.englishName);
  if (success) {
    console.log(`Loaded chat: ${chat.englishName}`);
    messages = chatReader.getAllMessages();
    let rawUserData = chatReader.getUserData();
    await loadUserData(rawUserData);
    addMessagesNewLines();
    setMessageYPositions();
    renderMessageImages();
  } else {
    console.error(`Failed to load chat: ${chat.englishName}`);
  }
}

function addMessagesNewLines() {
  for (let i = 0; i < messages.length; i++) {
    let lines = messages[i].message.split('\n');
    let newContent = [];

    for (let line of lines) {
      while (line.length > maxNumOfCharsInLine) {
        let splitIndex = line.lastIndexOf(' ', maxNumOfCharsInLine);
        if (splitIndex === -1) splitIndex = maxNumOfCharsInLine;

        newContent.push(line.substring(0, splitIndex));
        line = line.substring(splitIndex).trim();
      }
      if (line.length > 0) newContent.push(line);
    }

    messages[i].message = newContent.join('\n');
  }
}

async function loadUserData(rawUserData) {
  try {
    for (let i = 0; i < rawUserData.length; i++) {

      let icon = rawUserData[i].icon;
      let img = await loadImage(`Assets/UserIcons/${icon}.png`);
      img.resize(userIconSize, userIconSize);
      userData[rawUserData[i].username] = { img: img, color: rawUserData[i].color, status: rawUserData[i].status }
      // userIcons[rawUserData[i].username] = img;
    }
    // console.log('All user icons loaded' + rawUserData);
  } catch (error) {
    console.error('Error loading user icons:', error);
  }
}

function setMessageYPositions() {
  for (let i = 0; i < messages.length; i++) {
    messages[i].height = calculateMessageHeight(messages[i]);
    let previousMessageY = startOfChatYPos;
    if (i > 0) {
      previousMessageY = messages[i - 1].y + messages[i - 1].height;
    }

    messages[i].y = previousMessageY + distanceBetweenMessages;
  }
}



function renderMessageImages() {
  for (let message of messages) {
    let messageGraphic = createGraphics(width, message.height + chatBoxYPadding * 2);
    // Draw a rectangle around the image for debugging
    // messageGraphic.push();
    // messageGraphic.noFill();
    // messageGraphic.stroke('red');
    // messageGraphic.rect(0, 0, messageGraphic.width, messageGraphic.height);
    // messageGraphic.pop();


    messageGraphic.textFont('Arial');

    drawChatBox(messageGraphic, message, userData);
    drawUsername(messageGraphic, message, userData);

    let censorString = "צנזורמערכתי"; // Replace with your actual censor string
    let blurAmount = 8; // Adjust the blur amount as needed
    drawMessageContent(messageGraphic, message, censorString, blurAmount, textColor);

    let contentWidth = messageGraphic.textWidth(message.message);
    let timestampWidth = messageGraphic.textWidth(message.time);
    let timestampOffset = width - wholeMessagePadding - messageXOffset - contentWidth - timeXOffset;
    drawTimestamp(messageGraphic, message, timestampOffset, timestampColor);

    // Store the graphic in the message object
    message.graphic = messageGraphic;
  }
}

function drawBlurredText(graphic, text, x, y, blurAmount, color) {
  graphic.push();
  let blurColor =color;
  blurColor.setAlpha(2);
  graphic.fill(blurColor);
  for (let i = 0; i < blurAmount; i++) {
    for (let j = 0; j < blurAmount; j++) {
      graphic.text(text, x + i, y + j);
    }
  }
  color.setAlpha(255);
  graphic.pop();
}

function drawChatBox(graphic, message, userData) {
  graphic.push();
  graphic.noStroke();
  graphic.rectMode(CORNERS);
  graphic.drawingContext.shadowOffsetY = 1.3;
  graphic.drawingContext.shadowBlur = 5;
  graphic.drawingContext.shadowColor = 'grey';
  let bgColor = chatBoxBgColor;
  if (userData[message.userName].status == 'M') {
    bgColor = redChatBoxColor;
  } else if (userData[message.userName].status == 'H') {
    bgColor = yellowChatBoxColor;
  }
  graphic.fill(bgColor);

  graphic.textSize(timestampFontSize);
  let contentWidth = graphic.textWidth(message.message);
  let timestampWidth = graphic.textWidth(message.time);
  let timestampOffset = graphic.width - wholeMessagePadding - messageXOffset - contentWidth - timeXOffset;
  graphic.textSize(messageFontSize);
  let messageEndX = graphic.width - graphic.textWidth(message.message) - messageXOffset - wholeMessagePadding - chatBoxXPadding;
  let endTimestampX = timestampOffset - timestampWidth - chatBoxXPadding;
  let leftTopX = Math.min(messageEndX, endTimestampX);
  let leftTopY = 0;
  let rightBottomX = width - wholeMessagePadding + 7;
  let rightBottomY = message.height + chatBoxYPadding;
  graphic.rect(leftTopX, leftTopY, rightBottomX, rightBottomY, 10, 10, 10, 10);
  graphic.pop();
}

function drawUsername(graphic, message, userData) {
  graphic.push();
  graphic.textAlign(RIGHT, TOP);
  graphic.textSize(messageFontSize);
  let username = ':שם משתמש';
  let userColor = color(userData[message.userName].color);
  // userColor.setAlpha(5);
  // graphic.fill(userColor);

  // Apply blur effect to the username
  let blurAmount = 10; // Adjust the blur amount as needed
  drawBlurredText(graphic, username, width - wholeMessagePadding, 0, blurAmount, userColor);

  graphic.pop();
}

function drawMessageContent(graphic, message, censorString, blurAmount, textColor) {
  graphic.push();
  graphic.textAlign(RIGHT, TOP);
  graphic.textSize(messageFontSize);
  graphic.fill(textColor);

  let lines = message.message.split('\n');
  let y = distanceBetweenUsernameAndMessage;

  for (let line of lines) {
    let parts = line.split(censorString);
    let x = width - wholeMessagePadding - messageXOffset;

    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        // Draw the censored string with blur effect
        drawBlurredText(graphic, censorString, x, y, blurAmount, textColor);
        x -= graphic.textWidth(censorString) + graphic.textWidth(' '); // Move x position to the right by the width of the censored string plus a space
      }

      if (parts[i] !== "") {
        // Draw the current part of the message
        graphic.text(parts[i] + '\u200F', x, y);
        x -= graphic.textWidth(parts[i] + '\u200F'); // Move x position to the right by the width of the current part
      }
    }

    y += messageFontSize; // Move y position to the next line
  }

  graphic.pop();
}

function drawTimestamp(graphic, message, timestampOffset, timestampColor) {
  graphic.push();
  graphic.textAlign(RIGHT, TOP);
  graphic.textSize(timestampFontSize);
  graphic.fill(timestampColor);
  graphic.text(message.time, timestampOffset, message.height - timestampFontSize + distanceBetweenTimeAndMessage);
  graphic.pop();
}



function calculateMessageHeight(message) {
  // Calculate the number of lines in the message
  let lines = message.message.split('\n').length;
  // Adjust the height based on the number of lines
  let messageHeight = lines * messageFontSize;
  // Add extra space for username and time
  // console.log("message - " + message.message + " - num of lines - " + lines + " - height - " + messageHeight);
  return messageHeight
    + timestampFontSize
    + distanceBetweenUsernameAndMessage
    + distanceBetweenTimeAndMessage;
}

// function mouseWheel(event) {
//   chatCanvasYOffset -= event.delta;
//   return false;
// }


function mouseWheel(event) {
  //block up scrolling before the first message
  if (messages[0].y - (event.delta) > startOfChatYPos) {
    return;
  }
  //block down scrolling before the last message
  if (messages[messages.length - 1].y - (event.delta) < endOfChatYPos - 100) {
    return;
  }
  for (let i = 0; i < messages.length; i++) {


    messages[i].y = messages[i].y - (event.delta);
  }
  return false; // Prevent default scrolling
}


