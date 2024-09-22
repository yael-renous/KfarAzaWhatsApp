let chatReader;
let userData = {};
let messages = [];
let userIcons = {};
let circleMask;
let isAutoMode = false;

//------ chat assets ------
let chatBgImage;
let barColors;
let textColor;
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
let distanceBetweenUsernameAndMessage = 20;
let distanceBetweenTimeAndMessage = 20;
let distanceBetweenMessages = 0;
let messageXOffset = 30;
let timeXOffset = 40;
let wholeMessagePadding = 50;
let chatBoxYPadding = 4;
let chatBoxXPadding = 20;
const userIconSize = 30; // Diameter of the icon
const userIconXPadding = 10;
const userIconYPadding = 9;
// -----------------------

//------ chat data ------
let chat;
let currentTime;
let currentDate;
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

    chat = groups.youngPrivate;
    loadChat(chat);

  } else {
    console.error('WhatsAppReader is not defined. Make sure whatsappReader.js is loaded correctly.');
  }
  //TODO make all user icons
  // let autoPlayButton = createButton('Auto Play');
  // autoPlayButton.position(10, 10);
  // autoPlayButton.mousePressed(toggleAutoPlay);

  // Create a single reusable graphics buffer
  // usernameBuffer = createGraphics(width, messageFontSize * 2);
  // usernameBuffer.textAlign(RIGHT, TOP);
  // usernameBuffer.textSize(messageFontSize);
}

///----- Draw Functions -----

function drawUI() {
  drawTopBar();
  // if (isAutoPlaying) {
    drawTimeTicker();
  // }
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


function displayMessages() {
  push();
  textAlign(RIGHT, TOP);
  for (let message of messages) {
    textSize(messageFontSize);
    drawChatBox(message);
    drawUserIcon(message);

    // Simulate blur effect for username
    let username = ':שם משתמש';
    let userColor = color(userData[message.userName].color);
    userColor.setAlpha(100); // Reduce opacity
    fill(userColor);
    // let blurAmount = 0;
    // for (let i = -blurAmount; i <= blurAmount; i++) {
    //   for (let j = -blurAmount; j <= blurAmount; j++) {
    //     text(username, width - wholeMessagePadding + i, message.y + j);
    //   }
    // }
    text(username, width - wholeMessagePadding, message.y);

    // Draw the rest of the message normally
    fill(textColor);
    text(message.message + '\u200F', width - wholeMessagePadding - messageXOffset, message.y + distanceBetweenUsernameAndMessage);

    textSize(timestampFontSize);
    let contentWidth = textWidth(message.message);
    let timestampOffset = width - wholeMessagePadding - messageXOffset-contentWidth-timeXOffset;
    text(message.time, timestampOffset, message.y + message.height -distanceBetweenUsernameAndMessage);
  }
  pop();
}

function drawUserIcon(message) {
  push();
  imageMode(CENTER);
  const iconX = width - userIconXPadding - userIconSize / 2; // Position X
  const iconY = message.y + userIconSize + userIconYPadding; // Position Y
  let img = userData[message.userName].img;
  image(img, iconX, iconY, userIconSize, userIconSize);
  pop();
}


function drawChatBox(message) {
  push();
  //make a chat box
  noStroke();
  rectMode(CORNERS);
  drawingContext.shadowOffsetY = 1.3;
  drawingContext.shadowBlur = 5;
  drawingContext.shadowColor = 'grey';
  let bgColor = chatBoxBgColor;
  if (userData[message.userName].status == 'M') {
    bgColor = redChatBoxColor;
  }
  else if (userData[message.userName].status == 'H') {
    bgColor = yellowChatBoxColor;
  }
  fill(bgColor);
  //x = end of message
  //y = same y
  //opposite x = width-wholeMessagePadding
  //opposite y = height
  //height = message height
  let contentWidth = textWidth(message.message);
  let timestampWidth = textWidth(message.time);
  //console.log(contentWidth);
  let leftTopX = width - wholeMessagePadding - contentWidth - timestampWidth - chatBoxXPadding -messageXOffset ;
  let leftTopY = message.y - chatBoxYPadding;
  let rightBottomX = width - wholeMessagePadding + 7;
  let rightBottomY = message.y + message.height;
  rect(leftTopX, leftTopY, rightBottomX, rightBottomY, 10, 10, 10, 10);
  pop();
}


function draw() {
  background(chatBgImage); // Use the loaded image as background
  // for (let i = 0; i < messages.length; i++) {
  //   console.log(messageImages[i]);
  //   image(messageImages[i], 0, 0);
  // }
  // image(chatCanvas, 0, chatCanvasYOffset);
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
    setMessageYPositions();
    //renderMessageImages();
  } else {
    console.error(`Failed to load chat: ${chat.englishName}`);
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
    console.log('All user icons loaded' + rawUserData);
  } catch (error) {
    console.error('Error loading user icons:', error);
  }
}

//TODO CALCULATE MESSAGE Y POSITIONS BASED ON MESSAGE HEIGHT
function setMessageYPositions() {
  for (let i = 0; i < messages.length; i++) {
    messages[i].height = calculateMessageHeight(messages[i]);
    let previousMessageY=startOfChatYPos;
    if(i>0)
    {
      previousMessageY=messages[i-1].y+messages[i-1].height;
    }

    messages[i].y = previousMessageY +messages[i].height+distanceBetweenMessages;
  }
}

