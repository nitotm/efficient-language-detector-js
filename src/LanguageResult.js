/*
Copyright 2023 Nito T.M.
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
   * @param {Object} results
   * @param {number} numNgrams
   * @param {Object} langCodes
   * @memberof LanguageResult
   */
  constructor (language, results, numNgrams, langCodes) {
    this.language = language
    this.getScores = () => getScores(results, langCodes) // returns object
    this.isReliable = () => isReliable(results, numNgrams, language) // returns boolean
  }
}

/**
 * @param {object} results
 * @param {number} numNgrams
 * @param {string} language
 * @returns {boolean}
 */
function isReliable (results, numNgrams, language) {
  if (!results.length || numNgrams < 3) {
    return false
  }
  const nextScore = results.length > 1 ? results[1][0] : 0
  // A minimum of a 24% per ngram score from average
  return !(avgScore[language] * 0.24 > results[0][1] / numNgrams || 0.01 >
    Math.abs(results[0][1] - nextScore))

}

/**
 * Converts internal multi-array results, with integer language codes, to final object with ISO 639-1 codes
 * @param {Object} results
 * @param {Object} langCodes
 * @returns {Object}
 */
function getScores (results, langCodes) {
  let scores = {}
  let key
  for (key in results) {
    let score = results[key][1]
    if (score === 0) {
      break
    }
    scores[langCodes[results[key][0]]] = score
  }
  return scores
}

