/*
	Copyright 2023 Nito T.M.
Author URL: https://github.com/nitotm

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

export const saveLanguagesSubset = (function () {

  function saveSubset (langs_array, eld_ngrams) {

    if (!langs_array) {
      return 'No languages found'
    }
    let defaultNgrams = JSON.parse(JSON.stringify(eld_ngrams))
    let file = 'ngrams_' + langs_array.length + '_' + Date.now() + '.js'

    for (let ngram in defaultNgrams) {

      for (let id in defaultNgrams[ngram]) {
        if (langs_array.indexOf(parseInt(id)) === -1) {
          delete defaultNgrams[ngram][id]
        }
      }

      if (Object.keys(defaultNgrams[ngram]).length === 0) {
        delete defaultNgrams[ngram]
      }
    }
    download('export const eld_ngrams = ' + ngram_export(defaultNgrams) + ';', file, 'js')
  }

  function ngram_export (object) {
    if (typeof object === 'object' && object) {
      let toImplode = []
      for (const property in object) {
        toImplode.push('\'' + property.replace(/'/g, '\\\'') + '\':' + join_nums(object[property]))
      }
      return '{' + toImplode.join(',') + '}'
    }
  }

  function join_nums (obj) {
    let toImplode = []
    for (const property in obj) {
      toImplode.push(property + ':' + obj[property])
    }
    return '{' + toImplode.join(',') + '}'
  }

  function download (data, filename, type) {
    let file = new Blob([data], { type: type })
    if (typeof window === 'undefined') {
      console.log('saveSubset() is only available at the Web Browser')
      return
    }
    if (window.navigator.msSaveOrOpenBlob) { // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename)
    } else { // Others
      let a = document.createElement('a'),
        url = URL.createObjectURL(file)
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
    saveSubset: saveSubset,
  }

})()
