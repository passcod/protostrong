const { Signale } = require('signale')
const { inspect } = require('util')

const options = {
  types: {
    $_trace: { badge: '', color: 'grey', label: 'trace' },
    $_debug: { badge: '', color: 'white', label: 'debug' },
    $_info: { badge: '', color: 'blue', label: 'info' },
    $_warn: { badge: '', color: 'yellow', label: 'warn' },
    $_error: { badge: '', color: 'red', label: 'error' },
    $_fatal: { badge: '!!!', color: 'red', label: 'fatal' }
  }
}

const LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']

module.exports = function sublogger (scope, stream = process.stderr) {
  const logger = new Signale(Object.assign({ scope, stream }, options))

  for (const lvl of LEVELS) {
    logger['$' + lvl] = (...args) => logger['$_' + lvl](...args.map((arg) => {
      if (args.length < 2 && arg instanceof Error) return arg
      if (typeof arg === 'string') return arg
      return inspect(arg)
    }))
  }

  const level = process.env.LOG_LEVEL || 'info'
  for (const lvl of LEVELS) {
    if (lvl === level.trim().toLowerCase()) break
    logger['$' + lvl] = () => {}
  }

  logger.$ = (...args) => {
    const [ first ] = args
    logger.$debug(...args)
    return first
  }

  return logger
}