let messageImages = [];
let chatCanvas;
function renderMessageImages() {
  chatCanvas = createGraphics(width, height);
  displayMessages(chatCanvas);
}

// function renderMessageImages() {

//   messageImages = messages.map(message => {
//     // console.log(message.userName);
//     let img = createGraphics(width, 300);
//     return displayMessages(message,img);
//     // img.textAlign(RIGHT, TOP);
//     // img.textSize(messageFontSize);
//     // img.textFont('Arial');

//     // // // Draw chat box
//     // // img.noStroke();
//     // // img.fill(chatBoxBgColor);
//     // // let contentWidth = img.textWidth(message.message);
//     // // img.rect(width - contentWidth - wholeMessagePadding, 0, contentWidth + wholeMessagePadding, img.height, 10);

//     // // // Draw username (with blur effect)
//     // // let username = ':שם משתמש';
//     // // let userColor = color(userData[message.userName].color);
//     // // // let userColor = color(0,0,0);
//     // // userColor.setAlpha(50);
//     // // img.fill(userColor);
//     // // let blurAmount = 3;
//     // // for (let i = -blurAmount; i <= blurAmount; i++) {
//     // //   for (let j = -blurAmount; j <= blurAmount; j++) {
//     // //     img.text(username, width - wholeMessagePadding + i, j);
//     // //   }
//     // // }

//     // // Draw message
//     // img.fill(textColor);
//     // img.text(message.message + '\u200F', width - wholeMessagePadding - 30, distanceBetweenUsernameAndMessage);

//     // // Draw timestamp
//     // img.textSize(timestampFontSize);
//     // img.text(message.time, width - wholeMessagePadding - 200, distanceBetweenUsernameAndMessage + distanceBetweenTimeAndMessage);

//     // // Draw user icon
//     // push();
//     // // imageMode(CENTER);
//     // const iconX = width - userIconXPadding - userIconSize / 2; // Position X
//     // const iconY = message.y + userIconSize + userIconYPadding; // Position Y
//     // let icon = userData[message.userName].img;
//     // // image(img, iconX, iconY,userIconSize,userIconSize);
//     // //console.log(icon);
//     // img.image(icon, width / 2, height / 2, userIconSize, userIconSize);
//     // pop();

//     // return img;
//   });
// }



// function displayMessages(img) {
//   // console.log(message);
//   img.push();
//   img.textAlign(RIGHT, TOP);
//   let messageXOffset = 30;
//   let timeXOffset = 200;

//   for (let message of messages) {
//     img.textSize(messageFontSize);
//     // message.height = calculateMessageHeight(message);
//     message.height = 150;
//      drawChatBox(message, img);
//     img = drawUserIcon(message,img);

//     // Simulate blur effect for username
//     let username = ':שם משתמש';
//     let userColor = color(userData[message.userName].color);
//     userColor.setAlpha(3); // Reduce opacity
//     img.fill(userColor);
//     let blurAmount = 3;
//     for (let i = -blurAmount; i <= blurAmount; i++) {
//       for (let j = -blurAmount; j <= blurAmount; j++) {
//         img.text(username, width - wholeMessagePadding + i, message.y + j);
//       }
//     }


//     // Draw the rest of the message normally
//     img.fill(textColor);
//     img.text(message.message + '\u200F', width - wholeMessagePadding - messageXOffset, message.y + distanceBetweenUsernameAndMessage);

//     img.textSize(timestampFontSize);
//     img.text(message.time, width - wholeMessagePadding - timeXOffset, message.y + distanceBetweenUsernameAndMessage + distanceBetweenTimeAndMessage);
//   }
//   img.pop();
//   return img;
// }

// function drawUserIcon(message, img) {
//   img.push();
//   img.imageMode(CENTER);
//   const iconX = width - userIconXPadding - userIconSize / 2; // Position X
//   const iconY = message.y + userIconSize + userIconYPadding; // Position Y
//   let icon = userData[message.userName].img;
//   img.image(icon, iconX, iconY, userIconSize, userIconSize);
//   img.pop();
//   return img;
// }

// function drawChatBox(message, img) {
//   img.push();
//   //make a chat box
//   img.noStroke();
//   img.rectMode(CORNERS);
//   img.drawingContext.shadowOffsetY = 1.3;
//   img.drawingContext.shadowBlur = 5;
//   img.drawingContext.shadowColor = 'grey';
//   let bgColor = chatBoxBgColor;
//   if (userData[message.userName].status == 'M') {
//     bgColor = 'red';
//   }
//   else if (userData[message.userName].status == 'H') {
//     bgColor = 'yellow';
//   }
//   img.fill(bgColor);
//   //x = end of message
//   //y = same y
//   //opposite x = width-wholeMessagePadding
//   //opposite y = height
//   //height = message height
//   let contentWidth = textWidth(message.message);

//   img.rect(width - contentWidth, message.y - chatBoxPadding, width - wholeMessagePadding + chatBoxPadding, message.y + 50, 10, 10, 10, 10);
//   img.pop();
//   return img;
// }



let chatCanvasYOffset = 0;


function calculateMessageHeight(message) {
  // Calculate the number of lines in the message
  let lines = message.message.split('\n').length;
  // Adjust the height based on the number of lines
  let messageHeight = lines * messageFontSize;
  // Add extra space for username and time
  return  messageHeight + distanceBetweenUsernameAndMessage + distanceBetweenTimeAndMessage;
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
