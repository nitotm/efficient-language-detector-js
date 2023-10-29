/*
License https://www.apache.org/licenses/LICENSE-2.0 Apache-2.0
Original Author Nito T.M. (https://github.com/nitotm)
*/

import { dictionary } from "./dictionary.js";
import { LanguageData, NgramModule } from "./language-data.js";
import { LanguageResult } from "./language-result.js";
import { matchDomains, separators } from "./regex-patterns.js";

export class ELDR {
  #languageData: LanguageData;
  #doCleanText = false;

  constructor(ngramModule: NgramModule) {
    this.#languageData = new LanguageData(ngramModule);
  }

  detect(text: string): LanguageResult {
    if (typeof text !== "string") {
      return new LanguageResult("", [], 0, {});
    }

    if (this.#doCleanText) {
      // Removes Urls, emails, alphanumerical & numbers
      text = getCleanTxt(text);
    }

    const byteWords = textProcessor(text);
    const byteNgrams = getByteNgrams(byteWords);
    const numNgrams = Object.keys(byteNgrams).length;
    const results: [number, number][] = this.#calculateScores(
      byteNgrams,
      numNgrams
    );
    let iso639_1 = "";

    if (results.length > 0) {
      results.sort((a, b) => b[1] - a[1]);
      iso639_1 = this.#languageData.langCodes[results[0][0]];
    }

    return new LanguageResult(
      iso639_1,
      results,
      numNgrams,
      this.#languageData.langCodes
    );
  }

  info() {
    return {
      "Data type": this.#languageData.type,
      Languages: this.#languageData.langCodes,
    };
  }

  #calculateScores(byteNgrams: Record<string, number>, numNgrams: number) {
    let relevancy;
    const langScore: number[] = [...this.#languageData.langScore];

    for (const bytes in byteNgrams) {
      const frequency = byteNgrams[bytes];
      const thisByte = this.#languageData.ngrams[bytes];

      if (thisByte) {
        const langCount = Object.keys(thisByte).length;
        // Ngram score multiplier, the fewer languages found the more relevancy. Formula can be fine-tuned.
        if (langCount === 1) {
          relevancy = 27; // Handpicked relevance multiplier, trial-error
        } else if (langCount < 16) {
          relevancy = (16 - langCount) / 2 + 1;
        } else {
          relevancy = 1;
        }

        // Most time-consuming loop, do only the strictly necessary inside
        for (const lang in thisByte) {
          const globalFrequency = thisByte[lang];
          langScore[lang] +=
            (frequency > globalFrequency
              ? globalFrequency / frequency
              : frequency / globalFrequency) *
              relevancy +
            2;
        }
      }
    }

    // This divisor will produce a final score between 0 - ~1, score could be >1. Can be improved.
    const resultDivisor = numNgrams * 3.2;
    const results: [number, number][] = [];
    for (const [lang, score] of langScore.entries()) {
      if (score) {
        // Javascript does Not guarantee object order, so a multi-array is used
        results.push([lang, score / resultDivisor]); // * LanguageData.scoreNormalizer[lang];
      }
    }

    return results;
  }

  cleanText(doCleanText: boolean) {
    this.#doCleanText = Boolean(doCleanText);
  }
}

/**
 * Removes parts of a string, that may be considered as "noise" for language detection
 *
 * @param {string} str
 * @returns {string}
 */
