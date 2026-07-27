import { eld } from '../src/entries/dynamic.js'
import { eld as eldLarge } from '../src/entries/static.large.js'
import { eld as eldSmall } from '../src/entries/static.small.js'
import runTests from './testRunner.js'

await eld.load('medium');

// Prepared here (top-level await) rather than inside a test func, since runTests() below calls
// each func() synchronously and does not await it.
const eldOtherSize = eld.newInstance()
await eldOtherSize.load('small')

let txtFile = (typeof window !== 'undefined'
    ? '..'
    : 'https://github.com/nitotm/efficient-language-detector-js/raw/main') + '/benchmarks/big-test.txt' // Node or Web
const bigTest = await fetch(txtFile).then(response => response.text())

// Mostly functional testing, when functions are more mature I will add some more unit tests
const testCases = [

    {
        name: 'Load ELD', assert: '===', compare: 'object', func: function () {
            return typeof eld
        },
    },

    {
        name: 'Language detection', assert: '===', compare: 'es', func: function () {
            return eld.detect('Hola, cómo te llamas?').language
        },
    },

    {
        name: 'Get scores', assert: '>', compare: 1, func: function () {
            let scores = eld.detect('Hola, cómo te llamas?').getScores()
            return Object.keys(scores).length
        },
    },

    {
        name: 'Detect, small text', assert: '===', compare: 'en', func: function () {
            return eld.detect('To').language
        },
    }, 
	 /* Currently getCleanTxt() is not public
	 { name: 'Clean Text', assert: '===', compare: '', func: function() {
			 let text = "https://www.google.com/\n"+
			  "mail@gmail.com\n"+
			  "google.com/search?q=search&source=hp\n"+ // this line fails, to be fixed
			  "12345 A12345\n";
		  return eld.getCleanTxt(text).trim();
		  } 
	  },
	 */
    {
        name: 'Check minimum confidence', assert: '===', compare: false, func: function () {
            return eld.detect('zxz zcz zvz zbz znz zmz zlz zsz zdz zkz zjz pelo').isReliable()
        },
    },

    // Regression test for a fixed ReDoS in matchDomains (src/regexPatterns.js)
    {
        name: 'enableTextCleanup does not hang on adversarial input (ReDoS regression)', assert: '===', compare: 'string', func: function () {
            eld.enableTextCleanup(true)
            const adversarial = 'a'.repeat(500) + '! and then some ordinary text after it'
            const result = typeof eld.detect(adversarial).language
            eld.enableTextCleanup(false)
            return result
        },
    },

    {
        name: 'detect() warns (not throws) and returns an empty result for non-string input', assert: '===', compare: '|1', func: function () {
            const original = console.warn
            let warnCount = 0
            console.warn = function () { warnCount++ }
            const first = eld.detect(123).language
            eld.detect(456) // second call - should NOT warn again (once per instance)
            eld.detect(undefined)
            console.warn = original
            return first + '|' + warnCount
        },
    },

    {
        name: 'Create setLanguageSubset, detect', assert: '===', compare: '["en"]', func: function () {
            eld.setLanguageSubset(['en'])
            let scores = JSON.stringify(Object.keys(eld.detect('How are you? Bien, gracias').getScores()))
            eld.setLanguageSubset(false)
            return scores
        },
    },

    {
        name: 'Disable setLanguageSubset, detect', assert: '>', compare: 1, func: function () {
            eld.setLanguageSubset(['en'])
            eld.setLanguageSubset(false)
            let scores = eld.detect('How are you? Bien, gracias').getScores()
            return Object.keys(scores).length
        },
    },

    {
        name: 'Accuracy test: medium.js + big-test.txt', assert: '>', compare: 99.6, func: function () {
            let correct = 0
            let fails = 0
            const lines = bigTest.split('\n')
            lines.forEach(function (line) {
                if (!line) return // trailing blank line at EOF, not a real test case
                let parts = line.split('\t')
                if (eld.detect(parts[1]).language === parts[0]) {
                    correct++
                } else {
                    fails++
                }
            })

            if (correct + fails < 60000) {
                throw 'Could not load big-test.txt correctly. Not an ELD error.'
            }

            return (correct / (correct + fails)) * 100
        },
    },

    // --- Instance isolation tests -------------------------------------------------------------
    // runTests() below calls each func() synchronously (it doesn't await it), so any async setup
    // needed for these checks is done here, up front, with top-level await - the test funcs
    // themselves only do synchronous assertions.

    {
        name: 'Static imports keep their own database size', assert: '===', compare: '["L60","S60"]', func: function () {
            return JSON.stringify([eldLarge.info()['Data type'], eldSmall.info()['Data type']])
        },
    },

    {
        name: 'Dynamic load() does not affect static imports', assert: '===', compare: '["L60","S60","M60"]', func: function () {
            // eld (dynamic) is loaded as 'medium'; static 'large'/'small' must stay unaffected
            return JSON.stringify([eldLarge.info()['Data type'], eldSmall.info()['Data type'], eld.info()['Data type']])
        },
    },

    {
        name: 'setLanguageSubset does not leak across instances', assert: '===', compare: '["en"]|false|false', func: function () {
            eldLarge.setLanguageSubset(['en'])
            const result = [
                JSON.stringify(Object.values(eldLarge.info()['Subset'])),
                eldSmall.info()['Subset'],
                eld.info()['Subset'],
            ].join('|')
            eldLarge.setLanguageSubset(false) // reset for any later test relying on eldLarge
            return result
        },
    },

    {
        name: 'newInstance() (static) is independent of the instance it was created from', assert: '===', compare: 'false|["fr"]|false', func: function () {
            const clone = eldLarge.newInstance()
            const cloneStartsClean = clone.info()['Subset']
            clone.setLanguageSubset(['fr'])
            const result = [
                cloneStartsClean,
                JSON.stringify(Object.values(clone.info()['Subset'])),
                eldLarge.info()['Subset'], // must still be false, unaffected by clone
            ].join('|')
            return result
        },
    },

    {
        name: 'newInstance() (dynamic) can load a different size independently', assert: '===', compare: 'S60|M60', func: function () {
            return [eldOtherSize.info()['Data type'], eld.info()['Data type']].join('|')
        },
    }]

runTests(testCases);