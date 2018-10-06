/* @flow */
import type { Container } from 'sidelifter/interface'
import { log } from 'sidelifter/lib'
import Docker from 'dockerode'
import { ReadableStreamBuffer } from 'stream-buffers'

export default async function({
  image,
  env = {},
  cmd
}: {
  image: string,
  env?: { [string]: string },
  cmd?: Array<string>
}): Promise<Container> {
  const docker = new Docker()

  log('Pulling %s from Docker Hub', image)
  const pullOutputStream = await docker.pull(image)
  await new Promise(resolve => {
    docker.modem.followProgress(pullOutputStream, resolve)
  })
  log('Finished pulling %s from Docker Hub', image)

  const container = await docker.createContainer({
    Image: image,
    Env: Object.keys(env).map(key => `${key}=${env[key]}`),
    PublishAllPorts: true,
    Tty: false,
    AttachStdin: true,
    OpenStdin: true,
    StdinOnce: true,
    Cmd: cmd
  })

  const stdin = await container.attach({
    stream: true,
    hijack: true,
    stdin: true,
    stdout: true,
    stderr: true
  })
  const stdout = new ReadableStreamBuffer()
  const stderr = new ReadableStreamBuffer()

  stdin.on('end', () => {
    stdout.stop()
    stderr.stop()
  })

  container.modem.demuxStream(
    stdin,
    { write: data => stdout.put(data) },
    { write: data => stderr.put(data) }
  )

  await container.start()

  const metadata = await container.inspect()

  const ports = new Map()
  for (const key of Object.keys(metadata.NetworkSettings.Ports)) {
    const containerPort = Number(key.match(/^(\d+)\//)[1])
    const localPort = Number(metadata.NetworkSettings.Ports[key][0].HostPort)
    ports.set(containerPort, localPort)
  }

  return {
    stdin,
    stdout,
    stderr,
    ports,
    dockerode: { container, metadata }
  }
}
