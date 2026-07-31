import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../sanity/env'

/**
 * Server-only Sanity client used for CMS writes (subscribers, contact messages).
 * Requires SANITY_API_WRITE_TOKEN to be set in the environment.
 */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

/**
 * Server-only Sanity client used for live draft previews.
 * Requires SANITY_API_READ_TOKEN with draft read access.
 */
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'previewDrafts',
})
