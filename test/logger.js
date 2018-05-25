const { test } = require('tap')
const logger = require('../lib/logger')

test('provides $aliases', (t) => {
  const log = logger('test')

  t.type(log.$debug, Function)
  t.type(log.$info, Function)
  t.type(log.$log, Function)
  t.type(log.$warn, Function)
  t.type(log.$error, Function)
  t.type(log.$fatal, Function)
  t.done()
})

test('$ alias returns first argument', (t) => {
  const { $ } = logger('test')

  t.type($, Function)
  t.same($('foo'), 'foo')
  t.same($('foo', 'bar'), 'foo')
  t.done()
})
