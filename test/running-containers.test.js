/* @flow */
import test from 'ava'
import { startContainer, waitForContainer, removeContainer } from 'sidelifter'
import getStream from 'get-stream'

test('starting a script in a container', async t => {
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

test('starting an interactive prompt in a container', async t => {
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

test('starting a container that exposes a port', async t => {
  const container = await startContainer({
    image: 'mysql:5',
    env: {
      MYSQL_RANDOM_ROOT_PASSWORD: '1',
      MYSQL_DATABASE: 'database',
      MYSQL_USER: 'user',
      MYSQL_PASSWORD: 'password'
    }
  })

  t.true(Number.isInteger(container.ports.get(3306)))

  await removeContainer(container)
})
