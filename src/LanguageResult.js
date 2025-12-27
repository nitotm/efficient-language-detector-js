/*
Copyright 2025 Nito T.M.
License https://www.apache.org/licenses/LICENSE-2.0 Apache-2.0
Author Nito T.M. (https://github.com/nitotm)
Package npmjs.com/package/eld
*/

import { avgScore } from './avgScore.js'

export class LanguageResult {
    /**
     * Creates an instance of LanguageResult.
     *
     * @param {string} language
     * @param {array} results
     * @param {number} numNgrams
     * @param {Object} langCodes
     * @memberof LanguageResult
     */
    constructor(language, results, numNgrams, langCodes) {
        this.language = language
        let orderedResults = null;
        this.getScores = () => {
            orderedResults = orderedResults || orderAndScale(results, numNgrams);
            return getScores(orderedResults, langCodes) // returns object
        };
        this.isReliable = (thresholdRatio = 0.75) => {
            orderedResults = orderedResults || orderAndScale(results, numNgrams);
            return isReliable(orderedResults, language, numNgrams, thresholdRatio) // returns boolean
        };
    }
}

/**
 * @param {object} results
 * @param {string} language
 * @param {number} numNgrams
 * @param {number} thresholdRatio
 * @returns {boolean}
 */
function isReliable(results, language, numNgrams, thresholdRatio) {
    if (!results.length || numNgrams < 3) {
        return false
    }
    const nextScore = results.length > 1 ? results[1][0] : 0
    return !(avgScore[language] * thresholdRatio > results[0][1] || 0.01 >
        Math.abs(results[0][1] - nextScore))

}

/**
 * Converts internal multi-array results, with integer language codes, to final object with ISO 639-1 codes
 * @param {Array} orderedResults
 * @param {Object} langCodes
 * @returns {Object}
 */
function getScores(orderedResults, langCodes) {
    let scores = {}
    // JavaScript does Not guarantee object order, but let's try to create final object in order
    for (let key in orderedResults) {
        scores[langCodes[orderedResults[key][0]]] = orderedResults[key][1];
    }
    return scores
}

/**
 * @param {Array} results
 * @param {number} numNgrams
 * @returns {Array}
 */
function orderAndScale(results, numNgrams) {
    // const entries = results.map((v, i) => [i, v]);
    let scale = 25 // Handpicked to scale raw scores values
    let newResults = []
    for (let lang in results) {
        if (results[lang] > 0) {
            let ngramScore = (results[lang] / numNgrams)
            // simple 0-1 score
            newResults.push([parseInt(lang), ngramScore / (ngramScore + scale)])
        }
    }
    newResults.sort((a, b) => b[1] - a[1]);

    return newResults;
}
