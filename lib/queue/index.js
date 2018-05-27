const { $trace, $debug } = require('../logger')('queue')
const nanoid = require('nanoid/generate')

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
function uid () {
  return nanoid(ALPHABET, 16)
}

class Queue {
  constructor (client) {
    this.client = client
    this.nodeid = uid()
    $trace('nodeid', this.nodeid)

    this.register(`armstrong::job`, this.job.bind(this))
    this.register(`armstrong::node::${this.nodeid}::job`, this.job.bind(this))
    this.register(`armstrong::node::${this.nodeid}::query`, this.query.bind(this))
    this.register(`armstrong::node::${this.nodeid}::placement`, this.placement.bind(this))

    process.on('SIGINT', this.shutdown.bind(this))
  }

  async register (name, callback) { throw new Error('should be implemented by subclass!') }
  async nodes () { throw new Error('should be implemented by subclass!') }
  async shutdown () { throw new Error('should be implemented by subclass!') }

  job (...args) {
    $debug('got job request')
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
