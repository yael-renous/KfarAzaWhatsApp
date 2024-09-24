//render all groups
async function renderGroups(){
    // for(const chat of Object.values(groups))
    // {

    let chat = Object.values(groups)[0];  
        console.log(chat);
        let message = await loadChat(chat);     
        console.log("FINISHED rendered " +message.length + " messages");
        chat.renderedMessages = message;
        console.log(chat.title + ".renderedMessages: " + chat.renderedMessages[0].message);
    // }
    
    // After rendering, save to local storage
    saveGroupsToLocalStorage();
}

//check if all messages are rendered
function messagesRendered(){
    for(const chat of Object.values(groups)){
        if(chat.renderedMessages == null || chat.renderedMessages.length == 0){
            return false;
        }
    }
    return true;
}


async function createButtons(){
    const loadedGroups = loadGroupsFromLocalStorage();
    if (loadedGroups) {
        groups = loadedGroups;
        console.log("Loaded groups from local storage");
    }

    if(!messagesRendered()){
        await renderGroups();
    }
    console.log("rendered groups");
    //when render is done show button to open whatsapp
    const buttonsContainer = document.getElementById('buttons-container');
    for(const chat of Object.values(groups)){
        const button = document.createElement('button');
        button.textContent = chat.title;
        button.onclick = () => openChatPage(chat.englishName);
        buttonsContainer.appendChild(button);
    }
}

function openChatPage(groupName) {
    console.log(groups[groupName].renderedMessages);
    // Open the new page and pass the group name as a URL parameter
    // window.location.href = `chat.html?groupName=${encodeURIComponent(groupName)}`;
}

// Remove the direct call to createButtons()
// createButtons();

// Add event listener for DOMContentLoaded
//document.addEventListener('DOMContentLoaded', createButtons);