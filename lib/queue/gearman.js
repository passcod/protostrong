const { $trace, $debug, $info, $error } = require('../logger')(['queue', 'gearman'])
const Queue = require('.')
const gearman = require('gearman')

class GearmanQueue extends Queue {
  constructor (client) {
    super(client)
    this.pool = 0
    this.sleeping = false
    $debug('poolmax:', this.poolmax = 10)
    this.client.on('NOOP', () => this.fillpool())
    this.client.on('NO_JOB', () => {
      if (this.sleeping) return

      $debug('no jobs available, sleeping')
      this.sleeping = true
      this.client.preSleep()
    })

    this.client.on('JOB_ASSIGN', async (job) => {
      this.pool += 1
      $info('received job:', job.func_name)

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
        this.pool -= 1
        this.fillpool()
      }
    })

    this.fillpool()
  }

  async fillpool () {
    $debug('pool:', this.pool)
    if (this.pool >= this.poolmax) return
    for (let i = this.pool; i < this.poolmax; i += 1) {
      this.sleeping = false
      this.client.grabJob()
    }
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
