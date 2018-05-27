const { $trace, $debug, $info } = require('../logger')(['queue', 'gearman'])
const Queue = require('.')
const Gearman = require('abraxas')

class GearmanQueue extends Queue {
  async register (name, callback) {
    if (!this.registry) {
      this.registry = []
      $debug('set client id')
      this.client.setClientId(this.nodeid)
    }

    $debug('register', name)
    this.client.registerWorker(name, callback)
    this.registry.push(name)
  }

  async nodes () {
    $trace('requesting status')
    const status = (await this.client.status())
    const actives = Object.values(status[0]).filter(({ workers }) => workers > 0)

    return new Set(actives.map(({ function: name }) => {
      const match = Queue.NODE_FN_REGEX.exec(name)
      if (match) return match[1]
    }).filter((name) => name))
  }

  async shutdown () {
    for (const name of this.registry || []) {
      this.client.unregisterWorker(name)
    }

    this.client.forgetAllWorkers()
    this.client.disconnect()
  }
}

let queue
module.exports = async function () {
  if (queue) return queue

  const config = await require('../config')()
  const client = Gearman.Client.connect({
    servers: [config.gearman],
    defaultEncoding: 'utf8',
    maxJobs: 100
  })

  return queue = new GearmanQueue(client)
}

/* istanbul ignore next: for testing only */
if (process.env.TEST) module.exports.GearmanQueue = GearmanQueue
