const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const XLSX = require('xlsx');
const translate = require('./groupData');

const CENSORED_STRING = 'צנזורמערכתי';

// Modify the isOnlyCensoredContent function
function isOnlyCensoredContent(messageContent) {
  // Remove all whitespace and newlines
  let cleanedContent = messageContent.replace(/\s+/g, '');
  cleanedContent = cleanedContent.replace(/[\u200B-\u200F\uFEFF\u202C]/g, '');

  // Check if the cleaned content is empty or only contains the censored string
  return cleanedContent === '' || cleanedContent === CENSORED_STRING.repeat(cleanedContent.length / CENSORED_STRING.length);
}

async function parseDocxFile(filePath) {
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.convertToHtml({ buffer });
  return result.value;
}

async function processDocument(fileName) {
  const filePath = path.join(__dirname, 'Messages', 'Docs', fileName);
  console.log(`Processing file: ${filePath}`);

  try {
    const htmlContent = await parseDocxFile(filePath);
    console.log(`HTML content length: ${htmlContent.length}`);

    const cheerioDocument = cheerio.load(htmlContent);

    const messages = [];
    const userSet = new Set();

    // Updated regex to match both formats
    const messageRegex = /^(?:\[(.*?)\]|(\d{1,2}[./]\d{1,2}[./]\d{2,4}),\s*(\d{1,2}:\d{2})\s*-\s*)([^:]+):(.*)/;

    let currentMessage = null;
    let messageCount = 0;

    cheerioDocument('p').each(function (index, element) {
      const paragraphElement = cheerioDocument(element);
      let text = paragraphElement.text().trim();

      // Clean the text of potential invisible Unicode characters
      text = text.replace(/[\u200B-\u200F\uFEFF\u202C]/g, '');

      const match = text.match(messageRegex);

      if (match) {
        messageCount++;
        if (currentMessage && !isOnlyCensoredContent(currentMessage.messageContent)) {
          messages.push(currentMessage);
        }

        let date, time;
        if (match[1]) {
          // Format: [date,time]
          [date, time] = match[1].split(',');
        } else {
          // Format: date, time -
          date = match[2];
          time = match[3];
        }
        const userName = match[4].trim();
        let messageContent = match[5].trim(); 

        // Check for strikethrough on the entire message (including date/time)
        const isFullStrikethrough = paragraphElement.find('s').length > 0 && paragraphElement.find('s').text() === text;

        if (!isFullStrikethrough) {
          // Check for partial strikethrough (e.g., only on date/time)
          const dateTimeStrikethrough = paragraphElement.find('s').text().includes(date);
          
          if (dateTimeStrikethrough) {
            // If date/time is strikethrough, skip this message
            currentMessage = null;
          } else {
            messageContent = replaceStrikethrough(cheerioDocument, paragraphElement, messageContent, userName);
            currentMessage = {
              date: date.trim(),
              time: time.trim(),
              userName: userName,
              messageContent: messageContent
            };
            userSet.add(userName);  // Add the user to the userSet
          }
        } else {
          currentMessage = null;
        }
      } else if (currentMessage) {
        text = replaceStrikethrough(cheerioDocument, paragraphElement, text, null);
        currentMessage.messageContent += '\n' + text;
      }
    });

    if (currentMessage && !isOnlyCensoredContent(currentMessage.messageContent)) {
      messages.push(currentMessage);
    }

    console.log(`Total messages found: ${messageCount}`);
    console.log(`Total unique users: ${userSet.size}`);

    // Write messages to JSON file
    // const jsonFileName = translate(path.basename(fileName, '.docx')) + '.json';
    const jsonFileName = path.basename(fileName, '.docx') + '.json';
    const jsonPath = path.join(__dirname, 'Messages', 'JSON', jsonFileName);
    await fs.writeFile(jsonPath, JSON.stringify({ messages }, null, 2));
    console.log(`Messages output written to ${jsonPath}`);

    return Array.from(userSet);
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
    return [];
  }
}

function replaceStrikethrough(cheerioDocument, paragraphElement, messageContent, userName) {
  paragraphElement.find('s').each(function () {
    let strikethroughText = cheerioDocument(this).text().trim();
    strikethroughText = strikethroughText.replace(/[\u200B-\u200F\uFEFF\u202C]/g, '');

    if (strikethroughText) {
      if (userName && strikethroughText.includes(userName)) { //if the user name is in the strikethrough text (includes datetime)
        const usernameIndex = strikethroughText.indexOf(userName);
        const strikethrough = strikethroughText.substring(usernameIndex + userName.length + 2).trim();
        if (strikethrough.length > 1) {//if the strikethrough is not just the user name
          messageContent = messageContent.replace(strikethrough.toString(), CENSORED_STRING);
          //console.log('\x1b[31m%s\x1b[0m', strikethrough + " -> צנזור");

        }
      }
      else {//if the strikethrough is just the message content
        messageContent = messageContent.replace(strikethroughText, CENSORED_STRING);
      }
    }
  });
  return messageContent;
}

