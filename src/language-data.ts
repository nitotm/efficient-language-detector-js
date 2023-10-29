/*
Copyright 2023 Nito T.M.
License https://www.apache.org/licenses/LICENSE-2.0 Apache-2.0
Author Nito T.M. (https://github.com/nitotm)
Package npmjs.com/package/eld
*/

export type Ngrams = Record<string, Record<number, number>>;
export type LangCodes = Record<number, string>;

export interface NgramModule {
  type: string;
  languages: LangCodes;
  isSubset: boolean;
  ngrams: Ngrams;
}

export class LanguageData {
  langCodes: LangCodes;
  langScore: number[];
  ngrams: Ngrams;
  type: string;

  constructor(ngramModule: NgramModule) {
    this.langCodes = ngramModule.languages;
    this.langScore = Array.from(Object.keys(this.langCodes), () => 0);
    this.ngrams = ngramModule.ngrams;
    this.type = ngramModule.type;
  }
}
