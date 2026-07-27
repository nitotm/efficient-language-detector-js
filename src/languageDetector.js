/*
Copyright 2023 Nito T.M.
License https://www.apache.org/licenses/LICENSE-2.0 Apache-2.0
Author Nito T.M. (https://github.com/nitotm)
Package npmjs.com/package/eld
*/

import { createLanguageData, setNgrams } from './languageData.js'
import { separators, matchDomains } from './regexPatterns.js'
import { dictionary } from './dictionary.js'
import { isoLanguages } from './isoLanguages.js'
import { LanguageResult } from './LanguageResult.js'
import { saveLanguageSubset } from './saveLanguageSubset.dev.js'

/** @type {string} */
const loadError = 'No database loaded, use load()'

// Project is ES2015

/**
 * Creates a new eld instance: its own loaded database and settings
 *
 * Every entry file (src/entries/static.*.js, src/entries/dynamic.js) calls this once at
 * module-evaluation time to build the object it exports - this is what makes e.g. `eld/large` and
 * `eld/small` behave independently even when both are imported in the same process.
 *
 * `loadData` is returned separately from `instance` on purpose: it's an internal hook used only by
 * entry files to inject a loaded ngrams database, and is deliberately not attached to the public
 * `instance` object, since static entries must stay fixed-size (no load() on static imports).
 *
 * @returns {{instance: Object, loadData: function(Object): void}}
 */
function createEld() {
    /** @type {Object} This instance's own database, never shared with any other instance */
    let languageData = createLanguageData()

    /** @type {boolean|Array} */
    let subset = false

    /** @type {boolean} When true, detect() cleans input text with getCleanTxt() */
    let doCleanText = false

    /** @type {boolean} Guards against spamming the console in tight loops - warns once per instance */
    let warnedNonStringInput = false

    /**
     * detect() identifies the natural language of a UTF-8 string
     * Returns an object, with a variable named 'language', with an ISO 639-1 code or empty string
     * { language: 'es', getScores(): {'es': 0.5, 'et': 0.2}, isReliable(): true }
     *
     * @param {string} text UTF-8
     * @returns {{language: string, getScores(): Object, isReliable(): boolean}} class LanguageResult
     */
    function detect(text) {
        if (typeof text !== 'string') {
            if (!warnedNonStringInput) {
					 // Returning an empty result instead of throwing. Shown once per instance.
                console.warn('eld: detect() expects a string, received ' + typeof text)
                warnedNonStringInput = true
            }
            return new LanguageResult('', [], 0, {})
        }
        if (!languageData.type) throw new Error(loadError)

        text = text.substring(0, 1000)

        if (doCleanText) {
            // Removes Urls, emails, alphanumerical & numbers
            text = getCleanTxt(text)
        }

        const byteWords = textProcessor(text)
        const byteNgrams = getByteNgrams(byteWords)
        let results = calculateScores(byteNgrams, languageData)

        if (subset) {
            results = filterLangSubset(results, subset)
        }

        const langID = getMaxLang(results)
        if (langID !== false) {
            const language = languageData.langCodes[langID]
            const numNgrams = Object.keys(byteNgrams).length
            return new LanguageResult(language, results, numNgrams, languageData.langCodes)
        }

        return new LanguageResult('', [], 0, {})
    }

    /**
     * Public function to change doCleanText value
     *
     * @param {boolean} bool
     */
    function enableTextCleanup(bool) {
        doCleanText = Boolean(bool)
    }

    /**
     * Creates a subset of languages, from which detect() will filter excluded languages from the results
     * Call setLanguageSubset(false) to delete the subset
     *
     * @param {Array|boolean} languages
     * @returns {Object} Returns list of the validated languages for the new subset
     */
    function setLanguageSubset(languages) {
        subset = makeSubset(languages, languageData)
        if (subset) {
            return isoLanguages(subset, languageData.langCodes)
        }
        return {}
    }

    /**
     * Creates a download, only available for the web browser, with a file containing the ngrams database, of the
     * validated languages from the array argument. Does not affect this instance's active subset.
     *
     * @param {Array} languages
     */
    function saveSubset(languages) {
        const langArray = makeSubset(languages, languageData)
        saveLanguageSubset.saveSubset(langArray, languageData.ngrams, languageData.langCodes, languageData.type)
    }

    function info() {
        return {
            'Data type': languageData.type,
            'Languages': languageData.langCodes,
            'Subset': subset ? isoLanguages(subset, languageData.langCodes) : false,
            // 'Text cleanup enabled': doCleanText ? 'True' : 'False',
        }
    }

    /**
     * Internal hook, used only by entry files to load a database into THIS instance.
     * Not exposed on `instance` - see the doc comment on createEld() above.
     *
     * @param {Object} data
     * @returns {string} the loaded database's type, falsy if nothing ended up loaded
     */
    function loadData(data) {
        setNgrams(languageData, data)
        return languageData.type
    }

    const instance = {
        detect,
        enableTextCleanup,
        /** @deprecated Use `enableTextCleanup` instead. */
        cleanText: enableTextCleanup,
        setLanguageSubset,
        /** @deprecated Use `setLanguageSubset` instead. */
        dynamicLangSubset: setLanguageSubset,
        saveSubset,
		  // getCleanTxt: getCleanTxt,
        info
    }

    return { instance, loadData }
}

