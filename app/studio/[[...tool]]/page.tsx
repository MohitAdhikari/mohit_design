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
  return (
    <div className="flex flex-col" style={{ height: '100vh' }}>
      <div style={{ background: '#1a1a2e', color: '#a0aec0', fontSize: '12px', padding: '6px 16px', textAlign: 'center', flexShrink: 0 }}>
        Login error? First sign in at{' '}
        <a href="https://www.sanity.io/login" target="_blank" rel="noopener noreferrer" style={{ color: '#00E5FF', textDecoration: 'underline' }}>
          sanity.io/login
        </a>
        {' '}then return to this page.
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <NextStudio config={config} />
      </div>
    </div>
  )
}
