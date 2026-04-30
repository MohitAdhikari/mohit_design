/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export default function StudioPage() {
  if (!config.projectId || config.projectId === 'demo1234' || config.projectId === '') {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#111', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ color: '#FF4444' }}>Sanity CMS Not Configured</h1>
        <p>Please log in to <a href="https://sanity.io" target="_blank" style={{ color: '#00ccff' }}>Sanity.io</a>, create a project, and add your Project ID and Dataset to the Environment Variables.</p>
        <p><code>NEXT_PUBLIC_SANITY_PROJECT_ID</code></p>
        <p><code>NEXT_PUBLIC_SANITY_DATASET=&apos;production&apos;</code></p>
      </div>
    )
  }

  return <NextStudio config={config} />
}
