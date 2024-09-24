class WhatsAppReader {
  constructor() {
    this.currentChat = null;
    this.currentIndex = -1;
    this.userData = null;
  }

  async loadChat(fileName) {
    try {
      // Load messages
      const messageResponse = await fetch(`Messages/JSON/${fileName}.json`);
      if (!messageResponse.ok) {
        throw new Error(`HTTP error! status: ${messageResponse.status}`);
      }
      const chatData = await messageResponse.json();
      
      if (chatData && Array.isArray(chatData.messages)) {
        this.currentChat = chatData.messages;
        this.currentIndex = -1;
        console.log(`Loaded chat with ${this.currentChat.length} messages`);
      } else {
        throw new Error('Invalid chat data format');
      }

      // Load user data
      const userDataResponse = await fetch(`Messages/UserData/${fileName}UserData.json`);
      if (!userDataResponse.ok) {
        throw new Error(`HTTP error! status: ${userDataResponse.status}`);
      }
      const rawUserData = await userDataResponse.json();
      this.userData = Object.entries(rawUserData).map(([username, data]) => ({
        username: data.username,
        icon: data.icon,
        color: data.color,
        status: data.status
      }));
      console.log(`Loaded user data for ${fileName}`);

      return true;
    } catch (error) {
      console.error('Error loading chat data:', error.message);
      throw error;
    }
  }

  getNextMessage() {
    if (!this.currentChat) {
      console.error('No chat loaded. Please load a chat first.');
      return null;
    }

    this.currentIndex++;
    if (this.currentIndex >= this.currentChat.length) {
      console.log('Reached the end of the chat.');
      return null;
    }

    const message = this.currentChat[this.currentIndex];
    return {
      date: message.date,
      time: message.time,
      userName: message.userName,
      message: message.messageContent,
      y: 0,
      contentHeight:0,
      totalHeight:0

    };
  }

  getAllMessages() {
    if (!this.currentChat) {
      console.error('No chat loaded. Please load a chat first.');
      return null;
    }

    return this.currentChat.map(message => ({
      date: message.date,
      time: message.time,
      userName: message.userName,
      message: message.messageContent,
      y: 0,
      contentHeight:0,
      totalHeight:0
    }));
  }

  getUserData() {
    if (!this.userData) {
      console.error('No user data loaded. Please load a chat first.');
      return null;
    }

    return this.userData;
  }
}


