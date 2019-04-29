# sidelifter
![npm](https://img.shields.io/npm/v/sidelifter.svg)
[![Build Status](https://travis-ci.org/vinsonchuong/sidelifter.svg?branch=master)](https://travis-ci.org/vinsonchuong/sidelifter)
[![dependencies Status](https://david-dm.org/vinsonchuong/sidelifter/status.svg)](https://david-dm.org/vinsonchuong/sidelifter)
[![devDependencies Status](https://david-dm.org/vinsonchuong/sidelifter/dev-status.svg)](https://david-dm.org/vinsonchuong/sidelifter?type=dev)

Utilities for working with Docker containers

## Example

```js
import * as path from 'path'
import { startContainer, removeContainer } from 'sidelifter'
import { openDatabase } from 'rumor-mill'

async function run() {
  const container = await startContainer({
    image: 'mysql:5',
    env: {
      MYSQL_RANDOM_ROOT_PASSWORD: '1',
      MYSQL_DATABASE: 'database',
      MYSQL_USER: 'user',
      MYSQL_PASSWORD: 'password'
    },
    mount: {
      [path.resolve()]: '/root/app'
    }
  })

  const localPort = container.ports.get(3306)
  const db = await openDatabase(`mysql://user:password@127.0.0.1:${localPort}/database`)

  await removeContainer(container)
}

run()
```

## Usage
Install [sidelifter](https://yarnpkg.com/en/package/sidelifter)
by running:

```sh
yarn add sidelifter
```

### Actions

#### `startContainer(options)`
Pulls an image, creates a container, and starts the container.

Readable streams `container.stdout` and `container.stderr` are provided. A
writable stream `container.stdin` is also provided.

Mapped ports are provided as `container.ports` via Map from container port to
host port.

##### Parameters
* `options` (object)
  * `image` (string): The name and tag of a Docker image
  * `env` ({ [string]: string }): Environment variables to be set within the
    container
  * `mount` ({ [string]: string }): Directories to mount within the container
  * `cmd` (Array<string>): An optional command to run within the Docker container

##### Returns
* `container` ([Promise<Container>](interface/container.js))

#### `waitForContainer(container)`
Waits for the `Cmd` that the container is running to exit.

##### Parameters
* `container` ([Container](interface/container.js))

##### Returns
* `promise` (Promise<void>)

#### `removeContainer(container)`
Stops and destroys the container.

##### Parameters
* `container` ([Container](interface/container.js))

##### Returns
* `promise` (Promise<void>)

### Debugging
Debug logging can be enabled by setting the environment variable
`NODE_DEBUG=sidelifter`.

See the
[Node.js documentation](https://nodejs.org/api/util.html#util_util_debuglog_section)
for more information.
