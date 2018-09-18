/* @flow */
import type { Container } from 'sidelifter/interface'

export default async function({ dockerode: { container } }: Container) {
  await container.remove({ force: true })
}