async function processAllDocuments() {
  const docsDir = path.join(__dirname, 'Messages', 'Docs');
  const files = await fs.readdir(docsDir);
  const docxFiles = files.filter(file => path.extname(file).toLowerCase() === '.docx');

  const usersByDoc = {};
  const allUsers = new Set();

  for (const file of docxFiles) {
    console.log(`Processing ${file}...`);
    const users = await processDocument(file);
    const docName = path.basename(file, '.docx');
    usersByDoc[docName] = users;
    
    users.forEach(user => allUsers.add(user));
    
    // Create user data JSON for each document
    await createUserDataJson(docName, users);
  }

  // await createUserExcelFile(usersByDoc, allUsers);
}

async function createUserDataJson(docName, users) {
  const userData = {};
  const usedIcons = new Set();
  const usedColors = new Set();

  // Read the allUsersStatus.json file
  const allUsersStatusPath = path.join(__dirname, 'Messages', 'UserData', 'allUsersStatus.json');
  let allUsersStatus;
  try {
    const allUsersStatusContent = await fs.readFile(allUsersStatusPath, 'utf-8');
    allUsersStatus = JSON.parse(allUsersStatusContent);
  } catch (error) {
    console.error('Error reading allUsersStatus.json:', error);
    allUsersStatus = {};
  }

  function generateRandomHexColor() {
    let color;
    do {
      color = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    } while (usedColors.has(color));
    usedColors.add(color);
    return color;
  }

  users.forEach((user) => {
    let iconNumber;
    let iconName;

    do {
      iconNumber = Math.floor(Math.random() * 468) + 1;
      if (iconNumber < 10) {
        iconName = `icon-00${iconNumber}`;
      } else if (iconNumber < 100) {
        iconName = `icon-0${iconNumber}`;
      } else {
        iconName = `icon-${iconNumber}`;
      }
    } while (usedIcons.has(iconName));

    usedIcons.add(iconName);
    
    // Determine user status
    let status = '';
    if (allUsersStatus[docName]) {
      if (allUsersStatus[docName].M && allUsersStatus[docName].M.includes(user)) {
        status = 'M';
      } else if (allUsersStatus[docName].H && allUsersStatus[docName].H.includes(user)) {
        status = 'H';
      }
    }

    userData[user] = {
      username: user,
      icon: iconName,
      color: generateRandomHexColor(),
      status: status
    };
  });

  const jsonFileName = `${docName}UserData.json`;
  const jsonPath = path.join(__dirname, 'Messages', 'UserData', jsonFileName);
  await fs.writeFile(jsonPath, JSON.stringify(userData, null, 2));
  console.log(`User data JSON written to ${jsonPath}`);
}

// async function createUserExcelFile(usersByDoc, allUsers) {
//   // Create Excel file with user names
//   const workbook = XLSX.utils.book_new();
//   const worksheet = XLSX.utils.aoa_to_sheet([['Users', ...Object.keys(usersByDoc)]]);

//   let row = 2; // Start from row 2 (1-indexed in Excel)
//   Array.from(allUsers).sort().forEach(user => {
//     const rowData = [user];
//     Object.keys(usersByDoc).forEach(docName => {
//       rowData.push(usersByDoc[docName].includes(user) ? user : '');
//     });
//     XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${row}` });
//     row++;
//   });

//   XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
//   const excelPath = path.join(__dirname, 'Messages', 'Usernames', 'all_users.xlsx');
//   XLSX.writeFile(workbook, excelPath);
//   console.log(`Excel file with all user names written to ${excelPath}`);
// }

async function ensureDirectoriesExist() {
  const dirs = [
    path.join(__dirname, 'Messages', 'Docs'),
    path.join(__dirname, 'Messages', 'JSON'),
    path.join(__dirname, 'Messages', 'Usernames'),
    path.join(__dirname, 'Messages', 'UserData')  // Changed from 'UserIcons' to 'UserData'
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function main() {
  await ensureDirectoriesExist();
  await processAllDocuments();
}

main().catch(function (error) {
  console.error(error);
});
