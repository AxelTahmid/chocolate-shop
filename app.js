'use strict'

const filesystem = require('./utils/filesystem')

function processOrdersCSV(input, output, promotionRules) {
    return new Promise((resolve, reject) => {
        // create stream to read csv line by line
        const lineStream = filesystem.readFileByLineStream(input)

        // create stream to write result line by line
        const fileOutputStream = filesystem.writeFileStream(output)

        let header = null

        // Initialize the count of chocolates based on the promotion rules
        // lets us have dynamic promotion and chocolate types
        const chocolates = getChocolatesCount(promotionRules)

        lineStream.on('error', err => {
            fileOutputStream.close()
            reject(new Error(err))
        })

        fileOutputStream.on('error', e => {
            lineStream.close(e)
            // console.log('error =>', e.message)
            reject(new Error(e))
        })

        lineStream.on('line', line => {
            if (!header) {
                header = line.split(',').map(item => item.trim())

                if (!header) lineStream.error('Empty CSV File')
            } else {
                const order = line.split(',').map(item => item.trim())

                if (order.length !== header.length) {
                    lineStream.error('Invalid CSV format')
                }

                // deep cloning to avoid looping to generate for each line
                let choco = JSON.parse(JSON.stringify(chocolates))
                const chocolateCount = getOrderTotal(
                    order,
                    promotionRules,
                    choco
                )

                fileOutputStream.write(getOutputString(chocolateCount))
            }
        })

        lineStream.on('close', () => {
            fileOutputStream.close()
            resolve()
        })
    })
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

// returns redeemable type of chocolate if any
function getAvailablePromo(chocolates, wrapperNeeded) {
    for (const type in chocolates) {
        if (chocolates[type].wrapperCount >= wrapperNeeded) {
            return type
        }
    }
    return null
}

module.exports = {
    getOrderTotal,
    getChocolatesCount,
    getOutputString,
    processOrdersCSV,
}
