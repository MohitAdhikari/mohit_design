import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../sanity/env'

/**
 * Shared read-only Sanity client. Safe to import from both server and client
 * bundles because it does not use any server-only APIs.
 */
export const client = createClient({
  projectId: projectId || 'nlydr3l6',
  dataset: dataset || 'production',
  apiVersion: apiVersion || '2024-04-28',
  useCdn: process.env.NODE_ENV === 'production',
})
