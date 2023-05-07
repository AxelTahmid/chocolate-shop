'use strict'
const fs = require('fs')
const readline = require('readline')
const logger = require('./utils/logger')

function processOrders(orders, promotionRules) {
    const redemptions = []

    // Initialize the count of chocolates based on the promotion rules
    // And caching it so that counter easily reset for each order
    const chocolatesCache = {}
    Object.keys(promotionRules).forEach(key => (chocolatesCache[key] = 0))

    for (const order of orders) {
        let chocolates = chocolatesCache

        const { cash, price, wrappersNeeded, type } = order

        // Calculate the number of chocolates the shopper can buy
        const numChocolates = Math.floor(cash / price)

        // Update the count of chocolates for the purchased type
        chocolates[type] += numChocolates

        // Apply promotions based on the promotion rules
        // Get promotion based on order type
        const { promoTypes, incrementBy } = promotionRules[type]

        // Calculate the number of chocolates the shopper can get through promotions
        const numPromoChocolates = Math.floor(chocolates[type] / wrappersNeeded)

        // Update the count of chocolates for the promotion types
        for (const promoType of promoTypes) {
            chocolates[promoType] += numPromoChocolates
        }

        // Push a separate redemption for each order
        redemptions.push({ ...chocolates })
    }

    return redemptions
}

/*
function processOrders(orders, promotionRules) {
    const redemptions = []

    const chocolates = {}
    // Initialize the count of chocolates based on the promotion rules
    for (const rule of promotionRules) {
        const { type } = rule
        chocolates[type] = 0
    }

    for (const order of orders) {
        const { cash, price, wrappersNeeded, type } = order

        // Calculate the number of chocolates the shopper can buy
        const numChocolates = Math.floor(cash / price)

        // Update the count of chocolates for the purchased type
        chocolates[type] += numChocolates

        // Apply promotions based on the promotion rules
        for (const rule of promotionRules) {
            const { wrapperType, promoTypes, wrappersNeeded } = rule

            // Calculate the number of chocolates the shopper can get through promotions
            const numPromoChocolates = Math.floor(
                chocolates[wrapperType] / wrappersNeeded
            )

            // Update the count of chocolates for the promotion types
            for (const promoType of promoTypes) {
                chocolates[promoType] += numPromoChocolates
            }

            // Calculate the remaining wrappers after promotions
            const remainingWrappers = chocolates[wrapperType] % wrappersNeeded

            // Reset the count of chocolates for the wrapper type
            chocolates[wrapperType] = remainingWrappers

            // Push chocolates to array
            redemptions.push(chocolates)
        }
    }

    return redemptions
}
*/
// function processOrders(orders) {
//     const redemptions = []

//     for (const order of orders) {
//         let chocolates = {
//             milk: 0,
//             dark: 0,
//             white: 0,
//             'sugar free': 0,
//         }
//         const { cash, price, wrappersNeeded, type } = order
//         const chocolatesBought = Math.floor(cash / price)

//         chocolates[type] += chocolatesBought

//         let wrappers = chocolatesBought

//         while (wrappers >= wrappersNeeded) {
//             if (type === 'milk' || type === 'white') {
//                 chocolates.milk++
//                 chocolates['sugar free']++
//             } else if (type === 'sugar free') {
//                 chocolates['sugar free']++
//                 chocolates.dark++
//             } else if (type === 'dark') {
//                 chocolates.dark++
//             }

//             const tradedChocolates = Math.floor(wrappers / wrappersNeeded)
//             const leftoverWrappers = wrappers % wrappersNeeded

//             wrappers = tradedChocolates + leftoverWrappers
//         }
//         redemptions.push(chocolates)
//     }

//     return redemptions
// }

function parseOrdersFile(filename) {
    return new Promise((resolve, reject) => {
        const orders = []

        logger.info('filename =>', filename)

        const fileStream = fs.createReadStream(filename, 'utf-8')
        const rl = readline.createInterface({
            input: fileStream,
            terminal: false,
        })

        let header = null
        // let count = 0

        rl.on('line', line => {
            // logger.info('line =>', line)
            if (!header) {
                header = line.split(',').map(item => item.trim())
                // logger.info('header =>', JSON.stringify(header))
            } else {
                const values = line.split(',').map(item => item.trim())

                if (values.length !== header.length) {
                    reject(new Error('Invalid CSV format'))
                    rl.close()
                    return
                }

                const order = {}
                for (let i = 0; i < header.length; i++) {
                    if (Number(values[i])) {
                        order[header[i]] = parseInt(values[i])
                    } else {
                        order[header[i]] = values[i]
                    }
                }

                // logger.info('order =>', JSON.stringify(order), ` => ${count}`)
                // count++
                orders.push(order)
            }
        })

        rl.on('close', () => {
            logger.info(`Order parsed from => ${filename}`)
            fileStream.close()
            resolve(orders)
        })

        rl.on('error', err => {
            fileStream.close()
            reject(new Error(err))
        })
    })
}

const { Transform } = require('stream')

function writeRedemptionsToFile(redemptions, filename) {
    const outputStream = fs.createWriteStream(filename)

    const transformStream = new Transform({
        writableObjectMode: true,
        transform(chunk, encoding, callback) {
            const formattedChunk = `${chunk}\n`
            this.push(formattedChunk)
            callback()
        },
    })

    redemptions.forEach(redemption => {
        const formattedRedemption = Object.entries(redemption)
            .map(([chocolateType, count]) => `${chocolateType} ${count}`)
            .join(', ')

        transformStream.write(formattedRedemption)
    })

    transformStream.pipe(outputStream)

    return new Promise((resolve, reject) => {
        transformStream.on('end', resolve)
        transformStream.on('error', reject)
    })
}

// function writeRedemptionsToFile(filename, redemptions) {
//     const lines = redemptions.map(redemption => {
//         return `${redemption.type} ${redemption.count}`
//     })
//     const fileContents = lines.join('\n')
//     fs.writeFileSync(filename, fileContents)
// }

// async function start() {
//     try {
//         const orders = await parseOrdersFile('input/orders.csv')
//         const redemptions = processOrders(orders)

//         await writeRedemptionsToFile('output/redemptions.csv', redemptions)
//     } catch (error) {
//         logger.error(error)
//         throw Error(error)
//     }
// }

// start()

module.exports = {
    processOrders,
    parseOrdersFile,
    writeRedemptionsToFile,
}
