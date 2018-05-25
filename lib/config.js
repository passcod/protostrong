const { $debug } = require('./logger')('config')
const fs = require('fs').promises
const toml = require('toml')
const paths = require('./paths')

let config = null
module.exports = async function (path = null) {
  if (!path) path = await paths.config()
  if (config) return config

  const str = await fs.readFile(path)
  config = toml.parse(str)

  config.redis = config.redis || process.env.REDIS_URL || 'localhost:6379'
  config.gearman = config.gearman || process.env.GEARMAN_URL || 'localhost:4730'

  $debug('redis url:', config.redis)
  $debug('gearman url:', config.gearman)

  return config
}