function getCleanTxt(str: string) {
  // Remove URLS
  str = str.replaceAll(
    /[hw]((ttps?:\/\/(www\.)?)|ww\.)([^\s#./?-]+\.?)+(\/\S*)?/gi,
    " "
  );
  // Remove emails
  str = str.replaceAll(/[\w!$%&+.`’-]+@[\d.A-Za-z-]+\.[\dA-Za-z-]{2,64}/g, " ");
  // Remove .com domains
  str = str.replace(matchDomains, " ");
  // Remove alphanumerical/number codes
  str = str.replaceAll(/[A-Za-z]*\d+[\dA-Za-z]*/g, " ");
  return str;
}

/**
 * @param {string} text
 * @returns {Array}
 */
function textProcessor(text: string): string[] {
  text = text.slice(0, 1000);
  // Normalize special characters/word separators
  text = text.replace(separators, " ");
  text = text.trim().toLowerCase();
  return strToUtf8Bytes(text); // Returns array of words
}

/**
 * Gets Ngrams from a given array of words
 *
 * @param {Array} words
 * @returns {Object}
 */
function getByteNgrams(words: string[]): Record<string, number> {
  const byteNgrams: Record<string, number> = {};
  let countNgrams = 0;
  let thisBytes: string;
  let j;

  for (const word of words) {
    const len = Math.min(word.length, 70);

    for (j = 0; j + 4 < len; j += 3, ++countNgrams) {
      thisBytes = (j === 0 ? " " : "") + word.slice(j, j + 4);
      byteNgrams[thisBytes] =
        byteNgrams[thisBytes] === undefined ? 1 : byteNgrams[thisBytes] + 1;
    }

    thisBytes =
      (j === 0 ? " " : "") +
      word.slice(Math.max(0, Math.max(0, len === 3 ? 0 : len - 4))) +
      " ";
    byteNgrams[thisBytes] =
      byteNgrams[thisBytes] === undefined ? 1 : byteNgrams[thisBytes] + 1;
    countNgrams++;
  }

  // Frequency is multiplied by 15000 at the ngrams database. A reduced number (13200) seems to work better.
  // Linear formulas were tried, decreasing the multiplier for fewer ngram strings, no meaningful improvement.
  for (const bytes in byteNgrams) {
    byteNgrams[bytes] = (byteNgrams[bytes] / countNgrams) * 13_200;
  }

  return byteNgrams;
}

/**
 * Converts each byte to a single character, using our own dictionary, since javascript does not allow raw byte
 * strings or invalid UTF-8 characters. We could use TextEncoder() to create an Uint8Array, and then translate to our
 * dictionary, but this function is overall faster as it does both jobs at once
 *
 * Alternatives such as just using Uint8Array/hex for detection adds complexity and or a bigger database
 *
 * @param {string} str
 * @returns {Array}
 */
function strToUtf8Bytes(str: string) {
  let encoded = "";
  const words: string[] = [];
  let countBytes = 0;
  const cutAfter = 350; // Cut to first whitespace after 350 byte length offset
  const enforceCutAfter = 380; // Cut after any UTF-8 character when surpassing 380 byte length

  for (let ii = 0; ii < str.length; ii++) {
    let charCode = str.codePointAt(ii);
    if (charCode === undefined) {
      break;
    }

    if (charCode < 0x80) {
      if (charCode === 32) {
        if (encoded !== "") {
          words.push(encoded);
          encoded = "";
        }

        if (countBytes > cutAfter) {
          break;
        }
      } else {
        encoded += str[ii];
      }

      countBytes++;
    } else if (charCode < 0x8_00) {
      encoded +=
        dictionary[0xc0 | (charCode >> 6)] +
        dictionary[0x80 | (charCode & 0x3f)];
      countBytes += 2;
    } else if (charCode < 0xd8_00 || charCode >= 0xe0_00) {
      encoded +=
        dictionary[0xe0 | (charCode >> 12)] +
        dictionary[0x80 | ((charCode >> 6) & 0x3f)] +
        dictionary[0x80 | (charCode & 0x3f)];
      countBytes += 3;
    } else {
      // UTF-16
      ii++;
      charCode =
        0x1_00_00 +
        (((charCode & 0x3_ff) << 10) | ((str.codePointAt(ii) ?? 0) & 0x3_ff));
      encoded +=
        dictionary[0xf0 | (charCode >> 18)] +
        dictionary[0x80 | ((charCode >> 12) & 0x3f)] +
        dictionary[0x80 | ((charCode >> 6) & 0x3f)] +
        dictionary[0x80 | (charCode & 0x3f)];
      countBytes += 4;
    }

    if (countBytes > enforceCutAfter) {
      break;
    }
  }

  if (encoded !== "") {
    words.push(encoded);
    // It is faster to build the array than to words.split(/ +/).filter((x) => x !== ' ') later
  }

  return words;
}
