const { join } = require('path')
const { createInterface } = require('readline')
const {
    createReadStream,
    createWriteStream,
    readFileSync,
    writeFileSync,
    unlinkSync,
} = require('fs')

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

// Utility function to read a test file
function readTestFile(filePath) {
    return readFileSync(join('output', filePath), 'utf-8')
}

// Utility function to create a test file with the given content
function createTestFile(filePath, content) {
    writeFileSync(join('input', filePath), content)
}

// Utility function to delete a test file
function deleteTestFile(file, folder) {
    unlinkSync(join(folder, file))
}

module.exports = {
    readFileByLineStream,
    writeFileStream,
    readTestFile,
    createTestFile,
    deleteTestFile,
}
