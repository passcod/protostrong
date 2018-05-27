const { test } = require('tap')
const del = require('del')
const { join } = require('path')
const uncached = require('require-uncached')

test('creates an in-memory store if no store is writable', async (t) => {
  process.env.ARMSTRONG_STORE = null
  process.env.npm_config_armstrong_store = null
  const cwd = process.cwd()
  process.chdir(join(__dirname, 'config'))

  const store = await uncached('../lib/store')()
  t.same(store.persistent, false)

  process.chdir(cwd)
  t.done()
})

test('returns same instance if called twice', async (t) => {
  process.env.ARMSTRONG_STORE = null
  process.env.npm_config_armstrong_store = null
  const cwd = process.cwd()
  process.chdir(join(__dirname, 'config'))

  t.same(await require('../lib/store')(), await require('../lib/store')())

  process.chdir(cwd)
  t.done()
})

test('creates an on-disk store if a store is writable', async (t) => {
  const dir = process.env.ARMSTRONG_STORE = join(__dirname, 'store.db')
  process.env.npm_config_armstrong_store = null
  const cwd = process.cwd()
  process.chdir(join(__dirname, 'config'))

  const store = await uncached('../lib/store')()
  t.same(store.persistent, true)

  process.chdir(cwd)
  process.env.ARMSTRONG_STORE = null
  await del([join(dir, '**'), '!' + dir, '!' + join(dir, '.gitkeep')])
  t.done()
})
