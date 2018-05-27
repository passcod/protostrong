const { $trace } = require('./logger')('config')
const fs = require('fs').promises
const toml = require('toml')
const paths = require('./paths')

let config = null
module.exports = async function (path = null) {
  if (!path) path = await paths.config()
  if (config) return config

  const str = await fs.readFile(path)
  config = toml.parse(str)

  config.gearman = config.gearman || process.env.GEARMAN_URL || 'localhost:4730'
  $trace('gearman url:', config.gearman)

  return config
}
