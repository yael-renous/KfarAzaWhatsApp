let groups = {
  moms: {
    title: '✌🏻❤️ אמהות כפר עזה',
    hebrewName: 'אימהות',
    englishName: 'moms',
    renderedMessages: []
  },
  youngPrivate: {
    title: 'דור צעיר פרייבט',
    hebrewName: 'דור-צעיר-פרייבט',
    englishName: 'youngPrivate',
    renderedMessages: []
  },
  young: {
    title: '🐫 דור צעיר',
    hebrewName: 'דור-צעיר',
    englishName: 'young',
    renderedMessages: []
  },
  bulgaria: {
    title: 'טיול לבולגריה',
    hebrewName: 'טיול-בולגריה',
    englishName: 'bulgaria',
    renderedMessages: []
  },
  secondHand: {
    title: '🛋 יד שנייה כפר עזה',
    hebrewName: 'יד-שנייה',
    englishName: 'secondHand',
    renderedMessages: []
  },
  idf: {
    title: 'כוחות צהל',
    hebrewName: 'כוחות-צהל',
    englishName: 'idf',
    renderedMessages: []
  },
  tzach: {
    title: 'צח״י כפר עזה',
    hebrewName: 'צוות-צחי',
    englishName: 'tzach',
    renderedMessages: []
  },
  tweeters: {
    title: '🐣מצייצות בכפר🐔',
    hebrewName: 'מצייצות',
    englishName: 'tweeters',
    renderedMessages: []
  }
};

function translate(input) {
  for (const group of Object.values(groups)) {
    if (group.hebrewName === input) return group.englishName;
    if (group.englishName === input) return group.hebrewName;
  }
  console.warn(`Translation not found for: "${input}"`);
  return input;
}

function getGroupName(name) {
  const group = groups[name];
  if (group) {
    return group.title;
  } else {
    console.warn(`Group name not found for: "${name}"`);
    return name;
  }
}

// Add this function to save groups to local storage
function saveGroupsToLocalStorage() {
  localStorage.setItem('groups', JSON.stringify(groups));
}

// Add this function to load groups from local storage
function loadGroupsFromLocalStorage() {
  const storedGroups = localStorage.getItem('groups');
  if (storedGroups) {
      return JSON.parse(storedGroups);
  }
  return null;
}
