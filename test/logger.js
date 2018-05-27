const { test } = require('tap')
const { WritableMock } = require('stream-mock')
const logger = require('../lib/logger')

test('provides $levels', (t) => {
  const log = logger('test')

  t.type(log.$trace, Function)
  t.type(log.$debug, Function)
  t.type(log.$info, Function)
  t.type(log.$warn, Function)
  t.type(log.$error, Function)
  t.type(log.$fatal, Function)
  t.done()
})

test('formats object inputs', (t) => {
  const stream = new WritableMock()
  const log = logger('test', stream)

  stream.on('finish', () => {
    t.match(
      encodeURIComponent(stream.data),
      '%5Btest%5D%20%E2%80%BA%20error%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%20foo%3A%20123%20%7D%0A'
    )
    t.done()
  })

  log.$error({ foo: 123 })
  stream.end()
})

test('formats Error inputs', (t) => {
  const stream = new WritableMock()
  const log = logger('test', stream)

  stream.on('finish', () => {
    t.match(
      encodeURIComponent(stream.data.toString().split('\n')[0]),
      '%5Btest%5D%20%E2%80%BA%20error%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Error%3A%20baz%20'
    )
    t.done()
  })

  log.$error(new Error('baz'))
  stream.end()
})

test('$ shorthand returns first argument', (t) => {
  const { $ } = logger('test')

  t.type($, Function)
  t.same($('foo'), 'foo')
  t.same($('foo', 'bar'), 'foo')
  t.done()
})
