const assert = require('node:assert')
const { readFileSync } = require('fs')
const { join } = require('path')
const logger = require('../utils/logger')

const {
    processOrders,
    parseOrdersFile,
    writeRedemptionsToFile,
} = require('../main')

function runTests() {
    // try {
    // testParseOrdersFile()
    testProcessOrders()
    // testWriteRedemptionsToFile()
    // } catch (error) {
    //     logger.error('error =>', error)
    //     throw Error(error)
    // }
}

function testProcessOrders() {
    // Each key relevant to array of complimentary x1
    const promotionRules = {
        milk: ['milk', 'sugar free'],
        white: ['white', 'sugar free'],
        dark: ['dark'],
        'sugar free': ['sugar free', 'dark'],
    }

    const orders = [
        { cash: 14, price: 2, wrappersNeeded: 6, type: 'milk' },
        { cash: 12, price: 2, wrappersNeeded: 5, type: 'milk' },
        { cash: 12, price: 4, wrappersNeeded: 4, type: 'dark' },
        { cash: 6, price: 2, wrappersNeeded: 2, type: 'sugar free' },
        { cash: 6, price: 2, wrappersNeeded: 2, type: 'white' },
    ]

    // based on above promotion rule.
    const expectedResults = [
        { milk: 8, white: 0, dark: 0, 'sugar free': 1 },
        { milk: 7, white: 0, dark: 0, 'sugar free': 1 },
        { milk: 0, white: 0, dark: 3, 'sugar free': 0 },
        { milk: 0, white: 0, dark: 1, 'sugar free': 4 },
        { milk: 0, white: 4, dark: 0, 'sugar free': 1 },
    ]

    const actualResults = processOrders(orders, promotionRules)

    assert.deepStrictEqual(actualResults, expectedResults)

    logger.info('Process Orders tests passed')
}

async function testParseOrdersFile() {
    const filePath = join(__dirname, 'test_input.csv')

    // const fileName = 'test/test_input.csv'
    logger.info('test filePath =>', filePath)

    const expectedOrders = [
        { cash: 26, price: 4, wrappersNeeded: 3, type: 'white' },
        { cash: 2, price: 6, wrappersNeeded: 6, type: 'dark' },
        { cash: 25, price: 3, wrappersNeeded: 9, type: 'white' },
        { cash: 69, price: 8, wrappersNeeded: 6, type: 'milk' },
        { cash: 40, price: 4, wrappersNeeded: 2, type: 'sugar free' },
    ]

    const actualOrders = await parseOrdersFile(filePath)

    // logger.info('test actualOrders =>', JSON.stringify(actualOrders))

    assert.deepStrictEqual(actualOrders, expectedOrders)

    logger.info('Parse Orders File test passed')
}

function testWriteRedemptionsToFile() {
    const filePath = 'output/redemptions.csv'
    const redemptions = [
        { milk: 8, dark: 0, white: 0, 'sugar free': 1 },
        { milk: 7, dark: 0, white: 0, 'sugar free': 1 },
        { milk: 0, dark: 3, white: 0, 'sugar free': 0 },
        { milk: 0, dark: 3, white: 0, 'sugar free': 5 },
        { milk: 0, dark: 1, white: 5, 'sugar free': 3 },
    ]

    writeRedemptionsToFile(filePath, redemptions)

    const fileContent = readFileSync(filePath, 'utf8').trim()
    const expectedContent = `milk 8, dark 0, white 0, sugar free 1
        milk 7, dark 0, white 0, sugar free 1
        milk 0, dark 3, white 0, sugar free 0
        milk 0, dark 3, white 0, sugar free 5
        milk 0, dark 1, white 5, sugar free 3`

    assert.strictEqual(fileContent, expectedContent)

    logger.info('Write Redemptions to File test passed')
}

runTests()
