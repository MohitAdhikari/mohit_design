import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../sanity/env'

/**
 * Shared read-only Sanity client. Safe to import from both server and client
 * bundles because it does not use any server-only APIs.
 */
// Use CDN in browser builds but not at build time — static generation
// (generateStaticParams, get* queries during next build) must hit the
// live API so freshly published content is included in the deployed site
// instead of being served stale from the CDN.
const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

export const client = createClient({
  projectId: projectId || 'nlydr3l6',
  dataset: dataset || 'production',
  apiVersion: apiVersion || '2024-04-28',
  useCdn: process.env.NODE_ENV === 'production' && !isBuild,
})
