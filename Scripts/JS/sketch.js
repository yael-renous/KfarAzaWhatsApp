let chatReader;
let userData = {};
let messages = [];
let userIcons = {};
let groupIcon;
const censorString = "צנזורמערכתי";

//--screen management--
let isLoading = true;

//--loading animation--
let loadingCircleSize = 80
let circleSizeChange = 1;
// -------------------



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
let groupIconSize;
let userIconSize;
let userIconXPadding;
let userIconYPadding;
let blurPixels;
let chatBoxRadius;
let newDateHeight;
let tickerHeight;
// -----------------------

//------ chat data ------
let chat;

//------ ticker ------
let tickerTimeString;
let currentTickerTime;
let tickerStartTime;
let tickerEndTime;
let tickerStartRealTime;
//-----------------------

//------ auto play ------
let isAutoMode = false;
let currentMessageIndex = 0;
let lastMessageTime = 0;
let displayedMessages = [];

let messageDisplayInterval = 0;
const minSpeed = 0.05;
const maxSpeed = 200;
let autoPlaySpeed = 6;
let maxTimeBetweenMessages = 10000;
let minTimeBetweenMessages = 2000;
//-----------------------


function preload() {
  chatBgImage = loadImage('Assets/Images/background-light.jpg');
  topBarColor = "#016b61";
  chatBoxBgColor = "#ffffff";
  redChatBoxColor = "#d23c19";
  yellowChatBoxColor = "#fce887";
  timestampColor = "grey";
  textColor = color(0, 0, 0);
}

function setup() {
  const urlParams = new URLSearchParams(window.location.search);
  const groupName = urlParams.get('groupName');
  groupIcon = loadImage(`Assets/GroupIcons/${groupName}.png`);

  console.log(groupName);
  if (groupName == undefined)
    return;

  if (windowWidth > windowHeight) {
    // Landscape mode: fill height and make it HD proportions
    createCanvas((windowHeight * 9) / 16, windowHeight);
    console.log("Landscape mode");
  } else {
    // Portrait mode: fill entire screen
    createCanvas(windowWidth, windowHeight);
    console.log("Portrait mode");
  }
  calculateFinalSizes();
  textFont('Arial');

  if (typeof WhatsAppReader !== 'undefined') {
    chatReader = new WhatsAppReader();
    console.log('WhatsAppReader is defined');

    chat = groups[groupName];
  } else {
    console.error('WhatsAppReader is not defined. Make sure whatsappReader.js is loaded correctly.');
  }

  window.addEventListener('keydown', handleControlShiftEnter);
}

async function initSketch() {
  isLoading = true;
  await loadChat(chat);
  isLoading = false;
}

function handleControlShiftEnter(event) {
  if (event.ctrlKey && event.shiftKey && event.key === 'Enter') {
    console.log('Control + Shift + Enter detected');
    isAutoMode = true;
    currentMessageIndex = 0;
    lastMessageTime = millis(); // Initialize the timestamp
    resetView();
  }
}


function calculateFinalSizes() {
  topBarHeight = height * 0.08;
  tickerHeight = height * 0.05;
  bottomBarHeight = height * 0.08;
  startOfChatYPos = topBarHeight + tickerHeight + height * 0.03;
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
  groupIconSize = 0.06 * height;

  newDateHeight = distanceBetweenMessages + timestampFontSize;
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
  let padding = width * 0.02;

  let groupIconX = width - groupIconSize - padding;
  let goupTextX = groupIconX - groupIconSize / 2 - padding;
  fill("white");
  textSize(height * 0.024);
  textAlign(RIGHT, CENTER);
  text(chat.title, goupTextX, topBarHeight / 2);

  //group icon
  imageMode(CENTER);
  image(groupIcon, groupIconX, topBarHeight / 2, groupIconSize, groupIconSize);
  //video icon
  //call icon
  //more options icon
  pop();
}

