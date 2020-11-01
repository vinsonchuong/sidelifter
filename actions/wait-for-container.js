export default async function ({dockerode: {container}}) {
  await container.wait()
}
