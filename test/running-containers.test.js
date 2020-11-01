import test from 'ava'
import path from 'path'
import {startContainer, waitForContainer, removeContainer} from '../index.js'
import getStream from 'get-stream'
import rm from 'rumor-mill'

test('starting a script in a container', async (t) => {
  const container = await startContainer({
    image: 'node:latest',
    env: {
      ONE: 'Ping',
      TWO: 'Pong'
    },
    cmd: [
      'node',
      '-e',
      'process.stdout.write(process.env.ONE); process.stderr.write(process.env.TWO)'
    ]
  })

  await waitForContainer(container)

  t.is(await getStream(container.stdout), 'Ping')
  t.is(await getStream(container.stderr), 'Pong')

  await removeContainer(container)
})

test('starting an interactive prompt in a container', async (t) => {
  const container = await startContainer({
    image: 'node:latest'
  })

  container.stdin.write('process.stdout.write("Stuff")\n')
  container.stdin.write('.exit\n')
  container.stdin.end()

  await waitForContainer(container)

  t.is(await getStream(container.stdout), 'Stuff')

  await removeContainer(container)
})

test('starting a container that exposes a port', async (t) => {
  const container = await startContainer({
    image: 'mysql:5',
    env: {
      MYSQL_RANDOM_ROOT_PASSWORD: '1',
      MYSQL_DATABASE: 'database',
      MYSQL_USER: 'user',
      MYSQL_PASSWORD: 'password'
    }
  })

  const port = container.ports.get(3306)
  await rm.openDatabase(
    `mysql://user:password@127.0.0.1:${String(port)}/database`
  )
  t.pass()

  await removeContainer(container)
})

test('mounting a directory in a container', async (t) => {
  const container = await startContainer({
    image: 'node:latest',
    mount: {
      [path.resolve()]: '/root/sidelifter'
    },
    cmd: ['ls', '/root/sidelifter']
  })

  await waitForContainer(container)

  const output = await getStream(container.stdout)
  t.true(output.includes('README.md'))
  t.true(output.includes('package.json'))

  await removeContainer(container)
})
