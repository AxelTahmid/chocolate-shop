const assert = require('assert')
const logger = require('../utils/logger')
const { getOrderTotal } = require('../app')

// Test that the function getOrderTotal returns the correct number of chocolates given a specific order and promotion rules.
function testGetOrderTotal() {
    logger.test('function getOrderTotal test started ==>')
    const promotionRules = {
        milk: ['milk', 'sugar free'],
        white: ['white', 'sugar free'],
        dark: ['dark'],
        'sugar free': ['sugar free', 'dark'],
    }

    let chocolate = {
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
    }

    const order1 = [14, 2, 6, 'milk']
    const chocolateCount1 = getOrderTotal(
        order1,
        promotionRules,
        JSON.parse(JSON.stringify(chocolate))
    )
    assert.deepStrictEqual(chocolateCount1, {
        milk: { count: 8, wrapperCount: 2 },
        dark: { count: 0, wrapperCount: 0 },
        white: { count: 0, wrapperCount: 0 },
        'sugar free': { count: 1, wrapperCount: 1 },
    })

    logger.test('PASS ==>', 'CASE#1 redeemable')

    const order2 = [12, 2, 5, 'milk']
    const chocolateCount2 = getOrderTotal(
        order2,
        promotionRules,
        JSON.parse(JSON.stringify(chocolate))
    )
    assert.deepStrictEqual(chocolateCount2, {
        milk: { count: 7, wrapperCount: 2 },
        dark: { count: 0, wrapperCount: 0 },
        white: { count: 0, wrapperCount: 0 },
        'sugar free': { count: 1, wrapperCount: 1 },
    })

    logger.test('PASS ==>', 'CASE#2 one iteration redeem')

    const order3 = [12, 4, 4, 'dark']
    const chocolateCount3 = getOrderTotal(
        order3,
        promotionRules,
        JSON.parse(JSON.stringify(chocolate))
    )

    assert.deepStrictEqual(chocolateCount3, {
        milk: { count: 0, wrapperCount: 0 },
        dark: { count: 3, wrapperCount: 3 },
        white: { count: 0, wrapperCount: 0 },
        'sugar free': { count: 0, wrapperCount: 0 },
    })

    logger.test('PASS ==>', 'CASE#3 not enough wrapper to redeem')

    const order4 = [6, 2, 2, 'sugar free']
    const chocolateCount4 = getOrderTotal(
        order4,
        promotionRules,
        JSON.parse(JSON.stringify(chocolate))
    )

    assert.deepStrictEqual(chocolateCount4, {
        milk: { count: 0, wrapperCount: 0 },
        dark: { count: 3, wrapperCount: 1 },
        white: { count: 0, wrapperCount: 0 },
        'sugar free': { count: 5, wrapperCount: 1 },
    })

    logger.test('PASS ==>', 'CASE#4 cumulative wrapper redeem')

    const order5 = [6, 2, 2, 'white']
    const chocolateCount5 = getOrderTotal(
        order5,
        promotionRules,
        JSON.parse(JSON.stringify(chocolate))
    )

    assert.deepStrictEqual(chocolateCount5, {
        milk: { count: 0, wrapperCount: 0 },
        dark: { count: 1, wrapperCount: 1 },
        white: { count: 5, wrapperCount: 1 },
        'sugar free': { count: 3, wrapperCount: 1 },
    })

    logger.test('PASS ==>', 'CASE#5 cumulative wrapper redeem')

    logger.test(
        'SUCCESS ==>',
        'function getOrderTotal returns the correct number of chocolates given a specific order and promotion rules.'
    )
}

module.exports = testGetOrderTotal
