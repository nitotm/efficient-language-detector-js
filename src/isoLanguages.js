/*
Copyright 2023 Nito T.M.
License https://www.apache.org/licenses/LICENSE-2.0 Apache-2.0
Author Nito T.M. (https://github.com/nitotm)
Package npmjs.com/package/eld
*/

/**
 * Converts ngram database language indexes (integer) to ISO 639-1 code
 *
 * @param {Array} languageSet
 * @param {Object} defaultLanguages
 * @returns {Object}
 */
export function isoLanguages (languageSet, defaultLanguages) {
  let languageCodes = {}
  for (let langID of languageSet) {
    languageCodes[langID] = defaultLanguages[langID]
  }
  return languageCodes
}
