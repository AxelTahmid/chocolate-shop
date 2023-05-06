const { writeFileSync } = require('fs')

// Number of rows to generate
const rows = 100

// Generate random integer within a range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generate random order data
function generateOrderData() {
    const cash = getRandomInt(1, 100)
    const price = getRandomInt(1, 10)
    const wrappersNeeded = getRandomInt(1, 10)
    const typeOptions = ['milk', 'dark', 'white', 'sugar free']
    const type = typeOptions[getRandomInt(0, 3)]

    return `${cash}, ${price}, ${wrappersNeeded}, '${type}'`
}

// Generate CSV file with rows of random order data
function generateInputCSV(filename) {
    let csvData = 'cash, price, wrappers needed, type\n'

    for (let i = 0; i < rows; i++) {
        const orderData = generateOrderData()
        csvData += `${orderData}\n`
    }

    writeFileSync(filename, csvData)

    console.log(`Generated ${filename} with 1000 rows of random order data.`)
}

generateInputCSV('input/orders.csv')
