const groups = {
  moms: {
    title: 'Moms Kfar Aza✌🏻❤️',
    hebrewName: 'אימהות',
    englishName: 'moms'
  },
  youngPrivate: {
    title: 'Young Generation Private',
    hebrewName: 'דור-צעיר-פרייבט',
    englishName: 'youngPrivate'
  },
  young: {
    title: 'Young Generation 🐫',
    hebrewName: 'דור-צעיר',
    englishName: 'young'
  },
  bulgaria: {
    title: 'Bulgaria Trip',
    hebrewName: 'טיול-בולגריה',
    englishName: 'bulgaria'
  },
  secondHand: {
    title: 'Second Hand Kfar Aza 🛋',
    hebrewName: 'יד-שנייה',
    englishName: 'secondHand'
  },
  idf: {
    title: 'IDF Forces',
    hebrewName: 'כוחות-צהל',
    englishName: 'idf'
  },
  tzach: {
    title: 'Tzach Kfar Aza',
    hebrewName: 'צוות-צחי',
    englishName: 'tzach'
  },
  tweeters: {
    title: '🐣Tweeters in Kfar Aza🐔',
    hebrewName: 'מצייצות',
    englishName: 'tweeters'
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

//module.exports = { translate, getGroupName, groups };