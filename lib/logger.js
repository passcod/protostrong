const { Signale } = require('signale')
const signale = new Signale({
  types: {
    $trace: { badge: '', color: 'grey', label: 'trace' },
    $debug: { badge: '', color: 'white', label: 'debug' },
    $info: { badge: '', color: 'blue', label: 'info' },
    $warn: { badge: '', color: 'yellow', label: 'warn' },
    $error: { badge: '', color: 'red', label: 'error' },
    $fatal: { badge: '!!!', color: 'red', label: 'fatal' }
  }
})

module.exports = function sublogger (prefix) {
  const logger = signale.scope(prefix)

  const level = process.env.LOG_LEVEL || 'info'
  for (const lvl of ['trace', 'debug', 'info', 'warn', 'error', 'fatal']) {
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
