#!/usr/bin/env node
const yargs = require('yargs')
const pkg = require('./package.json')

const argv = yargs
  .command('$0', false, () => {}, (argv) => {
    console.log('check environment')
    console.log('if any argument or option, display help')
    console.log('elsif running from npm/npx context, run agent')
    console.log('otherwise, display help')
  })
  .command(['agent', 'a'], 'Run the agent', () => {}, (argv) => {
    console.log('retrieve config')
    console.log('connect to backends')
    console.log('start the agent')
    console.log('start the api')
    console.log('start the web ui')
  })
  .command(['install', 'i'], 'Install the agent globally', () => {}, (argv) => {
    console.log('check what\'s there')
    console.log('check backends')
    console.log('ask for config')
    console.log('check config')
    console.log('ask for confirm')

    console.log('obtain root')
    console.log('install systemd unit')
    console.log('install configuration')
    console.log('enable systemd unit')
    console.log('start systemd unit')
  })
  .command(['run', 'r'], 'Launch a job', () => {}, (argv) => {
    // takes an -i option for "interactive specifying of a job",
    // also aliased to the ri command.
    console.log('retrieve config')
    console.log('connect to agent')
    console.log('launch a job')
  })
  .command(['monitor', 'm'], 'Check on jobs and system status', () => {}, (argv) => {
    console.log('retrieve config')
    console.log('connect to agent')
    console.log('print out info')
  })
  .command(['wait', 'w'], 'Wait on a job or jobs', () => {}, (argv) => {
    console.log('retrieve config')
    console.log('connect to agent')
    console.log('check on job(s)')
    console.log('print info on job')
    console.log('block until they are finished')
    console.log('print progress as it comes through')
    console.log('print result and status once done')
  })
  .help()
  .argv
