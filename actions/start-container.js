/* @flow */
import type { Container } from 'sidelifter/interface'
import Docker from 'dockerode'
import { ReadableStream } from 'memory-streams'

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

  const pullOutputStream = await docker.pull(image)
  await new Promise(resolve => {
    docker.modem.followProgress(pullOutputStream, resolve)
  })

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
  const stdout = new ReadableStream()
  const stderr = new ReadableStream()

  container.modem.demuxStream(
    stdin,
    {
      write: data => {
        stdout.append(data)
      }
    },
    {
      write: data => {
        stderr.append(data)
      }
    }
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
