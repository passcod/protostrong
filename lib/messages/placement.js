const version = +require('../../package.json').version.split('.')[0]

module.exports = function placement () {
  return {
    v: version,
    placement: {
      fns: { // object of functions the node needs to support
        'functionname': 0 // the int is how many concurrent ones are required.
                          // 0 means optional. A node should allocate as many
                          // handlers as required, and one for any optionals
                          // that are available.
      },

      host: {
        ip: [], // list of "ips" or "/regexps/" or "subnets/16" that are needed
        hostname: [], // list of "hostnames" or "/regexps/" that are needed
        service: [], // list of "services" or "/regexps/" that should be running
        memory: 0, // amount of free memory needed. Calculated before allocation
        disk: 0, // amount of free disk space needed
      }
    }
  }
}

module.exports.check = function (message) {
  if (typeof message !== 'object') throw new Error('not a message')
  if (message.v !== version) throw new Error('bad version')
  if (typeof message.job !== 'object') throw new Error('not a job')
  if (typeof message.job.name !== 'string') throw new Error('invalid name')
  if (message.job.uid && typeof message.job.uid !== 'string') throw new Error('invalid uid')
  if (!Array.isArray(message.job.args)) throw new Error('invalid args')
  return true
}
