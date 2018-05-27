const { test } = require('tap')
const uncached = require('require-uncached')
const { join } = require('path')

test('with empty file', async (t) => {
  const config = await uncached('../lib/config')(join(__dirname, 'config/empty.toml'))

  t.same(config.gearman, 'localhost:4730', 'gearman url should be default')
  t.done()
})

test('with override', async (t) => {
  const config = await uncached('../lib/config')(join(__dirname, 'config/override.toml'))

  t.same(config.gearman, '1.2.3.4:5678', 'gearman url should be overriden')
  t.done()
})

test('with unknown queue type', (t) => {
  t.rejects(uncached('../lib/config')(join(__dirname, 'config/whatqueue.toml')))
  t.done()
})

test('with arbitrary key', async (t) => {
  const config = await uncached('../lib/config')(join(__dirname, 'config/arbitrary.toml'))

  t.same(config.gearman, 'localhost:4730', 'gearman url should be default')
  t.same(config.arbitrary, 'value', 'arbitrary value should be available')
  t.done()
})

test('with cache', async (t) => {
  await require('../lib/config')(join(__dirname, 'config/arbitrary.toml'))
  const config = await require('../lib/config')(join(__dirname, 'config/arbitrary.toml'))

  t.same(config.gearman, 'localhost:4730', 'gearman url should be default')
  t.same(config.arbitrary, 'value', 'arbitrary value should be available')
  t.done()
})

test('with default path', async (t) => {
  const config = await uncached('../lib/config')()

  t.same(config.gearman, 'localhost:4730', 'gearman url should be default')
  t.done()
})

test('with non-existent file', (t) => {
  t.rejects(uncached('../lib/config')(join(__dirname, 'config/nothere.toml')))
  t.done()
})

test('with bad toml', (t) => {
  t.rejects(uncached('../lib/config')(join(__dirname, 'config/bad.toml')))
  t.done()
})
