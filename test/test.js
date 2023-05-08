'use strict'

const assert = require('assert')
const { getOrderTotal, getChocolatesCount, getOutputString } = require('../app')

// Test case for getOrderTotal function
assert.deepStrictEqual(
    getOrderTotal(
        [100, 10, 3, 'milk'],
        { milk: ['milk'], dark: ['dark'] },
        {
            milk: 0,
            dark: 0,
        }
    ),
    { milk: 13, dark: 0 }
)

// Test case for getChocolatesCount function
assert.deepStrictEqual(getChocolatesCount({ milk: ['milk'], dark: ['dark'] }), {
    milk: 0,
    dark: 0,
})

// Test case for getOutputString function
assert.strictEqual(getOutputString({ milk: 10, dark: 5 }), 'milk 10, dark 5\n')

// Unit tests for getOrderTotal function
function testProcessOrders() {
    const promotionRules = {
        milk: ['milk', 'sugar free'],
        white: ['white', 'sugar free'],
        dark: ['dark'],
        'sugar free': ['sugar free', 'dark'],
    }

    // Test case 1
    const result1 = getOrderTotal([200, 15, 4, 'white'], promotionRules, {
        milk: 0,
        white: 0,
        dark: 0,
        'sugar free': 0,
    })
    assert.deepStrictEqual(result1, {
        milk: 0,
        white: 16,
        dark: 0,
        'sugar free': 3,
    })

    // Test case 2
    const result2 = getOrderTotal([150, 20, 5, 'dark'], promotionRules, {
        milk: 10,
        white: 5,
        dark: 3,
        'sugar free': 2,
    })
    assert.deepStrictEqual(result2, {
        milk: 10,
        white: 5,
        dark: 6,
        'sugar free': 2,
    })

    // Test case 3
    const result3 = getOrderTotal([100, 8, 2, 'milk'], promotionRules, {
        milk: 5,
        white: 0,
        dark: 0,
        'sugar free': 0,
    })
    assert.deepStrictEqual(result3, {
        milk: 17,
        white: 0,
        dark: 0,
        'sugar free': 0,
    })

    console.log('Process Orders unit tests passed!')
}

// Run the unit tests
testProcessOrders()

// Print success message
console.log('All tests passed!')
