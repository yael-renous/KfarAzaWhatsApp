let chatReader;
let userData = {};
let messages = [];
let userIcons = {};
const censorString = "צנזורמערכתי";

//--screen management--
let isLoading = true;
// -------------------

//------ ticker ------
let currentTickerDate;
let currentTickerTime;
//-----------------------

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

//------ auto play ------

let isAutoMode = false;
let currentMessageIndex = 0;
const messageDisplayInterval = 2000; // Time interval in milliseconds (e.g., 2000ms = 2 seconds)
let lastMessageTime = 0;
let displayedMessages = []; // New array to store messages currently displayed on the screen

//-----------------------

function preload() {
  chatBgImage = loadImage('Assets/Images/background-light.jpg');
  topBarColor = "#016b61";
  chatBoxBgColor = "#ffffff";
  redChatBoxColor = "#bd0202";
  yellowChatBoxColor = "#f5d905";
  timestampColor = "grey";
  textColor = color(0, 0, 0);
}

function setup() {

  const urlParams = new URLSearchParams(window.location.search);
  const groupName = urlParams.get('groupName');
  console.log(groupName);
  if (groupName == undefined)
    return;
  createCanvas(windowWidth, windowHeight);

  calculateFinalSizes();
  textFont('Arial');

  if (typeof WhatsAppReader !== 'undefined') {
    chatReader = new WhatsAppReader();
    console.log('WhatsAppReader is defined');

    chat = groups[groupName];
    loadChat(chat);
    isLoading = false;
  } else {
    console.error('WhatsAppReader is not defined. Make sure whatsappReader.js is loaded correctly.');
  }

  window.addEventListener('keydown', handleControlShiftEnter);
}

function handleControlShiftEnter(event) {
  if (event.ctrlKey && event.shiftKey && event.key === 'Enter') {
    console.log('Control + Shift + Enter detected');
    isAutoMode = true;
    cleanView();
    currentMessageIndex = 0;
    lastMessageTime = millis(); // Initialize the timestamp
  }
}


function calculateFinalSizes() {
  topBarHeight = height * 0.1;
  bottomBarHeight = height * 0.08;
  startOfChatYPos = topBarHeight + height * 0.01;
  endOfChatYPos = height - bottomBarHeight - height * 0.03;

  distanceBetweenUsernameAndMessage = height * 0.025;
  distanceBetweenTimeAndMessage = height * 0.005;
  distanceBetweenMessages = height * 0.05;
  messageXOffset = width * 0.03;
  timeXOffset = width * 0.01;
  wholeMessagePadding = width * 0.15;
  chatBoxYPadding = height * 0.015;
  chatBoxXPadding = width * 0.02;

  messageFontSize = relativeMessageFontSize * height;
  timestampFontSize = relativeTimestampFontSize * height;
  userIconSize = relativeUserIconSize * height;
  userIconXPadding = relativeUserIconXPadding * height;
  userIconYPadding = relativeUserIconYPadding * height;
  blurPixels = Math.round(relativeBlurAmount * height);
  chatBoxRadius = relativeChatBoxRadius * width;

  // Calculate max number of characters in a line based on message size and width of the screen
  let sampleText = "כ"; // Use a sample character to estimate width
  textSize(messageFontSize);
  let charWidth = textWidth(sampleText);
  maxNumOfCharsInLine = Math.floor((width - wholeMessagePadding - messageXOffset) / charWidth);
}

///----- Draw Functions -----

function drawUI() {
  drawTopBar();
  drawTimeTicker();
  drawBottomBar();
}

function drawTopBar() {
  push();
  noStroke();
  drawingContext.shadowOffsetY = 1.3;
  drawingContext.shadowBlur = 5;
  drawingContext.shadowColor = 'grey';
  fill(topBarColor);
  rect(0, 0, width, topBarHeight);

  fill("white");
  textSize(height * 0.023);
  textAlign(CENTER, TOP);
  text(chat.title, width / 2, topBarHeight / 2);
  pop();
}

function drawTimeTicker() {
  push();
  rectMode(CENTER);
  fill("black");
  rect(width / 2, topBarHeight / 4, width / 2, height * 0.02, 300, 300, 300, 300);
  pop();
}

function drawBottomBar() {
  push();
  stroke("#dadada");
  fill("white");
  rect(0, height - bottomBarHeight, width, bottomBarHeight);
  pop();
}

function displayAllMessages() {
  for (let message of messages) {
    image(message.graphic, 0, message.y);

    let icon = userData[message.userName].img;
    const iconX = width - userIconXPadding - userIconSize;
    const iconY = message.y + message.height - height * 0.02;
    image(icon, iconX, iconY, userIconSize, userIconSize);
  }
}

function addNextMessage() {
  if (currentMessageIndex < messages.length) {
    let nextMessage = messages[currentMessageIndex];
    displayedMessages.push(nextMessage);
    currentMessageIndex++;

    // Check if the new message is out of the screen
    if (nextMessage.y + nextMessage.height > endOfChatYPos) {
      // Scroll up by the height of the new message plus some padding
      let scrollAmount = nextMessage.height + distanceBetweenMessages + 5;
      handleScroll(-scrollAmount);
    }
  } else {
    isAutoMode = false; // Stop auto mode when all messages are displayed
  }
}
function displayAutoMessages() {
  for (let message of displayedMessages) {
    image(message.graphic, 0, message.y);

    let icon = userData[message.userName].img;
    const iconX = width - userIconXPadding - userIconSize;
    const iconY = message.y + message.height - height * 0.02;
    image(icon, iconX, iconY, userIconSize, userIconSize);
  }
}

function draw() {
  background(chatBgImage);

  if (isAutoMode) {
    let currentTime = millis();
    if (currentTime - lastMessageTime >= messageDisplayInterval) {
      addNextMessage();
      lastMessageTime = currentTime; // Update the timestamp
    }
    displayAutoMessages();
  } else {
    displayAllMessages();
  }

  drawUI();
}

function cleanView() {
  background(chatBgImage);
  setMessageYPositions();
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
  for (let message of messages) {
    let messageGraphic = createGraphics(width, message.height + chatBoxYPadding * 2);
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
  let alphaValue = 1;
  if (width < 800)
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

  drawBlurredText(graphic, username, width - wholeMessagePadding, 0, userColor);

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
    let x = width - wholeMessagePadding - messageXOffset;

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

// function handleAutoScroll(amount){
//   // for (let m of displayedMessages) {
//   //   // console.log("displayed message: ",message.y);
//   //   m.y += amount;
//   // }
//   for (let message of messages) {
//     // console.log("message: ",message.y);
//     message.y += amount;
//   }
// }
function handleScroll(delta) {
  if (messages[0].y + delta > startOfChatYPos) {
    return;
  }
  if (messages[messages.length - 1].y + delta < endOfChatYPos - messages[messages.length - 1].height - 10) {
    return;
  }
  for (let i = 0; i < messages.length; i++) {
    messages[i].y = messages[i].y + delta;
  }
}

function mouseWheel(event) {
  if (isAutoMode)
    return;
  handleScroll(-event.delta);
  return false;
}

function touchMoved() {
  if (isAutoMode)
    return;
  let delta = mouseY - pmouseY;
  handleScroll(delta);
  return false;
}

