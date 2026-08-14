import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../sanity/env'

/**
 * Shared read-only Sanity client. Safe to import from both server and client
 * bundles because it does not use any server-only APIs.
 */
// CDN stays on in production: pages are now rendered per request
// (force-dynamic), so every page view queries Sanity. The CDN keeps that
// fast and protects the Sanity API quota. Trade-off is up to ~60s before
// freshly published content appears — acceptable, and far safer than
// static/ISR rendering which consumed Vercel ISR Write Units.
export const client = createClient({
  projectId: projectId || 'nlydr3l6',
  dataset: dataset || 'production',
  apiVersion: apiVersion || '2024-04-28',
  useCdn: process.env.NODE_ENV === 'production',
})
