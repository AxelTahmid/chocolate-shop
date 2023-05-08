const { join } = require('path')
const { createInterface } = require('readline')
const { createReadStream, createWriteStream } = require('fs')

function readFileByLineStream(filename) {
    const inputFilePath = join('input', filename)
    const fileInputStream = createReadStream(inputFilePath, 'utf-8')

    const lineStream = createInterface({
        input: fileInputStream,
        terminal: false,
    })

    return lineStream
}

function writeFileStream(filename) {
    const outputFilePath = join('output', filename)
    return createWriteStream(outputFilePath)
}

module.exports = {
    readFileByLineStream,
    writeFileStream,
}
