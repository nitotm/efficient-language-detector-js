# Efficient Language Detector

<div align="center">
	
![supported Javascript versions](https://img.shields.io/badge/JS-%3E%3D%20ES2015-blue)
![supported Javascript versions](https://img.shields.io/badge/Node.js-%3E%3D%2016-blue)
[![license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![supported languages](https://img.shields.io/badge/supported%20languages-60-brightgreen.svg)](#languages)
	
</div>

Efficient language detector (*Nito-ELD* or *ELD*) is a fast and accurate language detector, is one of the fastest non compiled detectors, while its accuracy is within the range of the heaviest and slowest detectors.

It's 100% Javascript (vanilla), easy installation and no dependencies.  
ELD is also available in [Python](https://github.com/nitotm/efficient-language-detector-py) and [PHP](https://github.com/nitotm/efficient-language-detector).

1. [Install](#install)
2. [How to use](#how-to-use)
3. [Benchmarks](#benchmarks)
4. [Languages](#languages)

## Install

- For *Node.js*
```bash
$ npm install eld
```
- For Web, just download or clone the files  
`git clone https://github.com/nitotm/efficient-language-detector-js`

## How to use?

### Load ELD

- At Node.js REPL
```javascript
const { eld } = await import('eld')
```
- At Node.js
```javascript
import { eld } from 'eld' // use .mjs extension for version <18
```
- At the Web Browser

```html

<script type="module" charset="utf-8">
    import { eld } from './src/languageDetector.js' // Update path.
    /* code */
</script>
```
- To load the minified version, which is not a module
```html
<script src="minified/eld.M60.min.js" charset="utf-8"></script>
```

### Usage

`detect()` expects a UTF-8 string, and returns an object, with a 'language' variable, with a ISO 639-1 code or empty string
```javascript
// Initialize database, selecting size: 'extrasmall', 'small', 'medium', 'large'
await eld.init('large')
	  
console.log( eld.detect('Hola, cómo te llamas?') )
// { language: 'es', getScores(): {'es': 0.5, 'et': 0.2}, isReliable(): true }
// returns { language: string, getScores(): Object, isReliable(): boolean } 

console.log( eld.detect('Hola, cómo te llamas?').language )
// 'es'
```
 - To reduce the languages to be detected, there are 2 options, they only need to be executed once. (Check available [languages](#languages) below)
```javascript
let langSubset = ['en', 'es', 'fr', 'it', 'nl', 'de']

// Option 1 
// Setting dynamicLangSubset(), detect() executes normally but finally filters the excluded languages
eld.dynamicLangSubset(langSubset) // Returns an Object with the validated languages of the subset
// to remove the subset
eld.dynamicLangSubset(false)

// Option 2
// The optimal way to regularly use the same subset, is using saveSubset() to download a new database
eld.saveSubset(langSubset) // ONLY for the Web Browser, and not included at minified files
// We can load any Ngrams database saved at src/ngrams/, including subsets. Returns true if success
await eld.loadNgrams('ngramsL60.js') // eld.loadNgrams('file').then((loaded) => { if (loaded) { } })
// To modify the preloaded database, edit the filename loadNgrams('filename') at languageDetector.js
```
- Also, we can get the current status of eld: languages, database type and subset
```javascript
  console.log( eld.info() )
```
## Benchmarks

I compared *ELD* with a different variety of detectors, since the interesting part is the algorithm.

| URL                                                       | Version       | Language     |
|:----------------------------------------------------------|:--------------|:-------------|
| https://github.com/nitotm/efficient-language-detector-js/ | 0.9.0         | Javascript   |
| https://github.com/nitotm/efficient-language-detector/    | 1.0.0         | PHP          |
| https://github.com/pemistahl/lingua-py                    | 1.3.2         | Python       |
| https://github.com/CLD2Owners/cld2                        | Aug 21, 2015  | C++          |
| https://github.com/google/cld3                            | Aug 28, 2020  | C++          |
| https://github.com/wooorm/franc                           | 6.1.0         | Javascript   |

Benchmarks: **Tweets**: *760KB*, short sentences of 140 chars max.; **Big test**: *10MB*, sentences in all 60 languages supported; **Sentences**: *8MB*, this is the *Lingua* sentences test, minus unsupported languages.  
Short sentences is what *ELD* and most detectors focus on, as very short text is unreliable, but I included the *Lingua* **Word pairs** *1.5MB*, and **Single words** *880KB* tests to see how they all compare beyond their reliable limits.

These are the results, first, accuracy and then execution time.

<!-- Accuracy table
|                     | Tweets       | Big test     | Sentences    | Word pairs   | Single words |
|:--------------------|:------------:|:------------:|:------------:|:------------:|:------------:|
| **Nito-ELD**        | 99.3%        | 99.4%        | 98.8%        | 87.6%        | 73.3%        |
| **Nito-ELD-L**      | 99.4%        | 99.4%        | 98.7%        | 89.4%        | 76.1%        |
| **Nito-ELD-xs**     | 99.2%        | 99.4%        | 98.4%        | 84.4%        | 66.8%        |
| **Lingua**          | 98.8%        | 99.1%        | 98.6%        | 93.1%        | 80.0%        |
| **CLD2**            | 93.8%        | 97.2%        | 97.2%        | 87.7%        | 69.6%        |
| **Lingua low**      | 96.0%        | 97.2%        | 96.3%        | 83.7%        | 68.0%        |
| **CLD3**            | 92.2%        | 95.8%        | 94.7%        | 69.0%        | 51.5%        |
| **franc**           | 89.8%        | 92.0%        | 90.5%        | 65.9%        | 52.9%        |
-->
<img alt="accuracy table" width="800" src="https://raw.githubusercontent.com/nitotm/efficient-language-detector-js/main/misc/table_accuracy_js.svg">

<!--- Time table
|                     | Tweets       | Big test     | Sentences    | Word pairs   | Single words |
|:--------------------|:------------:|:------------:|:------------:|:------------:|:------------:|
| **Nito-ELD-js**     |     0.58"    |      5.1"    |      4.3"    |     1.2"     |     0.73"    |
| **Nito-ELD-L-js**   |     0.59"    |      5.2"    |      4.5"    |     1.2"     |     0.77"    |
| **Nito-ELD-XS-js**  |     0.5"     |      4.6"    |      4"      |     1.1"     |     0.71"    |
| **Lingua**          |  4790"       |  24000"      |  18700"      |  8450"       |  6700"       |
| **CLD2**            |     0.35"    |      2"      |      1.7"    |     0.98"    |     0.8"     |
| **Lingua low**      |    64"       |    370"      |    308"      |   108"       |    85"       |
| **CLD3**            |     3.9"     |     29"      |     26"      |    12"       |    11"       |
| **franc**           |     1.2"     |      8"      |      7.8"    |     2.8"     |     2"       |
| **Nito-ELD-php**    |     0.31"    |      2.5"    |      2.2"    |     0.66"    |     0.48"    |
-->
<img alt="time table" width="800" src="https://raw.githubusercontent.com/nitotm/efficient-language-detector-js/main/misc/table_time_js.svg">

<sup style="color:#08e">1.</sup> <sup style="color:#777">Lingua could have a small advantage as it participates with 54 languages, 6 less.</sup>  
<sup style="color:#08e">2.</sup> <sup style="color:#777">CLD2 and CLD3, return a list of languages, the ones not included in this test where discarded, but usually they return one language, I believe they have a disadvantage. 
Also, I confirm the results of CLD2 for short text are correct, contrary to the test on the *Lingua* page, they did not use the parameter "bestEffort = True", their benchmark for CLD2 is unfair.

*Lingua* is the average accuracy winner, but at what cost, the same test that in *ELD* or *CLD2* is below 6 seconds, in Lingua takes more than 5 hours! It acts like a brute-force software. 
Also, its lead comes from single and pair words, which are unreliable regardless.

I added *ELD-L* for comparison, which has a 2.3x bigger database, but only increases execution time marginally, a testament to the efficiency of the algorithm. *ELD-L* is not the main database as it does not improve language detection in sentences.

For a client side solution, I included an all-in-one detector+Ngrams minified file, of the standard version (M), and XS which still performs great for sentences. 
The XS version only weights 865kb, when gzipped it's only 245kb. The standard version is 486kb gzipped.

Here is the average, per benchmark, of Tweets, Big test & Sentences.

![Sentences tests average](https://raw.githubusercontent.com/nitotm/efficient-language-detector-js/main/misc/sentences-tests-avg-js.png)
<!--- Sentences average
|                     | Time         | Accuracy     |
|:--------------------|:------------:|:------------:|
| **Nito-ELD-js**     |      3.32"   | 99.16%       |
| **Nito-ELD-php**    |      1.65"   | 99.16%       |
| **Lingua**          |  15800"      | 98.84%       |
| **CLD2**            |      1.35"   | 96.08%       |
| **Lingua low**      |    247"      | 96.51%       |
| **CLD3**            |     19.6"    | 94.19%       |
| **franc**           |      5.7"    | 90.79%       |
-->

## Languages

These are the *ISO 639-1 codes* of the 60 supported languages for *Nito-ELD* v1

> 'am', 'ar', 'az', 'be', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'eu', 'fa', 'fi', 'fr', 'gu', 'he', 'hi', 'hr', 'hu', 'hy', 'is', 'it', 'ja', 'ka', 'kn', 'ko', 'ku', 'lo', 'lt', 'lv', 'ml', 'mr', 'ms', 'nl', 'no', 'or', 'pa', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sq', 'sr', 'sv', 'ta', 'te', 'th', 'tl', 'tr', 'uk', 'ur', 'vi', 'yo', 'zh'


Full name languages:

> Amharic, Arabic, Azerbaijani (Latin), Belarusian, Bulgarian, Bengali, Catalan, Czech, Danish, German, Greek, English, Spanish, Estonian, Basque, Persian, Finnish, French, Gujarati, Hebrew, Hindi, Croatian, Hungarian, Armenian, Icelandic, Italian, Japanese, Georgian, Kannada, Korean, Kurdish (Arabic), Lao, Lithuanian, Latvian, Malayalam, Marathi, Malay (Latin), Dutch, Norwegian, Oriya, Punjabi, Polish, Portuguese, Romanian, Russian, Slovak, Slovene, Albanian, Serbian (Cyrillic), Swedish, Tamil, Telugu, Thai, Tagalog, Turkish, Ukrainian, Urdu, Vietnamese, Yoruba, Chinese


## Future improvements

- Train from bigger datasets, and more languages.
- The tokenizer could separate characters from languages that have their own alphabet, potentially improving accuracy and reducing the N-grams database. Retraining and testing is needed.

**Donate / Hire**   
If you wish to Donate for open source improvements, Hire me for private modifications / upgrades, or to Contact me, use the following link: https://linktr.ee/nitotm