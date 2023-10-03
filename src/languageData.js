/*
Copyright 2023 Nito T.M.
License https://www.apache.org/licenses/LICENSE-2.0 Apache-2.0
Author Nito T.M. (https://github.com/nitotm)
Package npmjs.com/package/eld
*/

import { avgScore } from './avgScore.js'
// import { ngramsData } from "./ngrams/ngramsM60.js"

export const languageData = {
  langCodes: {}, langScore: [], ngrams: {}, type: '', avgScore: avgScore
}

/**
 * @param {string} file File inside /ngrams/, with ELD ngrams data format
 * @returns {boolean|undefined} true if file was loaded
 */
export async function loadNgrams(file) {
  return await import('./ngrams/' + file ).then((module) => {
    setNgrams(module.ngramsData)
    if (languageData.type) {
      return true
    }
  })
}
// setNgrams(ngramsData) // Used to create minified files with import { ngramsData }

/**
 * @param {Object} data
 */
function setNgrams(data) {
  languageData.langCodes = data.languages
  languageData.langScore = Array(Object.keys(data.languages).length).fill(0)
  languageData.ngrams = data.ngrams
  languageData.type = data.type
}

/* ISO 639-1 codes, for the 60 languages set.
 * ['am', 'ar', 'az', 'be', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'eu', 'fa', 'fi', 'fr', 'gu',
 * 'he', 'hi', 'hr', 'hu', 'hy', 'is', 'it', 'ja', 'ka', 'kn', 'ko', 'ku', 'lo', 'lt', 'lv', 'ml', 'mr', 'ms', 'nl',
 * 'no', 'or', 'pa', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sq', 'sr', 'sv', 'ta', 'te', 'th', 'tl', 'tr', 'uk', 'ur',
 * 'vi', 'yo', 'zh']
 *
 * ['Amharic', 'Arabic', 'Azerbaijani (Latin)', 'Belarusian', 'Bulgarian', 'Bengali', 'Catalan', 'Czech', 'Danish',
 * 'German', 'Greek', 'English', 'Spanish', 'Estonian', 'Basque', 'Persian', 'Finnish', 'French', 'Gujarati',
 * 'Hebrew', 'Hindi', 'Croatian', 'Hungarian', 'Armenian', 'Icelandic', 'Italian', 'Japanese', 'Georgian', 'Kannada',
 * 'Korean', 'Kurdish (Arabic)', 'Lao', 'Lithuanian', 'Latvian', 'Malayalam', 'Marathi', 'Malay (Latin)', 'Dutch',
 * 'Norwegian', 'Oriya', 'Punjabi', 'Polish', 'Portuguese', 'Romanian', 'Russian', 'Slovak', 'Slovene', 'Albanian',
 * 'Serbian (Cyrillic)', 'Swedish', 'Tamil', 'Telugu', 'Thai', 'Tagalog', 'Turkish', 'Ukrainian', 'Urdu',
 * 'Vietnamese', 'Yoruba', 'Chinese']
 */
