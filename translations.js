const translations = {
  // Hebrew to English
  'אימהות': 'moms',
  'דור-צעיר-פרייבט': 'youngPrivate',
  'דור-צעיר': 'young',
  'טיול-בולגריה': 'bulgaria',
  'יד-שנייה': 'secondHand',
  'כוחות-צהל': 'idf',
  'צוות-צחי': 'tzach',
  'מצייצות': 'tweeters',

  // English to Hebrew
  'moms': 'אימהות',
  'youngPrivate': 'דור-צעיר-פרייבט',
  'young': 'דור-צעיר',
  'bulgaria': 'טיול-בולגריה',
  'secondHand': 'יד-שנייה',
  'idf': 'כוחות-צהל',
  'tzach': 'צוות-צחי',
  'tweeters': 'מצייצות'
};

function translate(input) {
  const translation = translations[input];
  if (translation) {
    return translation;
  } else {
    console.warn(`Translation not found for: "${input}"`);
    return input; // Return the original input if no translation is found
  }
}

module.exports = translate;
