const debug = (message, ...args) =>
    console.debug(`[${new Date().toISOString()}] ['DEBUG'] ${message}`, ...args)

const info = (message, ...args) =>
    console.info(`[${new Date().toISOString()}] ['INFO'] ${message}`, ...args)

const warn = (message, ...args) =>
    console.warn(`[${new Date().toISOString()}] ['WARN'] ${message}`, ...args)

const error = (message, ...args) =>
    console.error(`[${new Date().toISOString()}] ['ERROR'] ${message}`, ...args)

module.exports = {
    debug,
    info,
    warn,
    error,
}
