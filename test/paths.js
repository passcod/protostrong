const { test } = require('tap')
const uncached = require('require-uncached')
const { join } = require('path')
const { realpath } = require('fs').promises

test('check function', async (t) => {
  const paths = require('../lib/paths')

  t.notOk(await paths.check(null))
  t.notOk(await paths.check(true))
  t.notOk(await paths.check(''))
  t.notOk(await paths.check(' '))
  t.notOk(await paths.check(join(__dirname, 'nofile.here')))
  t.ok(await paths.check(__filename))
  t.done()
})

test('config path', async (t) => {
  process.env.ARMSTRONG_CONFIG = null
  process.env.npm_config_armstrong_config = null
  const cwd = process.cwd()
  process.chdir(__dirname)
  await t.resolves(uncached('../lib/paths').config(), 'should never fail to find a config')

  process.env.ARMSTRONG_CONFIG = __filename
  t.same(await uncached('../lib/paths').config(), __filename, 'finds a config from env')
  process.env.ARMSTRONG_CONFIG = null

  process.env.npm_config_armstrong_config = __filename
  t.same(await uncached('../lib/paths').config(), __filename, 'finds a config from npm')
  process.env.npm_config_armstrong_config = null

  process.chdir(join(__dirname, '..'))
  t.same(await uncached('../lib/paths').config(), join(__dirname, '../config.toml'), 'finds a config in cwd')
  process.chdir(__dirname)

  const home = process.env.HOME
  process.env.HOME = __dirname
  t.same(await uncached('../lib/paths').config(), join(__dirname, '.config/armstrong.toml'), 'finds a config in home')
  process.env.HOME = join(__dirname, '.config')
  t.same(await uncached('../lib/paths').config(), await realpath(join(__dirname, '../config.toml')), 'finds a config in package')
  process.env.HOME = home

  await require('../lib/paths').config()
  t.ok(await require('../lib/paths').config(), 'test cache')

  process.chdir(cwd)
  t.done()
})

test('store path', async (t) => {
  process.env.ARMSTRONG_STORE = null
  process.env.npm_config_armstrong_store = null
  const cwd = process.cwd()
  process.chdir(join(__dirname, 'config'))
  await t.rejects(uncached('../lib/paths').store(), 'should fail if no writable path is found')

  process.env.ARMSTRONG_STORE = __dirname
  t.same(await uncached('../lib/paths').store(), __dirname, 'finds a store from env')
  process.env.ARMSTRONG_STORE = null

  process.env.npm_config_armstrong_store = __dirname
  t.same(await uncached('../lib/paths').store(), __dirname, 'finds a store from npm')
  process.env.npm_config_armstrong_store = null

  process.chdir(__dirname)
  t.same(await uncached('../lib/paths').store(), join(__dirname, 'store.db'), 'finds a store in cwd')
  process.chdir(join(__dirname, 'config'))

  const home = process.env.HOME
  process.env.HOME = __dirname
  t.same(await uncached('../lib/paths').store(), join(__dirname, 'store.db'), 'finds a store in home')
  process.env.HOME = home

  await require('../lib/paths').store()
  t.ok(await require('../lib/paths').store(), 'test cache')

  process.chdir(cwd)
  t.done()
})
