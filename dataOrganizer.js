const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const XLSX = require('xlsx');
const translate = require('./translations');


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

    cheerioDocument('p').each(function(index, element) {
      const paragraphElement = cheerioDocument(element);
      let text = paragraphElement.text().trim();
      
      // Clean the text of potential invisible Unicode characters
      text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
      
      if (index < 5) console.log(`Sample text (${index}): ${text}`);
      
      const match = text.match(messageRegex);

      if (match) {
        messageCount++;
        if (currentMessage) {
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
        const messageContent = match[5].trim();
        
        const isStrikethrough = paragraphElement.find('s').length > 0 && paragraphElement.find('s').text() === text;

        if (!isStrikethrough) {
          currentMessage = {
            date: date.trim(),
            time: time.trim(),
            userName: userName,
            messageContent: messageContent
          };
          userSet.add(userName);  // Add the user to the userSet
        } else {
          currentMessage = null;
        }
      } else if (currentMessage) {
        currentMessage.messageContent += '\n' + text;
      }
    });

    if (currentMessage) {
      messages.push(currentMessage);
    }

    console.log(`Total messages found: ${messageCount}`);
    console.log(`Total unique users: ${userSet.size}`);

    // Write messages to JSON file
    const jsonFileName = translate(path.basename(fileName, '.docx')) + '.json';
    const jsonPath = path.join(__dirname, 'Messages', 'JSON', jsonFileName);
    await fs.writeFile(jsonPath, JSON.stringify({ messages }, null, 2));
    console.log(`Messages output written to ${jsonPath}`);

    return Array.from(userSet);
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
    return [];
  }
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
  }

  // console.log('All users:', Array.from(allUsers));
  // console.log('Users by doc:', usersByDoc);

 // await createUserExcelFile(usersByDoc, allUsers);
}

async function createUserExcelFile(usersByDoc, allUsers) {
  // Create Excel file with user names
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([['Users', ...Object.keys(usersByDoc)]]);

  let row = 2; // Start from row 2 (1-indexed in Excel)
  Array.from(allUsers).sort().forEach(user => {
    const rowData = [user];
    Object.keys(usersByDoc).forEach(docName => {
      rowData.push(usersByDoc[docName].includes(user) ? user : '');
    });
    XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${row}` });
    row++;
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
  const excelPath = path.join(__dirname, 'Messages', 'Usernames', 'all_users.xlsx');
  XLSX.writeFile(workbook, excelPath);
  console.log(`Excel file with all user names written to ${excelPath}`);
}

async function ensureDirectoriesExist() {
  const dirs = [
    path.join(__dirname, 'Messages', 'Docs'),
    path.join(__dirname, 'Messages', 'JSON'),
    path.join(__dirname, 'Messages', 'Usernames')
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function main() {
  await ensureDirectoriesExist();
  await processAllDocuments();
}

main().catch(function(error) {
  console.error(error);
});
