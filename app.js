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
        const chocolates = getChocolatesCount(promotionRules)

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

        fileOutputStream.on('error', e => lineStream.error(e))

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
    chocolates[type].count += numChocolates
    chocolates[type].wrapperCount += numChocolates

    // not using 'type'. initializing current available promo type from wrapperCount
    let currentComplimentaryType = getAvailablePromo(chocolates, wrappersNeeded)

    // get chocolates that will increment
    let availableComplimentary = promotionRules[currentComplimentaryType]

    while (currentComplimentaryType !== null) {
        // current promo chocolates
        const numPromoChocolates = Math.floor(
            chocolates[currentComplimentaryType].wrapperCount / wrappersNeeded
        )

        // deduct wrappers that will be used to redeem new chocolates
        chocolates[currentComplimentaryType].wrapperCount -=
            numPromoChocolates * wrappersNeeded

        // increase wrappers for each redeemed chocolate
        availableComplimentary.forEach(element => {
            chocolates[element].count += numPromoChocolates
            chocolates[element].wrapperCount += numPromoChocolates
        })

        if (numPromoChocolates === 0) {
            currentComplimentaryType = getAvailablePromo(
                chocolates,
                wrappersNeeded
            )
            availableComplimentary = promotionRules[currentComplimentaryType]
        }
    }

    return chocolates
}

function getAvailablePromo(chocolates, wrapperNeeded) {
    for (const type in chocolates) {
        if (chocolates[type].wrapperCount >= wrapperNeeded) {
            return type
        }
    }
    return null
}

// Initialize the count of chocolates based on the promotion rules
function getChocolatesCount(promotionRules) {
    const chocolates = {}
    Object.keys(promotionRules).forEach(key => {
        chocolates[key] = {
            count: 0,
            wrapperCount: 0,
        }
    })
    return chocolates
}

function getOutputString(data) {
    const formatOutput = Object.entries(data)
        .map(([type, obj]) => `${type} ${obj.count}`)
        .join(', ')

    return `${formatOutput}\n`
}

module.exports = {
    getOrderTotal,
    getChocolatesCount,
    getOutputString,
    processOrdersCSV,
}