function calculateTickerTimeString() {
  if (!tickerStartTime || !tickerEndTime) return "";

  let currentRealTime = millis();
  let elapsedRealTime = currentRealTime - tickerStartRealTime;
  let elapsedSimulatedTime = elapsedRealTime * autoPlaySpeed;

  let currentTickerTime = new Date(tickerStartTime.getTime() + elapsedSimulatedTime);

  // Ensure we don't exceed the end time
  if (currentTickerTime > tickerEndTime) {
    currentTickerTime = new Date(tickerEndTime);
  }

  let hours = currentTickerTime.getHours().toString().padStart(2, '0');
  let minutes = currentTickerTime.getMinutes().toString().padStart(2, '0');
  let seconds = currentTickerTime.getSeconds().toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

function drawTimeTicker() {
  if (!isAutoMode || displayedMessages.length === 0) return;

  tickerTimeString = calculateTickerTimeString();
  // Draw the ticker
  push();
  rectMode(CENTER);
  let padding = height * 0.01;
  fill("black");
  rect(width / 2, topBarHeight + tickerHeight / 2 + padding, width / 2 + padding, tickerHeight, 300);
  fill("white");
  textSize(height * 0.022);
  textAlign(CENTER, CENTER);
  text(tickerTimeString + "\t\t" + currentDateString, width / 2, topBarHeight + tickerHeight / 2 + padding);
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
  for (let i = 0; i < lastRenderedMessageIndex; i++) {
    let message = messages[i];
    image(message.graphic, 0, message.y);

    let icon = userData[message.userName].img;
    const iconX = width - userIconXPadding - userIconSize;
    const iconY = message.y + message.height - height * 0.02;
    image(icon, iconX, iconY, userIconSize, userIconSize);
  }
}

let currentDateString;
function addNextMessage() {
  if (currentMessageIndex < messages.length) {
    let nextMessage = messages[currentMessageIndex];
    displayedMessages.push(nextMessage);
    currentMessageIndex++;

    currentDateString = nextMessage.date;
    // Set up ticker times
    if (currentMessageIndex < messages.length) {
      let currentMessageDate = convertDateTimeToDate(nextMessage.date, nextMessage.time);
      let nextMessageDate = convertDateTimeToDate(messages[currentMessageIndex].date, messages[currentMessageIndex].time);


      tickerStartTime = currentMessageDate;
      tickerEndTime = nextMessageDate;
      tickerStartRealTime = millis();

      lastMessageTime = millis();

      let timeDiff = nextMessageDate.getTime() - currentMessageDate.getTime();
      autoPlaySpeed = map(timeDiff, 0, 3600000, minSpeed, maxSpeed)

      if (timeDiff < 1) {
        timeDiff = minTimeBetweenMessages;
        autoPlaySpeed = timeDiff / minTimeBetweenMessages;
      }

      messageDisplayInterval = timeDiff / autoPlaySpeed;
      console.log("timeDiff: " + timeDiff);
      console.log("autoPlaySpeed: " + autoPlaySpeed.toFixed(2));
      console.log("next message in " + (messageDisplayInterval / 1000).toFixed(2) + " seconds");


      // Check if the new message is out of the screen
      if (nextMessage.y + nextMessage.height > endOfChatYPos) {
        // Scroll up by the height of the new message plus some padding
        let scrollAmount = nextMessage.graphic.height + distanceBetweenMessages + 5;
        handleScroll(-scrollAmount);
      }
    } else {
      setTimeout(() => {
        resetView();
      }, 3000);
    }
  }
}

function convertDateTimeToDate(dateString, timeString) {
  let day, month, year;

  // Check if the date is in DD.MM.YYYY or DD/MM/YY format
  if (dateString.includes('.')) {
    [day, month, year] = dateString.split('.').map(Number);
  } else if (dateString.includes('/')) {
    [day, month, year] = dateString.split('/').map(Number);
    // Assume 2-digit year is in the 2000s
    year = year < 100 ? 2000 + year : year;
  } else {
    console.error('Unsupported date format:', dateString);
    return null;
  }

  let [hours, minutes, seconds = 0] = timeString.split(':').map(Number);

  // Note: JavaScript months are 0-indexed, so we subtract 1 from the month
  return new Date(year, month - 1, day, hours, minutes, seconds);
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
  if (isLoading) {
    drawLoadingAnimation();
    return;
  }

  if (isAutoMode) {
    let currentTime = millis();
    if (currentTime - lastMessageTime >= messageDisplayInterval) {
      addNextMessage();
    }
    displayAutoMessages();
  } else {
    displayAllMessages();
  }

  drawUI();
}


function drawLoadingAnimation() {
  let pulseColor = color(topBarColor);
  pulseColor.setAlpha(60);
  fill(pulseColor);
  noStroke();
  circle(width / 2, height / 2, loadingCircleSize);

  if (loadingCircleSize > 150) {
    circleSizeChange = -circleSizeChange;
  }
  else if (loadingCircleSize < 80) {
    circleSizeChange = -circleSizeChange;
  }
  loadingCircleSize = (loadingCircleSize + circleSizeChange); // Oscillate between 80 and 200

}

function resetView() {
  background(255); // Set a background color to avoid any gaps
  image(chatBgImage, 0, 0, width, height, 0, 0, chatBgImage.width, chatBgImage.height, COVER);
  currentMessageIndex = 0;
  displayedMessages = [];
  setMessageYPositions();
  drawUI();
  tickerStartTime = null;
  tickerEndTime = null;
  tickerStartRealTime = null;
  currentDateString = "";
}


//--------------- scroll functions ------------------------
function handleScroll(delta) {
  if (messages[0].y + delta > startOfChatYPos) {
    return;
  }
  if (messages[messages.length - 1].y + delta < endOfChatYPos - messages[messages.length - 1].height - newDateHeight*3) {
    return;
  }
  if (lastRenderedMessageIndex < messages.length) {
    if (messages[lastRenderedMessageIndex].y + delta < endOfChatYPos - messages[lastRenderedMessageIndex].height - 10) {
      renderMessageImages(lastRenderedMessageIndex, Math.min(messages.length, lastRenderedMessageIndex + renderBulks));
    }
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

//----------------pre loading functions-------------------
async function loadChat(chat) {
  let success = await chatReader.loadChat(chat.englishName);
  if (success) {
    console.log(`Loaded chat: ${chat.englishName}`);
    messages = chatReader.getAllMessages();
    let rawUserData = chatReader.getUserData();
    await loadUserData(rawUserData);
    addMessagesNewLines();
    setMessageYPositions();
    renderMessageImages(0, Math.min(messages.length, renderBulks));
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
  messages[0].y = startOfChatYPos;
  messages[0].height = calculateMessageHeight(messages[0]);

  for (let i = 1; i < messages.length; i++) {
    messages[i].height = calculateMessageHeight(messages[i]);
    let previousMessageY = messages[i - 1].y + messages[i - 1].height;
    if (i > 1) {
      if (messages[i - 2].date != messages[i - 1].date) {
        previousMessageY = previousMessageY + newDateHeight;
      }
    }
    messages[i].y = previousMessageY + distanceBetweenMessages;
  }
}


let lastRenderedMessageIndex = 0;
let renderBulks = 30;
//--------------- render functions ------------------------
async function renderMessageImages(fromIndex, toIndex) {
  console.log("rendering messages " + fromIndex + " to " + toIndex);
  let currentDateString = messages[0].date;
  for (let i = fromIndex; i < toIndex; i++) {
    let message = messages[i];
    let graphicHeight = message.height + chatBoxYPadding * 2;
    let addNewDate = message.date != currentDateString;
    currentDateString = message.date;
    let dateOffset = 0;
    if (addNewDate) {
      graphicHeight = graphicHeight + newDateHeight;
      dateOffset = newDateHeight;
    }

    let messageGraphic = createGraphics(width, graphicHeight);
    messageGraphic.textFont('Arial');

    renderChatBox(messageGraphic, message, userData, dateOffset);
    renderUsername(messageGraphic, message, userData, dateOffset);
    renderMessageContent(messageGraphic, message, censorString, textColor, dateOffset);
    renderTimestamp(messageGraphic, message, timestampColor, dateOffset);
    if (addNewDate) {
      renderNewDate(messageGraphic, message, userData);
    }
    message.graphic = messageGraphic;
    // save(messageGraphic,`Assets/MessageGraphics/${chat.englishName}/message_${i}`, '.png');
    // console.log("saved message " + i); // Save the graphic as a PNG image
  }

  // for (let i = 0; i < messages.length; i++) {
  //   save(messages[i].graphic,`Assets/MessageGraphics/${chat.englishName}/message_${i}`, '.png');
  //   await new Promise(resolve => setTimeout(resolve, 2000));
  //   console.log("saved message " + i); // Save the graphic as a PNG image
  // }
  lastRenderedMessageIndex = toIndex;
}

function renderNewDate(graphic, message, userData) {
  graphic.push();
  graphic.rectMode(CENTER);
  graphic.stroke("grey");
  graphic.strokeWeight(0.4);
  graphic.fill(chatBoxBgColor);
  graphic.textSize(timestampFontSize);
  let dateWidth = graphic.textWidth(message.date);
  graphic.rect(graphic.width / 2, chatBoxYPadding, dateWidth + chatBoxXPadding * 2, timestampFontSize + chatBoxYPadding, 300);
  graphic.textAlign(CENTER, TOP);
  graphic.fill(timestampColor);
  graphic.noStroke();
  graphic.text(message.date, graphic.width / 2, chatBoxYPadding / 2);
  graphic.pop();
}

function renderChatBox(graphic, message, userData, dateOffset) {
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
  let leftTopY = 0 + dateOffset;
  let rightBottomX = width - wholeMessagePadding + chatBoxXPadding;
  let rightBottomY = message.height + chatBoxYPadding + dateOffset;
  graphic.rect(leftTopX, leftTopY, rightBottomX, rightBottomY, chatBoxRadius);
  graphic.pop();
}

function renderUsername(graphic, message, userData, dateOffset) {
  graphic.push();
  graphic.textAlign(RIGHT, TOP);
  graphic.textSize(messageFontSize);
  let username = ':שם משתמש';
  let userColor = color(userData[message.userName].color);

  graphic.fill(userColor);
  renderBlurredText(graphic, username, width - wholeMessagePadding, 0 + dateOffset, userColor);
  // graphic.text(username, width - wholeMessagePadding, 0 + dateOffset);
  graphic.pop();
}

function renderMessageContent(graphic, message, censorString, textColor, dateOffset) {
  graphic.push();
  graphic.textAlign(RIGHT, TOP);
  graphic.textSize(messageFontSize);
  let color = textColor;
  if (userData[message.userName].status == 'M') {
    color = 'light-grey';
  }
  graphic.fill(color);

  let lines = message.message.split('\n');
  let y = distanceBetweenUsernameAndMessage + dateOffset;

  for (let line of lines) {
    let parts = line.split(censorString);
    let x = width - wholeMessagePadding - messageXOffset;

    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        renderBlurredText(graphic, censorString, x, y, textColor);
        // graphic.text(censorString, x, y);
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

function renderTimestamp(graphic, message, timestampColor, dateOffset) {
  graphic.push();
  graphic.textSize(messageFontSize);
  let contentWidth = graphic.textWidth(message.message);
  let timestampOffset = graphic.width - wholeMessagePadding - messageXOffset - contentWidth - timeXOffset;
  graphic.textAlign(LEFT, TOP);
  graphic.textSize(timestampFontSize);
  let color = timestampColor;
  if (userData[message.userName].status == 'M') {
    color = 'light-grey';
  }
  graphic.fill(color);
  graphic.text(message.time, timestampOffset, message.height - timestampFontSize + distanceBetweenTimeAndMessage + dateOffset);
  graphic.pop();
}

function renderBlurredText(graphic, text, x, y, color) {
  graphic.push();
  let blurColor = color;
  let alphaValue = 1;
  if (width < 800)
    alphaValue = 7;
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

function calculateMessageHeight(message) {
  let lines = message.message.split('\n').length;
  let messageHeight = lines * messageFontSize;
  return messageHeight
    + timestampFontSize
    + distanceBetweenUsernameAndMessage
    + distanceBetweenTimeAndMessage;
}




