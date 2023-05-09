const assert = require('assert')
const logger = require('../utils/logger')

const {
    readTestFile,
    createTestFile,
    deleteTestFile,
} = require('../utils/filesystem')

const { processOrdersCSV } = require('../app')

// Test that processOrdersCSV correctly handles an empty input CSV file.
async function testCSVEmptyInputFile() {
    const input = 'empty-input.csv'
    const output = 'test-output.csv'
    const promotionRules = { milk: ['milk'], dark: ['dark'] }

    // Create an empty test input file
    createTestFile(input, '')

    await processOrdersCSV(input, output, promotionRules)

    // Verify that the output file is empty
    const outputContent = readTestFile(output)
    assert.strictEqual(outputContent, '')

    // Clean up the test files
    deleteTestFile(input, 'input')
    deleteTestFile(output, 'output')

    logger.test(
        'SUCCESS ==>',
        'processOrdersCSV correctly handles an empty input CSV file.'
    )
}

// Test that processOrdersCSV correctly handles an input CSV file with only headers.
async function testCSVHeadersOnly() {
    const input = 'headers-only.csv'
    const output = 'test-output.csv'
    const promotionRules = { milk: ['milk'], dark: ['dark'] }

    // Create a test input file with only headers
    createTestFile(input, 'Cash, Price, Wrappers Needed, Type')

    await processOrdersCSV(input, output, promotionRules)

    // Verify that the output file is empty
    const outputContent = readTestFile(output)

    assert.strictEqual(outputContent, '')

    // Clean up the test files
    deleteTestFile(input, 'input')
    deleteTestFile(output, 'output')

    logger.test(
        'SUCCESS ==>',
        'processOrdersCSV correctly handles an input CSV file with only headers.'
    )
}

// Test that processOrdersCSV correctly handles an input CSV file with only one order.
async function testCSVSingleOrder() {
    const input = 'single-order.csv'
    const output = 'test-output.csv'
    const promotionRules = {
        milk: ['milk', 'sugar free'],
        dark: ['dark'],
        white: ['white', 'sugar free'],
        'sugar free': ['sugar free', 'dark'],
    }

    // Create a test input file with a single order
    createTestFile(
        input,
        'Cash, Price, Wrappers Needed, Type\n10, 2, 5, "milk"\n'
    )

    await processOrdersCSV(input, output, promotionRules)

    // Verify the output file content
    const outputContent = readTestFile(output)
    assert.strictEqual(outputContent, 'milk 6, dark 0, white 0, sugar free 1\n')

    // Clean up the test files
    deleteTestFile(input, 'input')
    deleteTestFile(output, 'output')

    logger.test(
        'SUCCESS ==>',
        'processOrdersCSV correctly handles an input CSV file with only one order.'
    )
}

// Test that processOrdersCSV correctly handles an input CSV file with multiple orders.
async function testCSVMultipleOrders() {
    const input = 'multiple-orders.csv'
    const output = 'test-output.csv'
    const promotionRules = {
        milk: ['milk', 'sugar free'],
        dark: ['dark'],
        white: ['white', 'sugar free'],
        'sugar free': ['sugar free', 'dark'],
    }

    // Create a test input file with multiple orders
    createTestFile(
        input,
        'Cash, Price, Wrappers Needed, Type\n6, 2, 2, "white"\n14, 2, 6, "milk"\n'
    )

    await processOrdersCSV(input, output, promotionRules)

    // Verify the output file content
    const outputContent = readTestFile(output)
    assert.strictEqual(
        outputContent,
        'milk 0, dark 1, white 5, sugar free 3\nmilk 8, dark 0, white 0, sugar free 1\n'
    )

    // Clean up the test files
    deleteTestFile(input, 'input')
    deleteTestFile(output, 'output')

    logger.test(
        'SUCCESS ==>',
        'processOrdersCSV correctly handles an input CSV file with multiple orders.'
    )
}

module.exports = {
    testCSVEmptyInputFile,
    testCSVHeadersOnly,
    testCSVSingleOrder,
    testCSVMultipleOrders,
}
