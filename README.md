# Efficient Language Detector, Refactored

Refactored version of [Nito-ELD](https://www.npmjs.com/package/eld) which
exports type definitions and avoids toplevel await() for easier bundling.

## Install

- For _Node.js_

```bash
$ npm install eldr
```

## Usage

```ts
import { eldr } from "eldr";
/* or, to save bandwidth and memory usage:
import { eldr } from "eldr/lib/extra-small"
import { eldr } from "eldr/lib/small"
import { eldr } from "eldr/lib/medium" // default
import { eldr } from "eldr/lib/large"
*/

const detected = eldr.detect("Hola, cómo te llamas?");
console.log(
  detected.isReliable(),
  detected.iso639_1,
  detected.languageName,
  detected.getScores()
);
```

Output:

```
true es Spanish {
  es: 0.5289772727272727,
  et: 0.20935132575757573,
  ro: 0.20913825757575755,
  lv: 0.20886600378787873,
  nl: 0.11145833333333333,
  sq: 0.10797821969696969,
  lt: 0.10658143939393938,
  hr: 0.1064867424242424,
  pl: 0.1047466856060606,
  ca: 0.10466382575757575,
  sl: 0.10466382575757575,
  pt: 0.10445075757575756,
  yo: 0.1044152462121212
}
```

## Languages

These are the _ISO 639-1 codes_ of the 60 supported languages for _Nito-ELD_ v1

> 'am', 'ar', 'az', 'be', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'eu', 'fa', 'fi', 'fr', 'gu', 'he', 'hi', 'hr', 'hu', 'hy', 'is', 'it', 'ja', 'ka', 'kn', 'ko', 'ku', 'lo', 'lt', 'lv', 'ml', 'mr', 'ms', 'nl', 'no', 'or', 'pa', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sq', 'sr', 'sv', 'ta', 'te', 'th', 'tl', 'tr', 'uk', 'ur', 'vi', 'yo', 'zh'

Full name languages:

> Amharic, Arabic, Azerbaijani (Latin), Belarusian, Bulgarian, Bengali, Catalan, Czech, Danish, German, Greek, English, Spanish, Estonian, Basque, Persian, Finnish, French, Gujarati, Hebrew, Hindi, Croatian, Hungarian, Armenian, Icelandic, Italian, Japanese, Georgian, Kannada, Korean, Kurdish (Arabic), Lao, Lithuanian, Latvian, Malayalam, Marathi, Malay (Latin), Dutch, Norwegian, Oriya, Punjabi, Polish, Portuguese, Romanian, Russian, Slovak, Slovene, Albanian, Serbian (Cyrillic), Swedish, Tamil, Telugu, Thai, Tagalog, Turkish, Ukrainian, Urdu, Vietnamese, Yoruba, Chinese
