import { langDetector } from '../src/languageDetector.js'

let txtFile = (typeof window !== 'undefined'
  ? '..'
  : 'https://github.com/nitotm/efficient-language-detector-js/raw/main') + '/benchmarks/big-test.txt' // Node or Web
const bigTest = await fetch(txtFile).then(response => response.text())

// Mostly functional testing, when functions are more mature I will add some more unit tests
const testCases = [
	
  { name: 'Load ELD', assert: '===', compare: 'object', func: function () {
      return typeof langDetector
    },
  }, 
  
  { name: 'Language detection', assert: '===', compare: 'es', func: function () {
      return langDetector.detect('Hola, cómo te llamas?').language
    },
  }, 
  
  { name: 'Get scores', assert: '>', compare: 1, func: function () {
      langDetector.returnScores = true
      let scores = langDetector.detect('Hola, cómo te llamas?').scores
      langDetector.returnScores = false
      return Object.keys(scores).length
    },
  }, 
  
  { name: 'Detect, no minimum length', assert: '===', compare: 'en', func: function () {
      return langDetector.detect('To',
        { cleanText: false, checkConfidence: false, minByteLength: 0, minNgrams: 1 }).language
    },
  }, 
  
  { name: 'Test minimum length error', assert: '===', compare: false, func: function () {
      return langDetector.detect('To').language
    },
  }, 
  /* Not available for now
  { name: 'Clean Text', assert: '===', compare: '', func: function() {
	    let text = "https://www.google.com/\n"+
        "mail@gmail.com\n"+
        "google.com/search?q=search&source=hp\n"+ // this line fails, to be fixed
        "12345 A12345\n";
	  return langDetector.cleanText(text).trim();
	  } 
  },*/
  
  { name: 'Check minimum confidence', assert: '===', compare: false, func: function () {
      return langDetector.detect('zxz zcz zvz zbz znz zmz zlz zsz zdz zkz zjz pelo',
        { cleanText: false, checkConfidence: true, minByteLength: 0, minNgrams: 1 }).language
    },
  }, 
  
  { name: 'Create dynamicLangSubset, detect', assert: '===', compare: '["en"]', func: function () {
      langDetector.dynamicLangSubset(['en'])
      langDetector.returnScores = true
      return JSON.stringify(Object.keys(langDetector.detect('How are you? Bien, gracias').scores))
    },
  }, 
  
   {name: 'Disable dynamicLangSubset, detect', assert: '>', compare: 1, func: function () {
      langDetector.dynamicLangSubset(['en'])
      langDetector.returnScores = true
      langDetector.dynamicLangSubset(false)
      let scores = langDetector.detect('How are you? Bien, gracias').scores
      return Object.keys(scores).length
    },
  }, 

  { name: 'Accuracy test: ngrams-m.php + big-test.txt', assert: '>', compare: 99.4, func: function () {
      let correct = 0
      let fails = 0
      const lines = bigTest.split('\n')
      lines.forEach(function (line) {
        let parts = line.split('\t')
        if (langDetector.detect(parts[1],
          { cleanText: false, checkConfidence: false, minByteLength: 0, minNgrams: 1 }).language === parts[0]) {
          correct++
        } else {
          fails++
        }
      })

      if (correct + fails < 60000) { throw 'Could not load big-test.txt correctly. Not an ELD error.' }

      return (correct / (correct + fails)) * 100
    },
  }]

runTests(testCases)

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

function runTests (testCases) {
  let totalTests = 0, passedTests = 0, failedTests = 0
  const startTime = Date.now()

  for (const testCase of testCases) {
    totalTests++
    const { name, assert, compare, func } = testCase
    let actual

    try {
      actual = func()
    } catch (error) {
      console.error('ERROR! - ' + name + ': ', error) // error.message
      failedTests++
      continue
    }

    const result = evalOperator(actual, assert, compare) ? 'PASSED' : 'FAILED'

    if (result === 'PASSED') {
      passedTests++
    } else {
      failedTests++
    }
    console.log(result + ' - ' + name +
      (result !== 'PASSED' ? ' (Expected: ' + assert + ' ' + compare + '; Actual: ' + actual + ')' : ''))
  }

  const endTime = Date.now() - startTime
  console.log('\n\r-------- SUMMARY --------')
  console.log(` Total Tests: ${totalTests}`)
  console.log(` Passed Tests: ${passedTests}`)
  console.log(` Failed Tests: ${failedTests}`)
  console.log(` Total Execution Time: ${endTime}ms`)
}

function evalOperator (actual, assert, compare) {

  switch (assert) { // eval is not a good idea
    case '===':
      return actual === compare
    case '>':
      return actual > compare
    case '<':
      return actual < compare
    default:
      console.log('Invalid assert operator for the next test:')
  }
}