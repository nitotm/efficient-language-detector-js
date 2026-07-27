/*
Copyright 2023 Nito T.M.
License https://www.apache.org/licenses/LICENSE-2.0 Apache-2.0
Author Nito T.M. (https://github.com/nitotm)
Package npmjs.com/package/eld
*/

import { avgScore } from './avgScore.js'

/**
 * Creates a fresh, independent language-data container. Each eld instance (see createEld() in
 * languageDetector.js) owns one of these, instead of every instance sharing a single module-level
 * object. This is what allows two different imports/instances to hold two different databases
 * (e.g. 'large' and 'small') at the same time, in the same process, without conflicting.
 *
 * @returns {Object}
 */
export function createLanguageData() {
    return {
        langCodes: {}, langScore: [], ngrams: {}, type: '', avgScore: avgScore
    }
}

/**
 * Mutates a given languageData instance in place with a loaded ngrams database.
 * Kept as a pure function of its arguments (no reference to any shared/module-level state) so it
 * only ever affects the instance explicitly passed to it.
 *
 * @param {Object} languageData instance created by createLanguageData()
 * @param {Object} data
 */
export function setNgrams(languageData, data) {
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