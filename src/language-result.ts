/*
Copyright 2023 Nito T.M.
License https://www.apache.org/licenses/LICENSE-2.0 Apache-2.0
Author Nito T.M. (https://github.com/nitotm)
Package npmjs.com/package/eld
*/

import ISO6391 from "iso-639-1";

import { avgScore } from "./avg-score.js";
import { LangCodes } from "./language-data.js";

export class LanguageResult {
  iso639_1: string;
  #results: [number, number][];
  #langCodes: LangCodes;
  #numNgrams: number;

  constructor(
    iso639_1: string,
    results: [number, number][],
    numNgrams: number,
    langCodes: LangCodes
  ) {
    this.iso639_1 = iso639_1;
    this.#results = results;
    this.#langCodes = langCodes;
    this.#numNgrams = numNgrams;
  }

  get languageName(): string {
    return ISO6391.getName(this.iso639_1);
  }

  // backwards compatibility
  get language(): string {
    return this.iso639_1;
  }

  /**
   * Converts internal multi-array results, with integer language codes, to final object with ISO 639-1 codes
   */
  getScores(): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const result of this.#results) {
      const score = result[1];
      if (score === 0) {
        break;
      }
      scores[this.#langCodes[result[0]]] = score;
    }
    return scores;
  }

  isReliable(): boolean {
    if (this.#results.length === 0 || this.#numNgrams < 3) {
      return false;
    }
    const nextScore = this.#results.length > 1 ? this.#results[1][0] : 0;
    // A minimum of a 24% per ngram score from average
    return !(
      avgScore[this.iso639_1] * 0.24 > this.#results[0][1] / this.#numNgrams ||
      0.01 > Math.abs(this.#results[0][1] - nextScore)
    );
  }
}
