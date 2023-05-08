'use strict'

const logger = require('./utils/logger')
const { processOrdersCSV } = require('./app')

async function start() {
    try {
        const promotionRules = {
            milk: ['milk', 'sugar free'],
            white: ['white', 'sugar free'],
            dark: ['dark'],
            'sugar free': ['sugar free', 'dark'],
        }

        await processOrdersCSV('orders.csv', 'redemptions.csv', promotionRules)
    } catch (error) {
        logger.error(error)
        throw Error(error)
    }
}

start()
