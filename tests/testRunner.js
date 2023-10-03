/*
Copyright 2023 Nito T.M.
License https://www.apache.org/licenses/LICENSE-2.0 Apache-2.0
Author Nito T.M. (https://github.com/nitotm)
Package npmjs.com/package/eld
*/

/**
 * @param {Array} testCases
 */
export default function runTests (testCases) {
  let totalTests = 0
  let passedTests = 0
  let failedTests = 0
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

/**
 * @param {string} actual
 * @param {string} assert
 * @param {string} compare
 * @returns {boolean}
 */
function evalOperator (actual, assert, compare) {
  switch (assert // eval() is not a good idea, error prone
    ) {
    case '===':
      return actual === compare
    case '>':
      return actual > compare
    case '<':
      return actual < compare
    default:
      console.log('Invalid assert operator for the next test:')
      return false
  }
}

//}
