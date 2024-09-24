const groups = {
  moms: {
    title: '✌🏻❤️ אמהות כפר עזה',
    hebrewName: 'אימהות',
    englishName: 'moms'
  },
  youngPrivate: {
    title: 'דור צעיר פרייבט',
    hebrewName: 'דור-צעיר-פרייבט',
    englishName: 'youngPrivate'
  },
  young: {
    title: '🐫 דור צעיר',
    hebrewName: 'דור-צעיר',
    englishName: 'young'
  },
  bulgaria: {
    title: 'טיול לבולגריה',
    hebrewName: 'טיול-בולגריה',
    englishName: 'bulgaria'
  },
  secondHand: {
    title: '🛋 יד שנייה כפר עזה',
    hebrewName: 'יד-שנייה',
    englishName: 'secondHand'
  },
  idf: {
    title: 'כוחות צהל',
    hebrewName: 'כוחות-צהל',
    englishName: 'idf'
  },
  tzach: {
    title: 'צח״י כפר עזה',
    hebrewName: 'צוות-צחי',
    englishName: 'tzach'
  },
  tweeters: {
    title: '🐣מצייצות בכפר🐔',
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