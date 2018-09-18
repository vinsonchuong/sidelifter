/* eslint-disable flowtype/no-weak-types */
/* @flow */
import type { Readable, Writable } from 'stream'
import type { Container as DockerodeContainer } from 'dockerode'

export type Container = {
  stdin: Writable,
  stdout: Readable,
  stderr: Readable,
  ports: Map<number, number>,
  dockerode: {
    container: DockerodeContainer,
    metadata: { [string]: any }
  }
}
