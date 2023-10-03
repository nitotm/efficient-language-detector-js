### Process used to create minified version

- Disable saveLanguageSubset.dev.js `import` at languageDetector.js
- Remove function/export of `saveSubset()` at languageDetector.js
- Remove public scope of `loadNgrams()`, from `const eld` at languageDetector.js (Optional)
- Remove `loadNgrams('ngramsM60.js')` at languageDetector.js
- Enable `import { ngramsData }` at languageData.js
- Enable setNgrams(ngramsData) at languageData.js
- Change `export { eld }` to `export { eld as default }` at languageDetector.js
- Bundle code with Rollup: `> rollup languageDetector.js --file bundle.js --format umd --name eld`
- Minify code with Terser: `> terser bundle.js --compress --mangle --output eld.min.js`

TODO, It would be a good idea to automate the process.