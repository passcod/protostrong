const bytes = require('bytes')
const iscidr = require('is-cidr')
const isdomain = require('is-domain-name')
const isip = require('is-ip')
const version = +require('../../package.json').version.split('.')[0]

module.exports = function placement (fns, host = null) {
  return {
    v: version,
    placement: {
      fns,
      // fns: { // object of functions the node needs to support
      //   'functionname': 0 // the int is how many concurrent ones are required.
      //                     // 0 means optional. A node should allocate as many
      //                     // handlers as required, and one for any optionals
      //                     // that are available.
      // },

      host
      // host: {
      //   ip: [], // list of "ips" or "123.*.45.67" or "/regexps/" or "subnets/16" that are needed
      //   hostname: [], // list of "hostnames" or "/regexps/" that are needed
      //   service: [], // list of "services" or "/regexps/" that should be running
      //   memory: 0, // amount of free memory needed. Calculated before allocation
      //   disk: 0, // amount of free disk space needed
      // }
    }
  }
}

module.exports.check = function (message) {
  if (typeof message !== 'object') throw new Error('not a message')
  if (message.v !== version) throw new Error('bad version')
  if (typeof message.placement !== 'object') throw new Error('not a placement')
  const { placement } = message

  const { fns } = placement
  if (typeof fns !== 'object' || Array.isArray(fns)) throw new Error('invalid fns')

  if (Object.keys(fns).length === 0) throw new Error('empty fns requirement')
  let total = 0
  for (const n of Object.values(fns)) {
    if (typeof n !== 'number' || isNaN(n)) throw new Error('fns value must be a number')
    if (n < 0 || n === Infinity) throw new Error('fns value must be >= zero')
    if (n % 1 !== 0) throw new Error('fns value must be integer')
    total += n
  }
  if (total === 0) throw new Error('there must be at least one required fn')

  if (placement.host) {
    const { host } = placement
    if (typeof host !== 'object' || Array.isArray(host)) throw new Error('invalid host')

    if (host.ip) checkIp(host.ip)
    if (host.hostname) checkHostname(host.hostname)
    if (host.service) checkService(host.service)
    if (host.memory != null) checkMemory(host.memory)
    if (host.disk != null) checkDisk(host.disk)
  }

  return true
}

const SLASHED_RE = /^\/(.+)\/$/

function checkSlashed (name, str) {
  if (!SLASHED_RE.test(str)) return false

  try {
    new RegExp(SLASHED_RE.exec(str)[1])
    return true
  } catch (e) {
    throw new Error(name + ' regexp is invalid: ' + e)
  }
}

function checkIp (ips) {
  if (typeof ips === 'string') return checkIp([ips])
  if (!Array.isArray(ips)) throw new Error('invalid host.ip')

  for (const ip of ips) {
    if (typeof ip !== 'string') throw new Error('ip must be a string')
    if (checkSlashed('ip', ip)) continue
    if (ip.includes('/')) {
      if (!iscidr(ip)) throw new Error('ip subnet is invalid: ' + ip)
      continue
    }

    if (!isip(ip.replace(/\*/g, '0'))) throw new Error('ip is invalid: ' + ip)
  }
}

function checkHostname (names) {
  if (typeof names === 'string') return checkHostname([names])
  if (!Array.isArray(names)) throw new Error('invalid host.hostname')

  for (const name of names) {
    if (typeof name !== 'string') throw new Error('hostname must be a string')
    if (checkSlashed('hostname', name)) continue
    if (!isdomain(name.replace(/\.$/, ''))) throw new Error('hostname is invalid: ' + name)
  }
}

function checkService (services) {
  if (typeof services === 'string') return checkService([services])
  if (!Array.isArray(services)) throw new Error('invalid host.service')

  for (const srv of services) {
    if (typeof srv !== 'string') throw new Error('service must be a string')
    if (checkSlashed('service', srv)) continue
  }
}

function checkMemory (mem) {
  if (typeof mem === 'number') {
    /* istanbul ignore else */
    if (mem < (1 / 1024)) throw new Error('memory size must be at least 1 KB: ' + mem)
  } else if (typeof mem === 'string') {
    if (!/b$/i.test(mem)) throw new Error('invalid memory size unit: ' + mem)
    if (/[\d\s]b$/i.test(mem)) throw new Error('cannot use bytes for memory size: ' + mem)
    if (parseInt(mem) === bytes(mem)) throw new Error('invalid memory size unit: ' + mem)
    /* istanbul ignore else */
    if (bytes(mem) < 1024) throw new Error('memory size must be at least 1 KB: ' + mem)
  } else {
    throw new Error('memory must be a string or number')
  }
}

function checkDisk (disk) {
  if (typeof disk === 'number') {
    /* istanbul ignore else */
    if (disk < 1) throw new Error('disk size must be at least 1 MB: ' + disk)
  } else if (typeof disk === 'string') {
    if (!/b$/i.test(disk)) throw new Error('invalid disk size unit: ' + disk)
    if (/[\d\s]b$/i.test(disk)) throw new Error('cannot use bytes for disk size: ' + disk)
    if (parseInt(disk) === bytes(disk)) throw new Error('invalid disk size unit: ' + disk)
    /* istanbul ignore else */
    if (bytes(disk) < 1024**2) throw new Error('disk size must be at least 1 MB: ' + disk)
  } else {
    throw new Error('disk must be a string or number')
  }
}
