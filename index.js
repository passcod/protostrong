#!/usr/bin/env node
const yargs = require('yargs')
const pkg = require('./package.json')
const { $trace, $info, $fatal } = require('./lib/logger')('main')

const argv = yargs
  .usage('Usage: $0 <command>')
  .command('agent', 'Run the agent', (yargs) => yargs
    .option('volatile', { description: 'Force in-memory store', type: 'boolean' })
    .help().alias('help', 'h').version(false)
  , async (argv) => {
    $trace(argv)

    $info('retrieve config')
    const config = await require('./lib/config')().catch((e) => {
      $fatal(e)
      process.exit(1)
    })

    $info('open store')
    const store = await require('./lib/store')(argv.volatile).catch((e) => {
      $fatal(e)
      process.exit(1)
    })

    $info('connect to gearman')
    $info('start the agent')
    // listen on armstrong::job
    // when a job comes in, place it and launch it. Synchronous. On its own
    // thread/promise. Monitor its handle for progress or activity or being
    // dropped and restarted and retried. When it returns, save the output.
    // Notify any watchers. Run the concurrency control logic built in here.

    // "place it"
    // Send N 'armstrong::node::id::placement#jobid' where N = number of nodes
    // These instruct nodes to start handlers for specified functions,
    // namespaced under the job id, according to constraints. Sender listens
    // for results and computes whether capacity placed is enough. If not, it
    // places again. If yes, it triggers the launch. After job is done or
    // placements on nodes have idled for too long, they're cleaned up.

    $info('start the api')
    $info('start the web ui')
    // the web UI not only monitors, but also provides history and graphs, and
    // most importantly allows a user to launch a job directly from the UI, or
    // to stop it, pause a workflow, resume, restart, retry, etc. It can even
    // wait on a job and ding! or notify (after asking permission) when done.
  })
  .command('install', 'Install the agent globally', (yargs) => yargs
    .help().alias('help', 'h').version(false)
  , (argv) => {
    $info('check what\'s there')
    $info('check backends')
    $info('ask for config')
    $info('check config')
    $info('ask for confirm')

    $info('obtain root')
    $info('install systemd unit')
    $info('install configuration')
    $info('enable systemd unit')
    $info('start systemd unit')
  })
  .command('monitor', 'Check on jobs and system status', (yargs) => yargs, async (argv) => {
    $info('retrieve config')
    const config = await require('./lib/config')().catch(console.error)

    $info('connect to agent')
    $info('print out info')
  })
  .command('run', 'Launch a job', (yargs) => yargs
    .option('interactive', { alias: 'i', type: 'boolean' })
    .option('function', { alias: 'f', type: 'string' })
    .option('unique', { alias: 'u', type: 'string' })
    .option('resume', { type: 'string' })
    .help().alias('help', 'h').version(false)
  , async (argv) => {
    $trace(argv)

    $info('retrieve config')
    const config = await require('./lib/config')().catch(console.error)

    $info('connect to agent')
    $info('launch a job')
    // wrap actual job details in metadata, then send it to armstrong::job
  })
  .command('stop', 'Stop a job', (yargs) => yargs
    // by default: tell handlers to stop after next, wait for job to stop gracefully, cleanup queue
    .option('pause') // send sigstop to handlers
    .option('kill') // kill handlers, cleanup queue
    .help().alias('help', 'h').version(false)
  , async (argv) => {
    $info('retrieve config')
    const config = await require('./lib/config')().catch(console.error)

    $info('connect to agent')
    $info('send a stop request')
  })
  .command('wait', 'Wait on a job or jobs', (yargs) => yargs, async (argv) => {
    $info('retrieve config')
    const config = await require('./lib/config')().catch(console.error)

    $info('connect to agent')
    $info('check on job(s)')
    $info('print info on job')
    $info('block until they are finished')
    $info('print progress as it comes through')
    $info('print result and status once done')

    // a sync job is really just a normal job immediately waited upon. There's
    // no concept of background job as a separate category. A job can be waited
    // upon by zero or more watchers. They'll all get the same data back.
  })
  .completion('completion', 'Generate bash completion script')
  .demandCommand(1, 'Error: you need to specify a command')
  .version(pkg.version).alias('version', 'v')
  .help().alias('help', 'h')
  .strict()
  .argv
