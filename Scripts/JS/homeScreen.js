function createButtons(){
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

    // Open the new page and pass the group name as a URL parameter
    window.location.href = `chat.html?groupName=${encodeURIComponent(groupName)}`;
}

document.addEventListener('DOMContentLoaded', function() {
    createButtons();
});

