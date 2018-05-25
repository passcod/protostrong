const signale = require('signale')

function $alias (target, name) {
  target['$' + name] = target[name].bind(target)
}

module.exports = function sublogger (prefix) {
  const logger = signale.scope(prefix)

  ;['debug', 'info', 'log', 'warn', 'error', 'fatal']
    .forEach((name) => $alias(logger, name))

  logger.$ = (...args) => {
    const [ first ] = args
    logger.log(...args)
    return first
  }

  return logger
}
