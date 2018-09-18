# sidelifter
[![Build Status](https://travis-ci.org/splayd/sidelifter.svg?branch=master)](https://travis-ci.org/splayd/sidelifter)

Utilities for working with Docker containers

## Example

```js
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
