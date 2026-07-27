'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { SubmitForReviewAction } from './sanity/actions/submitForReview'

const WRITER_BLOCKED_ACTIONS = ['publish', 'unpublish', 'schedule', 'duplicate', 'delete']

export default defineConfig({
  basePath: '/studio',
  projectId: projectId || 'nlydr3l6',
  dataset: dataset || 'production',
  schema,
  document: {
    // Role-aware editorial workflow.
    // Writers cannot publish/unpublish/schedule/delete — they can only Submit for Review.
    // Admins/Editors keep full actions. Falls back to full actions when roles are unknown.
    actions: (prev, context) => {
      if (context.schemaType !== 'newsPost') return prev
      const roles = context.currentUser?.roles?.map((r) => r.name) || []
      const isPrivileged =
        roles.includes('administrator') || roles.includes('editor')
      const isWriter = roles.includes('writer') && !isPrivileged
      if (!isWriter) return prev
      const filtered = prev.filter(
        (action) => !WRITER_BLOCKED_ACTIONS.includes((action.action as string) ?? '')
      )
      return [...filtered, SubmitForReviewAction]
    },
  },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
