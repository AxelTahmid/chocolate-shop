'use strict'

const logger = require('./utils/logger')
const filesystem = require('./utils/filesystem')

function processOrdersCSV(
    input = 'orders.csv',
    output = 'redemptions.csv',
    promotionRules
) {
    return new Promise((resolve, reject) => {
        logger.info('Parse Orders from =>', input)

        const lineStream = filesystem.readFileByLineStream(input)
        const fileOutputStream = filesystem.writeFileStream(output)

        let header = null

        // Initialize the count of chocolates based on the promotion rules
        const chocolates = getChocolatesCount()

        lineStream.on('line', line => {
            if (!header) {
                header = line.split(',').map(item => item.trim())
            } else {
                const order = line.split(',').map(item => item.trim())
                if (order.length !== header.length) {
                    lineStream.error('Invalid CSV format')
                }

                const chocolateCount = getOrderTotal(order, promotionRules, {
                    ...chocolates,
                })

                fileOutputStream.write(getOutputString(chocolateCount))
            }
        })

        lineStream.on('close', () => {
            logger.info(`Order parsed`)
            fileOutputStream.close()
            resolve()
        })

        lineStream.on('error', err => {
            fileOutputStream.close()
            reject(new Error(err))
        })
    })
}

function getOrderTotal(orderArray, promotionRules, chocolates) {
    const cash = parseInt(orderArray[0])
    const price = parseInt(orderArray[1])
    const wrappersNeeded = parseInt(orderArray[2])
    const type = orderArray[3].replace(/['"]+/g, '')

    // Calculate the number of chocolates the shopper can buy
    const numChocolates = Math.floor(cash / price)

    // Update the count of chocolates for the purchased type
    chocolates[type] += numChocolates

    // Get complimentary chocolate array based on order type
    const availableComplimentary = promotionRules[type]

    let remainingWrappers = chocolates[type]
    let numPromoChocolates = Math.floor(remainingWrappers / wrappersNeeded)

    while (numPromoChocolates > 0) {
        availableComplimentary.forEach(element => {
            chocolates[element] += numPromoChocolates
        })

        const wrappersExchanged = numPromoChocolates * wrappersNeeded
        remainingWrappers =
            remainingWrappers - wrappersExchanged + numPromoChocolates
        numPromoChocolates = Math.floor(remainingWrappers / wrappersNeeded)
    }

    return chocolates
}

// Initialize the count of chocolates based on the promotion rules
function getChocolatesCount(promotionRules) {
    const chocolates = {}
    Object.keys(promotionRules).forEach(key => (chocolates[key] = 0))
    return chocolates
}

function getOutputString(data) {
    const formatOutput = Object.entries(data)
        .map(([chocolateType, count]) => `${chocolateType} ${count}`)
        .join(', ')

    return `${formatOutput}\n`
}

module.exports = {
    getOrderTotal,
    getChocolatesCount,
    getOutputString,
    processOrdersCSV,
}
