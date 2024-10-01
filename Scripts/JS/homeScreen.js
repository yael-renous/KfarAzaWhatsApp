function createButtons(){
    //when render is done show button to open whatsapp
    const buttonsContainer = document.getElementById('buttons-container');
    for(const chat of Object.values(groups)){
        const button = document.createElement('button');
        button.classList.add('circular-button');
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
    
    // Add keyboard event listener
    document.addEventListener('keydown', function(event) {
        const key = parseInt(event.key);
        if (key >= 1 && key <= 8) {
            const groupNames = Object.values(groups).map(chat => chat.englishName);
            if (key <= groupNames.length) {
                openChatPage(groupNames[key - 1]);
            }
        }
    });
});

