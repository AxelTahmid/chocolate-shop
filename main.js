'use strict'
const fs = require('fs')
const readline = require('readline')
const logger = require('./utils/logger')

function processOrders(orders) {
    const redemptions = []
    for (const order of orders) {
        const { cash, price, wrappersNeeded, type } = order
        let chocolatesBought = Math.floor(cash / price)
        let wrappers = chocolatesBought
        let totalChocolates = chocolatesBought
        while (wrappers >= wrappersNeeded) {
            const chocolatesRedeemed = Math.floor(wrappers / wrappersNeeded)
            totalChocolates += chocolatesRedeemed
            wrappers = chocolatesRedeemed + (wrappers % wrappersNeeded)
        }
        redemptions.push({
            type,
            count: totalChocolates,
        })
    }
    return redemptions
}

// function parseOrdersFile(filename) {
//     const fileContents = fs.readFileSync(filename, 'utf-8')
//     const lines = fileContents.trim().split('\n')
//     const header = lines
//         .shift()
//         .split(',')
//         .map(item => item.trim())
//     const orders = lines.map(line => {
//         const values = line.split(',').map(item => item.trim())
//         const order = {}
//         for (let i = 0; i < header.length; i++) {
//             order[header[i]] = values[i]
//         }
//         return order
//     })
//     return orders
// }

function parseOrdersFile(filename) {
    return new Promise((resolve, reject) => {
        const orders = []
        const fileStream = fs.createReadStream(filename, 'utf-8')
        const rl = readline.createInterface({
            input: fileStream,
            terminal: false,
        })

        let header = null

        rl.on('line', line => {
            if (!header) {
                header = line.split(',').map(item => item.trim())
                logger.info('header =>', JSON.stringify(header))
            } else {
                const values = line.split(',').map(item => item.trim())
                const order = {}
                for (let i = 0; i < header.length; i++) {
                    order[header[i]] = values[i]
                }
                logger.info('order =>', JSON.stringify(order))
                orders.push(order)
            }
        })
            .on('close', () => {
                resolve(orders)
            })
            .on('error', err => {
                reject(err)
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

async function start() {
    try {
        const orders = await parseOrdersFile('input/orders.csv')
        const redemptions = processOrders(orders)

        await writeRedemptionsToFile('output/redemptions.csv', redemptions)
    } catch (error) {
        logger.error(error)
        throw Error(error)
    }
}

start()

module.exports = {
    processOrders,
    parseOrdersFile,
    writeRedemptionsToFile,
}
