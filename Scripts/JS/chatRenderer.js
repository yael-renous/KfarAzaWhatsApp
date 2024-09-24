let chatReader;
let userData = {};
let messages = [];
let userIcons = {};
const censorString = "צנזורמערכתי";


//------ chat assets ------
let chatBgImage;
let topBarColor;
let textColor;
let timestampColor;
let font;
let topBarHeight;
let bottomBarHeight;

let chatBoxBgColor;
let redChatBoxColor;
let yellowChatBoxColor;


let endOfChatYPos;
let startOfChatYPos;
const relativeMaxNumOfCharsInLine = 0.05;
const relativeMessageFontSize = 0.018; // Relative to canvas height
const relativeTimestampFontSize = 0.013; // Relative to canvas height
const relativeUserIconSize = 0.04; // Relative to canvas height
const relativeUserIconXPadding = 0.0135; // Relative to canvas height
const relativeUserIconYPadding = 0.003; // Relative to canvas height
const relativeBlurAmount = 0.01; // Relative to canvas height
const relativeChatBoxRadius = 0.03; // Relative to canvas width

let maxNumOfCharsInLine;
let distanceBetweenUsernameAndMessage;
let distanceBetweenTimeAndMessage;
let distanceBetweenMessages;
let messageXOffset;
let timeXOffset;
let wholeMessagePadding;
let chatBoxYPadding;
let chatBoxXPadding;
let messageFontSize;
let timestampFontSize;
let userIconSize;
let userIconXPadding;
let userIconYPadding;
let blurPixels;
let chatBoxRadius;
// -----------------------

//------ chat data ------
let chat;
let currentTime;
let currentDate;
//-----------------------

//-----------------------

function preload() {
  console.log("preloading");

}

function setup() {
  console.log("setup");
  createButtons();
}

function initChatRenderer(){
  topBarColor = "#016b61";
  chatBoxBgColor = "#ffffff";
  redChatBoxColor = "#bd0202";
  yellowChatBoxColor = "#f5d9z05";
  timestampColor = "grey";
  textColor = color(0, 0, 0);
  chatReader = new WhatsAppReader();

  calculateFinalSizes();
  textFont('Arial');
}


function calculateFinalSizes() {
  topBarHeight = windowHeight * 0.1;
  bottomBarHeight = windowHeight * 0.08;
  startOfChatYPos = topBarHeight + windowHeight * 0.01;
  endOfChatYPos = windowHeight - bottomBarHeight - windowHeight * 0.03;

  distanceBetweenUsernameAndMessage = windowHeight * 0.025;
  distanceBetweenTimeAndMessage = windowHeight * 0.005;
  distanceBetweenMessages = windowHeight * 0.05;
  messageXOffset = windowWidth * 0.03;
  timeXOffset = windowWidth * 0.01;
  wholeMessagePadding = windowWidth * 0.15;
  chatBoxYPadding = windowHeight * 0.015;
  chatBoxXPadding = windowWidth * 0.02;

  messageFontSize = relativeMessageFontSize * windowHeight;
  timestampFontSize = relativeTimestampFontSize * windowHeight;
  userIconSize = relativeUserIconSize * windowHeight;
  userIconXPadding = relativeUserIconXPadding * windowHeight;
  userIconYPadding = relativeUserIconYPadding * windowHeight;
  blurPixels = Math.round(relativeBlurAmount * windowHeight);
  chatBoxRadius = relativeChatBoxRadius * windowWidth;

  // Calculate max number of characters in a line based on message size and width of the screen
  let sampleText = "כ"; // Use a sample character to estimate width
  textSize(messageFontSize);
  let charWidth = textWidth(sampleText);
  maxNumOfCharsInLine = Math.floor((windowWidth - wholeMessagePadding-messageXOffset) / charWidth);
}

