const { test } = require('tap')
const placement = require('../../lib/messages/placement')
const { check } = placement

test('version is 1', (t) => {
  t.same(placement({ name: 'test' }).v, 1, 'v == 1 when generating')
  t.throws(() => placement.check({ v: 0 }), 'v must be 1 when checking')
  t.done()
})

test('creates simple placement', (t) => {
  const p = placement({ alpha: 1 })
  t.deepEqual(p.placement.fns, { alpha: 1 })
  t.done()
})

test('creates placement with several functions', (t) => {
  const p = placement({ alpha: 1, beta: 2, gamma: 33 })
  t.deepEqual(p.placement.fns, { alpha: 1, beta: 2, gamma: 33 })
  t.done()
})

test('creates placement with optional functions', (t) => {
  const p = placement({ alpha: 1, beta: 2, gamma: 0 })
  t.deepEqual(p.placement.fns, { alpha: 1, beta: 2, gamma: 0 })
  t.done()
})

test('creates placement with host requirements', (t) => {
  const p = placement({ fn: 1 }, { disk: 10 })
  t.deepEqual(p.placement.host, { disk: 10 })
  t.done()
})

test('checks placement', (t) => {
  function err (message) {
    return { message }
  }

  t.test('general validity', (t) => {
    t.throws(() => check(), err('not a message'))
    t.throws(() => check({ v: 1 }), err('not a placement'))
    t.throws(() => check({ v: 1, placement: {} }), err('invalid fns'))
    t.throws(() => check({ v: 1, placement: { fns: true } }), err('invalid fns'), 'bool')
    t.throws(() => check({ v: 1, placement: { fns: 1 } }), err('invalid fns'), 'number')
    t.throws(() => check({ v: 1, placement: { fns: 'a' } }), err('invalid fns'), 'string')
    t.throws(() => check({ v: 1, placement: { fns: [] } }), err('invalid fns'), 'array')
    t.throws(() => check({ v: 1, placement: { host: {} } }), err('invalid fns'))
    t.done()
  })

  t.test('fns', (t) => {
    t.throws(() => check(placement({})), err('empty fns'))
    t.throws(() => check(placement({ foo: 'a' })), err('must be a number'), 'string')
    t.throws(() => check(placement({ foo: true })), err('must be a number'), 'bool: true')
    t.throws(() => check(placement({ foo: false })), err('must be a number'), 'bool: false')
    t.throws(() => check(placement({ foo: NaN })), err('must be a number'), 'NaN')
    t.throws(() => check(placement({ foo: Infinity })), err('must be >= zero'), '+Inf')
    t.throws(() => check(placement({ foo: -Infinity })), err('must be >= zero'), '-Inf')
    t.throws(() => check(placement({ foo: {} })), err('must be a number'), 'object')
    t.throws(() => check(placement({ foo: [] })), err('must be a number'), 'array')
    t.throws(() => check(placement({ foo: -1 })), err('must be >= zero'), 'negative')
    t.throws(() => check(placement({ foo: 1.5 })), err('must be integer'), 'float')
    t.throws(() => check(placement({ foo: 0 })), err('at least one required'))
    t.throws(() => check(placement({ foo: 0, bar: 0 })), err('at least one required'))
    t.ok(check(placement({ foo: 1 })), err('at least one required'))
    t.ok(check(placement({ foo: 3, bar: 777 })), err('at least one required'))
    t.done()
  })

  t.test('host',(t) => {
    t.test('basics', (t) => {
      t.throws(() => check(placement({ f: 1}, true)), err('invalid host'), 'bool')
      t.throws(() => check(placement({ f: 1}, 1)), err('invalid host'), 'number')
      t.throws(() => check(placement({ f: 1}, 'a')), err('invalid host'), 'string')
      t.throws(() => check(placement({ f: 1}, [])), err('invalid host'), 'array')
      t.ok(check(placement({ f: 1}, { disk: 1 })))
      t.done()
    })

    t.test('ip', (t) => {
      function ip (i) {
        return placement({ f: 1 }, { ip: i })
      }

      t.ok(check(ip('12.34.56.78')), 'single string')
      t.ok(check(ip('12.34.56.*')), 'single pattern')
      t.ok(check(ip('192.168.0.1/24')), 'single cidr')
      t.ok(check(ip('/(1\\.){3}0/')), 'single regexp')
      t.ok(check(ip('::1')), 'single ipv6')
      t.ok(check(ip(['12.34.56.78', '1.1.1.1'])), 'strings')
      t.ok(check(ip(['12.34.*.78', '10.*.*.2'])), 'patterns')
      t.ok(check(ip(['12.34.56.0/32', '127.0.0.0/8'])), 'cidrs')
      t.ok(check(ip(['/(1\\.){3}0/', '/.+/'])), 'regexps')
      t.ok(check(ip(['12.34.56.78', '/.+/', '1.0.0.1/16', '180.222.*.*'])), 'mixed')

      t.throws(() => check(ip({})), err('invalid host.ip'), 'throws if object')
      t.throws(() => check(ip(true)), err('invalid host.ip'), 'throws if true')
      t.throws(() => check(ip(32)), err('invalid host.ip'), 'throws if number')

      t.ok(check(ip()), 'skips if empty')
      t.ok(check(ip(null)), 'skips if null')
      t.ok(check(ip(false)), 'skips if false')

      t.throws(() => check(ip([{}])), err('ip must be a string'))
      t.throws(() => check(ip('12.34.56.258')), err('ip is invalid'))
      t.throws(() => check(ip('12.34.56.78/500')), err('ip subnet is invalid'))
      t.throws(() => check(ip('::1/500')), err('ip subnet is invalid'), 'ipv6 subnet')
      t.throws(() => check(ip('/???/')), err('ip regexp is invalid'), 'bad regexp')
      t.done()
    })

    t.test('hostname', (t) => {
      function host (h) {
        return placement({ f: 1 }, { hostname: h })
      }

      t.ok(check(host('web1')), 'single string')
      t.ok(check(host('web5.')), 'single dotted')
      t.ok(check(host('/foo(\.bar)?\.baz/')), 'single regexp')
      t.ok(check(host(['web1', 'web2', 'proxy.db'])), 'strings')
      t.ok(check(host(['test.', 'dev.prod.staging.'])), 'dotteds')
      t.ok(check(host(['/(foo\.)?bar/', '/.+/'])), 'regexps')
      t.ok(check(host(['s1.worker.lan', 'party.local.', '/.+/'])), 'mixed')

      t.throws(() => check(host({})), err('invalid host.hostname'), 'throws if object')
      t.throws(() => check(host(true)), err('invalid host.hostname'), 'throws if true')
      t.throws(() => check(host(32)), err('invalid host.hostname'), 'throws if number')

      t.ok(check(host()), 'skips if empty')
      t.ok(check(host(null)), 'skips if null')
      t.ok(check(host(false)), 'skips if false')

      t.throws(() => check(host([{}])), err('hostname must be a string'))
      t.throws(() => check(host('...')), err('hostname is invalid'))
      t.throws(() => check(host('/???/')), err('hostname regexp is invalid'), 'bad regexp')
      t.done()
    })

    t.test('service', (t) => {
      function serv (s) {
        return placement({ f: 1 }, { service: s })
      }

      t.ok(check(serv('nginx')), 'single string')
      t.ok(check(serv('/redis(-server)?/')), 'single regexp')
      t.ok(check(serv(['gearmand', 'php-fpm'])), 'strings')
      t.ok(check(serv(['/mysql(-server)?/', '/postgresql@.+/'])), 'regexps')
      t.ok(check(serv(['httpd', '/ssh/'])), 'mixed')

      t.throws(() => check(serv({})), err('invalid host.service'), 'throws if object')
      t.throws(() => check(serv(true)), err('invalid host.service'), 'throws if true')
      t.throws(() => check(serv(32)), err('invalid host.service'), 'throws if number')

      t.ok(check(serv()), 'skips if empty')
      t.ok(check(serv(null)), 'skips if null')
      t.ok(check(serv(false)), 'skips if false')

      t.throws(() => check(serv([{}])), err('service must be a string'))
      t.throws(() => check(serv('/???/')), err('service regexp is invalid'), 'bad regexp')
      t.done()
    })

    t.test('memory', (t) => {
      function mem (m) {
        return placement({ f: 1 }, { memory: m })
      }

      t.ok(mem(1))
      t.ok(mem(1.5))
      t.ok(mem('3 kb'))
      t.ok(mem('6 mb'))
      t.ok(mem('12 gb'))

      t.throws(() => check(mem({})), err('must be a string or number'), 'throws if object')
      t.throws(() => check(mem(true)), err('must be a string or number'), 'throws if true')
      t.throws(() => check(mem(false)), err('must be a string or number'), 'throws if false')

      t.ok(check(mem()), 'skips if empty')
      t.ok(check(mem(null)), 'skips if null')

      t.throws(() => check(mem(0.0001)), err('must be at least 1 KB'), 'undersized: number')
      t.throws(() => check(mem('0.5 kb')), err('must be at least 1 KB'), 'undersized: string')
      t.throws(() => check(mem('28')), err('invalid memory size unit'), 'no unit')
      t.throws(() => check(mem('9 minutes')), err('invalid memory size unit'), 'bad unit: completely wrong')
      t.throws(() => check(mem('2048 b')), err('cannot use bytes'), 'bytes')
      t.throws(() => check(mem('96 bb')), err('invalid memory size unit'), 'bad unit: bad prefix')
      t.throws(() => check(mem('96 pb')), err('invalid memory size unit'), 'bad unit: unsupported prefix')

      t.done()
    })

    t.test('disk', (t) => {
      function disk (d) {
        return placement({ f: 1 }, { disk: d })
      }

      t.ok(disk(1))
      t.ok(disk(1.5))
      t.ok(disk('3 kb'))
      t.ok(disk('6 mb'))
      t.ok(disk('12 gb'))

      t.throws(() => check(disk({})), err('must be a string or number'), 'throws if object')
      t.throws(() => check(disk(true)), err('must be a string or number'), 'throws if true')
      t.throws(() => check(disk(false)), err('must be a string or number'), 'throws if false')

      t.ok(check(disk()), 'skips if empty')
      t.ok(check(disk(null)), 'skips if null')

      t.throws(() => check(disk(0.1)), err('must be at least 1 MB'), 'undersized: number')
      t.throws(() => check(disk('0.5 mb')), err('must be at least 1 MB'), 'undersized: string')
      t.throws(() => check(disk('28')), err('invalid disk size unit'), 'no unit')
      t.throws(() => check(disk('9 minutes')), err('invalid disk size unit'), 'bad unit: completely wrong')
      t.throws(() => check(disk('2048 b')), err('cannot use bytes'), 'bytes')
      t.throws(() => check(disk('96 bb')), err('invalid disk size unit'), 'bad unit: bad prefix')
      t.throws(() => check(disk('96 pb')), err('invalid disk size unit'), 'bad unit: unsupported prefix')

      t.done()
    })

    t.done()
  })

  t.done()
})
