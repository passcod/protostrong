const { $trace } = require('./logger')('config')
const fs = require('fs').promises
const toml = require('toml')
const paths = require('./paths')

let config = null
module.exports = async function (path = null) {
  if (config) return config
  if (!path) path = await paths.config()

  const str = await fs.readFile(path)
  config = toml.parse(str)

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

  return config
}
