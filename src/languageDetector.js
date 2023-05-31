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

import { languagesData } from './languagesData.js'
import { eld_ngrams } from './ngrams/ngrams-m.js'
import { uniRegex } from './unicode_regex.js'
import { saveLanguagesSubset } from './saveLanguagesSubset.dev.js'

// ES2015
export const langDetector = (function () {
  
  // JS does not allow raw byte strings, Uint8Array\hex adds complexity and a heavier database. A dictionary for invalid UTF-8 bytes solves all problems.
  let dictionary =  [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',
	  ' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','\'',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',
	  ' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',
	  ' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','`','a','b','c','d','e','f','g','h','i','j','k',
	  'l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',' ',' ',' ',' ',' ','M','2','R','J','O','P','{','ä',
	  '>','â','ü','é','_','Q','á','ô','ë','å','õ','è','ï','Z','û','}','à','3','ù','É','Y','î','í',']','|',')','ÿ','~',
	  '1','V','D','T','4','8','F','I','K','7','W','S','/','E','B','5',';','N','C','ê','*','X','=','^',':','[','H','ò',
	  ' ',' ','¢','!','(',',','ß',' ','ø','ó',' ',' ',' ',' ','U','ö','6','@','À','Á',' ','<','ý','G','-','A','ñ','ú',
	  ' ',' ',' ',' ','$','L','æ','?','0','"','#','%','&','+','ì','9','.','ç',' ','µ',' ',' ',' ',' ',' ',' ',' ',' ',
	  ' ',' ',' ',' ',' ',' ',' ',' ']
  let separator = new RegExp('[^' + uniRegex.L.bmp + ']+(?<![\\x27\\x60\\u2019])', 'gu')
  let rdomains = new RegExp('([A-Za-z0-9-]+\.)+com(\/\S*|[^' + uniRegex.L.bmp + '])', 'g')
  let subset = false
  let countBytes = 0
  let tooShort = { 'language': false, 'error': 'Text to short', 'scores': {} }

  function cleanTxt (str) {
    // Remove URLS
    str = str.replace(/[hw]((ttps?:\/\/(www\.)?)|ww\.)([^\s/?\.#-]+\.?)+(\/\S*)?/gi, ' ')
    // Remove emails
    str = str.replace(/[a-zA-Z0-9.!$%&’+_`-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9-]{2,64}/g, ' ')
    // Remove domains
    str = str.replace(rdomains, ' ')
    // Remove alphanumerical/number codes
    str = str.replace(/[a-zA-Z]*[0-9]+[a-zA-Z0-9]*/g, ' ')
    return str
  }

  function getScores (results) {
    let scores = {}
    let key
    for (key in results) {
      let score = results[key][1]
      if (score === 0) {
        break
      }
      scores[languagesData.langCodes[results[key][0]]] = score
    }
    return scores
  }

  function getByteNgrams (words) {
    let tokens = {}
    let countNgrams = 0
    let thisBytes
    let j

    for (let key in words) {
      let word = words[key]
      let len = word.length
      if (len > 70) {
        len = 70
      }
		
      for (j = 0; j + 4 < len; j += 3, ++countNgrams) {
        thisBytes = (j === 0 ? ' ' : '') + word.substring(j, j + 4)
        tokens[thisBytes] = (typeof tokens[thisBytes] !== 'undefined' ? tokens[thisBytes] + 1 : 1)
      }
      thisBytes = (j === 0 ? ' ' : '') + word.substring(len !== 3 ? len - 4 : 0) + ' '
      tokens[thisBytes] = (typeof tokens[thisBytes] !== 'undefined' ? tokens[thisBytes] + 1 : 1)
      countNgrams++
    }
    // Frequency is multiplied by 15000 at the ngrams database. A reduced number seems to work better. Linear formulas were tried, decreasing the multiplier for fewer ngram strings, no meaningful improvement.
    for (let bytes in tokens) {
      tokens[bytes] = tokens[bytes] / countNgrams * 13200
    }
    return tokens
  }

  function calcScores (txtNgrams, numNgrams) {
    let bytes, ngramFrequency, relevancy, num_langs, frequency, lang, thisByte
    let langScores = [...languagesData.langScore]

    for (bytes in txtNgrams) {
      frequency = txtNgrams[bytes]
      thisByte = eld_ngrams[bytes]

      if (thisByte) {
        num_langs = Object.keys(thisByte).length
        // Ngram score multiplier, the fewer languages found the more relevancy. Formula can be fine-tuned.
        if (num_langs === 1) {
          relevancy = 27
        } else {
          if (num_langs < 16) {
            relevancy = (16 - num_langs) / 2 + 1
          } else {
            relevancy = 1
          }
        }
        // Most time-consuming loop, do only the strictly necessary inside
        for (lang in thisByte) {
          ngramFrequency = thisByte[lang]
          langScores[lang] += (frequency > ngramFrequency ? ngramFrequency / frequency : frequency / ngramFrequency) *
            relevancy + 2
        }
      }
    }

    let results = []
    let resultDivisor = numNgrams * 3.2
    // This divisor will produce a final score between 0 - ~1, score could be >1. Can be improved.
    for (lang in langScores) {
      if (langScores[lang]) {
        // Javascript does Not guarantee object order, so a multiarray is used
        results.push([parseInt(lang), langScores[lang] / resultDivisor]) // * languagesData.scoreNormalizer[lang];
      }
    }
    return results
  }

  function dynamicLangsSubset (langs) {

    if (langs) {
      subset = []
      for (let key in langs) {
        let lang = languagesData.langCodes.indexOf(langs[key])
        if (lang) {
          subset.push(lang)
        }
      }
      if (subset.length) {
        subset.sort()
      } else {
        subset = false
      }
    } else {
      subset = false
    }
    return subset
	 
  }

  function filterLangsSubset (results) {
    let subResults = []
    for (let key in results) {
      if (subset.indexOf(results[key][0]) > -1) {
        subResults.push(results[key])
      }
    }
    return subResults
  }

  // TextEncoder() is faster at just creating a Uint8Array, but this function does many jobs at once, faster overall (cut string, convert to dictionary)
  function strToUtf8Bytes (str) {
    let encoded = ''
    let words = []
    countBytes = 0
    if (typeof str == 'undefined') {
      return encoded
    }
	 
    for (let ii = 0; ii < str.length; ii++) {
      let charCode = str.charCodeAt(ii)

      if (charCode < 0x80) {
        if (charCode === 32) {
          if (encoded !== '') {
            words.push(encoded)
            encoded = ''
          }
          if (countBytes > 350) {
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

      } else { // UTF-16
        ii++
        charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(ii) & 0x3ff))
        encoded += dictionary[0xf0 | (charCode >> 18)] + dictionary[0x80 | ((charCode >> 12) & 0x3f)] +
          dictionary[0x80 | ((charCode >> 6) & 0x3f)] + dictionary[0x80 | (charCode & 0x3f)]
        countBytes += 4
      }
      if (countBytes > 380) {
        break
      }
    }
    if (encoded !== '') {
      words.push(encoded)
    }
    return words
  }

  /*
    detect() returns an object, with a value named 'language', which will be either a ISO 639-1 code or false
    {'language': 'en'}
    {'language': false, 'error': 'Some error', 'scores': {}};

    When langDetector.returnScores = true;
    {'language': 'en', 'scores': {'en': 0.6, 'es': 0.2}};
  */
  function detect (text, { cleanText = false, checkConfidence = false, minByteLength = 12, minNgrams = 3 } = {}) {
    if (typeof text == 'undefined') return tooShort
    if (cleanText) {
      // Removes Urls, emails, alphanumerical & numbers
      text = cleanTxt(text)
    }
    minNgrams = Math.max(1, minNgrams)
    // Normalize special characters/word separators
    text = text.substring(0, 1000).replace(separator, ' ').trim()
    text = text.toLowerCase()
    let byteWords = strToUtf8Bytes(text)

    if (countBytes < minByteLength) {
      return tooShort
    }

    let txtNgrams = getByteNgrams(byteWords)
    let numNgrams = Object.keys(txtNgrams).length

    if (numNgrams >= minNgrams) {
      let results = calcScores(txtNgrams, numNgrams)
      if (subset) {
        results = filterLangsSubset(results)
      }
      results.sort((a, b) => b[1] - a[1])

      if (results.length > 0) {
        let top_lang = results[0][0]
        // Minimum confidence threshold.
        if (checkConfidence) {
          let next = (results.length > 1 ? results[1][0] : 0)
          // A minimum of a 17% per ngram score from average
          if (languagesData.avgScore[top_lang] * 0.17 > results[0][1] / numNgrams ||
            (0.01 > Math.abs(results[0][1] - next))) {
            return {
              'language': false,
              'error': 'No language has been identified with sufficient confidence, set checkConfidence to false to avoid error',
              'scores': {},
            }
          }
        }
        if (!this.returnScores) {
          return {
            'language': languagesData.langCodes[top_lang],
          }
        } else {
          return {
            'language': languagesData.langCodes[top_lang], 'scores': getScores(results),
          }
        }
      }
      return {
        'language': false, 'error': 'Language not detected', 'scores': {},
      }
    }
    return {
      'language': false, 'error': 'Not enough distinct ngrams', 'scores': {},
    }
  }

  function saveSubset (langs) {
    let langs_array = langDetector.dynamicLangsSubset(langs)
    langDetector.dynamicLangsSubset(false)
    saveLanguagesSubset.saveSubset(langs_array, eld_ngrams)
  }

  return {
    detect: detect, dynamicLangsSubset: dynamicLangsSubset, saveSubset: saveSubset,
  }

})()