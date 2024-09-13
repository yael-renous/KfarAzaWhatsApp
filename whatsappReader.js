class WhatsAppReader {
  constructor() {
    this.currentChat = null;
    this.currentIndex = -1;
  }

  async loadChat(fileName) {
    try {
      const response = await fetch(`Messages/JSON/${fileName}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const chatData = await response.json();
      
      if (chatData && Array.isArray(chatData.messages)) {
        this.currentChat = chatData.messages;
        this.currentIndex = -1;
        console.log(`Loaded chat with ${this.currentChat.length} messages`);
        return true;
      } else {
        console.error('Invalid chat data format');
        return false;
      }
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
      message: message.messageContent
    };
  }
}


