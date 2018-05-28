const version = +require('../../package.json').version.split('.')[0]

module.exports = function job ({ name, uid = null, args = [] }) {
  return {
    v: version,
    job: { name, uid, args }
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
