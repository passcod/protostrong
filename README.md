# 🌈 Armstrong

_A job framework for a wonderful world._

Adds rich job control, composition, and monitoring on top of an ordinary queue.

### Provides

- [ ] Monitored background tasks
- [ ] Multi-consumer tasks
- [ ] Parallel task groups
- [ ] Serial task chaining
- [ ] Chaining different tasks based on return value
- [ ] Record-keeping
- [ ] Automatic and manual retries
- [ ] Capacity scaling
- [ ] Exclusivity control
- [ ] Work allocation based on worker metadata
- [ ] Monitoring and control API, CLI tools, Web UI

### Supports

- Queue: Gearman
- Storage: Redis
- Serialisation: JSON

But it is designed to be agnostic to those components.


## Try

1. Install and start Gearman and Redis
2. Run: `npx armstrong`
3. Open http://localhost:1967/

## Install (guided)

```
$ npx armstrong install
```

You'll need to enter your sudo password and some configuration details.

## Install (manual)

1. Install armstrong globally: `npm i -g armstrong`
2. Add the Systemd service unit: `armstrong install --systemd-unit | sudo tee /etc/systemd/system/armstrong.service`
3. Create the configuration file: `armstrong install --config-file | sudo tee /etc/armstrong.toml`
4. Edit the configuration to suit
5. Start the service: `sudo systemctl start armstrong`
5. Enable the service: `sudo systemctl enable armstrong`

## Use

TODO
