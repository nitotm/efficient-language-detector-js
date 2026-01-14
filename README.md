# Efficient Language Detector

<div align="center">
	
![supported Javascript versions](https://img.shields.io/badge/JS-%3E%3D%20ES2015-blue)
![supported Javascript versions](https://img.shields.io/badge/Node.js-%3E%3D%2016-blue)
[![license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![supported languages](https://img.shields.io/badge/supported%20languages-60-brightgreen.svg)](#languages)
	
</div>

Efficient language detector (*Nito-ELD* or *ELD*) is a fast and accurate language detector, is one of the fastest non compiled detectors, while its accuracy is within the range of the heaviest and slowest detectors.

It's 100% JavaScript (vanilla), easy installation and no dependencies.  
ELD is also available in [Python](https://github.com/nitotm/efficient-language-detector-py) and [PHP](https://github.com/nitotm/efficient-language-detector).

1. [Install](#install)
2. [How to use](#how-to-use)
3. [Builds](#builds)
4. [Benchmarks](#benchmarks)
5. [Languages](#languages)

> **Changes from v1 to v2**  
> 
> You can now import static eld with a specific database size:  
> `import { eld } from 'eld/large';`  
> 
> For dynamic import, you have to load a database to initialize:  
> `import { eld } from 'eld';`  
> `await eld.load('large')`
>
> - ELD is now 1.5x faster, and more accurate.
> - TypeScript type definitions exported.
> - **npm** install size reduced by a 70%.
> 
> More clear function names (old available, but deprecated)
> - `dynamicLangSubset()` is now called `setLanguageSubset()`
> - `cleanText()` is now called `enableTextCleanup()`
> - `loadNgrams()` is now called `load()`

## Install

- For *Node.js*
```bash
$ npm install eld
```
- For Web, just download or clone the files  
`git clone https://github.com/nitotm/efficient-language-detector-js`

## How to use?

### Import *static* ELD
Importing a static, fixed size eld database. Options: `'eld/large'`, `'eld/medium'`, `'eld/small'`, `'eld/extrasmall'`
- At Node.js
```javascript
import { eld } from 'eld/large' // use .mjs extension for version <18
```
- At Node.js REPL
```javascript
const { eld } = await import('eld/large')
```
- At the Web Browser

```html
<script type="module" charset="utf-8">
    import { eld } from './src/entries/static.large.js' // Update path.
    // './src/entries/dynamic.js' for dynamic eld
</script>
```
- To load a pre-built minified version *(iife)*, it is not a module. Included at /minified (GitHub)
```html
<script src="minified/eld.xs.min.js" charset="utf-8"></script>
```
### Import ELD *(dynamic)*
If we use dynamic `'eld'`, we need to `load()` a database to initialize.   
Available sizes: `'large'`, `'medium'`, `'small'` & `'extrasmall'`
- Node.js example (Works also with all options displayed at *static* import)
```javascript
import { eld } from 'eld' // use .mjs extension for version <18
await eld.load('large') // Not available for static eld with preloaded database
```
### Usage

`detect()` expects a UTF-8 string, and returns an object, with a `language` variable, with a ISO 639-1 code or empty string
```javascript
console.log( eld.detect('Hola, cómo te llamas?') )
// { language: 'es', getScores(): {'es': 0.5, 'et': 0.2}, isReliable(): true }
// returns { language: string, getScores(): Object, isReliable(): boolean } 

console.log( eld.detect('Hola, cómo te llamas?').language )
// 'es'
```
 - To reduce the languages to be detected, there are 2 options, they only need to be executed once. (Check available [languages](#languages) below)
```javascript
let languagesSubset = ['en', 'es', 'fr', 'it', 'nl', 'de']

// Option 1 
// Setting setLanguageSubset(), detect() executes normally but finally filters the excluded languages
eld.setLanguageSubset(languagesSubset) // Returns an Object with the subset validated languages
// to remove the subset
eld.setLanguageSubset(false)

// Option 2 ( NOT available for static eld, with preloaded DB size )
// The optimal way to regularly use the same subset, is using saveSubset() to download a new database
eld.saveSubset(languagesSubset) // ONLY for the Web Browser
// We can load any Ngrams database saved at src/ngrams/, including subsets. Returns true if success
await eld.load('medium')
// eld.load('file').then((loaded) => { if (loaded) { } })
```
- Also, we can get the current status of eld: languages, database type and subset
```javascript
  console.log( eld.info() )
```

## Builds

Build and minify static size example, with esbuild + terser. With npm package installed:  
`npx esbuild --bundle --format=esm eld/large --outfile=eld.large.js`  
`terser eld.large.js --compress --mangle --output eld.large.min.js`  
Using folder path:  
`npx esbuild --bundle --format=esm src/entries/static.large.js > eld.large.js`    
  
For non-module iife browser scripts:  
`npx esbuild --bundle --format=iife --global-name=__eld_module src/entries/static.extrasmall.js > eld.xs.js --footer:js="globalThis.eld = __eld_module.default;"`

For a client side solution, I included at \/minified (*GitHub*) an iife bundle file size XS, which still performs great for sentences.  
The XS version weights 940kb, when gzipped it's only 264kb.

## Benchmarks

I compared *ELD* with a different variety of detectors.

| URL                                                       | Version       | Language     |
|:----------------------------------------------------------|:--------------|:-------------|
| https://github.com/nitotm/efficient-language-detector-js/ | 2.0.0         | Javascript   |
| https://github.com/nitotm/efficient-language-detector/    | 1.0.0         | PHP          |
| https://github.com/pemistahl/lingua-py                    | 1.3.2         | Python       |
| https://github.com/CLD2Owners/cld2                        | Aug 21, 2015  | C++          |
| https://github.com/google/cld3                            | Aug 28, 2020  | C++          |
| https://github.com/wooorm/franc                           | 6.1.0         | Javascript   |

<sup>Benchmarks: **Tweets**: *760KB*, short sentences of 140 chars max.; **Big test**: *10MB*, sentences in all 60 languages supported; **Sentences**: *8MB*, this is the *Lingua* sentences test, minus unsupported languages.  
Short sentences is what *ELD* and most detectors focus on, as very short text is unreliable, but I included the *Lingua* **Word pairs** *1.5MB*, and **Single words** *880KB* tests to see how they all compare beyond their reliable limits.</sup>

These are the results, first, accuracy and then execution time.

<!-- Accuracy table
|                     | Tweets       | Big test     | Sentences    | Word pairs   | Single words |
|:--------------------|:------------:|:------------:|:------------:|:------------:|:------------:|
| **Nito-ELD-XS**     | 99.3%        | 99.5%        | 98.7%        | 84.9%        | 67.1%        |
| **Nito-ELD-M**      | 99.4%        | 99.6%        | 99.1%        | 88.4%        | 73.8%        |
| **Nito-ELD-L**      | 99.7%        | 99.7%        | 99.2%        | 90.4%        | 76.9%        |
| **Lingua**          | 98.8%        | 99.1%        | 98.6%        | 93.1%        | 80.0%        |
| **CLD2**            | 93.8%        | 97.2%        | 97.2%        | 87.7%        | 69.6%        |
| **Lingua low**      | 96.0%        | 97.2%        | 96.3%        | 83.7%        | 68.0%        |
| **CLD3**            | 92.2%        | 95.8%        | 94.7%        | 69.0%        | 51.5%        |
| **franc**           | 89.8%        | 92.0%        | 90.5%        | 65.9%        | 52.9%        |
-->
<img alt="accuracy table" width="800" src="https://raw.githubusercontent.com/nitotm/efficient-language-detector-js/main/misc/table_accuracy_js_v2.svg">

<!--- Time table
|                     | Tweets       | Big test     | Sentences    | Word pairs   | Single words |
|:--------------------|:------------:|:------------:|:------------:|:------------:|:------------:|
| **Nito-ELD-XS**     |     0.38"    |      3.3"    |      2.7"    |     0.67"    |     0.51"    |
| **Nito-ELD-M**      |     0.38"    |      3.4"    |      2.9"    |     0.73"    |     0.57"    |
| **Nito-ELD-L**      |     0.40"    |      3.6"    |      3.0"    |     0.73"    |     0.61"    |
| **Lingua**          |  4790"       |  24000"      |  18700"      |  8450"       |  6700"       |
| **CLD2**            |     0.35"    |      2"      |      1.7"    |     0.98"    |     0.8"     |
| **Lingua low**      |    64"       |    370"      |    308"      |   108"       |    85"       |
| **CLD3**            |     3.9"     |     29"      |     26"      |    12"       |    11"       |
| **franc**           |     1.2"     |      8"      |      7.8"    |     2.8"     |     2"       |
| **Nito-ELD-php**    |     0.31"    |      2.5"    |      2.2"    |     0.66"    |     0.48"    |
-->
<img alt="time table" width="800" src="https://raw.githubusercontent.com/nitotm/efficient-language-detector-js/main/misc/table_time_js_v2.svg">

<sup style="color:#08e">1.</sup> <sup style="color:#777">Lingua could have a small advantage as it participates with 54 languages, 6 less.</sup>  
<sup style="color:#08e">2.</sup> <sup style="color:#777">CLD2 and CLD3, return a list of languages, the ones not included in this test where discarded, but usually they return one language, I believe they have a disadvantage. 
Also, I confirm the results of CLD2 for short text are correct, contrary to the test on the *Lingua* page, they did not use the parameter "bestEffort = True", their benchmark for CLD2 is unfair.  
  
The RAM memory usage for each DB size is XS: *37MB*, S: *54MB*, M: *71MB*, L: *138MB*.

## Languages

These are the *ISO 639-1 codes* of the 60 supported languages for *Nito-ELD*

> 'am', 'ar', 'az', 'be', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'eu', 'fa', 'fi', 'fr', 'gu', 'he', 'hi', 'hr', 'hu', 'hy', 'is', 'it', 'ja', 'ka', 'kn', 'ko', 'ku', 'lo', 'lt', 'lv', 'ml', 'mr', 'ms', 'nl', 'no', 'or', 'pa', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sq', 'sr', 'sv', 'ta', 'te', 'th', 'tl', 'tr', 'uk', 'ur', 'vi', 'yo', 'zh'


Full name languages:

> Amharic, Arabic, Azerbaijani (Latin), Belarusian, Bulgarian, Bengali, Catalan, Czech, Danish, German, Greek, English, Spanish, Estonian, Basque, Persian, Finnish, French, Gujarati, Hebrew, Hindi, Croatian, Hungarian, Armenian, Icelandic, Italian, Japanese, Georgian, Kannada, Korean, Kurdish (Arabic), Lao, Lithuanian, Latvian, Malayalam, Marathi, Malay (Latin), Dutch, Norwegian, Oriya, Punjabi, Polish, Portuguese, Romanian, Russian, Slovak, Slovene, Albanian, Serbian (Cyrillic), Swedish, Tamil, Telugu, Thai, Tagalog, Turkish, Ukrainian, Urdu, Vietnamese, Yoruba, Chinese

**Donate / Hire**   
If you wish to Donate for open source improvements, Hire me for private modifications / upgrades, or to Contact me, use the following link: https://linktr.ee/nitotm