/**
 * Removes parts of a string, that may be considered as "noise" for language detection
 *
 * @param {string} str
 * @returns {string}
 */
function getCleanTxt(str) {
    // Remove URLS
    str = str.replace(/[hw](?:(?:ttps?:\/\/(?:www\.)?)|ww\.)[^\s]+/gi, ' ')
    // Remove emails
    str = str.replace(/[a-zA-Z0-9.!$%&’+_`-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9-]{2,64}/g, ' ')
    // Remove .com domains
    str = str.replace(matchDomains, ' ')
    // Remove alphanumerical/number codes
    str = str.replace(/[a-zA-Z]*[0-9]+[a-zA-Z0-9]*/g, ' ')
    return str
}

/**
 * @param {string} text
 * @returns {Array}
 */
function textProcessor(text) {
    // Normalize special characters/word separators
    text = text.replace(separators, ' ')
    text = text.trim().toLowerCase()
    return strToUtf8Bytes(text) // returns array of words
}

/**
 * Gets Ngrams from a given array of words
 *
 * @param {Array} words
 * @returns {Object}
 */
function getByteNgrams(words) {
    let byteNgrams = {}
    let thisBytes
    let j

    for (let key in words) {
        let word = words[key]
        let len = word.length
        if (len > 70) {
            len = 70
        }
        // 4 bytes ngram length, 3 bytes stride
        for (j = 0; j + 4 < len; j += 3) {
            thisBytes = (j === 0 ? ' ' : '') + word.substring(j, j + 4)
            byteNgrams[thisBytes] = true
        }
        thisBytes = (j === 0 ? ' ' : '') + word.substring(len !== 3 ? len - 4 : 0) + ' '
        byteNgrams[thisBytes] = true
    }
    return byteNgrams
}

/**
 * Calculate scores for each language from the given Ngrams
 *
 * @param {Object} byteNgrams
 * @param {Object} languageData
 * @returns {Array}
 */
function calculateScores(byteNgrams, languageData) {
    let bytes, lang, thisByte
    let langScore = [...languageData.langScore]
    let baseNgramScore = 53; // In order to reduce DB size we subtract minimum score
    for (bytes in byteNgrams) {
        //frequency = byteNgrams[bytes]
        thisByte = languageData.ngrams[bytes]
        // Most time-consuming loop, do only the strictly necessary inside
        for (lang in thisByte) {
            langScore[lang] += thisByte[lang] + baseNgramScore;
        }
    }
    return langScore
}

/**
 * Converts each byte to a single character, using our own dictionary, since JavaScript does not allow raw byte
 * strings or invalid UTF-8 characters. We could use TextEncoder() to create an Uint8Array, and then translate to our
 * dictionary, but this function is overall faster as it does both jobs at once
 *
 * Alternatives such as just using Uint8Array/hex for detection adds complexity and or a bigger database
 *
 * @param {string} str
 * @returns {Array}
 */
function strToUtf8Bytes(str) {
    let encoded = ''
    let words = []
    let countBytes = 0
    const cutAfter = 350 // Cut to first whitespace after 350 byte length offset
    const enforceCutAfter = 380 // Cut after any UTF-8 character when surpassing 380 byte length

    for (let ii = 0; ii < str.length; ii++) {
        let charCode = str.charCodeAt(ii)

        if (charCode < 0x80) {
            if (charCode === 32) {
                if (encoded !== '') {
                    words.push(encoded)
                    encoded = ''
                }
                if (countBytes > cutAfter) {
                    break
                }
            } else {
                encoded += str[ii]
            }
            countBytes++
        } else if (charCode < 0x800) {
            encoded += dictionary[0xc0 | (charCode >> 6)] + dictionary[0x80 | (charCode & 0x3f)]
            countBytes += 2
        } else if (charCode < 0xd800 || charCode >= 0xe000) {
            encoded += dictionary[0xe0 | (charCode >> 12)] + dictionary[0x80 | ((charCode >> 6) & 0x3f)] +
                dictionary[0x80 | (charCode & 0x3f)]
            countBytes += 3
        } else {
            // UTF-16
            ii++
            charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(ii) & 0x3ff))
            encoded += dictionary[0xf0 | (charCode >> 18)] + dictionary[0x80 | ((charCode >> 12) & 0x3f)] +
                dictionary[0x80 | ((charCode >> 6) & 0x3f)] + dictionary[0x80 | (charCode & 0x3f)]
            countBytes += 4
        }
        if (countBytes > enforceCutAfter) {
            break
        }
    }
    if (encoded !== '') {
        words.push(encoded)
        // It is faster to build the array than to words.split(/ +/).filter((x) => x !== ' ') later
    }
    return words
}

/**
 * Filters languages not included in the subset, from the result scores
 *
 * @param {Array} results
 * @param {Array} subset
 * @returns {Array}
 */
function filterLangSubset(results, subset) {
    let subResults = [];
    // const keepSet = new Set(subset);
    for (let i = 0; i < results.length; i++) {
        if (results[i] > 0 && subset.indexOf(i) > -1) { // keepSet.has(i)
            subResults[i] = results[i];
        }
    }
    return subResults;
}

/**
 * Validates an expected array of ISO 639-1 language code strings, given by the user, and creates a subset of the
 * valid languages compared against the current database available languages. Pure function: does not read or
 * write any instance state, it just computes what the new subset value should be.
 *
 * @param {Array|boolean} languages
 * @param {Object} languageData
 * @returns {Array|boolean}
 */
function makeSubset(languages, languageData) {
    if (!languageData.type) throw new Error(loadError)
    let subset = false
    if (languages) {
        subset = []
        for (let key in languages) {
            // Validate languages, by checking if they are available at languageData
            let lang = Object.keys(languageData.langCodes).find((lkey) => languageData.langCodes[lkey] === languages[key])
            if (lang) {
                subset.push(parseInt(lang))
            }
        }
        if (subset.length) {
            subset.sort()
        } else {
            subset = false
        }
    }
    return subset
}

function getMaxLang(obj) {
    let maxKey = false;
    let maxVal = 0;

    for (const key in obj) {
        const val = obj[key];
        if (val > 0 && val > maxVal) {
            maxVal = val;
            maxKey = key;
        }
    }
    return maxKey;
}

export { createEld };
