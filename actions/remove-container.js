export default async function ({dockerode: {container}}) {
  await container.remove({force: true})
}
