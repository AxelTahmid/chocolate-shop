'use strict'

const logger = require('./utils/logger')
const { processOrdersCSV } = require('./app')

async function start() {
    try {
        const promotionRules = {
            milk: ['milk', 'sugar free'],
            dark: ['dark'],
            white: ['white', 'sugar free'],
            'sugar free': ['sugar free', 'dark'],
        }

        await processOrdersCSV('orders.csv', 'redemptions.csv', promotionRules)
    } catch (error) {
        logger.error(error)
        throw Error(error)
    }
}

start()
