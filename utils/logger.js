const debug = (message, ...args) =>
    console.debug(`['DEBUG'] [${Date.now()}] ${message}`, ...args)

const info = (message, ...args) =>
    console.info(`['INFO'] [${Date.now()}] ${message}`, ...args)

const warn = (message, ...args) =>
    console.warn(`['WARN'] [${Date.now()}] ${message}`, ...args)

const error = (message, ...args) =>
    console.error(`['ERROR'] [${Date.now()}] ${message}`, ...args)

const test = (message, ...args) =>
    console.error(`['TEST'] [${Date.now()}] ==> ${message}`, ...args)

module.exports = {
    debug,
    info,
    warn,
    error,
    test,
}