async function loadChat(chat) {
  initChatRenderer();
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
  return messages;
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
      userData[rawUserData[i].username] = { img: img, color: rawUserData[i].color, status: rawUserData[i].status };
    }
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
  console.log("rendering chat images");
  for (let message of messages) {
    let messageGraphic = createGraphics(windowWidth, message.height + chatBoxYPadding * 2);
    messageGraphic.textFont('Arial');

    drawChatBox(messageGraphic, message, userData);
    drawUsername(messageGraphic, message, userData);
    drawMessageContent(messageGraphic, message, censorString, textColor);
    drawTimestamp(messageGraphic, message, timestampColor);

    message.graphic = messageGraphic;
  }
}

function drawBlurredText(graphic, text, x, y, color) {
  graphic.push();
  let blurColor = color;
  let alphaValue =1;
  if(windowWidth<800)
    alphaValue = 4;
  // console.log(alphaValue);
  blurColor.setAlpha(alphaValue);
  graphic.fill(blurColor);
  for (let i = -0; i < blurPixels; i++) {
    for (let j = -0; j < blurPixels; j++) {
      graphic.text(text, x - i, y + j);
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

  graphic.textSize(messageFontSize);
  let contentWidth = graphic.textWidth(message.message);
  let usernameEndX = graphic.width - wholeMessagePadding - graphic.textWidth(':שם משתמש') - chatBoxXPadding;
  let messageEndX = graphic.width - graphic.textWidth(message.message) - messageXOffset - wholeMessagePadding - chatBoxXPadding;

  graphic.textSize(timestampFontSize);
  let timestampWidth = graphic.textWidth(message.time);
  let timestampOffset = graphic.width - wholeMessagePadding - messageXOffset - contentWidth - timeXOffset;
  
  let endTimestampX = timestampOffset - timestampWidth - chatBoxXPadding;
  let leftTopX = Math.min(Math.min(messageEndX, endTimestampX), usernameEndX);
  let leftTopY = 0;
  let rightBottomX = width - wholeMessagePadding + chatBoxXPadding;
  let rightBottomY = message.height + chatBoxYPadding;
  graphic.rect(leftTopX, leftTopY, rightBottomX, rightBottomY, chatBoxRadius);
  graphic.pop();
}

function drawUsername(graphic, message, userData) {
  graphic.push();
  graphic.textAlign(RIGHT, TOP);
  graphic.textSize(messageFontSize);
  let username = ':שם משתמש';
  let userColor = color(userData[message.userName].color);

  drawBlurredText(graphic, username, graphic.width - wholeMessagePadding, 0, userColor);

  graphic.pop();
}

function drawMessageContent(graphic, message, censorString, textColor) {
  graphic.push();
  graphic.textAlign(RIGHT, TOP);
  graphic.textSize(messageFontSize);
  graphic.fill(textColor);

  let lines = message.message.split('\n');
  let y = distanceBetweenUsernameAndMessage;

  for (let line of lines) {
    let parts = line.split(censorString);
    let x = graphic.width - wholeMessagePadding - messageXOffset;

    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        drawBlurredText(graphic, censorString, x, y, textColor);
        x -= graphic.textWidth(censorString) + graphic.textWidth(' ');
      }

      if (parts[i] !== "") {
        graphic.text(parts[i] + '\u200F', x, y);
        x -= graphic.textWidth(parts[i] + '\u200F');
      }
    }

    y += messageFontSize;
  }

  graphic.pop();
}

function drawTimestamp(graphic, message, timestampColor) {
  graphic.push();
  graphic.textSize(messageFontSize);
  let contentWidth = graphic.textWidth(message.message);
  let timestampOffset = graphic.width - wholeMessagePadding - messageXOffset - contentWidth - timeXOffset;
  graphic.textAlign(LEFT, TOP);
  graphic.textSize(timestampFontSize);
  graphic.fill(timestampColor);
  graphic.text(message.time, timestampOffset, message.height - timestampFontSize + distanceBetweenTimeAndMessage);
  graphic.pop();
}

function calculateMessageHeight(message) {
  let lines = message.message.split('\n').length;
  let messageHeight = lines * messageFontSize;
  return messageHeight
    + timestampFontSize
    + distanceBetweenUsernameAndMessage
    + distanceBetweenTimeAndMessage;
}
