const assert = require('assert')
const logger = require('../utils/logger')

const { getChocolatesCount, getOutputString } = require('../app')

const testGetOrderTotal = require('./orderTests')
const processOrders = require('./processTests')

runTest()

async function runTest() {
    try {
        testGetChocolatesCount()
        testGetOutputString()
        testGetOrderTotal()
        await processOrders.testCSVEmptyInputFile()
        await processOrders.testCSVHeadersOnly()
        await processOrders.testCSVSingleOrder()
        await processOrders.testCSVMultipleOrders()
    } catch (error) {
        console.error(error)
    }
}

// Test that the function getChocolatesCount initializes the chocolate count correctly based on the promotion rules.
function testGetChocolatesCount() {
    const promotionRules = {
        milk: ['milk', 'sugar free'],
        white: ['white', 'sugar free'],
        dark: ['dark'],
        'sugar free': ['sugar free', 'dark'],
    }

    const chocolateCount = getChocolatesCount(promotionRules)
    assert.deepStrictEqual(chocolateCount, {
        milk: {
            count: 0,
            wrapperCount: 0,
        },
        dark: {
            count: 0,
            wrapperCount: 0,
        },
        white: {
            count: 0,
            wrapperCount: 0,
        },
        'sugar free': {
            count: 0,
            wrapperCount: 0,
        },
    })

    logger.test(
        'SUCCESS ==>',
        'function getChocolatesCount initializes the chocolate count correctly based on the promotion rules.'
    )
}

// Test that the function getOutputString returns the correct output string given a chocolate count object.
function testGetOutputString() {
    const chocolateCount = {
        milk: {
            count: 12,
            wrapperCount: 0,
        },
        dark: {
            count: 6,
            wrapperCount: 0,
        },
        white: {
            count: 3,
            wrapperCount: 0,
        },
        'sugar free': {
            count: 0,
            wrapperCount: 0,
        },
    }

    const outputString = getOutputString(chocolateCount)
    assert.strictEqual(outputString, 'milk 12, dark 6, white 3, sugar free 0\n')

    logger.test(
        'SUCCESS ==>',
        'function getOutputString returns the correct output string given a chocolate count object.'
    )
}
