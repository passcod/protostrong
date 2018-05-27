const { $trace, $debug, $info } = require('./logger')('store')
const paths = require('./paths')
const { promisify } = require('util')
const encodingdown = require('encoding-down')
const leveldown = require('leveldown')
const levelup = promisify(require('levelup'))
const memdown = require('memdown')

let store = null
module.exports = async function () {
  if (store) return store

  try {
    $debug('attempting to get a writable store')
    const path = await paths.store()
    $trace('got store path:', path)

    $debug('attempting to open store')
    const db = await levelup(leveldown(path))
    $info('opened store using leveldown')

    db.persistent = true
    return store = db
  } catch (e) {
    $trace(e)
    $debug('couldn\'t open store on disk, attempting memory store')
    const db = await levelup(encodingdown(memdown()))
    $info('opened store using memdown')

    db.persistent = false
    return store = db
  }
}
