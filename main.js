'use strict'
const fs = require('fs')
const readline = require('readline')
const logger = require('./utils/logger')

function processOrders(orders, promotionRules) {
    const redemptions = []

    // Initialize the count of chocolates based on the promotion rules
    const chocolatesCache = {}
    Object.keys(promotionRules).forEach(key => (chocolatesCache[key] = 0))

    for (const order of orders) {
        // cloning to avoid looping for every order
        const chocolates = { ...chocolatesCache }

        const { cash, price, wrappersNeeded, type } = order

        // Calculate the number of chocolates the shopper can buy
        const numChocolates = Math.floor(cash / price)

        // Update the count of chocolates for the purchased type
        chocolates[type] += numChocolates

        // Get complimentary chocolate array based on order type
        const availableComplimentary = promotionRules[type]

        // Calculate the number of chocolates the shopper can get through promotions
        const numPromoChocolates = Math.floor(chocolates[type] / wrappersNeeded)

        // Update the count of chocolates for the promotion types
        availableComplimentary.forEach(free => {
            chocolates[free] += numPromoChocolates
        })

        // Push a separate redemption for each order
        redemptions.push({ ...chocolates })
    }

    return redemptions
}

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
