/*
Copyright 2023 Nito T.M.
License https://www.apache.org/licenses/LICENSE-2.0 Apache-2.0
Author Nito T.M. (https://github.com/nitotm)
Package npmjs.com/package/eld
*/

import { isoLanguages } from './isoLanguages.js'

export const saveLanguageSubset = (function () {
  /**
   * Creates a ngrams database file download, only with the languages included in the langArray subset
   *
   * @param {Array} langArray
   * @param {Object} ngrams
   * @param {Object} defaultLanguages
   * @param {string} type
   */
  function saveSubset (langArray, ngrams, defaultLanguages, type) {
    // langArray languages are already validated by dynamicLangSubset()
    if (!langArray.length) {
      return 'No languages found'
    }
    let newNgrams = JSON.parse(JSON.stringify(ngrams)) // Deep copy of object
    const file = 'ngrams' + type + '-' + langArray.length + '_' + Date.now() + '.js'

    for (let ngram in newNgrams) {
      for (let id in newNgrams[ngram]) {
        if (langArray.indexOf(parseInt(id)) === -1) {
          delete newNgrams[ngram][id]
        }
      }

      if (Object.keys(newNgrams[ngram]).length === 0) {
        delete newNgrams[ngram]
      }
    }

    download('// Copyright 2023 Nito T.M. [ Apache 2.0 Licence https://www.apache.org/licenses/LICENSE-2.0 ]\n' +
      'export const ngramsData = {\n' +
      '   type: "' + type + '",\n' +
      '   languages: ' + JSON.stringify(isoLanguages(langArray, defaultLanguages)) + ',\n' +
      '   isSubset: true,\n' +
      '   ngrams: ' + ngramExport(newNgrams) + '\n' +
      '}', file, 'js')
  }

  /**
   * @param {Object} ngrams
   * @returns {string}
   */
  function ngramExport (ngrams) {
    if (typeof ngrams === 'object' && ngrams) {
      let toImplode = []
      for (const property in ngrams) {
        toImplode.push('\'' + property.replace(/'/g, '\\\'') + '\':' + joinNumbers(ngrams[property]))
      }
      return '{' + toImplode.join(',') + '}'
    }
  }

  /**
   * @param {Object} obj
   * @returns {string}
   */
  function joinNumbers (obj) {
    let toImplode = []
    for (const property in obj) {
      toImplode.push(property + ':' + obj[property])
    }
    return '{' + toImplode.join(',') + '}'
  }

  /**
   * Triggers file download at the web browser
   *
   * @param {string} data
   * @param {string} filename
   * @param {string} type
   */
  function download (data, filename, type) {
    const file = new Blob([data], { type: type })
    if (typeof window === 'undefined') {
      console.log('saveSubset() is only available at the Web Browser')
      return
    }
    if (window.navigator.msSaveOrOpenBlob) {
      // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename)
    } else {
      // Others
      let a = document.createElement('a')
      let url = URL.createObjectURL(file)
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      setTimeout(function () {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 0)
    }
  }

  return {
    saveSubset: saveSubset
  }
})()
