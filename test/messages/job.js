const { test } = require('tap')
const job = require('../../lib/messages/job')

test('version is 1', (t) => {
  t.same(job({ name: 'test' }).v, 1, 'v == 1 when generating')
  t.throws(() => job.check({ v: 0 }), 'v must be 1 when checking')
  t.done()
})

test('creates simple job', (t) => {
  const simple = job({ name: 'test' })
  t.equal(simple.job.name, 'test')
  t.equal(simple.job.uid, null)
  t.deepEqual(simple.job.args, [])
  t.done()
})

test('creates job with id', (t) => {
  const unique = job({ name: 'test', uid: 'super unique' })
  t.equal(unique.job.name, 'test')
  t.equal(unique.job.uid, 'super unique')
  t.deepEqual(unique.job.args, [])
  t.done()
})

test('creates job with a argument', (t) => {
  const arg = job({ name: 'test', args: [1] })
  t.equal(arg.job.name, 'test')
  t.equal(arg.job.uid, null)
  t.deepEqual(arg.job.args, [1])
  t.done()
})

test('creates job with arguments', (t) => {
  const args = job({ name: 'test', args: [1, 2, 3] })
  t.equal(args.job.name, 'test')
  t.equal(args.job.uid, null)
  t.deepEqual(args.job.args, [1, 2, 3])
  t.done()
})

test('passes good message', (t) => {
  const message = {
    v: 1,
    job: {
      name: 'test',
      uid: null,
      args: []
    }
  }

  t.ok(job.check(message), 'simple')

  message.job.uid = 'a string'
  t.ok(job.check(message), 'unique')

  message.job.args.push('foo')
  t.ok(job.check(message), 'argument')

  message.job.args.push('bar')
  t.ok(job.check(message), 'arguments')

  t.done()
})

test('fails bad message', (t) => {
  const message = {
    v: 1,
    job: {
      name: 'test',
      uid: null,
      args: []
    }
  }

  t.throws(() => job.check(null), 'not an object: null')
  t.throws(() => job.check(undefined), 'not an object: undefined')
  t.throws(() => job.check('string'), 'not an object: string')
  t.throws(() => job.check(['array']), 'not an object: array')

  message.job.uid = 123
  t.throws(() => job.check(message), 'uid not a string')
  message.job.uid = '123'

  message.job.args = {}
  t.throws(() => job.check(message), 'args not an array')
  delete message.job.args
  t.throws(() => job.check(message), 'args non existent')
  message.job.args = [42]

  message.job.name = new Date
  t.throws(() => job.check(message), 'name not a string')
  delete message.job.name
  t.throws(() => job.check(message), 'name non existent')

  message.job = []
  t.throws(() => job.check(message), 'job not an object')
  delete message.job
  t.throws(() => job.check(message), 'job non existent')

  t.done()
})
