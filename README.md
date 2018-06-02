# 🌈 Armstrong

_A job framework for a wonderful world._

Adds rich job control, composition, and monitoring on top of a [Gearman] queue.

[Gearman]: http://gearman.org

### Provides

- [ ] Monitored background tasks
- [ ] Multi-consumer tasks
- [ ] Parallel task groups
- [ ] Serial task chaining
- [ ] Conditional task chaining
- [ ] Record-keeping (what ran when and where, for how long, how did it end)
- [ ] Automatic and manual retries
- [ ] Dynamic capacity and scaling
- [ ] Concurrency and exclusivity control
- [ ] Work allocation based on worker metadata
- [ ] Monitoring and control API, CLI tools, Web UI

## Try

1. Install and start Gearman
2. Run: `npx armstrong agent --volatile`
3. Open http://localhost:1967/

## Install

```
$ npx armstrong install
```

You'll need to enter some configuration details and your sudo password.

For a manual install and/or details on production deploys, see: [§ More](#more).

## Use

TODO

## More

TODO: in their own pages

- [Protocol documentation]
- [Production recommendations]
- [Manual install]
- [Using another backing queue]

### Install (manual)

1. Install armstrong globally: `npm i -g armstrong`
2. Add the Systemd service unit: `armstrong install --systemd-unit | sudo tee /etc/systemd/system/armstrong.service`
3. Create the configuration file: `armstrong install --config-file | sudo tee /etc/armstrong.toml`
4. Edit the configuration to suit
5. Create a new user and home: `sudo useradd --home-dir /var/lib/armstrong --create-home --user-group --system armstrong`
6. Start the service: `sudo systemctl start armstrong`
7. Enable the service: `sudo systemctl enable armstrong`
