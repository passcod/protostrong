const { $trace, $info, $warn, $error } = require('./logger')('config')
const fs = require('fs').promises
const toml = require('toml')
const paths = require('./paths')

const ECHO_HANDLER = {
  type: 'built-in',
  name: 'echo',
}

let config = null
module.exports = async function (path = null) {
  if (config) return config
  if (!path) path = await paths.config()

  const str = await fs.readFile(path)
  try {
    config = toml.parse(str)
  } catch (e) {
    throw new Error(`Could not parse TOML in ${path}: ${e}`)
  }

  config.queue = process.env.ARMSTRONG_QUEUE || config.queue || 'gearman'
  $trace('queue type:', config.queue)

  switch (config.queue) {
    case 'gearman':
      config.gearman = process.env.GEARMAN_HOST || config.gearman || 'localhost:4730'
      $trace('gearman url:', config.gearman)
      break;
    default:
      throw new Error('Unknown queue type: ' + config.queue)
  }

  config.handlers = new Map(Object.entries(config.handlers || {}))
  if (config.handlers.size < 1) {
    $warn('no handlers configured, defaulting to the built-in echo handler')
    config.handlers.set('echo', ECHO_HANDLER)
  } else {
    $info('found', config.handlers.size, 'handlers:')
    for (const { type, name, prefix, fns = ['?'] } of config.handlers.values())
      $info(`  - ${type} handler answering to '${name || `${prefix}::{${fns.join(',')}}`}'`)
  }

  $trace('Handlers:', config.handlers)

  return config
}
