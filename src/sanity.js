import SanityClient from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = SanityClient({
  projectId: 'wizlm73k',
  dataset: 'production',
  apiVersion: '2021-11-20',
  useCdn: false,
})

const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}
