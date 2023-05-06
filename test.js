const assert = require('node:assert')
const { readFileSync } = require('fs')
const {
    processOrders,
    parseOrdersFile,
    writeRedemptionsToFile,
} = require('./main')

function runTests() {
    testProcessOrders()
    testParseOrdersFile()
    testWriteRedemptionsToFile()
}

function testProcessOrders() {
    const orders = [
        { cash: 14, price: 2, wrappersNeeded: 6, type: 'milk' },
        { cash: 12, price: 2, wrappersNeeded: 5, type: 'milk' },
        { cash: 12, price: 4, wrappersNeeded: 4, type: 'dark' },
        { cash: 6, price: 2, wrappersNeeded: 2, type: 'sugar free' },
        { cash: 6, price: 2, wrappersNeeded: 2, type: 'white' },
    ]

    const expectedResults = [
        { milk: 8, dark: 0, white: 0, 'sugar free': 1 },
        { milk: 7, dark: 0, white: 0, 'sugar free': 1 },
        { milk: 0, dark: 3, white: 0, 'sugar free': 0 },
        { milk: 0, dark: 3, white: 0, 'sugar free': 5 },
        { milk: 0, dark: 1, white: 5, 'sugar free': 3 },
    ]

    const actualResults = processOrders(orders)

    for (let i = 0; i < expectedResults.length; i++) {
        assert.deepStrictEqual(actualResults[i], expectedResults[i])
    }

    console.log('Process Orders tests passed')
}

function testParseOrdersFile() {
    const filePath = 'input/orders.csv'
    const expectedOrders = [
        { cash: 14, price: 2, wrappersNeeded: 6, type: 'milk' },
        { cash: 12, price: 2, wrappersNeeded: 5, type: 'milk' },
        { cash: 12, price: 4, wrappersNeeded: 4, type: 'dark' },
        { cash: 6, price: 2, wrappersNeeded: 2, type: 'sugar free' },
        { cash: 6, price: 2, wrappersNeeded: 2, type: 'white' },
    ]

    const actualOrders = parseOrdersFile(filePath)

    assert.deepStrictEqual(actualOrders, expectedOrders)

    console.log('Parse Orders File test passed')
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

    console.log('Write Redemptions to File test passed')
}

runTests()
