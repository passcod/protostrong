const { $trace, $debug, $info, $error } = require('../logger')(['queue', 'gearman'])
const Queue = require('.')
const gearman = require('gearman')

class GearmanQueue extends Queue {
  constructor (client) {
    super(client)
    this.client.on('NOOP', () => this.client.grabJob())
    this.client.on('JOB_ASSIGN', async (job) => {
      $info('received job:', job.func_name)
      // this will only handle a single job at a time
      // to handle more, gotta make a connection pool ourselves

      if (!this.registry.has(job.func_name)) {
        $error('no such function in our registry:', job.func_name)
        this.client.sendWorkFail(job.handle)
        this.client.preSleep()
        return
      }

      try {
        const fn = this.registry.get(job.func_name)
        if (!fn) {
          $error('no such function in our registry:', job.func_name)
          return this.client.sendWorkFail(job.handle)
        }

        const result = await fn(job.payload)
        this.client.sendWorkComplete(job.handle, JSON.stringify(result))
        $info('finished job:', job.func_name)
      } catch (e) {
        $trace('got error running:', job.func_name)
        $trace(e)
        this.client.sendWorkException(job.handle, JSON.stringify(e))
      } finally {
        this.client.preSleep()
      }
    })
    this.client.preSleep()
  }

  register (name, impl) {
    super.register(name, impl)
    this.client.addFunction(name)
  }

  async nodes () {
    $trace('requesting status')
    const status = await new Promise((resolve) => this.client.adminStatus(resolve))
    const actives = Object.entries(status).filter(([, { available_workers: w }]) => w > 0)

    return new Set(actives.map(([name]) => {
      const match = Queue.NODE_FN_REGEX.exec(name)
      if (match) return match[1]
    }).filter((name) => name))
  }

  async shutdown () {
    this.client.close()
  }
}

let queue
module.exports = async function () {
  if (queue) return queue

  const config = await require('../config')()
  const [ host, port ] = config.gearman.split(':')
  const client = gearman(host, +port)

  await new Promise((resolve) => client.connect(resolve))
  return queue = new GearmanQueue(client)
}

/* istanbul ignore next: for testing only */
if (process.env.TEST) module.exports.GearmanQueue = GearmanQueue
