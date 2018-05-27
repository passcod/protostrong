const { $trace, $debug, $info } = require('./logger')('paths')
const { promises: fs, constants: { R_OK: READABLE, W_OK: WRITABLE } } = require('fs')
const { join } = require('path')

const cache = { save: (key) => (path) => {
  $info('found', key, 'path at', path)
  return cache[key] = path
} }

async function check (file, mode = READABLE) {
  if (!file) return false
  if (typeof file !== 'string') return false
  if (file.trim().length < 1) return false

  $trace('check', file, 'exists')
  try {
    await fs.access(file, mode)
    return true
  } catch (e) {
    $trace('fs call on', file, 'errored')
    $trace(e)
    return false
  }
}

module.exports = {
  async config () {
    if (cache.config) return cache.config
    const save = cache.save('config')

    $debug('looking into env at ARMSTRONG_CONFIG')
    const fromenv = process.env.ARMSTRONG_CONFIG
    if (await check(fromenv)) return save(fromenv)

    $debug('looking into env at npm_config_armstrong_config')
    const fromnpm = process.env.npm_config_armstrong_config
    if (await check(fromnpm)) return save(fromnpm)

    $debug('looking into current working directory')
    const cwd = join(process.cwd(), 'config.toml')
    if (await check(cwd)) return save(cwd)

    $debug('looking into home/.config')
    const config = join(process.env.HOME, '.config/armstrong.toml')
    if (await check(config)) return save(config)

    $debug('looking into /etc')
    const root = '/etc/armstrong.toml'
    /* istanbul ignore next: can't mock */
    if (!process.env.TEST && await check(root)) return save(root)

    $debug('looking into package')
    const pkg = join(__dirname, '../config.toml')
    /* istanbul ignore next: can't mock */
    if (await check(pkg)) return save(pkg)

    /* istanbul ignore next: should be unreachable */
    throw new Error('No config file found!')
  },

  async store () {
    if (cache.store) return cache.store
    const save = cache.save('store')

    $debug('looking into env at ARMSTRONG_STORE')
    const fromenv = process.env.ARMSTRONG_STORE
    if (await check(fromenv)) return save(fromenv)

    $debug('looking into env at npm_config_armstrong_store')
    const fromnpm = process.env.npm_config_armstrong_store
    if (await check(fromnpm)) return save(fromnpm)

    $debug('looking into current working directory')
    const cwd = join(process.cwd(), 'store.db')
    if (await check(cwd)) return save(cwd)

    $debug('looking into home')
    const config = join(process.env.HOME, 'store.db')
    if (await check(config)) return save(config)

    throw new Error('No store location found!')
  }
}

/* istanbul ignore next: for testing only */
if (process.env.TEST) module.exports.check = check
