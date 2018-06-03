const { $trace, $debug, $warn } = require('../logger')('queue')
const nanoid = require('nanoid/generate')

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
function uid () {
  return nanoid(ALPHABET, 16)
}

// A queue implementation needs to be able to:
//
// - perform basic job queue things:
//   + register interest for jobs of a certain type / name
//   + submit jobs of any type / name
//   + mark jobs as being worked on (so they're not processed elsewhere)
//   + mark jobs as being completed
//   + (most job queues can do this, but message queues will need shimming)
//
// - and some slightly more advanced things:
//   + send back data to the "client" of a job on completion
//   + send back failure/success indications to the client
//   + (many job queues can do this, those that can't can be shimmed with messaging)
//
// -  and some more advanced things
//   + set job progress while it's being worked on (in a way that the client can read)
//   + send back data to the client at any point while processing
//   + (only some job queues can do this natively, but messaging can shim it)
//
// - and ideally it should:
//   + be able to work on many jobs at a time given a single connection
//   + be able to command many jobs at a time given a single connection
//   + be able to query what job types / individual queues exist at this point
//   + and how many workers there are subscribed to each of those
//   + (very few job queues can do that, and it's not easy to shim)
//
// Gearman can do all that. But it doesn't scale well beyond a single daemon.
// It might be easier to figure out *consistent* scaling of Gearman rather than
// shimming a full-featured job queue on top of another queue that scales well.

class Queue {
  constructor (client) {
    this.client = client
    this.nodeid = uid()
    this.registry = new Map
    $trace('nodeid', this.nodeid)

    this.register(`armstrong::job`, this.job.bind(this))
    this.register(`armstrong::watch`, this.job.bind(this))
    this.register(`armstrong::node::${this.nodeid}::job`, this.job.bind(this))
    this.register(`armstrong::node::${this.nodeid}::query`, this.query.bind(this))
    this.register(`armstrong::node::${this.nodeid}::placement`, this.placement.bind(this))

    process.on('SIGINT', () => {
      $warn('goodness me, a sigint')
      this.shutdown()
    })
  }

  register (name, impl) {
    $debug('registering', name)
    this.registry.set(name, impl)
  }

  async nodes () { throw new Error('should be implemented by subclass!') }
  async shutdown () { throw new Error('should be implemented by subclass!') }

  job (...args) {
    $debug('got job request')
    $trace(args)
  }

  watch (...args) {
    $debug('got watch request')
    $trace(args)
  }

  query (...args) {
    $debug('got query request')
    $trace(args)
  }

  placement (...args) {
    $debug('got placement request')
    $trace(args)
  }
}

module.exports = Queue
module.exports.NODE_FN_REGEX = /^armstrong::node::(\w+)::/
